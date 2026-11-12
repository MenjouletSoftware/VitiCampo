import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import polar from '@/lib/polar';

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const sig = req.headers.get('polar-signature') || req.headers.get('x-polar-signature') || req.headers.get('webhook-signature') || '';
    const { verified, event, error } = await polar.verifyWebhook(raw, sig) as any;
    if (!verified) return NextResponse.json({ success: false, error: error || 'webhook not verified' }, { status: 400 });

    const type = String(event?.type || event?.event || '').toLowerCase();
    const payload = event?.data || event || {};
    const org_id = payload?.metadata?.org_id || payload?.org_id;
    const customer_id = payload?.customer_id || payload?.customer || payload?.customerId || null;
    const subscription_id = payload?.subscription_id || payload?.subscription || payload?.subscriptionId || null;

    if (type.includes('checkout') || type.includes('session') || type.includes('subscription')) {
      if (org_id) {
        await supabaseServer.from('orgs').update({
          stripe_customer_id: customer_id,
          stripe_subscription_id: subscription_id,
          subscription_status: 'active',
          plan: 'premium',
        }).eq('id', org_id);
      }
    }

    if (type.includes('cancel') || type.includes('deleted')) {
      if (org_id) {
        await supabaseServer.from('orgs').update({ subscription_status: 'canceled', plan: 'cancelled' }).eq('id', org_id);
      }
    }

    return NextResponse.json({ received: true, type });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
