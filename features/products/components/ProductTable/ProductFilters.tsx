"use client"

import { Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { ProductStatus } from "@/types/product/product"

import { UNCATEGORIZED_CATEGORY_VALUE, type StatusCounts } from "./useProductTableState"

interface ProductFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  categories: string[]
  selectedCategory: string
  onCategoryChange: (value: string) => void
  subCategories: string[]
  selectedSubCategory: string
  onSubCategoryChange: (value: string) => void
  statusFilter: "all" | ProductStatus
  onStatusFilterChange: (value: "all" | ProductStatus) => void
  onResetFilters: () => void
  filteredCount: number
  statusCounts: StatusCounts
  showSubCategorySelect: boolean
  isFiltered: boolean
}

const STATUS_LABELS: Record<"all" | ProductStatus, string> = {
  all: "Tất cả",
  active: "Còn hàng",
  inactive: "Tạm hết",
  disabled: "Ẩn",
}

export function ProductFilters({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  subCategories,
  selectedSubCategory,
  onSubCategoryChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
  filteredCount,
  statusCounts,
  showSubCategorySelect,
  isFiltered,
}: ProductFiltersProps) {
  const renderCategoryLabel = (category: string) => {
    if (category === "all") return "Tất cả"
    if (category === UNCATEGORIZED_CATEGORY_VALUE) return "Chưa phân loại"
    return category
  }

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {renderCategoryLabel(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showSubCategorySelect && (
            <Select value={selectedSubCategory} onValueChange={onSubCategoryChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Danh mục phụ" />
              </SelectTrigger>
              <SelectContent>
                {subCategories.map((subCategory) => (
                  <SelectItem key={subCategory} value={subCategory}>
                    {subCategory === "all" ? "Tất cả" : subCategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {(Object.keys(STATUS_LABELS) as Array<"all" | ProductStatus>).map((status) => (
          <button
            key={status}
            onClick={() => onStatusFilterChange(status)}
            className={`min-h-[44px] rounded-full border px-4 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 ${
              statusFilter === status
                ? "bg-purple-600 text-white border-transparent"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {STATUS_LABELS[status]}
            <span className="ml-1 opacity-80">({statusCounts[status]})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <span>
          Tìm thấy: <strong>{filteredCount}</strong> sản phẩm
        </span>
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={onResetFilters} className="px-3 text-xs">
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  )
}
