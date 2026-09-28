import { useState, useCallback } from 'react';

/**
 * Hook to copy text to clipboard and expose a simple `copied` boolean that
 * automatically resets after a configurable delay.
 *
 * Example usage:
 *   const { copied, copy } = useCopyFeedback();
 *   <button onClick={() => copy(html)}>Copy</button>
 *   {copied && <span>¡Copiado!</span>}
 */
export function useCopyFeedback(delayMs = 2200) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), delayMs);
      })
      .catch(() => {
        // Si falla, seguimos sin lanzar error al UI. Podrías mostrar un toast.
        console.warn('Error al copiar al portapapeles');
      });
  }, [delayMs]);

  return { copied, copy };
}
