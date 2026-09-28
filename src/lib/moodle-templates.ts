import { DesignTokens } from './types';

export function sanitizeText(rawText: string): string {
  // Rule 1: Eliminate citation brackets like [cite: 1], [cite: 2], [1], [2], etc.
  return rawText
    .replace(/\[cite:\s*\d+\]/gi, '')
    .replace(/\[\s*fuente:[^\]]*\]/gi, '')
    .trim();
}

export function generateMoodleCss(tokens: DesignTokens, prefix: string = 'esalud'): string {
  const p = prefix.replace(/[^a-zA-Z0-9_-]/g, '') || 'esalud';
  
  return `
/* === ESTILOS MODULARES LMS / MOODLE-SAFE (.${p}-*) === */
.${p}-container {
  --color-bg: ${tokens.bg};
  --color-surface: ${tokens.surface};
  --color-surface-subtle: ${tokens.surfaceSubtle};
  --color-ink-primary: ${tokens.inkPrimary};
  --color-ink-muted: ${tokens.inkMuted};
  --color-accent-primary: ${tokens.accentPrimary};
  --color-accent-secondary: ${tokens.accentSecondary};
  --font-title: '${tokens.fontTitle}', system-ui, -apple-system, sans-serif;
  --font-body: '${tokens.fontBody}', system-ui, -apple-system, sans-serif;
  --radius-sm: ${tokens.radiusSm};
  --radius-md: ${tokens.radiusMd};
  --radius-lg: ${tokens.radiusLg};
  --shadow-sm: ${tokens.shadowSm};
  --shadow-md: ${tokens.shadowMd};

  width: 100%;
  max-width: 1040px;
  margin: 1.5rem auto;
  padding: 1.25rem;
  box-sizing: border-box;
  font-family: var(--font-body);
  color: var(--color-ink-primary);
  background-color: var(--color-bg);
  line-height: 1.65;
  font-size: 16px;
  border-radius: var(--radius-lg);
}

.${p}-container * {
  box-sizing: border-box;
}

/* --- BANNER INSTITUCIONAL --- */
.${p}-banner {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-subtle) 100%);
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-left: 6px solid var(--color-accent-primary);
  border-radius: var(--radius-md);
  padding: 1.75rem 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.${p}-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  background-color: var(--color-surface);
  color: var(--color-accent-primary);
  border: 1px solid var(--color-accent-primary);
  margin-bottom: 0.75rem;
}

.${p}-title {
  font-family: var(--font-title);
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--color-ink-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.25;
}

.${p}-subtitle {
  font-size: 1.05rem;
  color: var(--color-ink-muted);
  margin: 0;
  line-height: 1.5;
}

/* --- SECCIONES Y ENCABEZADOS --- */
.${p}-section {
  margin-bottom: 2.25rem;
}

.${p}-section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-surface-subtle);
}

.${p}-section-title {
  font-family: var(--font-title);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-ink-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.${p}-badge-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background-color: var(--color-accent-primary);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* --- GRILLAS DE GLOSARIO / CONCEPTOS --- */
.${p}-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.25rem;
}

.${p}-card {
  position: relative;
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 1.5rem 1.25rem 1.25rem 1.25rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.${p}-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.${p}-card-title {
  font-family: var(--font-title);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-ink-primary);
  margin: 0 0 0.5rem 0;
  padding-right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.${p}-card-body {
  font-size: 0.95rem;
  color: var(--color-ink-muted);
  margin: 0;
  flex-grow: 1;
}

/* --- BOTÓN DE COPIADO RÁPIDO CON RETROALIMENTACIÓN --- */
.${p}-copy-btn {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  background: var(--color-surface-subtle);
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: var(--color-ink-muted);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s ease;
  user-select: none;
  z-index: 2;
}

.${p}-copy-btn:hover {
  background: var(--color-accent-primary);
  color: #ffffff;
  border-color: var(--color-accent-primary);
}

.${p}-copy-btn.${p}-copied {
  background: #10b981 !important;
  color: #ffffff !important;
  border-color: #10b981 !important;
}

/* --- RIELES SECUENCIALES (STEP-BY-STEP) --- */
.${p}-rail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  padding-left: 0.5rem;
}

.${p}-step {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  position: relative;
}

.${p}-step-node {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--color-accent-primary);
  color: #ffffff;
  font-family: var(--font-title);
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 0 4px var(--color-surface-subtle);
  z-index: 1;
}

.${p}-step-content {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 1.25rem;
  flex-grow: 1;
  box-shadow: var(--shadow-sm);
}

.${p}-step-title {
  font-family: var(--font-title);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-ink-primary);
  margin: 0 0 0.35rem 0;
}

.${p}-step-desc {
  font-size: 0.95rem;
  color: var(--color-ink-muted);
  margin: 0;
}

/* --- CAJAS DE PLANTILLA / MENSAJERÍA --- */
.${p}-template-box {
  position: relative;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid rgba(0,0,0,0.08);
  border-top: 4px solid var(--color-accent-secondary);
  padding: 1.5rem;
  margin-top: 1rem;
  box-shadow: var(--shadow-sm);
}

.${p}-meta-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  background: var(--color-surface-subtle);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.${p}-meta-item strong {
  color: var(--color-ink-primary);
}

.${p}-meta-item span {
  color: var(--color-ink-muted);
}

.${p}-template-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9rem;
  background: var(--color-surface-subtle);
  padding: 1rem;
  border-radius: var(--radius-sm);
  white-space: pre-wrap;
  color: var(--color-ink-primary);
  line-height: 1.6;
}

/* --- CAJAS DE AVISO / CALLOUTS --- */
.${p}-callout {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1.15rem 1.25rem;
  border-radius: var(--radius-md);
  background: var(--color-surface-subtle);
  border-left: 4px solid var(--color-accent-primary);
  margin: 1.5rem 0;
  font-size: 0.95rem;
}

.${p}-callout-icon {
  width: 22px;
  height: 22px;
  color: var(--color-accent-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

/* --- RESPONSIVIDAD LMS --- */
@media (max-width: 768px) {
  .${p}-container {
    padding: 0.75rem;
    margin: 0.5rem auto;
  }
  .${p}-banner {
    padding: 1.25rem 1.25rem;
  }
  .${p}-title {
    font-size: 1.45rem;
  }
  .${p}-grid {
    grid-template-columns: 1fr;
  }
  .${p}-step {
    flex-direction: column;
    gap: 0.5rem;
  }
}
`.trim();
}

