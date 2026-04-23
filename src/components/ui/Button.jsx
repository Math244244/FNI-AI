import React, { forwardRef } from 'react';

/**
 * Button — variantes prestige
 * variant: primary | secondary | ghost | accent | success | danger | outline | icon
 * size: sm | md | lg | xl
 */
const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconRight,
    children,
    className = '',
    disabled,
    style,
    type = 'button',
    ...rest
  },
  ref,
) {
  const sizePx = {
    sm: { py: '0.45rem', px: '0.9rem', fs: 'var(--fs-xs)', gap: '0.35rem' },
    md: { py: '0.7rem',  px: '1.25rem', fs: 'var(--fs-sm)', gap: '0.45rem' },
    lg: { py: '0.9rem',  px: '1.5rem',  fs: 'var(--fs-base)', gap: '0.55rem' },
    xl: { py: '1.1rem',  px: '2rem',    fs: 'var(--fs-md)',   gap: '0.6rem' },
  }[size];

  const variantStyles = {
    primary: {
      background: 'var(--graphite-900)',
      color: 'var(--ivoire-100)',
      border: '1px solid var(--graphite-900)',
      boxShadow: 'var(--shadow-sm)',
    },
    secondary: {
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-md)',
      boxShadow: 'var(--shadow-xs)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
    },
    accent: {
      background: 'linear-gradient(135deg, var(--or-700), var(--or-500))',
      color: 'var(--graphite-900)',
      border: 'none',
      boxShadow: 'var(--shadow-gold)',
      fontWeight: 700,
    },
    success: {
      background: 'var(--forest-600)',
      color: '#fff',
      border: 'none',
      boxShadow: 'var(--shadow-green)',
    },
    danger: {
      background: 'var(--crimson-600)',
      color: '#fff',
      border: 'none',
      boxShadow: 'var(--shadow-red)',
    },
    outline: {
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-md)',
    },
    icon: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-hair)',
      width: 36, height: 36, padding: 0,
    },
  }[variant];

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizePx.gap,
    padding: variant === 'icon' ? 0 : `${sizePx.py} ${sizePx.px}`,
    borderRadius: 'var(--r-md)',
    fontSize: sizePx.fs,
    fontWeight: variantStyles.fontWeight ?? 600,
    fontFamily: 'var(--font-body)',
    letterSpacing: '0.005em',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'var(--tx)',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    ...variantStyles,
    ...style,
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      style={baseStyle}
      data-variant={variant}
      data-size={size}
      className={className}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden
          style={{
            width: 14, height: 14, borderRadius: '50%',
            border: '2px solid currentColor', borderTopColor: 'transparent',
            animation: 'spin 0.7s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : icon}
      {children}
      {iconRight}
    </button>
  );
});

export default Button;
