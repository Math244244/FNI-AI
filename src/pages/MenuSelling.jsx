import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  DndContext, PointerSensor, useSensor, useSensors, pointerWithin,
  DragOverlay,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { usePresentation } from '../context/PresentationContext';
import { ENRICHED_PRODUCTS, enrichProductWithPricing } from '../data/productPricing';
import { PRODUCTS } from '../data/products';
import { buildMergedProductListFromSettings } from '../utils/dealerSettingsMerge';
import { getInterest } from '../utils/responseHelpers.js';
import {
  defaultBinaryPlacementsFromResponses,
  importantProductIds,
  sumFinancedAddOnCentsForIds,
  displayColumnCost,
  deltaVersusBase,
} from '../utils/menuCalculations.js';
import { updatePresentation, publishPublicSnapshot } from '../services/presentationService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import {
  ArrowLeft, Check, Link2, Copy, CarFront, Lock, Star, MinusCircle,
} from 'lucide-react';
import { Money } from '../utils/money.js';

const COLS = /** @type {const} */ (['important', 'pas_important']);
const COL_LABELS = {
  important:     'Important',
  pas_important: 'Pas important',
};

function DraggableCard({ id, title, dim, disabled }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      className="menu-dnd-card"
      {...attributes}
      {...listeners}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '1.15rem 1.35rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-hair)',
        borderRadius: 'var(--r-md)',
        fontSize: 'clamp(1.05rem, 1.2vw, 1.2rem)',
        fontWeight: 600,
        marginBottom: 12,
        cursor: disabled ? 'default' : 'grab',
        opacity: isDragging ? 0.35 : 1,
        transform: isDragging ? 'scale(1.01)' : 'none',
        boxShadow: isDragging ? '0 18px 40px rgba(0,0,0,0.18)' : 'var(--shadow-xs)',
        transition: 'box-shadow 0.2s var(--ease-out), border-color 0.2s var(--ease-out)',
        touchAction: 'none',
        minHeight: 64,
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: dim ? 'var(--bg-subtle)' : 'var(--or-100)',
          color: dim ? 'var(--text-tertiary)' : 'var(--or-700)',
          flexShrink: 0,
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: '1rem',
          border: `1px solid ${dim ? 'var(--border-hair)' : 'var(--or-500)'}`,
        }}
      >
        {dim ? '·' : '✓'}
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: dim ? 'var(--text-secondary)' : 'var(--text-primary)',
          letterSpacing: '-0.005em',
        }}
      >
        {title}
      </span>
    </div>
  );
}

function DropColumn({ colId, label, subtitle, accent, icon, count, children }) {
  const { isOver, setNodeRef } = useDroppable({ id: colId });
  const isImportant = colId === 'important';
  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 460,
        flex: 1,
        minWidth: 0,
        padding: '1.75rem 1.5rem 2rem',
        borderRadius: 'var(--r-xl)',
        border: isOver
          ? `2.5px solid ${accent}`
          : isImportant
            ? `1.5px solid ${accent}`
            : '1.5px solid var(--border-hair)',
        background: isImportant
          ? 'linear-gradient(180deg, var(--or-100) 0%, var(--bg-card) 40%)'
          : 'var(--bg-subtle)',
        boxShadow: isImportant ? '0 12px 32px rgba(184,147,90,0.08)' : 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s var(--ease-out), background 0.2s var(--ease-out)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
      }}>
        {icon}
        <h3 style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 'clamp(1.75rem, 2.3vw, 2.2rem)',
          color: isImportant ? 'var(--or-900)' : 'var(--text-primary)',
          letterSpacing: '-0.015em',
        }}>
          {label}
        </h3>
        <span style={{
          marginLeft: 'auto',
          fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
          fontSize: 'var(--fs-sm)',
          fontWeight: 800,
          color: isImportant ? 'var(--or-700)' : 'var(--text-tertiary)',
          background: 'var(--bg-card)',
          border: `1px solid ${isImportant ? 'var(--or-500)' : 'var(--border-hair)'}`,
          borderRadius: 999,
          padding: '4px 12px',
          minWidth: 32,
          textAlign: 'center',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {count}
        </span>
      </div>
      {subtitle && (
        <p style={{
          margin: 0,
          fontSize: 'var(--fs-sm)',
          color: 'var(--text-tertiary)',
          marginBottom: 18,
          lineHeight: 1.5,
        }}>
          {subtitle}
        </p>
      )}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {React.Children.count(children) === 0 ? (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            color: 'var(--text-tertiary)',
            fontSize: 'var(--fs-sm)',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '0 1rem',
          }}>
            Glissez un produit ici
          </div>
        ) : children}
      </div>
    </div>
  );
}

