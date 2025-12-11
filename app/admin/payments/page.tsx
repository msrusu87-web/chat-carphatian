/**
 * Admin Payments Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'

export default async function AdminPaymentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Payment Management</h1>
        <p className="text-gray-400 mt-1">Track platform payments and transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">$0</p>
          <p className="text-gray-400 text-sm">Total Revenue</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-4xl font-bold text-green-400 mb-1">$0</p>
          <p className="text-gray-400 text-sm">This Month</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <p className="text-4xl font-bold text-yellow-400 mb-1">$0</p>
          <p className="text-gray-400 text-sm">Pending</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 text-center">
        <span className="text-6xl mb-4 block">💳</span>
        <h3 className="text-xl font-bold text-white mb-2">Payment System Integration</h3>
        <p className="text-gray-400">
          Stripe Connect integration coming soon. Track all payments, payouts, and platform fees.
        </p>
      </div>
    </div>
  )
}
