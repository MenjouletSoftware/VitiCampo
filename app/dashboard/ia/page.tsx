'use client';

import { useRef, useState } from 'react';
import { analyzeImageWithTF } from '@/lib/vision';

export default function IAPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCapture = async () => {
    const f = fileRef.current?.files?.[0];
    if (!f) return;
    setLoading(true);
    const res = await analyzeImageWithTF(f);
    setLoading(false);
    if (res.success) setResult(res.predictions);
    else setResult('Error en el análisis: ' + res.error);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-black text-slate-900">Escáner de salud por IA</h1>
        <p className="mt-2 text-slate-600">Subí una foto de la hoja y la IA sugerirá detección de mildiu, oidio o estrés hídrico.</p>

        <div className="mt-6 grid gap-4">
          <input ref={fileRef} type="file" accept="image/*" className="field" />
          <button onClick={handleCapture} className="btn-secondary w-full">Analizar imagen</button>

          {loading && <div className="mt-2 text-slate-600">Analizando imagen...</div>}
          {result && (
            <div className="card mt-2">
              <p className="text-sm font-semibold text-slate-700">Resultados</p>
              <p className="mt-2 text-slate-800">{result}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