export default function MenuSelling({ presId, onComplete, onBack, timePerProduct: timePerProductProp }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    responses,
    menuState,
    setMenuState,
    financing,
    vehicle,
    clientName,
    dealerSettingsSnapshot,
    excludedProductIds,
  } = usePresentation();
  const timePerProduct = timePerProductProp;

  // Migration legacy → binaire (anciennes valeurs : essentiel/recommande/premium → important, rejet → pas_important)
  const initialPlacements = useMemo(() => {
    const src = menuState?.placements;
    if (src && Object.values(src).every((v) => v === 'important' || v === 'pas_important')) {
      return src;
    }
    if (src && Object.keys(src).length) {
      const mapped = {};
      for (const [id, v] of Object.entries(src)) {
        mapped[id] = v === 'rejet' ? 'pas_important' : 'important';
      }
      return mapped;
    }
    return defaultBinaryPlacementsFromResponses(responses);
  }, [menuState, responses]);

  const [placements, setPlacements] = useState(initialPlacements);
  const [publishing, setPub]  = useState(false);
  const [shareUrl, setShareUrl] = useState(/** @type {string|null} */ (null));
  const [sealed, setSealed]     = useState(false);
  const [activeDragId, setActiveDragId] = useState(/** @type {string|null} */ (null));
  const [publishError, setPublishError] = useState(/** @type {string|null} */ (null));

  // Resync si le contexte externe change après le montage (ex. reprise)
  const sessionKeyRef = useRef('');
  const sessionKey = useMemo(
    () => `${vehicle?.make || ''}|${vehicle?.model || ''}|${clientName || ''}`,
    [vehicle, clientName],
  );
  useEffect(() => {
    if (sessionKeyRef.current && sessionKeyRef.current !== sessionKey) {
      setPlacements(initialPlacements);
      setSealed(false);
      setShareUrl(null);
      setPublishError(null);
    }
    sessionKeyRef.current = sessionKey;
  }, [sessionKey, initialPlacements]);

  // Catalogue fusionné (incluant custom dealer) si disponible, sinon ENRICHED_PRODUCTS
  // Les produits retirés depuis la page de démarrage sont exclus.
  const excludedSet = useMemo(
    () => new Set(excludedProductIds || []),
    [excludedProductIds],
  );
  const allProducts = useMemo(() => {
    let list;
    if (dealerSettingsSnapshot) {
      const merged = buildMergedProductListFromSettings(dealerSettingsSnapshot, PRODUCTS, vehicle?.category)
        .filter((p) => p.active !== false)
        .map((p) => enrichProductWithPricing(p));
      list = merged.length ? merged : ENRICHED_PRODUCTS;
    } else {
      list = ENRICHED_PRODUCTS;
    }
    return list.filter((p) => !excludedSet.has(p.id));
  }, [dealerSettingsSnapshot, excludedSet, vehicle?.category]);

  const products = useMemo(
    () => allProducts.filter((p) => getInterest(responses[p.id]) != null),
    [allProducts, responses],
  );

  // S'assure que chaque produit présent ait une placement (par défaut : important si yes/maybe, sinon pas_important)
  const placementsComplete = useMemo(() => {
    const out = { ...placements };
    products.forEach((p) => {
      if (!out[p.id]) {
        const l = getInterest(responses[p.id]);
        out[p.id] = l === 'no' ? 'pas_important' : 'important';
      }
    });
    return out;
  }, [placements, products, responses]);

  const byCol = useMemo(() => {
    const m = { important: [], pas_important: [] };
    products.forEach((p) => {
      const c = placementsComplete[p.id] || 'pas_important';
      if (m[c]) m[c].push(p);
    });
    return m;
  }, [placementsComplete, products]);

  const importantIds = useMemo(
    () => importantProductIds(placementsComplete),
    [placementsComplete],
  );

  const importantAddOnCents = useMemo(
    () => sumFinancedAddOnCentsForIds(importantIds, products, responses, dealerSettingsSnapshot, vehicle?.category),
    [importantIds, products, responses, dealerSettingsSnapshot, vehicle?.category],
  );

  const totalDisplay = useMemo(
    () => displayColumnCost(financing, importantAddOnCents),
    [financing, importantAddOnCents],
  );

  const delta = useMemo(
    () => deltaVersusBase(financing, importantAddOnCents),
    [financing, importantAddOnCents],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const onDragStart = useCallback((e) => {
    setActiveDragId(String(e.active?.id || ''));
  }, []);

  const onDragEnd = useCallback((e) => {
    setActiveDragId(null);
    const { active, over } = e;
    if (!over) return;
    const pid = String(active.id);
    setPlacements((prev) => {
      let colId = String(over.id);
      if (!COLS.includes(/** @type {any} */ (colId)) && prev[colId] != null) {
        colId = prev[colId];
      }
      if (!COLS.includes(/** @type {any} */ (colId))) return prev;
      return { ...prev, [pid]: /** @type {any} */ (colId) };
    });
  }, []);

  const onDragCancel = useCallback(() => setActiveDragId(null), []);

  const toggle = useCallback((pid) => {
    if (sealed) return;
    setPlacements((prev) => ({
      ...prev,
      [pid]: (prev[pid] || placementsComplete[pid]) === 'important' ? 'pas_important' : 'important',
    }));
  }, [sealed, placementsComplete]);

  const seal = async () => {
    if (sealed) return;
    const menuFinal = {
      placements: { ...placementsComplete },
      importantIds: [...importantIds],
      addonCents: importantAddOnCents,
      paymentCents: totalDisplay.isPeriodic ? totalDisplay.valueCents : null,
      sealedAt: Date.now(),
    };
    setSealed(true);
    setMenuState(menuFinal);
    if (presId) {
      try { await updatePresentation(presId, { menuFinal }); }
      catch (e) { console.error(e); }
    }
    onComplete?.(menuFinal);
    if (onComplete == null) {
      navigate('/dashboard', { replace: true });
    }
  };

  const back = onBack || (() => {
    setMenuState({ placements: { ...placementsComplete } });
    navigate('/dashboard');
  });

  const makeShareLink = async () => {
    if (!currentUser) return;
    setPub(true);
    setShareUrl(null);
    setPublishError(null);
    try {
      const token = crypto.randomUUID();
      const origin = window.location?.origin || '';
      // Snapshot minimal du catalogue effectivement utilisé (dealer merged)
      const productsSnapshot = products.map((p) => ({
        id: p.id,
        title: p.title,
        icon: p.icon || null,
        chapter: p.chapter || null,
        isCustom: !!p.isCustom,
        pricingMode: p.pricingMode || null,
        defaultPriceCents: p.defaultPriceCents || null,
        tiers: Array.isArray(p.tiers) ? p.tiers : null,
        taxable: p.taxable !== false,
        financed: p.financed !== false,
      }));
      await publishPublicSnapshot(token, {
        vehicle:       vehicle || {},
        clientName:    clientName || '',
        responses,
        financing,
        timePerProduct: timePerProduct || {},
        placements:    { ...placementsComplete },
        dealerPricing: dealerSettingsSnapshot?.pricing || null,
        productsSnapshot,
        createdBy:     currentUser.uid,
        presId:        presId || null,
      });
      setShareUrl(`${origin}/t/${token}`);
    } catch (e) {
      console.error('[MenuSelling] publishPublicSnapshot:', e);
      setPublishError('Impossible de générer le lien. Réessayez dans un instant.');
    } finally { setPub(false); }
  };

  const activeProduct = activeDragId
    ? products.find((p) => p.id === activeDragId)
    : null;

  if (products.length === 0) {
    return (
      <div
        className="animate-in"
        style={{
          minHeight:      '100vh',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          background:     'var(--bg-page)',
          padding:        '2rem',
          textAlign:      'center',
          gap:            '1.25rem',
        }}
      >
        <CarFront size={40} color="var(--or-500)" strokeWidth={1.2} style={{ opacity: 0.85 }} />
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontStyle:  'italic',
          fontSize:   '1.4rem',
          fontWeight: 500,
          margin:     0,
          maxWidth:   400,
          lineHeight: 1.35,
        }}>
          Aucune présentation en cours
        </h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)', maxWidth: 400, margin: 0 }}>
          Lancez d’abord une présentation depuis le tableau de bord, ou complétez le parcours véhicule et slides
          pour alimenter le menu.
        </p>
        <Button variant="primary" onClick={() => navigate('/select-vehicle')}>
          Choisir un véhicule
        </Button>
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          Tableau de bord
        </Button>
      </div>
    );
  }

  return (
    <div
      className="animate-in"
      style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: 'clamp(1.25rem, 2.5vw, 2.25rem)' }}
    >
      <div style={{ maxWidth: 1600, margin: '0 auto' }}>
        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 20,
        }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <span
              style={{
                display: 'inline-block',
                color: 'var(--or-500)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              Étape finale · Menu client
            </span>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontStyle:  'italic',
              fontSize:   'clamp(2.25rem, 3.2vw, 3.25rem)',
              fontWeight: 500,
              margin:     '0.35rem 0 0',
              letterSpacing: '-0.022em',
              lineHeight: 1.1,
            }}>
              Bâtissez la transaction avec le client
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: 'clamp(1rem, 1.15vw, 1.15rem)',
              margin: '0.75rem 0 0',
              maxWidth: 720,
              lineHeight: 1.55,
            }}>
              Déplacez chaque produit entre <strong>Important</strong> et <strong>Pas important</strong>.
              Le paiement se met à jour en direct.
            </p>
          </div>
          <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={back}>
            Retour
          </Button>
        </div>

        {/* ── Bandeau Signature · Total LIVE ── */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            marginBottom: 28,
            padding: 'clamp(1.5rem, 2.2vw, 2.2rem) clamp(1.5rem, 2.5vw, 2.25rem)',
            background: 'linear-gradient(135deg, #0E0E11 0%, #1C1C22 55%, #0E0E11 100%)',
            borderRadius: 'var(--r-xl)',
            border: '1px solid rgba(184,147,90,0.18)',
            color: '#F7F4EE',
            boxShadow: '0 30px 70px rgba(0,0,0,0.28)',
          }}
        >
          {/* Halo doré */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '-40%',
              right: '-10%',
              width: 480,
              height: 480,
              background: 'radial-gradient(circle, rgba(184,147,90,0.22) 0%, transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }}
          />
          {/* Filet doré signature */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, var(--or-500) 30%, var(--or-500) 70%, transparent)',
              opacity: 0.8,
            }}
          />

          {/* Ligne 1 : client + véhicule */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 18,
              paddingBottom: 16,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <CarFront size={18} color="var(--or-500)" />
              <span
                style={{
                  fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                  fontWeight: 700,
                  fontSize: 'var(--fs-md)',
                  letterSpacing: '-0.005em',
                  color: '#fff',
                }}
              >
                {vehicle?.year} {vehicle?.make} {vehicle?.model}
              </span>
              {clientName && (
                <>
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: 'var(--fs-md)',
                      color: 'rgba(255,255,255,0.85)',
                    }}
                  >
                    {clientName}
                  </span>
                </>
              )}
            </div>
            <span
              style={{
                fontSize: '10.5px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--or-500)',
                fontWeight: 700,
              }}
            >
              Signature · Avantage Plus
            </span>
          </div>

          {/* Ligne 2 : métriques */}
          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
              alignItems: 'flex-end',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(247,244,238,0.6)',
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Paiement total estimé
              </div>
              <div
                style={{
                  fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(2.4rem, 4.2vw, 3.4rem)',
                  lineHeight: 1,
                  letterSpacing: '-0.025em',
                  color: '#fff',
                  fontVariantNumeric: 'tabular-nums',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <span>{new Money(totalDisplay.valueCents).format()}</span>
                {totalDisplay.isPeriodic && (
                  <span style={{
                    fontSize: '0.38em',
                    color: 'rgba(247,244,238,0.55)',
                    fontWeight: 500,
                    letterSpacing: 0,
                  }}>
                    / versement
                  </span>
                )}
              </div>
              {delta != null && (
                <div style={{
                  marginTop: 8,
                  fontSize: 'var(--fs-sm)',
                  color: delta > 0 ? 'var(--or-500)' : 'rgba(247,244,238,0.55)',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 600,
                  letterSpacing: '-0.003em',
                }}>
                  {delta >= 0 ? '+' : ''}
                  {(delta / 100).toFixed(2)} $ vs paiement de base
                </div>
              )}
            </div>

            <div>
              <div
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(247,244,238,0.6)',
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Produits retenus
              </div>
              <div
                style={{
                  fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                  fontWeight: 800,
                  fontSize: '2.2rem',
                  lineHeight: 1,
                  letterSpacing: '-0.015em',
                  color: '#fff',
                  fontVariantNumeric: 'tabular-nums',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 6,
                }}
              >
                {importantIds.length}
                <span style={{
                  fontSize: '1rem',
                  color: 'rgba(247,244,238,0.5)',
                  fontWeight: 500,
                }}>
                  / {products.length}
                </span>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(247,244,238,0.6)',
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Ajouté au financement
              </div>
              <div
                style={{
                  fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
                  fontWeight: 800,
                  fontSize: '1.9rem',
                  lineHeight: 1,
                  letterSpacing: '-0.015em',
                  color: '#fff',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {new Money(importantAddOnCents).format()}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
              <Button
                variant="primary"
                size="md"
                icon={<Lock size={14} />}
                onClick={seal}
                disabled={sealed}
              >
                {sealed ? 'Choix scellé' : 'Sceller le menu'}
              </Button>
            </div>
          </div>
        </div>

        {/* ── 2 colonnes DnD ── */}
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <div
            className="menu-2col-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 28,
              marginBottom: 28,
            }}
          >
            <DropColumn
              colId="important"
              label="Important"
              subtitle="Produits retenus · impactent le paiement affiché"
              accent="var(--or-500)"
              count={byCol.important.length}
              icon={<Star size={18} color="var(--or-700)" strokeWidth={2} />}
            >
              {byCol.important.map((p) => (
                <div
                  key={p.id}
                  onDoubleClick={() => toggle(p.id)}
                  title="Double-cliquez pour déplacer"
                >
                  <DraggableCard
                    id={p.id}
                    title={p.title}
                    disabled={sealed}
                  />
                </div>
              ))}
            </DropColumn>

            <DropColumn
              colId="pas_important"
              label="Pas important"
              subtitle="Produits écartés · aucun impact sur le paiement"
              accent="var(--border-md)"
              count={byCol.pas_important.length}
              icon={<MinusCircle size={18} color="var(--text-tertiary)" strokeWidth={1.8} />}
            >
              {byCol.pas_important.map((p) => (
                <div
                  key={p.id}
                  onDoubleClick={() => toggle(p.id)}
                  title="Double-cliquez pour déplacer"
                >
                  <DraggableCard
                    id={p.id}
                    title={p.title}
                    dim
                    disabled={sealed}
                  />
                </div>
              ))}
            </DropColumn>
          </div>

          <DragOverlay dropAnimation={{ duration: 180 }}>
            {activeProduct ? (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--or-500)',
                  borderRadius: 'var(--r-md)',
                  fontWeight: 600,
                  boxShadow: '0 18px 48px rgba(0,0,0,0.22)',
                  minWidth: 240,
                }}
              >
                {activeProduct.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* ── Partage ── */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
          padding: '1rem 0 0',
          borderTop: '1px solid var(--border-hair)',
        }}>
          <Button
            size="sm"
            variant="secondary"
            icon={<Link2 size={14} />}
            onClick={makeShareLink}
            disabled={publishing}
          >
            {publishing ? 'Génération…' : 'Générer un lien client'}
          </Button>
          {shareUrl && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              flex: 1, minWidth: 0, flexWrap: 'wrap',
            }}>
              <span style={{
                fontSize: 'var(--fs-xs)',
                color: 'var(--forest-600)',
                wordBreak: 'break-all',
                flex: 1, minWidth: 0,
              }}>
                {shareUrl}
              </span>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                icon={<Copy size={14} />}
                onClick={() => { void navigator.clipboard.writeText(shareUrl); }}
              >
                Copier
              </Button>
            </div>
          )}
          {publishError && (
            <span role="alert" style={{
              fontSize: 'var(--fs-xs)',
              color: 'var(--crimson-500)',
              fontWeight: 500,
            }}>
              {publishError}
            </span>
          )}
          {sealed && (
            <span style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--forest-600)',
              fontSize: 'var(--fs-sm)',
              fontWeight: 500,
            }}>
              <Check size={14} /> Choix scellé
            </span>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .menu-2col-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
