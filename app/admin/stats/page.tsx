"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { collection, getDocs, orderBy, query, limit, where } from "firebase/firestore"

import { Card } from "@/components/ui/card"
import { db } from "@/lib/firebase"

const DailyTrendChart = dynamic(
  () => import("@/features/stats/components/DailyTrendChart").then((mod) => mod.DailyTrendChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed border-purple-200 bg-purple-50 text-sm text-purple-600">
        Đang tải biểu đồ...
      </div>
    ),
  },
)

type DayDoc = any

export default function AdminStatsPage() {
  const [days, setDays] = useState<DayDoc[]>([])
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchDays = async (range?: { start?: string; end?: string }) => {
    setLoading(true)
    try {
      const col = collection(db, "stats/daily/days")
      let qRef = query(col, orderBy("dateMs", "desc"), limit(30) as any) as any
      const startValue = range?.start ?? start
      const endValue = range?.end ?? end
      const s = startValue ? new Date(startValue + "T00:00:00").getTime() : null
      const e = endValue ? new Date(endValue + "T23:59:59").getTime() : null
      if (s != null) qRef = query(qRef, where("dateMs", ">=", s) as any)
      if (e != null) qRef = query(qRef, where("dateMs", "<=", e) as any)
      const snap = await getDocs(qRef)
      const list: DayDoc[] = []
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }))
      setDays(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDays()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totals = useMemo(() => {
    let count = 0
    let amount = 0
    let canceled = 0
    for (const d of days) {
      count += Number(d?.totals?.count || 0)
      amount += Number(d?.totals?.amount || 0)
      canceled += Number(d?.funnel?.canceled || 0)
    }
    return { count, amount, cancelRate: count ? canceled / count : 0 }
  }, [days])

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 text-sm text-gray-600 md:flex-row md:items-center md:gap-3">
          <label className="font-medium text-gray-700" htmlFor="stats-start">
            Từ
          </label>
          <input
            id="stats-start"
            type="date"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 md:w-auto"
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
          <label className="font-medium text-gray-700" htmlFor="stats-end">
            đến
          </label>
          <input
            id="stats-end"
            type="date"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 md:w-auto"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button
            className="min-h-[44px] rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500"
            onClick={() => fetchDays()}
          >
            {loading ? "Đang tải…" : "Lọc"}
          </button>
          {(start || end) && (
            <button
              className="min-h-[44px] rounded-md border px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500"
              onClick={() => {
                setStart("")
                setEnd("")
                fetchDays({ start: "", end: "" })
              }}
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      <Card className="p-3">
        <div className="font-medium mb-2">Tổng quan</div>
        <div className="text-sm">Tổng đơn: <strong>{totals.count}</strong></div>
        <div className="text-sm">Doanh thu: <strong>{totals.amount.toLocaleString("vi-VN")}đ</strong></div>
        <div className="text-sm">Tỉ lệ hủy: <strong>{(totals.cancelRate * 100).toFixed(1)}%</strong></div>
      </Card>

      <Card className="p-3">
        <div className="font-medium mb-2">Biểu đồ theo ngày</div>
        <DailyTrendChart data={days.slice(0, 14)} />
      </Card>

      <Card className="p-3">
        <div className="font-medium mb-2">Funnel theo ngày (gần nhất)</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {days.slice(0, 7).map((d) => (
            <div key={d.id} className="border rounded p-2 text-sm">
              <div className="font-medium mb-1">{d.id}</div>
              <div>pending: {d?.funnel?.pending || 0}</div>
              <div>confirmed: {d?.funnel?.confirmed || 0}</div>
              <div>packed: {d?.funnel?.packed || 0}</div>
              <div>shipped: {d?.funnel?.shipped || 0}</div>
              <div>completed: {d?.funnel?.completed || 0}</div>
              <div>canceled: {d?.funnel?.canceled || 0}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="p-3">
          <div className="font-medium mb-2">Top sản phẩm (demo)</div>
          <div className="text-sm text-gray-600">Lấy từ stats/daily/days/{"{date}"}/agg/topProducts</div>
        </Card>
        <Card className="p-3">
          <div className="font-medium mb-2">Top khách (theo SĐT) (demo)</div>
          <div className="text-sm text-gray-600">Lấy từ stats/daily/days/{"{date}"}/agg/topCustomers</div>
        </Card>
      </div>
    </div>
  )
}
