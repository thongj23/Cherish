import Image from "next/image"
import { ArrowUpDown, Edit, Star, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import type { Product, ProductStatus } from "@/types/product/product"

import type { ProductSortKey } from "./useProductTableState"
import { ProductStatusControl } from "./ProductStatusControl"

interface ProductTableDesktopProps {
  products: Product[]
  sortKey: ProductSortKey
  sortDir: "asc" | "desc"
  onRequestSort: (key: Exclude<ProductSortKey, null>) => void
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onChangeStatus: (id: string, status: ProductStatus) => void
}

export function ProductTableDesktop({
  products,
  sortKey,
  sortDir,
  onRequestSort,
  onEdit,
  onDelete,
  onChangeStatus,
}: ProductTableDesktopProps) {
  const handleSort = (key: Exclude<ProductSortKey, null>) => () => onRequestSort(key)

  return (
    <div className="hidden sm:block rounded-lg border overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <TableRow>
            <TableHead className="w-[80px]">Hình</TableHead>
            <TableHead>
              <button className="inline-flex items-center gap-1 hover:underline" onClick={handleSort("name")}>
                Tên <SortIcon active={sortKey === "name"} direction={sortDir} />
              </button>
            </TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Danh mục phụ</TableHead>
            <TableHead>
              <button className="inline-flex items-center gap-1 hover:underline" onClick={handleSort("price")}>
                Giá <SortIcon active={sortKey === "price"} direction={sortDir} />
              </button>
            </TableHead>
            <TableHead>SL</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className={`group hover:bg-gray-50 transition-colors odd:bg-gray-50/40 border-l-4 ${
                product.featured ? "border-amber-300" : "border-transparent"
              } ${product.status === "inactive" ? "opacity-60" : ""} ${
                product.status === "disabled" ? "opacity-40" : ""
              }`}
            >
              <TableCell>
                <div className="relative w-12 h-12 rounded-lg overflow-hidden ring-1 ring-gray-200">
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    onError={(event) => {
                      event.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium max-w-[260px]">
                <div className="flex items-start gap-1">
                  {product.featured && <Star className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />}
                  <div className="truncate text-gray-900">{product.name}</div>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.featured && (
                    <Badge variant="secondary" className="text-[10px] py-0">
                      Nổi bật
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{product.category}</Badge>
              </TableCell>
              <TableCell>
                {product.subCategory ? (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    {product.subCategory}
                  </Badge>
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </TableCell>
              <TableCell className="font-medium">{product.price?.toLocaleString()}đ</TableCell>
              <TableCell>{product.quantity}</TableCell>
              <TableCell>{product.size}</TableCell>
              <TableCell>
                <ProductStatusControl status={product.status} onChange={(value) => onChangeStatus(product.id, value)} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(product)} className="h-8 w-8">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(product.id)}
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
  )
}

interface SortIconProps {
  active: boolean
  direction: "asc" | "desc"
}

function SortIcon({ active, direction }: SortIconProps) {
  return (
    <ArrowUpDown
      className={`w-3.5 h-3.5 opacity-70 transition-transform ${
        active ? (direction === "asc" ? "rotate-0" : "rotate-180") : "opacity-40"
      }`}
    />
  )
}
