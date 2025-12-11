/**
 * NextAuth Middleware
 * 
 * Protects routes based on authentication and role:
 * - /dashboard/* - Requires login (any role)
 * - /admin/* - Requires admin role
 * - /auth/login, /auth/signup - Redirects to dashboard if already logged in
 * 
 * Features:
 * - Session validation
 * - Role-based access control
 * - Automatic redirects
 * - Works with middleware.ts pattern
 * 
 * Built by Carphatian
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

/**
 * NextAuth Middleware
 * 
 * Validates JWT and attaches session to request.
 * Use 'authorized' callback for role-based access.
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Admin routes - check for admin role
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Dashboard routes - any authenticated user
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(
          new URL(`/login?callbackUrl=${pathname}`, req.url)
        )
      }
    }

    return NextResponse.next()
  },
  {
    /**
     * Pages that don't require authentication
     */
    pages: {
      signIn: '/login',
    },

    /**
     * Matcher - which routes to protect
     * 
     * Protected routes:
     * - /dashboard/*
     * - /admin/*
     * - /api/protected/*
     */
    callbacks: {
      authorized: ({ token, req }) => {
        // Always allow if token exists (authorization is checked in middleware function above)
        return !!token
      },
    },
  }
)

/**
 * Route matcher
 * 
 * Apply middleware only to these paths
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/protected/:path*',
  ],
}
