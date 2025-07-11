
"use client"

import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ProductFormDialog from "@/components/adminPage/ProductFormDialog"
import TableImg from "@/components/adminPage/TableImg"
import useAdminProducts from "@/hooks/useAdminProducts"
import ProductTable from "@/components/adminPage/ProductTable"

interface AdminPageProps {
  onLogout: () => void
}

export default function AdminPage({ onLogout }: AdminPageProps) {
  const {
    products,
    loading,
    isDialogOpen,
    setIsDialogOpen,
    editingProduct,
    handleSubmit,
    handleEdit,
    handleDelete,
    isImageModalOpen,
    setIsImageModalOpen,
    selectedImages,
    setSelectedImages,
    openImageModal,
    handleToggleHidden,
  } = useAdminProducts()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Về trang chủ
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
              <p className="text-gray-600 text-sm">Thêm, sửa, xóa sản phẩm</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => {
                handleEdit(null) // Clear edit
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
            </Button>
            <Button variant="outline" onClick={openImageModal}>
              Xem tất cả ảnh
            </Button>
          </div>
        </div>

        <ProductTable
          products={products}
          loading={loading}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
           handleToggleHidden={handleToggleHidden} 
        />

        <ProductFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleSubmit}
          initialData={
            editingProduct
              ? {
                  name: editingProduct.name,
                  description: editingProduct.description,
                  imageUrl: editingProduct.imageUrl,
                  price: editingProduct.price?.toString() || "",
                  category: editingProduct.category || "",
                  size: editingProduct.size || 0,
                  featured: editingProduct.featured || false,
                  quantity: editingProduct.quantity?.toString() || "",
                }
              : undefined
          }
        />

        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ảnh sản phẩm</DialogTitle>
            </DialogHeader>
            <TableImg
              onUpload={(uploadedUrl) => {
                setSelectedImages((prev) => [uploadedUrl, ...prev])
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
