# Stripe Production Checklist

Quick reference checklist for switching to Stripe production mode.

## Pre-Launch Checklist

### Stripe Account Setup
- [ ] Business verified in Stripe Dashboard
- [ ] Bank account connected for payouts
- [ ] Business details complete (legal name, address, tax ID)
- [ ] Terms of service URL configured
- [ ] Privacy policy URL configured
- [ ] Brand logo uploaded
- [ ] Connect settings configured

### API Keys
- [ ] Production publishable key obtained (`pk_live_`)
- [ ] Production secret key obtained (`sk_live_`)
- [ ] Production webhook created at `https://chat.carphatian.ro/api/stripe/webhook`
- [ ] Webhook signing secret obtained (`whsec_`)
- [ ] Webhook events configured:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `account.updated`
  - [ ] `payout.paid`
  - [ ] `payout.failed`

### Environment Variables
- [ ] Update `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with `pk_live_`
- [ ] Update `STRIPE_SECRET_KEY` with `sk_live_`
- [ ] Update `STRIPE_WEBHOOK_SECRET` with `whsec_`
- [ ] Verify `NEXT_PUBLIC_APP_URL=https://chat.carphatian.ro`
- [ ] Verify all other env vars are production-ready
- [ ] `.env.local` permissions set to 600: `chmod 600 .env.local`

### Database
- [ ] Run migration for attachment schema updates
- [ ] Verify database backups are configured
- [ ] Test database connectivity

### Application
- [ ] Run `npm run build` successfully
- [ ] Restart PM2: `pm2 restart carphatian --update-env`
- [ ] Verify app is running: `pm2 status`
- [ ] Check logs for errors: `pm2 logs carphatian`

### Testing
- [ ] Test payment flow with real card (small amount!)
- [ ] Verify payment appears in Stripe Dashboard
- [ ] Test freelancer Stripe Connect onboarding
- [ ] Test milestone release to connected account
- [ ] Verify platform fee is collected correctly (15%)
- [ ] Check webhook deliveries in Stripe Dashboard
- [ ] Test file upload and deliverable submission
- [ ] Test approval workflow

### Security
- [ ] HTTPS enforced (check nginx config)
- [ ] SSL certificate valid
- [ ] Virus scanning active (ClamAV installed)
- [ ] API keys not in Git repository
- [ ] Error logging configured

## Post-Launch Monitoring

### Daily
- [ ] Check PM2 logs for errors
- [ ] Monitor Stripe Dashboard for failed payments
- [ ] Review webhook delivery status

### Weekly
- [ ] Review platform fee collection
- [ ] Verify freelancer payouts processing
- [ ] Check for any stuck payments

### Monthly
- [ ] Transfer platform fees to bank
- [ ] Run `npm audit fix`
- [ ] Verify database backups
- [ ] Review Stripe account balance

## Quick Commands

```bash
# Navigate to project
cd /home/ubuntu/chat-carphatian

# Edit environment variables
nano .env.local

# Run database migration
psql $DATABASE_URL < migration.sql

# Rebuild application
npm run build

# Restart PM2
pm2 restart carphatian --update-env
pm2 save

# Check status
pm2 status
pm2 logs carphatian --lines 50

# Check nginx
sudo nginx -t
sudo systemctl status nginx

# Check SSL certificate
sudo certbot certificates
```

## Emergency Rollback

If something goes wrong:

```bash
cd /home/ubuntu/chat-carphatian
pm2 stop carphatian
# Restore test keys in .env.local
nano .env.local
npm run build
pm2 restart carphatian --update-env
pm2 logs carphatian
```

## Support Resources

- Full guide: `docs/STRIPE_PRODUCTION_SETUP.md`
- Stripe Dashboard: https://dashboard.stripe.com
- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

---

**Status**: ⚠️ Currently in TEST MODE

**Last Updated**: December 2024
