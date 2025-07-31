"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ReceiptText, Home, ShoppingCart, LogOut } from "lucide-react"
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
              variant={pathname === "/" ? "default" : "outline"}
              className={cn("transition-all", pathname === "/" && "font-semibold")}
            >
              <Home className="w-4 h-4 mr-2" />
              Trang chủ
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

          {/* Đặt hàng */}
          <Link href="/admin/order">
            <Button
              variant={pathname.startsWith("/admin/order") ? "default" : "outline"}
              className={cn("transition-all", pathname.startsWith("/admin/order") && "font-semibold")}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Đặt hàng
            </Button>
          </Link>
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
