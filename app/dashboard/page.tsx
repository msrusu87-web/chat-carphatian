/**
 * Main Dashboard - Role-based redirect
 * Uses client-side redirect with proper state tracking
 * Built by Carphatian
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Don't redirect if still loading or already redirected
    if (status === 'loading' || hasRedirected.current) return

    // Mark as redirected to prevent loops
    hasRedirected.current = true

    if (!session?.user) {
      router.replace('/login')
      return
    }

    const role = (session.user as { role?: string }).role

    // Redirect to role-specific dashboard
    switch (role) {
      case 'admin':
        router.replace('/admin')
        break
      case 'client':
        router.replace('/client')
        break
      case 'freelancer':
        router.replace('/freelancer')
        break
      default:
        router.replace('/login')
    }
  }, [status]) // Only depend on status, not session or router

  // Show loading while redirecting
  return (
    <div 
      className="flex items-center justify-center min-h-screen"
      style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)' }}
    >
      <div className="text-center">
        <div 
          className="animate-spin rounded-full mx-auto mb-4"
          style={{ width: '3rem', height: '3rem', border: '3px solid transparent', borderTopColor: '#3b82f6' }}
        />
        <p style={{ color: '#9ca3af' }}>Redirecting...</p>
      </div>
    </div>
  )
}
