import { render, screen } from '@testing-library/react'
import React from 'react'
import SocialLinks from '@/components/bio/SocialLinks'

describe('SocialLinks', () => {
  it('renders Instagram and TikTok links', () => {
    render(<SocialLinks />)
    expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /tiktok/i })).toBeInTheDocument()
  })
})

