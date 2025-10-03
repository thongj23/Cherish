"use client"

import { useCallback, useEffect, useState } from "react"
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore"

import { db } from "@/lib/firebase"

export type ImageCategory = "product" | "feedback"
export type ImageCategoryFilter = ImageCategory | "all"

export interface ImageDoc {
  id: string
  url: string
  category: ImageCategory
  referenceId?: string | null
}

const DEFAULT_PAGE_SIZE = 12

export interface UseImagesOptions {
  pageSize?: number
}

export interface UseImagesResult {
  images: ImageDoc[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  refresh: () => Promise<void>
  loadMore: () => Promise<void>
}

const normalizeCategory = (value: unknown): ImageCategory => {
  return value === "feedback" ? "feedback" : "product"
}

const buildQuery = (
  category: ImageCategoryFilter,
  pageSize: number,
  cursor?: QueryDocumentSnapshot<DocumentData> | null,
) => {
  const base = collection(db, "images")
  const constraints = [] as Array<any>

  if (category !== "all") {
    constraints.push(where("category", "==", category))
  }

  constraints.push(orderBy("createdAt", "desc"))
  if (cursor) {
    constraints.push(startAfter(cursor))
  }
  constraints.push(limit(pageSize))

  return query(base, ...constraints)
}

export default function useImages(
  category: ImageCategoryFilter = "all",
  options: UseImagesOptions = {},
): UseImagesResult {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  const [images, setImages] = useState<ImageDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)

  const fetchInitial = useCallback(async () => {
    setLoading(true)
    try {
      const snapshot = await getDocs(buildQuery(category, pageSize))
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          url: (data.url as string) || "",
          category: normalizeCategory(data.category),
          referenceId: data.referenceId as string | undefined,
        }
      })

      setImages(docs)
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null)
      setHasMore(snapshot.docs.length === pageSize)
    } finally {
      setLoading(false)
    }
  }, [category, pageSize])

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc) return
    setLoadingMore(true)
    try {
      const snapshot = await getDocs(buildQuery(category, pageSize, lastDoc))
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          url: (data.url as string) || "",
          category: normalizeCategory(data.category),
          referenceId: data.referenceId as string | undefined,
        }
      })

      setImages((prev) => [...prev, ...docs])
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? lastDoc)
      setHasMore(snapshot.docs.length === pageSize)
    } finally {
      setLoadingMore(false)
    }
  }, [category, pageSize, hasMore, loadingMore, lastDoc])

  const refresh = useCallback(async () => {
    await fetchInitial()
  }, [fetchInitial])

  useEffect(() => {
    setImages([])
    setLastDoc(null)
    setHasMore(true)
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
