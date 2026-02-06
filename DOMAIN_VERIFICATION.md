# Domain Verification in Resend

To send emails from `director@zayathon.in`, you need to verify your domain in Resend.

## Step 1: Add Domain in Resend

1. Go to [Resend Dashboard](https://resend.com/dashboard)
2. Navigate to **Domains** in the left sidebar
3. Click **Add Domain**
4. Enter: `zayathon.in`
5. Click **Add Domain**

## Step 2: Add DNS Records

Resend will show you DNS records to add. You need to add these to your domain's DNS settings:

### For zayathon.in, find your DNS settings at:
- Your domain registrar (where you bought zayathon.in)
- Or your hosting provider (if DNS is managed there)

### You'll typically need to add:

#### 1. SPF Record (Sender Policy Framework)
- **Type**: TXT
- **Name**: `@` (or `zayathon.in`)
- **Value**: `v=spf1 include:_spf.resend.com ~all`

#### 2. DKIM Record (DomainKeys Identified Mail)
- **Type**: CNAME
- **Name**: `resend._domainkey.zayathon.in`
- **Value**: `resend._domainkey.resend.com`

#### 3. Verification Record
- **Type**: CNAME
- **Name**: (shown in Resend dashboard)
- **Value**: (shown in Resend dashboard)

## Step 3: Verify in Resend

1. After adding DNS records, go back to Resend Dashboard
2. Click **Verify** next to `zayathon.in`
3. Wait a few minutes (DNS can take up to 24 hours to propagate)
4. Status should change to **Verified**

## Alternative: Use a Different From Address

If you can't verify the domain, you can use Resend's default sender:

1. In `api/send-email.ts`, remove or change `EMAIL_FROM`:
```typescript
from: process.env.EMAIL_FROM || 'noreply@resend.dev', // Use Resend's default
```

2. Or in Vercel environment variables:
- Remove `EMAIL_FROM` variable
- Or set it to any email you own that can receive verification codes

## Step 4: Test Sending

After verification, test with:
```bash
curl -X POST "https://zayathon-main-main.vercel.app/api/send-email" \
  -H "Content-Type: application/json" \
  -d '{"type":"single","email":"your-email@gmail.com","subject":"Test","html":"<p>Test</p>"}'
```

## Common Issues

| Problem | Solution |
|---------|----------|
| DNS not propagating | Wait up to 24 hours, use DNS checker tool |
| Can't access DNS settings | Contact your domain registrar |
| Domain already verified elsewhere | Use a subdomain like `mail.zayathon.in` |
| Emails going to spam | Check spam folder, add authentication records |
