import { Skeleton } from "@/components/ui/skeleton"

interface ProductTableSkeletonProps {
  rows?: number
}

export function ProductTableSkeleton({ rows = 6 }: ProductTableSkeletonProps) {
  return (
    <div className="rounded-lg border overflow-hidden bg-white">
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
