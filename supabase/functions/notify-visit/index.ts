// Supabase Edge Function: notify-visit
// Deploy: supabase functions deploy notify-visit
// Secrets: RESEND_API_KEY, OWNER_EMAIL

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const OWNER_EMAIL = Deno.env.get('OWNER_EMAIL') ?? '';
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'StudioVault <onboarding@resend.dev>';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const visitorName = body.visitor_name ?? 'Visitor';
    const visitorEmail = body.visitor_email ?? '';
    const visitCount = body.visit_count ?? 1;
    const visitedAt = body.visited_at ?? new Date().toISOString();
    const to = body.owner_email || OWNER_EMAIL;

    if (!RESEND_API_KEY || !to) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing RESEND_API_KEY or OWNER_EMAIL' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: `StudioVault visit: ${visitorName}`,
        text: `${visitorName} (${visitorEmail}) visited your profile.\nTotal visits: ${visitCount}\nTime: ${visitedAt}`,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify({ ok: res.ok, data }), {
      status: res.ok ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
