"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, ShoppingCart, LogOut, BarChart3, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkedAuth, setCheckedAuth] = useState(false)

  useEffect(() => {
    const syncAuthState = () => {
      const loggedIn = localStorage.getItem("isAdminLoggedIn") === "true"
      setIsAuthenticated(loggedIn)
      setCheckedAuth(true)
    }

    syncAuthState()
    window.addEventListener("admin-auth-change", syncAuthState)

    return () => {
      window.removeEventListener("admin-auth-change", syncAuthState)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn")
    setIsAuthenticated(false)
    window.dispatchEvent(new Event("admin-auth-change"))
    router.push("/admin")
  }

  if (!checkedAuth || !isAuthenticated) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 bg-gray-100 border-b shadow-sm py-3 px-4 mb-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-wrap items-center">
          <Link href="/admin">
            <Button
              size="sm"
              variant={pathname === "/admin" ? "default" : "outline"}
              className={cn("transition-all", pathname === "/admin" && "font-semibold")}
            >
              <Home className="w-4 h-4 mr-2" />
              Trang chủ
            </Button>
          </Link>

          <Link href="/admin/stats">
            <Button
              size="sm"
              variant={pathname.startsWith("/admin/stats") ? "default" : "outline"}
              className={cn("transition-all", pathname.startsWith("/admin/stats") && "font-semibold")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Thống kê
            </Button>
          </Link>

          <Link href="/admin/order">
            <Button
              size="sm"
              variant={pathname.startsWith("/admin/order") ? "default" : "outline"}
              className={cn("transition-all", pathname.startsWith("/admin/order") && "font-semibold")}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Đơn hàng
            </Button>
          </Link>

          <Link href="/admin/feedback">
            <Button
              size="sm"
              variant={pathname.startsWith("/admin/feedback") ? "default" : "outline"}
              className={cn("transition-all", pathname.startsWith("/admin/feedback") && "font-semibold")}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Phản hồi
            </Button>
          </Link>
        </div>

        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-1" />
          Đăng xuất
        </Button>
      </div>
    </nav>
  )
}
