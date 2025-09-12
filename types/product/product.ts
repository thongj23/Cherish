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
  sizes?: Record<string, number> // tồn kho theo size, ví dụ {"36":10,"37":5}
  status?: ProductStatus
  link?: string
}

export type ProductStatus = "active" | "inactive" | "disabled"
