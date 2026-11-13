import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      variedadUva?: string;
      faseFenologica?: string;
      sintomasDetectados?: string;
      image?: string;
      mimeType?: string;
    };

    const variedadUva = body?.variedadUva?.trim();
    const faseFenologica = body?.faseFenologica?.trim();
    const sintomasDetectados = body?.sintomasDetectados?.trim();
    const rawImage = body?.image ?? '';
    const mimeType = body?.mimeType ?? 'image/jpeg';

    if (!variedadUva || !faseFenologica || !sintomasDetectados) {
      return NextResponse.json(
        { error: 'Los campos variedadUva, faseFenologica y sintomasDetectados son obligatorios.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const imageData = rawImage.includes('base64,') ? rawImage.split('base64,')[1] : '';
    const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

    const systemInstruction = `Actúa como un motor agronómico especialista en viticultura y fitosanidad. Debes responder SIEMPRE con un JSON válido y sin markdown. Identifica síntomas de estrés hídrico, mildiu, oídio, botritis, deficiencias nutricionales o ataques fitosanitarios. En el campo "diagnostico" devuelve un objeto con: resumen, severidad, causas_probables, accion_principal, pasos_accionables (array de 3 objetos con prioridad, accion, objetivo). En el campo "reporte" incluye una versión legible en español con un formato de 3 pasos accionables.`;

    const userPrompt = `Variedad de uva: ${variedadUva}
Fase fenológica: ${faseFenologica}
Síntomas detectados: ${sintomasDetectados}

Evalúa la situación agronómica y responde en español con un diagnóstico técnico real, orientado a la toma de decisiones en campo.`;

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: [
        {
          role: 'user',
          parts: [
            { text: userPrompt },
            ...(imageData
              ? [{ inlineData: { mimeType, data: imageData } }]
              : []),
          ],
        },
      ],
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        systemInstruction,
      },
    });

    const rawText =
      (response as any)?.text ??
      (response as any)?.candidates
        ?.map((candidate: any) =>
          candidate?.content?.parts
            ?.map((part: any) => part?.text ?? '')
            .join('') ?? ''
        )
        .join('\n') ??
      '';

    const cleanText = String(rawText).replace(/```json|```/gi, '').trim();

    let payload: any = {
      reporte: cleanText || 'Diagnóstico no disponible.',
      diagnostico: {
        resumen: 'Diagnóstico generado por IA en modo agronómico.',
        severidad: 'moderada',
        causas_probables: ['No se pudo extraer el diagnóstico estructurado.'],
        accion_principal: 'Revisar tejido foliar y condiciones ambientales.',
        pasos_accionables: [
          { prioridad: 1, accion: 'Inspeccionar síntomas y humedad relativa', objetivo: 'Confirmar diagnóstico' },
          { prioridad: 2, accion: 'Actuar con tratamiento o riego ajustado', objetivo: 'Reducir daño' },
          { prioridad: 3, accion: 'Monitorear evolución en 48-72 horas', objetivo: 'Validar respuesta' },
        ],
      },
    };

    if (cleanText) {
      try {
        const parsed = JSON.parse(cleanText);
        payload = { ...payload, ...parsed };
        payload.reporte = parsed.reporte ?? payload.reporte;
      } catch {
        payload.reporte = cleanText;
      }
    }

    if (!payload.reporte) {
      return NextResponse.json({ error: 'Respuesta vacía de la IA' }, { status: 500 });
    }

    return NextResponse.json(payload);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor al generar el diagnóstico.' },
      { status: 500 }
    );
  }
}
