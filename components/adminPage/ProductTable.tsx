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
import { Edit, Trash2, Eye, EyeOff, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Product } from "@/types/product/product"

interface ProductTableProps {
  products: Product[]
  loading: boolean
  handleEdit: (product: Product | null) => void
  handleDelete: (id: string) => void
  handleToggleHidden: (id: string, isHidden: boolean) => void
}

export default function ProductTable({
  products,
  loading,
  handleEdit,
  handleDelete,
  handleToggleHidden,
}: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-xs"
        />
      </div>

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
                  <TableHead>Ẩn</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => (
                  <TableRow
                    key={p.id}
                    className="hover:bg-muted/50 transition-colors"
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
                    <TableCell>
                      {p.featured && <Badge className="mr-2">Nổi bật</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.isHidden ? "destructive" : "default"}>
                        {p.isHidden ? "Ẩn" : "Hiện"}
                      </Badge>
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
                      <Button
                        size="icon"
                        variant={p.isHidden ? "outline" : "secondary"}
                        onClick={() => handleToggleHidden(p.id, !p.isHidden)}
                      >
                        {p.isHidden ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
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
                className="border rounded-lg p-4 shadow-sm hover:shadow transition"
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
                  <p>
                    {p.featured && <Badge className="mt-1 mr-2">Nổi bật</Badge>}
                    <Badge
                      className="mt-1"
                      variant={p.isHidden ? "destructive" : "default"}
                    >
                      {p.isHidden ? "Ẩn" : "Hiện"}
                    </Badge>
                  </p>
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
                  <Button
                    size="sm"
                    variant={p.isHidden ? "outline" : "secondary"}
                    onClick={() => handleToggleHidden(p.id, !p.isHidden)}
                  >
                    {p.isHidden ? (
                      <Eye className="w-4 h-4 mr-1" />
                    ) : (
                      <EyeOff className="w-4 h-4 mr-1" />
                    )}
                    {p.isHidden ? "Hiện" : "Ẩn"}
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
