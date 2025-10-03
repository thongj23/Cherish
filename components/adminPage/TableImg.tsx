"use client"

import { UploadCloud } from "lucide-react"
import { addDoc, collection, serverTimestamp, deleteDoc, doc } from "firebase/firestore"
import { db, storage } from "@/lib/firebase"
import useImages from "@/hooks/useImages"
import Image from "next/image"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useRef, useState } from "react"

interface TableImgProps {
  onUpload?: (uploadedUrl: string) => void
  onSelect?: (url: string) => void
}

export default function TableImg({ onUpload, onSelect }: TableImgProps) {
  const images = useImages()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

  const pickFile = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split(".").pop() || "jpg"
      const key = `images/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const objectRef = ref(storage, key)
      await uploadBytes(objectRef, file, { contentType: file.type })
      const url = await getDownloadURL(objectRef)

      await addDoc(collection(db, "images"), {
        url,
        createdAt: serverTimestamp(),
      })

      onUpload?.(url)
    } catch (err) {
      console.error("Upload failed:", err)
      alert("Upload thất bại. Vui lòng thử lại.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const deleteImage = async (id: string) => {
    try {
      await deleteDoc(doc(db, "images", id))
      location.reload() // đơn giản: reload để refetch; có thể tối ưu bằng state
    } catch (err) {
      console.error("Error deleting:", err)
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={pickFile}
        disabled={uploading}
        className={`flex items-center px-4 py-2 rounded-md transition text-white ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        <UploadCloud className="w-4 h-4 mr-2" />
        {uploading ? "Đang tải lên..." : "Upload ảnh mới"}
      </button>

      <div className="grid grid-cols-3 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative group cursor-pointer border rounded overflow-hidden hover:shadow"
          >
            <Image
              src={img.url}
              alt="Uploaded"
              width={150}
              height={150}
              className="w-full h-full object-cover"
              onClick={() => onSelect?.(img.url)}
            />

            <button
              onClick={async (e) => {
                e.stopPropagation()
                await deleteImage(img.id)
              }}
              className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-80 group-hover:opacity-100"
            >
              Xoá
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
