import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresentation } from '../context/PresentationContext';
import { useAuth } from '../context/AuthContext';
import { CHAPTERS } from '../data/products';
import { ENRICHED_PRODUCTS } from '../data/productPricing';
import { loadDealerSettings } from '../services/settingsService';
import { savePresentation, upsertDraft } from '../services/presentationService';
import { initSession, updateSession } from '../services/clientViewService';
import { getInterest, buildResponseV2Entry } from '../utils/responseHelpers';
import { getEnrichedById, resolvePriceCents } from '../utils/pricingResolver.js';
import { X, Clock, Keyboard, Check } from 'lucide-react';

import BreadcrumbProduct from '../components/slide/BreadcrumbProduct';
import SlideQuadrant from '../components/slide/SlideQuadrant';
import VehicleImage from '../components/slide/VehicleImage';
import HotspotChips, { HotspotDetailPanel } from '../components/slide/HotspotChips';
import DecisionBar from '../components/slide/DecisionBar';
import TierSelector from '../components/slide/TierSelector';
import Dialog from '../components/ui/Dialog';
import Button from '../components/ui/Button';
import Kbd from '../components/ui/Kbd';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import useMinimumSlideTime from '../hooks/useMinimumSlideTime';
import { currencyMonthly } from '../utils/typograph';

import PresentationSummary from './PresentationSummary';
import MenuSelling from './MenuSelling';
import WelcomeScreen from './WelcomeScreen';

const MIN_SLIDE_SECONDS = parseInt(
  typeof window !== 'undefined' ? (localStorage.getItem('ap_min_slide') || '0') : '0', 10,
) || 0;

export default function SlideDeck() {
  const navigate = useNavigate();
  const {
    vehicle, clientName, transactionType, clearSession, mode, financing, responses, setResponses,
    dealerSettingsSnapshot, setDealerSettingsSnapshot, updateResponse,
  } = usePresentation();
  const { currentUser, userProfile, isDemo } = useAuth();

  const [products]        = useState(ENRICHED_PRODUCTS);
  const [index, setIndex] = useState(0);
  const [activeHot, setActiveHot] = useState(null);
  const [saving, setSaving]       = useState(false);
  /** slides | menu | summary */
  const [postDeck, setPostDeck]   = useState(/** @type {'slides'|'menu'|'summary'} */ ('slides'));
  const [presId, setPresId]       = useState(/** @type {string|null} */ (null));
  const [showQuit, setShowQuit]   = useState(false);
  const [showHelp, setShowHelp]   = useState(false);

  const [slideTime, setSlideTime] = useState(0);
  const [timePerProd, setTimePerProd] = useState({});
  const [showWelcome, setShowWelcome] = useState(!!clientName);
  const timerRef = useRef(null);
  const draftId = useRef(`draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const sessionId = useRef(`sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  const product = products[index];
  const total   = products.length;
  const interestLevel = getInterest(responses[product?.id]);
  const percent  = Math.round(((index + 1) / total) * 100);
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  useEffect(() => {
    (async () => {
      if (!userProfile?.dealerId) return;
      const s = await loadDealerSettings(userProfile.dealerId);
      setDealerSettingsSnapshot(s);
    })();
  }, [userProfile?.dealerId, setDealerSettingsSnapshot]);

  /* ── Timer slide ── */
  useEffect(() => {
    setSlideTime(0);
    timerRef.current = setInterval(() => setSlideTime(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [index]);

  /* ── Gate temps minimum ── */
  const { fraction: gateFraction, canProceed } = useMinimumSlideTime(MIN_SLIDE_SECONDS, index);

  const saveSlideTime = useCallback(() => {
    clearInterval(timerRef.current);
    if (product) {
      setTimePerProd(prev => ({
        ...prev,
        [product.id]: (prev[product.id] || 0) + slideTime,
      }));
    }
  }, [product, slideTime]);

  const handleFinish = useCallback(async (finalResp) => {
    const resp = finalResp || responses;
    const finalTime = { ...timePerProd, [product?.id]: (timePerProd[product?.id] || 0) + slideTime };
    if (!isDemo && currentUser) {
      setSaving(true);
      try {
        const id = await savePresentation(
          currentUser.uid,
          userProfile?.dealerId || null,
          { ...(vehicle || {}), clientName: clientName || '' },
          resp,
          mode || 'live',
          finalTime,
          financing,
          null,
        );
        if (id) setPresId(id);
      } catch (e) { console.error('Save error:', e); }
      finally { setSaving(false); }
    }
    setPostDeck('menu');
  }, [responses, timePerProd, product, slideTime, isDemo, currentUser, userProfile, vehicle, clientName, mode, financing]);

  const goNext = useCallback(() => {
    if (!canProceed) return;
    saveSlideTime();
    if (index < total - 1) { setIndex(i => i + 1); setActiveHot(null); }
    else { void handleFinish(); }
  }, [canProceed, saveSlideTime, index, total, handleFinish]);

  const goPrev = useCallback(() => {
    saveSlideTime();
    if (index > 0) { setIndex(i => i - 1); setActiveHot(null); }
  }, [saveSlideTime, index]);

  const respond = useCallback((resp) => {
    if (!product) return;
    saveSlideTime();
    setResponses((prev) => {
      const prevR   = prev[product.id];
      const entry   = buildResponseV2Entry(prevR, product, resp, dealerSettingsSnapshot);
      const newResponses = { ...prev, [product.id]: entry };

      if (!isDemo && currentUser) {
        upsertDraft(draftId.current, {
          userId:   currentUser.uid,
          dealerId: userProfile?.dealerId || null,
          clientName: clientName || '',
          vehicle:  vehicle || {},
          responses:  newResponses,
          mode:       mode || 'live',
          progress:   { index: index + 1, total },
          financing:  financing || null,
        });
      }

      setTimeout(() => {
        if (index < total - 1) { setIndex((i) => i + 1); setActiveHot(null); }
        else { void handleFinish(newResponses); }
      }, 320);
      return newResponses;
    });
  }, [product, setResponses, saveSlideTime, isDemo, currentUser, userProfile, clientName, vehicle, mode, index, total, handleFinish, dealerSettingsSnapshot, financing]);

  const handleQuit = () => {
    const decided = Object.keys(responses).length;
    if (decided > 0 && decided < total) {
      setShowQuit(true);
    } else {
      clearSession();
      navigate('/dashboard');
    }
  };

  const confirmQuit = () => { clearSession(); navigate('/dashboard'); };

  /* ── Raccourcis clavier ── */
  const bindings = useMemo(() => ({
    'ArrowLeft':  () => goPrev(),
    'ArrowRight': () => goNext(),
    'v': () => respond('yes'),
    'V': () => respond('yes'),
    'r': () => respond('no'),
    'R': () => respond('no'),
    'Escape': () => setShowHelp(false),
    '?': () => setShowHelp(s => !s),
    'f': () => { if (document.fullscreenEnabled) {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    }},
  }), [goPrev, goNext, respond]);
  useKeyboardShortcuts(bindings, postDeck === 'slides' && !showQuit);

  /* ── Préchargement image véhicule ── */
  useEffect(() => {
    if (vehicle?.make && vehicle?.model) {
      const img = new Image();
      img.src = `https://cdn.imagin.studio/getimage?customer=img&make=${encodeURIComponent(vehicle.make)}&modelFamily=${encodeURIComponent(vehicle.model)}&modelYear=${vehicle.year || new Date().getFullYear()}&angle=23&width=900`;
    }
  }, [vehicle]);

  /* ── Broadcast RTDB pour ClientView (mode miroir) ── */
  useEffect(() => {
    if (!vehicle) return;
    initSession(sessionId.current, {
      vehicle, clientName: clientName || '', productIndex: 0, responses: {},
    }).catch(() => {});
  }, [vehicle, clientName]);

  useEffect(() => {
    if (!vehicle || !product) return;
    updateSession(sessionId.current, {
      productIndex: index,
      responses,
    }).catch(() => {});
  }, [vehicle, product, index, responses]);

  /* ── Welcome screen 3s ── */
  if (showWelcome && clientName) {
    return (
      <WelcomeScreen
        duration={2800}
        onComplete={() => setShowWelcome(false)}
      />
    );
  }

  if (postDeck === 'summary') {
    return (
      <PresentationSummary
        vehicle={vehicle}
        clientName={clientName}
        responses={responses}
        products={products}
        timePerProd={timePerProd}
        saving={saving}
        onQuit={confirmQuit}
      />
    );
  }
  if (postDeck === 'menu') {
    return (
      <MenuSelling
        presId={presId}
        timePerProduct={timePerProd}
        onComplete={() => setPostDeck('summary')}
        onBack={() => { clearSession(); navigate('/dashboard'); }}
      />
    );
  }
  if (!product) return null;

  const rawProductResp = responses[product.id];
  const tierIdFromResp
    = typeof rawProductResp === 'object' && rawProductResp ? rawProductResp.tierId : undefined;

  const chapter = CHAPTERS?.[product.chapter]?.label;
  const watermark = CHAPTERS?.[product.chapter]?.numeral || String(index + 1).padStart(2, '0');
  const dots = product.vehicle_dots || [];

  /* Points bullets : couleurs sémantiques */
  const riskPoints = product.risk?.points || [];
  const solutionPoints = product.solution?.points || [];

  /* Prix mensuel widget */
  const showPrice = product.monthly_price && transactionType !== 'comptant';

  return (
    <div
      className="slide-deck"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateRows: '56px 48px 1fr 96px',
        background: 'var(--bg-page)',
        color: 'var(--text-primary)',
      }}
    >
      {/* ─── Topbar 56px ─── */}
      <header
        className="topbar"
        style={{ height: 56, position: 'relative', zIndex: 2 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 'var(--fs-md)',
            color: 'var(--text-primary)',
            fontWeight: 500,
          }}>Avantage <span style={{ color: 'var(--or-700)' }}>Plus</span></span>
          <span className="topbar-divider" />
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--fs-xs)',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}>
            {clientName || 'Client anonyme'}
            <span style={{ margin: '0 0.5rem', color: 'var(--border-md)' }}>·</span>
            <span style={{ color: 'var(--text-tertiary)' }}>
              {vehicle?.year} {vehicle?.make} {vehicle?.model}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--text-tertiary)', fontSize: 'var(--fs-xs)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            <Clock size={12} /> {fmt(slideTime)}
          </div>
          <div style={{ width: 160 }}>
            <div className="progress-bar" style={{ height: 3 }}>
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
          <span style={{
            color: 'var(--text-tertiary)',
            fontSize: 'var(--fs-xs)',
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.04em',
          }}>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={<Keyboard size={14} />}
            onClick={() => setShowHelp(true)}
            aria-label="Raccourcis clavier"
          >
            <Kbd>?</Kbd>
          </Button>
          <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={handleQuit}>
            Quitter
          </Button>
        </div>
      </header>

      {/* ─── Breadcrumb 48px ─── */}
      <BreadcrumbProduct
        product={product}
        interest={interestLevel}
        chapter={chapter}
        index={index}
        total={total}
      />

      {/* ─── Quadrants (grille 2x2) ─── */}
      <div
        key={product.id}
        className="slide-grid animate-up"
        role="region"
        aria-label={`Produit ${index + 1} sur ${total} : ${product.title}`}
        aria-live="polite"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Q1 : Hook (haut-gauche) */}
        <SlideQuadrant watermark={watermark}>
          <span className="overline" style={{ marginBottom: '0.75rem' }}>
            Accroche
          </span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(1.75rem, 2.2vw, 2.125rem)',
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            color: 'var(--text-primary)',
            margin: 0,
          }}>
            {product.hook?.headline}
          </h1>
          {product.hook?.text && (
            <p style={{
              marginTop: '1rem',
              fontSize: 'clamp(1rem, 1.15vw, 1.125rem)',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              maxWidth: '52ch',
            }}>
              {product.hook.text}
            </p>
          )}

          {product.presenter_note && (
            <div
              className="presenter-note"
              style={{
                marginTop: 'auto',
                padding: '0.7rem 0.9rem',
                background: 'var(--or-100)',
                border: '1px dashed var(--border-warm)',
                borderRadius: 'var(--r-sm)',
                fontSize: 'var(--fs-xs)',
                color: 'var(--or-900)',
                lineHeight: 1.5,
                fontStyle: 'italic',
              }}
            >
              <strong style={{ fontStyle: 'normal', fontWeight: 600 }}>Note directeur —</strong>{' '}
              {product.presenter_note}
            </div>
          )}
        </SlideQuadrant>

        {/* Q2 : Véhicule (haut-droite, ANCRAGE FIXE) */}
        <SlideQuadrant variant="subtle" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0,
            position: 'relative',
          }}>
            <div style={{ width: '100%', height: '100%', maxWidth: 520, maxHeight: '100%' }}>
              <VehicleImage
                year={vehicle?.year}
                make={vehicle?.make}
                model={vehicle?.model}
                category={vehicle?.category}
                angle={23}
                width={900}
                alt={`${vehicle?.year || ''} ${vehicle?.make || ''} ${vehicle?.model || ''}`}
              />
            </div>
          </div>
          {dots.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <HotspotChips
                dots={dots}
                activeIndex={activeHot}
                onSelect={setActiveHot}
              />
            </div>
          )}
        </SlideQuadrant>

        {/* Q3 : Risque sans protection (bas-gauche) */}
        <SlideQuadrant variant="default" style={{ background: 'var(--ivoire-50)' }}>
          <span className="overline" style={{ color: 'var(--crimson-500)', marginBottom: '0.5rem' }}>
            Sans protection
          </span>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {riskPoints.map((p, i) => (
              <li
                key={i}
                className="slide-bullet"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: 'clamp(1rem, 1.2vw, 1.1875rem)',
                  lineHeight: 1.55,
                  color: 'var(--text-primary)',
                  fontVariantNumeric: 'tabular-nums',
                  animation: `fadeUp 0.4s var(--ease-out) both`,
                  animationDelay: `${60 + i * 60}ms`,
                }}
              >
                <span aria-hidden style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 22, height: 22,
                  marginTop: 4,
                  borderRadius: '50%',
                  background: 'var(--danger-light)',
                  color: 'var(--crimson-500)',
                  fontSize: 11, fontWeight: 700,
                  border: '1px solid var(--danger-border)',
                }}>×</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </SlideQuadrant>

        {/* Q4 : Solution + prix mensuel (bas-droite) */}
        <SlideQuadrant variant="default">
          {activeHot !== null && dots[activeHot] ? (
            <HotspotDetailPanel
              dot={dots[activeHot]}
              onClose={() => setActiveHot(null)}
            />
          ) : (
            <>
              <span className="overline" style={{ color: 'var(--forest-600)', marginBottom: '0.5rem' }}>
                Avec Avantage Plus
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {solutionPoints.map((p, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      fontSize: 'clamp(1rem, 1.2vw, 1.1875rem)',
                      lineHeight: 1.55,
                      color: 'var(--text-primary)',
                      animation: `fadeUp 0.4s var(--ease-out) both`,
                      animationDelay: `${60 + i * 60}ms`,
                    }}
                  >
                    <span aria-hidden style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 22, height: 22,
                      marginTop: 4,
                      borderRadius: '50%',
                      background: 'var(--brand-green-light)',
                      color: 'var(--forest-600)',
                      border: '1px solid var(--brand-green-border)',
                    }}>
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <TierSelector
                product={product}
                dealerSettings={dealerSettingsSnapshot}
                tierId={tierIdFromResp}
                onChange={(tid, gId) => {
                  const e = getEnrichedById(product.id) || product;
                  const pc = resolvePriceCents(e, dealerSettingsSnapshot, tid, gId);
                  updateResponse(product.id, { tierId: tid, priceCents: pc });
                }}
              />

              {showPrice && (
                <div style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '0.85rem 1rem',
                  borderTop: '1px solid var(--border-hair)',
                  background: 'linear-gradient(180deg, transparent, var(--or-100))',
                  borderRadius: 'var(--r-sm)',
                }}>
                  <span className="overline" style={{ marginBottom: 0, color: 'var(--or-900)' }}>
                    Estimation{transactionType === 'location' ? ' (location)' : ''}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    fontWeight: 600,
                    fontSize: 'clamp(1.5rem, 2.2vw, 2rem)',
                    color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.01em',
                  }}>
                    {currencyMonthly(product.monthly_price)}
                  </span>
                </div>
              )}
            </>
          )}
        </SlideQuadrant>
      </div>

      {/* ─── Decision bar 96px ─── */}
      <DecisionBar
        interest={interestLevel}
        onYes={() => respond('yes')}
        onNo={() => respond('no')}
        onPrev={index > 0 ? goPrev : null}
        onNext={goNext}
        canProceed={canProceed}
        isLast={index === total - 1}
        gateFraction={gateFraction}
      />

      {/* ─── Help overlay ─── */}
      <Dialog
        open={showHelp}
        onOpenChange={setShowHelp}
        title="Raccourcis clavier"
        description="Naviguez au clavier pour une présentation fluide."
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 2rem', fontSize: 'var(--fs-sm)' }}>
          <Row k="V" label="Important" />
          <Row k="R" label="Pas important" />
          <Row k="←" label="Produit précédent" />
          <Row k="→" label="Produit suivant" />
          <Row k="F" label="Plein écran" />
          <Row k="?" label="Afficher cette aide" />
          <Row k="Esc" label="Fermer" />
        </div>
      </Dialog>

      {/* ─── Confirm quit ─── */}
      <Dialog
        open={showQuit}
        onOpenChange={setShowQuit}
        title="Quitter la présentation ?"
        description={`Vous avez décidé ${Object.keys(responses).length}/${total} produits. Votre progression ne sera pas sauvegardée comme présentation complète.`}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setShowQuit(false)}>Continuer</Button>
            <Button variant="danger" onClick={confirmQuit}>Quitter</Button>
          </>
        )}
      />

      <style>{`
        @media (max-width: 960px) {
          .slide-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto auto auto auto !important;
          }
          .slide-deck .slide-grid > section {
            border-right: none !important;
            border-bottom: 1px solid var(--border-hair) !important;
          }
          .slide-deck .slide-grid > section:last-child {
            border-bottom: none !important;
          }
        }
        /* Dividers internes uniquement : Q1 (haut-gauche) et Q3 (bas-gauche) ont
           une bordure droite ; Q1 et Q2 ont une bordure basse. */
        .slide-deck .slide-grid > section:nth-child(1),
        .slide-deck .slide-grid > section:nth-child(3) {
          border-right: 1px solid var(--border-hair);
        }
        .slide-deck .slide-grid > section:nth-child(1),
        .slide-deck .slide-grid > section:nth-child(2) {
          border-bottom: 1px solid var(--border-hair);
        }
      `}</style>
    </div>
  );
}

function Row({ k, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Kbd>{k}</Kbd>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}
