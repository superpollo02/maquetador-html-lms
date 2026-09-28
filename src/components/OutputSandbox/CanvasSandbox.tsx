'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ViewportMode } from '@/lib/types';
import {
  Monitor, Tablet, Smartphone, ExternalLink,
  Edit3, Check, Sparkles, Undo2, Redo2, Trash2, AlertTriangle, MousePointer2, X
} from 'lucide-react';

interface CanvasSandboxProps {
  htmlContent: string;
  viewport: ViewportMode;
  onChangeViewport: (vp: ViewportMode) => void;
  lmsTheme: 'boost-white' | 'slate-soft' | 'dark-sim';
  onChangeLmsTheme: (theme: 'boost-white' | 'slate-soft' | 'dark-sim') => void;
  onUpdateHtmlContent?: (updatedHtml: string) => void;
}

const HISTORY_LIMIT = 50;

// Selector CSS de "cajas" que el usuario puede querer eliminar
const CARD_SELECTOR = [
  '[class*="card"]',
  '[class*="item"]',
  '[class*="term"]',
  '[class*="bloque"]',
  '[class*="glossary"]',
  '[class*="glosario"]',
  '[class*="step"]',
  '[class*="paso"]',
  '[class*="phase"]',
  '[class*="fase"]',
  'article',
  'section',
  'li',
].join(', ');

