
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
      <span className="ml-3 text-lg font-medium text-gray-700">
        Đang tải...
      </span>
    </div>
  )
}
