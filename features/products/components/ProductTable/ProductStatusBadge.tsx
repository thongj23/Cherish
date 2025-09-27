import { Badge } from "@/components/ui/badge"

import type { ProductStatus } from "@/types/product/product"

interface ProductStatusBadgeProps {
  status?: ProductStatus
}

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
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
