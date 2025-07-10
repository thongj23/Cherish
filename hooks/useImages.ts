"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
interface ImageDoc {
  id: string
  url: string
}
export default function useImages() {
  const [images, setImages] = useState<ImageDoc[]>([])

  useEffect(() => {
    const fetchImages = async () => {
      const q = query(collection(db, "images"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      const imageDocs = snapshot.docs.map((doc) => ({
        id: doc.id,
        url: doc.data().url as string,
      }))
      setImages(imageDocs)
    }

    fetchImages()
  }, [])

  return images
}
