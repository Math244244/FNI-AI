import React from 'react';
import { ENRICHED_PRODUCTS, enrichProductWithPricing } from '../../data/productPricing';
import { resolvePriceCents, enrichCustomProductForPricing, resolveCustomProductPriceCents } from '../../utils/pricingResolver';

/**
 * @param {object} props
 * @param {Array<object>} props.products — liste ordonnée (depuis Settings)
 * @param {object} props.pricing — dealerSettings.pricing
 * @param {function} props.onChange — (nextPricing) => void
 */
export default function PricingPanel({ products, pricing, onChange }) {
  const dealer = { pricing: pricing || {} };

  const setFixed = (productId, dollarsStr) => {
    const trimmed = String(dollarsStr || '').trim();
    // Vide → on efface l'override (reprise du montant de référence catalogue)
    if (trimmed === '') {
      const next = { ...(pricing || {}) };
      const existing = next[productId];
      if (existing) {
        const { defaultPriceCents: _d, ...rest } = existing;
        if (Object.keys(rest).length === 0) delete next[productId];
        else next[productId] = rest;
      }
      onChange(next);
      return;
    }
    const n = parseFloat(trimmed.replace(',', '.'));
    if (Number.isNaN(n)) return;
    onChange({
      ...(pricing || {}),
      [productId]: { ...(pricing?.[productId] || {}), defaultPriceCents: Math.round(n * 100) },
    });
  };

  const setTier = (productId, groupId, tierId, dollarsStr) => {
    const trimmed = String(dollarsStr || '').trim();
    const prevG = pricing?.[productId]?.tierGroups || {};
    if (trimmed === '') {
      const g = { ...(prevG[groupId] || {}) };
      delete g[tierId];
      const nextGroups = { ...prevG };
      if (Object.keys(g).length === 0) delete nextGroups[groupId];
      else nextGroups[groupId] = g;
      onChange({
        ...(pricing || {}),
        [productId]: { ...(pricing?.[productId] || {}), tierGroups: nextGroups },
      });
      return;
    }
    const n = parseFloat(trimmed.replace(',', '.'));
    if (Number.isNaN(n)) return;
    const g = { ...(prevG[groupId] || {}) };
    g[tierId] = Math.round(n * 100);
    onChange({
      ...(pricing || {}),
      [productId]: {
        ...(pricing?.[productId] || {}),
        tierGroups: { ...prevG, [groupId]: g },
      },
    });
  };

  return (
    <div className="animate-in">
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Prix par défaut de la concession (catalogue Avantage Plus + paliers de garantie). Laissez un champ
        vide pour reprendre le montant de référence.
      </p>
      {products.map((p) => {
        const e = ENRICHED_PRODUCTS.find((x) => x.id === p.id)
          || (p.isCustom ? enrichCustomProductForPricing(p) : enrichProductWithPricing(p));
        if (e.pricingMode === 'none' && !p.isCustom) return null;
        if (e.pricingMode === 'tiers' && e.tierGroups) {
          return (
            <div key={e.id} className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{e.icon}</span> {e.title} <span className="badge badge-navy" style={{ fontSize: '0.65rem' }}>Paliers</span>
              </div>
              {e.tierGroups.map((g) => (
                <div key={g.id} style={{ marginBottom: '0.75rem' }}>
                  <div className="section-label" style={{ marginBottom: '0.35rem' }}>{g.label}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                    {g.tiers.map((t) => {
                      const c = resolvePriceCents(e, dealer, t.id, g.id) / 100;
                      return (
                        <label key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{t.label}</span>
                          <input
                            className="form-input"
                            type="text"
                            inputMode="decimal"
                            defaultValue={String(c)}
                            key={`${e.id}-${g.id}-${t.id}-${c}`}
                            onBlur={(ev) => setTier(e.id, g.id, t.id, ev.target.value)}
                            style={{ fontSize: '0.8125rem' }}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        const cents = p.isCustom
          ? resolveCustomProductPriceCents(e, dealer)
          : resolvePriceCents(e, dealer, null, null);
        const d = (cents / 100).toFixed(2);
        return (
          <div key={e.id} className="card" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{e.icon}</span>
            <div style={{ flex: 1, fontWeight: 600, fontSize: '0.875rem' }}>{e.title}</div>
            <div style={{ width: 120 }}>
              <label className="form-label" style={{ marginBottom: 4 }}>Prix (CAD $)</label>
              <input
                className="form-input"
                type="text"
                inputMode="decimal"
                defaultValue={d}
                key={`${e.id}-fixed-${d}`}
                onBlur={(ev) => setFixed(e.id, ev.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
            {p.isCustom && (
              <span className="badge badge-blue" style={{ flexShrink: 0 }}>Personnalisé</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
