import React from 'react';
import { ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Kbd from '../ui/Kbd';

/**
 * DecisionBar — 2 gros boutons binaires Important / Pas important + Prev/Next ghost.
 * interest: 'yes' | 'no' | undefined
 * canProceed: true si le gate de temps min est passé (pour unlock la navigation)
 */
export default function DecisionBar({
  interest,
  onYes,
  onNo,
  onPrev,
  onNext,
  canProceed = true,
  isLast = false,
  gateFraction = 1,
}) {
  return (
    <div
      style={{
        height: 96,
        padding: '0 2rem',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-hair)',
        display: 'grid',
        gridTemplateColumns: '160px 1fr 160px',
        alignItems: 'center',
        gap: 16,
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

      {/* Gauche : Prev */}
      <button
        onClick={onPrev}
        disabled={!onPrev}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '0.7rem 1rem',
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

      {/* Centre : 2 gros boutons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 18,
          maxWidth: 720,
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
          icon={<ThumbsDown size={20} />}
        />
        <BigDecisionButton
          kind="yes"
          active={interest === 'yes'}
          onClick={onYes}
          label="Important"
          shortcut="V"
          icon={<ThumbsUp size={20} />}
        />
      </div>

      {/* Droite : Next */}
      <button
        onClick={onNext}
        disabled={!canProceed}
        title={canProceed ? '' : 'Patientez le temps minimum par produit…'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '0.7rem 1rem',
          background: canProceed ? 'var(--graphite-900)' : 'var(--graphite-200)',
          color: canProceed ? 'var(--ivoire-100)' : 'var(--graphite-400)',
          border: 'none',
          borderRadius: 'var(--r-md)',
          fontSize: 'var(--fs-sm)',
          fontWeight: 600,
          cursor: canProceed ? 'pointer' : 'not-allowed',
          boxShadow: canProceed ? 'var(--shadow-sm)' : 'none',
          transition: 'var(--tx)',
          justifySelf: 'end',
        }}
      >
        {isLast ? 'Terminer' : 'Suivant'} <ChevronRight size={16} />
      </button>
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
        height: 72,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '0 1.25rem',
        background: active ? bgActive : bgIdle,
        color: active ? txtActive : txtIdle,
        border: `2px solid ${borderC}`,
        borderRadius: 'var(--r-lg)',
        fontSize: 'var(--fs-md)',
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
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: active ? 'rgba(255,255,255,0.18)' : (isYes ? 'var(--decision-yes-light)' : 'var(--decision-no-light)'),
      }}>
        {active ? <Check size={22} /> : icon}
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
