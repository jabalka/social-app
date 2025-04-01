// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET })
  const { pathname } = request.nextUrl

  // Allow access to these routes without authentication
  const publicPaths = ['/', '/auth/(.*)', '/api/(.*)']
  if (publicPaths.some(path => new RegExp(path).test(pathname))) {
    return NextResponse.next()
  }

  // Redirect to home if not authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}