import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicSnapshot } from '../services/presentationService';
import { getInterest } from '../utils/responseHelpers.js';
import { ENRICHED_PRODUCTS } from '../data/productPricing';
import {
  importantProductIds,
  sumFinancedAddOnCentsForIds,
  displayColumnCost,
  productFinancedValueCents,
} from '../utils/menuCalculations.js';
import { Money } from '../utils/money.js';
import { Star, MinusCircle } from 'lucide-react';

/**
 * Vue distante (lecture) : snapshot public généré depuis le menu selling
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

  const {
    vehicle,
    clientName,
    responses,
    financing,
    placements: rawPlacements,
    dealerPricing,
    productsSnapshot,
  } = data;

  // Source de vérité : snapshot de catalogue publié par le vendeur.
  // Sinon on recompose à partir d'ENRICHED_PRODUCTS + toutes les clés `responses`
  // pour que les produits custom ne disparaissent pas.
  const catalog = Array.isArray(productsSnapshot) && productsSnapshot.length
    ? productsSnapshot
    : [
        ...ENRICHED_PRODUCTS,
        ...Object.keys(responses || {})
          .filter((id) => !ENRICHED_PRODUCTS.some((p) => p.id === id))
          .map((id) => ({ id, title: id, icon: null, isCustom: true })),
      ];
  const products = catalog.filter((p) => getInterest(responses?.[p.id]) != null);
  const ds = dealerPricing != null ? { pricing: dealerPricing } : null;

  // Migration legacy (essentiel/recommande/premium/rejet → important/pas_important)
  const placements = {};
  Object.entries(rawPlacements || {}).forEach(([id, v]) => {
    placements[id] = v === 'important' || v === 'pas_important'
      ? v
      : (v === 'rejet' ? 'pas_important' : 'important');
  });
  products.forEach((p) => {
    if (!placements[p.id]) {
      const l = getInterest(responses?.[p.id]);
      placements[p.id] = l === 'no' ? 'pas_important' : 'important';
    }
  });

  const importantIds = importantProductIds(placements);
  const importantProducts = products.filter((p) => placements[p.id] === 'important');
  const rejectedProducts = products.filter((p) => placements[p.id] !== 'important');

  const addOnCents = sumFinancedAddOnCentsForIds(importantIds, products, responses, ds, vehicle?.category);
  const d = displayColumnCost(financing, addOnCents);

  return (
    <div style={{ ...wrap, textAlign: 'left', alignItems: 'stretch' }}>
      <div style={{ maxWidth: 780, width: '100%', margin: '0 auto' }}>
        <h1 style={title}>Votre dossier Avantage+</h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)', margin: 0 }}>
          {clientName || 'Client'}
          {vehicle && (
            <span> · {vehicle.year} {vehicle.make} {vehicle.model}</span>
          )}
        </p>

        {/* Total héros */}
        <div style={{
          marginTop: 24,
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--r-lg)',
          background: 'linear-gradient(135deg, #0e0e11 0%, #1c1c22 100%)',
          color: '#f7f4ee',
        }}>
          <div className="overline" style={{ color: 'rgba(247,244,238,0.55)' }}>
            Paiement total estimé
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            marginTop: 4,
          }}>
            {new Money(d.valueCents).format()}
            {d.isPeriodic && (
              <span style={{
                fontSize: 'var(--fs-md)',
                color: 'rgba(247,244,238,0.55)',
                fontWeight: 500,
                fontStyle: 'normal',
                marginLeft: 8,
              }}>
                / versement
              </span>
            )}
          </div>
        </div>

        {/* 2 colonnes ─ Important / Pas important */}
        <div style={{
          marginTop: 24,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }} className="takeaway-grid">
          <Column
            icon={<Star size={16} color="var(--or-700)" />}
            title="Important"
            items={importantProducts}
            responses={responses}
            ds={ds}
            categoryKey={vehicle?.category}
          />
          <Column
            icon={<MinusCircle size={16} color="var(--text-tertiary)" />}
            title="Pas important"
            items={rejectedProducts}
            responses={responses}
            ds={ds}
            categoryKey={vehicle?.category}
            dim
          />
        </div>

        <p style={{ marginTop: 24, fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)' }}>
          Vue de lecture. Les détails doivent être confirmés en concession.
        </p>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .takeaway-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Column({ icon, title, items, responses, ds, dim, categoryKey }) {
  return (
    <div style={{
      border: '1px solid var(--border-hair)',
      borderRadius: 'var(--r-md)',
      background: dim ? 'var(--bg-subtle)' : 'var(--bg-card)',
      padding: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {icon}
        <h3 style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: '1.05rem',
          fontWeight: 500,
          color: dim ? 'var(--text-secondary)' : 'var(--text-primary)',
        }}>
          {title}
        </h3>
        <span style={{
          marginLeft: 'auto',
          fontSize: 'var(--fs-xs)',
          color: 'var(--text-tertiary)',
          fontVariantNumeric: 'tabular-nums',
        }}>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-tertiary)', fontStyle: 'italic', margin: 0 }}>
          Aucun produit
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((p) => {
            const unit = productFinancedValueCents(p, responses?.[p.id], ds, undefined, categoryKey);
            return (
              <li
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border-hair)',
                  fontSize: 'var(--fs-sm)',
                  color: dim ? 'var(--text-tertiary)' : 'var(--text-primary)',
                }}
              >
                <span>{p.title}</span>
                <span style={{
                  fontVariantNumeric: 'tabular-nums',
                  color: dim ? 'var(--text-tertiary)' : 'var(--or-900)',
                  fontWeight: 500,
                }}>
                  {new Money(unit).format()}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const wrap = {
  minHeight:      '100vh',
  display:        'flex',
  flexDirection:  'column',
  alignItems:     'center',
  justifyContent: 'flex-start',
  background:     'var(--bg-page)',
  padding:        '2rem 1.5rem',
};

const title = {
  fontFamily: 'var(--font-display)',
  fontStyle:  'italic',
  fontSize:   '1.75rem',
  color:      'var(--text-primary)',
  margin:     '0 0 8px',
  letterSpacing: '-0.015em',
};
