import { onRequest } from "firebase-functions/v2/https"
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore"
import { setGlobalOptions } from "firebase-functions/v2/options"
import admin from "firebase-admin"

// Initialize Admin SDK once
if (!admin.apps.length) {
  admin.initializeApp()
}
const db = admin.firestore()

// Set your preferred region
setGlobalOptions({ region: "asia-southeast1" })

type ScanDoc = {
  raw: string
  name: string | null
  phone: string | null
  email: string | null
  note: string | null
  created_at: FirebaseFirestore.FieldValue
}

function tryParseJson(text: string): any | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function extractEmail(s: string): string | null {
  const m = s.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return m ? m[0] : null
}

function extractPhone(s: string): string | null {
  const m = s.replace(/\s+/g, "").match(/(\+?84|0)(\d{9,10})\b/)
  return m ? m[0] : null
}

export const saveScan = onRequest(async (req, res) => {
  // Basic CORS
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  if (req.method === "OPTIONS") {
    res.status(204).send("")
    return
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" })
    return
  }

  const raw = (req.body?.raw ?? "").toString()
  if (!raw.trim()) {
    res.status(400).json({ message: "Missing 'raw'" })
    return
  }

  let name: string | null = null
  let phone: string | null = null
  let email: string | null = null
  let note: string | null = null

  const parsed = tryParseJson(raw)
  if (parsed && typeof parsed === "object") {
    name = parsed.name ?? null
    phone = parsed.phone ?? null
    email = parsed.email ?? null
    // If there is extra info, keep original raw as note as well
    note = parsed.note ?? null
  } else {
    // Raw text: try to pick email/phone, store all as note
    email = extractEmail(raw)
    phone = extractPhone(raw)
    note = raw
  }

  const doc: ScanDoc = {
    raw,
    name,
    phone,
    email,
    note,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  }

  const ref = await db.collection("scans").add(doc)
  res.status(200).json({ ok: true, id: ref.id })
})

function dayKeyFromMillis(ms: number) {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return { key: `${yyyy}-${mm}-${dd}`, ms: d.getTime() }
}

// Aggregate basic stats per day: totals, funnel, top customers/products (rough)
export const aggregateOrderCreated = onDocumentCreated("orders/{id}", async (event) => {
  const after = event.data?.data() as any
  if (!after) return
  const created = after?.createdAt?.toMillis?.() || Date.now()
  const { key, ms } = dayKeyFromMillis(created)
  const ref = db.collection("stats").doc("daily").collection("days").doc(key)
  const batch = db.batch()

  const inc = admin.firestore.FieldValue.increment(1)
  const incTotal = admin.firestore.FieldValue.increment(Number(after?.pricing?.total || 0))

  const statusKey = String(after?.fulfillment?.status || "pending")
  const funnel: any = {}
  funnel[statusKey] = inc
  batch.set(
    ref,
    {
      dateKey: key,
      dateMs: ms,
      totals: { count: inc, amount: incTotal },
      funnel,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  )

  // Top products by name
  const items = Array.isArray(after?.items) ? after.items : []
  const prodUpdates: Record<string, number> = {}
  for (const it of items) {
    const key = String(it?.name || "") || "(no-name)"
    const qty = Number(it?.quantity || 1)
    prodUpdates[key] = (prodUpdates[key] || 0) + qty
  }
  if (Object.keys(prodUpdates).length) {
    const topRef = ref.collection("agg").doc("topProducts")
    const data: any = { updatedAt: admin.firestore.FieldValue.serverTimestamp() }
    for (const [k, v] of Object.entries(prodUpdates)) data[`counts.${k}`] = admin.firestore.FieldValue.increment(v)
    batch.set(topRef, data, { merge: true })
  }

  // Top customers by phone (fallback name)
  const custKey = String(after?.customer?.phone || after?.customer?.name || "(n/a)")
  if (custKey) {
    const topRef = ref.collection("agg").doc("topCustomers")
    batch.set(
      topRef,
      {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        [`counts.${custKey}.orders`]: inc,
        [`counts.${custKey}.amount`]: incTotal,
      },
      { merge: true }
    )
  }

  await batch.commit()
})

export const aggregateOrderUpdated = onDocumentUpdated("orders/{id}", async (event) => {
  const before = event.data?.before?.data() as any
  const after = event.data?.after?.data() as any
  if (!before || !after) return
  const created = after?.createdAt?.toMillis?.() || Date.now()
  const { key } = dayKeyFromMillis(created)
  const ref = db.collection("stats").doc("daily").collection("days").doc(key)

  const prevSt = before?.fulfillment?.status || "pending"
  const nextSt = after?.fulfillment?.status || "pending"
  if (prevSt === nextSt) return

  const batch = db.batch()
  const dec = admin.firestore.FieldValue.increment(-1)
  const inc = admin.firestore.FieldValue.increment(1)
  const funnelUpd: any = {}
  funnelUpd[prevSt] = dec
  funnelUpd[nextSt] = inc
  batch.set(ref, { funnel: funnelUpd, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })

  await batch.commit()
})
