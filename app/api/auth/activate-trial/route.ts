import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; organizationId?: string | null };
    const email = (body?.email ?? '').trim().toLowerCase();
    const organizationId = body?.organizationId ?? null;

    if (!email) {
      return NextResponse.json({ ok: false, reason: 'El correo es obligatorio.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ ok: false, reason: 'Falta configuración de Supabase.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const emailHash = crypto.createHash('sha256').update(email).digest('hex');
    const { data: existing } = await supabase
      .from('trial_history')
      .select('id')
      .eq('email_hash', emailHash)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          reason: 'Este correo ya registró una prueba gratuita. Se requiere pago inmediato de $149 USD/mes.',
          blocked: true,
        },
        { status: 409 }
      );
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from('trial_history').insert({
      email_hash: emailHash,
      email_preview: email,
      organization_id: organizationId,
      trial_status: 'active',
      activated_at: new Date().toISOString(),
      expires_at: expiresAt,
      blocked_at: null,
      canceled_at: null,
    });

    if (error) {
      return NextResponse.json({ ok: false, reason: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      trialEndsAt: expiresAt,
      reason: 'Prueba gratuita activa por 30 días.',
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, reason: error?.message || 'Error al activar la prueba gratuita.' }, { status: 500 });
  }
}
