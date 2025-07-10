"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Share2, Bell, ExternalLink } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  imageUrl: string
  price?: number
  category?: string
  featured?: boolean
  link?: string
  quantity?: number
  size?: string
}

export default function BioPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const productsCollection = collection(db, "products")
      const productsSnapshot = await getDocs(productsCollection)
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]
      setProducts(productsData)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Không thể tải sản phẩm. Hiển thị dữ liệu mẫu.")
      // Fallback mock data
      setProducts([
        {
          id: "1",
          name: "Dép mẫu 1",
          description: "Dép thời trang cao cấp, phù hợp mọi dịp.",
          imageUrl: "/placeholder.svg?height=80&width=80",
          price: 250000,
          category: "Thời trang",
          featured: true,
          quantity: 10,
          link: "https://example.com/product1",
        },
        {
          id: "2",
          name: "Dép mẫu 2",
          description: "Dép thoải mái cho mùa hè.",
          imageUrl: "/placeholder.svg?height=80&width=80",
          price: 150000,
          category: "Thoải mái",
          quantity: 20,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
   <div className="min-h-screen relative overflow-hidden bg-white">

      {/* Background with soft gradient overlay */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/profile-bg.jpg" alt="Background" fill className="object-cover opacity-30" priority />
        <div ></div>
      </div>

      {/* Top buttons */}
      {/* <div className="relative z-10 flex justify-between items-center p-4 sm:p-6 lg:p-8">
        <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-purple-700 rounded-full px-3 sm:px-4 text-xs sm:text-sm shadow-lg border border-purple-200">
          <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Subscribe</span>
        </Button>
        <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-purple-700 rounded-full p-2 shadow-lg border border-purple-200">
          <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
        </Button>
      </div> */}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-8 max-w-4xl mx-auto">
        {/* Profile section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white shadow-xl">
            <Image
              src="/images/logo.jpg"
              alt="Profile"
              width={112}
              height={112}
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-gray-800 text-lg sm:text-xl lg:text-2xl font-semibold mb-4 px-2">Tiệm dép Cherish 🧚🏻‍♀️</h1>

          {/* Social icons */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Link href="https://www.instagram.com/tiemdepcherish?igsh=MXd0NXp4dGRod2Rldw==" className="text-pink-600 hover:text-pink-800 transition-colors p-2 sm:p-3 bg-white/70 rounded-full shadow-md" aria-label="Instagram">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </Link>
            <Link href="https://www.instagram.com/tiemdepcherish?igsh=MXd0NXp4dGRod2Rldw==" className="text-purple-600 hover:text-purple-800 transition-colors p-2 sm:p-3 bg-white/70 rounded-full shadow-md" aria-label="TikTok">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-2.54v5.79a3.07 3.07 0 0 1-3.07 3.07 3.07 3.07 0 0 1-3.07-3.07V2H5.6v5.79a4.83 4.83 0 0 1-3.77 4.25 4.83 4.83 0 0 1 3.77 4.25V22h2.54v-5.79a3.07 3.07 0 0 1 3.07-3.07 3.07 3.07 0 0 1 3.07 3.07V22h2.54v-5.79a4.83 4.83 0 0 1 3.77-4.25z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full max-w-md lg:max-w-lg mb-4">
            <Card className="bg-red-50 border-red-200 shadow-lg">
              <CardContent className="p-3 sm:p-4 text-center text-red-700 text-sm">{error}</CardContent>
            </Card>
          </div>
        )}

        {/* Products grid */}
        <div className="w-full max-w-md lg:max-w-2xl xl:max-w-3xl">
          {loading ? (
            <div className="text-center text-gray-600 py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
              <span className="text-sm sm:text-base">Đang tải...</span>
            </div>
          ) : products.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-md border-purple-200 shadow-lg">
              <CardContent className="p-4 sm:p-6 text-center">
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Chưa có sản phẩm nào</p>
                <Link href="/admin">
                  <Button variant="secondary" size="sm" className="bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm">
                    Thêm sản phẩm
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={product.link || "#"}
                  className={`block ${!product.link ? "pointer-events-none" : ""}`}
                >
                  <Card
                    className={`overflow-hidden transition-all hover:scale-105 hover:shadow-xl ${
                      index % 2 === 0
                        ? "bg-white/95 backdrop-blur-md text-gray-800 border-purple-200 shadow-lg"
                        : "bg-gradient-to-r from-purple-100 to-pink-100 backdrop-blur-md text-gray-800 border-purple-300 shadow-lg"
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center">
                        {/* Product image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0">
                          <Image
                            src={product.imageUrl || "/placeholder.svg?height=80&width=80"}
                            alt={product.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover rounded-l-lg"
                          />
                        </div>

                        {/* Product info */}
                        <div className="flex-1 p-3 sm:p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-xs sm:text-sm lg:text-base mb-1 line-clamp-1 text-gray-800">{product.name}</h3>
                              <p className="text-xs sm:text-sm mb-2 line-clamp-2 text-gray-600">
                                {product.description}
                              </p>

                              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                {product.price && (
                                  <span className="text-xs sm:text-sm font-bold text-purple-700">{product.price.toLocaleString("vi-VN")}đ</span>
                                )}
                                {product.quantity !== undefined && (
                                  <span className="text-xs sm:text-sm font-bold text-blue-700">SL: {product.quantity}</span>
                                )}
                                {product.featured && (
                                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-1 sm:px-2 py-0 shadow-md">Bán Chạy</Badge>
                                )}
                                {product.category && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1 sm:px-2 py-0 border-purple-300 text-purple-700 bg-white/50"
                                  >
                                    {product.category}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {product.link && <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-2 text-purple-500 flex-shrink-0" />}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Admin link */}
        {/* <div className="mt-8">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="bg-white/70 border-purple-300 text-purple-700 hover:bg-white/90">
              Quản lý sản phẩm
            </Button>
          </Link>
        </div> */}
      </div>

      {/* Beacons watermark */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 text-xs text-gray-700 flex items-center gap-1 shadow-lg">
          <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
          <span className="hidden sm:inline">Powered by Cherish</span>
          <span className="sm:hidden">Cherish</span>
        </div>
      </div>
    </div>
  )
}