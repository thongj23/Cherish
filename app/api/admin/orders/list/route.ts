import { NextRequest, NextResponse } from "next/server"
import { FieldPath, Timestamp } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebaseAdmin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function parseBool(v: string | null | undefined, d = false) {
  if (v == null) return d
  return v === "1" || v.toLowerCase() === "true"
}

function parseDateMs(v: string | null | undefined): number | null {
  if (!v) return null
  const n = Number(v)
  if (!Number.isNaN(n) && n > 0) return n
  const d = new Date(v)
  const ms = d.getTime()
  return Number.isNaN(ms) ? null : ms
}

function encodeCursor(ms: number, id: string) {
  return Buffer.from(JSON.stringify({ ms, id }), "utf8").toString("base64")
}

function decodeCursor(cur: string | null | undefined): { ms: number; id: string } | null {
  if (!cur) return null
  try {
    const obj = JSON.parse(Buffer.from(cur, "base64").toString("utf8"))
    if (typeof obj?.ms === "number" && typeof obj?.id === "string") return obj
    return null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb()

    const { searchParams } = new URL(req.url)
    const status = (searchParams.get("status") || "all").toLowerCase()
    const archived = parseBool(searchParams.get("archived"), false)
    const startMs = parseDateMs(searchParams.get("start"))
    const endMs = parseDateMs(searchParams.get("end"))
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 50), 1), 100)
    const cur = decodeCursor(searchParams.get("cursor"))

    let q = db.collection("orders") as FirebaseFirestore.Query
    if (!archived) q = q.where("archived", "==", false)
    if (status && status !== "all") q = q.where("fulfillment.status", "==", status)
    if (startMs != null) q = q.where("createdAt", ">=", Timestamp.fromMillis(startMs))
    if (endMs != null) q = q.where("createdAt", "<=", Timestamp.fromMillis(endMs))

    q = q.orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc")
    if (cur) q = q.startAfter(Timestamp.fromMillis(cur.ms), cur.id)

    const snap = await q.limit(limit).get()
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
    const last = snap.docs[snap.docs.length - 1]
    const lastTs = last?.get("createdAt") as Timestamp | undefined
    const nextCursor = last && lastTs ? encodeCursor(lastTs.toMillis(), last.id) : null

    return NextResponse.json({ ok: true, items, nextCursor })
  } catch (err: any) {
    console.error("/api/admin/orders/list error", err)
    return NextResponse.json({ ok: false, message: err?.message || "Server error" }, { status: 500 })
  }
}

