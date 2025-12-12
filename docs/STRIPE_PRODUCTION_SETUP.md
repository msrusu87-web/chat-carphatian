# Stripe Production Mode Setup Guide

## 🔴 Critical - Required Before Accepting Real Payments

This guide walks you through switching from Stripe test mode to production mode on the Carphatian platform.

## Prerequisites

Before switching to production, ensure:

- ✅ Business is verified in Stripe Dashboard
- ✅ Bank account connected for payouts
- ✅ Business information complete (legal name, address, tax ID)
- ✅ Terms of service and privacy policy URLs configured
- ✅ All test payment flows verified and working

## Step 1: Stripe Dashboard Configuration

### 1.1 Activate Stripe Account

1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Complete the "Activate Account" checklist:
   - Provide business details
   - Add bank account for payouts
   - Verify business identity
   - Accept Stripe Services Agreement

### 1.2 Configure Stripe Connect Settings

1. Navigate to **Settings → Connect**
2. Configure branding:
   - Upload platform logo
   - Set brand colors
   - Customize connect onboarding flow
3. Set platform fees (currently 15% in code)
4. Configure payout schedules for connected accounts

### 1.3 Set Up Production Webhook

1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL: `https://chat.carphatian.ro/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated` (for connected accounts)
   - `payout.paid`
   - `payout.failed`
5. Copy the **Signing secret** (starts with `whsec_`)

### 1.4 Get Production API Keys

1. Go to **Developers → API keys**
2. Toggle from "Test mode" to "Live mode" (top right)
3. Copy the following keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

## Step 2: Update Environment Variables

### 2.1 Edit Production Environment File

```bash
cd /home/ubuntu/chat-carphatian
nano .env.local
```

### 2.2 Update Stripe Keys

Replace the test keys with production keys:

```bash
# OLD (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# NEW (Production Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
```

### 2.3 Verify Other Environment Variables

Ensure these are set correctly for production:

```bash
# App URL (must match Stripe settings)
NEXT_PUBLIC_APP_URL=https://chat.carphatian.ro

# Database (should already be production)
DATABASE_URL=postgresql://...

# Email (Resend)
RESEND_API_KEY=re_...

# Pusher (real-time)
PUSHER_APP_ID=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://chat.carphatian.ro
```

## Step 3: Database Migration (If Needed)

The new attachment schema columns need to be added to the production database:

```bash
cd /home/ubuntu/chat-carphatian
psql $DATABASE_URL -c "
ALTER TABLE attachments 
ADD COLUMN IF NOT EXISTS submission_status VARCHAR(20) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id);

CREATE INDEX IF NOT EXISTS attachments_submission_status_idx ON attachments(submission_status);
CREATE INDEX IF NOT EXISTS attachments_approval_status_idx ON attachments(approval_status);
"
```

## Step 4: Rebuild and Restart Application

### 4.1 Rebuild Next.js

```bash
cd /home/ubuntu/chat-carphatian
npm run build
```

### 4.2 Restart PM2 Process

```bash
pm2 restart carphatian --update-env
pm2 save
```

### 4.3 Verify Process is Running

```bash
pm2 status
pm2 logs carphatian --lines 50
```

## Step 5: Testing Production Stripe

### 5.1 Test Payment Flow

1. Create a test contract with real payment
2. Fund escrow with live Stripe checkout
3. **Use real card (will charge real money!)**
4. Verify payment appears in Stripe Dashboard → Payments
5. Test milestone release (money goes to connected freelancer)
6. Verify platform fee is collected

### 5.2 Test Connected Accounts

1. Have a freelancer complete Stripe onboarding
2. Verify their account appears in **Connect → Accounts**
3. Check payout schedule is configured
4. Simulate a milestone release
5. Confirm freelancer receives payout to their bank

### 5.3 Monitor Webhooks

1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Click on your production webhook endpoint
3. Monitor recent deliveries
4. Ensure all events return `200 OK`
5. Check for any failed deliveries and debug

## Step 6: Security Checklist

- [ ] All API keys are in `.env.local` (not committed to Git)
- [ ] `.env.local` has restricted permissions: `chmod 600 .env.local`
- [ ] Webhook signature verification is enabled (already in code)
- [ ] HTTPS is enforced (nginx configuration)
- [ ] Database backups are configured
- [ ] Error logging is set up (check PM2 logs)
- [ ] File upload virus scanning is active (ClamAV installed)

## Step 7: Monitoring and Maintenance

### Daily Checks

- Monitor PM2 logs: `pm2 logs carphatian`
- Check Stripe Dashboard for failed payments
- Review webhook delivery status
- Monitor database disk usage

### Weekly Checks

- Review failed payment emails
- Check platform fee collection
- Verify freelancer payouts are processing
- Audit connected account statuses

### Monthly Checks

- Review Stripe account balance
- Transfer platform fees to business bank
- Update dependencies: `npm audit fix`
- Database backup verification

## Troubleshooting

### Payments Failing

1. Check Stripe Dashboard → Logs for errors
2. Verify webhook endpoint is reachable: `curl -X POST https://chat.carphatian.ro/api/stripe/webhook`
3. Check PM2 logs for errors: `pm2 logs carphatian --err`
4. Ensure database is accessible

### Webhooks Not Delivered

1. Check webhook URL in Stripe Dashboard
2. Verify nginx is proxying correctly: `sudo nginx -t && sudo systemctl status nginx`
3. Check SSL certificate is valid: `sudo certbot certificates`
4. Test webhook manually from Stripe Dashboard

### Connected Account Issues

1. Ensure freelancer completed full onboarding
2. Check account status in Stripe Dashboard → Connect
3. Verify business verification is complete
4. Review payout settings

## Rollback Procedure

If you need to revert to test mode:

1. Stop the application: `pm2 stop carphatian`
2. Restore test API keys in `.env.local`
3. Rebuild: `npm run build`
4. Restart: `pm2 restart carphatian --update-env`

## Support

- **Stripe Support**: https://support.stripe.com
- **Stripe Connect Docs**: https://stripe.com/docs/connect
- **Platform Documentation**: `/docs` folder

---

**⚠️ IMPORTANT**: Always test in a staging environment first if possible. Real money is at stake in production mode.

**💡 TIP**: Keep your test mode keys handy for future development and testing.

Last Updated: December 2024