export function generateMoodleJs(prefix: string = 'esalud'): string {
  const p = prefix.replace(/[^a-zA-Z0-9_-]/g, '') || 'esalud';
  return `
(function() {
  function initCopyButtons() {
    var buttons = document.querySelectorAll('.${p}-copy-btn');
    buttons.forEach(function(btn) {
      if (btn.getAttribute('data-bound') === 'true') return;
      btn.setAttribute('data-bound', 'true');

      btn.addEventListener('click', function(e) {
        e.preventDefault();
        var targetId = this.getAttribute('data-target');
        var targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        var text = (targetEl.innerText || targetEl.textContent || '').trim();
        var originalHtml = this.innerHTML;
        var btnRef = this;

        function showSuccess() {
          btnRef.classList.add('${p}-copied');
          btnRef.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg> ¡Copiado!';
          setTimeout(function() {
            btnRef.classList.remove('${p}-copied');
            btnRef.innerHTML = originalHtml;
          }, 2000);
        }

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(showSuccess).catch(function() {
            fallbackCopy(text, showSuccess);
          });
        } else {
          fallbackCopy(text, showSuccess);
        }
      });
    });
  }

  function fallbackCopy(text, callback) {
    try {
      var textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '-9999px';
      textArea.style.left = '-9999px';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      var successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful && callback) callback();
    } catch (err) {
      console.error('Fallback clipboard error', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopyButtons);
  } else {
    initCopyButtons();
  }
})();
`.trim();
}

export function generateStandaloneHtml(htmlBlock: string, tokens: DesignTokens): string {
  const fontTitleParam = encodeURIComponent(tokens.fontTitle);
  const fontBodyParam = encodeURIComponent(tokens.fontBody);
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tokens.name || 'Recurso Educativo LMS'}</title>
  <!-- Google Fonts Oficiales -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${fontTitleParam}:wght@500;600;700;800&family=${fontBodyParam}:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 20px; background-color: #f1f5f9;">
${htmlBlock}
</body>
</html>`;
}
