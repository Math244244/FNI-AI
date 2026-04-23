import { useState, useEffect, useCallback } from 'react';

const KEY = 'avplus-recent-vehicles';
const MAX = 5;

export default function useRecentVehicles() {
  const [recents, setRecents] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const add = useCallback((v) => {
    if (!v?.make || !v?.year) return;
    const entry = {
      year: String(v.year),
      make: v.make,
      model: v.model || '',
      category: v.category || 'automobile',
      subType: v.subType || null,
      savedAt: Date.now(),
    };
    setRecents((prev) => {
      const filtered = prev.filter(
        (r) => !(r.make === entry.make && r.year === entry.year && r.model === entry.model)
      );
      const next = [entry, ...filtered].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecents([]);
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  }, []);

  return { recents, addRecent: add, clearRecents: clear };
}
