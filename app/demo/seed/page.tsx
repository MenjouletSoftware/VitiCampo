"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { defaultAppData, APP_STORAGE_KEY } from '@/lib/appData';

const demoAccounts = [
  { email: 'admin@viticampo.app', password: 'viticampo123', role: 'admin', name: 'Lucía Fernández' },
  { email: 'operario@viticampo.app', password: 'viticampo123', role: 'operario', name: 'Martín Ruiz' },
  { email: 'supervisor@viticampo.app', password: 'viticampo123', role: 'supervisor', name: 'Ana Gómez' },
];

export default function DemoSeedPage() {
  const router = useRouter();
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    // nothing on mount
  }, []);

  const seedAll = () => {
    // seed app data
    try {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(defaultAppData));
    } catch (e) {
      // ignore
    }
    // create a demo user record used by SubscriptionGate
    const demoUser = {
      created_at: new Date().toISOString(),
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      plan: 'pro',
      subscription_status: 'active',
      es_vip: false,
    };
    localStorage.setItem('viticampo-user', JSON.stringify(demoUser));
    setSeeded(true);
  };

  const loginAs = (account: { email: string; name: string; role: string }) => {
    const session = {
      email: account.email,
      name: account.name,
      role: account.role,
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem('viticampo-session', JSON.stringify(session));
    // ensure app data exists
    if (!localStorage.getItem(APP_STORAGE_KEY)) {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(defaultAppData));
    }
    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-black text-purple-900">Sembrar cuentas demo</h1>
        <p className="mt-2 text-sm text-slate-600">Esta herramienta inicializa datos y permite acceder como cuentas de demo sin afectar producción.</p>

        <div className="mt-6 grid gap-3">
          <button onClick={seedAll} className="btn-primary w-full">Inicializar datos demo</button>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Cuentas de demo</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {demoAccounts.map((a) => (
                <li key={a.email} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.name} — {a.role}</div>
                    <div className="text-xs">{a.email} / <span className="font-mono">{a.password}</span></div>
                  </div>
                  <button onClick={() => loginAs(a)} className="btn-secondary text-sm">Entrar como {a.role === 'admin' ? 'Administrador' : a.role}</button>
                </li>
              ))}
            </ul>
          </div>

          {seeded && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Datos demo inicializados. Podés entrar con cualquiera de las cuentas de arriba.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
