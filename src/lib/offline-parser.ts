import { DesignTokens } from './types';
import { generateMoodleCss, generateMoodleJs, sanitizeText } from './moodle-templates';

export function parseAndGenerateOfflineHtml(
  rawText: string,
  tokens: DesignTokens,
  prefix: string = 'esalud'
): string {
  const p = prefix.replace(/[^a-zA-Z0-9_-]/g, '') || 'esalud';
  const clean = sanitizeText(rawText);
  const lines = clean.split('\n');

  let bannerTitle = 'Guía Pedagógica y Operativa';
  let bannerTag = 'Recurso Educativo LMS';
  let bannerSubtitle = 'Estructura modular para entornos virtuales de aprendizaje';

  let sections: {
    title: string;
    type: 'glossary' | 'rail' | 'template' | 'general';
    items: any[];
  }[] = [];

  let currentSection: {
    title: string;
    type: 'glossary' | 'rail' | 'template' | 'general';
    items: any[];
  } | null = null;

  let inTemplateBlock = false;
  let templateMeta: { [key: string]: string } = {};
  let templateBodyLines: string[] = [];
  let templateTitle = 'Plantilla de Comunicación';

  let bannerFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check for H1 / Title if banner not yet set
    if (!bannerFound && (line.startsWith('# ') || line.toUpperCase().includes('PROTOCOLO') || line.toUpperCase().includes('GUÍA') || line.toUpperCase().includes('MANUAL'))) {
      bannerTitle = line.replace(/^#\s*/, '').replace(/\*\*/g, '');
      if (lines[i + 1] && !lines[i + 1].startsWith('#')) {
        bannerSubtitle = lines[i + 1].trim().replace(/\*\*/g, '');
        i++;
      }
      bannerFound = true;
      continue;
    }

    // Check for tag / norm identifier (e.g. Módulo 3, Código: MED-101)
    if (!bannerFound && (line.startsWith('Módulo') || line.startsWith('Unidad') || line.startsWith('Código:'))) {
      bannerTag = line;
      continue;
    }

    // Section headers (H2 or lines ending with :)
    if (line.startsWith('## ')) {
      if (currentSection) sections.push(currentSection);
      const sectionTitle = line.replace(/^##\s*/, '').replace(/\*\*/g, '');
      
      let type: 'glossary' | 'rail' | 'template' | 'general' = 'general';
      const lower = sectionTitle.toLowerCase();
      if (lower.includes('glosario') || lower.includes('conceptos') || lower.includes('términos') || lower.includes('definiciones')) {
        type = 'glossary';
      } else if (lower.includes('paso') || lower.includes('procedimiento') || lower.includes('guía') || lower.includes('etapa') || lower.includes('fase') || lower.includes('flujo')) {
        type = 'rail';
      } else if (lower.includes('plantilla') || lower.includes('correo') || lower.includes('mensaje') || lower.includes('notificación')) {
        type = 'template';
      }

      currentSection = {
        title: sectionTitle,
        type,
        items: [],
      };
      continue;
    }

    // Template detection
    if (line.toLowerCase().startsWith('destinatario:') || line.toLowerCase().startsWith('canal:') || line.toLowerCase().startsWith('asunto:')) {
      if (!currentSection || currentSection.type !== 'template') {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: 'Plantilla de Comunicación Oficial', type: 'template', items: [] };
      }
      const parts = line.split(':');
      const key = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      templateMeta[key] = val;
      inTemplateBlock = true;
      continue;
    }

    // Numbered step (e.g., "1. Paso..." or "1) ...")
    const stepMatch = line.match(/^(\d+)[\.\)]\s*(.*)/);
    if (stepMatch) {
      if (!currentSection || (currentSection.type !== 'rail' && currentSection.type !== 'glossary')) {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: 'Procedimiento Paso a Paso', type: 'rail', items: [] };
      }

      const rest = stepMatch[2];
      const colonIndex = rest.indexOf(':');
      let stepTitle = `Paso ${stepMatch[1]}`;
      let stepDesc = rest;
      if (colonIndex > 0) {
        stepTitle = rest.slice(0, colonIndex).replace(/\*\*/g, '').trim();
        stepDesc = rest.slice(colonIndex + 1).replace(/\*\*/g, '').trim();
      }

      currentSection.items.push({
        num: stepMatch[1],
        title: stepTitle,
        desc: stepDesc,
      });
      continue;
    }

    // Key-value concept or Glossary item (e.g. "**Concepto**: Definición" or "### Concepto")
    const conceptMatch = line.match(/^(\*\*[^*]+\*\*|###\s*[^:]+):\s*(.*)/);
    if (conceptMatch) {
      if (!currentSection) {
        currentSection = { title: 'Glosario y Conceptos Clave', type: 'glossary', items: [] };
      }
      const term = conceptMatch[1].replace(/[\*#]/g, '').trim();
      const def = conceptMatch[2].trim();
      currentSection.items.push({ term, def });
      continue;
    }

    // Normal paragraph or bullet point
    if (!currentSection) {
      currentSection = { title: 'Información General', type: 'general', items: [] };
    }

    if (inTemplateBlock) {
      templateBodyLines.push(line);
    } else {
      currentSection.items.push({ text: line });
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  // Build the HTML
  let html = `<style>\n${generateMoodleCss(tokens, p)}\n</style>\n\n`;
  html += `<main class="${p}-container">\n`;
  
  // Banner
  html += `  <!-- Banner Institucional -->
  <header class="${p}-banner">
    <span class="${p}-tag">${escapeHtml(bannerTag)}</span>
    <h1 class="${p}-title">${escapeHtml(bannerTitle)}</h1>
    <p class="${p}-subtitle">${escapeHtml(bannerSubtitle)}</p>
  </header>\n\n`;

  let cardIndex = 1;

  // Render sections
  sections.forEach((sec, sIdx) => {
    html += `  <!-- Sección: ${escapeHtml(sec.title)} -->\n`;
    html += `  <section class="${p}-section">\n`;
    html += `    <div class="${p}-section-header">\n`;
    html += `      <span class="${p}-badge-icon" aria-hidden="true">\n`;
    html += `        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>\n`;
    html += `      </span>\n`;
    html += `      <h2 class="${p}-section-title">${escapeHtml(sec.title)}</h2>\n`;
    html += `    </div>\n`;

    if (sec.type === 'glossary' || sec.items.some(i => i.term)) {
      html += `    <div class="${p}-grid">\n`;
      sec.items.forEach(item => {
        const id = `${p}-card-${cardIndex++}`;
        const term = item.term || 'Concepto';
        const def = item.def || item.text || '';
        html += `      <article class="${p}-card">\n`;
        html += `        <button type="button" class="${p}-copy-btn" data-target="${id}" title="Copiar definición" aria-label="Copiar definición de ${escapeHtml(term)}">\n`;
        html += `          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>\n`;
        html += `          Copiar\n`;
        html += `        </button>\n`;
        html += `        <h3 class="${p}-card-title">${escapeHtml(term)}</h3>\n`;
        html += `        <div id="${id}" class="${p}-card-body">${escapeHtml(def)}</div>\n`;
        html += `      </article>\n`;
      });
      html += `    </div>\n`;
    } else if (sec.type === 'rail' || sec.items.some(i => i.num)) {
      html += `    <div class="${p}-rail">\n`;
      sec.items.forEach(item => {
        html += `      <div class="${p}-step">\n`;
        html += `        <div class="${p}-step-node" aria-hidden="true">${escapeHtml(item.num || '•')}</div>\n`;
        html += `        <div class="${p}-step-content">\n`;
        if (item.title) {
          html += `          <h3 class="${p}-step-title">${escapeHtml(item.title)}</h3>\n`;
        }
        html += `          <p class="${p}-step-desc">${escapeHtml(item.desc || item.text || '')}</p>\n`;
        html += `        </div>\n`;
        html += `      </div>\n`;
      });
      html += `    </div>\n`;
    } else {
      // General section
      sec.items.forEach(item => {
        const text = item.text || '';
        if (text.toLowerCase().startsWith('nota:') || text.toLowerCase().startsWith('importante:')) {
          html += `    <div class="${p}-callout">\n`;
          html += `      <div class="${p}-callout-icon" aria-hidden="true">\n`;
          html += `        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>\n`;
          html += `      </div>\n`;
          html += `      <div>${escapeHtml(text)}</div>\n`;
          html += `    </div>\n`;
        } else {
          html += `    <p style="margin: 0.75rem 0; color: var(--color-ink-muted);">${escapeHtml(text)}</p>\n`;
        }
      });
    }

    html += `  </section>\n\n`;
  });

  // If we collected a template block
  if (Object.keys(templateMeta).length > 0 || templateBodyLines.length > 0) {
    const templateId = `${p}-template-msg`;
    html += `  <!-- Plantilla de Comunicación Reutilizable -->\n`;
    html += `  <section class="${p}-section">\n`;
    html += `    <div class="${p}-section-header">\n`;
    html += `      <span class="${p}-badge-icon" aria-hidden="true">\n`;
    html += `        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>\n`;
    html += `      </span>\n`;
    html += `      <h2 class="${p}-section-title">Plantilla de Notificación Oficial</h2>\n`;
    html += `    </div>\n`;
    html += `    <div class="${p}-template-box">\n`;
    html += `      <button type="button" class="${p}-copy-btn" data-target="${templateId}" title="Copiar plantilla completa">\n`;
    html += `        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>\n`;
    html += `        Copiar Mensaje\n`;
    html += `      </button>\n`;
    html += `      <div class="${p}-meta-bar">\n`;
    for (const [k, v] of Object.entries(templateMeta)) {
      html += `        <div class="${p}-meta-item"><strong>${escapeHtml(k)}:</strong> <span>${escapeHtml(v)}</span></div>\n`;
    }
    html += `      </div>\n`;
    html += `      <pre id="${templateId}" class="${p}-template-text">${escapeHtml(templateBodyLines.join('\n'))}</pre>\n`;
    html += `    </div>\n`;
    html += `  </section>\n\n`;
  }

  html += `</main>\n\n`;
  html += `<script>\n${generateMoodleJs(p)}\n</script>`;

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
