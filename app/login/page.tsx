 'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { saveDemoTrial } from '@/lib/subscription';
import { signInWithEmail } from '@/lib/auth';

const validAccounts = [
  { email: 'admin@viticampo.app', password: 'viticampo123', role: 'admin', name: 'Lucía Fernández' },
  { email: 'operario@viticampo.app', password: 'viticampo123', role: 'operario', name: 'Martín Ruiz' },
  { email: 'supervisor@viticampo.app', password: 'viticampo123', role: 'supervisor', name: 'Ana Gómez' },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('operario@viticampo.app');
  const [password, setPassword] = useState('viticampo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('viticampo-session');
    if (session) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const account = validAccounts.find(
      (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password,
    );

    (async () => {
      try {
        if (account) {
          // demo flow
          await new Promise((r) => setTimeout(r, 300));
          const session = {
            email: account.email,
            name: account.name,
            role: account.role,
            loginAt: new Date().toISOString(),
          };
          localStorage.setItem('viticampo-session', JSON.stringify(session));
          saveDemoTrial('pro');
          router.push('/dashboard');
          return;
        }

        // Attempt Supabase auth
        const { data, error } = await signInWithEmail(email, password) as any;
        if (error) {
          setError('Credenciales incorrectas o usuario no confirmado.');
          return;
        }

        // store minimal session
        const session = { email, loginAt: new Date().toISOString() };
        localStorage.setItem('viticampo-session', JSON.stringify(session));
        router.push('/dashboard');
      } catch (err: any) {
        setError(String(err.message || err));
      } finally {
        setLoading(false);
      }
    })();
  };

  const fillDemo = (account: (typeof validAccounts)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-soft md:p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-900 text-xl font-black text-white">V</div>
          <div>
            <p className="text-2xl font-black text-purple-900">VitiCampo</p>
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-3xl font-black text-slate-900">Ingresá a tu cuenta</h1>
          <p className="mt-2 text-sm text-slate-600">Acceso seguro para administradores y operarios de campo.</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700">Correo</label>
            <input
              className="field"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@viticampo.app"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Contraseña</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <button type="submit" className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar a VitiCampo'}
          </button>

          <div className="grid gap-2 sm:grid-cols-2">
            {validAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemo(account)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-900"
              >
                {account.role === 'admin' ? 'Administrador' : account.role === 'supervisor' ? 'Supervisor' : 'Operario'}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">¿Olvidaste tu contraseña?</span>
            <Link href="/" className="font-semibold text-purple-900 hover:underline">
              Volver al inicio
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
