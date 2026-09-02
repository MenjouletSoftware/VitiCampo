import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import polar from '@/lib/polar';

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const sig = req.headers.get('polar-signature') || req.headers.get('x-polar-signature') || '';
    const { verified, event, error } = await polar.verifyWebhook(raw, sig) as any;
    if (!verified) return NextResponse.json({ success: false, error: error || 'webhook not verified' }, { status: 400 });

    const type = event.type || event.event || '';
    if (type.includes('checkout') || type.includes('session') || type.includes('subscription')) {
      const payload = event.data || event;
      const org_id = payload?.metadata?.org_id || payload?.org_id;
      const customer_id = payload?.customer_id || payload?.customer;
      const subscription_id = payload?.subscription_id || payload?.subscription;
      if (org_id) {
        await supabaseServer.from('orgs').update({ stripe_customer_id: customer_id ?? null, stripe_subscription_id: subscription_id ?? null, subscription_status: 'active' }).eq('id', org_id);
      }
    }

    if (type.includes('cancel') || type.includes('deleted')) {
      const payload = event.data || event;
      const org_id = payload?.metadata?.org_id || payload?.org_id;
      if (org_id) {
        await supabaseServer.from('orgs').update({ subscription_status: 'canceled' }).eq('id', org_id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
