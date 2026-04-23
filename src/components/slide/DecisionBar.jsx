import React from 'react';
import { ThumbsUp, ThumbsDown, ChevronLeft, Check } from 'lucide-react';
import Kbd from '../ui/Kbd';

/**
 * DecisionBar — 2 gros boutons binaires Important / Pas important.
 * Le bouton "Suivant" a été retiré afin de forcer le vendeur/client à
 * prendre une décision sur chaque produit avant de passer au suivant.
 * interest: 'yes' | 'no' | undefined
 */
export default function DecisionBar({
  interest,
  onYes,
  onNo,
  onPrev,
  gateFraction = 1,
}) {
  return (
    <div
      style={{
        height: 108,
        padding: '0 2rem',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-hair)',
        display: 'grid',
        gridTemplateColumns: '180px 1fr 180px',
        alignItems: 'center',
        gap: 20,
        position: 'relative',
      }}
    >
      {/* Gate progress bar (haut) */}
      {gateFraction < 1 && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'var(--graphite-100)',
          }}
        >
          <div
            style={{
              width: `${gateFraction * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--or-700), var(--or-500))',
              transition: 'width 120ms linear',
            }}
          />
        </div>
      )}

      {/* Gauche : Prev (seul élément restant à gauche) */}
      <button
        onClick={onPrev}
        disabled={!onPrev}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '0.75rem 1.1rem',
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-md)',
          borderRadius: 'var(--r-md)',
          fontSize: 'var(--fs-sm)',
          fontWeight: 500,
          cursor: onPrev ? 'pointer' : 'not-allowed',
          opacity: onPrev ? 1 : 0.35,
          transition: 'var(--tx)',
          justifySelf: 'start',
        }}
      >
        <ChevronLeft size={16} /> Précédent
      </button>

      {/* Centre : 2 gros boutons de décision (OBLIGATOIRES) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 22,
          maxWidth: 820,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <BigDecisionButton
          kind="no"
          active={interest === 'no'}
          onClick={onNo}
          label="Pas important"
          shortcut="R"
          icon={<ThumbsDown size={22} />}
        />
        <BigDecisionButton
          kind="yes"
          active={interest === 'yes'}
          onClick={onYes}
          label="Important"
          shortcut="V"
          icon={<ThumbsUp size={22} />}
        />
      </div>

      {/* Droite : hint discret (pas de bouton Suivant) */}
      <div
        aria-hidden
        style={{
          justifySelf: 'end',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textAlign: 'right',
          lineHeight: 1.4,
          maxWidth: 160,
        }}
      >
        Choisissez<br />
        pour continuer
      </div>
    </div>
  );
}

function BigDecisionButton({ kind, active, onClick, label, shortcut, icon }) {
  const isYes = kind === 'yes';
  const bgActive = isYes ? 'var(--forest-600)' : 'var(--crimson-600)';
  const bgIdle   = isYes ? 'transparent'       : 'transparent';
  const borderC  = isYes ? 'var(--forest-600)' : 'var(--crimson-600)';
  const txtActive = '#fff';
  const txtIdle   = isYes ? 'var(--forest-600)' : 'var(--crimson-600)';
  const shadowActive = isYes ? 'var(--shadow-green)' : 'var(--shadow-red-lg)';

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${label} (${shortcut})`}
      style={{
        height: 84,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: '0 1.5rem',
        background: active ? bgActive : bgIdle,
        color: active ? txtActive : txtIdle,
        border: `2px solid ${borderC}`,
        borderRadius: 'var(--r-lg)',
        fontSize: 'clamp(1.05rem, 1.25vw, 1.25rem)',
        fontWeight: 700,
        letterSpacing: '0.005em',
        cursor: 'pointer',
        boxShadow: active ? shadowActive : 'none',
        transition: 'var(--tx)',
        transform: active ? 'translateY(-1px)' : 'none',
      }}
    >
      <span aria-hidden style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 46,
        height: 46,
        borderRadius: '50%',
        background: active ? 'rgba(255,255,255,0.18)' : (isYes ? 'var(--decision-yes-light)' : 'var(--decision-no-light)'),
      }}>
        {active ? <Check size={24} /> : icon}
      </span>
      <span>{label}</span>
      <Kbd
        style={{
          marginLeft: 'auto',
          background: active ? 'rgba(255,255,255,0.12)' : 'var(--bg-subtle)',
          borderColor: active ? 'rgba(255,255,255,0.2)' : 'var(--border-md)',
          color: active ? 'rgba(255,255,255,0.9)' : 'var(--text-tertiary)',
        }}
      >
        {shortcut}
      </Kbd>
    </button>
  );
}
