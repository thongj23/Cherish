"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc,
  setDoc,
} from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { db } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Feedback = {
  id: string
  url: string
  caption?: string | null
  active?: boolean
  createdAt?: any
}

export default function FeedbackAdmin() {
  const [items, setItems] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const qRef = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"))
      const snap = await getDocs(qRef)
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Feedback[]
      setItems(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const canSubmit = useMemo(() => url.trim().length > 5, [url])

  const add = async () => {
    if (!canSubmit) return
    setSaving(true)
    try {
      const refDoc = await addDoc(collection(db, "feedbacks"), {
        url: url.trim(),
        caption: caption.trim() || null,
        active: true,
        createdAt: serverTimestamp(),
      })

      await setDoc(
        doc(db, "images", `feedback-${refDoc.id}`),
        {
          url: url.trim(),
          category: "feedback",
          referenceId: refDoc.id,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      )

      setUrl("")
      setCaption("")
      await load()
    } finally {
      setSaving(false)
    }
  }

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const key = `feedbacks/${Date.now()}-${file.name}`
      const r = ref(storage, key)
      await uploadBytes(r, file)
      const link = await getDownloadURL(r)
      setUrl(link)
    } finally {
      setUploading(false)
    }
  }

  const toggleActive = async (id: string, current?: boolean) => {
    await updateDoc(doc(db, "feedbacks", id), { active: !current })
    await load()
  }

  const remove = async (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm("Xoá feedback này?")) return
    await deleteDoc(doc(db, "feedbacks", id))
    await deleteDoc(doc(db, "images", `feedback-${id}`)).catch(() => null)
    await load()
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Feedback khách hàng</h2>
      <div className="bg-white border rounded-lg p-3 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="flex gap-2">
            <Input type="file" accept="image/*" onChange={onPickFile} />
          </div>
          <Input placeholder="Hoặc dán link ảnh (https://...)" value={url} onChange={(e) => setUrl(e.target.value)} />
          <Textarea placeholder="Ghi chú (tuỳ chọn)" value={caption} onChange={(e) => setCaption(e.target.value)} className="md:col-span-1 md:col-start-3" />
        </div>
        <div className="flex justify-end">
          <Button onClick={add} disabled={!canSubmit || saving || uploading}>{(saving || uploading) ? "Đang lưu..." : "Thêm feedback"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {loading && items.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
          ))
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-600">Chưa có feedback nào</div>
        ) : (
          items.map((f) => (
            <div key={f.id} className="border rounded-lg overflow-hidden bg-white">
              <div className="relative w-full pb-[100%]">
                <Image src={f.url || "/placeholder.svg"} alt={f.caption || "feedback"} fill className="object-cover" />
              </div>
              {f.caption && <div className="px-2 py-1 text-xs text-gray-700 line-clamp-2">{f.caption}</div>}
              <div className="flex items-center justify-between p-2 border-t">
                <span className={cn("text-xs", f.active ? "text-green-600" : "text-gray-500")}>{f.active ? 'Hiển thị' : 'Ẩn'}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleActive(f.id, f.active)}>Ẩn/Hiện</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(f.id)}>Xoá</Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
