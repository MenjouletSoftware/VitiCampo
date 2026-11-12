import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = (body?.email ?? '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          allowedFreeTrial: false,
          requiresPayment: true,
          reason: 'El correo electrónico es obligatorio para validar la prueba gratuita.',
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          allowedFreeTrial: false,
          requiresPayment: true,
          reason: 'Falta la configuración de Supabase para validar la prueba gratuita.',
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const emailHash = crypto.createHash('sha256').update(email).digest('hex');
    const { data, error } = await supabase
      .from('trial_history')
      .select('id, email_hash, trial_status, blocked_at, organization_id, created_at')
      .eq('email_hash', emailHash)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          allowedFreeTrial: false,
          requiresPayment: true,
          reason: 'No se pudo validar la prueba gratuita en la base de datos.',
        },
        { status: 500 }
      );
    }

    if (data) {
      return NextResponse.json({
        allowedFreeTrial: false,
        requiresPayment: true,
        reason: 'Este correo ya utilizó su prueba gratuita. Se requiere pago inmediato de $149 USD/mes para ingresar al dashboard.',
        trialEndsAt: null,
      });
    }

    return NextResponse.json({
      allowedFreeTrial: true,
      requiresPayment: false,
      reason: '',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        allowedFreeTrial: false,
        requiresPayment: true,
        reason: error?.message || 'Error al validar la prueba gratuita.',
      },
      { status: 500 }
    );
  }
}
