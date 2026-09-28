'use client';

import React, { useRef, useState } from 'react';
import { FileText, Upload, Sparkles, Wand2, RefreshCw, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { SAMPLE_EDUCATIONAL_DOC } from './sampleDoc';

interface DocIngestionProps {
  text: string;
  onChangeText: (text: string) => void;
  prefix: string;
  onChangePrefix: (prefix: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  activeProviderName: string;
}

export default function DocIngestion({
  text,
  onChangeText,
  prefix,
  onChangePrefix,
  onGenerate,
  isGenerating,
  activeProviderName,
}: DocIngestionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadNotice(null);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse-doc', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar el archivo');
      }

      onChangeText(data.text);
      setUploadNotice(`Archivo cargado con éxito: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = () => {
    onChangeText(SAMPLE_EDUCATIONAL_DOC);
    setUploadNotice('Ejemplo didáctico de protocolo clínico cargado en el editor');
    setUploadError(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header and Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ingesta del Documento Pedagógico</h3>
            <p className="text-xs text-slate-500">Pega tu borrador o sube un archivo sin resumir ni alterar el contenido</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Load Sample Button */}
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Cargar Ejemplo de Prueba</span>
          </button>

          {/* Upload File Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Leyendo...' : 'Subir (.docx, .md, .txt)'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.txt,.md"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {uploadNotice && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{uploadNotice}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={e => onChangeText(e.target.value)}
          placeholder="Pega aquí el documento, protocolo, glosario o instructivo que deseas transformar en recurso HTML para Moodle..."
          className="w-full h-72 p-4 text-xs font-mono text-slate-800 bg-slate-50/70 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition leading-relaxed resize-y"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
          <span>{wordCount.toLocaleString()} palabras · {charCount.toLocaleString()} caracteres</span>
          <span>Regla inmutable: No resumir ni omitir</span>
        </div>
      </div>

      {/* Settings bar: Prefix & Generate Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Prefijo CSS Moodle:
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-xs text-slate-400 font-mono">.</span>
              <input
                type="text"
                value={prefix}
                onChange={e => onChangePrefix(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                className="w-28 text-xs font-mono pl-5 pr-2 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="esalud"
              />
              <span className="ml-1.5 text-xs text-slate-400 font-mono">-*</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 hidden md:inline">
            Aisla las clases para evitar colisiones con temas Boost o Classic
          </span>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !text.trim()}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-md shadow-sky-500/20 disabled:opacity-50 transition"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Maquetando Recurso ({activeProviderName})...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Generar Recurso Moodle-Ready ({activeProviderName})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
