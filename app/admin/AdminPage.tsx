"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import ProductFormDialog from "@/components/adminPage/ProductFormDialog"
import TableImg from "@/components/adminPage/TableImg"
import useAdminProducts from "@/hooks/useAdminProducts"

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
    openImageModal
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
            <Button onClick={() => {
              handleEdit(null) // Clear edit
            }}>
              <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
            </Button>
            <Button variant="outline" onClick={openImageModal}>
              Xem tất cả ảnh
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-center">Đang tải...</p>
        ) : products.length === 0 ? (
          <p className="text-center">Chưa có sản phẩm</p>
        ) : (
          <>
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hình</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>SL</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id}>
                      <TableCell><Image src={p.imageUrl} alt="" width={50} height={50} className="object-cover" /></TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{p.price}</TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell>{p.featured && <Badge>Nổi bật</Badge>}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button size="icon" onClick={() => handleEdit(p)}><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Mobile View */}
            <div className="sm:hidden space-y-4">
              {products.map(p => (
                <div key={p.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-2">
                    <Image src={p.imageUrl} alt="" width={50} height={50} className="object-cover rounded" />
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-gray-600">{p.category}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p>Giá: {p.price}</p>
                    <p>Số lượng: {p.quantity}</p>
                    <p>{p.featured && <Badge className="mt-1">Nổi bật</Badge>}</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={() => handleEdit(p)}><Edit className="w-4 h-4 mr-1" /> Sửa</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 mr-1" /> Xóa</Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <ProductFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleSubmit}
          initialData={editingProduct ? {
            name: editingProduct.name,
            description: editingProduct.description,
            imageUrl: editingProduct.imageUrl,
            price: editingProduct.price?.toString() || "",
            category: editingProduct.category || "",
            size: editingProduct.size || 0,
            featured: editingProduct.featured || false,
            quantity: editingProduct.quantity?.toString() || "",
          } : undefined}
        />

        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Ảnh sản phẩm</DialogTitle></DialogHeader>
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
