import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

function createInviteCode() {
  const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `VC-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const orgId = params.id;
    const body = await req.json();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const role = String(body?.role ?? 'member');

    if (!email) return NextResponse.json({ success: false, error: 'email required' }, { status: 400 });

    const isDemo = (process.env.DEMO_MODE ?? '').toLowerCase() === 'true';
    if (isDemo) {
      const inviteCode = createInviteCode();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      return NextResponse.json({
        success: true,
        invite: {
          org_id: orgId,
          email,
          role,
          code: inviteCode,
          url: `${appUrl}/signup?invite_code=${encodeURIComponent(inviteCode)}`,
        },
      });
    }

    const { data: existingInvite } = await supabaseServer
      .from('organization_invitations')
      .select('*')
      .eq('organization_id', orgId)
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const inviteCode = existingInvite?.invite_code || createInviteCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';

    if (existingInvite) {
      const { error: updateError } = await supabaseServer
        .from('organization_invitations')
        .update({ invite_code: inviteCode, role, status: 'pending', expires_at: expiresAt })
        .eq('id', existingInvite.id);

      if (updateError) {
        return NextResponse.json({ success: false, error: String(updateError) }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabaseServer
        .from('organization_invitations')
        .insert({
          organization_id: orgId,
          email,
          invite_code: inviteCode,
          role,
          status: 'pending',
          expires_at: expiresAt,
        });

      if (insertError) {
        return NextResponse.json({ success: false, error: String(insertError) }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      invite: {
        org_id: orgId,
        email,
        role,
        code: inviteCode,
        url: `${appUrl}/signup?invite_code=${encodeURIComponent(inviteCode)}`,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
