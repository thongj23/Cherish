// ✅ file: app/admin/layout.tsx
import { ReactNode } from "react"
import AdminNav from "@/components/adminPage/AdminNav"
import AdminClientWrapper from "@/app/admin/AdminWrapper"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <AdminNav />
      <AdminClientWrapper>{children}</AdminClientWrapper>
    </div>
  )
}
