import { Button } from "@/components/ui/button"

interface ProductPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ProductPagination({ page, totalPages, onPageChange }: ProductPaginationProps) {
  const handlePrevious = () => onPageChange(page - 1)
  const handleNext = () => onPageChange(page + 1)

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
      <div>
        Trang {page}/{totalPages}
      </div>
      <div className="flex gap-4">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={handlePrevious}>
          Trước
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={handleNext}>
          Sau
        </Button>
      </div>
    </div>
  )
}
