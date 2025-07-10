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
  })

  const [isSelectImageOpen, setIsSelectImageOpen] = useState(false)
  const images = useImages()

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
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
      })
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
  }

  return (
    <>
      {/* === FORM CHÍNH === */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg sm:max-w-md md:max-w-lg flex flex-col max-h-[90vh] sm:max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {initialData ? "Sửa sản phẩm" : "Thêm sản phẩm"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onSubmit(formData)
              }}
              className="space-y-4"
            >
              <div>
                <Label>Tên sản phẩm</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
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
                  className="w-full"
                />
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
                    <SelectItem value="Dép">Dép</SelectItem>
                    <SelectItem value="Champ">Champ</SelectItem>
                  </SelectContent>
                </Select>
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
                  className="w-full"
                />
              </div>

              <div>
                <Label>Số lượng</Label>
                <Input
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full"
                />
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

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-4 h-4 mr-1" /> Hủy
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-1" /> Lưu
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* === MODAL CHỌN ẢNH === */}
      <Dialog
        open={isSelectImageOpen}
        onOpenChange={setIsSelectImageOpen}
      >
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