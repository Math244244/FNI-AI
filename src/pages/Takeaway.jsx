import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicSnapshot } from '../services/presentationService';
import { getInterest } from '../utils/responseHelpers.js';
import { ENRICHED_PRODUCTS } from '../data/productPricing';
import {
  productIdsForCumulativeLevel,
  sumFinancedAddOnCentsForIds,
  displayColumnCost,
} from '../utils/menuCalculations.js';
import { Money } from '../utils/money.js';

const COL_LABELS = { essentiel: 'Essentiel', recommande: 'Recommandé', premium: 'Premium' };

/**
 * Vue distante (lecture) : même snapshot public que génère « Générer un lien de partage »
 */
export default function Takeaway() {
  const { token } = useParams();
  const [data, setData] = useState(/** @type {any} */ (null));
  const [err, setErr]     = useState(/** @type {string|null} */ (null));
  const [loading, setL]  = useState(true);

  useEffect(() => {
    (async () => {
      setL(true);
      setErr(null);
      try {
        const snap = await getPublicSnapshot(token);
        if (!snap) { setErr('Lien introuvable ou expiré.'); return; }
        setData(snap);
      } catch (e) {
        setErr('Impossible de charger la présentation.');
        console.error(e);
      } finally { setL(false); }
    })();
  }, [token]);

  if (loading) {
    return (
      <div style={wrap}>
        <p style={{ color: 'var(--text-secondary)' }}>Chargement…</p>
      </div>
    );
  }
  if (err || !data) {
    return (
      <div style={wrap}>
        <h1 style={title}>Lien de partage</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{err || 'Aucune donnée.'}</p>
      </div>
    );
  }

  const { vehicle, clientName, responses, financing, placements, dealerPricing } = data;
  const products = ENRICHED_PRODUCTS.filter((p) => getInterest(responses?.[p.id]) != null);
  const ds = dealerPricing != null ? { pricing: dealerPricing } : null;

  const threeLevels = (['essentiel', 'recommande', 'premium']).map((lvl) => {
    const ids = productIdsForCumulativeLevel(placements || {}, /** @type {any} */ (lvl));
    const add = sumFinancedAddOnCentsForIds(ids, products, responses, ds);
    const d = displayColumnCost(financing, add);
    return { lvl, d };
  });

  return (
    <div style={{ ...wrap, textAlign: 'left', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={title}>Votre dossier Avantage+</h1>
      <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)' }}>
        {clientName || 'Client'}
        {vehicle && (
          <span> · {vehicle.year} {vehicle.make} {vehicle.model}</span>
        )}
      </p>

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {threeLevels.map(({ lvl, d }) => (
          <div
            key={lvl}
            style={{
              border: '1px solid var(--border-hair)',
              borderRadius: 'var(--r-md)',
              padding:      '0.75rem 1rem',
            }}
          >
            <div className="overline" style={{ color: 'var(--text-tertiary)' }}>{COL_LABELS[lvl]}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
              {d.isPeriodic
                ? <>{new Money(d.valueCents).format()} <span style={{ fontSize: '0.7em' }}>/ versement</span></>
                : new Money(d.valueCents).format()}
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 24, fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
        Vue de lecture. Les détails doivent être confirmés en concession.
      </p>
    </div>
  );
}

const wrap = {
  minHeight:      '100vh',
  display:        'flex',
  flexDirection:  'column',
  alignItems:     'center',
  justifyContent: 'center',
  background:     'var(--bg-page)',
  padding:        '2rem',
  textAlign:      'center',
};

const title = {
  fontFamily: 'var(--font-display)',
  fontStyle:  'italic',
  fontSize:   '1.5rem',
  color:      'var(--text-primary)',
  margin:     '0 0 8px',
};
