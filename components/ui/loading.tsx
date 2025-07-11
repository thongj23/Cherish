"use client"

export default function Loading({ text = "Đang tải..." }: { text?: string }) {
  return (
    <div className="text-center text-gray-600 py-8">
      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
      <span className="text-sm sm:text-base">{text}</span>
    </div>
  )
}