/** Devuelve el texto visible de un elemento ignorando botones */
function visibleText(el: Element): string {
  const clone = el.cloneNode(true) as Element;
  clone.querySelectorAll('button, .copy-btn, [class*="btn"], [class*="button"]').forEach(b => b.remove());
  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export default function CanvasSandbox({
  htmlContent,
  viewport,
  onChangeViewport,
  lmsTheme,
  onChangeLmsTheme,
  onUpdateHtmlContent,
}: CanvasSandboxProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Modos de edición
  const [isEditing, setIsEditing] = useState(false);       // edición de texto
  const [isDeleting, setIsDeleting] = useState(false);     // modo seleccionar para borrar

  // Historial Deshacer / Rehacer
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isApplyingHistory = useRef(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'ok' | 'warn' | 'info' } | null>(null);

  const showStatus = (text: string, type: 'ok' | 'warn' | 'info' = 'ok') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  /** Registrar un nuevo snapshot en el historial */
  const pushHistory = useCallback((snapshot: string) => {
    if (isApplyingHistory.current) return;
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const next = [...trimmed, snapshot].slice(-HISTORY_LIMIT);
      setHistoryIndex(next.length - 1);
      return next;
    });
  }, [historyIndex]);

  /** Inicializar historial al montar */
  useEffect(() => {
    if (!htmlContent || isApplyingHistory.current) return;
    setHistory([htmlContent]);
    setHistoryIndex(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyHistorySnapshot = useCallback((snapshot: string) => {
    isApplyingHistory.current = true;
    onUpdateHtmlContent?.(snapshot);
    setTimeout(() => { isApplyingHistory.current = false; }, 80);
  }, [onUpdateHtmlContent]);

  const handleUndo = () => {
    if (!canUndo) return;
    const newIdx = historyIndex - 1;
    setHistoryIndex(newIdx);
    applyHistorySnapshot(history[newIdx]);
    showStatus('↩ Cambio deshecho.', 'info');
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const newIdx = historyIndex + 1;
    setHistoryIndex(newIdx);
    applyHistorySnapshot(history[newIdx]);
    showStatus('↪ Cambio rehecho.', 'info');
  };

  // ── syncBackHtml ────────────────────────────────────────────────────────
  const syncBackHtml = useCallback((recordHistory = false) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    const mainEl = doc.querySelector('main');
    if (!mainEl || !onUpdateHtmlContent) return;

    const clone = mainEl.cloneNode(true) as HTMLElement;
    clone.removeAttribute('contenteditable');
    clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    // Limpiar marcas temporales
    clone.querySelectorAll('.lms-delete-hover, .lms-delete-selected, .lms-delete-btn').forEach(el => el.remove());
    clone.querySelectorAll('[data-lms-deletable]').forEach(el => el.removeAttribute('data-lms-deletable'));

    const styleEl = doc.body.querySelector('style');
    const scriptEl = doc.body.querySelector('script');
    const styleHtml = styleEl ? styleEl.outerHTML : '';
    const scriptHtml = scriptEl ? scriptEl.outerHTML : '';

    const newBlock = styleHtml
      ? `${styleHtml}\n\n${clone.outerHTML}\n\n${scriptHtml}`.trim()
      : clone.outerHTML;

    onUpdateHtmlContent(newBlock);
    if (recordHistory) pushHistory(newBlock);
  }, [onUpdateHtmlContent, pushHistory]);

  // ── Escribir iframe ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isEditing || isDeleting) return;

    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@500;600;700&family=Open+Sans:wght@400;600&family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
          <style>
            body {
              margin: 0; padding: 16px;
              background-color: ${
                lmsTheme === 'boost-white' ? '#ffffff'
                : lmsTheme === 'dark-sim' ? '#0f172a'
                : '#f1f5f9'
              };
              transition: background-color 0.2s ease;
            }
            /* Modo edición de texto */
            body.lms-editing-mode main[contenteditable="true"] {
              outline: 2px dashed rgba(2,132,199,0.4); outline-offset: 6px; border-radius: 8px;
            }
            body.lms-editing-mode h1:hover, body.lms-editing-mode h2:hover,
            body.lms-editing-mode h3:hover, body.lms-editing-mode p:hover,
            body.lms-editing-mode pre:hover, body.lms-editing-mode article div:hover {
              outline: 1.5px dashed #0284c7; outline-offset: 3px;
              background-color: rgba(2,132,199,0.05); cursor: text;
            }
            /* Modo eliminación de cajas */
            body.lms-delete-mode [data-lms-deletable]:hover {
              outline: 2.5px dashed #ef4444 !important;
              outline-offset: 3px;
              background-color: rgba(239,68,68,0.07) !important;
              cursor: pointer !important;
              position: relative;
            }
            body.lms-delete-mode [data-lms-deletable]:hover::after {
              content: '✕ Clic para eliminar';
              position: absolute; top: 6px; right: 8px;
              font-size: 11px; font-weight: 700;
              color: #dc2626; font-family: sans-serif;
              background: rgba(255,255,255,0.92);
              padding: 2px 6px; border-radius: 4px;
              pointer-events: none; z-index: 999;
              border: 1px solid rgba(220,38,38,0.3);
            }
            body.lms-delete-mode { cursor: default; }
          </style>
        </head>
        <body>
          ${htmlContent || '<div style="padding:40px;text-align:center;color:#94a3b8;font-family:sans-serif;">Esperando generación del recurso...</div>'}
        </body>
      </html>
    `);
    doc.close();
  }, [htmlContent, lmsTheme, isEditing, isDeleting]);

  // ── Modo Edición de Texto ───────────────────────────────────────────────
  const handleToggleEdit = () => {
    if (isDeleting) stopDeleteMode();
    const nextEditing = !isEditing;
    setIsEditing(nextEditing);

    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    const mainEl = doc.querySelector('main');
    if (!mainEl) return;

    if (nextEditing) {
      mainEl.setAttribute('contenteditable', 'true');
      doc.body.classList.add('lms-editing-mode');
      doc.querySelectorAll('button').forEach(b => b.setAttribute('contenteditable', 'false'));
      let debounce: ReturnType<typeof setTimeout>;
      mainEl.oninput = () => {
        syncBackHtml(false);
        clearTimeout(debounce);
        debounce = setTimeout(() => syncBackHtml(true), 800);
      };
    } else {
      mainEl.removeAttribute('contenteditable');
      doc.body.classList.remove('lms-editing-mode');
      mainEl.oninput = null;
      syncBackHtml(true);
    }
  };

  // ── Modo Eliminar Cajas ─────────────────────────────────────────────────
  const stopDeleteMode = useCallback(() => {
    setIsDeleting(false);
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.body.classList.remove('lms-delete-mode');
    doc.querySelectorAll('[data-lms-deletable]').forEach(el => {
      (el as HTMLElement).onclick = null;
      el.removeAttribute('data-lms-deletable');
    });
  }, []);

  const handleToggleDeleteMode = () => {
    if (isEditing) handleToggleEdit(); // salir del modo texto primero

    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    if (isDeleting) {
      stopDeleteMode();
      return;
    }

    setIsDeleting(true);
    doc.body.classList.add('lms-delete-mode');

    // Marcar todos los elementos que son "cajas" eliminables
    const cards = doc.querySelectorAll(CARD_SELECTOR);
    let markedCount = 0;
    cards.forEach(card => {
      // No marcar elementos raíz o muy pequeños
      const parent = card.parentElement;
      if (!parent || card.tagName === 'MAIN' || card.tagName === 'BODY' || card.tagName === 'HTML') return;
      card.setAttribute('data-lms-deletable', 'true');
      markedCount++;

      (card as HTMLElement).onclick = (e: MouseEvent) => {
        e.stopPropagation();
        const target = card as HTMLElement;
        target.style.transition = 'opacity 0.2s, transform 0.2s';
        target.style.opacity = '0';
        target.style.transform = 'scale(0.95)';
        setTimeout(() => {
          target.remove();
          syncBackHtml(true);
          showStatus('✓ Caja eliminada. Usa "Deshacer" si fue un error.', 'ok');
        }, 200);
      };
    });

    if (markedCount === 0) {
      showStatus('No se encontraron cajas eliminables en este diseño.', 'warn');
      stopDeleteMode();
    }
  };

  // ── Limpiar Vacíos automáticamente ─────────────────────────────────────
  const handleCleanupEmpty = () => {
    if (isDeleting) stopDeleteMode();
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    let removed = 0;

    // Tarjetas/ítems que no tienen texto visible real (ignorando botones)
    doc.querySelectorAll(CARD_SELECTOR).forEach(card => {
      if (card.tagName === 'MAIN' || card.tagName === 'BODY' || card.tagName === 'HTML') return;
      const text = visibleText(card);
      const isGeneric = /^(Concepto|Término|Definición|Term|Definition|N\/A|—|-|Copiar)$/i.test(text);
      if (text.length < 6 || isGeneric) {
        (card as HTMLElement).remove();
        removed++;
      }
    });

    // Párrafos vacíos
    doc.querySelectorAll('p').forEach(p => {
      if ((p.textContent ?? '').trim().length === 0) { p.remove(); removed++; }
    });

    if (removed > 0) {
      showStatus(`✓ ${removed} elemento${removed > 1 ? 's' : ''} vacío${removed > 1 ? 's' : ''} eliminado${removed > 1 ? 's' : ''}. Usa "Deshacer" si fue un error.`, 'ok');
    } else {
      showStatus('No se encontraron elementos vacíos.', 'info');
    }

    syncBackHtml(true);
  };

  // ── Viewport ────────────────────────────────────────────────────────────
  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  const handleOpenInNewTab = () => {
    const w = window.open();
    if (w) { w.document.write(htmlContent); w.document.close(); }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-900/5 rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-inner">

      {/* ── Barra de controles ── */}
      <div className="bg-white px-3 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">

        {/* Izquierda: Viewport */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 hidden md:inline">Vista previa:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {(['desktop', 'tablet', 'mobile'] as ViewportMode[]).map(vp => (
              <button key={vp} onClick={() => onChangeViewport(vp)}
                className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition ${
                  viewport === vp ? 'bg-white text-sky-600 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title={vp === 'desktop' ? 'Desktop (100%)' : vp === 'tablet' ? 'Tablet (768px)' : 'Móvil (375px)'}
              >
                {vp === 'desktop' ? <Monitor className="w-3.5 h-3.5" /> : vp === 'tablet' ? <Tablet className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline text-[11px] capitalize">{vp === 'desktop' ? 'Desktop' : vp === 'tablet' ? 'Tablet' : 'Móvil'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Derecha: Herramientas de edición */}
        <div className="flex items-center gap-1.5 flex-wrap">

          {/* Deshacer / Rehacer */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 gap-px">
            <button onClick={handleUndo} disabled={!canUndo}
              title={canUndo ? `Deshacer (paso ${historyIndex} de ${history.length - 1})` : 'Sin cambios para deshacer'}
              className="p-1.5 rounded-md flex items-center gap-1 text-xs transition disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 hover:text-indigo-600 hover:bg-white"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Deshacer</span>
            </button>
            <div className="w-px h-4 bg-slate-300" />
            <button onClick={handleRedo} disabled={!canRedo}
              title={canRedo ? `Rehacer` : 'Sin cambios para rehacer'}
              className="p-1.5 rounded-md flex items-center gap-1 text-xs transition disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 hover:text-indigo-600 hover:bg-white"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Rehacer</span>
            </button>
          </div>

          {/* Limpiar vacíos automático */}
          <button onClick={handleCleanupEmpty} disabled={!htmlContent}
            title="Eliminar automáticamente cajas sin contenido real"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpiar Vacíos</span>
          </button>

          {/* Modo seleccionar y eliminar caja */}
          <button onClick={handleToggleDeleteMode} disabled={!htmlContent}
            title="Activar modo de selección: haz clic sobre cualquier caja para eliminarla"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border disabled:opacity-40 ${
              isDeleting
                ? 'bg-red-600 text-white border-red-600 ring-2 ring-red-400/30 animate-pulse'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
            }`}
          >
            {isDeleting ? <X className="w-3.5 h-3.5" /> : <MousePointer2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isDeleting ? 'Salir modo borrar' : 'Borrar caja'}</span>
          </button>

          {/* Editar texto en vivo */}
          <button onClick={handleToggleEdit} disabled={!htmlContent}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isEditing
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20 animate-pulse'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            {isEditing
              ? <><Check className="w-3.5 h-3.5" /><span>Finalizar</span></>
              : <><Edit3 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Editar Texto</span></>}
          </button>

          {/* Fondo LMS */}
          <select value={lmsTheme} onChange={e => onChangeLmsTheme(e.target.value as any)}
            className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700"
          >
            <option value="boost-white">Boost (blanco)</option>
            <option value="slate-soft">Gris Institucional</option>
            <option value="dark-sim">Modo Oscuro</option>
          </select>

          {/* Nueva pestaña */}
          <button onClick={handleOpenInNewTab}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-sky-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition"
            title="Abrir en nueva pestaña"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Barra de estado modo edición de texto ── */}
      {isEditing && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-3.5 h-3.5 text-emerald-200 flex-shrink-0" />
            <span><strong>Modo Texto:</strong> Haz clic en cualquier texto para editarlo directamente.</span>
          </div>
          <button onClick={handleToggleEdit}
            className="bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded text-[11px] font-semibold ml-3">
            Listo ✓
          </button>
        </div>
      )}

      {/* ── Barra de estado modo borrar caja ── */}
      {isDeleting && (
        <div className="bg-red-600 text-white text-xs px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MousePointer2 className="w-3.5 h-3.5 text-red-200 flex-shrink-0" />
            <span><strong>Modo Borrar Caja:</strong> Pasa el cursor sobre cualquier caja y haz clic para eliminarla. El cambio se puede deshacer.</span>
          </div>
          <button onClick={stopDeleteMode}
            className="bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded text-[11px] font-semibold ml-3">
            <X className="w-3 h-3 inline mr-1" />Salir
          </button>
        </div>
      )}

      {/* ── Barra de notificaciones ── */}
      {statusMsg && (
        <div className={`text-xs px-4 py-2 flex items-center gap-2 font-medium ${
          statusMsg.type === 'ok' ? 'bg-teal-600 text-white'
          : statusMsg.type === 'warn' ? 'bg-amber-500 text-white'
          : 'bg-slate-700 text-white'
        }`}>
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* ── Iframe Container ── */}
      <div className="p-4 flex justify-center items-start min-h-[500px] overflow-auto bg-slate-200/50">
        <div style={{ width: getViewportWidth() }}
          className="transition-all duration-300 rounded-xl overflow-hidden shadow-md border border-slate-300 bg-white"
        >
          <iframe
            ref={iframeRef}
            title="LMS Live Preview"
            className="w-full h-[650px] border-0"
            allow="clipboard-write; clipboard-read"
            sandbox="allow-scripts allow-same-origin allow-modals"
          />
        </div>
      </div>
    </div>
  );
}
