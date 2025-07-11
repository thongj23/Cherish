// bio/types.ts


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
  isHidden?: boolean
  link?: string
}