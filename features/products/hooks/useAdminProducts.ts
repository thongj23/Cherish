"use client"

import { useCallback, useEffect, useState } from "react"
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore"

import type { ProductFormData } from "@/features/products/types/form"
import type { Product, ProductStatus } from "@/types/product/product"

import {
  createProduct,
  deleteProduct as deleteProductApi,
  fetchProductsPage,
  updateProduct,
  updateProductStatus as updateProductStatusApi,
} from "@/features/products/services/productService"

export default function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastCursor, setLastCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const PAGE_SIZE = 20

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      const { items, lastDoc, hasMore: more } = await fetchProductsPage({ pageSize: PAGE_SIZE })
      setProducts(items)
      setLastCursor(lastDoc)
      setHasMore(more)
      setError(null)
    } catch (error) {
      console.error("Error fetching products", error)
      setProducts([])
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }, [PAGE_SIZE])

  const loadMoreProducts = useCallback(async () => {
    if (!hasMore || loadingMore) return
    setLoadingMore(true)
    try {
      const { items, lastDoc, hasMore: more } = await fetchProductsPage({
        pageSize: PAGE_SIZE,
        cursor: lastCursor,
      })
      setProducts((prev) => [...prev, ...items])
      setLastCursor(lastDoc)
      setHasMore(more)
      setError(null)
    } catch (err) {
      console.error("Error loading more products", err)
      setError("Không thể tải thêm sản phẩm.")
    } finally {
      setLoadingMore(false)
    }
  }, [PAGE_SIZE, hasMore, lastCursor, loadingMore])

  useEffect(() => {
    // Only fetch if user is authenticated
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn")
    if (isLoggedIn === "true") {
      loadProducts()
    }
  }, [loadProducts])

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData)
      } else {
        await createProduct(formData)
      }

      setIsDialogOpen(false)
      setEditingProduct(null)
      await loadProducts()
      setError(null)
    } catch (error) {
      console.error("Error saving product", error)
      setError("Lỗi khi lưu sản phẩm. Vui lòng thử lại.")
    }
  }

  const handleEdit = (product: Product | null) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc xóa sản phẩm này?")) {
      try {
        await deleteProductApi(id)
        await loadProducts()
        setError(null)
      } catch (error) {
        console.error("Error deleting product", error)
        setError("Lỗi khi xóa sản phẩm. Vui lòng thử lại.")
      }
    }
  }

  const handleChangeStatus = async (id: string, status: ProductStatus) => {
    try {
      await updateProductStatusApi(id, status)
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
      setError(null)
    } catch (error) {
      console.error("Error updating status", error)
      setError("Lỗi khi cập nhật trạng thái. Vui lòng thử lại.")
    }
  }

  const openImageModal = () => {
    setSelectedImages(products.map((p) => p.imageUrl))
    setIsImageModalOpen(true)
  }

  return {
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
    setSelectedImages,
    openImageModal,
    refreshProducts: loadProducts,
    loadMoreProducts,
  }
}
