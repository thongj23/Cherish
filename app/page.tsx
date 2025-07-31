"use client"

import { useState, useEffect } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import ProfileSection from "@/components/bio/ProfileSection"
import SocialLinks from "@/components/bio/SocialLinks"
import ProductGrid from "@/components/bio/ProductGrid"
import { Product } from "@/types/product/product"
import { ArrowUp } from "lucide-react" // icon từ lucide-react (đã tích hợp trong shadcn)

export default function BioPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    fetchProducts()

    // Theo dõi scroll để hiển thị nút
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const fetchProducts = async () => {
    try {
      const productsCollection = collection(db, "products")
      const snapshot = await getDocs(productsCollection)

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]

      const visibleProducts = data.filter(
        (p) => p.status === "active" || p.status === "inactive"
      )

      setProducts(visibleProducts)
    } catch (error) {
      console.error(error)
      setError("Không thể tải sản phẩm. Hiển thị dữ liệu mẫu.")
      setProducts([
        {
          id: "1",
          name: "Dép mẫu 1",
          description: "Mẫu fallback",
          imageUrl: "/placeholder.svg",
          price: 100000,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0 
        bg-[url('/images/bg02.jpg')] 
        bg-cover bg-center bg-no-repeat opacity-80"></div>

      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-8 max-w-4xl mx-auto">
        <ProfileSection />
        <SocialLinks />
        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}
        <ProductGrid products={products} loading={loading} />
      </div>

      {/* ✅ Nút scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-white text-black p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
