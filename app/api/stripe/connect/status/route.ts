/**
 * Stripe Connect Status API
 * GET /api/stripe/connect/status - Check freelancer's Stripe account status
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user from database
    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check Stripe account status
    let status: 'not_connected' | 'pending' | 'connected' = 'not_connected'

    if (user.stripe_account_id) {
      // If Stripe keys are configured, check account status
      if (process.env.STRIPE_SECRET_KEY) {
        try {
          const Stripe = (await import('stripe')).default
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-11-17.clover',
          })

          const account = await stripe.accounts.retrieve(user.stripe_account_id)
          
          // Check if charges are enabled (account fully onboarded)
          status = account.charges_enabled ? 'connected' : 'pending'
        } catch (err) {
          console.error('Stripe account check failed:', err)
          status = 'pending'
        }
      } else {
        status = 'pending'
      }
    }

    return NextResponse.json({
      status,
      stripeAccountId: user.stripe_account_id || null,
    })
  } catch (error: any) {
    console.error('Stripe status check error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
