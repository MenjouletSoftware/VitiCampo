import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseServer } from '@/lib/supabaseServer';

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { org_id, success_url, cancel_url, price_id } = body || {};
    if (!org_id || !price_id) {
      return NextResponse.json({ success: false, error: 'org_id and price_id required' }, { status: 400 });
    }

    // ensure stripe configured
    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ success: false, error: 'STRIPE_SECRET_KEY no configurada' }, { status: 500 });

    // ensure org exists
    const { data: org } = await supabaseServer.from('orgs').select('*').eq('id', org_id).maybeSingle();
    if (!org) return NextResponse.json({ success: false, error: 'org not found' }, { status: 404 });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      metadata: { org_id },
      success_url: success_url || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: cancel_url || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=cancel`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
