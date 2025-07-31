"use client"

import ProductTable from "@/components/adminPage/ProductTable"
import AdminHeader from "@/components/adminPage/AdminHeader"
import ProductFormDialog from "@/components/adminPage/ProductFormDialog"
import useAdminProducts from "@/hooks/useAdminProducts"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

export default function AdminPage() {
  const {
    products,
    loading,
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

  return (
    <div className="space-y-6">
      {/* Header quản lý sản phẩm */}
      <AdminHeader onAddProduct={() => handleEdit(null)} onViewImages={openImageModal} productCount={products.length} />

      {/* Bảng sản phẩm */}
      <ProductTable
        products={products}
        loading={loading}
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
