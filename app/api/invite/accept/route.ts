import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const { invite_code, email, user_id } = await req.json();
    const inviteCode = String(invite_code ?? '').trim();
    const normalizedEmail = String(email ?? '').trim().toLowerCase();

    if (!inviteCode || !normalizedEmail) {
      return NextResponse.json({ success: false, error: 'invite_code and email are required' }, { status: 400 });
    }

    const { data: invite, error: inviteError } = await supabaseServer
      .from('organization_invitations')
      .select('*')
      .eq('invite_code', inviteCode)
      .maybeSingle();

    if (inviteError) {
      return NextResponse.json({ success: false, error: String(inviteError) }, { status: 500 });
    }

    if (!invite) {
      return NextResponse.json({ success: false, error: 'invite not found' }, { status: 404 });
    }

    if (invite.email && invite.email.toLowerCase() !== normalizedEmail) {
      return NextResponse.json({ success: false, error: 'this invite is for a different email' }, { status: 400 });
    }

    let resolvedUserId = user_id ? String(user_id) : null;
    if (!resolvedUserId) {
      const { data: existingProfile } = await supabaseServer
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();
      resolvedUserId = existingProfile?.id ?? null;
    }

    if (!resolvedUserId) {
      return NextResponse.json({ success: false, error: 'user_id is required to bind the invitation' }, { status: 400 });
    }

    await supabaseServer.from('profiles').upsert({
      id: resolvedUserId,
      email: normalizedEmail,
      organization_id: invite.organization_id,
      role: invite.role || 'member',
      is_owner: false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    const { data: existingMembership } = await supabaseServer
      .from('org_memberships')
      .select('id')
      .eq('organization_id', invite.organization_id)
      .eq('user_id', resolvedUserId)
      .maybeSingle();

    if (!existingMembership) {
      await supabaseServer.from('org_memberships').insert({
        organization_id: invite.organization_id,
        user_id: resolvedUserId,
        role: invite.role || 'member',
        status: 'active',
      });
    }

    await supabaseServer
      .from('organization_invitations')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', invite.id);

    return NextResponse.json({
      success: true,
      invite: {
        org_id: invite.organization_id,
        user_id: resolvedUserId,
        role: invite.role || 'member',
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
