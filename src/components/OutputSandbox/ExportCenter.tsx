'use client';

import React, { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';

interface ExportCenterProps {
  htmlBlock: string;
  fullHtml: string;
  cssOnly: string;
}

export default function ExportCenter({
  htmlBlock,
  fullHtml,
  cssOnly,
}: ExportCenterProps) {
  const [copiedMoodle, setCopiedMoodle] = useState(false);

  const handleCopyMoodle = () => {
    if (!htmlBlock) return;
    navigator.clipboard.writeText(htmlBlock).then(() => {
      setCopiedMoodle(true);
      setTimeout(() => setCopiedMoodle(false), 2200);
    });
  };

  const handleDownloadHtml = () => {
    if (!fullHtml) return;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recurso-editorial-moodle.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Centro de Exportación e Integración Moodle</h3>
          <p className="text-xs text-slate-500">Elige la modalidad de publicación según la configuración de tu aula virtual</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option A: Recurso Archivo (Download) */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800">Opción A: Recurso "Archivo"</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                100% Recomendada
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Descarga el archivo <code className="bg-slate-200/60 px-1 py-0.5 rounded text-[11px]">.html</code> autónomo y súbelo a Moodle seleccionando la modalidad "Incrustar" o "En ventana emergente". Mantiene íntegra la interactividad y fuentes sin filtros de servidor.
            </p>
          </div>

          <button
            onClick={handleDownloadHtml}
            disabled={!fullHtml}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 shadow-xs disabled:opacity-50 transition"
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span>Descargar Archivo .html Standalone</span>
          </button>
        </div>

        {/* Option B: Direct Moodle Block Copy */}
        <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800">Opción B: Editor de "Página" o "Área de texto"</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                Incrustación Directa
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Copia el bloque modular (<code className="bg-sky-100/70 px-1 py-0.5 rounded text-[11px]">&lt;style&gt; + &lt;main&gt; + &lt;script&gt;</code>) y pégalo directamente en la vista de código HTML de TinyMCE o Atto en Moodle.
            </p>
          </div>

          <button
            onClick={handleCopyMoodle}
            disabled={!htmlBlock}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-sm disabled:opacity-50 transition"
          >
            {copiedMoodle ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Copiado para Moodle!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Bloque Moodle</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
