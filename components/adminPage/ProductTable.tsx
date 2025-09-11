"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Search, Filter, Star, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { Product, ProductStatus } from "@/types/product/product"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductTableProps {
  products: Product[]
  loading: boolean
  handleEdit: (product: Product | null) => void
  handleDelete: (id: string) => void
  handleChangeStatus: (id: string, status: ProductStatus) => void
}

export default function ProductTable({
  products,
  loading,
  handleEdit,
  handleDelete,
  handleChangeStatus,
}: ProductTableProps) {
  console.log("✅ ProductTable received products:", products)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSubCategory, setSelectedSubCategory] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all")
  const [sortKey, setSortKey] = useState<"name" | "price" | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Debounce search for smoother UX
  const [debouncedSearch, setDebouncedSearch] = useState("")
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(id)
  }, [searchTerm])

  // Lấy danh sách category duy nhất
  const categories = useMemo(() => {
    const allCategories = products.map((p) => p.category).filter(Boolean)
    return ["all", ...Array.from(new Set(allCategories))]
  }, [products])

  // Lấy danh sách subcategory duy nhất cho category được chọn
  const subCategories = useMemo(() => {
    if (selectedCategory === "all") return ["all"]
    const filtered = products.filter((p) => p.category === selectedCategory)
    const allSubCategories = filtered.map((p) => p.subCategory).filter(Boolean)
    return ["all", ...Array.from(new Set(allSubCategories))]
  }, [products, selectedCategory])

  // Lọc sản phẩm theo tên, danh mục và danh mục phụ
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory
      const matchSubCategory = selectedSubCategory === "all" || p.subCategory === selectedSubCategory
      const matchStatus = statusFilter === "all" || p.status === statusFilter
      return matchSearch && matchCategory && matchSubCategory && matchStatus
    })
  }, [products, debouncedSearch, selectedCategory, selectedSubCategory, statusFilter])

  const sortedProducts = useMemo(() => {
    if (!sortKey) return filteredProducts
    const arr = [...filteredProducts]
    arr.sort((a, b) => {
      if (sortKey === "name") {
        const va = (a.name || "").toLowerCase()
        const vb = (b.name || "").toLowerCase()
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va)
      } else {
        const pa = a.price || 0
        const pb = b.price || 0
        return sortDir === "asc" ? pa - pb : pb - pa
      }
    })
    return arr
  }, [filteredProducts, sortKey, sortDir])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [selectedCategory, selectedSubCategory, statusFilter, debouncedSearch])

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize))
  const pagedProducts = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedProducts.slice(start, start + pageSize)
  }, [sortedProducts, page])

  const renderStatusBadge = (status: ProductStatus | undefined) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Còn hàng</Badge>
      case "inactive":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Tạm hết hàng</Badge>
      case "disabled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Ẩn</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Hết hàng</Badge>
    }
  }

  // Reset subcategory khi category thay đổi
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setSelectedSubCategory("all")
  }

  const statusCounts = useMemo(() => {
    const counts = { all: products.length, active: 0, inactive: 0, disabled: 0 }
    products.forEach((p) => {
      if (p.status === "active") counts.active++
      else if (p.status === "inactive") counts.inactive++
      else if (p.status === "disabled") counts.disabled++
    })
    return counts
  }, [products])

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c ?? ""}>
                    {c === "all" ? "Tất cả" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCategory !== "all" && subCategories.length > 1 && (
              <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Danh mục phụ" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories.map((sc) => (
                    <SelectItem key={sc} value={sc ?? ""}>
                      {sc === "all" ? "Tất cả" : sc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Quick status chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {(["all", "active", "inactive", "disabled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-full border text-xs transition ${
                statusFilter === s
                  ? "bg-purple-600 text-white border-transparent"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s === "all" ? "Tất cả" : s === "active" ? "Còn hàng" : s === "inactive" ? "Tạm hết" : "Ẩn"}
              <span className="ml-1 opacity-80">({statusCounts[s]})</span>
            </button>
          ))}
        </div>

        {/* Filter Summary */}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
          <span>
            Tìm thấy: <strong>{filteredProducts.length}</strong> sản phẩm
          </span>
          {(selectedCategory !== "all" || selectedSubCategory !== "all" || searchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("all")
                setSelectedSubCategory("all")
                setStatusFilter("all")
              }}
              className="h-6 px-2 text-xs"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Loading / Không tìm thấy */}
      {loading ? (
        <div className="rounded-lg border overflow-hidden bg-white">
          <div className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border">
          <p className="text-gray-500">Không tìm thấy sản phẩm</p>
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden sm:block rounded-lg border overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70">
                <TableRow>
                  <TableHead className="w-[80px]">Hình</TableHead>
                  <TableHead>
                    <button
                      className="inline-flex items-center gap-1 hover:underline"
                      onClick={() => {
                        setSortKey("name")
                        setSortDir((d) => (sortKey === "name" ? (d === "asc" ? "desc" : "asc") : "asc"))
                      }}
                    >
                      Tên <ArrowUpDown className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  </TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Danh mục phụ</TableHead>
                  <TableHead>
                    <button
                      className="inline-flex items-center gap-1 hover:underline"
                      onClick={() => {
                        setSortKey("price")
                        setSortDir((d) => (sortKey === "price" ? (d === "asc" ? "desc" : "asc") : "asc"))
                      }}
                    >
                      Giá <ArrowUpDown className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  </TableHead>
                  <TableHead>SL</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedProducts.map((p) => (
                  <TableRow
                    key={p.id}
                    className={`group hover:bg-gray-50 transition-colors odd:bg-gray-50/40 border-l-4 ${
                      p.featured ? "border-amber-300" : "border-transparent"
                    } ${p.status === "inactive" ? "opacity-60" : ""} ${
                      p.status === "disabled" ? "opacity-40" : ""
                    }`}
                  >
                    <TableCell>
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden ring-1 ring-gray-200">
                        <Image
                          src={p.imageUrl || "/placeholder.svg"}
                          alt={p.name}
                          fill
                          className="object-cover"
                          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[260px]">
                      <div className="flex items-start gap-1">
                        {p.featured && (
                          <Star className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
                        )}
                        <div className="truncate text-gray-900">{p.name}</div>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.featured && (
                          <Badge variant="secondary" className="text-[10px] py-0">Nổi bật</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {p.subCategory ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {p.subCategory}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{p.price?.toLocaleString()}đ</TableCell>
                    <TableCell>{p.quantity}</TableCell>
                    <TableCell>{p.size}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {renderStatusBadge(p.status)}
                        <Select
                          value={p.status}
                          onValueChange={(value) => handleChangeStatus(p.id, value as ProductStatus)}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Còn hàng</SelectItem>
                            <SelectItem value="inactive">Tạm hết hàng</SelectItem>
                            <SelectItem value="disabled">Ẩn</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(p)} className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(p.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View */}
          <div className="sm:hidden space-y-4">
            {pagedProducts.map((p) => (
              <div
                key={p.id}
                className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                  p.status === "inactive" ? "opacity-60" : ""
                } ${p.status === "disabled" ? "opacity-40" : ""}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                    <Image
                      src={p.imageUrl || "/placeholder.svg"}
                      alt={p.name}
                      fill
                      className="object-cover"
                      onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-1">
                      {p.featured && <Star className="w-4 h-4 mt-0.5 text-amber-500" />}
                      <h3 className="font-semibold truncate">{p.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {p.category}
                      </Badge>
                      {p.subCategory && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                          {p.subCategory}
                        </Badge>
                      )}
                      {p.featured && (
                        <Badge variant="secondary" className="text-xs">
                          Nổi bật
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    Giá: <span className="font-medium">{p.price?.toLocaleString()}đ</span>
                  </div>
                  <div>
                    SL: <span className="font-medium">{p.quantity}</span>
                  </div>
                  <div>
                    Size: <span className="font-medium">{p.size}</span>
                  </div>
                  <div className="flex items-center gap-1">{renderStatusBadge(p.status)}</div>
                </div>

                <div className="space-y-2">
                  <Select value={p.status} onValueChange={(value) => handleChangeStatus(p.id, value as ProductStatus)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Còn hàng</SelectItem>
                      <SelectItem value="inactive">Tạm hết hàng</SelectItem>
                      <SelectItem value="disabled">Ẩn</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(p)} className="flex-1">
                      <Edit className="w-4 h-4 mr-1" /> Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(p.id)}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Xóa
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
            <div>
              Trang {page}/{totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
