# Local SMTP Email Setup for chat.carphatian.ro

## Overview

This document describes the local SMTP email system using Postfix for sending transactional emails from the Carphatian AI Marketplace.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Next.js App    │────▶│  Postfix SMTP   │────▶│   Recipient     │
│  (nodemailer)   │     │  (localhost:25) │     │   Mail Server   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                              
         │ Fallback                                     
         ▼                                              
┌─────────────────┐                                     
│  Resend API     │ (if SMTP fails & RESEND_API_KEY set)
└─────────────────┘                                     
```

## Components

### 1. Postfix Mail Server
- **Location**: /etc/postfix/main.cf
- **Mode**: Send-only (no incoming mail)
- **Hostname**: chat.carphatian.ro
- **Port**: 25 (localhost only)

### 2. Email Service Module
- **Location**: lib/email/index.ts
- **Primary**: Local SMTP via nodemailer
- **Fallback**: Resend API (if configured)
- **Default From**: `noreply@chat.carphatian.ro`

## Usage

```typescript
import { sendEmail, verifySmtpConnection } from '@/lib/email'

// Send an email
const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to Carphatian',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
  text: 'Welcome! Thanks for signing up.'
})

if (result.success) {
  console.log(`Email sent via ${result.provider}, ID: ${result.id}`)
} else {
  console.error(`Failed: ${result.error}`)
}

// Verify SMTP connection
const isReady = await verifySmtpConnection()
```

## DNS Records for Email Deliverability

### Required DNS Records

Add these to your DNS zone for `carphatian.ro`:

#### 1. SPF Record (Sender Policy Framework)
```
TXT  chat.carphatian.ro   "v=spf1 a mx ip4:135.125.174.208 ~all"
```

#### 2. DKIM Record (DomainKeys Identified Mail)
Generate DKIM keys:
```bash
sudo apt install opendkim opendkim-tools
sudo opendkim-genkey -s mail -d chat.carphatian.ro
sudo cat /etc/opendkim/mail.txt  # Copy this to DNS
```

Then add DNS record:
```
TXT  mail._domainkey.chat.carphatian.ro  "v=DKIM1; k=rsa; p=<public_key>"
```

#### 3. DMARC Record
```
TXT  _dmarc.chat.carphatian.ro   "v=DMARC1; p=quarantine; rua=mailto:dmarc@carphatian.ro"
```

#### 4. Reverse DNS (PTR Record)
Contact your VPS provider (OVH) to set:
```
135.125.174.208 → chat.carphatian.ro
```

### Verification

Test your configuration:
```bash
# Check SPF
dig TXT chat.carphatian.ro

# Check if mail server is reachable
telnet localhost 25

# Send test email
echo "Test email body" | mail -s "Test Subject" test@example.com

# Check mail queue
sudo mailq

# Check mail logs
sudo tail -f /var/log/mail.log
```

## Configuration Files

### /etc/postfix/main.cf
```
myhostname = chat.carphatian.ro
mydomain = carphatian.ro
myorigin = $myhostname
inet_interfaces = loopback-only
inet_protocols = all
mydestination = 
local_recipient_maps = 
local_transport = error:local mail delivery is disabled
relayhost = 
smtp_tls_security_level = may
smtp_tls_loglevel = 1
```

## Email Templates

Email templates are located in `lib/email/templates/`:
- `welcome.tsx` - New user registration
- `notification.tsx` - General notifications
- `contract.tsx` - Contract updates
- `password-reset.tsx` - Password reset

## Troubleshooting

### Check Postfix Status
```bash
sudo systemctl status postfix
```

### View Mail Logs
```bash
sudo tail -100 /var/log/mail.log | grep -E "status|error|warning"
```

### Common Issues

1. **Email stuck in queue**: Check DNS, firewall, or recipient server blocking
2. **Connection refused**: Ensure Postfix is running
3. **Rejected by recipient**: Add SPF/DKIM/DMARC records

## Fallback to Resend

If SMTP fails and `RESEND_API_KEY` is set, emails automatically fall back to Resend API:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

## Security

- Postfix only accepts connections from localhost
- TLS enabled for outbound connections
- No relay allowed (prevents open relay abuse)
- Rate limiting applied at application level

---

*Built for Carphatian AI Marketplace*
