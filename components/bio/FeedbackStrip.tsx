"use client"

import Image from "next/image"
<<<<<<< HEAD
import useFeedbacks from "@/hooks/useFeedbacks"

export default function FeedbackStrip() {
  const { items } = useFeedbacks(true)
  if (!items.length) return null

  return (
    <section className="w-full mt-6">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-base font-semibold text-white/90">Phản hồi của khách hàng</h2>
        <span className="text-xs text-white/60">{items.length} ảnh</span>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {items.map((fb) => (
          <div
            key={fb.id}
            className="relative flex-shrink-0 w-[160px] h-[220px] rounded-lg overflow-hidden border border-white/10 bg-white/5"
          >
            <Image
              src={fb.url || "/placeholder.svg"}
              alt="Feedback"
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
        ))}
=======

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
>>>>>>> 7ef95b98a9c0752d40768608d344228214c855dc
      </div>
    </section>
  )
}
