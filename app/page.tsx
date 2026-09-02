"use client";

import React, { useState } from 'react';

type ApiResponse = { reporte?: string; error?: string };

export default function Page(): JSX.Element {
  const [variedadUva, setVariedadUva] = useState<string>('');
  const [faseFenologica, setFaseFenologica] = useState<string>('');
  const [sintomasDetectados, setSintomasDetectados] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [reporte, setReporte] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setReporte('');
    setLoading(true);
    try {
      const res = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variedadUva, faseFenologica, sintomasDetectados }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) {
        setError(data?.error ?? 'Error en la solicitud');
      } else {
        setReporte(data.reporte ?? '');
      }
    } catch (err) {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold mb-4">Diagnóstico de Viñedo</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Variedad de uva</label>
            <input
              name="variedadUva"
              required
              value={variedadUva}
              onChange={(e) => setVariedadUva(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fase fenológica</label>
            <input
              name="faseFenologica"
              required
              value={faseFenologica}
              onChange={(e) => setFaseFenologica(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Síntomas detectados</label>
            <textarea
              name="sintomasDetectados"
              required
              value={sintomasDetectados}
              onChange={(e) => setSintomasDetectados(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium"
          >
            {loading ? '🤖 Analizando Viñedo...' : 'Analizar'}
          </button>
        </form>

        <section className="mt-6">
          {error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : (
            reporte && (
              <div className="whitespace-pre-line rounded-md bg-white p-4 border border-gray-200 text-sm text-gray-900">{reporte}</div>
            )
          )}
        </section>
      </div>
    </main>
  );
}
'use client';

import { useState } from 'react';

type FormState = {
  variedadUva: string;
  faseFenologica: string;
  sintomasDetectados: string;
};

export default function Page() {
  const [form, setForm] = useState<FormState>({ variedadUva: '', faseFenologica: '', sintomasDetectados: '' });
  const [loading, setLoading] = useState(false);
  const [reporte, setReporte] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setReporte(null);

    if (!form.variedadUva || !form.faseFenologica || !form.sintomasDetectados) {
      setError('Por favor completá todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setReporte(data?.reporte ?? JSON.stringify(data));
    } catch (e: any) {
      setError(e?.message ?? 'Error al conectar con la API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Diagnóstico de Viñedo</h1>
          <p className="mt-1 text-sm text-slate-500">Completá los datos y obtené un informe técnico rápido.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Variedad de Uva</label>
              <select
                name="variedadUva"
                value={form.variedadUva}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              >
                <option value="">Seleccionar o escribir...</option>
                <option>Malbec</option>
                <option>Cabernet Sauvignon</option>
                <option>Torrontés</option>
                <option>Chardonnay</option>
                <option>Syrah</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Fase Fenológica</label>
              <select
                name="faseFenologica"
                value={form.faseFenologica}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              >
                <option value="">Seleccionar fase...</option>
                <option>Brotación</option>
                <option>Floración</option>
                <option>Cuajado</option>
                <option>Envero</option>
                <option>Cosecha</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Síntomas o Problemas detectados</label>
              <textarea
                name="sintomasDetectados"
                value={form.sintomasDetectados}
                onChange={handleChange}
                rows={5}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                placeholder="Ej: manchas en hojas, defoliación, presencia de moho, marchitez..."
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
              >
                {loading ? 'Analizando Viñedo...' : 'Analizar y Generar Informe'}
              </button>
            </div>
          </form>
        </div>

        {reporte && (
          <section className="mt-6 rounded-lg bg-white/80 p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800">Reporte generado</h2>
            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-line text-sm text-slate-700">{reporte}</pre>
          </section>
        )}
      </div>
    </main>
  );
}
