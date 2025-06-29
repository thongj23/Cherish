"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, ArrowLeft, Save, X, Database } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { seedMockData } from "../../scripts/run-seed.js"

interface Product {
  id: string
  name: string
  description: string
  imageUrl: string
  price?: number
  category?: string
  featured?: boolean
  quantity?: number
}

interface ProductForm {
  name: string
  description: string
  imageUrl: string
  price: string
  category: string
  featured: boolean
  quantity: string
}
interface AdminPageProps {
  onLogout: () => void
}

export default function AdminPage({ onLogout }: AdminPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    imageUrl: "",
    price: "",
    category: "",
    quantity: "",
    featured: false,
  })
  const [seedLoading, setSeedLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const productsCollection = collection(db, "products")
      const productsSnapshot = await getDocs(productsCollection)
      const productsData = productsSnapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        }) as Product
      )
      setProducts(productsData)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        price: formData.price ? Number.parseFloat(formData.price) : undefined,
        category: formData.category || undefined,
        featured: formData.featured,
        quantity: formData.quantity ? Number.parseInt(formData.quantity) : undefined,
        updatedAt: new Date(),
      }

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData)
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date(),
        })
      }

      // Trigger ISR revalidation
      await fetch("/api/revalidate?secret=my-secret-token")

      setIsDialogOpen(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Lỗi khi lưu sản phẩm. Vui lòng thử lại.")
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      price: product.price?.toString() || "",
      category: product.category || "",
      featured: product.featured || false,
      quantity: product.quantity?.toString() || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await deleteDoc(doc(db, "products", productId))
        await fetch("/api/revalidate?secret=my-secret-token")
        fetchProducts()
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Lỗi khi xóa sản phẩm. Vui lòng thử lại.")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      price: "",
      category: "",
      featured: false,
      quantity: "",
    })
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
    resetForm()
  }

  const handleSeedData = async () => {
    if (confirm("Bạn có chắc chắn muốn đổ mock data? Điều này sẽ xóa tất cả sản phẩm hiện tại.")) {
      setSeedLoading(true)
      try {
        const result = await seedMockData()
        if (result.success) {
          alert(`Đã thêm ${result.count} sản phẩm thành công!`)
          fetchProducts()
        } else {
          alert(`Lỗi khi đổ mock data: ${result.error}`)
        }
      } catch (error) {
        console.error("Error seeding data:", error)
        alert("Lỗi khi đổ mock data. Vui lòng thử lại.")
      } finally {
        setSeedLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
              <p className="text-gray-600">Thêm, sửa, xóa sản phẩm của bạn</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingProduct(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm sản phẩm
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Tên sản phẩm *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Mô tả *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">URL hình ảnh *</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Giá (VNĐ)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Danh mục</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="quantity">Số lượng tồn kho *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={0}
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label htmlFor="featured">Sản phẩm nổi bật</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      {editingProduct ? "Cập nhật" : "Thêm"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button onClick={handleSeedData} disabled={seedLoading} variant="outline">
              <Database className="w-4 h-4 mr-2" />
              {seedLoading ? "Đang đổ data..." : "Đổ Mock Data"}
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách sản phẩm ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Chưa có sản phẩm nào</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm sản phẩm đầu tiên
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hình ảnh</TableHead>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Image
                          src={product.imageUrl || "/placeholder.svg?height=50&width=50"}
                          alt={product.name}
                          width={50}
                          height={50}
                          className="rounded-lg object-cover"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>{product.category && <Badge variant="secondary">{product.category}</Badge>}</TableCell>
                      <TableCell>
                        {product.price && <span className="font-medium">{product.price.toLocaleString("vi-VN")}đ</span>}
                      </TableCell>
                      <TableCell>
                        {product.quantity !== undefined ? (
                          <span className="font-medium">{product.quantity}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {product.featured && <Badge className="bg-yellow-500 hover:bg-yellow-600">Nổi bật</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}