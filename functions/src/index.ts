import { onRequest } from "firebase-functions/v2/https"
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
    note = parsed.note ?? null
  } else {
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


