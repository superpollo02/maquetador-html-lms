import { NextRequest, NextResponse } from 'next/server';
import { extractTokensWithGemini } from '@/lib/ai/gemini';
import { extractTokensWithGroq } from '@/lib/ai/groq';
import { extractTokensWithNvidia } from '@/lib/ai/nvidia';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, mimeType, provider, apiKey, model } = body;

    if (!image) {
      return NextResponse.json({ error: 'No se proporcionó imagen para análisis' }, { status: 400 });
    }

    if (image.length > 5 * 1024 * 1024) { // Aprox 5MB base64
      return NextResponse.json({ error: 'La imagen es demasiado grande. Por favor, sube una imagen de menor peso (máx 5MB).' }, { status: 413 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: `Debes configurar la API Key de ${provider || 'tu proveedor'} en los ajustes.` },
        { status: 400 }
      );
    }

    let tokens;
    if (provider === 'gemini') {
      tokens = await extractTokensWithGemini(image, mimeType, apiKey, model || 'gemini-2.5-flash');
    } else if (provider === 'groq') {
      tokens = await extractTokensWithGroq(image, apiKey, model || 'llama-3.2-11b-vision-preview');
    } else if (provider === 'nvidia') {
      tokens = await extractTokensWithNvidia(image, apiKey, model || 'meta/llama-3.2-11b-vision-instruct');
    } else {
      return NextResponse.json({ error: `Proveedor de visión '${provider}' no soportado.` }, { status: 400 });
    }

    return NextResponse.json({ tokens });
  } catch (err: any) {
    console.error('Error en extract-tokens:', err);
    return NextResponse.json({ error: err.message || 'Error al procesar la imagen' }, { status: 500 });
  }
}
