import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

// Create Supabase client with service role to bypass RLS
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req: Request) => {
  try {
    const { type, subject, html, from } = await req.json()

    let emails: string[] = []

    // If broadcast, fetch emails from database
    if (type === 'broadcast') {
      const { data: registrations } = await supabase
        .from('registrations')
        .select('contact_email')
        .not('contact_email', 'is', null)
      
      if (registrations) {
        emails = registrations.map((r: any) => r.contact_email)
      }
    }

    // Single email
    if (type === 'single') {
      const { email } = await req.json()
      if (email) emails = [email]
    }

    if (emails.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No emails provided' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Send emails using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        to: emails,
        from: from || 'Zayathon <noreply@yourdomain.com>',
        subject: subject || 'Message from Zayathon',
        html: html || '<p>No content provided</p>',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error || 'Failed to send email' }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
