'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface AnalyticsData {
  period: number
  overview: {
    users: {
      total: number
      clients: number
      freelancers: number
      admins: number
      newThisPeriod: number
      growth: string
    }
    jobs: {
      total: number
      open: number
      inProgress: number
      completed: number
      cancelled: number
      newThisPeriod: number
      growth: string
    }
    contracts: {
      total: number
      active: number
      completed: number
      cancelled: number
      disputed: number
    }
    applications: {
      total: number
      pending: number
      accepted: number
      rejected: number
      acceptanceRate: string
    }
    payments: {
      total: number
      totalAmount: number
      completed: number
      pending: number
      completedAmount: number
      periodAmount: number
      periodCount: number
    }
    messages: {
      total: number
      periodCount: number
    }
    reviews: {
      total: number
      avgRating: string
    }
  }
  charts: {
    daily: Array<{
      date: string
      label: string
      users: number
      jobs: number
      contracts: number
    }>
  }
  generatedAt: string
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue,
  color = 'blue' 
}: { 
  title: string
  value: string | number
  subtitle?: string
  icon: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan'
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    cyan: 'from-cyan-500 to-cyan-600',
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
              <span>{trendValue}%</span>
              <span className="text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function MiniChart({ data, dataKey, color }: { data: any[], dataKey: string, color: string }) {
  const maxVal = Math.max(...data.map(d => d[dataKey]), 1)
  
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className={`w-full rounded-t ${color} transition-all`}
            style={{ height: `${(item[dataKey] / maxVal) * 100}%`, minHeight: '4px' }}
          />
          <span className="text-[10px] text-gray-500">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function ProgressBar({ value, max, color, label }: { value: number, max: number, color: string, label: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState('30')
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      redirect('/login')
    }
    fetchAnalytics()
  }, [session, status, period])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        setError('Failed to load analytics')
      }
    } catch (err) {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Platform performance and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Users"
              value={data.overview.users.total}
              subtitle={`+${data.overview.users.newThisPeriod} this period`}
              icon="👥"
              trend={parseFloat(data.overview.users.growth) > 0 ? 'up' : parseFloat(data.overview.users.growth) < 0 ? 'down' : 'neutral'}
              trendValue={data.overview.users.growth}
              color="blue"
            />
            <StatCard
              title="Total Jobs"
              value={data.overview.jobs.total}
              subtitle={`${data.overview.jobs.open} open`}
              icon="💼"
              trend={parseFloat(data.overview.jobs.growth) > 0 ? 'up' : parseFloat(data.overview.jobs.growth) < 0 ? 'down' : 'neutral'}
              trendValue={data.overview.jobs.growth}
              color="purple"
            />
            <StatCard
              title="Active Contracts"
              value={data.overview.contracts.active}
              subtitle={`${data.overview.contracts.total} total`}
              icon="📄"
              color="green"
            />
            <StatCard
              title="Revenue"
              value={formatCurrency(data.overview.payments.completedAmount)}
              subtitle={`${formatCurrency(data.overview.payments.periodAmount)} this period`}
              icon="💰"
              color="orange"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Activity Chart */}
            <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Daily Activity (Last 7 Days)</h3>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="text-gray-400 text-sm mb-2">New Users</p>
                  <MiniChart data={data.charts.daily} dataKey="users" color="bg-blue-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">New Jobs</p>
                  <MiniChart data={data.charts.daily} dataKey="jobs" color="bg-purple-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">New Contracts</p>
                  <MiniChart data={data.charts.daily} dataKey="contracts" color="bg-green-500" />
                </div>
              </div>
            </div>

            {/* User Distribution */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">User Distribution</h3>
              <div className="space-y-4">
                <ProgressBar 
                  value={data.overview.users.clients} 
                  max={data.overview.users.total} 
                  color="bg-blue-500" 
                  label="Clients" 
                />
                <ProgressBar 
                  value={data.overview.users.freelancers} 
                  max={data.overview.users.total} 
                  color="bg-purple-500" 
                  label="Freelancers" 
                />
                <ProgressBar 
                  value={data.overview.users.admins} 
                  max={data.overview.users.total} 
                  color="bg-orange-500" 
                  label="Admins" 
                />
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Jobs Breakdown */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Jobs Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">🟢 Open</span>
                  <span className="text-white font-medium">{data.overview.jobs.open}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">🔵 In Progress</span>
                  <span className="text-white font-medium">{data.overview.jobs.inProgress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">✅ Completed</span>
                  <span className="text-white font-medium">{data.overview.jobs.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">❌ Cancelled</span>
                  <span className="text-white font-medium">{data.overview.jobs.cancelled}</span>
                </div>
              </div>
            </div>

            {/* Applications */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Applications</h3>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-white">{data.overview.applications.acceptanceRate}%</p>
                <p className="text-gray-400 text-sm">Acceptance Rate</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Pending</span>
                  <span className="text-yellow-400">{data.overview.applications.pending}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Accepted</span>
                  <span className="text-green-400">{data.overview.applications.accepted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rejected</span>
                  <span className="text-red-400">{data.overview.applications.rejected}</span>
                </div>
              </div>
            </div>

            {/* Contracts */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contracts</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">🟢 Active</span>
                  <span className="text-green-400 font-medium">{data.overview.contracts.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">✅ Completed</span>
                  <span className="text-white font-medium">{data.overview.contracts.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">❌ Cancelled</span>
                  <span className="text-gray-400 font-medium">{data.overview.contracts.cancelled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">⚠️ Disputed</span>
                  <span className="text-orange-400 font-medium">{data.overview.contracts.disputed}</span>
                </div>
              </div>
            </div>

            {/* Engagement */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Engagement</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Messages</span>
                    <span className="text-white font-medium">{data.overview.messages.total}</span>
                  </div>
                  <p className="text-xs text-gray-500">+{data.overview.messages.periodCount} this period</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Reviews</span>
                    <span className="text-white font-medium">{data.overview.reviews.total}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    {'★'.repeat(Math.round(parseFloat(data.overview.reviews.avgRating)))}
                    {'☆'.repeat(5 - Math.round(parseFloat(data.overview.reviews.avgRating)))}
                    <span className="text-white ml-1">{data.overview.reviews.avgRating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Summary */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">💳 Payment Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{data.overview.payments.total}</p>
                <p className="text-gray-400 text-sm">Total Transactions</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">{formatCurrency(data.overview.payments.completedAmount)}</p>
                <p className="text-gray-400 text-sm">Completed Payments</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">{data.overview.payments.pending}</p>
                <p className="text-gray-400 text-sm">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">{data.overview.payments.periodCount}</p>
                <p className="text-gray-400 text-sm">This Period</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">{formatCurrency(data.overview.payments.periodAmount)}</p>
                <p className="text-gray-400 text-sm">Period Revenue</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-gray-500 text-sm">
            Last updated: {new Date(data.generatedAt).toLocaleString()}
          </div>
        </>
      )}
    </div>
  )
}
