# 🎓 Maquetador HTML para LMS (Moodle)

Herramienta web para generar bloques HTML pedagógicos listos para pegar en Moodle, con extracción automática de paletas de color desde imágenes institucionales, maquetación con IA y previsualización en vivo.

---

## ✨ Funcionalidades principales

- **Extracción de tokens de diseño** desde imágenes institucionales (Google Gemini Vision)
- **Generación de bloques HTML** pedagógicos para Moodle (IA o motor offline)
- **Presets institucionales** con paletas WCAG calibradas
- **Medidor de contraste WCAG 2.1** en tiempo real con auto-calibración
- **Canvas Sandbox** — previsualizador LMS con:
  - Modos Desktop / Tablet / Móvil
  - Edición de texto en vivo (WYSIWYG)
  - Borrar cajas individuales con clic
  - Historial Deshacer / Rehacer (50 pasos)
  - Limpieza automática de secciones vacías
- **Centro de exportación** — Copiar bloque HTML o descargar `.html`
- **Inspector de código** con resaltado de sintaxis
- Compatible con Moodle Boost (blanco), Gris Institucional y Modo Oscuro

---

## 🚀 Instalación y desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/superpollo02/maquetador-html-lms.git
cd maquetador-html-lms

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 🔑 Configuración de API Keys (opcional)

La herramienta funciona **100% offline** sin ninguna clave. Las IA son opcionales:

| Proveedor | Uso | Dónde obtener |
|---|---|---|
| **Google Gemini** ⭐ Recomendado | Extracción visual de paletas desde imagen | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) — gratuito |
| Groq | Extracción y maquetación alternativa | [console.groq.com](https://console.groq.com) — gratuito |
| Nvidia NIM | Maquetación con Llama | [build.nvidia.com](https://build.nvidia.com) |

> ⚠️ Las claves se guardan **exclusivamente en el `localStorage` de tu navegador** y nunca se suben al servidor ni a este repositorio.

---

## 🏗️ Stack tecnológico

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Google Gemini API** (vision + texto)
- **Groq API** / **Nvidia NIM API** (opcionales)
- Motor de maquetación **offline** (reglas heurísticas, sin dependencias externas)

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                  # Componente raíz
│   └── api/ai/
│       ├── extract-tokens/       # Extracción de paleta desde imagen
│       └── generate-layout/      # Generación de HTML pedagógico
├── components/
│   ├── ApiKeyModal.tsx            # Configuración de proveedores IA
│   ├── ColorPalette/              # Paleta WCAG con calibración
│   ├── OutputSandbox/
│   │   └── CanvasSandbox.tsx      # Previsualizador con edición en vivo
│   └── ...
└── lib/
    ├── ai/
    │   ├── gemini.ts              # Cliente Gemini con fallback en cascada
    │   ├── groq.ts
    │   └── nvidia.ts
    ├── offline-parser.ts          # Motor de maquetación offline
    ├── moodle-templates.ts        # Plantillas HTML para Moodle
    └── types.ts
```

---

## 📜 Licencia

MIT — libre para uso educativo e institucional.
