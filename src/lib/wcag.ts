// WCAG 2.1 Contrast Calculation Utilities

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let cleaned = hex.replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  if (cleaned.length !== 6) return null;
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map(val => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;

  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return parseFloat(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

export interface ContrastStatus {
  ratio: number;
  passesAA: boolean; // >= 4.5 for normal text
  passesAALarge: boolean; // >= 3.0 for large text / headers
  passesAAA: boolean; // >= 7.0 for normal text
  scoreLabel: 'Excelente' | 'Aceptable' | 'Bajo Contraste';
}

export function checkContrast(foregroundHex: string, backgroundHex: string): ContrastStatus {
  const ratio = getContrastRatio(foregroundHex, backgroundHex);
  const passesAA = ratio >= 4.5;
  const passesAALarge = ratio >= 3.0;
  const passesAAA = ratio >= 7.0;

  let scoreLabel: ContrastStatus['scoreLabel'] = 'Bajo Contraste';
  if (passesAAA) scoreLabel = 'Excelente';
  else if (passesAA) scoreLabel = 'Aceptable';

  return {
    ratio,
    passesAA,
    passesAALarge,
    passesAAA,
    scoreLabel,
  };
}
