// Vercel Edge Function for sending emails via Resend
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
  try {
    const { type, email, subject, html } = await req.json() as {
      type: string;
      email?: string;
      subject?: string;
      html?: string;
    };

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emails: string[] = [];

    if (type === 'single' && email) {
      emails.push(email);
    }

    if (emails.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No emails provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        to: emails,
        from: process.env.EMAIL_FROM || 'Zayathon <noreply@zayathon.dev>',
        subject: subject || 'Message from Zayathon',
        html: html || '<p>No content provided</p>',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error || 'Failed to send email' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
