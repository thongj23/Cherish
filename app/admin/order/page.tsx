"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, doc, getDocs, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

type AdminOrder = {
  id: string
  customer?: { name?: string; phone?: string; email?: string | null }
  items?: Array<{ name?: string; quantity?: number }>
  pricing?: { total?: number }
  fulfillment?: { status?: string }
  createdAt?: any
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Đang xử lý" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "packed", label: "Đang đóng" },
  { value: "shipped", label: "Đã gửi" },
  { value: "completed", label: "Hoàn tất" },
  { value: "canceled", label: "Đã hủy" },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, "orders"))
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as AdminOrder[]
      setOrders(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return orders.filter((o) => {
      const name = (o.customer?.name || "").toLowerCase()
      const phone = (o.customer?.phone || "").toLowerCase()
      const id = (o.id || "").toLowerCase()
      const matchText = !q || name.includes(q) || phone.includes(q) || id.includes(q)
      const st = (o.fulfillment?.status || "").toLowerCase() || "pending"
      const matchStatus = status === "all" || st === status
      return matchText && matchStatus
    })
  }, [orders, search, status])

  const updateStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "orders", id), {
      "fulfillment.status": newStatus,
      updatedAt: serverTimestamp(),
    })
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, fulfillment: { ...(o.fulfillment || {}), status: newStatus } } : o)))
  }

  const renderStatusBadge = (s?: string) => {
    switch (s) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Hoàn tất</Badge>
      case "shipped":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Đã gửi</Badge>
      case "packed":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Đang đóng</Badge>
      case "confirmed":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Đã xác nhận</Badge>
      case "canceled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Đã hủy</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Đang xử lý</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <Link href="/order">
          <Button variant="outline">Tạo đơn</Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Input placeholder="Tìm theo mã đơn / tên / SĐT" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[220px]" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={() => { setSearch(""); setStatus("all") }}>Xóa lọc</Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border overflow-hidden bg-white">
          <div className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 text-sm bg-white rounded-lg border p-6">Chưa có đơn hàng phù hợp</div>
      ) : (
        <div className="rounded-lg border overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Số SP</TableHead>
                <TableHead>Tổng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Cập nhật</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id}</TableCell>
                  <TableCell className="font-medium">{o.customer?.name || "-"}</TableCell>
                  <TableCell>{o.customer?.phone || "-"}</TableCell>
                  <TableCell>{o.items?.length || 0}</TableCell>
                  <TableCell className="font-semibold">{Number(o?.pricing?.total || 0).toLocaleString("vi-VN")}đ</TableCell>
                  <TableCell>{renderStatusBadge(o.fulfillment?.status)}</TableCell>
                  <TableCell className="text-right">
                    <Select value={(o.fulfillment?.status as string) || "pending"} onValueChange={(v) => updateStatus(o.id, v)}>
                      <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
