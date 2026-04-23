import React, { forwardRef } from 'react';

/**
 * Card — surface editoriale
 * variant: default | hover | elevated | bordered | glass
 */
const Card = forwardRef(function Card(
  { variant = 'default', padding = 'md', children, className = '', style, onClick, ...rest },
  ref,
) {
  const padStyle = {
    none: 0,
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '2.5rem',
  }[padding];

  const variantStyle = {
    default: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-hair)',
      boxShadow: 'var(--shadow-xs)',
    },
    hover: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-hair)',
      boxShadow: 'var(--shadow-xs)',
      cursor: 'pointer',
      transition: 'var(--tx-slow)',
    },
    elevated: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-hair)',
      boxShadow: 'var(--shadow-lg)',
    },
    bordered: {
      background: 'transparent',
      border: '1px solid var(--border-md)',
    },
    glass: {
      background: 'var(--surface-glass)',
      border: '1px solid var(--border-hair)',
      backdropFilter: 'var(--backdrop-blur)',
      WebkitBackdropFilter: 'var(--backdrop-blur)',
      boxShadow: 'var(--shadow-sm)',
    },
  }[variant];

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        borderRadius: 'var(--r-lg)',
        padding: padStyle,
        ...variantStyle,
        ...style,
      }}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
});

export default Card;
