import React from 'react';

/**
 * SlideQuadrant — wrapper générique pour un des 4 quadrants.
 * Offre : padding prestige, filigrane optionnel, fond optionnel.
 */
export default function SlideQuadrant({
  children,
  watermark,
  variant = 'default',
  style,
  ...rest
}) {
  const variantStyles =
    variant === 'dark'
      ? { background: 'var(--graphite-900)', color: 'var(--ivoire-100)' }
      : variant === 'subtle'
      ? { background: 'var(--bg-subtle)' }
      : variant === 'transparent'
      ? { background: 'transparent' }
      : { background: 'var(--bg-card)' };

  return (
    <section
      {...rest}
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '2rem 2.5rem',
        ...variantStyles,
        ...style,
      }}
    >
      {watermark && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: '-0.35em',
            right: '-0.1em',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(96px, 12vw, 160px)',
            lineHeight: 1,
            color: variant === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(14,14,17,0.035)',
            pointerEvents: 'none',
            userSelect: 'none',
            letterSpacing: '-0.04em',
          }}
        >
          {watermark}
        </span>
      )}
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </section>
  );
}
