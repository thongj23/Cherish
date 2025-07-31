"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ProductFormData } from "@/components/adminPage/ProductFormDialog"
import type { Product, ProductStatus } from "@/types/product/product"

export default function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      console.log("🔄 Fetching products from Firestore...")

      const snapshot = await getDocs(collection(db, "products"))
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]

      console.log("📦 Products fetched:", data.length, data)
      setProducts(data)
    } catch (error) {
      console.error("❌ Error fetching products:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Only fetch if user is authenticated
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn")
    if (isLoggedIn === "true") {
      fetchProducts()
    }
  }, [fetchProducts])

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      // ✅ Prepare data and handle undefined/empty values properly
      const data: any = {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        price: formData.price ? Number.parseFloat(formData.price) : 0,
        category: formData.category,
        featured: formData.featured,
        quantity: formData.quantity ? Number.parseInt(formData.quantity) : 0,
        size: formData.size || 0,
        status: formData.isHidden ? "disabled" : "active",
        updatedAt: new Date(),
      }

      // ✅ Only add subCategory if it has a value, otherwise remove it from the document
      if (formData.subCategory && formData.subCategory.trim() !== "") {
        data.subCategory = formData.subCategory
      } else {
        // For updates, we need to explicitly remove the field
        if (editingProduct) {
          data.subCategory = null // This will remove the field in Firestore
        }
        // For new products, we simply don't include the field
      }

      console.log("💾 Saving product data:", data)

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), data)
        console.log("✅ Product updated:", editingProduct.id)
      } else {
        await addDoc(collection(db, "products"), {
          ...data,
          createdAt: new Date(),
        })
        console.log("✅ Product added")
      }

      setIsDialogOpen(false)
      setEditingProduct(null)
      fetchProducts() // Refresh the list
    } catch (error) {
      console.error("❌ Error saving product:", error)
      alert("Lỗi khi lưu sản phẩm!")
    }
  }

  const handleEdit = (product: Product | null) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc xóa sản phẩm này?")) {
      try {
        await deleteDoc(doc(db, "products", id))
        console.log("✅ Product deleted:", id)
        fetchProducts() // Refresh the list
      } catch (error) {
        console.error("❌ Error deleting product:", error)
        alert("Lỗi khi xóa sản phẩm!")
      }
    }
  }

  const handleChangeStatus = async (id: string, status: ProductStatus) => {
    try {
      await updateDoc(doc(db, "products", id), { status })
      console.log("✅ Status updated:", id, status)

      // Update local state immediately
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
    } catch (error) {
      console.error("❌ Error updating status:", error)
      alert("Lỗi khi cập nhật trạng thái!")
    }
  }

  const openImageModal = () => {
    setSelectedImages(products.map((p) => p.imageUrl))
    setIsImageModalOpen(true)
  }

  return {
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
    setSelectedImages,
    openImageModal,
  }
}
