'use client';

import { useEffect, useState } from 'react';
import { getPlanMeta, getSubscriptionState, type SubscriptionUser } from '@/lib/subscription';

const defaultUser: SubscriptionUser = {
  created_at: new Date().toISOString(),
  trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  plan: 'pro',
  subscription_status: 'inactive',
  es_vip: false,
};

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SubscriptionUser>(defaultUser);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('viticampo-session');
    if (!session) {
      setIsReady(true);
      return;
    }

    const savedUser = localStorage.getItem('viticampo-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as SubscriptionUser);
      } catch {
        localStorage.setItem('viticampo-user', JSON.stringify(defaultUser));
      }
    } else {
      localStorage.setItem('viticampo-user', JSON.stringify(defaultUser));
    }

    setIsReady(true);
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

  const sessionExists = typeof window !== 'undefined' && Boolean(localStorage.getItem('viticampo-session'));

  if (!sessionExists) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <div className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">🔒</div>
          <h1 className="mt-6 text-3xl font-black text-slate-900">Acceso requerido</h1>
          <p className="mt-3 text-slate-600">
            Debés iniciar sesión para acceder al panel de gestión del viñedo.
          </p>
          <a href="/login" className="btn-primary mt-6 inline-flex w-full justify-center">
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  if (!subscription.hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-soft">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">⚠️</div>
          <h1 className="mt-6 text-3xl font-black text-slate-900">Cuenta bloqueada</h1>
          <p className="mt-3 text-slate-600">
            Tu prueba terminó y tu suscripción está inactiva. Reactiva tu acceso para continuar gestionando viñedos y órdenes de trabajo.
          </p>
          <a href="/owner/onboard" className="btn-primary mt-6 inline-flex w-full">
            Reactivar suscripción
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {subscription.trialDaysLeft > 0 && (
        <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800">
          Prueba {activePlan.label} activa: quedan {subscription.trialDaysLeft} días para disfrutar acceso completo.
        </div>
      )}
      {children}
    </>
  );
}
