"use client";

import { useState } from 'react';

export default function OwnerDashboardPage() {
  const [orgId, setOrgId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fetchOrg = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/orgs/${encodeURIComponent(orgId)}`);
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setResult({ success: false, error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-purple-900">Panel Owner (básico)</h1>
        <p className="text-sm text-slate-600 mt-1">Pega aquí el `org.id` que generaste en el onboarding para ver su estado.</p>

        <div className="mt-4 flex gap-2">
          <input className="field flex-1" value={orgId} onChange={(e) => setOrgId(e.target.value)} placeholder="org id (ej: b3... )" />
          <button className="btn-primary" onClick={fetchOrg} disabled={loading || !orgId}>{loading ? 'Cargando...' : 'Ver org'}</button>
        </div>

        <div className="mt-6">
          <pre className="rounded-xl bg-white p-4 text-sm shadow">{result ? JSON.stringify(result, null, 2) : 'Ningún resultado aún'}</pre>
        </div>
      </div>
    </main>
  );
}
