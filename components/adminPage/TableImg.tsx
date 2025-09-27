"use client"

import { useMemo, useRef, useState } from "react"
import { Camera, Images, Loader2, UploadCloud } from "lucide-react"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore"
import Image from "next/image"

import { db } from "@/lib/firebase"
import useImages, { type ImageCategory, type ImageCategoryFilter, type ImageDoc } from "@/hooks/useImages"

interface TableImgProps {
  onUpload?: (uploadedUrl: string) => void
  onSelect?: (url: string) => void
  initialCategory?: ImageCategoryFilter
  defaultUploadCategory?: ImageCategory
  showCategoryFilter?: boolean
}

type UploadTargetCategory = ImageCategory

const CATEGORY_LABELS: Record<ImageCategoryFilter, string> = {
  all: "Tất cả",
  product: "Sản phẩm",
  feedback: "Feedback",
}

export default function TableImg({
  onUpload,
  onSelect,
  initialCategory = "product",
  defaultUploadCategory = "product",
  showCategoryFilter = true,
}: TableImgProps) {
  const [activeCategory, setActiveCategory] = useState<ImageCategoryFilter>(initialCategory)
  const {
    images,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
  } = useImages(activeCategory)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
  const disabled = !cloudName || !uploadPreset

  const uploadCategory: UploadTargetCategory = useMemo(() => {
    if (activeCategory === "all") return defaultUploadCategory
    return activeCategory
  }, [activeCategory, defaultUploadCategory])

  const persistImage = async (url: string) => {
    await addDoc(collection(db, "images"), {
      url,
      category: uploadCategory,
      referenceId: null,
      createdAt: serverTimestamp(),
    })
  }

  const handleWidgetUpload = async () => {
    if (disabled) {
      setUploadMessage(
        "Thiếu cấu hình Cloudinary (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET).",
      )
      return
    }

    const myWidget = (window as any).cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: false,
      },
      async (error: unknown, result: any) => {
        if (!error && result && result.event === "success") {
          const uploadedUrl = result.info.secure_url as string
          try {
            await persistImage(uploadedUrl)
            onUpload?.(uploadedUrl)
            await refresh()
            setUploadMessage("Upload thành công")
          } catch (err) {
            console.error("Error saving to Firestore:", err)
            setUploadMessage("Lỗi khi lưu ảnh. Vui lòng thử lại.")
          }
        } else if (error) {
          console.error("Cloudinary widget error", error)
          setUploadMessage("Không thể upload ảnh. Vui lòng thử lại.")
        }
      },
    )

    myWidget.open()
  }

  const uploadFromFile = async (file: File) => {
    if (disabled) {
      setUploadMessage(
        "Thiếu cấu hình Cloudinary (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET).",
      )
      return
    }

    setUploading(true)
    setUploadMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", uploadPreset)

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error?.message || "Upload thất bại")
      }

      const uploadedUrl = data.secure_url as string
      await persistImage(uploadedUrl)
      onUpload?.(uploadedUrl)
      await refresh()
      setUploadMessage("Đã upload ảnh thành công")
    } catch (error) {
      console.error("Manual upload error", error)
      setUploadMessage("Không thể upload ảnh. Kiểm tra kết nối và thử lại.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      void uploadFromFile(file)
    }
  }

  const deleteImage = async (image: ImageDoc) => {
    try {
      await deleteDoc(doc(db, "images", image.id))
      if (image.category === "feedback" && image.referenceId) {
        await deleteDoc(doc(db, "feedbacks", image.referenceId)).catch(() => null)
      }
      await refresh()
    } catch (err) {
      console.error("Error deleting:", err)
      setUploadMessage("Không thể xóa ảnh. Vui lòng thử lại.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleWidgetUpload}
          disabled={disabled || uploading}
          className={`flex min-h-[44px] items-center gap-2 rounded-md px-4 py-2 text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 ${
            disabled
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          Upload bằng Cloudinary
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="flex min-h-[44px] items-center gap-2 rounded-md border border-purple-200 px-4 py-2 text-sm font-medium text-purple-600 transition hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải lên...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" /> Chụp/Chọn ảnh từ điện thoại
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {disabled && (
        <p className="text-xs text-gray-600">
          Vui lòng cấu hình Cloudinary để bật upload (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET).
        </p>
      )}

      {uploadMessage && (
        <div className="rounded-md border border-purple-100 bg-purple-50 px-4 py-2 text-sm text-purple-700">
          {uploadMessage}
        </div>
      )}

      {showCategoryFilter && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {(Object.keys(CATEGORY_LABELS) as ImageCategoryFilter[]).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-3 py-1.5 font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 ${
                activeCategory === category
                  ? "border-purple-500 bg-purple-600 text-white"
                  : "border-purple-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="inline-flex items-center gap-1">
                {category === "all" && <Images className="h-3.5 w-3.5" />}
                {CATEGORY_LABELS[category]}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {loading && images.length === 0 ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-xl bg-gray-200" />
          ))
        ) : images.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">
            {activeCategory === "feedback"
              ? "Chưa có ảnh feedback nào. Hãy upload ảnh mới."
              : "Chưa có ảnh nào. Hãy upload ảnh mới."}
          </div>
        ) : (
          images.map((img) => (
            <div
              key={img.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect?.(img.url)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  onSelect?.(img.url)
                }
              }}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white outline-none transition focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <div className="relative aspect-square">
                <Image src={img.url} alt="Uploaded" fill className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow">
                Chọn
              </span>

              <button
                type="button"
                onClick={async (event) => {
                  event.stopPropagation()
                  await deleteImage(img)
                }}
                className="absolute top-2 right-2 rounded-full bg-red-600/90 px-2 py-1 text-xs font-semibold text-white shadow hover:bg-red-600"
              >
                Xóa
              </button>

              <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-gray-700 shadow">
                {CATEGORY_LABELS[img.category]}
              </span>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-4 w-full rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingMore ? "Đang tải thêm..." : "Tải thêm ảnh"}
        </button>
      )}
    </div>
  )
}
