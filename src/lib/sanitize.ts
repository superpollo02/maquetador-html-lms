import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitiza código HTML generado por la IA o editado manualmente.
 * Elimina <script>, event handlers (onload, onerror) y demás vectores XSS,
 * pero mantiene las etiquetas <style>, <svg> y atributos data-* necesarios 
 * para el funcionamiento visual de nuestra App y de Moodle.
 */
export function sanitizeLmsHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';
  
  return DOMPurify.sanitize(dirtyHtml, {
    // Preservar etiquetas necesarias que a veces DOMPurify quita por defecto
    ADD_TAGS: ['style', 'svg', 'path', 'rect', 'circle', 'line', 'polyline'],
    // Permitir atributos propios y de dibujo vectorial
    ADD_ATTR: [
      'viewBox', 
      'stroke', 
      'stroke-width', 
      'stroke-linecap', 
      'stroke-linejoin', 
      'fill', 
      'data-target', 
      'data-lms-deletable'
    ],
    // Forzar limpieza completa de atributos maliciosos 
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  });
}
