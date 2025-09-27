"use client"

import { useCallback, useEffect, useState } from "react"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Feedback } from "@/types/feedback/feedback"

export default function useAdminFeedbacks() {
  const [items, setItems] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, "feedbacks"), orderBy("createdAt", "desc")))
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Feedback[]
      setItems(list)
    } catch (e) {
      console.error("Failed to fetch feedbacks", e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // only after admin login
    const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("isAdminLoggedIn") === "true"
    if (isLoggedIn) fetchAll()
  }, [fetchAll])

  const addFromUrl = async (url: string) => {
    const feedbackDoc = await addDoc(collection(db, "feedbacks"), {
      url,
      published: true,
      createdAt: serverTimestamp(),
    })

    await setDoc(
      doc(db, "images", `feedback-${feedbackDoc.id}`),
      {
        url,
        category: "feedback",
        referenceId: feedbackDoc.id,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    )

    await fetchAll()
  }

  const setPublished = async (id: string, published: boolean) => {
    await updateDoc(doc(db, "feedbacks", id), { published })
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, published } : it)))
  }

  const remove = async (id: string) => {
    await deleteDoc(doc(db, "feedbacks", id))
    await deleteDoc(doc(db, "images", `feedback-${id}`)).catch(() => null)
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  return { items, loading, fetchAll, addFromUrl, setPublished, remove }
}

