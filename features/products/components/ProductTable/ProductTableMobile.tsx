import Image from "next/image"
import { Edit, Star, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { Product, ProductStatus } from "@/types/product/product"

import { ProductStatusControl } from "./ProductStatusControl"

interface ProductTableMobileProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onChangeStatus: (id: string, status: ProductStatus) => void
}

export function ProductTableMobile({ products, onEdit, onDelete, onChangeStatus }: ProductTableMobileProps) {
  return (
    <div className="sm:hidden space-y-4">
      {products.map((product) => {
        const categoryLabel = product.category?.trim() ?? ""
        const subCategoryLabel = product.subCategory?.trim() ?? ""
        const priceLabel =
          product.price != null ? `${product.price.toLocaleString()}đ` : "-"

        return (
          <div
            key={product.id}
            className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
              product.status === "inactive" ? "opacity-60" : ""
            } ${product.status === "disabled" ? "opacity-40" : ""}`}
          >
          <div className="flex items-start gap-3 mb-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
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
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-1">
                {product.featured && <Star className="w-4 h-4 mt-0.5 text-amber-500" />}
                <h3 className="font-semibold truncate">{product.name}</h3>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge
                  variant="outline"
                  className={`text-xs ${categoryLabel ? "" : "border-dashed text-gray-400"}`}
                >
                  {categoryLabel || "Chưa phân loại"}
                </Badge>
                {subCategoryLabel && (
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                    {subCategoryLabel}
                  </Badge>
                )}
                {product.featured && (
                  <Badge variant="secondary" className="text-xs">
                    Nổi bật
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              Giá: <span className="font-medium">{priceLabel}</span>
            </div>
            <div>
              SL: <span className="font-medium">{product.quantity ?? "-"}</span>
            </div>
            <div>
              Size: <span className="font-medium">{product.size ?? "-"}</span>
            </div>
            <ProductStatusControl
              status={product.status}
              onChange={(value) => onChangeStatus(product.id, value)}
              fullWidthTrigger
              className="col-span-2"
            />
          </div>

          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(product)} className="flex-1">
              <Edit className="w-4 h-4 mr-1" /> Sửa
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(product.id)}
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Xóa
            </Button>
          </div>
          </div>
        )
      })}
    </div>
  )
}
