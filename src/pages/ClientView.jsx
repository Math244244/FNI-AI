import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { subscribeSession } from '../services/clientViewService';
import { ENRICHED_PRODUCTS } from '../data/productPricing';
import { getInterest } from '../utils/responseHelpers.js';
import VehicleImage from '../components/slide/VehicleImage';
import { Check } from 'lucide-react';

/**
 * ClientView — vue plein écran synchronisée avec le directeur F&I.
 * Pas de notes directeur, pas de boutons : affichage pur pour le client.
 */
export default function ClientView() {
  const { sessionId } = useParams();
  const [state, setState] = useState(null);
  const [syncError, setSyncError] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    let unsub;
    try {
      unsub = subscribeSession(sessionId, (val) => {
        setState(val);
        setSyncError(false);
      });
    } catch (e) {
      console.error('[ClientView] subscribe error:', e);
      setSyncError(true);
    }
    return () => { if (unsub) unsub(); };
  }, [sessionId]);

  if (syncError) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #0E0E11, #1A1A1F)',
        color: 'var(--ivoire-100)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Synchronisation indisponible
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            Veuillez patienter pendant que votre conseiller rétablit la connexion.
          </p>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #0E0E11, #1A1A1F)',
        color: 'var(--ivoire-100)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          letterSpacing: '-0.02em',
          color: '#fff',
        }}>
          En attente de votre conseiller…
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '1rem' }}>
          La présentation commencera dans un instant.
        </p>
      </div>
    );
  }

  const {
    vehicle,
    clientName,
    productIndex = 0,
    productId = null,
    productSnapshot = null,
    responses = {},
  } = state;

  // Priorité : snapshot envoyé par le vendeur (catalogue dealer merged)
  // puis productId dans le catalogue enrichi, puis fallback sur l'index.
  const product = productSnapshot
    || (productId ? ENRICHED_PRODUCTS.find((p) => p.id === productId) : null)
    || ENRICHED_PRODUCTS[productIndex]
    || ENRICHED_PRODUCTS[0];
  const interest = getInterest(responses[product?.id]);
  if (!product) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      display: 'grid',
      gridTemplateRows: '60px 1fr',
      color: 'var(--text-primary)',
    }}>
      <header style={{
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-hair)',
        background: 'var(--bg-card)',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'var(--fs-lg)',
        }}>
          Avantage <span style={{ color: 'var(--or-700)' }}>Plus</span>
        </span>
        <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>
          {clientName ? `${clientName} · ` : ''}{vehicle?.year} {vehicle?.make} {vehicle?.model}
        </span>
      </header>
      <main
        aria-live="polite"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          overflow: 'hidden',
        }}
      >
        <section style={{ padding: '2.5rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="overline">Accroche</span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(2rem, 3vw, 2.75rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}>
            {product.hook?.headline}
          </h1>
          <p style={{ marginTop: '1rem', fontSize: 'var(--fs-md)', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            {product.hook?.text}
          </p>
        </section>
        <section style={{ background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <VehicleImage
            year={vehicle?.year}
            make={vehicle?.make}
            model={vehicle?.model}
            category={vehicle?.category}
          />
        </section>
        <section style={{ padding: '2.5rem 3rem', background: 'var(--ivoire-50)' }}>
          <span className="overline" style={{ color: 'var(--crimson-500)' }}>Sans protection</span>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
            {(product.risk?.points || []).map((p, i) => (
              <li key={i} style={{ padding: '0.5rem 0', fontSize: 'var(--fs-md)', lineHeight: 1.5 }}>
                — {p}
              </li>
            ))}
          </ul>
        </section>
        <section style={{ padding: '2.5rem 3rem' }}>
          <span className="overline" style={{ color: 'var(--forest-600)' }}>Avec Avantage Plus</span>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
            {(product.solution?.points || []).map((p, i) => (
              <li key={i} style={{ padding: '0.5rem 0', fontSize: 'var(--fs-md)', lineHeight: 1.5, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Check size={14} color="var(--forest-600)" /> {p}
              </li>
            ))}
          </ul>
          {interest && (
            <div style={{
              marginTop: '1.5rem',
              padding: '0.5rem 0.8rem',
              borderRadius: 'var(--r-sm)',
              fontSize: 'var(--fs-xs)',
              fontWeight: 600,
              display: 'inline-block',
              background: interest === 'yes' ? 'var(--brand-green-light)' : 'var(--danger-light)',
              color: interest === 'yes' ? 'var(--forest-600)' : 'var(--crimson-500)',
              border: `1px solid ${interest === 'yes' ? 'var(--brand-green-border)' : 'var(--danger-border)'}`,
            }}>
              {interest === 'yes' ? 'Décision : Important' : 'Décision : Pas important'}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
