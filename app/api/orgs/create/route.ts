import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

async function getRandomId() {
  if (typeof globalThis !== 'undefined' && (globalThis as any).crypto && typeof (globalThis as any).crypto.randomUUID === 'function') {
    return (globalThis as any).crypto.randomUUID();
  }
  try {
    const cryptoMod = await import('crypto');
    if (typeof cryptoMod.randomUUID === 'function') return cryptoMod.randomUUID();
  } catch (_) {
    // ignore
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, owner_email } = body || {};
    if (!name || !owner_email) {
      return NextResponse.json({ success: false, error: 'name and owner_email required' }, { status: 400 });
    }

    // Demo mode: return mock org without touching Supabase
    const isDemo = (process.env.DEMO_MODE ?? '').toLowerCase() === 'true';
    if (isDemo) {
      const id = await getRandomId();
      const mockOrg = { id, name, owner_user_id: `demo:${owner_email}`, stripe_customer_id: null, stripe_subscription_id: null, subscription_status: 'active', created_at: new Date().toISOString() };
      return NextResponse.json({ success: true, org: mockOrg });
    }

    // Upsert user
    const { data: existingUser } = await supabaseServer
      .from('users')
      .select('*')
      .eq('email', owner_email)
      .limit(1)
      .maybeSingle();

    let userId = existingUser?.id;
    if (!userId) {
      const { data: ins, error: insError } = await supabaseServer.from('users').insert({ email: owner_email }).select('id').single();
      if (insError || !ins?.id) {
        return NextResponse.json({ success: false, error: 'failed to create owner user' }, { status: 500 });
      }
      userId = ins.id;
    }

    // create org
    const { data: org, error: orgError } = await supabaseServer
      .from('orgs')
      .insert({ name, owner_user_id: userId })
      .select('*')
      .single();

    if (orgError || !org?.id) {
      return NextResponse.json({ success: false, error: 'failed to create org' }, { status: 500 });
    }

    // create membership
    const { error: memError } = await supabaseServer.from('org_memberships').insert({ org_id: org.id, user_id: userId, role: 'owner' });
    if (memError) {
      // attempt cleanup: remove created org
      try {
        await supabaseServer.from('orgs').delete().eq('id', org.id);
      } catch (e) {
        // ignore cleanup errors
      }
      return NextResponse.json({ success: false, error: 'failed to create membership' }, { status: 500 });
    }

    return NextResponse.json({ success: true, org });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
