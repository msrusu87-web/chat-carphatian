/**
 * Admin Analytics API
 * 
 * Provides comprehensive platform analytics with caching.
 * Cache TTL: 60 seconds (refreshed frequently for real-time feel)
 * 
 * Security:
 * - Requires admin role
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { users, jobs, contracts, payments, applications, messages, reviews } from '@/lib/db/schema'
import { sql, count } from 'drizzle-orm'
import { cached, CacheTTL, CacheKeys, cacheDelete } from '@/lib/cache'

// Fetch analytics data with caching
async function getAnalyticsData(period: number) {
  const periodDateStr = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString()
  const previousPeriodDateStr = new Date(Date.now() - period * 2 * 24 * 60 * 60 * 1000).toISOString()

  // User Statistics
  const [userStats] = await db.select({
    total: count(),
    clients: sql<number>`count(*) filter (where role = 'client')`,
    freelancers: sql<number>`count(*) filter (where role = 'freelancer')`,
    admins: sql<number>`count(*) filter (where role = 'admin')`,
  }).from(users)

  const [newUsersCount] = await db.select({
    count: count(),
  }).from(users).where(sql`created_at >= ${periodDateStr}::timestamp`)

  // Job Statistics  
  const [jobStats] = await db.select({
    total: count(),
    open: sql<number>`count(*) filter (where status = 'open')`,
    inProgress: sql<number>`count(*) filter (where status = 'in_progress')`,
    completed: sql<number>`count(*) filter (where status = 'completed')`,
    cancelled: sql<number>`count(*) filter (where status = 'cancelled')`,
  }).from(jobs)

  const [newJobsCount] = await db.select({
    count: count(),
  }).from(jobs).where(sql`created_at >= ${periodDateStr}::timestamp`)

  // Contract Statistics
  const [contractStats] = await db.select({
    total: count(),
    active: sql<number>`count(*) filter (where status = 'active')`,
    completed: sql<number>`count(*) filter (where status = 'completed')`,
    cancelled: sql<number>`count(*) filter (where status = 'cancelled')`,
    disputed: sql<number>`count(*) filter (where status = 'disputed')`,
  }).from(contracts)

  // Application Statistics
  const [appStats] = await db.select({
    total: count(),
    pending: sql<number>`count(*) filter (where status = 'pending')`,
    accepted: sql<number>`count(*) filter (where status = 'accepted')`,
    rejected: sql<number>`count(*) filter (where status = 'rejected')`,
  }).from(applications)

  // Payment Statistics
  const [paymentStats] = await db.select({
    total: count(),
    totalAmount: sql<number>`coalesce(sum(amount), 0)`,
    completed: sql<number>`count(*) filter (where status = 'completed')`,
    pending: sql<number>`count(*) filter (where status = 'pending')`,
    completedAmount: sql<number>`coalesce(sum(amount) filter (where status = 'completed'), 0)`,
  }).from(payments)

  const [periodPayments] = await db.select({
    count: count(),
    amount: sql<number>`coalesce(sum(amount), 0)`,
  }).from(payments).where(sql`created_at >= ${periodDateStr}::timestamp`)

  // Message Statistics
  const [messageStats] = await db.select({
    total: count(),
  }).from(messages)

  const [periodMessages] = await db.select({
    count: count(),
  }).from(messages).where(sql`created_at >= ${periodDateStr}::timestamp`)

  // Review Statistics
  const [reviewStats] = await db.select({
    total: count(),
    avgRating: sql<number>`coalesce(avg(rating), 0)`,
  }).from(reviews)

  // Calculate growth rates
  const [previousUsers] = await db.select({
    count: count(),
  }).from(users).where(sql`created_at >= ${previousPeriodDateStr}::timestamp AND created_at < ${periodDateStr}::timestamp`)

  const [previousJobs] = await db.select({
    count: count(),
  }).from(jobs).where(sql`created_at >= ${previousPeriodDateStr}::timestamp AND created_at < ${periodDateStr}::timestamp`)

  // Daily data for charts (last 7 days) - batch query for performance
  const dailyData = []
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date()
    dayStart.setDate(dayStart.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)
    
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const dayStartStr = dayStart.toISOString()
    const dayEndStr = dayEnd.toISOString()

    // Run queries in parallel for each day
    const [dayUsers, dayJobs, dayContracts] = await Promise.all([
      db.select({ count: count() }).from(users)
        .where(sql`created_at >= ${dayStartStr}::timestamp AND created_at <= ${dayEndStr}::timestamp`),
      db.select({ count: count() }).from(jobs)
        .where(sql`created_at >= ${dayStartStr}::timestamp AND created_at <= ${dayEndStr}::timestamp`),
      db.select({ count: count() }).from(contracts)
        .where(sql`created_at >= ${dayStartStr}::timestamp AND created_at <= ${dayEndStr}::timestamp`),
    ])

    dailyData.push({
      date: dayStart.toISOString().split('T')[0],
      label: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
      users: dayUsers[0]?.count || 0,
      jobs: dayJobs[0]?.count || 0,
      contracts: dayContracts[0]?.count || 0,
    })
  }

  // Calculate growth percentages
  const userGrowth = previousUsers?.count > 0 
    ? ((newUsersCount?.count - previousUsers?.count) / previousUsers?.count * 100).toFixed(1)
    : newUsersCount?.count > 0 ? '+100' : '0'

  const jobGrowth = previousJobs?.count > 0
    ? ((newJobsCount?.count - previousJobs?.count) / previousJobs?.count * 100).toFixed(1)
    : newJobsCount?.count > 0 ? '+100' : '0'

  return {
    period,
    overview: {
      users: {
        total: userStats?.total || 0,
        clients: userStats?.clients || 0,
        freelancers: userStats?.freelancers || 0,
        admins: userStats?.admins || 0,
        newThisPeriod: newUsersCount?.count || 0,
        growth: userGrowth,
      },
      jobs: {
        total: jobStats?.total || 0,
        open: jobStats?.open || 0,
        inProgress: jobStats?.inProgress || 0,
        completed: jobStats?.completed || 0,
        cancelled: jobStats?.cancelled || 0,
        newThisPeriod: newJobsCount?.count || 0,
        growth: jobGrowth,
      },
      contracts: {
        total: contractStats?.total || 0,
        active: contractStats?.active || 0,
        completed: contractStats?.completed || 0,
        cancelled: contractStats?.cancelled || 0,
        disputed: contractStats?.disputed || 0,
      },
      applications: {
        total: appStats?.total || 0,
        pending: appStats?.pending || 0,
        accepted: appStats?.accepted || 0,
        rejected: appStats?.rejected || 0,
        acceptanceRate: appStats?.total > 0 
          ? ((appStats?.accepted / appStats?.total) * 100).toFixed(1) 
          : '0',
      },
      payments: {
        total: paymentStats?.total || 0,
        totalAmount: Number(paymentStats?.totalAmount) || 0,
        completed: paymentStats?.completed || 0,
        pending: paymentStats?.pending || 0,
        completedAmount: Number(paymentStats?.completedAmount) || 0,
        periodAmount: Number(periodPayments?.amount) || 0,
        periodCount: periodPayments?.count || 0,
      },
      messages: {
        total: messageStats?.total || 0,
        periodCount: periodMessages?.count || 0,
      },
      reviews: {
        total: reviewStats?.total || 0,
        avgRating: Number(reviewStats?.avgRating)?.toFixed(1) || '0.0',
      },
    },
    charts: {
      daily: dailyData,
    },
    generatedAt: new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const period = parseInt(searchParams.get('period') || '30')
    const noCache = searchParams.get('nocache') === 'true'

    // Use cached data unless nocache is specified
    if (noCache) {
      await cacheDelete(CacheKeys.analytics(period))
    }

    const data = await cached(
      CacheKeys.analytics(period),
      () => getAnalyticsData(period),
      CacheTTL.SHORT // 60 seconds cache
    )

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch analytics' }, { status: 500 })
  }
}
