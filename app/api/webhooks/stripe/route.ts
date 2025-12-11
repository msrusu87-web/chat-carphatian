/**
 * Stripe Webhook Handler
 * 
 * Handles Stripe webhook events for payment processing:
 * - payment_intent.succeeded - Payment completed
 * - payment_intent.payment_failed - Payment failed
 * - account.updated - Stripe Connect account updated
 * - payout.paid - Payout to freelancer completed
 * - charge.dispute.created - Dispute opened
 * 
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { payments, milestones, contracts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Lazy load Stripe to avoid build errors when key not set
function getStripe() {
  const Stripe = require('stripe').default
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-11-17.clover',
  })
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

/**
 * POST /api/webhooks/stripe
 * 
 * Receives and processes Stripe webhook events.
 * Verifies signature to ensure authenticity.
 */
export async function POST(req: NextRequest) {
  // Skip if Stripe is not configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('Stripe not configured, skipping webhook')
    return NextResponse.json({ received: true, skipped: true })
  }

  try {
    const stripe = getStripe()
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: any

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      case 'account.updated':
        await handleAccountUpdated(event.data.object)
        break

      case 'payout.paid':
        await handlePayoutPaid(event.data.object)
        break

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful payment
 * Updates payment and milestone status
 */
async function handlePaymentSuccess(paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id)

  const { milestone_id } = paymentIntent.metadata || {}

  if (!milestone_id) {
    console.log('No milestone_id in payment metadata')
    return
  }

  // Update payment record
  await db
    .update(payments)
    .set({
      status: 'completed',
      updated_at: new Date(),
    })
    .where(eq(payments.stripe_payment_id, paymentIntent.id))

  // Update milestone to in_escrow
  await db
    .update(milestones)
    .set({
      status: 'in_escrow',
      updated_at: new Date(),
    })
    .where(eq(milestones.id, parseInt(milestone_id)))

  console.log(`Milestone ${milestone_id} funded, now in escrow`)
}

/**
 * Handle failed payment
 * Updates payment status
 */
async function handlePaymentFailed(paymentIntent: any) {
  console.log('Payment failed:', paymentIntent.id)

  await db
    .update(payments)
    .set({
      status: 'failed',
      updated_at: new Date(),
    })
    .where(eq(payments.stripe_payment_id, paymentIntent.id))
}

/**
 * Handle Stripe Connect account updates
 * Track freelancer verification status
 */
async function handleAccountUpdated(account: any) {
  console.log('Account updated:', account.id)
  
  if (account.charges_enabled && account.payouts_enabled) {
    console.log(`Account ${account.id} fully verified and ready for payments`)
  }
}

/**
 * Handle payout completion
 * Record that freelancer received their funds
 */
async function handlePayoutPaid(payout: any) {
  console.log('Payout completed:', payout.id)
}

/**
 * Handle dispute creation
 * Mark contract as disputed
 */
async function handleDisputeCreated(dispute: any) {
  console.log('Dispute created:', dispute.id)

  const { contract_id } = dispute.metadata || {}

  if (contract_id) {
    await db
      .update(contracts)
      .set({
        status: 'disputed',
        updated_at: new Date(),
      })
      .where(eq(contracts.id, parseInt(contract_id)))

    console.log(`Contract ${contract_id} marked as disputed`)
  }
}
