'use client';

import React from 'react';
import { DesignTokens, CharacteristicElement } from '@/lib/types';
import { Type, Shapes, Sparkles } from 'lucide-react';

interface TypographyShapePickerProps {
  tokens: DesignTokens;
  onChangeTokens: (updated: Partial<DesignTokens>) => void;
}

const TITLE_FONTS = [
  'Outfit',
  'Montserrat',
  'Space Grotesk',
  'Cinzel',
  'Syne',
  'Plus Jakarta Sans',
  'Inter',
  'Lora',
];

const BODY_FONTS = [
  'Plus Jakarta Sans',
  'Inter',
  'Open Sans',
  'Lora',
  'Roboto',
  'Outfit',
];

export default function TypographyShapePicker({
  tokens,
  onChangeTokens,
}: TypographyShapePickerProps) {
  const characteristicElements: { id: CharacteristicElement; label: string; desc: string }[] = [
    { id: 'orbital', label: 'Bordes Orbitales', desc: 'Tarjetas con anillo visual y halos concéntricos' },
    { id: 'rail', label: 'Riel Secuencial', desc: 'Nodos numerados y conectores de flujo vertical' },
    { id: 'pill', label: 'Pastillas Semánticas', desc: 'Insignias redondeadas y micropíldoras de estado' },
    { id: 'sidebar', label: 'Acento Lateral', desc: 'Borde vertical pronunciado de alta jerarquía' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
          <Type className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Tipografía, Radios y Elemento Característico</h3>
          <p className="text-xs text-slate-500">Pares tipográficos oficiales y ancla visual de identidad pedagógica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Typography Pair */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" /> Pares de Google Fonts
          </h4>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Fuente de Títulos (--font-title)
            </label>
            <select
              value={tokens.fontTitle}
              onChange={e => onChangeTokens({ fontTitle: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {TITLE_FONTS.map(f => (
                <option key={f} value={f}>
                  {f} (Display/Geométrica)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Fuente de Lectura (--font-body)
            </label>
            <select
              value={tokens.fontBody}
              onChange={e => onChangeTokens({ fontBody: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {BODY_FONTS.map(f => (
                <option key={f} value={f}>
                  {f} (Alta Legibilidad)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Curvature Radii */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Shapes className="w-3.5 h-3.5" /> Escala de Radios (border-radius)
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Pequeño (--radius-sm)</span>
              <input
                type="text"
                value={tokens.radiusSm}
                onChange={e => onChangeTokens({ radiusSm: e.target.value })}
                className="w-16 text-center font-mono text-xs px-2 py-1 rounded border border-slate-300"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Medio (--radius-md)</span>
              <input
                type="text"
                value={tokens.radiusMd}
                onChange={e => onChangeTokens({ radiusMd: e.target.value })}
                className="w-16 text-center font-mono text-xs px-2 py-1 rounded border border-slate-300"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Grande (--radius-lg)</span>
              <input
                type="text"
                value={tokens.radiusLg}
                onChange={e => onChangeTokens({ radiusLg: e.target.value })}
                className="w-16 text-center font-mono text-xs px-2 py-1 rounded border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Characteristic Element */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Elemento Característico
          </h4>

          <div className="space-y-2">
            {characteristicElements.map(elem => (
              <label
                key={elem.id}
                onClick={() => onChangeTokens({ characteristicElement: elem.id })}
                className={`flex items-start gap-2.5 p-2 rounded-xl border cursor-pointer transition text-left ${
                  tokens.characteristicElement === elem.id
                    ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="characteristicElement"
                  checked={tokens.characteristicElement === elem.id}
                  onChange={() => {}}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {elem.label}
                  </span>
                  <span className="text-[11px] text-slate-400 block leading-tight">
                    {elem.desc}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
