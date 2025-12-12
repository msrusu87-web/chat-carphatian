'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

interface HealthData {
  status: string
  timestamp: string
  responseTime: number
  services: {
    database: { status: string; latency: number }
    email: { status: string }
    api: { status: string; latency: number }
  }
  system: {
    platform: string
    arch: string
    nodeVersion: string
    hostname: string
    cpuCores: number
    cpuModel: string
    cpuUsage: string
    memory: {
      total: string
      used: string
      free: string
      usagePercent: string
    }
    uptime: {
      system: string
      process: string
    }
  }
  process: {
    pid: number
    memory: {
      heapUsed: string
      heapTotal: string
      rss: string
      external: string
    }
  }
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    healthy: 'bg-green-500',
    unhealthy: 'bg-red-500',
    degraded: 'bg-yellow-500',
    unknown: 'bg-gray-500'
  }
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white ${colors[status as keyof typeof colors] || colors.unknown}`}>
      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function MetricCard({ title, value, subtitle, icon, color = 'blue' }: { 
  title: string
  value: string | number
  subtitle?: string
  icon: string
  color?: string
}) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    cyan: 'from-cyan-500 to-cyan-600',
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center text-xl`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-400 text-xs">{title}</p>
          <p className="text-white font-semibold">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

function ProgressRing({ percent, size = 80, strokeWidth = 8 }: { percent: number, size?: number, strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percent / 100) * circumference
  
  const color = percent > 80 ? '#ef4444' : percent > 60 ? '#f59e0b' : '#22c55e'
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span className="absolute text-white font-bold text-lg">{percent}%</span>
    </div>
  )
}

export default function HealthPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<HealthData | null>(null)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user as any)?.role !== 'admin') {
      redirect('/login')
    }
    fetchHealth()
  }, [session, status])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchHealth, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/admin/health')
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setError('')
      } else {
        setError('Failed to fetch health data')
      }
    } catch (err) {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">System Health</h1>
          <p className="text-gray-400 mt-1">Real-time monitoring and diagnostics</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-gray-400 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            Auto-refresh (10s)
          </label>
          <button
            onClick={fetchHealth}
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
          {/* Overall Status */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ${
                  data.status === 'healthy' ? 'bg-green-500/20' : 
                  data.status === 'degraded' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                }`}>
                  {data.status === 'healthy' ? '✅' : data.status === 'degraded' ? '⚠️' : '❌'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">System Status</h2>
                  <StatusBadge status={data.status} />
                </div>
              </div>
              <div className="text-right text-sm text-gray-400">
                <p>Response time: <span className="text-white font-medium">{data.responseTime}ms</span></p>
                <p>Last check: {new Date(data.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Services Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">🗄️</span>
                <StatusBadge status={data.services.database.status} />
              </div>
              <h3 className="text-lg font-semibold text-white">Database</h3>
              <p className="text-gray-400 text-sm">PostgreSQL</p>
              <p className="text-gray-500 text-sm mt-2">Latency: {data.services.database.latency}ms</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">📧</span>
                <StatusBadge status={data.services.email.status} />
              </div>
              <h3 className="text-lg font-semibold text-white">Email Service</h3>
              <p className="text-gray-400 text-sm">Postfix SMTP</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">🌐</span>
                <StatusBadge status={data.services.api.status} />
              </div>
              <h3 className="text-lg font-semibold text-white">API Server</h3>
              <p className="text-gray-400 text-sm">Next.js {data.system.nodeVersion}</p>
              <p className="text-gray-500 text-sm mt-2">Latency: {data.services.api.latency}ms</p>
            </div>
          </div>

          {/* Resource Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* CPU & Memory Gauges */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Resource Usage</h3>
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <ProgressRing percent={parseFloat(data.system.cpuUsage)} />
                  <p className="text-gray-400 text-sm mt-2">CPU Usage</p>
                </div>
                <div className="text-center">
                  <ProgressRing percent={parseFloat(data.system.memory.usagePercent)} />
                  <p className="text-gray-400 text-sm mt-2">Memory Usage</p>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Hostname</span>
                  <span className="text-white font-medium">{data.system.hostname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform</span>
                  <span className="text-white font-medium">{data.system.platform} ({data.system.arch})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CPU</span>
                  <span className="text-white font-medium">{data.system.cpuCores} cores</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Node.js</span>
                  <span className="text-white font-medium">{data.system.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Process ID</span>
                  <span className="text-white font-medium">{data.process.pid}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Memory Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard title="Total Memory" value={data.system.memory.total} icon="💾" color="blue" />
            <MetricCard title="Used Memory" value={data.system.memory.used} icon="📊" color="orange" />
            <MetricCard title="Free Memory" value={data.system.memory.free} icon="✨" color="green" />
            <MetricCard title="Heap Used" value={data.process.memory.heapUsed} icon="🧠" color="purple" />
          </div>

          {/* Uptime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl">
                  ⏱️
                </div>
                <div>
                  <p className="text-gray-400 text-sm">System Uptime</p>
                  <p className="text-2xl font-bold text-white">{data.system.uptime.system}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-2xl">
                  🚀
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Process Uptime</p>
                  <p className="text-2xl font-bold text-white">{data.system.uptime.process}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
