import { NextRequest, NextResponse } from "next/server"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore, FieldValue } from "firebase-admin/firestore"

function parsePrivateKey(): string {
  const raw = process.env.FIREBASE_PRIVATE_KEY || ""
  const b64 = process.env.FIREBASE_PRIVATE_KEY_BASE64 || ""
  let key = raw.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "")
  if (key.includes("\\n")) key = key.replace(/\\n/g, "\n")
  if (!key && b64) {
    try { key = Buffer.from(b64, 'base64').toString('utf8').trim() } catch {}
  }
  if (!key.startsWith('-----BEGIN PRIVATE KEY-----') || !key.includes('-----END PRIVATE KEY-----')) throw new Error('Invalid PEM key format')
  return key
}

function getDb() {
  if (!getApps().length) {
    const privateKey = parsePrivateKey()
    initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey }) })
  }
  return getFirestore()
}

function tryParseJson(text: string): any | null {
  try { return JSON.parse(text) } catch { return null }
}
function extractEmail(s: string): string | null { const m = s.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i); return m ? m[0] : null }
function extractPhone(s: string): string | null { const m = s.replace(/\s+/g, "").match(/(\+?84|0)(\d{9,10})\b/); return m ? m[0] : null }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const raw = String(body?.raw || '')
    if (!raw.trim()) return NextResponse.json({ ok: false, message: 'Missing raw' }, { status: 400 })

    let name: string | null = null
    let phone: string | null = null
    let email: string | null = null
    let note: string | null = null

    const parsed = tryParseJson(raw)
    if (parsed && typeof parsed === 'object') {
      name = parsed.name ?? parsed?.customer?.name ?? null
      phone = parsed.phone ?? parsed?.customer?.phone ?? null
      email = parsed.email ?? parsed?.customer?.email ?? null
      note = parsed.note ?? null
    } else {
      email = extractEmail(raw)
      phone = extractPhone(raw)
      note = raw
    }

    const db = getDb()
    const doc = { raw, name, phone, email, note, created_at: FieldValue.serverTimestamp() }
    const ref = await db.collection('scans').add(doc as any)
    return NextResponse.json({ ok: true, id: ref.id })
  } catch (err: any) {
    console.error('/api/save-scan error', err)
    return NextResponse.json({ ok: false, message: err?.message || 'Server error' }, { status: 500 })
  }
}

