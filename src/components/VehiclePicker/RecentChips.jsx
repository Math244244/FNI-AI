import React from 'react';
import { Clock, X } from 'lucide-react';

/**
 * Affiche les véhicules récents (localStorage) — cliquer pour remplir
 */
export default function RecentChips({ recents = [], onPick, onClear }) {
  if (!recents.length) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: 'var(--text-tertiary)', fontSize: 'var(--fs-xs)', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        <Clock size={12} /> Récents
      </div>
      {recents.slice(0, 5).map((r, i) => (
        <button
          key={i}
          onClick={() => onPick(r)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0.35rem 0.7rem',
            borderRadius: 'var(--r-full)',
            border: '1px solid var(--border-md)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: 'var(--fs-xs)',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'var(--tx)',
          }}
          className="recent-chip"
        >
          {r.year} {r.make} {r.model || ''}
        </button>
      ))}
      {onClear && (
        <button
          onClick={onClear}
          aria-label="Effacer l'historique"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '0.35rem 0.55rem',
            borderRadius: 'var(--r-full)',
            border: '1px solid transparent',
            background: 'transparent',
            color: 'var(--text-tertiary)',
            fontSize: 'var(--fs-xs)',
            cursor: 'pointer',
          }}
        >
          <X size={10} /> Effacer
        </button>
      )}
    </div>
  );
}
