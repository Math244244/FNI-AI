import React, { useState, useMemo, useCallback } from 'react';
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
  productFinancedValueCents,
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

function DraggableCard({ id, title, price, dim, disabled }) {
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
        justifyContent: 'space-between',
        gap: 12,
        padding: '0.85rem 1rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-hair)',
        borderRadius: 'var(--r-md)',
        fontSize: 'var(--fs-md)',
        fontWeight: 500,
        marginBottom: 10,
        cursor: disabled ? 'default' : 'grab',
        opacity: isDragging ? 0.35 : 1,
        transform: isDragging ? 'scale(1.01)' : 'none',
        boxShadow: isDragging ? '0 18px 40px rgba(0,0,0,0.18)' : 'var(--shadow-xs)',
        transition: 'box-shadow 0.2s var(--ease-out), border-color 0.2s var(--ease-out)',
        touchAction: 'none',
      }}
    >
      <span style={{
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: dim ? 'var(--text-secondary)' : 'var(--text-primary)',
      }}>
        {title}
      </span>
      {price != null && (
        <span style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: 'var(--fs-sm)',
          color: dim ? 'var(--text-tertiary)' : 'var(--or-900)',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}>
          {new Money(price).format()}
        </span>
      )}
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
        minHeight: 320,
        flex: 1,
        minWidth: 0,
        padding: '1rem 1rem 1.25rem',
        borderRadius: 'var(--r-lg)',
        border: isOver
          ? `2px solid ${accent}`
          : isImportant
            ? `1px solid ${accent}`
            : '1px solid var(--border-hair)',
        background: isImportant
          ? 'linear-gradient(180deg, var(--or-100) 0%, var(--bg-card) 50%)'
          : 'var(--bg-subtle)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s var(--ease-out), background 0.2s var(--ease-out)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
      }}>
        {icon}
        <h3 style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: '1.35rem',
          color: isImportant ? 'var(--or-900)' : 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          {label}
        </h3>
        <span style={{
          marginLeft: 'auto',
          fontSize: 'var(--fs-xs)',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-hair)',
          borderRadius: 999,
          padding: '2px 8px',
        }}>
          {count}
        </span>
      </div>
      {subtitle && (
        <p style={{
          margin: 0,
          fontSize: 'var(--fs-xs)',
          color: 'var(--text-tertiary)',
          marginBottom: 14,
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
            minHeight: 160,
            color: 'var(--text-tertiary)',
            fontSize: 'var(--fs-xs)',
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

  // Catalogue fusionné (incluant custom dealer) si disponible, sinon ENRICHED_PRODUCTS
  // Les produits retirés depuis la page de démarrage sont exclus.
  const excludedSet = useMemo(
    () => new Set(excludedProductIds || []),
    [excludedProductIds],
  );
  const allProducts = useMemo(() => {
    let list;
    if (dealerSettingsSnapshot) {
      const merged = buildMergedProductListFromSettings(dealerSettingsSnapshot, PRODUCTS)
        .filter((p) => p.active !== false)
        .map((p) => enrichProductWithPricing(p));
      list = merged.length ? merged : ENRICHED_PRODUCTS;
    } else {
      list = ENRICHED_PRODUCTS;
    }
    return list.filter((p) => !excludedSet.has(p.id));
  }, [dealerSettingsSnapshot, excludedSet]);

  const products = useMemo(
    () => allProducts.filter((p) => getInterest(responses[p.id]) != null),
    [allProducts, responses],
  );

  // Valeur unitaire (financée, taxes incluses) par produit — pour affichage carte + totaux
  const unitCentsById = useMemo(() => {
    const m = {};
    products.forEach((p) => {
      m[p.id] = productFinancedValueCents(p, responses?.[p.id], dealerSettingsSnapshot);
    });
    return m;
  }, [products, responses, dealerSettingsSnapshot]);

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
    () => sumFinancedAddOnCentsForIds(importantIds, products, responses, dealerSettingsSnapshot),
    [importantIds, products, responses, dealerSettingsSnapshot],
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
    try {
      const token = crypto.randomUUID();
      const origin = window.location?.origin || '';
      await publishPublicSnapshot(token, {
        vehicle:       vehicle || {},
        clientName:    clientName || '',
        responses,
        financing,
        timePerProduct: timePerProduct || {},
        placements:    { ...placementsComplete },
        dealerPricing: dealerSettingsSnapshot?.pricing || null,
        createdBy:     currentUser.uid,
        presId:        presId || null,
      });
      setShareUrl(`${origin}/t/${token}`);
    } catch (e) {
      console.error(e);
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
      style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: 'clamp(1rem, 2vw, 1.75rem)' }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
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
            <span className="overline" style={{ color: 'var(--text-tertiary)' }}>
              Étape finale · Menu client
            </span>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontStyle:  'italic',
              fontSize:   'clamp(1.75rem, 2.4vw, 2.25rem)',
              fontWeight: 500,
              margin:     '0.25rem 0 0',
              letterSpacing: '-0.02em',
            }}>
              Bâtissez la transaction avec le client
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: 'var(--fs-sm)',
              margin: '0.4rem 0 0',
              maxWidth: 620,
            }}>
              Déplacez chaque produit entre <strong>Important</strong> et <strong>Pas important</strong>.
              Le paiement se met à jour en direct.
            </p>
          </div>
          <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={back}>
            Retour
          </Button>
        </div>

        {/* ── Bandeau Total LIVE ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 24,
          padding: 'clamp(1rem, 1.5vw, 1.4rem)',
          background: 'linear-gradient(135deg, #0e0e11 0%, #1c1c22 100%)',
          borderRadius: 'var(--r-lg)',
          color: '#f7f4ee',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div>
            <div className="overline" style={{ color: 'rgba(247,244,238,0.55)', marginBottom: 6 }}>
              Paiement total estimé
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {new Money(totalDisplay.valueCents).format()}
              {totalDisplay.isPeriodic && (
                <span style={{
                  fontSize: 'var(--fs-md)',
                  color: 'rgba(247,244,238,0.6)',
                  marginLeft: 8,
                  fontStyle: 'normal',
                  fontWeight: 500,
                }}>
                  / versement
                </span>
              )}
            </div>
            {delta != null && (
              <div style={{
                marginTop: 6,
                fontSize: 'var(--fs-sm)',
                color: delta > 0 ? 'var(--or-500)' : 'rgba(247,244,238,0.55)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {delta >= 0 ? '+' : ''}
                {(delta / 100).toFixed(2)} $ vs paiement de base
              </div>
            )}
          </div>

          <div>
            <div className="overline" style={{ color: 'rgba(247,244,238,0.55)', marginBottom: 6 }}>
              Produits retenus
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: '2rem',
              lineHeight: 1,
            }}>
              {importantIds.length}
              <span style={{
                fontSize: 'var(--fs-md)',
                color: 'rgba(247,244,238,0.5)',
                marginLeft: 6,
                fontStyle: 'normal',
                fontWeight: 500,
              }}>
                / {products.length}
              </span>
            </div>
          </div>

          <div>
            <div className="overline" style={{ color: 'rgba(247,244,238,0.55)', marginBottom: 6 }}>
              Ajouté au financement
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: '1.75rem',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>
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
              gap: 20,
              marginBottom: 24,
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
                    price={unitCentsById[p.id]}
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
                    price={unitCentsById[p.id]}
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
