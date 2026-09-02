import { NextResponse } from 'next/server';
import polar from '@/lib/polar';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { org_id, product_id, success_url, cancel_url } = body || {};
    if (!org_id || !product_id) return NextResponse.json({ success: false, error: 'org_id and product_id required' }, { status: 400 });

    const resp = await polar.createCheckout(product_id, org_id, { success_url, cancel_url });
    if (!resp.success) return NextResponse.json({ success: false, error: resp.error }, { status: 500 });
    return NextResponse.json({ success: true, url: resp.url, sessionId: resp.sessionId });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
