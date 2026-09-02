import { NextResponse } from 'next/server';
import GoogleGenAI from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { variedadUva, faseFenologica, sintomasDetectados } = body ?? {};

    if (typeof variedadUva !== 'string' || typeof faseFenologica !== 'string' || typeof sintomasDetectados !== 'string') {
      return NextResponse.json({ error: 'Faltan variables requeridas: variedadUva, faseFenologica, sintomasDetectados' }, { status: 400 });
    }

    const prompt = `Actúa como un Ingeniero Agrónomo experto en viticultura. Elaborá un informe técnico que incluya: 1) descripción de la variedad de uva: ${variedadUva}; 2) estado fenológico observado: ${faseFenologica}; 3) síntomas detectados: ${sintomasDetectados}. Proveer diagnóstico diferencial, causas probables, y un plan de acción detallado y priorizado (medidas culturales, manejo fitosanitario, recomendaciones de seguimiento y controles). Entregar en español, con secciones claras y recomendaciones prácticas.`;

    const result: any = await (ai as any).models.generateContent({ model: 'gemini-1.5-flash', prompt });

    let reporte = '';

    if (result?.output?.[0]?.content) {
      const content = result.output[0].content;
      if (Array.isArray(content)) {
        reporte = content.map((c: any) => c?.text ?? '').join('');
      } else {
        reporte = content?.text ?? String(content);
      }
    } else if (result?.candidates?.[0]?.content) {
      const cand = result.candidates[0].content;
      reporte = Array.isArray(cand) ? cand.map((c: any) => c?.text ?? '').join('') : String(cand);
    } else if (typeof result === 'string') {
      reporte = result;
    } else {
      reporte = JSON.stringify(result);
    }

    return NextResponse.json({ reporte });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error interno' }, { status: 500 });
  }
}
