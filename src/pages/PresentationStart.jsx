import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresentation } from '../context/PresentationContext';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS, CHAPTERS } from '../data/products';
import { ENRICHED_PRODUCTS, enrichProductWithPricing } from '../data/productPricing';
import { buildMergedProductListFromSettings } from '../utils/dealerSettingsMerge';
import { loadDealerSettings } from '../services/settingsService';
import VehicleImage from '../components/slide/VehicleImage';
import {
  Play, ChevronDown, ChevronLeft, ListChecks, Check, X as XIcon,
  RotateCcw,
} from 'lucide-react';

/**
 * Page d'accueil de présentation.
 * Affiche le véhicule en grand + un CTA « Débuter ».
 * Permet au vendeur, via un menu déroulant « Sélection », d'exclure
 * les produits déjà vendus pour éviter le over-selling.
 */
export default function PresentationStart() {
  const navigate = useNavigate();
  const {
    vehicle, clientName, transactionType,
    excludedProductIds, toggleExcludedProduct, setExcludedProductIds,
    setDealerSettingsSnapshot,
  } = usePresentation();
  const { userProfile } = useAuth();

  const [products, setProducts] = useState(ENRICHED_PRODUCTS);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Garde-fou : pas de véhicule → retour à la sélection
  useEffect(() => {
    if (!vehicle || !vehicle.make) {
      navigate('/select-vehicle', { replace: true });
    }
  }, [vehicle, navigate]);

  // Charge les settings dealer et construit la liste fusionnée
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!userProfile?.dealerId) {
          if (!cancelled) setProducts(ENRICHED_PRODUCTS);
          return;
        }
        const s = await loadDealerSettings(userProfile.dealerId);
        if (cancelled) return;
        setDealerSettingsSnapshot(s);
        const merged = buildMergedProductListFromSettings(s, PRODUCTS)
          .filter((p) => p.active !== false)
          .map((p) => enrichProductWithPricing(p));
        if (merged.length) setProducts(merged);
      } catch (e) {
        // Si les settings échouent, on garde la liste enrichie par défaut
        if (!cancelled) setProducts(ENRICHED_PRODUCTS);
      }
    })();
    return () => { cancelled = true; };
  }, [userProfile?.dealerId, setDealerSettingsSnapshot]);

  // Fermeture du dropdown au clic extérieur
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen]);

  const excludedSet = useMemo(() => {
    const known = new Set(products.map((p) => p.id));
    // N'exclure que les IDs qui existent toujours dans le catalogue, sinon
    // le compteur peut devenir négatif et le filtre muet.
    return new Set((excludedProductIds || []).filter((id) => known.has(id)));
  }, [excludedProductIds, products]);
  const activeCount = Math.max(0, products.length - excludedSet.size);

  const start = () => navigate('/presentation');

  const firstName = (clientName || '').trim().split(' ')[0];

  const productsByChapter = useMemo(() => {
    const groups = {};
    products.forEach((p) => {
      const chap = p.chapter || 'autre';
      if (!groups[chap]) groups[chap] = [];
      groups[chap].push(p);
    });
    return groups;
  }, [products]);

  const chapterOrder = useMemo(() => {
    const known = Object.keys(CHAPTERS);
    const orderedKnown = known.sort(
      (a, b) => (CHAPTERS[a].order || 99) - (CHAPTERS[b].order || 99),
    );
    // Ajoute d'éventuels chapitres orphelins (custom dealer ou catalogue non déclaré)
    const presentKeys = Object.keys(productsByChapter);
    const orphans = presentKeys.filter((k) => !orderedKnown.includes(k));
    return [...orderedKnown, ...orphans];
  }, [productsByChapter]);

  const transLabel = transactionType === 'location'
    ? 'Location'
    : transactionType === 'comptant'
      ? 'Comptant'
      : 'Financement';

  if (!vehicle || !vehicle.make) {
    // Évite un flash noir pendant la redirection
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(155deg, #14141A 0%, #1F1F27 50%, #14141A 100%)',
        color: '#F5EFE2',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Bandeau du haut */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          gap: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
          zIndex: 3,
          background: 'rgba(0,0,0,0.15)',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/select-vehicle')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '0.45rem 0.8rem',
            borderRadius: 'var(--r-md)',
            color: 'rgba(255,255,255,0.75)',
            fontSize: 'var(--fs-xs)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={14} /> Reconfigurer
        </button>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'var(--fs-md)',
              letterSpacing: '-0.01em',
              color: '#fff',
            }}
          >
            Avantage <span style={{ fontStyle: 'italic', color: 'var(--or-500)' }}>Plus</span>
          </span>
        </div>

        {/* Dropdown « Sélection » */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0.55rem 0.9rem',
              background: 'rgba(255,255,255,0.08)',
              border: `1px solid ${menuOpen ? 'var(--or-500)' : 'rgba(255,255,255,0.18)'}`,
              borderRadius: 'var(--r-md)',
              color: '#fff',
              fontSize: 'var(--fs-sm)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <ListChecks size={15} />
            Sélection
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 999,
                background: excludedSet.size > 0 ? 'rgba(220,48,48,0.22)' : 'rgba(184,147,90,0.25)',
                color: excludedSet.size > 0 ? '#ff9a9a' : 'var(--or-500)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {activeCount}/{products.length}
            </span>
            <ChevronDown
              size={14}
              style={{
                transition: 'transform 0.15s',
                transform: menuOpen ? 'rotate(180deg)' : 'none',
              }}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: 380,
                maxHeight: '70vh',
                overflow: 'auto',
                background: 'rgba(20,20,24,0.97)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 'var(--r-lg)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                zIndex: 50,
              }}
            >
              <div
                style={{
                  padding: '0.9rem 1rem',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: '#fff' }}>
                    Ajuster la présentation
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--fs-xs)',
                      color: 'rgba(255,255,255,0.6)',
                      marginTop: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    Cliquez un produit pour le retirer (ex. déjà vendu). Il ne sera ni
                    présenté, ni compté dans le menu final.
                  </div>
                </div>
                {excludedSet.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setExcludedProductIds([])}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      padding: '0.3rem 0.55rem',
                      fontSize: '11px',
                      borderRadius: 'var(--r-sm)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      whiteSpace: 'nowrap',
                    }}
                    title="Rétablir tous les produits"
                  >
                    <RotateCcw size={11} /> Tout rétablir
                  </button>
                )}
              </div>

              <div style={{ padding: '0.35rem 0' }}>
                {chapterOrder.map((chapId) => {
                  const list = productsByChapter[chapId];
                  if (!list || list.length === 0) return null;
                  const chap = CHAPTERS[chapId];
                  return (
                    <div key={chapId} style={{ padding: '0.4rem 0' }}>
                      <div
                        style={{
                          padding: '0.4rem 1rem',
                          fontSize: '10px',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.45)',
                          fontWeight: 700,
                        }}
                      >
                        {chap?.title || chapId}
                      </div>
                      {list.map((p) => {
                        const excluded = excludedSet.has(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleExcludedProduct(p.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              width: '100%',
                              textAlign: 'left',
                              background: 'transparent',
                              border: 'none',
                              padding: '0.55rem 1rem',
                              color: excluded ? 'rgba(255,255,255,0.45)' : '#fff',
                              fontSize: 'var(--fs-sm)',
                              fontWeight: 500,
                              cursor: 'pointer',
                              textDecoration: excluded ? 'line-through' : 'none',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <span
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                border: `1.5px solid ${excluded ? 'rgba(255,154,154,0.7)' : 'var(--or-500)'}`,
                                background: excluded ? 'transparent' : 'var(--or-500)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: excluded ? '#ff9a9a' : '#1a1a1f',
                                flexShrink: 0,
                              }}
                            >
                              {excluded ? <XIcon size={11} /> : <Check size={12} />}
                            </span>
                            <span style={{ flex: 1 }}>{p.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Corps : 2 colonnes (texte / véhicule) */}
      <main
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 44fr) minmax(0, 56fr)',
          alignItems: 'center',
          gap: '2rem',
          padding: 'clamp(1.5rem, 3vw, 3rem) clamp(1.5rem, 4vw, 4rem)',
          position: 'relative',
          zIndex: 1,
        }}
        className="start-grid"
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '11px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--or-500)',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            Présentation · {transLabel}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(2.2rem, 4.2vw, 3.8rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: '#fff',
              margin: 0,
            }}
          >
            {firstName ? <>Bienvenue, <br />{firstName}.</> : <>Prêt à<br />commencer ?</>}
          </h1>

          <p
            style={{
              marginTop: '1.25rem',
              fontSize: 'var(--fs-lg)',
              color: 'rgba(255,255,255,0.82)',
              maxWidth: 520,
              lineHeight: 1.5,
            }}
          >
            Découvrez ensemble les protections recommandées pour votre{' '}
            <strong style={{ color: '#fff' }}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </strong>.
          </p>

          <div
            style={{
              marginTop: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={start}
              autoFocus
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '1.1rem 2.4rem',
                background: 'linear-gradient(135deg, var(--or-500), var(--or-700))',
                border: 'none',
                borderRadius: 'var(--r-lg)',
                color: '#1a1a1f',
                fontSize: 'var(--fs-md)',
                fontWeight: 800,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                boxShadow: '0 18px 40px rgba(184,147,90,0.35)',
                transition: 'transform 0.15s var(--ease-out), box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 24px 50px rgba(184,147,90,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 18px 40px rgba(184,147,90,0.35)';
              }}
            >
              <Play size={20} fill="currentColor" />
              Débuter la présentation
            </button>

            <div
              style={{
                fontSize: 'var(--fs-xs)',
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.04em',
              }}
            >
              {activeCount} produit{activeCount > 1 ? 's' : ''} prévu{activeCount > 1 ? 's' : ''}
              {excludedSet.size > 0 && (
                <>
                  {' '}·{' '}
                  <span style={{ color: '#ff9a9a', fontWeight: 600 }}>
                    {excludedSet.size} retiré{excludedSet.size > 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          </div>

          {excludedSet.size > 0 && (
            <div
              style={{
                marginTop: '1.25rem',
                padding: '0.75rem 1rem',
                background: 'rgba(220,48,48,0.1)',
                border: '1px solid rgba(220,48,48,0.35)',
                borderRadius: 'var(--r-md)',
                fontSize: 'var(--fs-xs)',
                color: 'rgba(255,200,200,0.85)',
                lineHeight: 1.5,
                maxWidth: 560,
              }}
            >
              <strong style={{ color: '#ffb8b8' }}>Produits retirés : </strong>
              {products
                .filter((p) => excludedSet.has(p.id))
                .map((p) => p.title)
                .join(' · ')}
            </div>
          )}
        </div>

        {/* Véhicule en grand */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 760,
              aspectRatio: '16 / 10',
              filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.55))',
            }}
          >
            <VehicleImage
              year={vehicle.year}
              make={vehicle.make}
              model={vehicle.model}
              category={vehicle.category}
              angle={23}
              width={1400}
            />
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .start-grid {
            grid-template-columns: 1fr !important;
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
