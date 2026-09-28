import { DesignTokens } from '../types';
import { GEM_SYSTEM_PROMPT, buildVisionPrompt, buildGenerationPrompt } from './prompts';
import { parseTokensFromAiText } from './token-parser';

// Modelos Gemini activos a septiembre 2026 (en orden de preferencia para fallback)
const GEMINI_FLASH_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash-lite',
];

async function tryGeminiRequest(
  cleanKey: string,
  modelName: string,
  payload: object
): Promise<Response> {
  // 1. Intentar con el modelo configurado
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${cleanKey}`;
  let res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  // 2. Si el modelo no existe (404), recorrer la lista de fallback automáticamente
  if (!res.ok && res.status === 404) {
    for (const fallbackModel of GEMINI_FLASH_MODELS) {
      if (fallbackModel === modelName) continue; // saltar el que ya falló
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${cleanKey}`;
      res = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) break; // salir en cuanto uno funcione
    }
  }

  return res;
}

export async function extractTokensWithGemini(
  base64Image: string,
  mimeType: string,
  apiKey: string,
  modelName: string = 'gemini-3.8-flash'
): Promise<DesignTokens> {
  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  const cleanBase64 = base64Image.replace(/^data:[^;]+;base64,/, '');

  const payload = {
    contents: [
      {
        parts: [
          { text: buildVisionPrompt() },
          {
            inline_data: {
              mime_type: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      response_mime_type: 'application/json',
    },
  };

  const res = await tryGeminiRequest(cleanKey, modelName, payload);

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 400 || res.status === 403) {
      throw new Error(
        'Error en API de Gemini: Tu clave de Google no es válida o no tiene permisos. Obtén una clave gratuita en aistudio.google.com/app/apikey.'
      );
    }
    if (res.status === 429) {
      throw new Error(
        'Error en API de Gemini (429 Cuota superada): Has alcanzado el límite gratuito de solicitudes. Espera unos minutos e inténtalo de nuevo.'
      );
    }
    throw new Error(`Error en API de Gemini (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error('Respuesta vacía de Gemini al analizar la imagen.');
  }

  return parseTokensFromAiText(textOutput, 'Paleta Extraída con Gemini');
}

export async function generateLayoutWithGemini(
  text: string,
  tokens: DesignTokens,
  prefix: string,
  apiKey: string,
  modelName: string = 'gemini-3.8-flash'
): Promise<string> {
  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');

  const payload = {
    system_instruction: {
      parts: [{ text: GEM_SYSTEM_PROMPT }],
    },
    contents: [
      {
        parts: [{ text: buildGenerationPrompt(text, tokens, prefix) }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
    },
  };

  const res = await tryGeminiRequest(cleanKey, modelName, payload);

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 400 || res.status === 403) {
      throw new Error(
        'Error en API de Gemini: Tu clave de Google no es válida o no tiene permisos. Obtén una clave gratuita en aistudio.google.com/app/apikey.'
      );
    }
    if (res.status === 429) {
      throw new Error(
        'Error en API de Gemini (429 Cuota superada): Has alcanzado el límite gratuito de solicitudes. Espera unos minutos e inténtalo de nuevo.'
      );
    }
    throw new Error(`Error en API de Gemini (${res.status}): ${errText}`);
  }

  const data = await res.json();
  let generatedHtml = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!generatedHtml) {
    throw new Error('Respuesta vacía de Gemini al maquetar el texto.');
  }

  generatedHtml = generatedHtml
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '')
    .trim();

  return generatedHtml;
}
