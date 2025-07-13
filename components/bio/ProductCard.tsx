"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Product } from "@/types/product/product"

export default function ProductCard({
  product,
  index,
}: {
  product: Product
  index: number
}) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  const isInactive = product.status === "inactive"

  return (
    <>
      {/* CARD */}
      <Card
        className={`overflow-hidden transition-all hover:scale-105 hover:shadow-xl
          ${
            index % 2 === 0
              ? "bg-white/95 backdrop-blur-md text-gray-800 border-purple-200 shadow-lg"
              : "bg-gradient-to-r from-purple-100 to-pink-100 backdrop-blur-md text-gray-800 border-purple-300 shadow-lg"
          }
          ${isInactive ? "opacity-50 grayscale" : ""}
        `}
      >
        <CardContent className="p-0">
          <div className="flex items-center">
            {/* Image */}
            <div
              onClick={() => {
                if (product.imageUrl && product.imageUrl !== "/placeholder.svg") {
                  setIsOpen(true)
                }
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0 cursor-zoom-in"
              role="button"
              aria-label={`Enlarge image of ${product.name}`}
            >
              <Image
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.name}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-l-lg"
                onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
              />
            </div>

            {/* Info */}
            <Link
              href={product.link || "#"}
              className={`flex-1 ${!product.link || isInactive ? "pointer-events-none" : ""}`}
              aria-label={`View details for ${product.name}`}
            >
              <div className="flex-1 p-3 sm:p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm lg:text-base mb-1 line-clamp-1 text-gray-800">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm mb-2 line-clamp-2 text-gray-600">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      {product.featured && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-1 sm:px-2 py-0 shadow-md">
                          Bán Chạy
                        </Badge>
                      )}
                      {product.category && (
                        <Badge
                          variant="outline"
                          className="text-xs px-1 sm:px-2 py-0 border-purple-300 text-purple-700 bg-white/50"
                        >
                          {product.category}
                        </Badge>
                      )}
                      {isInactive && (
                        <Badge
                          variant="outline"
                          className="text-xs px-1 sm:px-2 py-0 border-gray-400 text-gray-600 bg-white/70"
                        >
                          Tạm hết hàng
                        </Badge>
                      )}
                    </div>
                  </div>
                  {product.link && !isInactive && (
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-2 text-purple-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* MODAL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setIsOpen(false)}
            role="dialog"
            aria-label={`Enlarged image of ${product.name}`}
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl p-4 sm:p-6 md:p-8"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full"
                aria-label="Close image modal"
              >
                <X size={24} />
              </button>
              <Image
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.name}
                width={1200}
                height={800}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
