/**
 * Client Payments Page
 * Built by Carphatian
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'

export default async function ClientPaymentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user as any
  if (user.role !== 'client' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Payments</h1>
        <p className="text-gray-400 mt-1">Manage your payment methods and history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-4xl font-bold text-white mb-1">$0</p>
          <p className="text-gray-400 text-sm">Total Spent</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <p className="text-4xl font-bold text-yellow-400 mb-1">$0</p>
          <p className="text-gray-400 text-sm">In Escrow</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl">📅</span>
          </div>
          <p className="text-4xl font-bold text-green-400 mb-1">$0</p>
          <p className="text-gray-400 text-sm">This Month</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Payment Methods</h2>
        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">💳</span>
          <h3 className="text-lg font-bold text-white mb-2">No Payment Methods</h3>
          <p className="text-gray-400 mb-6">Add a payment method to start hiring freelancers</p>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all">
            Add Payment Method
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Payment History</h2>
        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">📜</span>
          <p className="text-gray-400">No payment history yet</p>
        </div>
      </div>
    </div>
  )
}
