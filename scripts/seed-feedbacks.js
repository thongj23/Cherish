import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore"
import { readFile } from "node:fs/promises"

// A few sample portrait images suitable for 3:4 cards
const sampleFeedbacks = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=480&h=640&fit=crop",
  "https://images.unsplash.com/photo-1520975930498-6a9f6d5f14af?w=480&h=640&fit=crop",
  "https://images.unsplash.com/photo-1520975682037-6a9b6d5f14b0?w=480&h=640&fit=crop",
  "https://images.unsplash.com/photo-1520974654081-8df6d5f14abc?w=480&h=640&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=480&h=640&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=480&h=640&fit=crop",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=480&h=640&fit=crop",
  "https://images.unsplash.com/photo-1548946526-f69e2424cf45?w=480&h=640&fit=crop",
]

let db

async function ensureEnv() {
  // Attempt to load ../.env manually so the client SDK config exists in Node
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return
  try {
    const raw = await readFile(new URL("../.env", import.meta.url))
    const text = raw.toString("utf8")
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m) {
        const [, k, v] = m
        if (!process.env[k]) process.env[k] = v
      }
    }
  } catch {}
}

async function getDb() {
  if (!db) {
    await ensureEnv()
    ;({ db } = await import("../lib/firebase.js"))
  }
  return db
}

async function clearFeedbacks() {
  const dbi = await getDb()
  const col = collection(dbi, "feedbacks")
  const snap = await getDocs(col)
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
}

async function seedFeedbacks() {
  try {
    console.log("Seeding feedbacks…")
    await clearFeedbacks()

    const dbi = await getDb()
    const col = collection(dbi, "feedbacks")
    const now = Date.now()
    let i = 0
    for (const url of sampleFeedbacks) {
      await addDoc(col, {
        url,
        published: true,
        createdAt: new Date(now - i * 60_000), // stagger by minute
      })
      i += 1
    }
    console.log(`Done. Inserted ${sampleFeedbacks.length} feedback(s).`)
  } catch (e) {
    console.error("Seed feedbacks failed", e)
    process.exitCode = 1
  }
}

seedFeedbacks()
