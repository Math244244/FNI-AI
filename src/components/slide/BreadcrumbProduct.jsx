import React from 'react';
import getIcon from '../../utils/productIcons';
import Badge from '../ui/Badge';

/**
 * BreadcrumbProduct — bandeau 48px avec chapitre, icône produit et titre Inter 20/700
 * + badge état décision
 */
export default function BreadcrumbProduct({ product, interest, chapter, index, total }) {
  if (!product) return null;
  const Icon = getIcon(product.iconName || 'Shield');

  const badge =
    interest === 'yes' ? { tone: 'green', label: 'Important' } :
    interest === 'no'  ? { tone: 'red',   label: 'Pas important' } :
    null;

  return (
    <div
      style={{
        height: 48,
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'var(--bg-page)',
        borderBottom: '1px solid var(--border-hair)',
      }}
    >
      {chapter && (
        <>
          <span className="overline" style={{ marginBottom: 0, color: 'var(--text-tertiary)' }}>
            {chapter}
          </span>
          <span style={{ color: 'var(--border-md)' }}>·</span>
        </>
      )}
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28, height: 28,
        borderRadius: 'var(--r-sm)',
        background: 'var(--graphite-50)',
        color: 'var(--text-primary)',
      }}>
        <Icon size={15} />
      </span>
      <h2 style={{
        fontSize: 'var(--fs-lg)',
        fontWeight: 700,
        letterSpacing: '-0.005em',
        color: 'var(--text-primary)',
        margin: 0,
      }}>
        {product.title}
      </h2>
      {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
      <span style={{ flex: 1 }} />
      <span style={{
        fontSize: 'var(--fs-xs)',
        color: 'var(--text-tertiary)',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.06em',
      }}>
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
}
