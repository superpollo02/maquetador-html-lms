'use client';

import React from 'react';
import { PRESET_THEMES, PresetTheme } from '@/lib/presets';
import { DesignTokens } from '@/lib/types';
import { Palette, CheckCircle2 } from 'lucide-react';

interface PresetSelectorProps {
  currentTokens: DesignTokens;
  onSelectPreset: (preset: PresetTheme) => void;
}

export default function PresetSelector({
  currentTokens,
  onSelectPreset,
}: PresetSelectorProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Biblioteca de Presets Moodle-Ready</h3>
            <p className="text-xs text-slate-500">Selecciona un sistema de diseño institucional preconfigurado</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRESET_THEMES.map(theme => {
          const isSelected = currentTokens.name === theme.name;
          const { tokens } = theme;

          return (
            <div
              key={theme.id}
              onClick={() => onSelectPreset(theme)}
              className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/40 ring-2 ring-sky-500/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                    {theme.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition">
                    {theme.name}
                  </h4>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                )}
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                {theme.description}
              </p>

              {/* Color Swatch Bar */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100/80 border border-slate-200/60">
                <div
                  className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                  style={{ backgroundColor: tokens.bg }}
                  title={`Fondo: ${tokens.bg}`}
                />
                <div
                  className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                  style={{ backgroundColor: tokens.surface }}
                  title={`Superficie: ${tokens.surface}`}
                />
                <div
                  className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                  style={{ backgroundColor: tokens.inkPrimary }}
                  title={`Tinta Primaria: ${tokens.inkPrimary}`}
                />
                <div
                  className="w-5 h-5 rounded-md border border-black/10 shadow-xs flex-1"
                  style={{ backgroundColor: tokens.accentPrimary }}
                  title={`Acento Primario: ${tokens.accentPrimary}`}
                />
                <div
                  className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                  style={{ backgroundColor: tokens.accentSecondary }}
                  title={`Acento Secundario: ${tokens.accentSecondary}`}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>{tokens.fontTitle} + {tokens.fontBody}</span>
                <span className="capitalize">{tokens.characteristicElement}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
