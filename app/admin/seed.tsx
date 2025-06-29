"use client"

import { useState } from "react"
import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Database, Trash2 } from "lucide-react"
import Link from "next/link"

const mockProducts = [
  {
    name: "Xịt tạo phồng tóc LagoonHairTonic",
    description:
      "Xịt tạo phồng tóc chuyên nghiệp, giúp tóc bồng bềnh tự nhiên suốt cả ngày. Công thức không gây bết dính.",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
    price: 299000,
    category: "Chăm sóc tóc",
    featured: true,
  },
  {
    name: "Serum dưỡng tóc Argan Oil",
    description: "Serum phục hồi tóc hư tổn với tinh dầu Argan Morocco. Giúp tóc mềm mượt, bóng khỏe từ gốc đến ngọn.",
    imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop",
    price: 450000,
    category: "Chăm sóc tóc",
    featured: true,
  },
  {
    name: "Dầu gội phục hồi tóc hư tổn",
    description:
      "Dầu gội chuyên sâu cho tóc khô xơ, hư tổn. Chứa keratin và protein tự nhiên giúp phục hồi cấu trúc tóc.",
    imageUrl: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop",
    price: 180000,
    category: "Chăm sóc tóc",
    featured: false,
  },
  {
    name: "Mặt nạ dưỡng ẩm Hyaluronic Acid",
    description: "Mặt nạ giấy cấp ẩm tức thì với Hyaluronic Acid. Giúp da căng mịn, tươi trẻ chỉ sau 15 phút.",
    imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop",
    price: 25000,
    category: "Chăm sóc da",
    featured: false,
  },
  {
    name: "Kem chống nắng SPF 50+ PA+++",
    description: "Kem chống nắng phổ rộng, bảo vệ da khỏi tia UV. Công thức nhẹ tênh, không gây nhờn rít.",
    imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop",
    price: 320000,
    category: "Chăm sóc da",
    featured: true,
  },
  {
    name: "Toner cân bằng pH Rose Water",
    description: "Nước hoa hồng tự nhiên giúp cân bằng độ pH, se khít lỗ chân lông và cấp ẩm cho da.",
    imageUrl: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&h=400&fit=crop",
    price: 150000,
    category: "Chăm sóc da",
    featured: false,
  },
  {
    name: "Tinh chất dưỡng mi Lash Serum",
    description: "Tinh chất kích thích mọc mi, giúp mi dài và dày tự nhiên. Công thức an toàn cho vùng mắt nhạy cảm.",
    imageUrl: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=400&h=400&fit=crop",
    price: 680000,
    category: "Trang điểm",
    featured: true,
  },
  {
    name: "Son dưỡng có màu Berry Tint",
    description: "Son dưỡng có màu tự nhiên, lâu trôi. Công thức dưỡng ẩm giúp môi mềm mịn suốt ngày dài.",
    imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
    price: 120000,
    category: "Trang điểm",
    featured: false,
  },
]

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
const handleSeedData = async () => {
  setLoading(true)
  setMessage("")

  try {
    // Clear existing products
    const productsCollection = collection(db, "products")
    const snapshot = await getDocs(productsCollection)

    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    // Add new products
    for (const product of mockProducts) {
      await addDoc(productsCollection, {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    setMessage(`✅ Đã thêm ${mockProducts.length} sản phẩm thành công!`)
  } catch (error) {
    console.error("Error seeding data:", error)
    const err = error as Error
    setMessage(`❌ Lỗi: ${err.message}`)
  } finally {
    setLoading(false)
  }
}

const handleClearData = async () => {
  if (!confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm?")) return

  setLoading(true)
  setMessage("")

  try {
    const productsCollection = collection(db, "products")
    const snapshot = await getDocs(productsCollection)

    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    setMessage(`✅ Đã xóa ${snapshot.docs.length} sản phẩm`)
  } catch (error) {
    console.error("Error clearing data:", error)
    const err = error as Error
    setMessage(`❌ Lỗi: ${err.message}`)
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seed Database</h1>
            <p className="text-gray-600">Quản lý dữ liệu mẫu cho ứng dụng</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Quản lý dữ liệu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Đổ dữ liệu mẫu</h3>
              <p className="text-sm text-gray-600 mb-4">
                Thêm {mockProducts.length} sản phẩm mẫu vào database. Điều này sẽ xóa tất cả dữ liệu hiện tại.
              </p>
              <Button onClick={handleSeedData} disabled={loading} className="w-full">
                {loading ? "Đang xử lý..." : "Đổ Mock Data"}
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2 text-red-600">Xóa tất cả dữ liệu</h3>
              <p className="text-sm text-gray-600 mb-4">node scripts/seedAdmin.js

                Xóa toàn bộ sản phẩm trong database. Hành động này không thể hoàn tác.
              </p>
              <Button onClick={handleClearData} disabled={loading} variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                {loading ? "Đang xóa..." : "Xóa tất cả"}
              </Button>
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.includes("✅")
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách sản phẩm mẫu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({product.category})</span>
                    </div>
                    <div className="text-sm">
                      {product.price?.toLocaleString("vi-VN")}đ
                      {product.featured && <span className="ml-2 text-yellow-600">⭐</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
  const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD