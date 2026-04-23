import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresentation } from '../context/PresentationContext';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS, CHAPTERS } from '../data/products';
import { ENRICHED_PRODUCTS, enrichProductWithPricing } from '../data/productPricing';
import { buildMergedProductListFromSettings } from '../utils/dealerSettingsMerge';
import { loadDealerSettings } from '../services/settingsService';
import VehicleImage from '../components/slide/VehicleImage';
import Button from '../components/ui/Button';
import {
  Play, ChevronDown, ChevronLeft, ListChecks, Check, X as XIcon,
  EyeOff, RotateCcw,
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

  // Charge les settings dealer et construit la liste fusionnée (même logique que SlideDeck)
  useEffect(() => {
    (async () => {
      if (!userProfile?.dealerId) {
        setProducts(ENRICHED_PRODUCTS);
        return;
      }
      const s = await loadDealerSettings(userProfile.dealerId);
      setDealerSettingsSnapshot(s);
      const merged = buildMergedProductListFromSettings(s, PRODUCTS)
        .filter((p) => p.active !== false)
        .map((p) => enrichProductWithPricing(p));
      if (merged.length) setProducts(merged);
    })();
  }, [userProfile?.dealerId, setDealerSettingsSnapshot]);

  // Fermeture du dropdown au clic à l'extérieur
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const excludedSet = useMemo(
    () => new Set(excludedProductIds || []),
    [excludedProductIds],
  );
  const activeCount = products.length - excludedSet.size;

  const start = () => navigate('/presentation');

  // Entrée = débuter
  useEffect(() => {
    const onKey = (e) => {
      if (menuOpen) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        start();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  const firstName = (clientName || '').trim().split(' ')[0];

  // Regroupement par chapitre pour le dropdown
  const productsByChapter = useMemo(() => {
    const groups = {};
    products.forEach((p) => {
      const chap = p.chapter || 'autre';
      if (!groups[chap]) groups[chap] = [];
      groups[chap].push(p);
    });
    return groups;
  }, [products]);

  const chapterOrder = Object.keys(CHAPTERS)
    .sort((a, b) => (CHAPTERS[a].order || 99) - (CHAPTERS[b].order || 99));

  const transLabel = transactionType === 'location'
    ? 'Location'
    : transactionType === 'comptant'
      ? 'Comptant'
      : 'Financement';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0E0E11 0%, #1A1A1F 45%, #12120F 100%)',
        color: 'var(--ivoire-100)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Watermark */}
      <span aria-hidden style={{
        position: 'absolute',
        top: '-0.15em',
        left: '-0.1em',
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: 'clamp(400px, 60vw, 900px)',
        lineHeight: 0.85,
        color: 'rgba(184, 147, 90, 0.06)',
        letterSpacing: '-0.05em',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>A+</span>

      {/* Topbar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          gap: '1rem',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronLeft size={14} />}
          onClick={() => navigate('/select-vehicle')}
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Reconfigurer
        </Button>

        <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'var(--fs-md)',
              letterSpacing: '-0.02em',
              color: '#fff',
            }}
          >
            Avantage <span style={{ fontStyle: 'italic', color: 'var(--or-500)' }}>Plus</span>
          </span>
        </div>

        {/* Dropdown "Sélection" */}
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
              border: `1px solid ${menuOpen ? 'var(--or-500)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 'var(--r-md)',
              color: '#fff',
              fontSize: 'var(--fs-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--tx)',
            }}
          >
            <ListChecks size={15} />
            Sélection
            <span style={{
              padding: '2px 8px',
              borderRadius: 999,
              background: excludedSet.size > 0 ? 'rgba(220,48,48,0.22)' : 'rgba(184,147,90,0.25)',
              color: excludedSet.size > 0 ? '#ff9a9a' : 'var(--or-500)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}>
              {activeCount}/{products.length}
            </span>
            <ChevronDown
              size={14}
              style={{ transition: 'transform 0.15s', transform: menuOpen ? 'rotate(180deg)' : 'none' }}
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
                animation: 'ap-start-dropdown 0.14s var(--ease-out)',
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
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'rgba(255,255,255,0.55)', marginTop: 4, lineHeight: 1.4 }}>
                    Cliquez un produit pour le retirer de la présentation (par ex. s’il a déjà été vendu).
                    Les produits retirés ne seront ni présentés au client, ni comptés dans le menu final.
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
                  return (
                    <div key={chapId} style={{ padding: '0.4rem 0' }}>
                      <div
                        style={{
                          padding: '0.35rem 1rem 0.2rem',
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: 'rgba(255,255,255,0.45)',
                          fontWeight: 700,
                        }}
                      >
                        {CHAPTERS[chapId]?.label || 'Autre'}
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
                              padding: '0.55rem 1rem',
                              background: 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'background 0.15s',
                              color: excluded ? 'rgba(255,255,255,0.4)' : '#fff',
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
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 22,
                                height: 22,
                                borderRadius: 5,
                                border: `1.5px solid ${excluded ? 'rgba(255,255,255,0.25)' : 'var(--or-500)'}`,
                                background: excluded ? 'transparent' : 'var(--or-500)',
                                color: excluded ? 'rgba(255,255,255,0.4)' : '#1a1a1f',
                                flexShrink: 0,
                                transition: 'all 0.15s',
                              }}
                            >
                              {excluded ? <XIcon size={12} /> : <Check size={14} strokeWidth={3} />}
                            </span>
                            <span style={{
                              flex: 1,
                              fontSize: 'var(--fs-sm)',
                              fontWeight: 600,
                              textDecoration: excluded ? 'line-through' : 'none',
                            }}>
                              {p.title}
                            </span>
                            {excluded && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  fontSize: '10px',
                                  color: '#ff9a9a',
                                  fontWeight: 700,
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                <EyeOff size={10} /> Retiré
                              </span>
                            )}
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

      {/* Body : 2 colonnes (texte / véhicule) */}
      <main
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 42fr) minmax(0, 58fr)',
          alignItems: 'center',
          gap: '2rem',
          padding: '1rem 3rem 6rem',
          position: 'relative',
          zIndex: 1,
        }}
        className="start-grid"
      >
        <div style={{ minWidth: 0 }}>
          <span className="overline" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1rem', display: 'block' }}>
            Présentation · {transLabel}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(2.4rem, 4.6vw, 4.2rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: '#fff',
              margin: 0,
              animation: 'ap-fade-in 900ms var(--ease-out) both',
            }}
          >
            {firstName
              ? <>Bienvenue, <br />{firstName}.</>
              : <>Prêt à<br /> commencer ?</>}
          </h1>

          {vehicle?.make && (
            <p
              style={{
                marginTop: '1.25rem',
                fontSize: 'var(--fs-lg)',
                color: 'rgba(255,255,255,0.78)',
                maxWidth: 520,
                lineHeight: 1.5,
                animation: 'ap-fade-in 1100ms 150ms var(--ease-out) both',
              }}
            >
              Découvrez ensemble les protections recommandées pour votre{' '}
              <strong style={{ color: '#fff' }}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </strong>.
            </p>
          )}

          <div
            style={{
              marginTop: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
              animation: 'ap-fade-in 1300ms 300ms var(--ease-out) both',
            }}
          >
            <button
              type="button"
              onClick={start}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '1.1rem 2.2rem',
                background: 'linear-gradient(135deg, var(--or-500), var(--or-700))',
                border: 'none',
                borderRadius: 'var(--r-lg)',
                color: '#1a1a1f',
                fontSize: 'var(--fs-md)',
                fontWeight: 700,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                boxShadow: '0 18px 40px rgba(184,147,90,0.35)',
                transition: 'transform 0.15s var(--ease-out), box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 24px 50px rgba(184,147,90,0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 18px 40px rgba(184,147,90,0.35)';
              }}
            >
              <Play size={18} fill="currentColor" />
              Débuter la présentation
            </button>

            <div
              style={{
                fontSize: 'var(--fs-xs)',
                color: 'rgba(255,255,255,0.55)',
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
                background: 'rgba(220, 48, 48, 0.1)',
                border: '1px solid rgba(220, 48, 48, 0.35)',
                borderRadius: 'var(--r-md)',
                fontSize: 'var(--fs-xs)',
                color: 'rgba(255,200,200,0.85)',
                lineHeight: 1.5,
                maxWidth: 520,
                animation: 'ap-fade-in 400ms var(--ease-out) both',
              }}
            >
              <strong style={{ color: '#ffb8b8' }}>Produits retirés :</strong>{' '}
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
            animation: 'ap-fade-in 1400ms 400ms var(--ease-out) both',
          }}
        >
          {vehicle?.make ? (
            <div
              style={{
                width: '100%',
                maxWidth: 780,
                filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.55))',
              }}
            >
              <VehicleImage
                year={vehicle.year}
                make={vehicle.make}
                model={vehicle.model}
                category={vehicle.category}
                angle={23}
                width={1600}
              />
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
              Aucun véhicule sélectionné
            </div>
          )}
        </div>
      </main>

      <footer
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '0.8rem 1.5rem 1.2rem',
          textAlign: 'center',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.38)',
          letterSpacing: '0.06em',
        }}
      >
        Astuce · Appuyez sur <kbd style={{ padding: '2px 6px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, fontFamily: 'inherit' }}>Entrée</kbd> pour débuter
      </footer>

      <style>{`
        @keyframes ap-fade-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ap-start-dropdown {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 900px) {
          .start-grid {
            grid-template-columns: 1fr !important;
            padding: 1rem 1.5rem 5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
