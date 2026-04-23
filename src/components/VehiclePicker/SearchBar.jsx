import React, { useMemo, useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Search, Command as CommandIcon, Zap, X } from 'lucide-react';
import { AUTO_MAKES, AUTO_YEARS } from '../../data/vehicleData';

/**
 * SearchBar universel — recherche fuzzy véhicule + détection VIN (17 chars)
 * onSelect({ year, make, model }) quand une suggestion est choisie
 * onVin(vin) quand 17 caractères sont entrés
 */
export default function SearchBar({ onSelect, onVin, recents = [] }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fuse = useMemo(() => {
    const corpus = AUTO_MAKES.flatMap((m) =>
      AUTO_YEARS.slice(0, 3).map((y) => ({ label: `${y} ${m}`, make: m, year: String(y) }))
    );
    return new Fuse(corpus, { keys: ['label'], threshold: 0.35, limit: 8 });
  }, []);

  const results = useMemo(() => {
    if (!q || q.length < 2) return [];
    const trimmed = q.trim().toUpperCase();
    if (trimmed.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/.test(trimmed)) {
      return [{ kind: 'vin', value: trimmed }];
    }
    return fuse.search(q).map((r) => ({ kind: 'match', ...r.item }));
  }, [q, fuse]);

  const list = useMemo(() => {
    if (q.length >= 2) return results;
    return recents.slice(0, 5).map((r) => ({ kind: 'recent', ...r }));
  }, [q, results, recents]);

  const pick = (item) => {
    if (item.kind === 'vin') {
      onVin?.(item.value);
      setOpen(false);
      setQ('');
      return;
    }
    onSelect?.(item);
    setOpen(false);
    setQ(item.label || `${item.year} ${item.make} ${item.model || ''}`.trim());
  };

  const onKeyDown = (e) => {
    if (!open) setOpen(true);
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, list.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter' && list[highlighted]) { e.preventDefault(); pick(list[highlighted]); }
    else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0.85rem 1rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-md)',
          borderRadius: 'var(--r-lg)',
          boxShadow: open ? 'var(--shadow-md)' : 'var(--shadow-xs)',
          transition: 'var(--tx)',
        }}
      >
        <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setHighlighted(0); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 140)}
          onKeyDown={onKeyDown}
          placeholder="Recherchez un véhicule, collez un VIN (17 car.) ou tapez /"
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 'var(--fs-base)', color: 'var(--text-primary)', fontFamily: 'inherit',
          }}
          aria-label="Rechercher un véhicule"
          spellCheck={false}
          autoComplete="off"
        />
        {q && (
          <button
            onClick={() => setQ('')}
            aria-label="Effacer la recherche"
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--text-tertiary)', cursor: 'pointer',
              padding: 4, borderRadius: 'var(--r-xs)',
            }}
          >
            <X size={14} />
          </button>
        )}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '0.25rem 0.45rem',
          borderRadius: 'var(--r-xs)',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-md)',
          fontSize: '0.7rem', fontWeight: 600,
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)',
        }}>
          <CommandIcon size={10} />/
        </span>
      </div>

      {open && list.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0, right: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-md)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: 6,
            zIndex: 'var(--z-popover)',
            maxHeight: 360,
            overflowY: 'auto',
          }}
        >
          {list.map((item, i) => (
            <button
              key={`${item.kind}-${i}-${item.label || item.value}`}
              onMouseDown={(e) => { e.preventDefault(); pick(item); }}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '0.65rem 0.75rem',
                background: i === highlighted ? 'var(--bg-subtle)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--r-sm)',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--text-primary)',
                fontSize: 'var(--fs-sm)',
              }}
            >
              {item.kind === 'vin' ? (
                <>
                  <Zap size={14} style={{ color: 'var(--or-700)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{item.value}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>VIN · décoder</span>
                </>
              ) : item.kind === 'recent' ? (
                <>
                  <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
                  <span>{item.year} {item.make} {item.model || ''}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Récent</span>
                </>
              ) : (
                <>
                  <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
                  <span>{item.label}</span>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
