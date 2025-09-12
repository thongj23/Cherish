"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
  onSnapshot,
  arrayUnion,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Input as TextInput } from "@/components/ui/input"
import { QrCode } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type AdminOrder = {
  id: string
  customer?: { name?: string; phone?: string; email?: string | null }
  items?: Array<{ name?: string; quantity?: number }>
  pricing?: { total?: number }
  fulfillment?: { status?: string }
  createdAt?: any
  updatedAt?: any
  archived?: boolean
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
  const [rawSearch, setRawSearch] = useState("")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [dateStart, setDateStart] = useState<string>("")
  const [dateEnd, setDateEnd] = useState<string>("")
  const [includeArchived, setIncludeArchived] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [live, setLive] = useState(false)
  const [lastDoc, setLastDoc] = useState<any>(null)
  const [hasMore, setHasMore] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const [raw, setRaw] = useState("")
  const [scanMsg, setScanMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const scannerRef = useRef<HTMLDivElement | null>(null)
  const scannerInstance = useRef<any>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const functionUrl = process.env.NEXT_PUBLIC_FUNCTION_SAVE_SCAN_URL || ""

  const PAGE_SIZE = 20

  const baseQuery = () => query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(PAGE_SIZE))

  const fetchOrders = async (reset = true) => {
    setLoading(true)
    try {
      const b = baseQuery()
      const qRef = reset || !lastDoc ? b : query(b, startAfter(lastDoc))
      const snap = await getDocs(qRef)
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as AdminOrder[]
      setOrders((prev) => (reset ? list : [...prev, ...list]))
      setLastDoc(snap.docs[snap.docs.length - 1] || null)
      setHasMore(snap.docs.length === PAGE_SIZE)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Optional realtime for the first page
  useEffect(() => {
    if (!live) return
    const unsub = onSnapshot(baseQuery(), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as AdminOrder[]
      setOrders(list)
      setLastDoc(snap.docs[snap.docs.length - 1] || null)
      setHasMore(snap.docs.length === PAGE_SIZE)
    })
    return () => unsub()
  }, [live])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(rawSearch), 300)
    return () => clearTimeout(t)
  }, [rawSearch])

  // Saved filters in localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("adminOrders.filters.v1")
      if (!raw) return
      const saved = JSON.parse(raw)
      if (typeof saved?.rawSearch === "string") setRawSearch(saved.rawSearch)
      if (typeof saved?.status === "string") setStatus(saved.status)
      if (typeof saved?.dateStart === "string") setDateStart(saved.dateStart)
      if (typeof saved?.dateEnd === "string") setDateEnd(saved.dateEnd)
      if (typeof saved?.includeArchived === "boolean") setIncludeArchived(saved.includeArchived)
      if (typeof saved?.live === "boolean") setLive(saved.live)
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const data = { rawSearch, status, dateStart, dateEnd, includeArchived, live }
    try { localStorage.setItem("adminOrders.filters.v1", JSON.stringify(data)) } catch {}
  }, [rawSearch, status, dateStart, dateEnd, includeArchived, live])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault()
        searchRef.current?.focus()
      } else if (e.key.toLowerCase() === "r") {
        setLive((v) => !v)
      } else if (e.key.toLowerCase() === "q") {
        setShowScanner((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Load QR scanner when panel is open
  useEffect(() => {
    let cancelled = false
    if (!showScanner) {
      // clear if closing
      try { scannerInstance.current?.clear?.() } catch (_) {}
      scannerInstance.current = null
      return
    }
    ;(async () => {
      try {
        const mod: any = await import("html5-qrcode")
        if (cancelled) return
        const Html5QrcodeScanner = mod.Html5QrcodeScanner
        if (scannerRef.current && !scannerInstance.current) {
          scannerInstance.current = new Html5QrcodeScanner(
            scannerRef.current.id,
            { fps: 10, qrbox: { width: 220, height: 220 }, rememberLastUsedCamera: true, aspectRatio: 1 },
            false
          )
          const onSuccess = (decodedText: string) => {
            setRaw(decodedText)
            setScanMsg("Đã đọc mã – kiểm tra và bấm Gửi")
          }
          const onError = () => {}
          scannerInstance.current.render(onSuccess, onError)
        }
      } catch (err) {
        console.error("QR scanner load error", err)
      }
    })()
    return () => {
      cancelled = true
      try { scannerInstance.current?.clear?.() } catch (_) {}
      scannerInstance.current = null
    }
  }, [showScanner])

  const submitScan = async () => {
    if (!raw.trim()) {
      setScanMsg("Vui lòng quét mã hoặc nhập nội dung")
      return
    }
    if (!functionUrl) {
      setScanMsg("Thiếu URL Cloud Function (NEXT_PUBLIC_FUNCTION_SAVE_SCAN_URL)")
      return
    }
    setSubmitting(true)
    setScanMsg(null)
    try {
      const res = await fetch(functionUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ raw, source: "admin" }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "Gửi thất bại")
      setScanMsg("Đã lưu thành công")
      setRaw("")
    } catch (err: any) {
      setScanMsg(err?.message || "Có lỗi xảy ra")
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const startMs = dateStart ? new Date(dateStart + "T00:00:00").getTime() : null
    const endMs = dateEnd ? new Date(dateEnd + "T23:59:59").getTime() : null
    return orders.filter((o) => {
      if (!includeArchived && o.archived) return false
      const name = (o.customer?.name || "").toLowerCase()
      const phone = (o.customer?.phone || "").toLowerCase()
      const id = (o.id || "").toLowerCase()
      const matchText = !q || name.includes(q) || phone.includes(q) || id.includes(q)
      const st = (o.fulfillment?.status || "").toLowerCase() || "pending"
      const matchStatus = status === "all" || st === status
      const created = o.createdAt?.toMillis ? o.createdAt.toMillis() : 0
      const matchStart = startMs == null || created >= startMs
      const matchEnd = endMs == null || created <= endMs
      return matchText && matchStatus && matchStart && matchEnd
    })
  }, [orders, search, status, dateStart, dateEnd, includeArchived])

  const allowed: Record<string, string[]> = {
    pending: ["confirmed", "canceled"],
    confirmed: ["packed", "canceled"],
    packed: ["shipped", "canceled"],
    shipped: ["completed", "canceled"],
    completed: [],
    canceled: [],
  }

  const nextStatus = (s?: string): string | null => {
    const cur = (s || "pending").toLowerCase()
    const nexts = allowed[cur] || []
    const nonCancel = nexts.filter((x) => x !== "canceled")
    return nonCancel[0] || null
  }

  const updateStatus = async (id: string, newStatus: string) => {
    const target = orders.find((o) => o.id === id)
    const current = (target?.fulfillment?.status as string) || "pending"
    if (newStatus === "canceled" && current !== "canceled") {
      const reason = window.prompt("Lý do hủy đơn?", "") || ""
      if (!window.confirm("Xác nhận hủy đơn?")) return
      // optimistic update
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, fulfillment: { ...(o.fulfillment || {}), status: newStatus } } : o)))
      try {
        await updateDoc(doc(db, "orders", id), {
          "fulfillment.status": "canceled",
          updatedAt: serverTimestamp(),
          archived: true as any,
          "meta.history": arrayUnion({ at: serverTimestamp(), from: current, to: "canceled", actor: "admin", reason }) as any,
        } as any)
      } catch (e) {
        // rollback
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, fulfillment: { ...(o.fulfillment || {}), status: current } } : o)))
        alert("Cập nhật thất bại")
      }
      return
    }

    // Guard invalid transitions
    if (current in allowed && allowed[current].length && !allowed[current].includes(newStatus)) {
      alert(`Không thể chuyển từ ${current} → ${newStatus}`)
      return
    }
    const prevState = current
    // optimistic update
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, fulfillment: { ...(o.fulfillment || {}), status: newStatus } } : o)))
    try {
      await updateDoc(doc(db, "orders", id), {
        "fulfillment.status": newStatus,
        updatedAt: serverTimestamp(),
        "meta.history": arrayUnion({ at: serverTimestamp(), from: prevState, to: newStatus, actor: "admin" }) as any,
      } as any)
    } catch (e) {
      // rollback
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, fulfillment: { ...(o.fulfillment || {}), status: prevState } } : o)))
      alert("Cập nhật thất bại")
    }
  }

  const archiveOrder = async (id: string, archive: boolean) => {
    if (!window.confirm(archive ? "Chuyển vào lưu trữ?" : "Khôi phục đơn?")) return
    const prev = orders.find((o) => o.id === id)?.archived || false
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, archived: archive } : o)))
    try {
      await updateDoc(doc(db, "orders", id), {
        archived: archive,
        updatedAt: serverTimestamp(),
        "meta.history": arrayUnion({ at: serverTimestamp(), to: archive ? "archived" : "unarchived", actor: "admin" }) as any,
      } as any)
    } catch (e) {
      setOrders((p) => p.map((o) => (o.id === id ? { ...o, archived: prev } : o)))
      alert("Thao tác thất bại")
    }
  }

  const exportCSV = () => {
    const header = ["id", "name", "phone", "items", "total", "status", "createdAt", "updatedAt"]
    const rows = filtered.map((o) => {
      const created = o.createdAt?.toDate ? o.createdAt.toDate().toISOString() : ""
      const updated = o.updatedAt?.toDate ? o.updatedAt.toDate().toISOString() : ""
      const total = Number(o?.pricing?.total || 0)
      const csv = [
        o.id,
        o.customer?.name || "",
        o.customer?.phone || "",
        String(o.items?.length || 0),
        String(total),
        o.fulfillment?.status || "",
        created,
        updated,
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

  const highlight = (text?: string) => {
    const q = search.trim()
    const s = text || ""
    if (!q) return s
    const i = s.toLowerCase().indexOf(q.toLowerCase())
    if (i === -1) return s
    const before = s.slice(0, i)
    const match = s.slice(i, i + q.length)
    const after = s.slice(i + q.length)
    return (
      <span>
        {before}
        <mark className="bg-yellow-200 px-0.5 rounded-sm">{match}</mark>
        {after}
      </span>
    )
  }

  const summary = useMemo(() => {
    const counts: Record<string, number> = { all: filtered.length }
    let sum = 0
    for (const o of filtered) {
      const st = (o.fulfillment?.status || "pending").toLowerCase()
      counts[st] = (counts[st] || 0) + 1
      sum += Number(o?.pricing?.total || 0)
    }
    return { counts, sum }
  }, [filtered])

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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowScanner((v) => !v)}>
            <QrCode className="w-4 h-4 mr-1" /> {showScanner ? "Ẩn quét QR" : "Quét QR"}
          </Button>
          <Link href="/order">
            <Button variant="outline">Tạo đơn</Button>
          </Link>
        </div>
      </div>

      {showScanner && (
        <Card className="p-3 border-purple-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div id="qr-reader-admin" ref={scannerRef} className="w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700">Nội dung</label>
              <TextInput value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Dán/nhập nội dung tại đây" />
              <div className="flex gap-2">
                <Button onClick={submitScan} disabled={submitting}>{submitting ? "Đang gửi..." : "Gửi"}</Button>
                <Button variant="ghost" onClick={() => { setRaw(""); setScanMsg(null) }}>Xóa</Button>
              </div>
              {scanMsg && <p className="text-sm text-gray-700">{scanMsg}</p>}
            </div>
          </div>
        </Card>
      )}

      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Input ref={searchRef} placeholder="Tìm theo mã đơn / tên / SĐT (/)" value={rawSearch} onChange={(e) => setRawSearch(e.target.value)} className="flex-1 min-w-[220px]" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Từ</label>
            <input type="date" className="border rounded px-2 py-1 text-sm" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
            <label className="text-sm text-gray-600">đến</label>
            <input type="date" className="border rounded px-2 py-1 text-sm" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <input id="inc-arch" type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} />
            <label htmlFor="inc-arch">Hiển thị archived</label>
          </div>
          <div className="flex-1" />
          <Button variant="outline" onClick={exportCSV}>Xuất CSV</Button>
          <Button variant="ghost" onClick={() => { setRawSearch(""); setStatus("all"); setDateStart(""); setDateEnd(""); setIncludeArchived(false) }}>Xóa lọc</Button>
          <div className="flex items-center gap-2 text-sm">
            <input id="live" type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
            <label htmlFor="live">Realtime</label>
          </div>
        </div>
      </div>

      {/* Summary + quick filters */}
      <div className="bg-white p-3 rounded-lg border flex flex-wrap items-center gap-2">
        <div className="text-sm text-gray-600">Tổng: <strong>{summary.counts.all || 0}</strong> đơn, tiền: <strong>{summary.sum.toLocaleString("vi-VN")}đ</strong></div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "confirmed", "packed", "shipped", "completed", "canceled"] as const).map((k) => (
            <button
              key={k}
              className={`text-xs px-2 py-1 rounded border ${status === k ? "bg-purple-600 text-white border-purple-600" : "bg-white text-gray-700"}`}
              onClick={() => setStatus(k)}
            >
              {k === "all" ? "Tất cả" : STATUS_OPTIONS.find((s) => s.value === k)?.label}
              <span className="ml-1 opacity-70">{summary.counts[k as any] || 0}</span>
            </button>
          ))}
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
                <TableHead className="w-8">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && filtered.every((o) => selected.has(o.id))}
                    onChange={(e) => {
                      if (e.target.checked) setSelected(new Set(filtered.map((o) => o.id)))
                      else setSelected(new Set())
                    }}
                  />
                </TableHead>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Số SP</TableHead>
                <TableHead>Tổng</TableHead>
                <TableHead>Tạo</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id} className={`${o.archived ? "opacity-60" : ""} ${o.fulfillment?.status === "canceled" ? "bg-red-50" : ""}`}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.has(o.id)}
                      onChange={(e) => {
                        setSelected((prev) => {
                          const s = new Set(prev)
                          if (e.target.checked) s.add(o.id)
                          else s.delete(o.id)
                          return s
                        })
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <Link href={`/admin/order/${o.id}`} className="underline text-purple-600">
                      {highlight(o.id) as any}
                    </Link>
                    {o.archived && <span className="ml-1 text-[10px] px-1 py-0.5 rounded bg-gray-200 text-gray-700">Archived</span>}
                  </TableCell>
                  <TableCell className="font-medium">{highlight(o.customer?.name || "-")}</TableCell>
                  <TableCell>{highlight(o.customer?.phone || "-")}</TableCell>
                  <TableCell>{o.items?.length || 0}</TableCell>
                  <TableCell className="font-semibold">{Number(o?.pricing?.total || 0).toLocaleString("vi-VN")}đ</TableCell>
                  <TableCell className="text-xs text-gray-600">{o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString() : "-"}</TableCell>
                  <TableCell className="text-xs text-gray-600">{o.updatedAt?.toDate ? o.updatedAt.toDate().toLocaleString() : "-"}</TableCell>
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
                    <div className="inline-flex ml-2 gap-1">
                      {nextStatus(o.fulfillment?.status) && (
                        <Button variant="secondary" size="sm" onClick={() => updateStatus(o.id, nextStatus(o.fulfillment?.status)!)}>
                          Tiếp
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => updateStatus(o.id, "canceled")}>Hủy</Button>
                      <Button variant="ghost" size="sm" onClick={() => archiveOrder(o.id, !o.archived)}>
                        {o.archived ? "Khôi phục" : "Archive"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {selected.size > 0 && (
            <div className="flex items-center justify-between p-3 border-t bg-gray-50">
              <div className="text-sm text-gray-600">Đã chọn {selected.size} đơn</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  const ids = Array.from(selected)
                  ids.forEach((id) => updateStatus(id, "confirmed"))
                  setSelected(new Set())
                }}>Bulk Xác nhận</Button>
                <Button variant="outline" onClick={() => {
                  const ids = Array.from(selected)
                  ids.forEach((id) => updateStatus(id, "canceled"))
                  setSelected(new Set())
                }}>Bulk Hủy</Button>
                <Button variant="outline" onClick={exportCSV}>Export đã chọn</Button>
              </div>
            </div>
          )}
          {hasMore && !live && (
            <div className="flex justify-center p-3">
              <Button variant="outline" onClick={() => fetchOrders(false)}>Tải thêm</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
