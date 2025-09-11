// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('GET /api/revalidate', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('rejects invalid secret', async () => {
    const { GET } = await import('../../app/api/revalidate/route')
    const req = new Request('http://localhost/api/revalidate?secret=bad')
    const res: Response = await GET(req as any)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toEqual({ message: 'Invalid token' })
  })

  it('revalidates on correct secret', async () => {
    const { GET } = await import('../../app/api/revalidate/route')
    const req = new Request('http://localhost/api/revalidate?secret=my-secret-token')
    const res: Response = await GET(req as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ revalidated: true })
  })
})

