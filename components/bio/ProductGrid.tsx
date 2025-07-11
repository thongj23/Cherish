"use client"

import { useState } from "react"
import ProductCard from "./ProductCard"
import type { Product } from "@/types/product/product"

export default function ProductGrid({
  products,
  loading,
}: {
  products: Product[]
  loading: boolean
}) {
const [activeTab, setActiveTab] = useState<"Dep" | "Charm">("Charm")

  const [searchTerm, setSearchTerm] = useState("")

  if (loading)
    return (
      <div className="text-center text-gray-600 py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
        <span className="text-sm sm:text-base">Đang tải...</span>
      </div>
    )

  // 1) Lọc theo category Tab
  const categoryFiltered = products.filter(
    (p) => p.category?.toLowerCase() === activeTab.toLowerCase()
  )

  // 2) Lọc theo search term
  const searchFiltered = categoryFiltered.filter((p) => {
    const lower = searchTerm.toLowerCase()
    return (
      p.name.toLowerCase().includes(lower) ||
      (p.description && p.description.toLowerCase().includes(lower))
    )
  })

  // 3) Ưu tiên bán chạy
  const sortedProducts = [
    ...searchFiltered.filter((p) => p.featured),
    ...searchFiltered.filter((p) => !p.featured),
  ]

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setActiveTab("Dep")}
          className={`px-4 py-2 rounded-full border ${
            activeTab === "Dep"
              ? "bg-purple-600 text-white border-purple-600"
              : "bg-white text-purple-600 border-purple-300"
          } transition`}
        >
          Dép
        </button>
        <button
          onClick={() => setActiveTab("Charm")}
          className={`px-4 py-2 rounded-full border ${
            activeTab === "Charm"
              ? "bg-purple-600 text-white border-purple-600"
              : "bg-white text-purple-600 border-purple-300"
          } transition`}
        >
          Charm
        </button>
      </div>

      {/* Search input */}
      <div className="mb-6 text-center">
        <input
          type="text"
          placeholder={`Tìm kiếm ${activeTab.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-purple-300 rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
        />
      </div>

      {/* Kết quả */}
      {sortedProducts.length === 0 ? (
        <div className="text-center text-gray-500 text-sm">
          Không tìm thấy sản phẩm.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full max-w-3xl mx-auto">
          {sortedProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
