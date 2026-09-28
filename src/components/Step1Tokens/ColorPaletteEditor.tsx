'use client';

import React from 'react';
import { DesignTokens } from '@/lib/types';
import { checkContrast, getContrastRatio } from '@/lib/wcag';
import { Sliders, CheckCircle, AlertTriangle, Wand2, Info } from 'lucide-react';

interface ColorPaletteEditorProps {
  tokens: DesignTokens;
  onChangeTokens: (updated: Partial<DesignTokens>) => void;
}

export default function ColorPaletteEditor({
  tokens,
  onChangeTokens,
}: ColorPaletteEditorProps) {
  // WCAG evaluations
  const contrastBody = checkContrast(tokens.inkPrimary, tokens.surface);
  const contrastAccent = checkContrast(tokens.accentPrimary, tokens.surface);

  const handleAutoFixContrast = () => {
    const isLight = getContrastRatio(tokens.surface, '#000000') > getContrastRatio(tokens.surface, '#ffffff');
    onChangeTokens({
      inkPrimary: isLight ? '#0f172a' : '#f8fafc',
      inkMuted: isLight ? '#475569' : '#cbd5e1',
    });
  };

  const colorFields: {
    key: keyof DesignTokens;
    label: string;
    desc: string;
    value: string;
  }[] = [
    { key: 'bg', label: 'Fondo LMS (--color-bg)', desc: 'Fondo contenedor externo', value: tokens.bg },
    { key: 'surface', label: 'Superficie (--color-surface)', desc: 'Tarjetas y paneles', value: tokens.surface },
    { key: 'surfaceSubtle', label: 'Superficie Sutil (--color-surface-subtle)', desc: 'Insignias y cajas secundarias', value: tokens.surfaceSubtle },
    { key: 'inkPrimary', label: 'Tinta Primaria (--color-ink-primary)', desc: 'Texto principal y títulos', value: tokens.inkPrimary },
    { key: 'inkMuted', label: 'Tinta Atenuada (--color-ink-muted)', desc: 'Párrafos y metadatos', value: tokens.inkMuted },
    { key: 'accentPrimary', label: 'Acento Primario (--color-accent-primary)', desc: 'Nodos, botones y bordes', value: tokens.accentPrimary },
    { key: 'accentSecondary', label: 'Acento Secundario (--color-accent-secondary)', desc: 'Detalles y conectores', value: tokens.accentSecondary },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ajuste Fino de Estilos y Auditoría WCAG 2.1</h3>
            <p className="text-xs text-slate-500">Valores hexadecimales y control de contraste para garantizar lectura cómoda</p>
          </div>
        </div>

        {/* Live WCAG Badges & Auto-fix */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {!contrastBody.passesAA && (
            <button
              type="button"
              onClick={handleAutoFixContrast}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
              title="Ajusta automáticamente el texto a un color oscuro/claro de alto contraste"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-calibrar Contraste Accesible</span>
            </button>
          )}

          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium border ${
              contrastBody.passesAA
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
            title="Relación de contraste entre el texto principal y el fondo de las tarjetas según el estándar WCAG 2.1"
          >
            {contrastBody.passesAA ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>
              Contraste de Texto: {contrastBody.ratio}:1 ({contrastBody.passesAAA ? 'AAA Óptimo' : contrastBody.passesAA ? 'AA Accesible' : 'Bajo Contraste'})
            </span>
          </div>

          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium border ${
              contrastAccent.passesAALarge
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <span>Acento: {contrastAccent.ratio}:1</span>
          </div>
        </div>
      </div>

      {!contrastBody.passesAA && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Aviso de Accesibilidad Pedagógica (WCAG 2.1)</p>
            <p className="text-amber-800 leading-relaxed">
              El color asignado al texto ({tokens.inkPrimary}) tiene un tono muy similar al fondo ({tokens.surface}), lo que dificulta la lectura para los estudiantes (ratio actual {contrastBody.ratio}:1, mínimo recomendado 4.5:1). Pulsa el botón <strong>"Auto-calibrar Contraste Accesible"</strong> o elige un color más oscuro para la Tinta Primaria.
            </p>
          </div>
        </div>
      )}

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {colorFields.map(field => (
          <div
            key={field.key}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition"
          >
            <div className="flex-1 pr-2">
              <label className="text-xs font-semibold text-slate-800 block truncate">
                {field.label}
              </label>
              <span className="text-[11px] text-slate-400 block truncate">{field.desc}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={field.value}
                onChange={e => onChangeTokens({ [field.key]: e.target.value })}
                className="w-20 text-xs font-mono px-2 py-1 rounded border border-slate-300 uppercase text-center focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <input
                type="color"
                value={field.value}
                onChange={e => onChangeTokens({ [field.key]: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
