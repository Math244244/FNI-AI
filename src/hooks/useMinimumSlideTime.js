import { useState, useEffect, useRef } from 'react';

/**
 * Gate visuel de temps minimum par slide.
 * minSeconds = null => désactivé.
 * resetKey change => reset timer.
 * Renvoie { elapsed, canProceed, fraction (0..1) }.
 */
export default function useMinimumSlideTime(minSeconds = 20, resetKey) {
  const [elapsed, setElapsed] = useState(0);
  const raf = useRef(null);
  const startedAt = useRef(null);

  useEffect(() => {
    setElapsed(0);
    startedAt.current = performance.now();
    if (!minSeconds) return undefined;

    const tick = () => {
      if (!startedAt.current) return;
      const delta = (performance.now() - startedAt.current) / 1000;
      setElapsed(delta);
      if (delta < minSeconds) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [minSeconds, resetKey]);

  const canProceed = !minSeconds || elapsed >= minSeconds;
  const fraction = minSeconds ? Math.min(elapsed / minSeconds, 1) : 1;

  return { elapsed, canProceed, fraction };
}
