'use client';

import { ChangeEvent, useRef, useState } from 'react';

export default function IAPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (selectedFile) {
      setError('');
      setResult(null);
    }
    if (fileRef.current) {
      fileRef.current.value = selectedFile ? fileRef.current.value : '';
    }
  };

  const handleCapture = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError('Selecciona una imagen para analizar.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';

      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });

      const base64 = btoa(binary);
      const mimeType = file.type || 'image/jpeg';

      const res = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variedadUva: 'Cabernet Sauvignon',
          faseFenologica: 'Maduración',
          sintomasDetectados: 'Se observan manchas foliares, clorosis y descenso de vigor visual.',
          image: `data:${mimeType};base64,${base64}`,
          mimeType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'No fue posible analizar la imagen.');
      }

      setResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(err?.message || 'Error al analizar la imagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-black text-slate-900">Escáner multimodal de salud por IA</h1>
        <p className="mt-2 text-slate-600">Subí una foto de la hoja para que la IA identifique estrés hídrico, mildiu, oídio o signos severos de fitopatógenos.</p>

        <div className="mt-6 grid gap-4">
          <input ref={fileRef} type="file" accept="image/*" className="field" onChange={handleFileChange} />
          <button onClick={handleCapture} className="btn-secondary w-full" disabled={loading}>
            {loading ? 'Analizando imagen...' : 'Analizar imagen'}
          </button>

          {error ? <div className="mt-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
          {loading && <div className="mt-2 text-slate-600">Enviando imagen a Gemini 2.5 Flash...</div>}
          {result && (
            <div className="card mt-2">
              <p className="text-sm font-semibold text-slate-700">Resultado del diagnóstico</p>
              <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
