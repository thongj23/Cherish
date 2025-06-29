"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import AdminPage from "./AdminPage"

export default function AdminWrapper() {
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

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn")
    setIsAuthenticated(false)
  }

  if (isAuthenticated) {
    return <AdminPage onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-bold">Nhập mật khẩu để vào trang quản trị</h1>
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
