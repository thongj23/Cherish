import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock next/image to plain img for tests
vi.mock('next/image', () => ({
  default: (props: any) => {
    const { alt = '', ...rest } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...rest} />
  },
}))

// For some environments, next/link can be left as-is; provide a minimal mock to be safe
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => (
    <a href={typeof href === 'string' ? href : '#'} {...rest}>{children}</a>
  ),
}))
