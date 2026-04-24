import React from 'react';
import { getEnrichedById, resolvePriceCents } from '../../utils/pricingResolver.js';

/**
 * Paliers exclusifs (ex. groupe manufacturier vs prolongé) — un seul palier actif.
 * Les prix ne sont JAMAIS affichés au client : le vendeur sélectionne la durée
 * qui convient, le prix associé est stocké dans les réponses mais reste caché ici.
 */
export default function TierSelector({ product, dealerSettings, tierId, onChange, categoryKey }) {
  if (!product) return null;
  // Priorité au produit passé en prop (déjà merged / dealercustom). Fallback catalogue enrichi.
  const e = product.pricingMode === 'tiers' && product.tierGroups?.length
    ? product
    : (getEnrichedById(product.id) || product);
  if (e?.pricingMode !== 'tiers' || !e.tierGroups?.length) return null;

  return (
    <div
      style={{
        marginTop: 'auto',
        padding: '1rem 0 0.5rem',
        borderTop: '1px dashed var(--border-hair)',
      }}
    >
      <div
        className="overline"
        style={{
          color: 'var(--forest-600)',
          marginBottom: '0.75rem',
          fontSize: 'clamp(0.8rem, 0.95vw, 0.95rem)',
          letterSpacing: '0.1em',
        }}
      >
        Palier de couverture
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        {e.tierGroups.map((g) => (
          <div key={g.id}>
            <div
              style={{
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 8,
                fontSize: 'clamp(0.95rem, 1.05vw, 1.1rem)',
              }}
            >
              {g.label}
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              {g.tiers.map((t) => {
                // Le prix reste stocké côté state mais n'est exposé nulle part sur le DOM.
                // (pas d'attribut data-* pour éviter toute fuite côté écran client)
                void resolvePriceCents(e, dealerSettings, t.id, g.id, categoryKey);
                const checked = tierId === t.id;
                return (
                  <label
                    key={t.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '0.55rem 0.9rem',
                      borderRadius: 'var(--r-md)',
                      border: `1.5px solid ${checked ? 'var(--forest-600)' : 'var(--border-hair)'}`,
                      background: checked ? 'var(--brand-green-light)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      fontSize: 'clamp(0.95rem, 1.05vw, 1.1rem)',
                      fontWeight: checked ? 700 : 500,
                      color: checked ? 'var(--forest-600)' : 'var(--text-primary)',
                      transition: 'var(--tx)',
                    }}
                  >
                    <input
                      type="radio"
                      name={`tier-${e.id}`}
                      checked={checked}
                      onChange={() => onChange(t.id, g.id)}
                      style={{ accentColor: 'var(--forest-600)' }}
                    />
                    <span>{t.label}</span>
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
