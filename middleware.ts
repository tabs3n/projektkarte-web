import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!pathname.startsWith('/admin')) return NextResponse.next()
  const session = req.cookies.get('admin_session')?.value
  if (session !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
