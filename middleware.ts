import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Allow root admin page for login form
  if (pathname === '/admin') return NextResponse.next()
  if (pathname.startsWith('/admin')) {
    const has = req.cookies.get('admin_session')?.value
    if (!has) {
      const url = req.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

