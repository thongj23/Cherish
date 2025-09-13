"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Product } from "@/types/product/product"

const placeholder = "/placeholder.svg"

// Prefer original URL; let Next/Image optimize and avoid upscaling artifacts.
const getThumbnailSrc = (url: string) => {
  return url && url.trim().length > 0 ? url : placeholder
}

export default function ProductCard({
  product,
  index,
}: {
  product: Product
  index: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const glareRef = useRef<HTMLDivElement | null>(null)
  const frame = useRef<number | null>(null)
  const reduceMotion = useRef(false)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", handleEsc)
    try {
      reduceMotion.current = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {}
    return () => {
      window.removeEventListener("keydown", handleEsc)
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [])

  const isInactive = product.status === "inactive"
  const thumbnailUrl = getThumbnailSrc(product.imageUrl || "")
  const modalUrl = product.imageUrl || placeholder
  const [thumbSrc, setThumbSrc] = useState(thumbnailUrl)

  useEffect(() => {
    setThumbSrc(thumbnailUrl)
  }, [thumbnailUrl])

  const handleMove = (e: React.MouseEvent) => {
    if (reduceMotion.current) return
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rx = (0.5 - py) * 10 // deg
    const ry = (px - 0.5) * 12 // deg
    const gx = (px * 100).toFixed(2)
    const gy = (py * 100).toFixed(2)
    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`
      el.style.transition = 'transform 50ms linear'
      const g = glareRef.current
      if (g) {
        g.style.opacity = '0.55'
        g.style.background = `radial-gradient(600px circle at ${gx}% ${gy}%, rgba(255,255,255,0.35), rgba(255,255,255,0.08) 40%, transparent 60%)`
      }
    })
  }

  const handleEnter = () => {
    if (reduceMotion.current) return
    const el = cardRef.current
    if (!el) return
    el.style.willChange = 'transform'
  }

  const handleLeave = () => {
    const el = cardRef.current
    if (!el) return
    if (frame.current) cancelAnimationFrame(frame.current)
    el.style.transition = 'transform 300ms ease'
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
    const g = glareRef.current
    if (g) g.style.opacity = '0'
  }

  return (
    <>
      {/* CARD */}
      <Card
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={`relative overflow-hidden transition-transform duration-300 md:hover:shadow-2xl
          ${index % 2 === 0
            ? "bg-white/95 backdrop-blur-md text-gray-800 border-purple-200 shadow-lg"
            : "bg-gradient-to-r from-purple-100 to-pink-100 backdrop-blur-md text-gray-800 border-purple-300 shadow-lg"}
          ${isInactive ? "opacity-50 grayscale" : ""}
        `}
      >
        {/* glare overlay */}
        <div ref={glareRef} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 mix-blend-screen" />
        <CardContent className="p-0">
          <div className="flex items-center">
            {/* Thumbnail */}
            <div
              onClick={() => {
                if (modalUrl !== placeholder) setIsOpen(true)
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0 cursor-zoom-in overflow-hidden rounded-lg ring-1 ring-purple-200 hover:ring-2"
              role="button"
              aria-label={`Xem ảnh ${product.name}`}
            >
              <Image
                src={thumbSrc}
                alt={product.name}
                width={96}
                height={96}
                sizes="(min-width: 1024px) 6rem, (min-width: 640px) 5rem, 4rem"
                className="w-full h-full object-cover"
                loading="lazy"
                quality={85}
                placeholder="blur"
                blurDataURL={placeholder}
                onError={() => setThumbSrc(placeholder)}
              />
            </div>

            {/* Info */}
            <Link
              href={product.link || "#"}
              className={`flex-1 ${!product.link || isInactive ? "pointer-events-none" : ""}`}
              aria-label={`Xem chi tiết ${product.name}`}
              target={product.link ? "_blank" : undefined}
              rel={product.link ? "noopener noreferrer" : undefined}
            >
              <div className="flex-1 p-3 sm:p-4 min-h-[88px]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm lg:text-base mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm mb-2 line-clamp-2 text-gray-600">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      {product.featured && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-0 shadow-sm uppercase tracking-wide">
                          Bán Chạy
                        </Badge>
                      )}
                      {product.category && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0 border-purple-300 text-purple-700 bg-white/50 uppercase tracking-wide"
                        >
                          {product.category}
                        </Badge>
                      )}
                      {isInactive && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0 border-gray-400 text-gray-600 bg-white/70"
                        >
                          Tạm hết hàng
                        </Badge>
                      )}
                    </div>
                  </div>
                  {product.link && !isInactive && (
                    <ExternalLink className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
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
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-5xl p-4 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full"
                aria-label="Đóng ảnh"
              >
                <X size={28} />
              </button>
              <Image
                src={modalUrl}
                alt={product.name}
                width={1200}
                height={800}
                sizes="100vw"
                className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl"
                quality={90}
                priority={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
