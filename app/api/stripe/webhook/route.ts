import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseServer } from '@/lib/supabaseServer';

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ success: false, error: 'STRIPE_SECRET_KEY no configurada' }, { status: 500 });

  const sig = req.headers.get('stripe-signature') || '';
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session & { metadata?: any };
      const org_id = session.metadata?.org_id;
      const customer = session.customer as string;
      // attach customer id to org
      if (org_id) {
        await supabaseServer.from('orgs').update({ stripe_customer_id: customer, subscription_status: 'active' }).eq('id', org_id);
      }
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string; customer?: string };
      const subscriptionId = invoice.subscription as string;
      // Find org by subscription id
      if (subscriptionId) {
        await supabaseServer.from('orgs').update({ subscription_status: 'active', stripe_subscription_id: subscriptionId }).eq('stripe_subscription_id', subscriptionId).or(`stripe_subscription_id.is.null`);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription & { metadata?: any };
      // mark org canceled by subscription id
      await supabaseServer.from('orgs').update({ subscription_status: 'canceled' }).eq('stripe_subscription_id', sub.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
