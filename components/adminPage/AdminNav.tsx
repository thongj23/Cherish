"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ReceiptText, Home, ShoppingCart, LogOut, QrCode, FilePlus, BarChart3 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn")
    router.push("/admin") // hoặc reload lại nếu cần: router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-gray-100 border-b shadow-sm py-3 px-4 mb-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-wrap items-center">
          {/* Trang chủ */}
          <Link href="/admin">
            <Button
              variant={pathname === "/admin" ? "default" : "outline"}
              className={cn("transition-all", pathname === "/admin" && "font-semibold")}
            >
              <Home className="w-4 h-4 mr-2" />
              Trang chủ
            </Button>
          </Link>

          {/* Thống kê */}
          <Link href="/admin/stats">
            <Button
              variant={pathname.startsWith("/admin/stats") ? "default" : "outline"}
              className={cn("transition-all", pathname.startsWith("/admin/stats") && "font-semibold")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Thống kê
            </Button>
          </Link>

          {/* Hóa đơn */}
          <Link href="/admin/invoice">
            <Button
              variant={pathname.startsWith("/admin/invoice") ? "default" : "outline"}
              className={cn("transition-all", pathname.startsWith("/admin/invoice") && "font-semibold")}
            >
              <ReceiptText className="w-4 h-4 mr-2" />
              Hóa đơn
            </Button>
          </Link>

          {/* Đơn hàng (gom nhóm) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={
                  pathname.startsWith("/admin/order") ||
                  pathname.startsWith("/order") ||
                  pathname.startsWith("/scan")
                    ? "default"
                    : "outline"
                }
                className="transition-all"
              >
                <ShoppingCart className="w-4 h-4 mr-2" /> Đơn hàng
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Đơn hàng</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); router.push("/admin/order") }}>
                <ShoppingCart className="w-4 h-4" />
                <span>Quản lý đơn</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); router.push("/order") }}>
                <FilePlus className="w-4 h-4" />
                <span>Tạo đơn</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); router.push("/scan") }}>
                <QrCode className="w-4 h-4" />
                <span>Quét QR</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Nút Đăng xuất */}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-1" />
          Đăng xuất
        </Button>
      </div>
    </nav>
  )
}
