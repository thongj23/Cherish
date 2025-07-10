"use client"

import { UploadCloud } from "lucide-react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import useImages from "@/hooks/useImages"
import Image from "next/image"
import { deleteDoc, doc } from "firebase/firestore"
interface TableImgProps {
  onUpload?: (uploadedUrl: string) => void
  onSelect?: (url: string) => void
}

export default function TableImg({ onUpload, onSelect }: TableImgProps) {
  const images = useImages()

  const handleUpload = async () => {
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!


    const myWidget = (window as any).cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: false,
      },
      async (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          const uploadedUrl = result.info.secure_url
          console.log("Uploaded:", uploadedUrl)

          try {
            await addDoc(collection(db, "images"), {
              url: uploadedUrl,
              createdAt: serverTimestamp(),
            })

          } catch (err) {
            console.error("Error saving to Firestore:", err)
          }

          onUpload?.(uploadedUrl)
        }
      }
    )

    myWidget.open()
  }
const deleteImage = async (id: string) => {
  try {
    await deleteDoc(doc(db, "images", id))

    // Cập nhật local images:
    location.reload() // Hoặc: refetch hook nếu muốn đẹp hơn
  } catch (err) {
    console.error("Error deleting:", err)
  }
}
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleUpload}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        <UploadCloud className="w-4 h-4 mr-2" />
        Upload ảnh mới
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
        e.stopPropagation()  // 🔑 để không select khi xoá
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
