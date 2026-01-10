import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/activate-account',
  '/favicon.ico',
])

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const json = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    const obj = JSON.parse(json)
    return typeof obj === 'object' && obj !== null ? (obj as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check if user is accessing protected paths (excluding login page)
  if (pathname.startsWith('/_next') || pathname.startsWith('/assets')) {
    return NextResponse.next()
  }

  const access = req.cookies.get('pw_access_token')?.value || ''

  // If accessing login page and user has valid token, redirect to home
  if (pathname === '/login' && access) {
    const payload = decodeJwtPayload(access)
    if (payload && typeof payload.role === 'string') {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // For public paths (except login which we handled above), allow access
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  // For protected paths, check authentication
  if (!access) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const payload = decodeJwtPayload(access)
  if (!payload || typeof payload.role !== 'string') {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const adminOnly = new Set([
    '/analytics',
    '/users',
    '/orders',
    '/payments',
    '/cms',
    '/categories',
    '/discounts',
    '/support-tickets',
    '/integrations',
    '/activity-logs',
  ])

  if (adminOnly.has(pathname)) {
    const role = typeof payload.role === 'string' ? payload.role : ''
    if (!['admin', 'super_admin'].includes(role)) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api).*)'],
}
