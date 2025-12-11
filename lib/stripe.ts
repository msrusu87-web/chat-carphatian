/**
 * Stripe Configuration and Utilities
 * Handles payment processing, escrow, and freelancer payouts
 * Built by Carphatian
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

/**
 * Create a Payment Intent for escrow
 * Client pays when contract is created
 */
export async function createEscrowPayment({
  amount,
  contractId,
  clientEmail,
  description,
}: {
  amount: number
  contractId: number
  clientEmail: string
  description: string
}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    metadata: {
      contract_id: contractId.toString(),
      type: 'escrow',
    },
    description,
    receipt_email: clientEmail,
    capture_method: 'manual', // Hold funds in escrow
  })

  return paymentIntent
}

/**
 * Capture escrowed payment when milestone is released
 */
export async function captureEscrowPayment(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId)
  return paymentIntent
}

/**
 * Release payment to freelancer
 * Transfer funds from platform to freelancer's connected account
 */
export async function releasePaymentToFreelancer({
  amount,
  freelancerStripeAccountId,
  platformFee,
  contractId,
  milestoneId,
}: {
  amount: number
  freelancerStripeAccountId: string
  platformFee: number
  contractId: number
  milestoneId: number
}) {
  const transfer = await stripe.transfers.create({
    amount: Math.round((amount - platformFee) * 100), // Amount minus platform fee
    currency: 'usd',
    destination: freelancerStripeAccountId,
    metadata: {
      contract_id: contractId.toString(),
      milestone_id: milestoneId.toString(),
      platform_fee: platformFee.toString(),
    },
  })

  return transfer
}

/**
 * Create Stripe Connect account for freelancer
 */
export async function createConnectedAccount(email: string, country: string = 'US') {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    country,
    capabilities: {
      transfers: { requested: true },
    },
    business_type: 'individual',
  })

  return account
}

/**
 * Create account link for freelancer onboarding
 */
export async function createAccountLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: 'account_onboarding',
  })

  return accountLink
}

/**
 * Refund payment to client
 */
export async function refundPayment(paymentIntentId: string, amount?: number) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  })

  return refund
}

/**
 * Get account balance
 */
export async function getAccountBalance(accountId: string) {
  const balance = await stripe.balance.retrieve({
    stripeAccount: accountId,
  })

  return balance
}

/**
 * Calculate platform fee (15%)
 */
export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * 0.15 * 100) / 100
}
