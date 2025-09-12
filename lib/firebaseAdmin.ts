import { initializeApp, cert, getApps, type App } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

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

export function getAdminApp(): App {
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
  return getApps()[0]!
}

export function getAdminDb() {
  getAdminApp()
  return getFirestore()
}

