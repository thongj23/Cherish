"use client"

import { ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import type { ProductStatus } from "@/types/product/product"

import { ProductStatusBadge } from "./ProductStatusBadge"

const STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Còn hàng",
  inactive: "Tạm hết hàng",
  disabled: "Ẩn",
}

interface ProductStatusControlProps {
  status?: ProductStatus
  onChange: (status: ProductStatus) => void
  fullWidthTrigger?: boolean
  className?: string
}

export function ProductStatusControl({
  status,
  onChange,
  fullWidthTrigger = false,
  className,
}: ProductStatusControlProps) {
  const currentStatus = status ?? "active"

  const handleStatusChange = (value: string) => {
    onChange(value as ProductStatus)
  }

  return (
    <div className={cn("flex items-center gap-2", fullWidthTrigger && "w-full", className)}>
      <ProductStatusBadge status={status} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 text-xs font-medium",
              fullWidthTrigger ? "w-full justify-between" : "justify-between",
            )}
          >
            <span>Cập nhật</span>
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Chọn trạng thái</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={currentStatus} onValueChange={handleStatusChange}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <DropdownMenuRadioItem key={value} value={value}>
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
