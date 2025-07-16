"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Product, ProductStatus } from "@/types/product/product"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Lấy danh sách category duy nhất
  const categories = useMemo(() => {
    const allCategories = products.map((p) => p.category).filter(Boolean)
    return ["all", ...Array.from(new Set(allCategories))]
  }, [products])

  // Lọc sản phẩm theo tên và danh mục
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory
      return matchSearch && matchCategory
    })
  }, [products, searchTerm, selectedCategory])

  const renderStatusBadge = (status: ProductStatus | undefined) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Còn hàng</Badge>
      case "inactive":
        return <Badge variant="secondary">Tạm hết hàng</Badge>
      case "disabled":
        return <Badge variant="destructive">Ẩn</Badge>
      default:
        return <Badge variant="secondary">Hết hàng</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Thanh tìm kiếm và lọc */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-xs"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
          <SelectItem key={c} value={c ?? ""}>

                {c === "all" ? "Tất cả" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading / Không tìm thấy */}
      {loading ? (
        <p className="text-center">Đang tải...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center">Không tìm thấy sản phẩm</p>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden sm:block rounded border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Hình</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>SL</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Chọn trạng thái</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => (
                  <TableRow
                    key={p.id}
                    className={`hover:bg-muted/50 transition-colors ${
                      p.status === "inactive" ? "opacity-50" : ""
                    }`}
                  >
                    <TableCell>
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        width={50}
                        height={50}
                        className="object-cover rounded"
                        onError={(e) =>
                          (e.currentTarget.src = "/placeholder.svg")
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>{p.price}</TableCell>
                    <TableCell>{p.quantity}</TableCell>
                    <TableCell>{renderStatusBadge(p.status)}</TableCell>
                    <TableCell>
                      <Select
                        value={p.status}
                        onValueChange={(value) =>
                          handleChangeStatus(p.id, value as ProductStatus)
                        }
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
                    <TableCell className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(p)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                className={`border rounded-lg p-4 shadow-sm hover:shadow transition ${
                  p.status === "inactive" ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-4 mb-2">
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    width={50}
                    height={50}
                    className="object-cover rounded"
                    onError={(e) =>
                      (e.currentTarget.src = "/placeholder.svg")
                    }
                  />
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-gray-600">{p.category}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p>Giá: {p.price}</p>
                  <p>Số lượng: {p.quantity}</p>
                  <div className="mt-1">{renderStatusBadge(p.status)}</div>
                  <div className="mt-2">
                    <Select
                      value={p.status}
                      onValueChange={(value) =>
                        handleChangeStatus(p.id, value as ProductStatus)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Còn hàng</SelectItem>
                        <SelectItem value="inactive">Tạm hết hàng</SelectItem>
                        <SelectItem value="disabled">Ẩn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => handleEdit(p)}>
                    <Edit className="w-4 h-4 mr-1" /> Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
