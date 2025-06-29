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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with blur effect */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/profile-bg.jpg" alt="Background" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>

      {/* Top buttons */}
      <div className="relative z-10 flex justify-between items-center p-4">
        <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-black rounded-full px-4">
          <Bell className="w-4 h-4 mr-2" />
          Subscribe
        </Button>
        <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-black rounded-full p-2">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4 pb-8">
        {/* Profile section */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white/20">
            <Image
              src="/images/logo.jpg"
              alt="Profile"
              width={96}
              height={96}
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-white text-xl font-semibold mb-4">Tiệm dép Cherish 🧚🏻‍♀️</h1>

          {/* Social icons */}
          {/* TODO: Replace '#' with actual social media URLs (e.g., Instagram, TikTok) */}
          <div className="flex justify-center gap-4 mb-8">
            <Link href="https://www.instagram.com/tiemdepcherish?igsh=MXd0NXp4dGRod2Rldw==" className="text-white hover:text-gray-300" aria-label="Instagram">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </Link>
            <Link href="https://www.instagram.com/tiemdepcherish?igsh=MXd0NXp4dGRod2Rldw==" className="text-white hover:text-gray-300" aria-label="TikTok">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-2.54v5.79a3.07 3.07 0 0 1-3.07 3.07 3.07 3.07 0 0 1-3.07-3.07V2H5.6v5.79a4.83 4.83 0 0 1-3.77 4.25 4.83 4.83 0 0 1 3.77 4.25V22h2.54v-5.79a3.07 3.07 0 0 1 3.07-3.07 3.07 3.07 0 0 1 3.07 3.07V22h2.54v-5.79a4.83 4.83 0 0 1 3.77-4.25z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full max-w-md mb-4">
            <Card className="bg-red-500/20 border-red-500/50">
              <CardContent className="p-4 text-center text-red-200">{error}</CardContent>
            </Card>
          </div>
        )}

        {/* Products grid */}
        <div className="w-full max-w-md space-y-4">
          {loading ? (
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              Đang tải...
            </div>
          ) : products.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6 text-center">
                <p className="text-white mb-4">Chưa có sản phẩm nào</p>
                <Link href="/admin">
                  <Button variant="secondary" size="sm">
                    Thêm sản phẩm
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            products.map((product, index) => (
              <Link
                key={product.id}
                href={product.link || "#"}
                className={`block ${!product.link ? "pointer-events-none" : ""}`}
              >
                <Card
                  className={`overflow-hidden border-white/20 transition-all hover:scale-105 ${
                    index % 2 === 0
                      ? "bg-white/95 backdrop-blur-md text-black"
                      : "bg-black/80 backdrop-blur-md text-white border-white/30"
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center">
                      {/* Product image */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <Image
                          src={product.imageUrl || "/placeholder.svg?height=80&width=80"}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product info */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
                            <p
                              className={`text-xs mb-2 line-clamp-2 ${
                                index % 2 === 0 ? "text-gray-600" : "text-gray-300"
                              }`}
                            >
                              {product.description}
                            </p>

                            <div className="flex items-center gap-2 flex-wrap">
                              {product.price && (
                                <span className="text-sm font-bold">{product.price.toLocaleString("vi-VN")}đ</span>
                              )}
                              {product.quantity !== undefined && (
                                <span className="text-sm font-bold">SL: {product.quantity}</span>
                              )}
                              {product.featured && (
                                <Badge className="bg-yellow-500 text-white text-xs px-2 py-0">Bán Chạy</Badge>
                              )}
                              {product.category && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs px-2 py-0 ${
                                    index % 2 === 0 ? "border-gray-600 text-gray-600" : "border-white/50 text-white"
                                  }`}
                                >
                                  {product.category}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {product.link && <ExternalLink className="w-4 h-4 ml-2 opacity-60" />}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Admin link */}
        {/* <div className="mt-8">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              Quản lý sản phẩm
            </Button>
          </Link>
        </div> */}
      </div>

      {/* Beacons watermark */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-gray-700 flex items-center gap-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          Powered by Cherish
        </div>
      </div>
    </div>
  )
}