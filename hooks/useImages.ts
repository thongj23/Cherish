"use client"

import { useCallback, useEffect, useState } from "react"
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  type QueryDocumentSnapshot,
} from "firebase/firestore"

import { db } from "@/lib/firebase"

interface ImageDoc {
  id: string
  url: string
}

const PAGE_SIZE = 12

export interface UseImagesResult {
  images: ImageDoc[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  refresh: () => Promise<void>
  loadMore: () => Promise<void>
}

export default function useImages(): UseImagesResult {
  const [images, setImages] = useState<ImageDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)

  const fetchInitial = useCallback(async () => {
    setLoading(true)
    try {
      const q = query(collection(db, "images"), orderBy("createdAt", "desc"), limit(PAGE_SIZE))
      const snapshot = await getDocs(q)
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        url: (doc.data().url as string) || "",
      }))
      setImages(docs)
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null)
      setHasMore(snapshot.docs.length === PAGE_SIZE)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc) return
    setLoadingMore(true)
    try {
      const q = query(
        collection(db, "images"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE),
      )
      const snapshot = await getDocs(q)
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        url: (doc.data().url as string) || "",
      }))

      setImages((prev) => [...prev, ...docs])
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? lastDoc)
      setHasMore(snapshot.docs.length === PAGE_SIZE)
    } finally {
      setLoadingMore(false)
    }
  }, [hasMore, lastDoc, loadingMore])

  const refresh = useCallback(async () => {
    await fetchInitial()
  }, [fetchInitial])

  useEffect(() => {
    fetchInitial()
  }, [fetchInitial])

  return {
    images,
    loading,
    loadingMore,
    hasMore,
    refresh,
    loadMore,
  }
}
