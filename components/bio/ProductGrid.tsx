"use client"

import { useEffect, useMemo, useState } from "react"
import ProductCard from "./ProductCard"
import type { Product } from "@/types/product/product"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"

export default function ProductGrid({
  products,
  loading,
}: {
  products: Product[]
  loading: boolean
}) {
  const [activeTab, setActiveTab] = useState<"Dep" | "Classic" | "Collab" | "Charm">("Dep")
  const [activeCharmSubTab, setActiveCharmSubTab] = useState<"ConVat" | "HelloKitty" | "Khac">("ConVat")
  const [searchTerm, setSearchTerm] = useState("")

  const pageSize = 12
  const [visibleCount, setVisibleCount] = useState(pageSize)

  useEffect(() => {
    // Reset phân trang khi đổi tab/sub-tab/search
    setVisibleCount(pageSize)
  }, [activeTab, activeCharmSubTab, searchTerm])

  // no early return; render skeleton in results area when loading

  // Helper: normalize Vietnamese accents and slugify
  const normalize = (s?: string) =>
    (s ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // strip accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

  const isConVat = (sub: string) =>
    sub === "con-vat" || sub === "convat" || sub === "animal" || sub === "animals"

  const isHelloKitty = (sub: string) =>
    sub === "hello-kitty" || sub === "hellokitty" || sub === "kitty"

  // Đếm theo tab chính (Dép/Collab/Charm)
  const mainCounts = useMemo(() => {
    const c = { Dep: 0, Collab: 0, Charm: 0 }
    products.forEach((p) => {
      const cat = normalize(p.category)
      if (cat === "dep" || cat === "classic") c.Dep += 1
      else if (cat.includes("collab")) c.Collab += 1
      else if (cat === "charm" || cat.includes("charm")) c.Charm += 1
    })
    return c
  }, [products])

  // 1) Lọc theo category Tab (ổn định, chấp nhận biến thể/viết có dấu)
  const activeKey = normalize(activeTab)
  const matchesCategory = (p: Product) => {
    const cat = normalize(p.category)
    if (activeKey === "charm") return cat === "charm" || cat.includes("charm")
    if (activeKey === "collab") return cat === "collab" || cat.includes("collab")
    // Classic/Dép
    if (activeKey === "dep" || activeKey === "classic") return cat === "dep" || cat === "classic"
    return cat === activeKey
  }

  let categoryFiltered = products.filter(matchesCategory)

  // 2) Nếu là Charm, tính count từng sub và lọc thêm theo subcategory
  let charmCount = { ConVat: 0, HelloKitty: 0, Khac: 0 }
  if (activeTab === "Charm") {
    const onlyCharm = categoryFiltered
    // Đếm số lượng theo sub để debug/hiển thị trên tab
    onlyCharm.forEach((p) => {
      const sub = normalize(p.subCategory)
      if (isConVat(sub)) charmCount.ConVat += 1
      else if (isHelloKitty(sub)) charmCount.HelloKitty += 1
      else charmCount.Khac += 1
    })

    const filteredBySub = onlyCharm.filter((p) => {
      const subCategory = normalize(p.subCategory)
      switch (activeCharmSubTab) {
        case "ConVat":
          return isConVat(subCategory)
        case "HelloKitty":
          return isHelloKitty(subCategory)
        case "Khac":
          return !isConVat(subCategory) && !isHelloKitty(subCategory)
        default:
          return true
      }
    })
    // Nếu sub-tab hiện tại không có kết quả, fallback: hiển thị toàn bộ Charm
    categoryFiltered = filteredBySub.length > 0 ? filteredBySub : onlyCharm
  }

  // 3) Lọc theo search term
  const searchFiltered = categoryFiltered.filter((p) => {
    const q = normalize(searchTerm)
    const name = normalize(p.name)
    const desc = normalize(p.description || "")
    return name.includes(q) || desc.includes(q)
  })

  // 4) Ưu tiên bán chạy
  const sortedProducts = useMemo(
    () => [
      ...searchFiltered.filter((p) => p.featured),
      ...searchFiltered.filter((p) => !p.featured),
    ],
    [searchFiltered]
  )

  const visibleProducts = sortedProducts.slice(0, visibleCount)

  const mainTabs = [
    { key: "Dep" as const, label: "Dép", emoji: "🩴", count: mainCounts.Dep },
    { key: "Collab" as const, label: "Collab", emoji: "🤝", count: mainCounts.Collab },
    { key: "Charm" as const, label: "Charm", emoji: "🎀", count: mainCounts.Charm },
  ]

  const charmSubTabs = [
    {
      key: "ConVat" as const,
      label: "Con vật",
      emoji: "🐾",
    },
    {
      key: "HelloKitty" as const,
      label: "Hello Kitty",
      emoji: "🐱",
    },
    {
      key: "Khac" as const,
      label: "Khác",
      emoji: "✨",
    },
  ]

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  }

  function LoadMore({ onMore, remaining, step }: { onMore: () => void; remaining: number; step: number }) {
    const [loadingMore, setLoadingMore] = useState(false)
    return (
      <div className="flex justify-center mt-6">
        <button
          onClick={() => {
            setLoadingMore(true)
            // nhẹ nhàng trên mobile
            setTimeout(() => {
              onMore()
              setLoadingMore(false)
            }, 200)
          }}
          className="px-4 py-2 rounded-full border border-purple-300 text-purple-700 bg-white hover:bg-purple-50 transition flex items-center gap-2"
        >
          {loadingMore && (
            <span className="inline-block w-3 h-3 rounded-full border-2 border-purple-400 border-b-transparent animate-spin" />
          )}
          <span>Xem thêm</span>
          <span className="text-gray-500 text-xs">{step}/{remaining}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Main Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.25 }}
        className="flex justify-center mb-6 flex-wrap gap-3"
      >
        {mainTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key)
              if (tab.key === "Charm") {
                setActiveCharmSubTab("ConVat") // Reset to first sub-tab
              }
            }}
            className={`group relative px-5 py-2.5 rounded-2xl border text-sm sm:text-base font-medium transition-all duration-200 md:hover:scale-105 ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-md shadow-purple-500/20"
                : "bg-white text-gray-700 border-purple-200 hover:border-purple-300 hover:shadow-sm"
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{tab.emoji}</span>
                <span className="font-semibold">{tab.label}</span>
                <span className="ml-1 text-xs opacity-90">({tab.count})</span>
              </div>
              <span
                className={`text-xs transition-colors duration-300 ${
                  activeTab === tab.key ? "text-purple-100" : "text-gray-500 group-hover:text-purple-600"
                }`}
              >
                {/* {tab.description} */}
              </span>
            </div>

            {/* Active indicator */}
            {activeTab === tab.key && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </motion.div>

      {/* Charm Sub-tabs */}
      {activeTab === "Charm" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.2 }}
          className="flex justify-center mb-6 flex-wrap gap-2"
        >
          {charmSubTabs.map((subTab) => (
            <button
              key={subTab.key}
              onClick={() => setActiveCharmSubTab(subTab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCharmSubTab === subTab.key
                  ? "bg-pink-500 text-white shadow-md"
                  : "bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100"
              }`}
            >
              <span className="mr-1">{subTab.emoji}</span>
              {subTab.label}
              <span className="ml-1 text-xs opacity-80">
                {subTab.key === "ConVat" && `(${charmCount.ConVat})`}
                {subTab.key === "HelloKitty" && `(${charmCount.HelloKitty})`}
                {subTab.key === "Khac" && `(${charmCount.Khac})`}
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Search input */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.25 }}
        className="mb-6 text-center"
      >
        <input
          type="text"
          placeholder={`Tìm kiếm ${activeTab === "Charm" ? `${activeTab} - ${charmSubTabs.find((s) => s.key === activeCharmSubTab)?.label}` : activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-purple-300 rounded-full px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
        />
      </motion.div>

      {/* Kết quả */}
      {loading ? (
        <div className="w-full max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/80 border rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center text-gray-700 text-sm bg-white/80 border rounded-xl py-8 px-4 max-w-md mx-auto">
          <Search className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <p className="mb-1">Chưa thấy sản phẩm phù hợp</p>
          <p className="text-gray-500">Thử đổi từ khóa hoặc chọn tab khác nhé.</p>
        </div>
      ) : (
        <motion.div
          key={`grid-${activeTab}-${activeTab === 'Charm' ? activeCharmSubTab : 'all'}-${normalize(searchTerm)}`}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full max-w-3xl mx-auto"
        >
          {visibleProducts.map((p, i) => (
            <motion.div key={p.id} variants={item}>
              <ProductCard product={p} index={i} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Load more */}
      {sortedProducts.length > visibleProducts.length && (
        <LoadMore
          onMore={() => setVisibleCount((c) => Math.min(c + pageSize, sortedProducts.length))}
          remaining={sortedProducts.length - visibleProducts.length}
          step={Math.min(pageSize, sortedProducts.length - visibleProducts.length)}
        />
      )}
    </div>
  )
}
