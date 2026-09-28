'use client';

import React, { useState } from 'react';
import { X, Key, Cpu, Eye, Check, ShieldCheck, ExternalLink, SlidersHorizontal, Sparkles } from 'lucide-react';
import { ApiSettings } from '@/lib/types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ApiSettings;
  onSave: (newSettings: ApiSettings) => void;
}

export default function ApiKeyModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: ApiKeyModalProps) {
  const [formData, setFormData] = useState<ApiSettings>(settings);
  const [showAdvancedModels, setShowAdvancedModels] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized: ApiSettings = {
      ...formData,
      geminiKey: formData.geminiKey.trim(),
      groqKey: formData.groqKey.trim(),
      nvidiaKey: formData.nvidiaKey.trim(),
      groqModel: formData.groqModel.trim() || 'llama-3.3-70b-versatile',
      groqVisionModel:
        formData.groqVisionModel.includes('gpt-') || !formData.groqVisionModel.trim()
          ? 'llama-3.2-11b-vision-preview'
          : formData.groqVisionModel.trim(),
      nvidiaModel:
        formData.nvidiaModel.includes('3.3') || !formData.nvidiaModel.trim()
          ? 'meta/llama-3.1-70b-instruct'
          : formData.nvidiaModel.trim(),
      nvidiaVisionModel:
        formData.nvidiaVisionModel.includes('90b') || !formData.nvidiaVisionModel.trim()
          ? 'meta/llama-3.2-11b-vision-instruct'
          : formData.nvidiaVisionModel.trim(),
      geminiModel: formData.geminiModel.trim() || 'gemini-1.5-flash',
    };

    onSave(sanitized);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Gestor de APIs y Modelos de IA</h2>
              <p className="text-xs text-slate-500">Configura tus claves y selecciona los modelos de Groq, Nvidia NIM o Gemini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6">
          {/* Preset Recomendado: Gemini Vision + Motor Local Offline */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900">Configuración Recomendada (1 Clic)</p>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Extracción visual con <strong>Google Gemini</strong> + Maquetación pedagógica con <strong>Motor Local Offline</strong> (0 consumo de cuotas, alta velocidad y 100% fiabilidad).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  activeVisionProvider: 'gemini',
                  activeTextProvider: 'offline',
                  geminiModel: 'gemini-3.8-flash',
                }));
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap shadow-xs transition self-start sm:self-center"
            >
              Aplicar Modo
            </button>
          </div>

          <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-sky-900">
            <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Seguridad y Privacidad Local</p>
              <p className="text-sky-800 leading-relaxed">
                Tus claves se guardan exclusivamente en el almacenamiento local de tu navegador (<code className="bg-sky-100 px-1 py-0.5 rounded">localStorage</code>) y solo se transmiten directamente al llamar a cada proveedor. Si no tienes claves, la WebApp continuará funcionando con el motor local offline.
              </p>
            </div>
          </div>

          {/* Section: API Keys */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Claves de Acceso (API Keys)
            </h3>

            {/* Google Gemini */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-800">Google Gemini API Key</label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-sky-600 hover:underline flex items-center gap-0.5"
                >
                  Obtener gratis en Google AI Studio <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={formData.geminiKey}
                onChange={e => setFormData({ ...formData, geminiKey: e.target.value })}
                className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {formData.geminiKey && !formData.geminiKey.trim().startsWith('AIza') && (
                <p className="text-[11px] text-amber-600 mt-1 font-medium">
                  ⚠️ Las claves de Google AI Studio suelen comenzar con &quot;AIza&quot;. Verifica que no hayas pegado la clave de otro proveedor.
                </p>
              )}
            </div>

            {/* Groq Cloud */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-800">Groq Cloud API Key</label>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-orange-600 hover:underline flex items-center gap-0.5"
                >
                  Obtener gratis en Groq Console <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                placeholder="gsk_..."
                value={formData.groqKey}
                onChange={e => setFormData({ ...formData, groqKey: e.target.value })}
                className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {formData.groqKey && !formData.groqKey.trim().startsWith('gsk_') && (
                <p className="text-[11px] text-amber-600 mt-1 font-medium">
                  ⚠️ Las claves de Groq deben comenzar con &quot;gsk_&quot;. Verifica que sea la clave correcta.
                </p>
              )}
            </div>

            {/* Nvidia NIM */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-800">Nvidia NIM API Key</label>
                <a
                  href="https://build.nvidia.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-green-700 hover:underline flex items-center gap-0.5"
                >
                  Obtener gratis en Nvidia Build <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                placeholder="nvapi-..."
                value={formData.nvidiaKey}
                onChange={e => setFormData({ ...formData, nvidiaKey: e.target.value })}
                className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {formData.nvidiaKey && !formData.nvidiaKey.trim().startsWith('nvapi-') && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  ⚠️ La clave de Nvidia NIM DEBE comenzar con &quot;nvapi-&quot;. Si pegaste una clave de Groq (gsk_...) o de OpenAI (sk-...), provocará el error &quot;401 Unauthorized&quot;.
                </p>
              )}
            </div>
          </div>

          {/* Section: Active Providers */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Proveedor Activo
            </h3>

            {/* Vision Task */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1">
                  <Eye className="w-3.5 h-3.5 text-sky-600" /> Tarea de Visión (Paso 1)
                </label>
                <select
                  value={formData.activeVisionProvider}
                  onChange={e => setFormData({ ...formData, activeVisionProvider: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="gemini">Google Gemini Vision</option>
                  <option value="groq">Groq Vision</option>
                  <option value="nvidia">Nvidia NIM Vision</option>
                </select>
              </div>

              {/* Text Task */}
              <div>
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 mb-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" /> Maquetación de Texto (Paso 2)
                </label>
                <select
                  value={formData.activeTextProvider}
                  onChange={e => setFormData({ ...formData, activeTextProvider: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="offline">Motor Local Offline (Sin consumo de API)</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="groq">Groq Cloud</option>
                  <option value="nvidia">Nvidia NIM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Model Selection Toggle */}
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAdvancedModels(!showAdvancedModels)}
              className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvancedModels ? 'Ocultar selección de modelos específicos' : 'Personalizar modelos específicos (Nvidia / Groq / Gemini)'}</span>
            </button>

            {showAdvancedModels && (
              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 text-xs">
                {/* Nvidia NIM Text Model */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Modelo de Texto de Nvidia NIM:
                  </label>
                  <input
                    type="text"
                    value={formData.nvidiaModel}
                    onChange={e => setFormData({ ...formData, nvidiaModel: e.target.value })}
                    placeholder="meta/llama-3.1-70b-instruct"
                    className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span
                      onClick={() => setFormData({ ...formData, nvidiaModel: 'meta/llama-3.1-70b-instruct' })}
                      className="cursor-pointer text-[10px] bg-slate-200 hover:bg-sky-100 hover:text-sky-700 px-2 py-0.5 rounded font-mono transition"
                    >
                      meta/llama-3.1-70b-instruct
                    </span>
                    <span
                      onClick={() => setFormData({ ...formData, nvidiaModel: 'nvidia/llama-3.1-nemotron-70b-instruct' })}
                      className="cursor-pointer text-[10px] bg-slate-200 hover:bg-sky-100 hover:text-sky-700 px-2 py-0.5 rounded font-mono transition"
                    >
                      nvidia/llama-3.1-nemotron-70b-instruct
                    </span>
                    <span
                      onClick={() => setFormData({ ...formData, nvidiaModel: 'mistralai/mistral-large-2-instruct' })}
                      className="cursor-pointer text-[10px] bg-slate-200 hover:bg-sky-100 hover:text-sky-700 px-2 py-0.5 rounded font-mono transition"
                    >
                      mistralai/mistral-large-2-instruct
                    </span>
                  </div>
                </div>

                {/* Nvidia NIM Vision Model */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Modelo de Visión de Nvidia NIM:
                  </label>
                  <input
                    type="text"
                    value={formData.nvidiaVisionModel}
                    onChange={e => setFormData({ ...formData, nvidiaVisionModel: e.target.value })}
                    placeholder="meta/llama-3.2-11b-vision-instruct"
                    className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span
                      onClick={() => setFormData({ ...formData, nvidiaVisionModel: 'meta/llama-3.2-11b-vision-instruct' })}
                      className="cursor-pointer text-[10px] bg-slate-200 hover:bg-sky-100 hover:text-sky-700 px-2 py-0.5 rounded font-mono transition"
                    >
                      meta/llama-3.2-11b-vision-instruct
                    </span>
                    <span
                      onClick={() => setFormData({ ...formData, nvidiaVisionModel: 'meta/llama-3.2-90b-vision-instruct' })}
                      className="cursor-pointer text-[10px] bg-slate-200 hover:bg-sky-100 hover:text-sky-700 px-2 py-0.5 rounded font-mono transition"
                    >
                      meta/llama-3.2-90b-vision-instruct
                    </span>
                  </div>
                </div>

                {/* Groq Models */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Modelo Texto Groq:
                      </label>
                      <input
                        type="text"
                        value={formData.groqModel}
                        onChange={e => setFormData({ ...formData, groqModel: e.target.value })}
                        className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span
                          onClick={() => setFormData({ ...formData, groqModel: 'llama-3.3-70b-versatile' })}
                          className="cursor-pointer text-[10px] bg-slate-200 hover:bg-orange-100 hover:text-orange-700 px-2 py-0.5 rounded font-mono transition"
                        >
                          llama-3.3-70b-versatile
                        </span>
                        <span
                          onClick={() => setFormData({ ...formData, groqModel: 'llama-3.1-8b-instant' })}
                          className="cursor-pointer text-[10px] bg-slate-200 hover:bg-orange-100 hover:text-orange-700 px-2 py-0.5 rounded font-mono transition"
                        >
                          llama-3.1-8b-instant
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Modelo Visión Groq:
                      </label>
                      <input
                        type="text"
                        value={formData.groqVisionModel}
                        onChange={e => setFormData({ ...formData, groqVisionModel: e.target.value })}
                        className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span
                          onClick={() => setFormData({ ...formData, groqVisionModel: 'llama-3.2-11b-vision-preview' })}
                          className="cursor-pointer text-[10px] bg-slate-200 hover:bg-orange-100 hover:text-orange-700 px-2 py-0.5 rounded font-mono transition"
                        >
                          llama-3.2-11b-vision-preview
                        </span>
                        <span
                          onClick={() => setFormData({ ...formData, groqVisionModel: 'llama-3.2-90b-vision-preview' })}
                          className="cursor-pointer text-[10px] bg-slate-200 hover:bg-orange-100 hover:text-orange-700 px-2 py-0.5 rounded font-mono transition"
                        >
                          llama-3.2-90b-vision-preview
                        </span>
                      </div>
                      {formData.groqVisionModel.includes('gpt-') && (
                        <p className="text-[11px] text-red-600 mt-1 font-semibold">
                          ❌ &quot;gpt-4o-vision&quot; es de OpenAI, no de Groq. Haz clic arriba en &quot;llama-3.2-11b-vision-preview&quot;.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gemini Model */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Modelo Gemini (Texto y Visión):
                  </label>
                  <input
                    type="text"
                    value={formData.geminiModel}
                    onChange={e => setFormData({ ...formData, geminiModel: e.target.value })}
                    className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span
                      onClick={() => setFormData({ ...formData, geminiModel: 'gemini-3.8-flash' })}
                      className="cursor-pointer text-[10px] bg-sky-100 text-sky-700 border border-sky-300 hover:bg-sky-200 px-2 py-0.5 rounded font-mono font-semibold transition"
                      title="Modelo más reciente y recomendado (septiembre 2026)"
                    >
                      ★ gemini-3.8-flash
                    </span>
                    <span
                      onClick={() => setFormData({ ...formData, geminiModel: 'gemini-3.7-flash' })}
                      className="cursor-pointer text-[10px] bg-slate-200 hover:bg-sky-100 hover:text-sky-700 px-2 py-0.5 rounded font-mono transition"
                    >
                      gemini-3.7-flash
                    </span>
                    <span
                      onClick={() => setFormData({ ...formData, geminiModel: 'gemini-3.5-flash-lite' })}
                      className="cursor-pointer text-[10px] bg-slate-200 hover:bg-sky-100 hover:text-sky-700 px-2 py-0.5 rounded font-mono transition"
                    >
                      gemini-3.5-flash-lite
                    </span>
                  </div>
                  {(formData.geminiModel === 'gemini-1.5-flash' || formData.geminiModel === 'gemini-2.5-flash') && (
                    <p className="text-[11px] text-amber-600 mt-1 font-semibold">
                      ⚠️ Este modelo fue descontinuado en 2026. Haz clic en <strong>★ gemini-3.8-flash</strong> para usar el modelo activo.
                    </p>
                  )}
                </div>

                {/* Reset defaults button */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        nvidiaModel: 'meta/llama-3.1-70b-instruct',
                        nvidiaVisionModel: 'meta/llama-3.2-11b-vision-instruct',
                        groqModel: 'llama-3.3-70b-versatile',
                        groqVisionModel: 'llama-3.2-11b-vision-preview',
                        geminiModel: 'gemini-3.8-flash',
                      }));
                    }}
                    className="text-[11px] text-sky-700 hover:underline font-semibold"
                  >
                    Restablecer modelos oficiales recomendados
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm transition"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Guardado
                </>
              ) : (
                'Guardar Configuración'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
