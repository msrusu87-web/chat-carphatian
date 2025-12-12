import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import os from 'os'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startTime = Date.now()
    
    // Database health check
    let dbStatus = 'healthy'
    let dbLatency = 0
    try {
      const dbStart = Date.now()
      await db.execute(sql`SELECT 1`)
      dbLatency = Date.now() - dbStart
    } catch (err) {
      dbStatus = 'unhealthy'
    }

    // System metrics
    const cpus = os.cpus()
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(1)
    
    // Calculate CPU usage (average across all cores)
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0)
      const idle = cpu.times.idle
      return acc + ((total - idle) / total * 100)
    }, 0) / cpus.length

    // Process memory
    const processMemory = process.memoryUsage()
    
    // Uptime
    const systemUptime = os.uptime()
    const processUptime = process.uptime()

    // Format uptime
    const formatUptime = (seconds: number) => {
      const days = Math.floor(seconds / 86400)
      const hours = Math.floor((seconds % 86400) / 3600)
      const mins = Math.floor((seconds % 3600) / 60)
      if (days > 0) return `${days}d ${hours}h ${mins}m`
      if (hours > 0) return `${hours}h ${mins}m`
      return `${mins}m`
    }

    // Email service check (just check if postfix is running)
    let emailStatus = 'unknown'
    try {
      const nodemailer = require('nodemailer')
      const transporter = nodemailer.createTransport({
        host: '127.0.0.1',
        port: 25,
        secure: false,
        tls: { rejectUnauthorized: false }
      })
      await transporter.verify()
      emailStatus = 'healthy'
    } catch (err) {
      emailStatus = 'unhealthy'
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime,
      services: {
        database: {
          status: dbStatus,
          latency: dbLatency
        },
        email: {
          status: emailStatus
        },
        api: {
          status: 'healthy',
          latency: responseTime
        }
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        hostname: os.hostname(),
        cpuCores: cpus.length,
        cpuModel: cpus[0]?.model || 'Unknown',
        cpuUsage: cpuUsage.toFixed(1),
        memory: {
          total: (totalMemory / 1024 / 1024 / 1024).toFixed(2) + ' GB',
          used: (usedMemory / 1024 / 1024 / 1024).toFixed(2) + ' GB',
          free: (freeMemory / 1024 / 1024 / 1024).toFixed(2) + ' GB',
          usagePercent: memoryUsagePercent
        },
        uptime: {
          system: formatUptime(systemUptime),
          process: formatUptime(processUptime),
          systemSeconds: systemUptime,
          processSeconds: processUptime
        }
      },
      process: {
        pid: process.pid,
        memory: {
          heapUsed: (processMemory.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
          heapTotal: (processMemory.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
          rss: (processMemory.rss / 1024 / 1024).toFixed(2) + ' MB',
          external: (processMemory.external / 1024 / 1024).toFixed(2) + ' MB'
        }
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({ 
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
