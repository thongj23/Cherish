"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Feedback } from "@/types/feedback/feedback"

export default function useFeedbacks(publishedOnly = true) {
  const [items, setItems] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const base = collection(db, "feedbacks")
        const q = publishedOnly
          ? query(base, where("published", "==", true), orderBy("createdAt", "desc"))
          : query(base, orderBy("createdAt", "desc"))
        const snap = await getDocs(q)
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Feedback[]
        if (mounted) setItems(list)
      } catch (err) {
        console.error("Failed to load feedbacks", err)
        if (mounted) setItems([])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [publishedOnly])

  return { items, loading }
}

