'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function StripeConnectButton() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accountStatus, setAccountStatus] = useState<'not_connected' | 'pending' | 'connected'>('not_connected')

  // Check account status on mount
  useState(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/stripe/connect/status')
        if (res.ok) {
          const data = await res.json()
          setAccountStatus(data.status)
        }
      } catch (err) {
        console.error('Failed to check Stripe status:', err)
      }
    }
    checkStatus()
  })

  const handleConnect = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create Stripe account')
      }

      const data = await res.json()
      
      // Redirect to Stripe onboarding
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (accountStatus === 'connected') {
    return (
      <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">Stripe Connected</h3>
            <p className="text-sm text-gray-400">You can now receive payments</p>
          </div>
        </div>
      </div>
    )
  }

  if (accountStatus === 'pending') {
    return (
      <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">Setup Pending</h3>
            <p className="text-sm text-gray-400">Complete your Stripe account setup</p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          disabled={loading}
          className="mt-3 w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Redirecting...' : 'Complete Setup'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-white">Connect Stripe</h3>
          <p className="text-sm text-gray-400">Receive payments directly to your bank</p>
        </div>
      </div>

      {error && (
        <div className="mb-3 bg-red-500/20 border border-red-500/50 text-red-400 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
            </svg>
            Connect Stripe Account
          </>
        )}
      </button>

      <p className="mt-2 text-xs text-gray-500 text-center">
        Secure payments powered by Stripe • Platform fee: 15%
      </p>
    </div>
  )
}
