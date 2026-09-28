import { DesignTokens, CharacteristicElement } from '../types';
import { getContrastRatio } from '../wcag';

function calibrateContrast(surface: string, inkPrimary: string, inkMuted: string): { inkPrimary: string; inkMuted: string } {
  const currentRatio = getContrastRatio(inkPrimary, surface);
  if (currentRatio >= 4.5) {
    return { inkPrimary, inkMuted };
  }

  // Si el contraste es bajo (ej. 1.07:1 por texto claro sobre fondo claro), calibrar automáticamente
  const isSurfaceLight = getContrastRatio(surface, '#000000') > getContrastRatio(surface, '#ffffff');
  return {
    inkPrimary: isSurfaceLight ? '#0f172a' : '#f8fafc',
    inkMuted: isSurfaceLight ? '#475569' : '#cbd5e1',
  };
}

export function parseTokensFromAiText(
  textOutput: string,
  defaultName: string = 'Paleta Extraída'
): DesignTokens {
  if (!textOutput || !textOutput.trim()) {
    throw new Error('Respuesta vacía del proveedor de IA.');
  }

  // 1. Try finding and parsing any JSON block {...}
  const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.bg || parsed.surface || parsed.accentPrimary) {
        const surface = parsed.surface || '#ffffff';
        const ink = calibrateContrast(surface, parsed.inkPrimary || '#0f172a', parsed.inkMuted || '#475569');

        return {
          name: parsed.name || defaultName,
          description: parsed.description || 'Tokens extraídos del diseño de referencia.',
          bg: parsed.bg || '#f8fafc',
          surface,
          surfaceSubtle: parsed.surfaceSubtle || '#f1f5f9',
          inkPrimary: ink.inkPrimary,
          inkMuted: ink.inkMuted,
          accentPrimary: parsed.accentPrimary || '#0284c7',
          accentSecondary: parsed.accentSecondary || '#0d9488',
          fontTitle: parsed.fontTitle || 'Outfit',
          fontBody: parsed.fontBody || 'Plus Jakarta Sans',
          radiusSm: parsed.radiusSm || '6px',
          radiusMd: parsed.radiusMd || '12px',
          radiusLg: parsed.radiusLg || '18px',
          shadowSm: parsed.shadowSm || '0 1px 3px rgba(0,0,0,0.06)',
          shadowMd: parsed.shadowMd || '0 4px 14px rgba(0,0,0,0.08)',
          characteristicElement: (parsed.characteristicElement as CharacteristicElement) || 'orbital',
        };
      }
    } catch (e) {
      // Ignorar fallo de JSON y continuar a la extracción por regex
    }
  }

  // 2. Fallback Inteligente: Extraer colores hexadecimales y propiedades desde Markdown/prosa
  const hexMatches = textOutput.match(/#[0-9a-fA-F]{3,6}\b/g) || [];

  const extractHex = (pattern: RegExp, fallback: string): string => {
    const match = textOutput.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
    return fallback;
  };

  const bg = extractHex(/(?:Background(?:\s*Color)?|Fondo)[^#\n\r]*?(#[0-9a-fA-F]{3,6})/i, hexMatches[0] || '#f8fafc');
  const surface = extractHex(/(?:Surface(?:\s*Color)?|Superficie)[^#\n\r]*?(#[0-9a-fA-F]{3,6})/i, hexMatches[1] || '#ffffff');
  const surfaceSubtle = extractHex(/(?:Surface\s*Subtle|Superficie\s*Sutil)[^#\n\r]*?(#[0-9a-fA-F]{3,6})/i, hexMatches[2] || '#f1f5f9');
  const rawInkPrimary = extractHex(/(?:Primary\s*Ink|Texto\s*Principal)[^#\n\r]*?(#[0-9a-fA-F]{3,6})/i, hexMatches[3] || '#0f172a');
  const rawInkMuted = extractHex(/(?:Muted\s*Ink|Texto\s*Secundario)[^#\n\r]*?(#[0-9a-fA-F]{3,6})/i, hexMatches[4] || '#475569');
  const accentPrimary = extractHex(/(?:Accent(?:\s*Color)?|Acento\s*Primario)[^#\n\r]*?(#[0-9a-fA-F]{3,6})/i, hexMatches[5] || '#0284c7');
  const accentSecondary = extractHex(/(?:Secondary\s*Accent|Acento\s*Secundario)[^#\n\r]*?(#[0-9a-fA-F]{3,6})/i, hexMatches[6] || '#0d9488');

  // Calibrar contraste para que nunca falle la accesibilidad por defecto
  const ink = calibrateContrast(surface, rawInkPrimary, rawInkMuted);

  // Extraer fuentes
  const extractFont = (pattern: RegExp, fallback: string): string => {
    const match = textOutput.match(pattern);
    if (match && match[1]) {
      const cleaned = match[1].replace(/[*_`]/g, '').trim().split(/[,.\n\r]/)[0].trim();
      return cleaned || fallback;
    }
    return fallback;
  };

  const fontTitle = extractFont(/(?:Title\s*Font|Fuente\s*de\s*T[ií]tulos?)[^.\n\r]*?\b(?:is|es|:)\s+([A-Za-z\s]+)/i, 'Outfit');
  const fontBody = extractFont(/(?:Body\s*Font|Fuente\s*de\s*Lectura|Texto)[^.\n\r]*?\b(?:is|es|:)\s+([A-Za-z\s]+)/i, 'Plus Jakarta Sans');

  // Elemento característico
  let characteristicElement: CharacteristicElement = 'orbital';
  const lower = textOutput.toLowerCase();
  if (lower.includes('rail')) characteristicElement = 'rail';
  else if (lower.includes('pill')) characteristicElement = 'pill';
  else if (lower.includes('sidebar')) characteristicElement = 'sidebar';
  else if (lower.includes('glow')) characteristicElement = 'glow';

  return {
    name: defaultName,
    description: 'Sistema de diseño analizado y recuperado automáticamente desde el informe visual de la IA con calibración de contraste accesible.',
    bg,
    surface,
    surfaceSubtle,
    inkPrimary: ink.inkPrimary,
    inkMuted: ink.inkMuted,
    accentPrimary,
    accentSecondary,
    fontTitle,
    fontBody,
    radiusSm: '6px',
    radiusMd: '12px',
    radiusLg: '18px',
    shadowSm: '0 1px 3px rgba(0,0,0,0.06)',
    shadowMd: '0 4px 14px rgba(0,0,0,0.08)',
    characteristicElement,
  };
}
