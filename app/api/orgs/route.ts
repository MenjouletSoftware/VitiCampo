import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const owner_email = url.searchParams.get('owner_email');
    const isDemo = (process.env.DEMO_MODE ?? '').toLowerCase() === 'true';
    if (isDemo) {
      if (!owner_email) return NextResponse.json({ success: true, orgs: [] });
      return NextResponse.json({ success: true, orgs: [{ id: `demo-${owner_email}`, name: 'Viñedo Demo', owner_user_id: `demo:${owner_email}`, subscription_status: 'active' }] });
    }

    if (owner_email) {
      // find user id
      const { data: user } = await supabaseServer.from('users').select('id').eq('email', owner_email).maybeSingle();
      if (!user) return NextResponse.json({ success: true, orgs: [] });
      const { data: orgs } = await supabaseServer.from('orgs').select('*').eq('owner_user_id', user.id);
      return NextResponse.json({ success: true, orgs });
    }

    const { data: orgs } = await supabaseServer.from('orgs').select('*');
    return NextResponse.json({ success: true, orgs });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
