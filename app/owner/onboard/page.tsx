"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OwnerOnboardPage() {
  const [name, setName] = useState('Mi Viñedo');
  const [email, setEmail] = useState('owner@viticampo.app');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orgs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, owner_email: email }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'create org failed');

      const org_id = json.org.id;
      // choose provider: Polar if enabled, otherwise Stripe
      const usePolar = (process.env.NEXT_PUBLIC_USE_POLAR || '').toLowerCase() === 'true';
      if (usePolar) {
        const productId = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID;
        if (!productId) {
          alert('Polar no está configurado: falta NEXT_PUBLIC_POLAR_PRODUCT_ID');
          return;
        }
        const checkoutRes = await fetch('/api/polar/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ org_id, product_id: productId }),
        });
        const checkoutJson = await checkoutRes.json();
        if (!checkoutJson.success) throw new Error(checkoutJson.error || 'checkout failed');
        window.location.href = checkoutJson.url;
      } else {
        const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
        if (!priceId) {
          alert('Stripe no está configurado: falta NEXT_PUBLIC_STRIPE_PRICE_ID');
          return;
        }
        const checkoutRes = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ org_id, price_id: priceId }),
        });
        const checkoutJson = await checkoutRes.json();
        if (!checkoutJson.success) throw new Error(checkoutJson.error || 'checkout failed');
        window.location.href = checkoutJson.url;
      }
    } catch (err) {
      alert(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-black text-purple-900">Crear organización y suscribirse</h1>
        <p className="text-sm text-slate-600 mt-2">El propietario crea la organización y procede al pago de la suscripción.</p>

        <div className="mt-4 space-y-3">
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={handleCreate} className="btn-primary w-full" disabled={loading}>{loading ? 'Procesando...' : 'Crear y pagar'}</button>
        </div>
      </div>
    </main>
  );
}
