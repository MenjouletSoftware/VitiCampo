 'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { getSession, signInWithEmail } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function redirectIfLoggedIn() {
      const { data } = await getSession();
      if (isActive && data.session) {
        router.replace('/dashboard');
      }
    }

    redirectIfLoggedIn();

    return () => {
      isActive = false;
    };
  }, [router]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await signInWithEmail(email.trim(), password);
      if (authError) {
        setError(authError.message || 'Credenciales incorrectas o usuario no confirmado.');
        return;
      }

      if (data.session) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
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
          <p className="mt-2 text-sm text-slate-600">Acceso seguro para bodegas y equipos de operación agrícola.</p>
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
              required
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
              required
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}

          <button type="submit" className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar a VitiCampo'}
          </button>

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
