"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"

type Feedback = {
  id: string
  url: string
  caption?: string | null
  active?: boolean
}

export default function FeedbackGallery() {
  const [items, setItems] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const currentIndexRef = useRef(0)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<HTMLDivElement[]>([])
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((i: number) => {
    const container = viewportRef.current
    if (!container || items.length === 0) return
    const clamped = ((i % items.length) + items.length) % items.length
    setIndex(clamped)
    const target = itemRefs.current[clamped]
    if (target) {
      container.scrollTo({ left: target.offsetLeft - 12, behavior: 'smooth' })
    }
  }, [items.length])

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current || items.length < 2) return
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduce) return
    autoplayRef.current = setInterval(() => {
      const next = currentIndexRef.current + 1
      goTo(next)
    }, 4000)
  }, [items.length, goTo])

  useEffect(() => {
    startAutoplay()
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
        autoplayRef.current = null
      }
    }
  }, [startAutoplay])

  useEffect(() => {
    currentIndexRef.current = index
  }, [index])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const qRef = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"))
        const snap = await getDocs(qRef)
        if (cancelled) return
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Feedback[]
        setItems(list.filter((f) => f.active !== false && f.url))
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading && items.length === 0) return null
  if (items.length === 0) return null

  return (
    <section className="w-full mt-6">
      <h2 className="text-xl font-semibold text-white/95 drop-shadow mb-3 text-center">
        Feedback khách hàng
      </h2>

      <div className="relative">
        {/* gradient fades */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-8 sm:w-10 bg-gradient-to-r from-white/70 to-transparent z-10 rounded-l-xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 sm:w-10 bg-gradient-to-l from-white/70 to-transparent z-10 rounded-r-xl" />

        <div
          ref={viewportRef}
          className="relative w-full overflow-x-auto scroll-smooth"
          onMouseEnter={() => { if (autoplayRef.current) { clearInterval(autoplayRef.current) ; autoplayRef.current = null } }}
          onMouseLeave={() => { if (!autoplayRef.current && items.length > 1) startAutoplay() }}
          onScroll={() => {
            const el = viewportRef.current
            if (!el) return
            // find nearest item
            let nearest = 0
            let min = Number.POSITIVE_INFINITY
            itemRefs.current.forEach((node, idx) => {
              if (!node) return
              const delta = Math.abs(node.offsetLeft - el.scrollLeft)
              if (delta < min) { min = delta; nearest = idx }
            })
            setIndex(nearest)
          }}
        >
          <div className="flex gap-3 px-2">
            {items.map((f, i) => (
              <figure
                key={f.id}
                ref={(el) => { if (el) itemRefs.current[i] = el as HTMLDivElement }}
                className="shrink-0 min-w-[78%] sm:min-w-[56%] md:min-w-[40%] lg:min-w-[34%]"
              >
                <div className="relative w-full overflow-hidden rounded-2xl bg-white/80 border shadow-md hover:shadow-lg transition-shadow">
                  <div className="relative w-full aspect-[4/5]">
                    <Image
                      src={f.url || "/placeholder.svg"}
                      alt={f.caption || `feedback ${i+1}`}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                  {f.caption && (
                    <figcaption className="p-3 text-sm text-gray-800 bg-white/90 line-clamp-2">
                      {f.caption}
                    </figcaption>
                  )}
                </div>
              </figure>
            ))}
          </div>
        </div>

        {items.length > 1 && (
          <>
            <button
              aria-label="Trước"
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white/90 border shadow hover:bg-white"
              onClick={() => goTo(index - 1)}
            >
              ‹
            </button>
            <button
              aria-label="Sau"
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white/90 border shadow hover:bg-white"
              onClick={() => goTo(index + 1)}
            >
              ›
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1">
          {items.map((_, i) => (
            <span
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 w-6 rounded-full cursor-pointer transition-colors ${i === index ? 'bg-purple-600' : 'bg-gray-300/70'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
