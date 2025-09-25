"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import useAdminFeedbacks from "@/hooks/useAdminFeedbacks"

const TableImg = dynamic(() => import("@/components/adminPage/TableImg"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-dashed border-purple-200 p-6 text-center text-sm text-purple-600">
      Đang tải thư viện ảnh...
    </div>
  ),
})

export default function AdminFeedbackPage() {
  const { items, loading, addFromUrl, setPublished, remove } = useAdminFeedbacks()
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Quản lý Feedback</h1>
        <Button onClick={() => setOpen(true)}>Thêm feedback</Button>
      </div>

      <p className="text-sm text-gray-600">Ảnh chụp màn hình do quản trị upload và chọn hiển thị trên trang bio.</p>

      {loading ? (
        <div className="text-sm text-gray-500">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">Chưa có feedback nào</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((fb) => (
            <div key={fb.id} className="border rounded-lg overflow-hidden bg-white">
              <div className="relative w-full aspect-[3/4]">
                <Image src={fb.url || "/placeholder.svg"} alt="Feedback" fill className="object-cover" />
              </div>
              <div className="flex flex-col gap-3 p-3 border-t sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="font-medium">Hiện trên bio</span>
                  <Switch
                    checked={!!fb.published}
                    onCheckedChange={(value) => setPublished(fb.id, value)}
                  />
                </label>
                <Button variant="destructive" size="sm" onClick={() => remove(fb.id)}>
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chọn/Upload ảnh feedback</DialogTitle>
          </DialogHeader>
          <TableImg
            onUpload={async (url) => {
              await addFromUrl(url)
              setOpen(false)
            }}
            onSelect={async (url) => {
              await addFromUrl(url)
              setOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
