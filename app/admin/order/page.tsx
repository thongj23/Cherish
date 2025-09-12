"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
  arrayUnion
} from "firebase/firestore"
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

type TabType = "manage" | "create" | "scan" | "lookup"

const STATUS_OPTIONS = [
  { value: "pending", label: "Đang xử lý" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "packed", label: "Đang đóng" },
  { value: "shipped", label: "Đã gửi" },
  { value: "completed", label: "Hoàn tất" },
  { value: "canceled", label: "Đã hủy" }
]

// Mock data hiển thị khi không có đơn hàng thật
const MOCK_ORDERS: AdminOrder[] = [
  {
    id: "MOCK123",
    customer: { name: "Nguyễn Văn A", phone: "0901234567" },
    items: [{ name: "Bánh trung thu", quantity: 2 }],
    pricing: { total: 200000 },
    fulfillment: { status: "pending" },
    createdAt: { toDate: () => new Date() }
  },
  {
    id: "MOCK124",
    customer: { name: "Trần Thị B", phone: "0912345678" },
    items: [{ name: "Trà sữa", quantity: 1 }],
    pricing: { total: 50000 },
    fulfillment: { status: "confirmed" },
    createdAt: { toDate: () => new Date() }
  }
]

export default function AdminOrdersPage() {
  const [tab, setTab] = useState<TabType>("manage")
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [lastDoc, setLastDoc] = useState<any>(null)
  const [hasMore, setHasMore] = useState(true)

  const fetchOrders = useCallback(
    async (reset = true) => {
      setLoading(true)
      try {
        const base = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(20))
        const qRef = reset || !lastDoc ? base : query(base, startAfter(lastDoc))
        const snap = await getDocs(qRef)
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as AdminOrder[]
        setOrders((prev) => (reset ? list : [...prev, ...list]))
        setLastDoc(snap.docs[snap.docs.length - 1] || null)
        setHasMore(snap.docs.length === 20)
      } finally {
        setLoading(false)
      }
    },
    [lastDoc]
  )

  useEffect(() => {
    fetchOrders(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const current = orders.find((o) => o.id === id)?.fulfillment?.status || null
    await updateDoc(doc(db, "orders", id), {
      "fulfillment.status": newStatus,
      updatedAt: serverTimestamp(),
      "meta.history": arrayUnion({ at: serverTimestamp(), from: current, to: newStatus }) as any
    } as any)
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, fulfillment: { ...(o.fulfillment || {}), status: newStatus } } : o
      )
    )
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

  const exportCSV = () => {
    const header = ["id", "name", "phone", "items", "total", "status", "createdAt"]
    const rows = filtered.map((o) => {
      const created = o.createdAt?.toDate ? o.createdAt.toDate().toISOString() : ""
      const total = Number(o?.pricing?.total || 0)
      const csv = [
        o.id,
        o.customer?.name || "",
        o.customer?.phone || "",
        String(o.items?.length || 0),
        String(total),
        o.fulfillment?.status || "",
        created
      ]
      return csv.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    })
    const csv = [header.join(","), ...rows].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Map cho iframe tabs
  const TAB_MAP: Record<Exclude<TabType, "manage">, { src: string; title: string; h: string }> = {
    create: { src: "/order", title: "Tạo đơn", h: "h-[1400px]" },
    scan: { src: "/scan", title: "Quét QR", h: "h-[900px]" },
    lookup: { src: "/orders", title: "Tra cứu đơn", h: "h-[800px]" }
  }

  // Early render cho non-manage tab
switch (tab) {
  case "manage":
    return (
      <div className="space-y-4">
        {/* Nội dung tab manage ở đây */}
      </div>
    )
  case "create":
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Tạo đơn</h1>
        <iframe src="/order" className="w-full h-[1400px]" title="Tạo đơn" />
      </div>
    )
  case "scan":
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Quét QR</h1>
        <iframe src="/scan" className="w-full h-[900px]" title="Quét QR" />
      </div>
    )
  case "lookup":
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Tra cứu đơn</h1>
        <iframe src="/orders" className="w-full h-[800px]" title="Tra cứu đơn" />
      </div>
    )
}


  // Tab "manage"
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h1 className="text-2xl font-bold">Đơn hàng</h1>
        <div className="flex gap-2">
          <Button variant={tab === "manage" ? "default" : "outline"} onClick={() => setTab("manage")}>Quản lý</Button>
          <Button variant={tab === "create" ? "default" : "outline"} onClick={() => setTab("create")}>Tạo đơn</Button>
          <Button variant={tab === "scan" ? "default" : "outline"} onClick={() => setTab("scan")}>Quét QR</Button>
          <Button variant={tab === "lookup" ? "default" : "outline"} onClick={() => setTab("lookup")}>Tra cứu</Button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Tìm theo mã đơn / tên / SĐT"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[220px]"
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("")
              setStatus("all")
              fetchOrders(true)
            }}
          >
            Xóa lọc
          </Button>
          <Button onClick={exportCSV}>Xuất CSV</Button>
        </div>
      </div>

      {/* Table */}
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
        // Hiển thị mock data thay vì text trống
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ORDERS.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id}</TableCell>
                  <TableCell className="font-medium">{o.customer?.name}</TableCell>
                  <TableCell>{o.customer?.phone}</TableCell>
                  <TableCell>{o.items?.length}</TableCell>
                  <TableCell className="font-semibold">
                    {Number(o?.pricing?.total || 0).toLocaleString("vi-VN")}đ
                  </TableCell>
                  <TableCell>{renderStatusBadge(o.fulfillment?.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        // Hiển thị dữ liệu thật
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
                  <TableCell className="font-mono text-xs">
                    <Link href={`/admin/order/${o.id}`} className="underline text-purple-600">
                      {o.id}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">{o.customer?.name || "-"}</TableCell>
                  <TableCell>{o.customer?.phone || "-"}</TableCell>
                  <TableCell>{o.items?.length || 0}</TableCell>
                  <TableCell className="font-semibold">
                    {Number(o?.pricing?.total || 0).toLocaleString("vi-VN")}đ
                  </TableCell>
                  <TableCell>{renderStatusBadge(o.fulfillment?.status)}</TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={(o.fulfillment?.status as string) || "pending"}
                      onValueChange={(v) => updateStatus(o.id, v)}
                    >
                      <SelectTrigger className="w-[160px] h-8 text-xs">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {hasMore && (
            <div className="flex justify-center p-3">
              <Button variant="outline" onClick={() => fetchOrders(false)}>Tải thêm</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
