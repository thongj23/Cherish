import { NextRequest, NextResponse } from "next/server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, FieldValue } from "firebase-admin/firestore"
import { createHash } from "node:crypto"
import { z } from "zod"

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
    // Basic rate limit (best effort): 30 req/min per IP
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const g: any = globalThis as any
    if (!g.__order_rl) g.__order_rl = new Map<string, { c: number; t: number }>()
    const now = Date.now()
    const rec = g.__order_rl.get(ip) || { c: 0, t: now }
    if (now - rec.t > 60_000) { rec.c = 0; rec.t = now }
    rec.c += 1
    g.__order_rl.set(ip, rec)
    if (rec.c > 30) return NextResponse.json({ ok: false, message: 'Thử lại sau (rate limit)' }, { status: 429 })

    const payload = await req.json()
    const customer = payload?.customer || {}
    const items = Array.isArray(payload?.items) ? payload.items : []
    const pricing = payload?.pricing || {}
    const fulfillment = payload?.fulfillment || { method: "delivery", status: "pending" }
    const payment = payload?.payment || { method: "cod", status: "unpaid" }
    const meta = payload?.meta || { source: "web" }

    // Validate with zod
    const itemSchema = z.object({
      name: z.string().min(1),
      category: z.string().optional().default(""),
      subCategory: z.string().optional().default(""),
      imageUrl: z.string().url().optional().nullable(),
      size: z.number().optional().nullable(),
      quantity: z.number().int().positive(),
      price: z.number().nonnegative(),
    })
    const schema = z.object({
      customer: z.object({
        name: z.string().min(1),
        phone: z.string().min(6),
        email: z.string().email().optional().nullable(),
        address: z.string().optional().nullable(),
      }),
      items: z.array(itemSchema).min(1),
      pricing: z.object({
        subtotal: z.number().nonnegative().optional(),
        shippingFee: z.number().nonnegative().optional(),
        discount: z.number().nonnegative().optional(),
        total: z.number().nonnegative().optional(),
        currency: z.string().optional(),
      }).optional(),
      fulfillment: z.object({ method: z.string().optional(), status: z.string().optional() }).optional(),
      payment: z.object({ method: z.string().optional(), status: z.string().optional(), transactionId: z.string().optional() }).optional(),
      meta: z.any().optional(),
    })
    const parsed = schema.safeParse({ customer, items, pricing, fulfillment, payment, meta })
    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: 'Dữ liệu không hợp lệ' }, { status: 400 })
    }

    // Recalculate totals on server
    const subtotal = items.reduce((s: number, it: any) => s + (Number(it?.price) || 0) * (Number(it?.quantity) || 0), 0)
    const shippingFee = Number(pricing?.shippingFee) || 0
    const discount = Number(pricing?.discount) || 0
    const total = subtotal + shippingFee - discount

    // Optional QR checksum verification (if provided)
    let qrVerified: boolean | undefined = undefined
    const salt = process.env.QR_ORDER_SALT || ""
    const qr = (meta && (meta.qr || meta.qrMeta)) as any
    if (salt && qr?.checksum && qr?.canonical) {
      try {
        const calc = createHash('sha256').update(String(salt) + String(qr.canonical)).digest('hex')
        if (calc !== String(qr.checksum)) {
          return NextResponse.json({ ok: false, message: 'Invalid QR checksum' }, { status: 400 })
        }
        qrVerified = true
      } catch {}
    }

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
        qrVerified: qrVerified === true ? true : undefined,
        history: meta?.history || undefined,
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
