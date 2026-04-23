import React from 'react';

export default function Kbd({ children, style, ...rest }) {
  return (
    <kbd
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 22,
        height: 22,
        padding: '0 6px',
        borderRadius: 'var(--r-xs)',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-md)',
        borderBottomWidth: 2,
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.72rem',
        fontWeight: 600,
        ...style,
      }}
      {...rest}
    >
      {children}
    </kbd>
  );
}
