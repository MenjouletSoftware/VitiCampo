import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const orgId = params.id;
    const body = await req.json();
    const { email, role } = body || {};
    if (!email) return NextResponse.json({ success: false, error: 'email required' }, { status: 400 });

    const isDemo = (process.env.DEMO_MODE ?? '').toLowerCase() === 'true';
    if (isDemo) {
      return NextResponse.json({ success: true, invited: { org_id: orgId, email, role: role || 'member' } });
    }

    // upsert user
    const { data: existingUser } = await supabaseServer.from('users').select('id').eq('email', email).limit(1).maybeSingle();
    let userId = existingUser?.id;
    if (!userId) {
      const { data: ins, error: insError } = await supabaseServer.from('users').insert({ email }).select('id').single();
      if (insError || !ins?.id) return NextResponse.json({ success: false, error: 'failed to create user' }, { status: 500 });
      userId = ins.id;
    }

    // create membership
    const { error: memError } = await supabaseServer.from('org_memberships').insert({ org_id: orgId, user_id: userId, role: role || 'member' });
    if (memError) return NextResponse.json({ success: false, error: String(memError) }, { status: 500 });

    return NextResponse.json({ success: true, invited: { org_id: orgId, user_id: userId, role: role || 'member' } });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
