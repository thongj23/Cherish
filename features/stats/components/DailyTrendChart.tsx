"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface DailyTrendChartProps {
  data: Array<{
    id: string
    totals?: {
      count?: number
      amount?: number
    }
    funnel?: {
      canceled?: number
    }
  }>
}

export function DailyTrendChart({ data }: DailyTrendChartProps) {
  const chartData = useMemo(() => {
    return data
      .slice()
      .reverse()
      .map((item) => {
        const count = Number(item?.totals?.count || 0)
        const amount = Number(item?.totals?.amount || 0)
        const canceled = Number(item?.funnel?.canceled || 0)
        return {
          date: item.id,
          orders: count,
          revenue: amount,
          cancelRate: count ? Number(((canceled / count) * 100).toFixed(2)) : 0,
        }
      })
  }, [data])

  if (chartData.length === 0) {
    return <div className="text-sm text-gray-500">Chưa có dữ liệu thống kê trong khoảng thời gian đã chọn.</div>
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ left: 12, right: 12, top: 16, bottom: 24 }}>
          <defs>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34D399" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="date" tickMargin={8} fontSize={12} angle={-35} height={60} dy={10} textAnchor="end" />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{ borderRadius: 12, borderColor: "#EDE9FE" }}
            formatter={(value: number, name: string) => {
              if (name === "Tỉ lệ hủy") return [`${value}%`, name]
              if (name === "Doanh thu") return [`${value.toLocaleString("vi-VN") }đ`, name]
              return [value, name]
            }}
          />
          <Legend wrapperStyle={{ paddingTop: 8 }} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="orders"
            name="Số đơn"
            stroke="#8B5CF6"
            fill="url(#ordersGradient)"
            strokeWidth={2}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            name="Doanh thu"
            stroke="#34D399"
            fill="url(#revenueGradient)"
            strokeWidth={2}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="cancelRate"
            name="Tỉ lệ hủy"
            stroke="#F87171"
            fillOpacity={0}
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
