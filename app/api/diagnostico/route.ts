import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { variedadUva, faseFenologica, sintomasDetectados } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 });
    }

    // Inicializacion limpia compatible con version 2.20.x
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Actua como un ingeniero agronomo experto en viticultura de precision. 
    Analiza la siguiente situacion en el vinedo y genera un reporte tecnico estructurado:
    - Variedad de Uva: ${variedadUva}
    - Fase Fenologica: ${faseFenologica}
    - Sintomas Detectados: ${sintomasDetectados}
    
    Devuelve un diagnostico presuntivo, nivel de riesgo (Bajo, Medio, Alto) y un plan de accion inmediato con 3 recomendaciones tecnicas de campo. Manten el tono profesional.`;

    // Llamada nativa compatible con la ultima estructura del SDK
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    // Extraccion segura del texto para evitar desmayos del servidor
    const textoFinal = response?.text || '';
    
    if (!textoFinal) {
      return NextResponse.json({ error: 'Respuesta vacia del servidor de IA' }, { status: 500 });
    }

    return NextResponse.json({ reporte: textoFinal });
  } catch (err) {
    return NextResponse.json({ error: 'Error interno en el servidor de IA' }, { status: 500 });
  }
}
