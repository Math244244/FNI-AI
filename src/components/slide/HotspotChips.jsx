import React from 'react';
import getIcon from '../../utils/productIcons';
import { MapPin } from 'lucide-react';

/**
 * HotspotChips — chips numérotées sous l'image (25% du viewport en haut à droite)
 * - Clique sur une chip -> ouvre panneau latéral
 */
export default function HotspotChips({ dots = [], activeIndex, onSelect }) {
  if (!dots?.length) return null;
  return (
    <div
      role="tablist"
      aria-label="Points d'intérêt du véhicule"
      style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {dots.map((dot, i) => {
        const Icon = dot.icon ? getIcon(dot.icon) : MapPin;
        const isActive = activeIndex === i;
        return (
          <button
            key={i}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(isActive ? null : i)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '0.35rem 0.7rem',
              border: `1px solid ${isActive ? 'var(--or-700)' : 'var(--border-md)'}`,
              borderRadius: 'var(--r-full)',
              background: isActive ? 'var(--or-100)' : 'var(--bg-card)',
              color: isActive ? 'var(--or-900)' : 'var(--text-secondary)',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--tx)',
              lineHeight: 1,
            }}
          >
            <span
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 18, height: 18,
                borderRadius: '50%',
                background: isActive ? 'var(--or-700)' : 'var(--graphite-100)',
                color: isActive ? '#fff' : 'var(--text-tertiary)',
                fontSize: '0.65rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
              }}
            >{i + 1}</span>
            <Icon size={12} />
            <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {dot.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Panneau latéral détails hotspot */
export function HotspotDetailPanel({ dot, onClose }) {
  if (!dot) return null;
  const Icon = dot.icon ? getIcon(dot.icon) : MapPin;
  return (
    <div
      role="dialog"
      aria-label={dot.label}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-md)',
        borderRadius: 'var(--r-lg)',
        padding: '1rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        animation: 'fadeUp 0.25s var(--ease-out)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32, height: 32,
          borderRadius: 'var(--r-sm)',
          background: 'var(--or-100)',
          color: 'var(--or-700)',
        }}>
          <Icon size={16} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--text-primary)' }}>
            {dot.label}
          </div>
          {dot.cost && (
            <div style={{
              fontSize: 'var(--fs-xs)',
              color: 'var(--crimson-500)',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {dot.cost}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Fermer"
          style={{
            width: 26, height: 26,
            borderRadius: 'var(--r-sm)',
            border: '1px solid var(--border-hair)',
            background: 'transparent',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >×</button>
      </div>
      <p style={{
        margin: 0,
        fontSize: 'var(--fs-sm)',
        color: 'var(--text-secondary)',
        lineHeight: 1.55,
      }}>
        {dot.description}
      </p>
    </div>
  );
}
