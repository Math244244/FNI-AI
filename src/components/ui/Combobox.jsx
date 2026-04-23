import React, {
  useState, useRef, useMemo, useEffect, useCallback, useId,
} from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, X as ClearIcon, Search } from 'lucide-react';

/**
 * Combobox — champ de saisie filtrable avec dropdown.
 * Remplace Select lorsque la liste est longue (marques, modèles, années).
 *
 *  - Tape-pour-filtrer : match « starts-with » prioritaire puis « contains ».
 *  - Accessibilité : rôle listbox, flèches ↑/↓, Enter, Esc, Tab, Home/End.
 *  - Portail + positionnement automatique (dessus si pas assez de place dessous).
 *
 * Usage :
 *   <Combobox
 *     value={make}
 *     onValueChange={setMake}
 *     items={makes.map((m) => ({ value: m, label: m }))}
 *     placeholder="— Sélectionner —"
 *     disabled={false}
 *     emptyLabel="Aucune marque trouvée"
 *     ariaLabel="Marque"
 *     clearable
 *   />
 */
export default function Combobox({
  value,
  onValueChange,
  items = [],
  placeholder = 'Sélectionner…',
  disabled = false,
  ariaLabel,
  emptyLabel = 'Aucun résultat',
  clearable = true,
  allowCustom = false,
  style,
  size = 'md',
}) {
  const sizeMap = {
    sm: { height: 36, fs: 'var(--fs-xs)',  px: '0.75rem' },
    md: { height: 44, fs: 'var(--fs-sm)',  px: '1rem' },
    lg: { height: 56, fs: 'var(--fs-base)',px: '1.25rem' },
    xl: { height: 64, fs: 'var(--fs-md)',  px: '1.4rem' },
  }[size] || { height: 44, fs: 'var(--fs-sm)', px: '1rem' };

  const rootId = useId();
  const inputRef = useRef(null);
  const listRef  = useRef(null);
  const wrapRef  = useRef(null);

  const selectedLabel = useMemo(() => {
    const it = items.find((i) => String(i.value) === String(value));
    return it ? it.label : (value || '');
  }, [items, value]);

  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const [activeIdx, setAct] = useState(0);
  const [pos, setPos]       = useState(/** @type {null | {left:number,top:number,width:number,above:boolean}} */ (null));

  // Ouverture : on pré-remplit le champ avec la valeur actuelle pour remplacement rapide
  const openDropdown = useCallback(() => {
    if (disabled) return;
    setQuery('');
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [disabled]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setQuery('');
    setAct(0);
  }, []);

  // Filtrage : prefix d'abord, puis substring, insensible aux accents
  const normalized = useMemo(() => {
    const n = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    return items.map((it) => ({ ...it, _n: n(it.label) }));
  }, [items]);

  const filtered = useMemo(() => {
    if (!query.trim()) return normalized;
    const q = query.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    const starts = [];
    const contains = [];
    for (const it of normalized) {
      if (it._n.startsWith(q)) starts.push(it);
      else if (it._n.includes(q)) contains.push(it);
    }
    return [...starts, ...contains];
  }, [normalized, query]);

  // Clamp activeIdx quand la liste filtrée rétrécit
  useEffect(() => {
    if (activeIdx >= filtered.length) setAct(0);
  }, [filtered.length, activeIdx]);

  // Scroll automatique vers l'item actif
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIdx, open]);

  // Positionnement + resize / scroll
  useEffect(() => {
    if (!open) return;
    const compute = () => {
      const r = wrapRef.current?.getBoundingClientRect();
      if (!r) return;
      const maxH = 320;
      const below = window.innerHeight - r.bottom;
      const above = r.top;
      const useAbove = below < 260 && above > below;
      setPos({
        left: r.left,
        top: useAbove ? r.top - Math.min(maxH, above - 8) : r.bottom + 4,
        width: r.width,
        above: useAbove,
      });
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [open]);

  // Click-outside
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      const t = e.target;
      if (wrapRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      closeDropdown();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, closeDropdown]);

  const commit = (val) => {
    onValueChange?.(val);
    closeDropdown();
  };

  const handleKey = (e) => {
    if (disabled) return;
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openDropdown();
      return;
    }
    if (!open) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setAct((i) => Math.min(filtered.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setAct((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        e.preventDefault();
        setAct(0);
        break;
      case 'End':
        e.preventDefault();
        setAct(Math.max(0, filtered.length - 1));
        break;
      case 'Enter': {
        e.preventDefault();
        const pick = filtered[activeIdx];
        if (pick) commit(String(pick.value));
        else if (allowCustom && query.trim()) commit(query.trim());
        break;
      }
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
      case 'Tab':
        closeDropdown();
        break;
      default:
        break;
    }
  };

  const onTrigger = () => {
    if (open) closeDropdown();
    else openDropdown();
  };

  const onClear = (e) => {
    e.stopPropagation();
    onValueChange?.('');
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${rootId}-listbox`}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        onClick={onTrigger}
        onKeyDown={handleKey}
        disabled={disabled}
        data-avp-combobox
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          height: sizeMap.height,
          padding: `0 ${sizeMap.px}`,
          background: 'var(--bg-input)',
          border: `1px solid ${open ? 'var(--or-500)' : 'var(--border-md)'}`,
          borderRadius: 'var(--r-md)',
          color: 'var(--text-primary)',
          fontSize: sizeMap.fs,
          fontWeight: 500,
          fontFamily: 'inherit',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'border-color 0.15s var(--ease-out), background 0.15s var(--ease-out)',
          outline: 'none',
          textAlign: 'left',
          gap: 8,
          ...style,
        }}
      >
        <span
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            color: selectedLabel ? 'var(--text-primary)' : 'var(--text-tertiary)',
          }}
        >
          {selectedLabel || placeholder}
        </span>

        {clearable && selectedLabel && !disabled && (
          <span
            role="button"
            aria-label="Effacer"
            tabIndex={-1}
            onClick={onClear}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: '50%',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
            }}
          >
            <ClearIcon size={14} />
          </span>
        )}

        <ChevronDown
          size={16}
          style={{
            color: 'var(--text-tertiary)',
            transition: 'transform 0.15s var(--ease-out)',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        />
      </button>

      {open && pos && createPortal(
        <div
          ref={listRef}
          role="listbox"
          id={`${rootId}-listbox`}
          style={{
            position: 'fixed',
            left: pos.left,
            top: pos.top,
            width: pos.width,
            maxHeight: 320,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-md)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: 6,
            zIndex: 'var(--z-popover)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: `avp-cb-${pos.above ? 'up' : 'down'} 0.14s var(--ease-out)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0.35rem 0.6rem',
              border: '1px solid var(--border-hair)',
              borderRadius: 'var(--r-sm)',
              background: 'var(--bg-input)',
              marginBottom: 6,
            }}
          >
            <Search size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              placeholder="Taper pour filtrer…"
              onChange={(e) => { setQuery(e.target.value); setAct(0); }}
              onKeyDown={handleKey}
              autoComplete="off"
              spellCheck={false}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 'var(--fs-sm)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                minWidth: 0,
                padding: '0.2rem 0',
              }}
              aria-autocomplete="list"
              aria-controls={`${rootId}-listbox`}
              aria-activedescendant={filtered[activeIdx] ? `${rootId}-opt-${activeIdx}` : undefined}
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
                aria-label="Vider le filtre"
              >
                <ClearIcon size={13} />
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', maxHeight: 250 }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: '0.6rem 0.75rem',
                  fontSize: 'var(--fs-sm)',
                  color: 'var(--text-tertiary)',
                  fontStyle: 'italic',
                }}
              >
                {allowCustom && query.trim()
                  ? `Appuyez sur Entrée pour ajouter « ${query.trim()} »`
                  : emptyLabel}
              </div>
            ) : (
              filtered.map((it, i) => {
                const isSelected = String(it.value) === String(value);
                const isActive = i === activeIdx;
                return (
                  <div
                    key={String(it.value)}
                    role="option"
                    aria-selected={isSelected}
                    id={`${rootId}-opt-${i}`}
                    data-idx={i}
                    onMouseEnter={() => setAct(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      commit(String(it.value));
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '0.5rem 0.6rem',
                      borderRadius: 'var(--r-sm)',
                      fontSize: 'var(--fs-sm)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      background: isActive
                        ? 'var(--or-100)'
                        : isSelected
                          ? 'var(--bg-subtle)'
                          : 'transparent',
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {it.label}
                    </span>
                    {isSelected && <Check size={14} style={{ color: 'var(--or-700)' }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body,
      )}

      <style>{`
        @keyframes avp-cb-down {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes avp-cb-up {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
