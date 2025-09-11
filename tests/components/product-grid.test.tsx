import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import ProductGrid from '@/components/bio/ProductGrid'
import type { Product } from '@/types/product/product'
import { vi } from 'vitest'

// Mock ProductCard to simplify UI dependencies
vi.mock('@/components/bio/ProductCard', () => ({
  default: ({ product }: { product: Product }) => (
    <div data-testid="card">{product.name}</div>
  ),
}))

const products: Product[] = [
  { id: '1', name: 'Classic A', description: 'desc', imageUrl: '', category: 'Classic', featured: false },
  { id: '2', name: 'Classic B', description: 'desc', imageUrl: '', category: 'Classic', featured: true },
  { id: '3', name: 'Charm Kitty', description: 'kitty', imageUrl: '', category: 'Charm', subCategory: 'hello-kitty' },
  { id: '4', name: 'Charm Animal', description: 'animal', imageUrl: '', category: 'Charm', subCategory: 'con-vat' },
]

describe('ProductGrid integration', () => {
  it('renders loading state', () => {
    render(<ProductGrid products={[]} loading={true} />)
    expect(screen.getByText('Đang tải...')).toBeInTheDocument()
  })

  it('filters by tab and subtab, and search', () => {
    render(<ProductGrid products={products} loading={false} />)

    // Default tab is Classic
    const cardsClassic = screen.getAllByTestId('card')
    expect(cardsClassic.map((el) => el.textContent)).toEqual(['Classic B', 'Classic A']) // featured first

    // Switch to Charm tab
    fireEvent.click(screen.getByRole('button', { name: /Charm/i }))
    // Default Charm subtab is Con vật -> expect Animal
    let cardsCharm = screen.getAllByTestId('card')
    expect(cardsCharm.map((el) => el.textContent)).toEqual(['Charm Animal'])

    // Switch to Hello Kitty subtab
    fireEvent.click(screen.getByRole('button', { name: /Hello Kitty/i }))
    cardsCharm = screen.getAllByTestId('card')
    expect(cardsCharm.map((el) => el.textContent)).toEqual(['Charm Kitty'])

    // Search should filter within current tab/subtab
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'kitty' } })
    const filtered = screen.getAllByTestId('card')
    expect(filtered.map((el) => el.textContent)).toEqual(['Charm Kitty'])
  })

  it('shows empty state when no products match', () => {
    const others: Product[] = [
      { id: '10', name: 'Collab Z', description: 'zzz', imageUrl: '', category: 'Collab' },
    ]
    render(<ProductGrid products={others} loading={false} />)
    expect(screen.getByText('Không tìm thấy sản phẩm.')).toBeInTheDocument()
  })
})
