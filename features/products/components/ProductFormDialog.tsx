"use client"

import type React from "react"

import { X, Save, ImageIcon, Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import useImages from "@/hooks/useImages"

import type { ProductFormData } from "@/features/products/types/form"

type CategoryOption = {
  value: string
  label: string
  subCategories: Array<{ value: string; label: string }>
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "Dep", label: "Dép", subCategories: [] },
  { value: "Classic", label: "Classic", subCategories: [] },
  { value: "Collab", label: "Collab", subCategories: [] },
  {
    value: "Charm",
    label: "Charm",
    subCategories: [
      { value: "con-vat", label: "Con vật" },
      { value: "hello-kitty", label: "Hello Kitty" },
      { value: "khac", label: "Khác" },
    ],
  },
]

const createInitialFormState = (): ProductFormData => ({
  name: "",
  description: "",
  imageUrl: "",
  price: "",
  category: "",
  subCategory: "",
  featured: false,
  quantity: "",
  size: 0,
  isHidden: false,
})

type ProductFormErrors = {
  name?: string
  description?: string
  imageUrl?: string
  price?: string
  category?: string
  subCategory?: string
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

export default function ProductFormDialog({ open, onOpenChange, initialData, onSubmit }: ProductFormDialogProps) {
  const [formData, setFormData] = useState<ProductFormData>(createInitialFormState())

  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [isSelectImageOpen, setIsSelectImageOpen] = useState(false)
  const {
    images,
    loading: loadingImages,
    loadingMore: loadingMoreImages,
    hasMore: hasMoreImages,
    loadMore: loadMoreImages,
  } = useImages()

  const selectedCategoryData = useMemo(
    () => CATEGORY_OPTIONS.find((category) => category.value === formData.category),
    [formData.category],
  )
  const showSubCategory = Boolean(selectedCategoryData?.subCategories.length)

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...createInitialFormState(),
        ...initialData,
        subCategory: initialData.subCategory || "",
        isHidden: initialData.isHidden ?? false,
      })
    } else {
      setFormData(createInitialFormState())
    }
    setErrors({})
  }, [initialData, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "size" ? Number(value) : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
      subCategory: "", // ✅ Reset subcategory when category changes
    }))
    setErrors((prev) => ({ ...prev, category: "", subCategory: "" }))
  }

  const validateForm = () => {
    const newErrors: ProductFormErrors = {}
    if (!formData.name.trim()) newErrors.name = "Tên sản phẩm không được để trống"
    if (!formData.imageUrl) newErrors.imageUrl = "Hình ảnh không được để trống"
    if (!formData.price.trim()) newErrors.price = "Giá không được để trống"
    if (!formData.category) newErrors.category = "Danh mục không được để trống"
    if (showSubCategory && !formData.subCategory) {
      newErrors.subCategory = "Danh mục phụ không được để trống"
    }
    if (!formData.quantity.trim()) newErrors.quantity = "Số lượng không được để trống"
    if (formData.size === 0) newErrors.size = "Size không được để trống"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // ✅ Clean the form data before submitting
      const cleanedFormData = {
        ...formData,
        // Ensure subCategory is empty string instead of undefined for non-Charm categories
        subCategory: showSubCategory ? formData.subCategory : "",
      }
      onSubmit(cleanedFormData)
    }
  }

  const isSubmitDisabled =
    !formData.name.trim() ||
    !formData.imageUrl ||
    !formData.price.trim() ||
    !formData.category ||
    (showSubCategory && !formData.subCategory) ||
    !formData.quantity.trim() ||
    formData.size === 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden p-0 sm:max-w-md md:max-w-xl">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle className="text-lg font-semibold">
              {initialData ? "Sửa sản phẩm" : "Thêm sản phẩm"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Name */}
              <div>
                <Label className="text-sm font-medium">Tên sản phẩm *</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full mt-1"
                  placeholder="Nhập tên sản phẩm"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium">Mô tả</Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full mt-1"
                  placeholder="Nhập mô tả sản phẩm"
                  rows={3}
                />
              </div>

              {/* Image */}
              <div>
                <Label className="text-sm font-medium">Hình ảnh *</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    disabled
                    name="imageUrl"
                    value={formData.imageUrl || ""}
                    className="flex-1"
                    placeholder="Chọn từ thư viện..."
                  />
                  <Button type="button" variant="outline" onClick={() => setIsSelectImageOpen(true)} className="px-3">
                    <ImageIcon className="w-4 h-4 mr-1" /> Chọn
                  </Button>
                </div>
                {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>}
                {formData.imageUrl && (
                  <div className="mt-2">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <Image
                        src={formData.imageUrl || "/placeholder.svg"}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Price and Quantity Row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Giá *</Label>
                  <Input
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full mt-1"
                    placeholder="0"
                  />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium">Số lượng *</Label>
                  <Input
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    className="w-full mt-1"
                    placeholder="0"
                  />
                  {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                </div>
              </div>

              {/* Category */}
              <div>
                <Label className="text-sm font-medium">Danh mục *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              {/* Subcategory - Only show for Charm */}
              {showSubCategory && (
                <div>
                  <Label className="text-sm font-medium">Danh mục phụ *</Label>
                  <Select
                    value={formData.subCategory}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, subCategory: value }))}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Chọn danh mục phụ" />
                    </SelectTrigger>
                    <SelectContent>
                      {(selectedCategoryData?.subCategories ?? []).map((subCat) => (
                        <SelectItem key={subCat.value} value={subCat.value}>
                          {subCat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subCategory && <p className="text-red-500 text-xs mt-1">{errors.subCategory}</p>}
                </div>
              )}

              {/* Size */}
              <div>
                <Label className="text-sm font-medium">Size *</Label>
                <Input
                  type="number"
                  name="size"
                  value={formData.size || ""}
                  onChange={handleChange}
                  placeholder="VD: 36, 37, 38..."
                  min={30}
                  max={50}
                  required
                  className="mt-1 w-full"
                />
                {errors.size && <p className="text-red-500 text-xs mt-1">{errors.size}</p>}
              </div>

              {/* Switches */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <Label className="text-sm font-medium">Sản phẩm nổi bật</Label>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
                  />
                </div>
                <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <Label className="text-sm font-medium">Ẩn sản phẩm</Label>
                  <Switch
                    checked={formData.isHidden}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isHidden: checked }))}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  <X className="w-4 h-4 mr-1" /> Hủy
                </Button>
                <Button type="submit" disabled={isSubmitDisabled} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="w-4 h-4 mr-1" /> Lưu
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Selection Dialog */}
      <Dialog open={isSelectImageOpen} onOpenChange={setIsSelectImageOpen}>
        <DialogContent className="max-w-2xl sm:max-w-lg md:max-w-2xl flex flex-col">
          <DialogHeader>
            <DialogTitle>Chọn ảnh từ thư viện</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[400px] grid-cols-2 gap-4 overflow-y-auto sm:grid-cols-3">
            {loadingImages && images.length === 0 ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-square animate-pulse rounded-lg bg-gray-200" />
              ))
            ) : images.length === 0 ? (
              <div className="col-span-full rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                Chưa có ảnh nào. Hãy upload ảnh mới.
              </div>
            ) : (
              images.map((img, index) => (
                <button
                  type="button"
                  key={img.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, imageUrl: img.url }))
                    setIsSelectImageOpen(false)
                    setErrors((prev) => ({ ...prev, imageUrl: "" }))
                  }}
                >
                  <Image
                    src={img.url || "/placeholder.svg"}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-black/40 py-1 text-center text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Chọn ảnh
                  </span>
                </button>
              ))
            )}
          </div>
          {hasMoreImages && (
            <Button
              variant="outline"
              onClick={loadMoreImages}
              disabled={loadingMoreImages}
              className="mt-4 w-full"
            >
              {loadingMoreImages ? (
                <span className="flex items-center justify-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang tải thêm...
                </span>
              ) : (
                "Tải thêm ảnh"
              )}
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
