"use client"

import Image from "next/image"
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
      </div>
    </section>
  )
}
