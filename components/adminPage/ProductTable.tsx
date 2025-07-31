"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { Product, ProductStatus } from "@/types/product/product"

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
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory
      const matchSubCategory = selectedSubCategory === "all" || p.subCategory === selectedSubCategory
      return matchSearch && matchCategory && matchSubCategory
    })
  }, [products, searchTerm, selectedCategory, selectedSubCategory])

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

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
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
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p>Đang tải...</p>
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
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[80px]">Hình</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Danh mục phụ</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>SL</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thay đổi trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => (
                  <TableRow
                    key={p.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      p.status === "inactive" ? "opacity-60" : ""
                    } ${p.status === "disabled" ? "opacity-40" : ""}`}
                  >
                    <TableCell>
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border">
                        <Image
                          src={p.imageUrl || "/placeholder.svg"}
                          alt={p.name}
                          fill
                          className="object-cover"
                          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="truncate">{p.name}</div>
                      {p.featured && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Nổi bật
                        </Badge>
                      )}
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
                    <TableCell>{renderStatusBadge(p.status)}</TableCell>
                    <TableCell>
                      <Select
                        value={p.status}
                        onValueChange={(value) => handleChangeStatus(p.id, value as ProductStatus)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Còn hàng</SelectItem>
                          <SelectItem value="inactive">Tạm hết hàng</SelectItem>
                          <SelectItem value="disabled">Ẩn</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(p)} className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(p.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
            {filteredProducts.map((p) => (
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
                    <h3 className="font-semibold truncate">{p.name}</h3>
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
        </>
      )}
    </div>
  )
}
