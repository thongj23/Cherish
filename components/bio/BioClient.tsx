"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import ProfileSection from "@/components/bio/ProfileSection"
import SocialLinks from "@/components/bio/SocialLinks"
import FeedbackStrip from "@/components/bio/FeedbackStrip"
import ProductGrid from "@/components/bio/ProductGrid"
import type { Product } from "@/types/product/product"
import { ArrowUp } from "lucide-react"

type Props = {
  initialProducts: Product[]
}

export default function BioClient({ initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 600], [0, -60])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <div className="relative min-h-screen overflow-hidden">
      <motion.div
        style={{ y: bgY, scale: 1.03 }}
        className="absolute inset-0 z-0 bg-[url('/images/bg02.jpg')] bg-cover bg-center bg-no-repeat opacity-80 will-change-transform"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-8 max-w-4xl mx-auto"
      >
        <ProfileSection />
        <SocialLinks />
        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
        <ProductGrid products={products} loading={loading} />
        <FeedbackStrip />
      </motion.div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 bg-white text-black p-2 rounded-full shadow-lg hover:bg-gray-100 active:scale-95 transition"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
