"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, getDocs, orderBy, query, where, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, TrendingUp } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

type OrderDoc = {
  id: string
  createdAt?: any
  pricing?: { total?: number }
  items?: Array<{ category?: string; subCategory?: string; name?: string; price?: number; quantity?: number }>
}

function startOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function startOfMonth(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1)
  x.setHours(0, 0, 0, 0)
  return x
}
function startOfYear(d = new Date()) {
  const x = new Date(d.getFullYear(), 0, 1)
  x.setHours(0, 0, 0, 0)
  return x
}

export default function AdminStatsPage() {
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        const q = query(
          collection(db, "orders"),
          where("createdAt", ">=", Timestamp.fromDate(oneYearAgo)),
          orderBy("createdAt", "desc")
        )
        const snap = await getDocs(q)
        const list: OrderDoc[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        setOrders(list)
      } catch (e) {
        // Fallback: fetch all if index/order not available
        try {
          const snap = await getDocs(collection(db, "orders"))
          const list: OrderDoc[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
          setOrders(list)
        } catch (err) {
          console.error(err)
          setError("Không thể tải dữ liệu thống kê")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // Helpers
  const getDate = (o: OrderDoc) => {
    const ts: any = o.createdAt
    if (ts?.toDate) return ts.toDate() as Date
    return new Date(0)
  }
  const totalOf = (arr: OrderDoc[]) => arr.reduce((s, o) => s + (Number(o?.pricing?.total) || 0), 0)

  // Summaries
  const now = new Date()
  const todayStart = startOfDay(now)
  const monthStart = startOfMonth(now)
  const yearStart = startOfYear(now)

  const sumToday = useMemo(() => totalOf(orders.filter((o) => getDate(o) >= todayStart)), [orders, todayStart])
  const sumMonth = useMemo(() => totalOf(orders.filter((o) => getDate(o) >= monthStart)), [orders, monthStart])
  const sumYear = useMemo(() => totalOf(orders.filter((o) => getDate(o) >= yearStart)), [orders, yearStart])

  // Revenue last 30 days
  const last30 = new Array(30)
    .fill(0)
    .map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (29 - i))
      d.setHours(0, 0, 0, 0)
      return d
    })
  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>()
    orders.forEach((o) => {
      const d = getDate(o)
      const key = startOfDay(d).toISOString().slice(0, 10)
      map.set(key, (map.get(key) || 0) + (Number(o?.pricing?.total) || 0))
    })
    return last30.map((d) => {
      const key = d.toISOString().slice(0, 10)
      return { day: `${d.getDate()}/${d.getMonth() + 1}`, revenue: map.get(key) || 0 }
    })
  }, [orders, last30])

  // Top categories by revenue and quantity
  const topCategories = useMemo(() => {
    const rev = new Map<string, number>()
    const qty = new Map<string, number>()
    orders.forEach((o) => {
      o.items?.forEach((it) => {
        const cat = String(it.category || "Khác")
        const amount = (Number(it.price) || 0) * (Number(it.quantity) || 0)
        rev.set(cat, (rev.get(cat) || 0) + amount)
        qty.set(cat, (qty.get(cat) || 0) + (Number(it.quantity) || 0))
      })
    })
    const revArr = Array.from(rev.entries()).map(([category, value]) => ({ category, value }))
    const qtyArr = Array.from(qty.entries()).map(([category, value]) => ({ category, value }))
    revArr.sort((a, b) => b.value - a.value)
    qtyArr.sort((a, b) => b.value - a.value)
    return { rev: revArr.slice(0, 5), qty: qtyArr.slice(0, 5) }
  }, [orders])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        <h1 className="text-xl font-semibold">Thống kê bán hàng</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {loading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)
        ) : (
          <>
            <Card className="p-3">
              <div className="text-sm text-gray-500">Hôm nay</div>
              <div className="text-lg font-semibold">{sumToday.toLocaleString("vi-VN")}đ</div>
            </Card>
            <Card className="p-3">
              <div className="text-sm text-gray-500">Tháng này</div>
              <div className="text-lg font-semibold">{sumMonth.toLocaleString("vi-VN")}đ</div>
            </Card>
            <Card className="p-3">
              <div className="text-sm text-gray-500">Năm nay</div>
              <div className="text-lg font-semibold">{sumYear.toLocaleString("vi-VN")}đ</div>
            </Card>
          </>
        )}
      </div>

      {/* Revenue chart */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          <div className="text-sm font-medium">Doanh thu 30 ngày</div>
        </div>
        <div className="h-48">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RBarChart data={revenueByDay} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} width={60} />
                <Tooltip formatter={(v: any) => `${Number(v).toLocaleString("vi-VN")}đ`} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </RBarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Top categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-3">
          <div className="text-sm font-medium mb-2">Top danh mục theo doanh thu</div>
          {loading ? (
            <Skeleton className="h-24" />
          ) : topCategories.rev.length === 0 ? (
            <div className="text-sm text-gray-500">Chưa có dữ liệu</div>
          ) : (
            <div className="space-y-2">
              {topCategories.rev.map((c) => (
                <div key={c.category} className="flex items-center justify-between text-sm">
                  <span>{c.category}</span>
                  <Badge variant="secondary">{Number(c.value).toLocaleString("vi-VN")}đ</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-3">
          <div className="text-sm font-medium mb-2">Top danh mục theo số lượng</div>
          {loading ? (
            <Skeleton className="h-24" />
          ) : topCategories.qty.length === 0 ? (
            <div className="text-sm text-gray-500">Chưa có dữ liệu</div>
          ) : (
            <div className="space-y-2">
              {topCategories.qty.map((c) => (
                <div key={c.category} className="flex items-center justify-between text-sm">
                  <span>{c.category}</span>
                  <Badge variant="secondary">{Number(c.value)}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  )
}
