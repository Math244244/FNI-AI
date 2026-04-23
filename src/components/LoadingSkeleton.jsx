import React from 'react';

/** Skeleton — loading state prestige */
export function Skeleton({ width = '100%', height = 16, style, rounded = 'sm' }) {
  const r = {
    sm: 'var(--r-sm)',
    md: 'var(--r-md)',
    lg: 'var(--r-lg)',
    full: 'var(--r-full)',
  }[rounded] || 'var(--r-sm)';
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius: r,
        display: 'inline-block',
        ...style,
      }}
    />
  );
}

export function SkeletonText({ lines = 3, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={12}
          width={i === lines - 1 ? '62%' : '100%'}
        />
      ))}
    </div>
  );
}

export default function LoadingSkeleton({ label = 'Chargement…' }) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 18,
    }}>
      <div style={{
        width: 36, height: 36,
        border: '2.5px solid var(--graphite-200)',
        borderTopColor: 'var(--or-700)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{
        color: 'var(--text-tertiary)',
        fontSize: 'var(--fs-sm)',
        letterSpacing: '0.03em',
      }}>{label}</span>
    </div>
  );
}
