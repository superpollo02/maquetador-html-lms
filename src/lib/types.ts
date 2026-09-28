export type CharacteristicElement = 'orbital' | 'rail' | 'pill' | 'sidebar' | 'glow';

export interface DesignTokens {
  name?: string;
  description?: string;
  bg: string;
  surface: string;
  surfaceSubtle: string;
  inkPrimary: string;
  inkMuted: string;
  accentPrimary: string;
  accentSecondary: string;
  fontTitle: string;
  fontBody: string;
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  shadowSm: string;
  shadowMd: string;
  characteristicElement: CharacteristicElement;
}

export interface ApiSettings {
  geminiKey: string;
  groqKey: string;
  nvidiaKey: string;
  activeVisionProvider: 'gemini' | 'groq' | 'nvidia';
  activeTextProvider: 'groq' | 'gemini' | 'nvidia' | 'offline';
  geminiModel: string;
  groqModel: string;
  groqVisionModel: string;
  nvidiaModel: string;
  nvidiaVisionModel: string;
}

export interface GenerationResult {
  htmlBlock: string;
  fullHtml: string;
  cssOnly: string;
  summary?: string;
  error?: string;
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
