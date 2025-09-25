import { useDeferredValue, useEffect, useMemo, useState } from "react"

import type { Product, ProductStatus } from "@/types/product/product"

export type ProductSortKey = "name" | "price" | null
export interface StatusCounts {
  all: number
  active: number
  inactive: number
  disabled: number
}

interface UseProductTableStateOptions {
  pageSize?: number
}

interface UseProductTableStateReturn {
  searchTerm: string
  setSearchTerm: (value: string) => void
  selectedCategory: string
  setSelectedCategory: (value: string) => void
  selectedSubCategory: string
  setSelectedSubCategory: (value: string) => void
  statusFilter: "all" | ProductStatus
  setStatusFilter: (value: "all" | ProductStatus) => void
  sortKey: ProductSortKey
  sortDir: "asc" | "desc"
  requestSort: (key: Exclude<ProductSortKey, null>) => void
  page: number
  setPage: (page: number) => void
  pageSize: number
  totalPages: number
  pagedProducts: Product[]
  sortedProducts: Product[]
  categories: string[]
  subCategories: string[]
  filteredCount: number
  statusCounts: StatusCounts
  resetFilters: () => void
  isFiltered: boolean
}

const ALL_VALUE = "all"

export function useProductTableState(
  products: Product[],
  options: UseProductTableStateOptions = {},
): UseProductTableStateReturn {
  const pageSize = options.pageSize ?? 10
  const [searchTerm, setSearchTerm] = useState("")
  const deferredSearch = useDeferredValue(searchTerm)
  const [selectedCategory, setSelectedCategoryState] = useState<string>(ALL_VALUE)
  const [selectedSubCategory, setSelectedSubCategoryState] = useState<string>(ALL_VALUE)
  const [statusFilter, setStatusFilterState] = useState<"all" | ProductStatus>(ALL_VALUE)
  const [sortKey, setSortKey] = useState<ProductSortKey>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPageState] = useState(1)

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      products
        .map((product) => product.category)
        .filter((category): category is string => Boolean(category)),
    )
    return [ALL_VALUE, ...uniqueCategories]
  }, [products])

  const subCategories = useMemo(() => {
    if (selectedCategory === ALL_VALUE) return [ALL_VALUE]

    const uniqueSubCategories = new Set(
      products
        .filter((product) => product.category === selectedCategory)
        .map((product) => product.subCategory)
        .filter((subCategory): subCategory is string => Boolean(subCategory)),
    )

    return uniqueSubCategories.size ? [ALL_VALUE, ...uniqueSubCategories] : [ALL_VALUE]
  }, [products, selectedCategory])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(deferredSearch.toLowerCase())
      const matchesCategory =
        selectedCategory === ALL_VALUE || product.category === selectedCategory
      const matchesSubCategory =
        selectedSubCategory === ALL_VALUE || product.subCategory === selectedSubCategory
      const matchesStatus = statusFilter === ALL_VALUE || product.status === statusFilter

      return matchesSearch && matchesCategory && matchesSubCategory && matchesStatus
    })
  }, [products, deferredSearch, selectedCategory, selectedSubCategory, statusFilter])

  const sortedProducts = useMemo(() => {
    if (!sortKey) return filteredProducts

    const sorted = [...filteredProducts]
    sorted.sort((a, b) => {
      if (sortKey === "name") {
        const aValue = (a.name || "").toLowerCase()
        const bValue = (b.name || "").toLowerCase()
        return sortDir === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      const aPrice = a.price ?? 0
      const bPrice = b.price ?? 0
      return sortDir === "asc" ? aPrice - bPrice : bPrice - aPrice
    })

    return sorted
  }, [filteredProducts, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize))

  const pagedProducts = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedProducts.slice(start, start + pageSize)
  }, [sortedProducts, page, pageSize])

  const statusCounts = useMemo<StatusCounts>(() => {
    return products.reduce(
      (acc, product) => {
        if (product.status === "active") acc.active += 1
        else if (product.status === "inactive") acc.inactive += 1
        else if (product.status === "disabled") acc.disabled += 1
        acc.all += 1
        return acc
      },
      { all: 0, active: 0, inactive: 0, disabled: 0 },
    )
  }, [products])

  useEffect(() => {
    setPageState(1)
  }, [deferredSearch, selectedCategory, selectedSubCategory, statusFilter])

  const requestSort = (key: Exclude<ProductSortKey, null>) => {
    setSortKey(key)
    setSortDir((current) => (sortKey === key ? (current === "asc" ? "desc" : "asc") : "asc"))
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategoryState(ALL_VALUE)
    setSelectedSubCategoryState(ALL_VALUE)
    setStatusFilterState(ALL_VALUE)
  }

  const setSelectedCategory = (value: string) => {
    setSelectedCategoryState(value)
    setSelectedSubCategoryState(ALL_VALUE)
  }

  const setSelectedSubCategory = (value: string) => {
    setSelectedSubCategoryState(value)
  }

  const setStatusFilter = (value: "all" | ProductStatus) => {
    setStatusFilterState(value)
  }

  const setPage = (value: number) => {
    setPageState(Math.max(1, Math.min(value, totalPages)))
  }

  const isFiltered =
    selectedCategory !== ALL_VALUE ||
    selectedSubCategory !== ALL_VALUE ||
    statusFilter !== ALL_VALUE ||
    Boolean(searchTerm)

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    statusFilter,
    setStatusFilter,
    sortKey,
    sortDir,
    requestSort,
    page,
    setPage,
    pageSize,
    totalPages,
    pagedProducts,
    sortedProducts,
    categories,
    subCategories,
    filteredCount: filteredProducts.length,
    statusCounts,
    resetFilters,
    isFiltered,
  }
}
