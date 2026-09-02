import { NextResponse } from 'next/server';

type Body = {
  variedadUva: string;
  faseFenologica: string;
  sintomasDetectados: string;
};

export async function POST(request: Request) {
  try {
    const parsed = (await request.json()) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
    }

    const { variedadUva, faseFenologica, sintomasDetectados } = parsed as Body;
    if (typeof variedadUva !== 'string' || typeof faseFenologica !== 'string' || typeof sintomasDetectados !== 'string') {
      return NextResponse.json({ error: 'Campos inválidos' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 });
    }

    const prompt = `Genera un reporte corto y profesional a partir de los siguientes datos:\nVariedad de uva: ${variedadUva}\nFase fenológica: ${faseFenologica}\nSíntomas detectados: ${sintomasDetectados}\n\nDevuelve solo el texto del reporte.`;

    const genai = (await import('@google/genai')) as any;

    let reporteTexto = '';

    try {
      if (typeof genai.TextGenerationClient === 'function') {
        const client = new genai.TextGenerationClient({ apiKey });
        const result = await client.generate?.({ model: 'gemini-1.5-flash', prompt });
        reporteTexto = result?.text ?? result?.output?.[0]?.content ?? String(result ?? '');
      } else if (typeof genai.generate === 'function') {
        const result = await genai.generate({ model: 'gemini-1.5-flash', prompt, apiKey });
        reporteTexto = result?.text ?? result?.output?.[0]?.content ?? String(result ?? '');
      } else if (genai.default && typeof genai.default.generate === 'function') {
        const result = await genai.default.generate({ model: 'gemini-1.5-flash', prompt, apiKey });
        reporteTexto = result?.text ?? result?.output?.[0]?.content ?? String(result ?? '');
      } else {
        const resp = await fetch('https://api.generativeai.google/v1/models/gemini-1.5-flash:generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ prompt }),
        });
        const data = await resp.json();
        reporteTexto = data?.candidates?.[0]?.content ?? data?.output?.[0]?.content ?? data?.text ?? JSON.stringify(data ?? '');
      }
    } catch (e) {
      const resp = await fetch('https://api.generativeai.google/v1/models/gemini-1.5-flash:generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ prompt }),
      });
      const data = await resp.json();
      reporteTexto = data?.candidates?.[0]?.content ?? data?.output?.[0]?.content ?? data?.text ?? JSON.stringify(data ?? '');
    }

    return NextResponse.json({ reporte: reporteTexto });
  } catch (err) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
