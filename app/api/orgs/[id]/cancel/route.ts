import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { email } = await req.json();
    const orgId = params.id;

    const { error } = await supabaseServer
      .from('orgs')
      .update({ subscription_status: 'canceled', plan: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', orgId);

    if (error) {
      return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }

    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const emailHash = createHash('sha256').update(normalizedEmail).digest('hex');
      await supabaseServer
        .from('trial_history')
        .update({ blocked_at: new Date().toISOString(), canceled_at: new Date().toISOString() })
        .eq('email_hash', emailHash);
    }

    return NextResponse.json({ success: true, message: 'account canceled' });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
