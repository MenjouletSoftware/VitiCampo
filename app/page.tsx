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
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
      <div className="mx-auto max-w-xl w-full bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold mb-2 text-green-800 flex items-center gap-2">Viticampo</h1>
        <p className="text-sm text-gray-500 mb-6">Diagostico agronomico instantaneo con Inteligencia Artificial</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Variedad de Uva</label>
            <input
              name="variedadUva"
              required
              placeholder="Ej: Malbec, Cabernet..."
              value={variedadUva}
              onChange={(e) => setVariedadUva(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fase Fenologica</label>
            <input
              name="faseFenologica"
              required
              placeholder="Ej: Brotacion, Envero, Cosecha..."
              value={faseFenologica}
              onChange={(e) => setFaseFenologica(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sintomas Visuales Detectados</label>
            <textarea
              name="sintomasDetectados"
              required
              rows={4}
              placeholder="Describe las manchas, insectos o anomalias en las hojas o racimos..."
              value={sintomasDetectados}
              onChange={(e) => setSintomasDetectados(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 rounded-md text-sm transition-colors disabled:bg-gray-400"
          >
            {loading ? "Analizando Vinedo..." : "Generar Diagnostico"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
            Error: {error}
          </div>
        )}

        {reporte && (
          <div className="mt-6 p-4 bg-green-50 text-gray-800 text-sm rounded-md border border-green-200 whitespace-pre-line">
            <h3 className="font-bold text-green-900 mb-2 text-base">Reporte Tecnico de Campo:</h3>
            {reporte}
          </div>
        )}
      </div>
    </main>
  );
}
