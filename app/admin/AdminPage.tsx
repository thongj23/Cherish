"use client"

import dynamic from "next/dynamic"
import Image from "next/image"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ProductManagementHeader from "@/features/products/components/ProductManagementHeader"
import ProductTable from "@/features/products/components/ProductTable"
import useAdminProducts from "@/features/products/hooks/useAdminProducts"

const ProductFormDialog = dynamic(
  () => import("@/features/products/components/ProductFormDialog"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-dashed border-purple-200 bg-white p-6 text-center text-sm text-purple-600">
        Đang tải biểu mẫu sản phẩm...
      </div>
    ),
  },
)

export default function AdminPage() {
  const {
    products,
    loading,
    loadingMore,
    hasMore,
    error,
    isDialogOpen,
    setIsDialogOpen,
    editingProduct,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleChangeStatus,
    isImageModalOpen,
    setIsImageModalOpen,
    selectedImages,
    openImageModal,
    loadMoreProducts,
  } = useAdminProducts()

  // Convert Product to ProductFormData for editing
  const getFormData = (product: any) => {
    if (!product) return undefined

    return {
      name: product.name || "",
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      price: product.price?.toString() || "",
      category: product.category || "",
      subCategory: product.subCategory || "", // ✅ Added missing subCategory field
      featured: product.featured || false,
      quantity: product.quantity?.toString() || "",
      size: product.size || 0,
      isHidden: product.status === "disabled",
    }
  }

  const activeCount = products.filter((p) => p.status === "active").length
  const inactiveCount = products.filter((p) => p.status === "inactive").length
  const disabledCount = products.filter((p) => p.status === "disabled").length

  return (
    <div className="space-y-6">
      {/* Header quản lý sản phẩm */}
      <ProductManagementHeader
        onAddProduct={() => handleEdit(null)}
        onViewImages={openImageModal}
        productCount={products.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        disabledCount={disabledCount}
      />

      {/* Bảng sản phẩm */}
      <ProductTable
        products={products}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        errorMessage={error}
        onLoadMore={loadMoreProducts}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleChangeStatus={handleChangeStatus}
      />

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={getFormData(editingProduct)}
        onSubmit={handleSubmit}
      />

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tất cả hình ảnh sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {selectedImages.map((imageUrl, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={`Product ${index + 1}`}
                  width={200}
                  height={200}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
