"use client"

import { X, Save, Image as ImageIcon } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import useImages from "@/hooks/useImages"

export interface ProductFormData {
  name: string
  description: string
  imageUrl: string
  price: string
  category: string
  featured: boolean
  quantity: string
  size: number
  isHidden?: boolean
}

// ✅ Type riêng cho lỗi:
type ProductFormErrors = {
  name?: string
  description?: string
  imageUrl?: string
  price?: string
  category?: string
  featured?: string
  quantity?: string
  size?: string
  isHidden?: string
}

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ProductFormData
  onSubmit: (formData: ProductFormData) => void
}

export default function ProductFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: ProductFormDialogProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    imageUrl: "",
    price: "",
    category: "",
    featured: false,
    quantity: "",
    size: 0,
    isHidden: false,
  })

  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [isSelectImageOpen, setIsSelectImageOpen] = useState(false)
  const images = useImages()

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        isHidden: initialData.isHidden ?? false,
      })
      setErrors({})
    } else {
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        price: "",
        category: "",
        featured: false,
        quantity: "",
        size: 0,
        isHidden: false,
      })
      setErrors({})
    }
  }, [initialData, open])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "size" ? Number(value) : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validateForm = () => {
    const newErrors: ProductFormErrors = {}
    if (!formData.name.trim()) newErrors.name = "Tên sản phẩm không được để trống"
    if (!formData.imageUrl) newErrors.imageUrl = "Hình ảnh không được để trống"
    if (!formData.price.trim()) newErrors.price = "Giá không được để trống"
    if (!formData.category) newErrors.category = "Danh mục không được để trống"
    if (!formData.quantity.trim()) newErrors.quantity = "Số lượng không được để trống"
    if (formData.size === 0) newErrors.size = "Size không được để trống"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const isSubmitDisabled =
    !formData.name.trim() ||
    !formData.imageUrl ||
    !formData.price.trim() ||
    !formData.category ||
    !formData.quantity.trim() ||
    formData.size === 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg sm:max-w-md md:max-w-lg flex flex-col max-h-[90vh] sm:max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {initialData ? "Sửa sản phẩm" : "Thêm sản phẩm"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Tên sản phẩm</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label>Mô tả</Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div>
                <Label>Hình ảnh</Label>
                <div className="flex gap-2">
                  <Input
                    disabled
                    name="imageUrl"
                    value={formData.imageUrl || ""}
                    className="flex-1"
                    placeholder="Chọn từ thư viện..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSelectImageOpen(true)}
                  >
                    <ImageIcon className="w-4 h-4 mr-1" /> Chọn ảnh
                  </Button>
                </div>
                {errors.imageUrl && (
                  <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>
                )}
                {formData.imageUrl && (
                  <div className="mt-2">
                    <Image
                      src={formData.imageUrl}
                      alt="Preview"
                      width={120}
                      height={120}
                      className="rounded border"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Giá</Label>
                <Input
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <Label>Danh mục</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dep">Dép</SelectItem>
                    <SelectItem value="Charm">Charm</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <Label>Size</Label>
                <Input
                  type="number"
                  name="size"
                  value={formData.size || 0}
                  onChange={handleChange}
                  placeholder="Nhập size (ví dụ: 36, 37...)"
                  min={30}
                  max={50}
                  required
                  className="w-full"
                />
                {errors.size && (
                  <p className="text-red-500 text-xs mt-1">{errors.size}</p>
                )}
              </div>

              <div>
                <Label>Số lượng</Label>
                <Input
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label>Nổi bật</Label>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, featured: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Ẩn sản phẩm</Label>
                <Switch
                  checked={formData.isHidden}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isHidden: checked }))
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-4 h-4 mr-1" /> Hủy
                </Button>
                <Button type="submit" disabled={isSubmitDisabled}>
                  <Save className="w-4 h-4 mr-1" /> Lưu
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSelectImageOpen} onOpenChange={setIsSelectImageOpen}>
        <DialogContent className="max-w-2xl sm:max-w-lg md:max-w-2xl flex flex-col">
          <DialogHeader>
            <DialogTitle>Chọn ảnh</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="border rounded cursor-pointer hover:shadow"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, imageUrl: img.url }))
                  setIsSelectImageOpen(false)
                  setErrors((prev) => ({ ...prev, imageUrl: "" }))
                }}
              >
                <Image
                  src={img.url}
                  alt={`Image ${index + 1}`}
                  width={150}
                  height={150}
                  className="object-cover w-full h-full rounded"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
