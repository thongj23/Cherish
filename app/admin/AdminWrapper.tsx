"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import AdminPage from "./AdminPage"
// import AdminNav from "@/components/adminPage/AdminNav"

interface AdminWrapperProps {
  children: React.ReactNode
}

export default function AdminWrapper({ children }: AdminWrapperProps) {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn")
    if (isLoggedIn === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem("isAdminLoggedIn", "true")
        setIsAuthenticated(true)
      } else {
        alert("Sai mật khẩu!")
      }
    } catch (error) {
      console.error(error)
      alert("Lỗi server!")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-center">Nhập mật khẩu quản trị</h1>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang kiểm tra..." : "Xác nhận"}
          </Button>
        </form>
      </div>
    )
  }

  // ✅ Nếu đã đăng nhập thành công thì render children với AdminNav
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <AdminNav /> */}
      <main className="p-4">
        <AdminPage />
      </main>
    </div>
  )
}
