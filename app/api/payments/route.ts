/**
 * Payment API - Create Payment Intent
 * Client initiates escrow payment when accepting application
 * Built by Carphatian
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { db } from '@/lib/db'
import { payments, contracts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createEscrowPayment } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contractId } = await req.json()

    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID required' }, { status: 400 })
    }

    // Get contract details
    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, contractId),
      with: {
        job: true,
        client: true,
        freelancer: true,
      }
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Verify user is the client
    const user = session.user as any
    if (contract.client.email !== session.user.email && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create payment intent
    const paymentIntent = await createEscrowPayment({
      amount: parseFloat(contract.total_amount),
      contractId: contract.id,
      clientEmail: contract.client.email,
      description: `Escrow payment for: ${contract.job.title}`,
    })

    // Record payment in database
    await db.insert(payments).values({
      contract_id: contract.id,
      payer_id: contract.client_id,
      amount: contract.total_amount,
      status: 'pending',
      payment_type: 'escrow',
      stripe_payment_intent_id: paymentIntent.id,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })

  } catch (error: any) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}
