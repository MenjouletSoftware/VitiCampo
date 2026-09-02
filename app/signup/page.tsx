"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpWithEmail } from '@/lib/auth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await signUpWithEmail(email, password) as any;
      if (error) throw error;
      alert('Registro iniciado. Revisa tu correo para confirmar (si aplica).');
      router.push('/login');
    } catch (err: any) {
      alert(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-black text-purple-900">Crear cuenta</h1>
        <form onSubmit={handleSignup} className="mt-4 space-y-3">
          <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
          <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</button>
        </form>
      </div>
    </main>
  );
}
