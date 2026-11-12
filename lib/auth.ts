import { supabase } from './supabase';

export type TrialEligibility = {
  allowedFreeTrial: boolean;
  requiresPayment: boolean;
  reason?: string;
  trialEndsAt?: string | null;
};

export async function checkTrialEligibility(email: string): Promise<TrialEligibility> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return {
      allowedFreeTrial: false,
      requiresPayment: true,
      reason: 'El correo electrónico es obligatorio para validar la prueba gratuita.',
    };
  }

  const response = await fetch('/api/auth/eligibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalizedEmail }),
  });

  const data = (await response.json()) as TrialEligibility;
  return {
    allowedFreeTrial: Boolean(data.allowedFreeTrial),
    requiresPayment: Boolean(data.requiresPayment),
    reason: data.reason,
    trialEndsAt: data.trialEndsAt ?? null,
  };
}

export async function activateFreeTrial(email: string, organizationId?: string | null) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { ok: false, reason: 'Correo requerido para activar la prueba gratuita.' };
  }

  const response = await fetch('/api/auth/activate-trial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalizedEmail, organizationId: organizationId ?? null }),
  });

  const data = await response.json();
  return data;
}

export async function signUpWithEmail(email: string, password: string, metadata?: Record<string, unknown>) {
  const normalizedEmail = email.trim().toLowerCase();
  const eligibility = await checkTrialEligibility(normalizedEmail);

  if (!eligibility.allowedFreeTrial && eligibility.requiresPayment) {
    return {
      data: { user: null, session: null },
      error: { message: eligibility.reason || 'Se requiere pago inmediato de $149 USD/mes para poder ingresar.' } as any,
    };
  }

  const resp = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: metadata ?? {},
    },
  });

  if (resp.error) {
    return resp;
  }

  const userEmail = resp.data?.user?.email ?? normalizedEmail;
  await activateFreeTrial(userEmail, resp.data?.user?.id ?? null);
  return resp;
}

export async function signInWithEmail(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

  if (error) {
    return { data, error: error as any };
  }

  const eligibility = await checkTrialEligibility(normalizedEmail);
  if (!eligibility.allowedFreeTrial && eligibility.requiresPayment) {
    await supabase.auth.signOut();
    return {
      data: { user: null, session: null },
      error: { message: eligibility.reason || 'Se requiere pago inmediato de $149 USD/mes para poder ingresar.' } as any,
    };
  }

  return { data, error: null as any };
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}
