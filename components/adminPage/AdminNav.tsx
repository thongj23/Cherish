"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ReceiptText, Home, ShoppingCart, LogOut, BarChart3, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn")
    router.push("/admin") 
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

         

          {/* Đơn hàng */}
          <Link href="/admin/order">
            <Button
              variant={pathname.startsWith("/admin/order") ? "default" : "outline"}
              className={cn("transition-all", pathname.startsWith("/admin/order") && "font-semibold")}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Đơn hàng
            </Button>
          </Link>

          {/* Feedback */}
          <Link href="/admin/feedback">
            <Button
              variant={pathname.startsWith("/admin/feedback") ? "default" : "outline"}
              className={cn("transition-all", pathname.startsWith("/admin/feedback") && "font-semibold")}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Feedback
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
