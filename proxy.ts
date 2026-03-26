import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const path = req.nextUrl.pathname

  if (path.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/authentication', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
