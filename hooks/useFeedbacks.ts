"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query, where, limit } from "firebase/firestore"
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
      } catch (err: any) {
        // Fallback: if index is missing, fetch recent docs and filter client-side
        const msg = String(err?.message || "")
        if (/requires an index/i.test(msg)) {
          try {
            const fallback = query(base, orderBy("createdAt", "desc"), limit(50))
            const snap = await getDocs(fallback)
            let list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Feedback[]
            if (publishedOnly) list = list.filter((it: any) => !!it.published)
            if (mounted) setItems(list)
          } catch (e) {
            console.error("Fallback feedbacks fetch failed", e)
            if (mounted) setItems([])
          }
        } else {
          console.error("Failed to load feedbacks", err)
          if (mounted) setItems([])
        }
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
