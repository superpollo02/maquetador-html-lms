import { DesignTokens } from '../types';
import { GEM_SYSTEM_PROMPT, buildVisionPrompt, buildGenerationPrompt } from './prompts';
import { parseTokensFromAiText } from './token-parser';

export async function extractTokensWithGroq(
  base64Image: string,
  apiKey: string,
  modelName: string = 'llama-3.2-11b-vision-preview'
): Promise<DesignTokens> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  // Sanitize model: Groq requires llama vision models, not OpenAI
  const activeModel =
    !modelName || modelName.includes('gpt-') || modelName.includes('3.3')
      ? 'llama-3.2-11b-vision-preview'
      : modelName;

  const imageUrl = base64Image.startsWith('data:')
    ? base64Image
    : `data:image/jpeg;base64,${base64Image}`;

  const payload = {
    model: activeModel,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: buildVisionPrompt() },
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cleanKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401) {
      throw new Error('Error en API de Groq (401 No Autorizado): La API Key de Groq es inválida. Verifica que empiece con "gsk_" y no tenga espacios.');
    }
    throw new Error(`Error en API de Groq (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const textOutput = data?.choices?.[0]?.message?.content;
  if (!textOutput) {
    throw new Error('Respuesta vacía de Groq al analizar la imagen.');
  }

    return parseTokensFromAiText(textOutput, 'Paleta Extraída con Groq Vision');
}

export async function generateLayoutWithGroq(
  text: string,
  tokens: DesignTokens,
  prefix: string,
  apiKey: string,
  modelName: string = 'llama-3.3-70b-versatile'
): Promise<string> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  const activeModel =
    !modelName || modelName.includes('gpt-')
      ? 'llama-3.3-70b-versatile'
      : modelName;

  const payload = {
    model: activeModel,
    messages: [
      { role: 'system', content: GEM_SYSTEM_PROMPT },
      { role: 'user', content: buildGenerationPrompt(text, tokens, prefix) },
    ],
    temperature: 0.3,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cleanKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401) {
      throw new Error('Error en API de Groq (401 No Autorizado): La API Key de Groq es inválida. Verifica que empiece con "gsk_" y no tenga espacios.');
    }
    throw new Error(`Error en API de Groq (${res.status}): ${errText}`);
  }

  const data = await res.json();
  let generatedHtml = data?.choices?.[0]?.message?.content;
  if (!generatedHtml) {
    throw new Error('Respuesta vacía de Groq al maquetar el texto.');
  }

  generatedHtml = generatedHtml
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '')
    .trim();

  return generatedHtml;
}
