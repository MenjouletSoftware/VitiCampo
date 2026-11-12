'use client';

import React, { useState } from 'react';

type ApiResponse = { reporte?: string; error?: string };

const checkoutUrl = process.env.NEXT_PUBLIC_POLAR_CHECKOUT_URL ?? 'https://polar.sh';

export default function Page(): JSX.Element {
  const [variedadUva, setVariedadUva] = useState<string>('');
  const [faseFenologica, setFaseFenologica] = useState<string>('');
  const [sintomasDetected, setSintomasDetected] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [reporte, setReporte] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setReporte('');

    if (!variedadUva.trim() || !faseFenologica.trim() || !sintomasDetected.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variedadUva: variedadUva.trim(),
          faseFenologica: faseFenologica.trim(),
          sintomasDetectados: sintomasDetected.trim(),
        }),
      });

      const data = (await res.json()) as ApiResponse;
      if (!res.ok) {
        setError(data?.error ?? 'Error en la solicitud');
      } else {
        setReporte(data.reporte ?? '');
      }
    } catch {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fdfdfd] via-[#f7f9f7] to-[#f4f7f4] flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <div className="inline-block px-4 py-2 rounded-md bg-white/40 backdrop-blur-sm">
            <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#1a3324]">Viticampo</h1>
            <p className="mt-2 text-sm text-gray-700 max-w-2xl mx-auto">
              Diagnostico agronomico de vinedos y planes de accion en 3 pasos generados por IA.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <aside className="lg:col-span-1 bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <h2 className="text-lg font-medium text-gray-800">Plan premium</h2>
            <p className="mt-2 text-sm text-gray-600">
              Acceso ilimitado al analisis agronomico con IA para la gestión de bodegas y viñedos.
            </p>

            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#1a3324]">$149</span>
                <span className="text-sm text-gray-500">USD / mes</span>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Diagnóstico fitosanitario multimodal, métricas operativas y seguimiento B2B multi-tenant.
              </p>
            </div>

            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block w-full text-center bg-[#1a3324] hover:bg-[#13261a] text-white px-4 py-2 rounded-md text-sm transition-colors"
              aria-label="Ir al checkout externo en Polar.sh"
            >
              Ir al checkout en Polar.sh
            </a>
          </aside>

          <div className="lg:col-span-2 bg-white shadow-md rounded-xl p-6 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-medium text-gray-800">Analizar Vinedo</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Variedad de Uva</label>
                <input
                  value={variedadUva}
                  onChange={(e) => setVariedadUva(e.target.value)}
                  placeholder="Ej. Malbec"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3324]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fase Fenologica</label>
                <input
                  value={faseFenologica}
                  onChange={(e) => setFaseFenologica(e.target.value)}
                  placeholder="Ej. Veraison"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3324]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sintomas Visuales Detectados</label>
                <textarea
                  value={sintomasDetected}
                  onChange={(e) => setSintomasDetected(e.target.value)}
                  placeholder="Describe manchas, decoloracion, pudricion, presencia de insectos, etc."
                  rows={6}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3324] resize-y"
                />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[#1a3324] hover:bg-[#13261a] text-white px-4 py-2 rounded-md text-sm disabled:opacity-60 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Analizando Vinedo...' : 'Generar Informe'}
                </button>
              </div>
            </form>

            {reporte ? (
              <div className="mt-6 bg-gray-50 border border-gray-100 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Informe Técnico</h4>
                <pre className="whitespace-pre-line text-sm text-gray-800 font-sans">{reporte}</pre>
              </div>
            ) : null}
          </div>
        </section>

        <footer className="text-center text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Viticampo — Bodega Inteligente</span>
        </footer>
      </div>
    </main>
  );
}
