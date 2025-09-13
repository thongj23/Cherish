"use client"

import { useEffect, useMemo, useState } from "react"
import { collection, getDocs, orderBy, query, limit, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card } from "@/components/ui/card"

type DayDoc = any

export default function AdminStatsPage() {
  const [days, setDays] = useState<DayDoc[]>([])
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchDays = async () => {
    setLoading(true)
    try {
      const col = collection(db, "stats/daily/days")
      let qRef = query(col, orderBy("dateMs", "desc"), limit(30) as any) as any
      const s = start ? new Date(start + "T00:00:00").getTime() : null
      const e = end ? new Date(end + "T23:59:59").getTime() : null
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
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm">Từ</label>
        <input type="date" className="border rounded px-2 py-1 text-sm" value={start} onChange={(e) => setStart(e.target.value)} />
        <label className="text-sm">đến</label>
        <input type="date" className="border rounded px-2 py-1 text-sm" value={end} onChange={(e) => setEnd(e.target.value)} />
        <button className="px-3 py-1 border rounded" onClick={fetchDays}>{loading ? "Đang tải…" : "Lọc"}</button>
      </div>

      <Card className="p-3">
        <div className="font-medium mb-2">Tổng quan</div>
        <div className="text-sm">Tổng đơn: <strong>{totals.count}</strong></div>
        <div className="text-sm">Doanh thu: <strong>{totals.amount.toLocaleString("vi-VN")}đ</strong></div>
        <div className="text-sm">Tỉ lệ hủy: <strong>{(totals.cancelRate * 100).toFixed(1)}%</strong></div>
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

