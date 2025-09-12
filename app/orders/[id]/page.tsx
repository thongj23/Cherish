"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

type OrderDoc = any

function statusLabel(s?: string) {
  switch (s) {
    case "completed":
      return "Hoàn tất"
    case "shipped":
      return "Đã gửi"
    case "packed":
      return "Đang đóng"
    case "confirmed":
      return "Đã xác nhận"
    case "canceled":
      return "Đã hủy"
    default:
      return "Đang xử lý"
  }
}

export default function OrderPublicDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<OrderDoc | null>(null)
  const [loading, setLoading] = useState(true)

  const id = params.id

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const snap = await getDoc(doc(db, "orders", id))
      if (snap.exists()) setOrder({ id: snap.id, ...(snap.data() as any) })
      else setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const subtotal = useMemo(() => {
    return (order?.items || []).reduce(
      (s: number, it: any) => s + (Number(it?.price) || 0) * (Number(it?.quantity) || 0),
      0
    )
  }, [order])

  if (loading) return <div className="p-4">Đang tải…</div>
  if (!order) return <div className="p-4">Không tìm thấy đơn hàng.</div>

  return (
    <div className="space-y-4 p-4 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-gray-500">Mã đơn</div>
          <div className="font-mono text-sm">{order.id}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Trạng thái</div>
          <Badge variant="secondary">{statusLabel(order?.fulfillment?.status)}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="font-medium mb-2">Khách hàng</div>
          <div className="text-sm"><span className="text-gray-500">Tên:</span> {order.customer?.name || "-"}</div>
          <div className="text-sm"><span className="text-gray-500">SĐT:</span> {order.customer?.phone || "-"}</div>
          {order.customer?.address && (
            <div className="text-sm"><span className="text-gray-500">Địa chỉ:</span> {order.customer.address}</div>
          )}
        </Card>

        <Card className="p-3">
          <div className="font-medium mb-2">Tổng tiền</div>
          <div className="flex items-center justify-between text-sm">
            <span>Tạm tính</span>
            <strong>{subtotal.toLocaleString("vi-VN")}đ</strong>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Phí giao</span>
            <strong>{Number(order?.pricing?.shippingFee || 0).toLocaleString("vi-VN")}đ</strong>
          </div>
          <div className="flex items-center justify-between text-base mt-2">
            <span className="font-medium">Tổng</span>
            <strong className="text-purple-700">{Number(order?.pricing?.total || 0).toLocaleString("vi-VN")}đ</strong>
          </div>
        </Card>

        <Card className="p-3">
          <div className="font-medium mb-2">Thời gian</div>
          <div className="text-xs text-gray-600">Tạo: {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : "-"}</div>
          <div className="text-xs text-gray-600">Cập nhật: {order.updatedAt?.toDate ? order.updatedAt.toDate().toLocaleString() : "-"}</div>
        </Card>
      </div>

      <Card className="p-3">
        <div className="font-medium mb-2">Sản phẩm ({order.items?.length || 0})</div>
        <div className="space-y-2">
          {(order.items || []).map((it: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 border rounded-md p-2">
              <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white ring-1 ring-gray-200 flex-shrink-0">
                <Image src={it.imageUrl || "/placeholder.svg"} alt={it.name || ""} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{it.name}</div>
                <div className="text-xs text-gray-600 truncate">{it.category}{it.subCategory ? ` • ${it.subCategory}` : ""}</div>
              </div>
              <div className="text-sm whitespace-nowrap">{it.size ? `Size ${it.size}` : ""}</div>
              <div className="text-sm whitespace-nowrap">x{it.quantity}</div>
              <div className="text-sm font-semibold whitespace-nowrap">{Number((it.price || 0) * (it.quantity || 0)).toLocaleString("vi-VN")}đ</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
      </div>
    </div>
  )
}
