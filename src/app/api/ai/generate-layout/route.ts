import { NextRequest, NextResponse } from 'next/server';
import { generateLayoutWithGemini } from '@/lib/ai/gemini';
import { generateLayoutWithGroq } from '@/lib/ai/groq';
import { generateLayoutWithNvidia } from '@/lib/ai/nvidia';
import { parseAndGenerateOfflineHtml } from '@/lib/offline-parser';
import { generateStandaloneHtml, generateMoodleCss } from '@/lib/moodle-templates';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, tokens, prefix = 'esalud', provider = 'offline', apiKey, model } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'El contenido de texto no puede estar vacío.' }, { status: 400 });
    }

    if (!tokens) {
      return NextResponse.json({ error: 'Se requieren los tokens de diseño.' }, { status: 400 });
    }

    let htmlBlock = '';

    if (provider === 'offline' || !apiKey) {
      htmlBlock = parseAndGenerateOfflineHtml(text, tokens, prefix);
    } else {
      if (provider === 'gemini') {
        htmlBlock = await generateLayoutWithGemini(text, tokens, prefix, apiKey, model || 'gemini-2.5-flash');
      } else if (provider === 'groq') {
        htmlBlock = await generateLayoutWithGroq(text, tokens, prefix, apiKey, model || 'llama-3.3-70b-versatile');
      } else if (provider === 'nvidia') {
        htmlBlock = await generateLayoutWithNvidia(text, tokens, prefix, apiKey, model || 'meta/llama-3.1-70b-instruct');
      } else {
        htmlBlock = parseAndGenerateOfflineHtml(text, tokens, prefix);
      }
    }

    const fullHtml = generateStandaloneHtml(htmlBlock, tokens);
    const cssOnly = generateMoodleCss(tokens, prefix);

    return NextResponse.json({
      htmlBlock,
      fullHtml,
      cssOnly,
    });
  } catch (err: any) {
    console.error('Error en generate-layout:', err);
    return NextResponse.json({ error: err.message || 'Error al generar la maqueta' }, { status: 500 });
  }
}
