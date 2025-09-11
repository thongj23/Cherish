// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock firebase-admin app/firestore and bcryptjs
vi.mock('firebase-admin/app', () => {
  return {
    initializeApp: vi.fn(),
    cert: (x: any) => x,
    getApps: () => [], // force initialize path, but initializeApp is a noop
  }
})

const collectionMock = vi.fn()
const limitMock = vi.fn()
const getMock = vi.fn()

vi.mock('firebase-admin/firestore', () => {
  return {
    getFirestore: () => ({
      collection: collectionMock,
    }),
  }
})

// Module under test imports default bcrypt and uses compareSync
const compareSync = vi.fn()
vi.mock('bcryptjs', () => ({
  default: { compareSync },
}))

// Helper to import the handler after env + mocks are set
async function importHandler() {
  // Provide a PEM-looking key to bypass runtime guard
  process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----'
  process.env.FIREBASE_PROJECT_ID = 'proj'
  process.env.FIREBASE_CLIENT_EMAIL = 'svc@proj.iam.gserviceaccount.com'
  const mod = await import('../../app/api/admin-login/route')
  return mod.POST
}

describe('POST /api/admin-login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // wire the chained calls: collection().limit().get()
    collectionMock.mockReturnValue({ limit: limitMock })
    limitMock.mockReturnValue({ get: getMock })
  })

  it('returns 404 when no admin found', async () => {
    const POST = await importHandler()
    getMock.mockResolvedValue({ empty: true })

    const req = new Request('http://localhost/api/admin-login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'x' }),
    })

    const res: Response = await POST(req as any)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body).toEqual({ success: false, message: 'No admin found' })
  })

  it('returns 401 when password mismatch', async () => {
    const POST = await importHandler()
    getMock.mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ passwordHash: 'hash' }) }],
    })
    compareSync.mockReturnValue(false)

    const req = new Request('http://localhost/api/admin-login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'wrong' }),
    })

    const res: Response = await POST(req as any)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toEqual({ success: false, message: 'Wrong password' })
  })

  it('returns success when password matches', async () => {
    const POST = await importHandler()
    getMock.mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ passwordHash: 'hash' }) }],
    })
    compareSync.mockReturnValue(true)

    const req = new Request('http://localhost/api/admin-login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'secret' }),
    })

    const res: Response = await POST(req as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ success: true })
  })
})

