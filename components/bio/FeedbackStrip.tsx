"use client"

import Image from "next/image"

import useFeedbacks from "@/hooks/useFeedbacks"

export default function FeedbackStrip() {
  const { items, loading } = useFeedbacks(true)
  const visible = items.slice(0, 12)

  if (!loading && visible.length === 0) return null

  return (
    <section className="mt-6 w-full">
      <div className="mb-2 flex items-center justify-between px-1 text-white/90">
        <h2 className="text-base font-semibold">Phản hồi của khách hàng</h2>
        {visible.length > 0 && (
          <span className="text-xs text-white/60">{visible.length} ảnh</span>
        )}
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {loading && visible.length === 0
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`feedback-skeleton-${index}`}
                className="h-[220px] w-[160px] flex-shrink-0 animate-pulse rounded-lg bg-white/10"
              />
            ))
          : visible.map((fb) => (
              <figure
                key={fb.id}
                className="relative h-[220px] w-[160px] flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5"
              >
                <Image
                  src={fb.url || "/placeholder.svg"}
                  alt={fb.caption || "Ảnh feedback"}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
                {fb.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-black/40 px-2 py-1 text-xs text-white">
                    {fb.caption}
                  </figcaption>
                )}
              </figure>
            ))}
      </div>
    </section>
  )
}
