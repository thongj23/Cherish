import { NextRequest, NextResponse } from "next/server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, FieldValue } from "firebase-admin/firestore"

function parsePrivateKey(): string {
  const raw = process.env.FIREBASE_PRIVATE_KEY || ""
  const b64 = process.env.FIREBASE_PRIVATE_KEY_BASE64 || ""
  let key = raw.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "")
  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n")
  if (!key && b64) {
    try {
      key = Buffer.from(b64, "base64").toString("utf8").trim()
    } catch {}
  }
  if (!key.startsWith("-----BEGIN PRIVATE KEY-----") || !key.includes("-----END PRIVATE KEY-----")) {
    throw new Error("Invalid PEM key format")
  }
  return key
}

function getDb() {
  if (!getApps().length) {
    const privateKey = parsePrivateKey()
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    })
  }
  return getFirestore()
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const customer = payload?.customer || {}
    const items = Array.isArray(payload?.items) ? payload.items : []
    const pricing = payload?.pricing || {}
    const fulfillment = payload?.fulfillment || { method: "delivery", status: "pending" }
    const payment = payload?.payment || { method: "cod", status: "unpaid" }
    const meta = payload?.meta || { source: "web" }

    if (!customer?.name || !customer?.phone) {
      return NextResponse.json({ ok: false, message: "Thiếu tên hoặc số điện thoại" }, { status: 400 })
    }
    if (!items.length) {
      return NextResponse.json({ ok: false, message: "Đơn phải có ít nhất 1 sản phẩm" }, { status: 400 })
    }

    // Recalculate totals on server
    const subtotal = items.reduce((s: number, it: any) => s + (Number(it?.price) || 0) * (Number(it?.quantity) || 0), 0)
    const shippingFee = Number(pricing?.shippingFee) || 0
    const discount = Number(pricing?.discount) || 0
    const total = subtotal + shippingFee - discount

    const orderDoc = {
      customer: {
        name: String(customer.name),
        phone: String(customer.phone),
        email: customer.email ? String(customer.email) : null,
        address: customer.address ? String(customer.address) : null,
      },
      items: items.map((it: any) => ({
        name: String(it?.name || ""),
        category: String(it?.category || ""),
        subCategory: String(it?.subCategory || ""),
        imageUrl: it?.imageUrl || null,
        size: typeof it?.size === "number" ? it.size : null,
        quantity: Number(it?.quantity) || 1,
        price: Number(it?.price) || 0,
      })),
      pricing: { subtotal, shippingFee, discount, total, currency: "VND" },
      fulfillment: {
        method: fulfillment?.method || "delivery",
        status: fulfillment?.status || "pending",
      },
      payment: {
        method: payment?.method || "cod",
        status: payment?.status || "unpaid",
        transactionId: payment?.transactionId || null,
      },
      meta: {
        source: meta?.source || "web",
        scanId: meta?.scanId || null,
        voucherCode: meta?.voucherCode || null,
        note: meta?.note || null,
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    const db = getDb()
    const ref = await db.collection("orders").add(orderDoc)
    return NextResponse.json({ ok: true, id: ref.id })
  } catch (err: any) {
    console.error("/api/orders error", err)
    return NextResponse.json({ ok: false, message: err?.message || "Server error" }, { status: 500 })
  }
}

