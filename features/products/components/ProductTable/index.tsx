"use client"

import type { Product, ProductStatus } from "@/types/product/product"

import { useIsMobile } from "@/hooks/use-mobile"

import { ProductFilters } from "./ProductFilters"
import { ProductPagination } from "./ProductPagination"
import { ProductTableDesktop } from "./ProductTableDesktop"
import { ProductTableMobile } from "./ProductTableMobile"
import { ProductTableSkeleton } from "./ProductTableSkeleton"
import { useProductTableState } from "./useProductTableState"

interface ProductTableProps {
  products: Product[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  errorMessage?: string | null
  onLoadMore: () => void
  handleEdit: (product: Product | null) => void
  handleDelete: (id: string) => void
  handleChangeStatus: (id: string, status: ProductStatus) => void
}

export default function ProductTable({
  products,
  loading,
  loadingMore,
  hasMore,
  errorMessage,
  onLoadMore,
  handleEdit,
  handleDelete,
  handleChangeStatus,
}: ProductTableProps) {
  const isMobile = useIsMobile()
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    statusFilter,
    setStatusFilter,
    sortKey,
    sortDir,
    requestSort,
    page,
    setPage,
    totalPages,
    pagedProducts,
    categories,
    subCategories,
    filteredCount,
    statusCounts,
    resetFilters,
    isFiltered,
  } = useProductTableState(products)

  const hasResults = filteredCount > 0
  const showSubCategorySelect = selectedCategory !== "all" && subCategories.length > 1

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        subCategories={subCategories}
        selectedSubCategory={selectedSubCategory}
        onSubCategoryChange={setSelectedSubCategory}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onResetFilters={resetFilters}
        filteredCount={filteredCount}
        statusCounts={statusCounts}
        showSubCategorySelect={showSubCategorySelect}
        isFiltered={isFiltered}
      />

      {loading ? (
        <ProductTableSkeleton />
      ) : !hasResults ? (
        <div className="text-center py-8 bg-white rounded-lg border">
          <p className="text-gray-500">Không tìm thấy sản phẩm</p>
        </div>
      ) : (
        <>
          {isMobile ? (
            <ProductTableMobile
              products={pagedProducts}
              onEdit={(product) => handleEdit(product)}
              onDelete={handleDelete}
              onChangeStatus={handleChangeStatus}
            />
          ) : (
            <ProductTableDesktop
              products={pagedProducts}
              sortKey={sortKey}
              sortDir={sortDir}
              onRequestSort={requestSort}
              onEdit={(product) => handleEdit(product)}
              onDelete={handleDelete}
              onChangeStatus={handleChangeStatus}
            />
          )}

          <ProductPagination page={page} totalPages={totalPages} onPageChange={setPage} />

          {hasMore && (
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-dashed border-purple-200 px-4 py-3 text-sm font-medium text-purple-600 transition hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingMore ? "Đang tải thêm sản phẩm..." : "Tải thêm sản phẩm"}
            </button>
          )}
        </>
      )}
    </div>
  )
}
