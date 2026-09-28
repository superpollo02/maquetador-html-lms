import { DesignTokens } from '../types';
import { GEM_SYSTEM_PROMPT, buildVisionPrompt, buildGenerationPrompt } from './prompts';
import { parseTokensFromAiText } from './token-parser';

export async function extractTokensWithNvidia(
  base64Image: string,
  apiKey: string,
  modelName: string = 'meta/llama-3.2-11b-vision-instruct'
): Promise<DesignTokens> {
  const url = 'https://integrate.api.nvidia.com/v1/chat/completions';

  const imageUrl = base64Image.startsWith('data:')
    ? base64Image
    : `data:image/jpeg;base64,${base64Image}`;

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');

  // Usar el modelo ligero 11b si viene el 90b pesado, vacío o erróneo
  const activeModel =
    !modelName || modelName.includes('90b') || modelName.includes('gpt-')
      ? 'meta/llama-3.2-11b-vision-instruct'
      : modelName;

  const payload = {
    model: activeModel,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
          {
            type: 'text',
            text: buildVisionPrompt(),
          },
        ],
      },
    ],
    max_tokens: 1024,
    temperature: 0.2,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 segundos de timeout

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cleanKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 401) {
        throw new Error('Error en API de Nvidia NIM (401 No Autorizado): Clave rechazada. Verifica que comience con "nvapi-", que no esté expirada y que tengas créditos disponibles en build.nvidia.com.');
      }
      throw new Error(`Error en API de Nvidia NIM (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const textOutput = data?.choices?.[0]?.message?.content;
    if (!textOutput) {
      throw new Error('Respuesta vacía de Nvidia NIM al analizar la imagen.');
    }

    return parseTokensFromAiText(textOutput, 'Paleta Extraída con Nvidia NIM');
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(
        'Tiempo de espera agotado con Nvidia NIM (35s). El servidor de Nvidia tardó demasiado en responder con el modelo de visión. Te recomendamos usar Google Gemini Vision o Groq Vision en los Ajustes.'
      );
    }
    throw new Error(`Error al procesar con Nvidia NIM: ${err.message}`);
  }
}

export async function generateLayoutWithNvidia(
  text: string,
  tokens: DesignTokens,
  prefix: string,
  apiKey: string,
  modelName: string = 'meta/llama-3.1-70b-instruct'
): Promise<string> {
  const url = 'https://integrate.api.nvidia.com/v1/chat/completions';

  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');

  // Si viene el modelo deprecado 3.3, usar automáticamente 3.1
  const activeModel =
    !modelName || modelName.includes('3.3') || modelName.includes('gpt-')
      ? 'meta/llama-3.1-70b-instruct'
      : modelName;

  const payload = {
    model: activeModel,
    messages: [
      { role: 'system', content: GEM_SYSTEM_PROMPT },
      { role: 'user', content: buildGenerationPrompt(text, tokens, prefix) },
    ],
    max_tokens: 4096,
    temperature: 0.3,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cleanKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      if (res.status === 401) {
        throw new Error('Error en API de Nvidia NIM (401 No Autorizado): Clave rechazada. Verifica que comience con "nvapi-", que no esté expirada y que tengas créditos disponibles en build.nvidia.com.');
      }
      throw new Error(`Error en API de Nvidia NIM (${res.status}): ${errText}`);
    }

    const data = await res.json();
    let generatedHtml = data?.choices?.[0]?.message?.content;
    if (!generatedHtml) {
      throw new Error('Respuesta vacía de Nvidia NIM al maquetar el texto.');
    }

    generatedHtml = generatedHtml
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '')
      .trim();

    return generatedHtml;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado con Nvidia NIM (60s).');
    }
    throw err;
  }
}
