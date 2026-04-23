import React from 'react';

/**
 * EmptyState — état vide éditorial (aucune donnée)
 */
export default function EmptyState({ icon, title, description, action, style }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        gap: 12,
        background: 'var(--bg-canvas)',
        border: '1px dashed var(--border-md)',
        borderRadius: 'var(--r-lg)',
        ...style,
      }}
    >
      {icon && (
        <div style={{
          width: 56, height: 56, borderRadius: 'var(--r-lg)',
          background: 'var(--or-100)',
          color: 'var(--or-700)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 6,
        }}>
          {icon}
        </div>
      )}
      {title && (
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 'var(--fs-xl)',
          color: 'var(--text-primary)',
          margin: 0,
          letterSpacing: '-0.015em',
        }}>
          {title}
        </h3>
      )}
      {description && (
        <p style={{
          color: 'var(--text-secondary)',
          maxWidth: 460,
          fontSize: 'var(--fs-sm)',
          lineHeight: 1.55,
          margin: 0,
        }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
