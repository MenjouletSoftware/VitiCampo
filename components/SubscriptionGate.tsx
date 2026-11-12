'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getPlanMeta, getSubscriptionState, type SubscriptionUser } from '@/lib/subscription';

const defaultUser: SubscriptionUser = {
  created_at: new Date().toISOString(),
  plan: 'premium',
  subscription_status: 'active',
  es_vip: true,
};

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SubscriptionUser>(defaultUser);
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requiresPayment, setRequiresPayment] = useState(false);
  const [paymentReason, setPaymentReason] = useState('');

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!isMounted) return;

      if (!session) {
        setIsAuthenticated(false);
        setIsReady(true);
        return;
      }

      const email = session.user.email ?? '';
      const response = await fetch('/api/auth/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const eligibility = await response.json();
      const blocked = Boolean(eligibility.requiresPayment && !eligibility.allowedFreeTrial);

      if (!isMounted) return;
      setRequiresPayment(blocked);
      setPaymentReason(eligibility.reason ?? 'Se requiere pago inmediato de $149 USD/mes.');
      setIsAuthenticated(Boolean(session));
      setUser({
        created_at: session.user.created_at ?? new Date().toISOString(),
        plan: 'premium',
        subscription_status: blocked ? 'inactive' : 'active',
        es_vip: !blocked,
        trial_ends_at: blocked ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setIsReady(true);
    };

    syncSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setIsAuthenticated(false);
        setRequiresPayment(false);
        setPaymentReason('');
        setIsReady(true);
        return;
      }

      const email = session.user.email ?? '';
      const response = await fetch('/api/auth/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const eligibility = await response.json();
      const blocked = Boolean(eligibility.requiresPayment && !eligibility.allowedFreeTrial);
      setRequiresPayment(blocked);
      setPaymentReason(eligibility.reason ?? 'Se requiere pago inmediato de $149 USD/mes.');
      setIsAuthenticated(Boolean(session));
      setUser({
        created_at: session.user.created_at ?? new Date().toISOString(),
        plan: 'premium',
        subscription_status: blocked ? 'inactive' : 'active',
        es_vip: !blocked,
        trial_ends_at: blocked ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setIsReady(true);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const subscription = getSubscriptionState(user);
  const activePlan = getPlanMeta(subscription.plan as any);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-soft">
          Verificando sesión...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <div className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">🔒</div>
          <h1 className="mt-6 text-3xl font-black text-slate-900">Acceso requerido</h1>
          <p className="mt-3 text-slate-600">
            Debés iniciar sesión con Supabase para acceder al panel de gestión del viñedo.
          </p>
          <a href="/login" className="btn-primary mt-6 inline-flex w-full justify-center">
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  if (requiresPayment || !subscription.hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">⚠️</div>
          <h1 className="mt-6 text-3xl font-black text-slate-900">Acceso bloqueado</h1>
          <p className="mt-3 text-slate-600">{paymentReason}</p>
          <a href={process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL ?? 'https://polar.sh'} target="_blank" rel="noreferrer" className="btn-primary mt-6 inline-flex w-full justify-center">
            Pagar $149 USD/mes en Polar.sh
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800">
        Plan {activePlan.label} activo · $149 USD/mes
      </div>
      {children}
    </>
  );
}
