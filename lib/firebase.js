import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

console.log("FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
console.log("FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Firestore (🔥 thật)
export const db = getFirestore(app)

// ❌ Không dùng emulator nữa
// if (process.env.NODE_ENV === "development") {
//   console.log("Connecting to Firestore Emulator...")
//   connectFirestoreEmulator(db, "127.0.0.1", 8080)
// }

// Storage
export const storage = getStorage(app)

export default app
