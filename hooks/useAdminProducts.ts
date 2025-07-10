"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { ProductFormData } from "@/components/adminPage/ProductFormDialog"

export interface Product {
  id: string
  name: string
  description: string
  imageUrl: string
  price?: number
  category?: string
  featured?: boolean
  quantity?: number
  size?: number
}

export default function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const snapshot = await getDocs(collection(db, "products"))
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[]
    setProducts(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSubmit = async (formData: ProductFormData) => {
    const data = {
      name: formData.name,
      description: formData.description,
      imageUrl: formData.imageUrl,
      price: formData.price ? parseFloat(formData.price) : undefined,
      category: formData.category || undefined,
      featured: formData.featured,
      quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
      size: formData.size || 0,
      updatedAt: new Date(),
    }

    if (editingProduct) {
      await updateDoc(doc(db, "products", editingProduct.id), data)
    } else {
      await addDoc(collection(db, "products"), { ...data, createdAt: new Date() })
    }

    setIsDialogOpen(false)
    setEditingProduct(null)
    fetchProducts()
  }

  const handleEdit = (product: Product | null) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc xóa?")) {
      await deleteDoc(doc(db, "products", id))
      fetchProducts()
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
    isImageModalOpen,
    setIsImageModalOpen,
    selectedImages,
    setSelectedImages,
    openImageModal,
  }
}
