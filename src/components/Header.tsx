'use client';

import React from 'react';
import { Settings, Sparkles, Layers, BookOpen, RotateCcw } from 'lucide-react';
import { ApiSettings } from '@/lib/types';

interface HeaderProps {
  currentStep: 1 | 2;
  setCurrentStep: (step: 1 | 2) => void;
  onOpenSettings: () => void;
  onResetAll: () => void;
  apiSettings: ApiSettings;
}

export default function Header({
  currentStep,
  setCurrentStep,
  onOpenSettings,
  onResetAll,
  apiSettings,
}: HeaderProps) {
  const getActiveBadge = () => {
    if (apiSettings.activeTextProvider === 'gemini' && apiSettings.geminiKey) {
      return { label: 'Gemini AI', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (apiSettings.activeTextProvider === 'groq' && apiSettings.groqKey) {
      return { label: 'Groq Cloud', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    }
    if (apiSettings.activeTextProvider === 'nvidia' && apiSettings.nvidiaKey) {
      return { label: 'Nvidia NIM', color: 'bg-green-50 text-green-700 border-green-200' };
    }
    return { label: 'Motor Local Offline', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  const badge = getActiveBadge();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">Editorial LMS</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                Moodle Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Maquetador Automático de Recursos HTML Accesibles</p>
          </div>
        </div>

        {/* Step Navigation Pill */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentStep === 1
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Sistema de Diseño (Estilos y Paleta)</span>
          </button>
          <button
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentStep === 2
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>2. Ingesta y Maquetación</span>
          </button>
        </div>

        {/* Actions & Settings */}
        <div className="flex items-center gap-2.5">
          {/* Reset / New Project Button */}
          <button
            onClick={onResetAll}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-lg transition"
            title="Borrar y empezar de nuevo con un recurso limpio"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Empezar de nuevo</span>
          </button>

          <div
            onClick={onOpenSettings}
            className={`hidden lg:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border cursor-pointer hover:opacity-80 transition ${badge.color}`}
            title="Haz clic para configurar tus APIs de IA"
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            <span>{badge.label}</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg transition"
            aria-label="Configurar claves de API"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Ajustes de API</span>
          </button>
        </div>
      </div>
    </header>
  );
}
