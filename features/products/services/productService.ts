import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit as firestoreLimit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore"

import { db } from "@/lib/firebase"

import type { Product, ProductStatus } from "@/types/product/product"
import type { ProductFormData } from "@/features/products/types/form"

const PRODUCTS_COLLECTION = "products"

const productsCollection = collection(db, PRODUCTS_COLLECTION)

export async function fetchProducts(): Promise<Product[]> {
  const snapshot = await getDocs(productsCollection)
  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as Product[]
}

export interface ProductPage {
  items: Product[]
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
  hasMore: boolean
}

export async function fetchProductsPage(options: {
  pageSize: number
  cursor?: QueryDocumentSnapshot<DocumentData> | null
}): Promise<ProductPage> {
  const { pageSize, cursor } = options

  let q = query(productsCollection, orderBy("createdAt", "desc"), firestoreLimit(pageSize))
  if (cursor) {
    q = query(productsCollection, orderBy("createdAt", "desc"), startAfter(cursor), firestoreLimit(pageSize))
  }

  const snapshot = await getDocs(q)
  const docs = snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as Product[]

  return {
    items: docs,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null,
    hasMore: snapshot.docs.length === pageSize,
  }
}

export async function createProduct(payload: ProductFormData) {
  const data = buildProductDocument(payload)

  await addDoc(productsCollection, {
    ...data,
    createdAt: new Date(),
  })
}

export async function updateProduct(id: string, payload: ProductFormData) {
  const data = buildProductDocument(payload)
  await updateDoc(doc(db, PRODUCTS_COLLECTION, id), data)
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id))
}

export async function updateProductStatus(id: string, status: ProductStatus) {
  await updateDoc(doc(db, PRODUCTS_COLLECTION, id), { status })
}

function buildProductDocument(payload: ProductFormData) {
  const trimmedSubCategory = payload.subCategory?.trim() ?? ""

  const document: Record<string, unknown> = {
    name: payload.name,
    description: payload.description,
    imageUrl: payload.imageUrl,
    price: payload.price ? Number.parseFloat(payload.price) : 0,
    category: payload.category,
    featured: payload.featured,
    quantity: payload.quantity ? Number.parseInt(payload.quantity, 10) : 0,
    size: payload.size || 0,
    status: payload.isHidden ? "disabled" : "active",
    updatedAt: new Date(),
  }

  if (trimmedSubCategory) {
    document.subCategory = trimmedSubCategory
  } else {
    document.subCategory = null
  }

  return document
}
