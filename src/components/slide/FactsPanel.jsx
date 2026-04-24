import React from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * Encart « Faits & statistiques » — bas-gauche de la zone visuelle (présentation).
 * Contenu alimenté par le catalogue (products.js) + overrides dealer par catégorie.
 * @param {{ facts?: { headline?: string, image?: string, statValue?: string, statLabel?: string, body?: string, footnote?: string }|null } & { className?: string }} props
 */
export default function FactsPanel({ facts, className = '' }) {
  if (!facts) return null;
  const { headline, image, statValue, statLabel, body, footnote } = facts;
  const hasContent = (body && String(body).trim()) || (statValue && String(statValue).trim());
  if (!hasContent) return null;

  return (
    <aside
      className={`facts-panel ${className}`.trim()}
      aria-label={headline || 'Faits et statistiques'}
      style={{
        position: 'absolute',
        left: 'clamp(0.75rem, 1.5vw, 1.25rem)',
        bottom: 'clamp(4.5rem, 9vh, 6.5rem)',
        maxWidth: 'min(100%, 22rem)',
        zIndex: 4,
        display: 'flex',
        flexDirection: 'row',
        gap: '0.75rem',
        padding: '0.75rem 0.9rem',
        borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(250,250,251,0.9) 100%)',
        border: '1px solid var(--border-sm)',
        boxShadow: 'var(--shadow-md), 0 0 0 1px rgba(14,14,17,0.04)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        pointerEvents: 'none',
        textAlign: 'left',
      }}
    >
      {image && String(image).trim() ? (
        <div
          style={{
            width: 56,
            height: 56,
            flexShrink: 0,
            borderRadius: 'var(--r-md)',
            overflow: 'hidden',
            border: '1px solid var(--border-hair)',
            background: 'var(--bg-subtle)',
          }}
        >
          <img
            src={image}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : (
        <div
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 'var(--r-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--info-light)',
            color: 'var(--info)',
            border: '1px solid var(--info-border)',
          }}
        >
          <BarChart3 size={20} strokeWidth={2.2} />
        </div>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        {headline && (
          <div
            className="overline"
            style={{
              marginBottom: 6,
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: 'var(--text-tertiary)',
            }}
          >
            {headline}
          </div>
        )}
        {statValue && (
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)',
              lineHeight: 1.1,
              color: 'var(--text-primary)',
              fontWeight: 600,
            }}
          >
            {statValue}
            {statLabel && (
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontStyle: 'normal',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginTop: 4,
                  lineHeight: 1.35,
                }}
              >
                {statLabel}
              </span>
            )}
          </div>
        )}
        {body && (
          <p
            style={{
              margin: statValue ? '0.5rem 0 0' : 0,
              fontSize: '0.72rem',
              lineHeight: 1.45,
              color: 'var(--text-secondary)',
            }}
          >
            {body}
          </p>
        )}
        {footnote && (
          <p
            style={{
              margin: '0.4rem 0 0',
              fontSize: '0.6rem',
              lineHeight: 1.35,
              color: 'var(--text-tertiary)',
              fontStyle: 'italic',
            }}
          >
            {footnote}
          </p>
        )}
      </div>
    </aside>
  );
}
