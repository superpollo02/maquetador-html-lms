================================================================================
MAQUETADOR HTML PARA LMS (MOODLE) - MANUAL DE FUNCIONAMIENTO Y FLUJO DE TRABAJO
================================================================================

Este documento describe detalladamente el funcionamiento interno y el flujo de
trabajo del "Maquetador HTML para LMS", una herramienta diseñada para crear 
recursos pedagógicos visualmente atractivos y accesibles para Moodle sin 
necesidad de saber programar.

--------------------------------------------------------------------------------
1. CONCEPTO GENERAL DE LA APLICACIÓN
--------------------------------------------------------------------------------
La aplicación es una WebApp de arquitectura moderna (Next.js 14 + React) que 
funciona en el navegador del usuario. Su objetivo principal es transformar 
texto plano o documentos docentes rudimentarios en bloques HTML semánticos,
estilizados con CSS en línea (o bloques style embebidos), listos para ser
pegados directamente en el editor nativo de Moodle.

La herramienta prioriza la privacidad: no requiere base de datos y todas las
claves de API de IA se guardan exclusivamente en el almacenamiento local del 
navegador (localStorage).

--------------------------------------------------------------------------------
2. FLUJO DE TRABAJO PASO A PASO
--------------------------------------------------------------------------------

PASO 1: EXTRACCIÓN Y CONFIGURACIÓN VISUAL (Design Tokens)
Objetivo: Definir la paleta de colores y la tipografía institucional.
- Vía Inteligencia Artificial: El usuario sube una imagen (flyer, logo institucional). 
  La imagen se envía a Google Gemini Vision, que analiza los colores y extrae 
  los 6 "tokens" principales de diseño (fondo, superficie, colores de tinta, 
  y color de acento).
- Vía Presets Manuales: El usuario puede seleccionar paletas predefinidas 
  (ej. "Universidad", "Escuela de Negocios") que cargan colores estándar.
- Calibración de Accesibilidad (WCAG): Un medidor evalúa el contraste entre los 
  colores de texto y fondo. Si no cumple la norma (WCAG 2.1 AA/AAA), la app 
  ofrece un botón de "Auto-Calibrar" que ajusta matemáticamente la luminosidad.
- Tipografía: Se selecciona la familia tipográfica (Google Fonts) y la 
  apariencia de los bordes de los contenedores (redondeados, cuadrados).

PASO 2: INGESTA DE CONTENIDO Y MAQUETACIÓN
Objetivo: Transformar el texto del docente en estructura pedagógica.
- El usuario pega el texto en bruto (temarios, descripciones, objetivos).
- Se define un "Prefijo de Clases CSS" (ej. "curso-mat-") para garantizar que
  el diseño no interfiera con otros elementos dentro de Moodle.
- Motor de Maquetación:
  a) Motor Local Offline (Recomendado): Analiza el texto mediante reglas 
     heurísticas para detectar títulos, listas y definiciones, empaquetándolos
     instantáneamente en HTML sin gastar cuotas de IA.
  b) Motores de IA (Google Gemini / Groq / Nvidia NIM): Usan un "System Prompt" 
     pedagógico que instruye a la IA para analizar el texto, detectar 
     conceptos clave y estructurar el HTML usando los colores del Paso 1.

PASO 3: PREVISUALIZACIÓN Y EDICIÓN EN VIVO (Canvas Sandbox)
Objetivo: Revisar el resultado y hacer correcciones finales antes de exportar.
- El Sandbox simula cómo se verá el bloque exactamente dentro de Moodle.
- Controles de Viewport: Permite visualizar el resultado en Desktop, Tablet 
  (768px) y Móvil (375px) para asegurar el diseño responsivo.
- Herramientas de Edición Interactiva:
  - Editar Texto: Habilita el modo WYSIWYG para corregir errores ortográficos
    o cambiar palabras haciendo clic directamente en el texto.
  - Borrar Caja: Un modo seleccionable que resalta las tarjetas, pasos o
    secciones. Al hacer clic, las elimina con una animación.
  - Limpieza Automática ("Limpiar Vacíos"): Un algoritmo revisa el HTML 
    renderizado y elimina tarjetas con términos genéricos ("Concepto", "Término") 
    o secciones que hayan quedado sin texto real.
- Control de Historial: Cualquier edición manual, borrado o limpieza automática 
  se registra en un historial de hasta 50 pasos. El usuario puede usar 
  "Deshacer" y "Rehacer".

PASO 4: INSPECCIÓN Y EXPORTACIÓN
Objetivo: Llevar el código generado al aula virtual.
- Código Fuente (Inspector): Muestra el código HTML final con resaltado de 
  sintaxis para usuarios avanzados.
- Centro de Exportación: 
  - "Copiar Bloque HTML": Envía el código al portapapeles. El docente solo 
    tiene que ir a Moodle, abrir la vista "< >" (código) de su editor Atto o 
    TinyMCE, y pegar.
  - "Descargar Archivo": Genera un .html local como copia de seguridad o 
    para visualizar en el navegador de escritorio.

--------------------------------------------------------------------------------
3. ARQUITECTURA DE SEGURIDAD Y CONFIGURACIÓN
--------------------------------------------------------------------------------
- Gestión de Claves (API Keys): A través de un modal de configuración, el 
  usuario ingresa sus claves. Estas pasan por un proceso de sanitización 
  (limpieza de espacios) y migración automática para adaptarse a los modelos de 
  IA más actuales (ej. transición automática de gemini-1.5 a gemini-3.8-flash).
- Autonomía: Si el usuario carece de internet o de claves de API, la aplicación 
  sigue siendo 100% operativa gracias al "Motor Local Offline".
