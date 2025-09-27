"use client"

import Link from "next/link"
import { ArrowLeft, Plus, Images, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductManagementHeaderProps {
  onAddProduct: () => void
  onViewImages: () => void
  productCount?: number
  activeCount?: number
  inactiveCount?: number
  disabledCount?: number
}

export default function ProductManagementHeader({
  onAddProduct,
  onViewImages,
  productCount = 0,
  activeCount = 0,
  inactiveCount = 0,
  disabledCount = 0,
}: ProductManagementHeaderProps) {
  const statusCards = [
    {
      label: "Hoạt động",
      value: activeCount,
      indicatorClass: "bg-green-500",
      badgeClass: "bg-green-50 text-green-700",
    },
    {
      label: "Tạm dừng",
      value: inactiveCount,
      indicatorClass: "bg-yellow-500",
      badgeClass: "bg-yellow-50 text-yellow-700",
    },
    {
      label: "Ẩn",
      value: disabledCount,
      indicatorClass: "bg-red-500",
      badgeClass: "bg-red-50 text-red-700",
    },
  ]

  return (
    <div className="sticky top-16 z-30 mb-6">
      <div className="rounded-2xl border border-purple-100 bg-white/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="bg-transparent hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2" /> Về trang chủ
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
              <p className="mt-1 text-sm text-gray-500">Thêm, sửa, xóa sản phẩm</p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50 px-4 py-2">
              <Package className="h-5 w-5 text-purple-500" />
              <div>
                <span className="text-xs uppercase tracking-wide text-purple-500">Tổng sản phẩm</span>
                <p className="text-xl font-semibold text-purple-700">{productCount}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <Button onClick={onAddProduct} className="bg-purple-600 text-white hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
              </Button>
              <Button
                variant="outline"
                onClick={onViewImages}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <Images className="w-4 h-4 mr-2" /> Xem tất cả ảnh
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-purple-100 px-4 py-3 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {statusCards.map((card) => (
              <div
                key={card.label}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span className={`h-2.5 w-2.5 rounded-full ${card.indicatorClass}`} />
                    {card.label}
                  </div>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${card.badgeClass}`}>Sản phẩm</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
