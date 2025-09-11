"use client"

import { useState } from "react"
import ProductCard from "./ProductCard"
import type { Product } from "@/types/product/product"
import { motion } from "framer-motion"

export default function ProductGrid({
  products,
  loading,
}: {
  products: Product[]
  loading: boolean
}) {
  const [activeTab, setActiveTab] = useState<"Dep" | "Classic" | "Collab" | "Charm">("Classic")
  const [activeCharmSubTab, setActiveCharmSubTab] = useState<"ConVat" | "HelloKitty" | "Khac">("ConVat")
  const [searchTerm, setSearchTerm] = useState("")

  if (loading)
    return (
      <div className="text-center text-gray-600 py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
        <span className="text-sm sm:text-base">Đang tải...</span>
      </div>
    )

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

  // 2) Nếu là Charm, lọc thêm theo subcategory
  if (activeTab === "Charm") {
    const onlyCharm = categoryFiltered
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
  const sortedProducts = [...searchFiltered.filter((p) => p.featured), ...searchFiltered.filter((p) => !p.featured)]

  const mainTabs = [

    {
      key: "Dep" as const,
      label: "Classic",
    
  
    },
    {
      key: "Collab" as const,
      label: "Collab",
      emoji: "🤝",
    },
    {
      key: "Charm" as const,
      label: "Charm",

      emoji: "🎀",
    },
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
            className={`group relative px-6 py-3 rounded-2xl border-2 text-sm sm:text-base font-medium transition-all duration-300 transform hover:scale-105 ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg shadow-purple-500/25"
                : "bg-white text-gray-700 border-purple-200 hover:border-purple-400 hover:shadow-md"
            }`}
          >
            <div className="flex flex-col items-center space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{tab.emoji}</span>
                <span className="font-semibold">{tab.label}</span>
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
      {sortedProducts.length === 0 ? (
        <div className="text-center text-gray-500 text-sm">Không tìm thấy sản phẩm.</div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full max-w-3xl mx-auto"
        >
          {sortedProducts.map((p, i) => (
            <motion.div key={p.id} variants={item}>
              <ProductCard product={p} index={i} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
