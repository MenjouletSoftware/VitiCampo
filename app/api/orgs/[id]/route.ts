import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const isDemo = (process.env.DEMO_MODE ?? '').toLowerCase() === 'true';
    if (isDemo && id.startsWith('demo:') === false && id.length === 36) {
      // In demo mode, allow retrieving previously created mock orgs by id via in-memory isn't stored.
      // But if id looks like a UUID we can still return a simulated response for testing.
      return NextResponse.json({ success: true, org: { id, name: 'Viñedo Demo (simulado)', owner_user_id: `demo:owner@viticampo.test`, subscription_status: 'active', created_at: new Date().toISOString() } });
    }

    if (isDemo && id.startsWith('demo:')) {
      // demo id format demo:email
      return NextResponse.json({ success: true, org: { id, name: 'Viñedo Demo (usuario)', owner_user_id: id, subscription_status: 'active', created_at: new Date().toISOString() } });
    }

    const { data: org, error } = await supabaseServer.from('orgs').select('*').eq('id', id).maybeSingle();
    if (error) return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    if (!org) return NextResponse.json({ success: false, error: 'org not found' }, { status: 404 });

    const { data: members } = await supabaseServer.from('org_memberships').select('user_id,role,created_at').eq('org_id', id);

    return NextResponse.json({ success: true, org: { ...org, members } });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
