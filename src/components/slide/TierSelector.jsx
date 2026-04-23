import React from 'react';
import { getEnrichedById, resolvePriceCents } from '../../utils/pricingResolver.js';
import { Money } from '../../utils/money.js';

/**
 * Paliers exclusifs (ex. groupe manufacturier vs prolongé) — un seul palier actif
 */
export default function TierSelector({ product, dealerSettings, tierId, onChange }) {
  const e = getEnrichedById(product.id) || product;
  if (e?.pricingMode !== 'tiers' || !e.tierGroups?.length) return null;

  return (
    <div
      style={{
        marginTop: 'auto',
        padding: '0.75rem 0',
        borderTop: '1px dashed var(--border-hair)',
      }}
    >
      <div
        className="overline"
        style={{ color: 'var(--forest-600)', marginBottom: '0.5rem' }}
      >
        Palier de couverture
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          fontSize: 'var(--fs-xs)',
        }}
      >
        {e.tierGroups.map((g) => (
          <div key={g.id}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>{g.label}</div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              {g.tiers.map((t) => {
                const c = resolvePriceCents(e, dealerSettings, t.id, g.id);
                const checked = tierId === t.id;
                return (
                  <label
                    key={t.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '0.3rem 0.45rem',
                      borderRadius: 'var(--r-sm)',
                      border: `1px solid ${checked ? 'var(--forest-600)' : 'var(--border-hair)'}`,
                      background: checked ? 'var(--brand-green-light)' : 'var(--bg-card)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name={`tier-${e.id}`}
                      checked={checked}
                      onChange={() => onChange(t.id, g.id)}
                    />
                    <span>{t.label}</span>
                    <span
                      style={{
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      {new Money(c).format()}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
