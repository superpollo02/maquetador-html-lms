'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, RefreshCw, Wand2, AlertCircle, Key } from 'lucide-react';
import { ApiSettings, DesignTokens } from '@/lib/types';

interface ImageExtractorProps {
  onTokensExtracted: (tokens: DesignTokens) => void;
  apiSettings: ApiSettings;
  onOpenSettings: () => void;
  resetTrigger?: number;
}

export default function ImageExtractor({
  onTokensExtracted,
  apiSettings,
  onOpenSettings,
  resetTrigger,
}: ImageExtractorProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (resetTrigger) {
      setPreviewUrl(null);
      setImageBase64(null);
      setErrorMsg(null);
      setNeedsApiKey(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [resetTrigger]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setNeedsApiKey(false);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);

      // Optimizar y reescalar la imagen si es muy grande para no sobrecargar el payload
      const img = new Image();
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setImageBase64(optimizedDataUrl);
          setMimeType('image/jpeg');
        } else {
          setImageBase64(dataUrl);
          setMimeType(file.type || 'image/jpeg');
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // AI Extraction via /api/ai/extract-tokens
  const extractWithAi = async () => {
    if (!imageBase64) return;

    const provider = apiSettings.activeVisionProvider;
    let apiKey = '';
    let model = '';

    if (provider === 'gemini') {
      apiKey = apiSettings.geminiKey;
      model = apiSettings.geminiModel;
    } else if (provider === 'groq') {
      apiKey = apiSettings.groqKey;
      model = apiSettings.groqVisionModel;
    } else if (provider === 'nvidia') {
      apiKey = apiSettings.nvidiaKey;
      model = apiSettings.nvidiaVisionModel;
    }

    if (!apiKey) {
      setNeedsApiKey(true);
      setErrorMsg(
        `Para extraer el sistema de diseño con ${provider.toUpperCase()}, debes configurar tu API Key en los Ajustes.`
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setNeedsApiKey(false);

    try {
      const res = await fetch('/api/ai/extract-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          mimeType,
          provider,
          apiKey,
          model,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al extraer tokens con IA');
      }

      onTokensExtracted(data.tokens);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderName = () => {
    switch (apiSettings.activeVisionProvider) {
      case 'groq':
        return 'Groq Vision';
      case 'nvidia':
        return 'Nvidia NIM';
      case 'gemini':
      default:
        return 'Google Gemini';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Extracción Visual desde Imagen</h3>
            <p className="text-xs text-slate-500">Carga una captura de referencia para derivar colores y estética con IA</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-semibold">Atención</p>
              <p>{errorMsg}</p>
            </div>
          </div>
          {needsApiKey && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 text-white font-semibold text-[11px] hover:bg-red-700 transition flex-shrink-0"
            >
              <Key className="w-3 h-3" />
              <span>Configurar Clave</span>
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Drop zone / Upload button */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full md:w-1/2 border-2 border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50/30 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[140px]"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
          <p className="text-xs font-semibold text-slate-700">Haz clic o arrastra una imagen</p>
          <p className="text-[11px] text-slate-400">PNG, JPG, WEBP de capturas o diagramas</p>
        </div>

        {/* Preview & Action Buttons */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
          {previewUrl ? (
            <div className="w-full space-y-3">
              <div className="relative h-28 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Referencia"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <button
                type="button"
                onClick={extractWithAi}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analizando imagen con {getProviderName()}...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Extraer Estilos y Colores con IA ({getProviderName()})</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400 py-6">
              Sube una imagen para habilitar la extracción automática de tokens visuales
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
