import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import ProductCard from '@/components/bio/ProductCard'
import type { Product } from '@/types/product/product'
import { vi } from 'vitest'

// Simplify framer-motion for tests
vi.mock('framer-motion', () => ({
  motion: {
    div: (props: any) => <div {...props} />,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('ProductCard', () => {
  const base: Product = {
    id: 'p1',
    name: 'Prod One',
    description: 'Nice',
    imageUrl: '',
    category: 'Classic',
  }

  it('renders badges and inactive state', () => {
    const prod: Product = { ...base, featured: true, status: 'inactive', link: 'https://example.com' }
    render(<ProductCard product={prod} index={0} />)

    expect(screen.getByText('Bán Chạy')).toBeInTheDocument()
    expect(screen.getByText('Classic')).toBeInTheDocument()
    expect(screen.getByText('Tạm hết hàng')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /xem chi tiết prod one/i })
    expect(link).toHaveClass('pointer-events-none')
  })

  it('uses placeholder thumbnail when image url is missing', () => {
    render(<ProductCard product={base} index={1} />)
    // Our next/image mock renders <img alt={product.name} />
    expect(screen.getByAltText('Prod One')).toBeInTheDocument()
    expect(
      screen.getAllByRole('img').some((el) => (el as HTMLImageElement).src.includes('/placeholder.svg'))
    ).toBe(true)
  })

  it('opens modal when clicking thumbnail and has real image', () => {
    const realImage: Product = {
      ...base,
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1730000000/sample.jpg',
    }
    render(<ProductCard product={realImage} index={2} />)
    const btn = screen.getByRole('button', { name: /xem ảnh prod one/i })
    fireEvent.click(btn)
    // Modal container has role dialog
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
