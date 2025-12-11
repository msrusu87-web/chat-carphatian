/**
 * Stripe Connect Onboarding API
 * Freelancers connect their Stripe account to receive payments
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createConnectedAccount, createAccountLink } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any

    // Only freelancers can create connected accounts
    if (user.role !== 'freelancer') {
      return NextResponse.json(
        { error: 'Only freelancers can connect Stripe accounts' },
        { status: 403 }
      )
    }

    // Get user from database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, session.user.email)
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let accountId = dbUser.stripe_account_id

    // Create Stripe account if doesn't exist
    if (!accountId) {
      const account = await createConnectedAccount(session.user.email)
      accountId = account.id

      // Save to database
      await db
        .update(users)
        .set({ stripe_account_id: accountId })
        .where(eq(users.id, dbUser.id))
    }

    // Create account link for onboarding
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/freelancer/earnings?stripe_onboarding=success`
    const refreshUrl = `${process.env.NEXT_PUBLIC_APP_URL}/freelancer/earnings?stripe_onboarding=refresh`

    const accountLink = await createAccountLink(accountId, returnUrl, refreshUrl)

    return NextResponse.json({ url: accountLink.url })

  } catch (error: any) {
    console.error('Error creating Stripe account:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create Stripe account' },
      { status: 500 }
    )
  }
}
