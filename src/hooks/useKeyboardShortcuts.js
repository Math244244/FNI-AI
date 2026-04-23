import { useEffect } from 'react';

/**
 * Hook universel de raccourcis clavier.
 * bindings = { 'ArrowLeft': fn, 'v': fn, 'r': fn, '?': fn, ... }
 * Les inputs/textareas/contenteditable sont ignorés (sauf avec modifier).
 */
export default function useKeyboardShortcuts(bindings, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e) => {
      const target = e.target;
      const tag = target?.tagName;
      const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable;
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey;

      if (isEditable && !hasModifier) return;

      const key = e.key;
      const lower = key.length === 1 ? key.toLowerCase() : key;

      const fn = bindings[key] || bindings[lower];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [bindings, enabled]);
}
