'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ApiKeyModal from '@/components/ApiKeyModal';
import PresetSelector from '@/components/Step1Tokens/PresetSelector';
import ImageExtractor from '@/components/Step1Tokens/ImageExtractor';
import ColorPaletteEditor from '@/components/Step1Tokens/ColorPaletteEditor';
import TypographyShapePicker from '@/components/Step1Tokens/TypographyShapePicker';
import DocIngestion from '@/components/Step2Content/DocIngestion';
import CanvasSandbox from '@/components/OutputSandbox/CanvasSandbox';
import CodeInspector from '@/components/OutputSandbox/CodeInspector';
import ExportCenter from '@/components/OutputSandbox/ExportCenter';

import { PRESET_THEMES, PresetTheme } from '@/lib/presets';
import { SAMPLE_EDUCATIONAL_DOC } from '@/components/Step2Content/sampleDoc';
import { DesignTokens, ApiSettings, ViewportMode, GenerationResult } from '@/lib/types';
import { parseAndGenerateOfflineHtml } from '@/lib/offline-parser';
import { generateStandaloneHtml, generateMoodleCss } from '@/lib/moodle-templates';
import { ArrowRight, ArrowLeft, Sparkles, Layers } from 'lucide-react';

const DEFAULT_SETTINGS: ApiSettings = {
  geminiKey: '',
  groqKey: '',
  nvidiaKey: '',
  activeVisionProvider: 'gemini',
  activeTextProvider: 'offline',
  geminiModel: 'gemini-3.8-flash',
  groqModel: 'llama-3.3-70b-versatile',
  groqVisionModel: 'llama-3.2-11b-vision-preview',
  nvidiaModel: 'meta/llama-3.1-70b-instruct',
  nvidiaVisionModel: 'meta/llama-3.2-11b-vision-instruct',
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [tokens, setTokens] = useState<DesignTokens>(PRESET_THEMES[0].tokens);
  const [text, setText] = useState<string>(SAMPLE_EDUCATIONAL_DOC);
  const [prefix, setPrefix] = useState<string>('esalud');

  const [apiSettings, setApiSettings] = useState<ApiSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult>({
    htmlBlock: '',
    fullHtml: '',
    cssOnly: '',
  });

  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [lmsTheme, setLmsTheme] = useState<'boost-white' | 'slate-soft' | 'dark-sim'>('boost-white');
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleResetAll = () => {
    if (window.confirm('¿Deseas reiniciar y empezar un nuevo recurso? Se limpiará el texto, la imagen de referencia y la vista previa actual.')) {
      setTokens(PRESET_THEMES[0].tokens);
      setText('');
      setPrefix('esalud');
      setGenerationResult({ htmlBlock: '', fullHtml: '', cssOnly: '' });
      setCurrentStep(1);
      setResetTrigger(prev => prev + 1);
    }
  };

  // Load saved settings from localStorage and migrate deprecated models
  useEffect(() => {
    try {
      const saved = localStorage.getItem('editorial_lms_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nvidiaModel === 'meta/llama-3.3-70b-instruct' || parsed.nvidiaModel?.includes('gpt-')) {
          parsed.nvidiaModel = 'meta/llama-3.1-70b-instruct';
        }
        if (parsed.nvidiaVisionModel === 'meta/llama-3.2-90b-vision-instruct' || parsed.nvidiaVisionModel?.includes('gpt-')) {
          parsed.nvidiaVisionModel = 'meta/llama-3.2-11b-vision-instruct';
        }
        // Limpiar modelos erróneos de OpenAI en Groq
        if (parsed.groqVisionModel === 'gpt-4o-vision' || parsed.groqVisionModel?.includes('gpt-') || parsed.groqVisionModel?.includes('3.3')) {
          parsed.groqVisionModel = 'llama-3.2-11b-vision-preview';
        }
        if (parsed.groqModel?.includes('gpt-')) {
          parsed.groqModel = 'llama-3.3-70b-versatile';
        }
        // Limpiar espacios en blanco accidentales en las claves
        if (parsed.geminiKey) parsed.geminiKey = parsed.geminiKey.trim();
        if (parsed.groqKey) parsed.groqKey = parsed.groqKey.trim();
        if (parsed.nvidiaKey) parsed.nvidiaKey = parsed.nvidiaKey.trim();

        // Migrar modelos Gemini obsoletos a modelos activos (septiembre 2026)
        const deprecatedGeminiModels = ['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-1.0-pro', 'gemini-pro'];
        if (!parsed.geminiModel || deprecatedGeminiModels.includes(parsed.geminiModel)) {
          parsed.geminiModel = 'gemini-3.8-flash';
        }

        // Aplicar modo recomendado: Gemini para visión y Offline para maquetación
        parsed.activeVisionProvider = 'gemini';
        parsed.activeTextProvider = 'offline';

        const updated = { ...DEFAULT_SETTINGS, ...parsed };
        setApiSettings(updated);
        localStorage.setItem('editorial_lms_settings', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('No se pudo cargar la configuración de localStorage', e);
    }
  }, []);

  // Save settings to localStorage
  const handleSaveSettings = (newSettings: ApiSettings) => {
    setApiSettings(newSettings);
    try {
      localStorage.setItem('editorial_lms_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage', e);
    }
  };

  // Generate layout
  const handleGenerate = async () => {
    setIsGenerating(true);
    const provider = apiSettings.activeTextProvider;

    let apiKey = '';
    let model = '';
    if (provider === 'gemini') {
      apiKey = apiSettings.geminiKey;
      model = apiSettings.geminiModel;
    } else if (provider === 'groq') {
      apiKey = apiSettings.groqKey;
      model = apiSettings.groqModel;
    } else if (provider === 'nvidia') {
      apiKey = apiSettings.nvidiaKey;
      model = apiSettings.nvidiaModel;
    }

    try {
      if (provider === 'offline' || !apiKey) {
        // Ejecución inmediata con el motor offline
        const htmlBlock = parseAndGenerateOfflineHtml(text, tokens, prefix);
        const fullHtml = generateStandaloneHtml(htmlBlock, tokens);
        const cssOnly = generateMoodleCss(tokens, prefix);
        setGenerationResult({ htmlBlock, fullHtml, cssOnly });
      } else {
        // Llamada a la API route
        const res = await fetch('/api/ai/generate-layout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            tokens,
            prefix,
            provider,
            apiKey,
            model,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error al generar la maqueta');
        }

        setGenerationResult({
          htmlBlock: data.htmlBlock,
          fullHtml: data.fullHtml,
          cssOnly: data.cssOnly,
        });
      }
    } catch (err: any) {
      alert('Error en la maquetación: ' + err.message);
      // Fallback automático al offline para no interrumpir el flujo
      const htmlBlock = parseAndGenerateOfflineHtml(text, tokens, prefix);
      const fullHtml = generateStandaloneHtml(htmlBlock, tokens);
      const cssOnly = generateMoodleCss(tokens, prefix);
      setGenerationResult({ htmlBlock, fullHtml, cssOnly });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate initial preview on mount
  useEffect(() => {
    const htmlBlock = parseAndGenerateOfflineHtml(SAMPLE_EDUCATIONAL_DOC, PRESET_THEMES[0].tokens, 'esalud');
    const fullHtml = generateStandaloneHtml(htmlBlock, PRESET_THEMES[0].tokens);
    const cssOnly = generateMoodleCss(PRESET_THEMES[0].tokens, 'esalud');
    setGenerationResult({ htmlBlock, fullHtml, cssOnly });
  }, []);

  // Update styles in real-time when tokens or prefix change
  useEffect(() => {
    setGenerationResult(prev => {
      if (!prev.htmlBlock) return prev;
      const newCss = generateMoodleCss(tokens, prefix);
      let updatedHtmlBlock = prev.htmlBlock;
      if (updatedHtmlBlock.includes('<style>') && updatedHtmlBlock.includes('</style>')) {
        updatedHtmlBlock = updatedHtmlBlock.replace(
          /<style>[\s\S]*?<\/style>/i,
          `<style>\n${newCss}\n</style>`
        );
      }
      return {
        htmlBlock: updatedHtmlBlock,
        fullHtml: generateStandaloneHtml(updatedHtmlBlock, tokens),
        cssOnly: newCss,
      };
    });
  }, [tokens, prefix]);

  const handleSelectPreset = (preset: PresetTheme) => {
    setTokens(preset.tokens);
  };

  const handleUpdateTokens = (updated: Partial<DesignTokens>) => {
    setTokens(prev => ({ ...prev, ...updated }));
  };

  const handleUpdateEditedHtml = (updatedHtmlBlock: string) => {
    setGenerationResult(prev => ({
      ...prev,
      htmlBlock: updatedHtmlBlock,
      fullHtml: generateStandaloneHtml(updatedHtmlBlock, tokens),
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetAll={handleResetAll}
        apiSettings={apiSettings}
      />

      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={apiSettings}
        onSave={handleSaveSettings}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Step 1: Design System & Tokens */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Step Banner */}
            <div className="bg-gradient-to-r from-sky-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 uppercase tracking-wider">
                  Etapa 1 de 2
                </span>
                <h1 className="text-xl sm:text-2xl font-bold mt-2">
                  Sistema de Diseño y Extracción de Estilos Visuales
                </h1>
                <p className="text-xs sm:text-sm text-sky-200/80 max-w-2xl mt-1">
                  Establece la identidad visual para tu aula Moodle. Puedes seleccionar un preset educativo ya calibrado o extraer la paleta desde una imagen de referencia.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="self-start md:self-center flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/30 transition whitespace-nowrap"
              >
                <span>Continuar a Ingesta (Paso 2)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Presets and Image Extractor */}
            <div className="grid grid-cols-1 gap-6">
              <PresetSelector
                currentTokens={tokens}
                onSelectPreset={handleSelectPreset}
              />

              <ImageExtractor
                onTokensExtracted={setTokens}
                apiSettings={apiSettings}
                onOpenSettings={() => setIsSettingsOpen(true)}
                resetTrigger={resetTrigger}
              />
            </div>

            {/* Color Palette & Fine Tuning */}
            <ColorPaletteEditor
              tokens={tokens}
              onChangeTokens={handleUpdateTokens}
            />

            {/* Typography, Radii & Characteristic Element */}
            <TypographyShapePicker
              tokens={tokens}
              onChangeTokens={handleUpdateTokens}
            />

            {/* Bottom Proceed Bar */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-md transition"
              >
                <span>Avanzar al Paso 2: Ingesta y Maquetación</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Content Ingestion, Preview & Export */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Step Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-sky-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                  Etapa 2 de 2
                </span>
                <h1 className="text-xl sm:text-2xl font-bold mt-2">
                  Ingesta de Contenido y Previsualización LMS
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
                  Introduce tu texto sin formato o sube tu documento. El motor clasificará banners, glosarios, procedimientos y plantillas aplicando los tokens de diseño configurados.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="self-start md:self-center flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Tokens (Paso 1)</span>
              </button>
            </div>

            {/* Doc Ingestion Panel */}
            <DocIngestion
              text={text}
              onChangeText={setText}
              prefix={prefix}
              onChangePrefix={setPrefix}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              activeProviderName={
                apiSettings.activeTextProvider === 'offline'
                  ? 'Motor Local Offline'
                  : apiSettings.activeTextProvider.toUpperCase()
              }
            />

            {/* Canvas Sandbox / Live Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Previsualizador en Vivo (Canvas Sandbox)</h2>
                  <p className="text-xs text-slate-500">Iframe interactivo aislado para simular la vista dentro de Moodle</p>
                </div>
              </div>

              <CanvasSandbox
                htmlContent={generationResult.htmlBlock}
                viewport={viewport}
                onChangeViewport={setViewport}
                lmsTheme={lmsTheme}
                onChangeLmsTheme={setLmsTheme}
                onUpdateHtmlContent={handleUpdateEditedHtml}
              />
            </div>

            {/* Export Center */}
            <ExportCenter
              htmlBlock={generationResult.htmlBlock}
              fullHtml={generationResult.fullHtml}
              cssOnly={generationResult.cssOnly}
            />

            {/* Code Inspector */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900">Inspección de Código Fuente</h2>
              <CodeInspector
                htmlBlock={generationResult.htmlBlock}
                fullHtml={generationResult.fullHtml}
                cssOnly={generationResult.cssOnly}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Maquetador Editorial Web & LMS · Moodle Boost/Classic Hardening · WCAG 2.1 AA/AAA</span>
          <span className="text-slate-400">Google Gemini · Groq Cloud · Nvidia NIM</span>
        </div>
      </footer>
    </div>
  );
}
