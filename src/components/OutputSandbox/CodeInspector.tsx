'use client';

import React, { useState } from 'react';
import { Copy, Check, Code, FileCode, Layers } from 'lucide-react';

interface CodeInspectorProps {
  htmlBlock: string;
  fullHtml: string;
  cssOnly: string;
}

export default function CodeInspector({
  htmlBlock,
  fullHtml,
  cssOnly,
}: CodeInspectorProps) {
  const [activeTab, setActiveTab] = useState<'block' | 'full' | 'css'>('block');
  const [isCopied, setIsCopied] = useState(false);

  const getActiveCode = () => {
    switch (activeTab) {
      case 'block':
        return htmlBlock;
      case 'full':
        return fullHtml;
      case 'css':
        return cssOnly;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    const code = getActiveCode();
    if (!code) return;

    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
      {/* Tab bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('block')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeTab === 'block'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Bloque Moodle (Incrustable)</span>
          </button>

          <button
            onClick={() => setActiveTab('full')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeTab === 'full'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>HTML Completo Standalone</span>
          </button>

          <button
            onClick={() => setActiveTab('css')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeTab === 'css'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Solo CSS Modular</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">¡Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Pestaña</span>
            </>
          )}
        </button>
      </div>

      {/* Code Viewer Body */}
      <div className="p-4 max-h-[420px] overflow-auto font-mono text-xs text-sky-200/90 leading-relaxed bg-slate-900/90">
        <pre className="whitespace-pre-wrap break-all">
          <code>{getActiveCode() || 'Genera el recurso para inspeccionar el código HTML y CSS generado.'}</code>
        </pre>
      </div>
    </div>
  );
}
