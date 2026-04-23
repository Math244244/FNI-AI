import React from 'react';

/**
 * Badge — couleur sémantique
 * tone: gold | red | green | amber | blue | gray | dark
 */
export default function Badge({ tone = 'gray', children, icon, style, ...rest }) {
  const map = {
    gold:  { bg: 'var(--or-100)',           color: 'var(--or-900)',      bd: 'var(--border-warm)' },
    red:   { bg: 'var(--danger-light)',     color: 'var(--crimson-500)', bd: 'var(--danger-border)' },
    green: { bg: 'var(--brand-green-light)',color: 'var(--forest-600)',  bd: 'var(--brand-green-border)' },
    amber: { bg: 'var(--warning-light)',    color: 'var(--warning)',     bd: 'var(--warning-border)' },
    blue:  { bg: 'var(--info-light)',       color: 'var(--info)',        bd: 'var(--info-border)' },
    gray:  { bg: 'var(--graphite-100)',     color: 'var(--graphite-600)',bd: 'var(--graphite-200)' },
    dark:  { bg: 'var(--graphite-900)',     color: 'var(--ivoire-100)',  bd: 'var(--graphite-900)' },
  }[tone];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.25rem 0.6rem',
        borderRadius: 'var(--r-full)',
        fontSize: 'var(--fs-2xs)',
        fontWeight: 600,
        letterSpacing: '0.02em',
        background: map.bg,
        color: map.color,
        border: `1px solid ${map.bd}`,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}
