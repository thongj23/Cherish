"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

import { Home, ShoppingCart, LogOut, BarChart3 } from "lucide-react"

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
          <Button
            asChild
            variant={pathname === "/admin" ? "default" : "outline"}
            className={cn(pathname === "/admin" && "font-semibold")}
          >
            <Link href="/admin" prefetch={false}>
              <Home className="w-4 h-4 mr-2" />
              Trang chủ
            </Link>
          </Button>

          {/* Thống kê */}
          <Button
            asChild
            variant={pathname.startsWith("/admin/stats") ? "default" : "outline"}
            className={cn(pathname.startsWith("/admin/stats") && "font-semibold")}
          >
            <Link href="/admin/stats" prefetch={false}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Thống kê
            </Link>
          </Button>


          {/* Đơn hàng (1 trang) */}
          <Button
            asChild
            variant={
              pathname.startsWith("/admin/order") ? "default" : "outline"
            }
          >
            <Link href="/admin/order" prefetch={false}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Đơn hàng
            </Link>
          </Button>

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
