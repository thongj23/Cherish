// bio/types.ts
export interface Product {
  id: string
  name: string
  description: string
  imageUrl: string
  price?: number
  category?: string
  subCategory?: string // Added for Charm subcategories
  featured?: boolean
  quantity?: number
  size?: number
  status?: ProductStatus
  link?: string
}

export type ProductStatus = "active" | "inactive" | "disabled"
