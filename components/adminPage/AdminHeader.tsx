"use client"

import Link from "next/link"
import { ArrowLeft, Plus, Images, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminHeaderProps {
  onAddProduct: () => void
  onViewImages: () => void
  productCount?: number
  activeCount?: number
  inactiveCount?: number
  disabledCount?: number
}

export default function AdminHeader({ onAddProduct, onViewImages, productCount = 0, activeCount = 0, inactiveCount = 0, disabledCount = 0 }: AdminHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200 p-4 sm:p-6 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="hover:bg-gray-50 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" /> Về trang chủ
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-gray-600 text-sm">Thêm, sửa, xóa sản phẩm</p>
              <div className="flex items-center gap-1 text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                <Package className="w-3 h-3" />
                <span className="font-medium">{productCount} sản phẩm</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={onAddProduct} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
          </Button>
          <Button
            variant="outline"
            onClick={onViewImages}
            className="border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
          >
            <Images className="w-4 h-4 mr-2" /> Xem tất cả ảnh
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 bg-green-50 px-2 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Hoạt động</span>
          <span className="font-semibold">{activeCount}</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 bg-yellow-50 px-2 py-1 rounded-full">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span>Tạm dừng</span>
          <span className="font-semibold">{inactiveCount}</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 bg-red-50 px-2 py-1 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>Ẩn</span>
          <span className="font-semibold">{disabledCount}</span>
        </div>
      </div>
    </div>
  )
}
