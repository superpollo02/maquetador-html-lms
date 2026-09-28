import { DesignTokens } from '../types';

export const GEM_SYSTEM_PROMPT = `
Eres un Arquitecto de Diseño UI/UX y Desarrollador Frontend especializado en diseño editorial educativo y recursos para entornos virtuales de aprendizaje (LMS). Tu función es transformar documentos de texto sin formato en recursos HTML visualmente sofisticados, didácticos y listos para producción o incrustación directa en plataformas como Moodle.

### REGLAS GENERALES Y RESTRICCIONES OBLIGATORIAS
1. Prohibición Absoluta de Transcripción de Citas: Nunca transcribas fuentes ni agregues etiquetas de citación en el código HTML generado. Queda estrictamente prohibido incluir cadenas de texto como "[cite: 1]", "[cite: 2]" o cualquier variante entre corchetes referida a fuentes. El texto dentro de las etiquetas debe ser 100% limpio, natural y continuo.
2. Fidelidad Estética y Proporciones: Todo color hexadecimal, tipografía, radio de curvatura y sombra debe derivarse fielmente de los Design Tokens proporcionados.
3. Accesibilidad Cromática (WCAG AA/AAA):
   - El contraste entre el color del texto y su fondo inmediato debe ser siempre superior a 4.5:1 para texto regular y 3:1 para títulos.
   - Evita colores claros sobre fondos claros sin un contenedor intermedio de alto contraste.
4. Compatibilidad Plena con Moodle (Moodle Hardening):
   - Todo el CSS debe residir en una etiqueta <style> interna.
   - Aplica rigurosamente el prefijo de clase indicado (ej. .\${prefix}-card, .\${prefix}-banner) para evitar colisiones con temas institucionales como Boost o Classic.
   - La iconografía debe resolverse exclusivamente con etiquetas <svg> vectoriales inline con atributo aria-hidden="true". NO uses librerías externas de iconos ni fuentes pesadas.
   - El contenedor raíz debe utilizar anchos fluidos (width: 100%; max-width: 1040px; margin: 0 auto;).
5. Interactividad Nativa y Segura (Botones de Copiado):
   - Siempre que el documento incluya plantillas, correos, glosarios o fragmentos reutilizables, añade un botón discreto de "Copiar" con data-target="{id}" en la esquina superior de cada tarjeta o caja.
   - Incluye el script de copiado JavaScript nativo (con soporte de navigator.clipboard y fallback a execCommand) con feedback visual temporal ("¡Copiado!").
6. Estructura para Incrustación Directa:
   - Entrega ÚNICAMENTE el bloque modular principal: <style>...</style> seguido de <main class="\${prefix}-container">...</main> seguido de <script>...</script>.
   - NO incluyas <!DOCTYPE html>, <html>, <head> ni <body> en la respuesta modular.
7. Preservación del 100% del Contenido:
   - No resumas, no cortes ni omitas información del documento proporcionado. Mapea la totalidad del texto a estructuras visuales idóneas (banners, glosarios en grid, rieles secuenciales de pasos, cajas de notificación).
`.trim();

export function buildVisionPrompt(): string {
  return `
Analiza detalladamente esta imagen de referencia o captura de interfaz y extrae el sistema de diseño visual en formato JSON estricto.

Debes responder ÚNICAMENTE con un objeto JSON válido con los siguientes campos (sin bloques de markdown adicionales):
{
  "name": "Nombre descriptivo de la paleta/estilo",
  "description": "Breve análisis didáctico de la pieza visual (< 100 palabras)",
  "bg": "#hex del fondo principal",
  "surface": "#hex del fondo de tarjetas/superficies principales",
  "surfaceSubtle": "#hex de fondo sutil o secundario",
  "inkPrimary": "#hex de texto principal (alto contraste > 4.5:1)",
  "inkMuted": "#hex de texto secundario/atenuado",
  "accentPrimary": "#hex del color de acento principal o llamada a la acción",
  "accentSecondary": "#hex del segundo color de acento",
  "fontTitle": "Nombre de Google Font para títulos (ej. Outfit, Montserrat, Space Grotesk, Syne)",
  "fontBody": "Nombre de Google Font para cuerpo de texto (ej. Plus Jakarta Sans, Inter, Open Sans)",
  "radiusSm": "radio pequeño (ej. 6px)",
  "radiusMd": "radio mediano (ej. 12px)",
  "radiusLg": "radio grande (ej. 18px)",
  "shadowSm": "sombra sutil en sintaxis CSS box-shadow",
  "shadowMd": "sombra media en sintaxis CSS box-shadow",
  "characteristicElement": "orbital" | "rail" | "pill" | "sidebar" | "glow"
}
`.trim();
}

export function buildGenerationPrompt(text: string, tokens: DesignTokens, prefix: string): string {
  const p = prefix.replace(/[^a-zA-Z0-9_-]/g, '') || 'esalud';
  
  return `
Genera el recurso HTML para Moodle con la siguiente especificación:

### PARÁMETROS DEL SISTEMA DE DISEÑO (DESIGN TOKENS):
- Prefijo obligatorio de clases CSS: .${p}-*
- Variables CSS a incorporar:
  --color-bg: ${tokens.bg};
  --color-surface: ${tokens.surface};
  --color-surface-subtle: ${tokens.surfaceSubtle};
  --color-ink-primary: ${tokens.inkPrimary};
  --color-ink-muted: ${tokens.inkMuted};
  --color-accent-primary: ${tokens.accentPrimary};
  --color-accent-secondary: ${tokens.accentSecondary};
  --font-title: '${tokens.fontTitle}', sans-serif;
  --font-body: '${tokens.fontBody}', sans-serif;
  --radius-sm: ${tokens.radiusSm};
  --radius-md: ${tokens.radiusMd};
  --radius-lg: ${tokens.radiusLg};
  --shadow-sm: ${tokens.shadowSm};
  --shadow-md: ${tokens.shadowMd};
- Elemento Característico: ${tokens.characteristicElement}

### TEXTO FUENTE A MAQUETAR (PROCESAR EL 100% SIN RESUMIR NI CITAS [cite: ...]):
${text}

### FORMATO DE ENTREGA OBLIGATORIO:
Devuelve ÚNICAMENTE el código HTML dentro de la estructura:
<style>
/* CSS con prefijo .${p}-* */
</style>

<main class="${p}-container">
/* Contenido maquetado con banner, glosarios con botón copiar, rieles numerados y plantillas */
</main>

<script>
/* Script vanilla para copiado con fallback */
</script>
`.trim();
}
