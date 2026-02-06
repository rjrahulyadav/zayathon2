# Email Function Setup Guide

To enable email sending in the admin panel, you need to set up Resend and deploy the Supabase Edge Function.

## Step 1: Get Resend API Key

1. Go to [Resend.com](https://resend.com) and sign up
2. Navigate to API Keys in your dashboard
3. Create a new API key and copy it

## Step 2: Set Up Supabase Environment Variables

Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Settings → Environment Variables

Add the following variables:

1. **RESEND_API_KEY** - Your Resend API key
2. **SUPABASE_SERVICE_ROLE_KEY** - Get this from Supabase Settings → API → service_role key

## Step 3: Deploy Edge Function

1. Install Supabase CLI if not already installed:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   cd supabase
   supabase link --project-ref your-project-ref
   ```

4. Deploy the edge function:
   ```bash
   supabase functions deploy send-email --project-ref your-project-ref
   ```

## Step 4: Set Up Vercel Deployment for Edge Function

The Edge Function needs to be deployed separately or you can use Vercel Edge Functions. 

### Option A: Deploy with Supabase
The Edge Function is already in `supabase/functions/send-email/`. Deploy it using Supabase CLI as shown above.

### Option B: Convert to Vercel Edge Function
Create a Vercel Edge Function instead:

1. Create `api/send-email.ts`:

```typescript
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { type, email, subject, html } = await req.json();
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    let emails: string[] = [];

    if (type === 'single' && email) {
      emails = [email];
    }

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No emails provided' }, { status: 400 });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        to: emails,
        from: process.env.EMAIL_FROM || 'Zayathon <noreply@yourdomain.com>',
        subject: subject || 'Message from Zayathon',
        html: html || '<p>No content provided</p>',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

2. Add environment variable to Vercel:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `RESEND_API_KEY` with your Resend API key

## Testing Email Function

After setup, test it by:
1. Go to Admin Panel → Registrations tab
2. Click "Broadcast" button
3. Enter a subject and message
4. Click "Send Broadcast"

## Troubleshooting

- **"No emails provided"**: Make sure there are registrations in the database
- **"Failed to send email"**: Check your Resend API key and verify the email addresses
- **RLS Policy errors**: Ensure Supabase policies allow the Edge Function to access the registrations table
