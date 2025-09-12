"use client"

import { useState } from "react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import Link from "next/link"

type OrderDoc = any

function normalizePhones(input: string): string[] {
  const raw = (input || "").replace(/\s+/g, "").trim()
  if (!raw) return []
  const variants = new Set<string>()
  variants.add(raw)
  // 0xxxxxxxxx → +84xxxxxxxxx
  if (raw.startsWith("0")) variants.add("+84" + raw.slice(1))
  // +84xxxxxxxxx → 0xxxxxxxxx
  if (raw.startsWith("+84")) variants.add("0" + raw.slice(3))
  return Array.from(variants)
}

export default function OrdersLookupPage() {
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const fetchOrders = async () => {
    const candidates = normalizePhones(phone)
    if (candidates.length === 0) {
      setMessage("Nhập số điện thoại để tra cứu")
      return
    }
    setLoading(true)
    setMessage(null)
    setOrders([])
    try {
      // Firestore allows "in" with up to 10 values
      const batchedPhones = [candidates.slice(0, 10)]
      const all: OrderDoc[] = []
      for (const phones of batchedPhones) {
        const qRef = query(
          collection(db, "orders"),
          where("customer.phone", "in", phones as any)
        )
        const snap = await getDocs(qRef)
        snap.forEach((d) => all.push({ id: d.id, ...(d.data() as any) }))
      }
      // Sort newest first by createdAt if present
      all.sort((a, b) => {
        const ta = (a.createdAt?.toMillis?.() || 0) as number
        const tb = (b.createdAt?.toMillis?.() || 0) as number
        return tb - ta
      })
      setOrders(all)
      if (all.length === 0) setMessage("Chưa tìm thấy đơn hàng nào")
    } catch (err) {
      console.error(err)
      setMessage("Không thể tra cứu. Thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-3 text-center">Tra cứu đơn hàng</h1>
      <p className="text-center text-sm text-gray-600 mb-4">Nhập số điện thoại đã dùng để đặt hàng</p>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Số điện thoại (0… hoặc +84…)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="flex-1"
        />
        <Button onClick={fetchOrders} disabled={loading}>
          <Search className="w-4 h-4 mr-1" /> {loading ? "Đang tìm…" : "Tra cứu"}
        </Button>
      </div>

      {message && (
        <div className="text-center text-gray-700 text-sm bg-white/80 border rounded-xl py-6">{message}</div>
      )}

      {!message && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="block">
              <Card className="p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-500">Mã đơn</div>
                    <div className="font-semibold underline decoration-dotted underline-offset-2">{o.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Tổng</div>
                    <div className="font-semibold text-purple-700">
                      {o?.pricing?.total ? Number(o.pricing.total).toLocaleString("vi-VN") + "đ" : "-"}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <div className="text-gray-600 truncate">
                    {o?.items?.[0]?.name}
                    {o?.items?.length > 1 ? ` +${o.items.length - 1} sp` : ""}
                  </div>
                  <div>
                    <Badge variant="secondary">
                      {o?.fulfillment?.status === "completed"
                        ? "Hoàn tất"
                        : o?.fulfillment?.status === "shipped"
                        ? "Đã gửi"
                        : o?.fulfillment?.status === "packed"
                        ? "Đang đóng"
                        : o?.fulfillment?.status === "confirmed"
                        ? "Đã xác nhận"
                        : o?.fulfillment?.status === "canceled"
                        ? "Đã hủy"
                        : "Đang xử lý"}
                    </Badge>
                  </div>
                </div>

                {o?.customer?.address && (
                  <div className="mt-2 text-xs text-gray-500 truncate">Giao: {o.customer.address}</div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
