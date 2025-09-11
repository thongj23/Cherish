import { render, screen } from '@testing-library/react'
import React from 'react'
import ProfileSection from '@/components/bio/ProfileSection'

describe('ProfileSection', () => {
  it('renders name and profile image', () => {
    render(<ProfileSection />)
    expect(screen.getByText(/Tiệm dép Cherish/i)).toBeInTheDocument()
    expect(screen.getByAltText('Profile')).toBeInTheDocument()
  })
})

