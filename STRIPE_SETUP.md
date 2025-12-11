# Stripe Payment Integration Setup Guide

## Overview
Phase 6 has been implemented with full Stripe payment integration including:
- Escrow payments for contracts
- Stripe Connect for freelancer payouts
- Webhook handling for payment events
- Platform fee collection (15%)

## Implementation Status

### ✅ Completed
1. **Core Infrastructure**
   - `lib/stripe.ts` - Utility functions for all Stripe operations
   - `stripe_account_id` column added to users table
   - Stripe packages installed (@stripe/stripe-js, @stripe/react-stripe-js)

2. **Payment Flow**
   - `/api/payments` - Creates Payment Intent for escrow
   - `PaymentModal.tsx` - Client-side payment form (Stripe Elements)
   - Integration with contract creation workflow
   - Database tracking in `payments` table

3. **Stripe Connect**
   - `/api/stripe/connect` - Freelancer account onboarding
   - `/api/stripe/connect/status` - Account status check
   - `StripeConnectButton.tsx` - UI component for freelancers
   - Integrated into freelancer earnings page

4. **Milestone Payouts**
   - Updated `/api/milestones/[id]/release` to trigger Stripe transfers
   - Automatic platform fee deduction (15%)
   - Transfer to freelancer's connected account

5. **Webhook Handler**
   - `/api/webhooks/stripe/route.ts` (already existed)
   - Handles: payment_intent.succeeded, payment_failed, account.updated, payouts, disputes

## Required Configuration

### Environment Variables
Add these to `.env.local` (placeholders already added):

```bash
STRIPE_SECRET_KEY=sk_test_...              # Get from Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...            # Get after webhook setup
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # For frontend
NEXT_PUBLIC_APP_URL=https://chat.carphatian.ro   # Already set
```

### Stripe Dashboard Setup

1. **Get API Keys**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy "Secret key" → STRIPE_SECRET_KEY
   - Copy "Publishable key" → NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

2. **Setup Webhooks**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://chat.carphatian.ro/api/webhooks/stripe`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `account.updated`
     - `transfer.created`
     - `payout.paid`
     - `charge.dispute.created`
   - Copy "Signing secret" → STRIPE_WEBHOOK_SECRET

3. **Enable Stripe Connect**
   - Go to: https://dashboard.stripe.com/test/connect/accounts/overview
   - Enable "Express" account type
   - Platform settings: 15% application fee

## How It Works

### Contract Creation & Payment Flow
1. Client clicks "Hire" on application
2. Contract created in database
3. `PaymentModal` opens with Stripe payment form
4. Client enters payment details
5. Payment held in escrow (manual capture)
6. Contract status: "active"

### Milestone Release & Payout Flow
1. Client releases milestone payment
2. Backend calls `captureEscrowPayment()` - captures held funds
3. Backend calls `releasePaymentToFreelancer()` - transfers to freelancer
4. Platform fee (15%) automatically deducted
5. Freelancer receives payment to connected bank account

### Stripe Connect Onboarding
1. Freelancer visits `/freelancer/earnings`
2. Clicks "Connect Stripe Account"
3. Backend creates Stripe Express account
4. Freelancer redirected to Stripe onboarding
5. Completes bank account verification
6. Status updates to "connected"

## Testing

### Test Mode Setup
1. Use Stripe test API keys (sk_test_, pk_test_)
2. Test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

### Test Workflow
```bash
# 1. Create contract (as client)
POST /api/contracts
{
  "application_id": 1,
  "total_amount": "1000.00"
}

# 2. Pay with Stripe (triggers PaymentModal)
# Use test card: 4242 4242 4242 4242, any future date, any 3 digits

# 3. Release milestone (as client)
POST /api/milestones/1/release

# 4. Check freelancer earnings
# Verify $850 transfer ($1000 - 15% = $850)
```

### Webhook Testing
```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
```

## Database Schema

### Users Table
```sql
ALTER TABLE users ADD COLUMN stripe_account_id VARCHAR(255);
```

### Payments Table (existing)
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  contract_id INTEGER REFERENCES contracts(id),
  milestone_id INTEGER REFERENCES milestones(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed, refunded
  stripe_payment_id VARCHAR(255), -- Payment Intent ID
  payment_method VARCHAR(100), -- card, bank_transfer
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Reference

### POST /api/payments
Creates Payment Intent for contract escrow
```json
Request: { "contractId": 123 }
Response: { "clientSecret": "pi_...", "paymentIntentId": "pi_..." }
```

### POST /api/stripe/connect
Creates/retrieves freelancer Stripe account
```json
Response: { "url": "https://connect.stripe.com/...", "accountId": "acct_..." }
```

### GET /api/stripe/connect/status
Checks freelancer's account status
```json
Response: { "status": "connected|pending|not_connected", "stripeAccountId": "acct_..." }
```

### POST /api/milestones/[id]/release
Releases milestone payment with automatic payout
```json
Response: {
  "message": "Payment released successfully",
  "paymentProcessed": true,
  "allMilestonesReleased": false
}
```

## Utility Functions (lib/stripe.ts)

- `createEscrowPayment()` - Creates Payment Intent with manual capture
- `captureEscrowPayment()` - Captures held payment
- `releasePaymentToFreelancer()` - Transfers to connected account with fee
- `createConnectedAccount()` - Creates Express account for freelancer
- `createAccountLink()` - Generates onboarding URL
- `refundPayment()` - Refunds payment to client
- `calculatePlatformFee()` - Calculates 15% fee

## Production Checklist

- [ ] Add live Stripe API keys to production environment
- [ ] Configure production webhook endpoint in Stripe Dashboard
- [ ] Enable Stripe Connect in production mode
- [ ] Test full payment flow end-to-end
- [ ] Set up bank account for platform fee collection
- [ ] Configure payout schedule for freelancers
- [ ] Add Terms of Service link in payment modal
- [ ] Test dispute handling
- [ ] Monitor webhook delivery in Stripe Dashboard
- [ ] Set up email notifications for payment events

## Troubleshooting

### Payment fails silently
- Check STRIPE_SECRET_KEY is set correctly
- Verify webhook secret matches Stripe Dashboard
- Check server logs for Stripe API errors

### Freelancer can't connect Stripe
- Ensure NEXT_PUBLIC_APP_URL is correct
- Check redirect URLs in Stripe Dashboard
- Verify Express account type is enabled

### Payouts not working
- Confirm freelancer completed onboarding (`charges_enabled: true`)
- Check platform has sufficient balance for transfers
- Verify stripe_account_id is saved in database

## Next Steps
1. Add Stripe API keys to environment
2. Test payment flow with test cards
3. Configure webhooks in Stripe Dashboard
4. Enable Connect in production
5. Phase 7: Notifications & Reviews

Built by Carphatian 🚀
