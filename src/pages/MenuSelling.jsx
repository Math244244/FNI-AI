import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext, PointerSensor, useSensor, useSensors, pointerWithin,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { usePresentation } from '../context/PresentationContext';
import { ENRICHED_PRODUCTS } from '../data/productPricing';
import { getInterest } from '../utils/responseHelpers.js';
import {
  defaultPlacementsFromResponses,
  productIdsForCumulativeLevel,
  sumFinancedAddOnCentsForIds,
  displayColumnCost,
  deltaVersusBase,
} from '../utils/menuCalculations.js';
import { updatePresentation, publishPublicSnapshot } from '../services/presentationService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { ArrowLeft, Check, Link2, Sparkles, Copy, CarFront } from 'lucide-react';
import { Money } from '../utils/money.js';

const COLS = /** @type {const} */ (['essentiel', 'recommande', 'premium', 'rejet']);
const COL_LABELS = {
  essentiel:   'Essentiel',
  recommande:  'Recommandé',
  premium:     'Premium',
  rejet:       'Rejet',
};

function DraggableCard({ id, children, disabled }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      className="menu-dnd-card"
      {...attributes}
      {...listeners}
      style={{
        padding: '0.45rem 0.6rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-hair)',
        borderRadius: 'var(--r-sm)',
        fontSize: 'var(--fs-sm)',
        fontWeight: 500,
        marginBottom: 6,
        cursor: disabled ? 'default' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.02)' : 'none',
        boxShadow: isDragging ? '0 8px 28px rgba(0,0,0,0.12)' : 'none',
        touchAction: 'none',
      }}
    >
      {children}
    </div>
  );
}

function DropColumn({ colId, label, children, highlight }) {
  const { isOver, setNodeRef } = useDroppable({ id: colId });
  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 200,
        flex: 1,
        minWidth: 0,
        padding: '0.6rem',
        borderRadius: 'var(--r-md)',
        border: isOver ? '2px solid var(--or-500)' : highlight
          ? '2px solid var(--or-500)'
          : '1px solid var(--border-hair)',
        background: highlight
          ? 'linear-gradient(180deg, var(--or-100), var(--bg-card))'
          : isOver
            ? 'var(--or-100)'
            : 'var(--bg-subtle)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'var(--tx)',
      }}
    >
      <div
        className="overline"
        style={{
          marginBottom: 8,
          color: highlight ? 'var(--or-900)' : 'var(--text-tertiary)',
        }}
      >
        {label}
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
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
  } = usePresentation();
  const timePerProduct = timePerProductProp;

  const [placements, setPlacements] = useState(
    () => menuState?.placements || defaultPlacementsFromResponses(responses),
  );
  const [choice, setChoice]     = useState(/** @type {'essentiel'|'recommande'|'premium'|null} */ (null));
  const [publishing, setPub]  = useState(false);
  const [shareUrl, setShareUrl] = useState(/** @type {string|null} */ (null));
  const [sealed, setSealed]     = useState(false);

  const products = useMemo(
    () => ENRICHED_PRODUCTS.filter((p) => getInterest(responses[p.id]) != null),
    [responses],
  );

  const byCol = useMemo(() => {
    const m = { essentiel: [], recommande: [], premium: [], rejet: [] };
    products.forEach((p) => {
      const c = placements[p.id] || 'rejet';
      if (m[c]) m[c].push(p);
    });
    return m;
  }, [placements, products]);

  const threeLevels = useMemo(
    () => (['essentiel', 'recommande', 'premium']).map((lvl) => {
      const ids = productIdsForCumulativeLevel(placements, /** @type {'essentiel'|'recommande'|'premium'} */ (lvl));
      const add = sumFinancedAddOnCentsForIds(ids, products, responses, dealerSettingsSnapshot);
      const d = displayColumnCost(financing, add);
      const delta = deltaVersusBase(financing, add);
      return { lvl, ids, add, d, delta };
    }),
    [placements, products, responses, financing, dealerSettingsSnapshot],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const onDragEnd = useCallback((e) => {
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

  const seal = async (clientChoice) => {
    if (sealed) return;
    const menuFinal = {
      clientChoice,
      placements: { ...placements },
      sealedAt:   Date.now(),
    };
    setSealed(true);
    setMenuState(menuFinal);
    if (presId) {
      try {
        await updatePresentation(presId, { menuFinal });
      } catch (e) { console.error(e); }
    }
    onComplete?.(menuFinal);
    if (onComplete == null) {
      navigate('/dashboard', { replace: true });
    }
  };

  const back = onBack || (() => {
    setMenuState({ placements: { ...placements } });
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
        placements:    { ...placements },
        dealerPricing: dealerSettingsSnapshot?.pricing || null,
        createdBy:     currentUser.uid,
        presId:        presId || null,
      });
      setShareUrl(`${origin}/t/${token}`);
    } catch (e) {
      console.error(e);
    } finally { setPub(false); }
  };

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
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle:  'italic',
            fontSize:   '1.4rem',
            fontWeight: 500,
            margin:     0,
            maxWidth:   400,
            lineHeight: 1.35,
          }}
        >
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
      style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '1.5rem' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle:  'italic',
                fontSize:   '1.6rem',
                fontWeight: 500,
                margin:     0,
              }}
            >
              Menu de vente
            </h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)', margin: '0.3rem 0 0' }}>
              Colonnes cumulatives — le client valide un scénario
            </p>
          </div>
          <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={back}>
            Retour
          </Button>
        </div>

        {/* 3 totaux cumulatifs */}
        <div
          style={{
            display:   'grid',
            gridTemplateColumns: '1fr 1.15fr 1fr',
            gap:       '0.75rem',
            marginBottom: 16,
          }}
        >
          {threeLevels.map(({ lvl, d, delta }) => (
            <div
              key={lvl}
              style={{
                borderRadius: 'var(--r-md)',
                border:        lvl === 'recommande' ? '2px solid var(--or-500)' : '1px solid var(--border-hair)',
                background:   lvl === 'recommande' ? 'linear-gradient(180deg, var(--or-100), var(--bg-card))' : 'var(--bg-card)',
                padding:      '0.9rem 1rem',
                textAlign:    'center',
              }}
            >
              <div
                className="overline"
                style={{ color: 'var(--text-tertiary)', marginBottom: 4 }}
              >
                {COL_LABELS[lvl]}
                {delta != null && (
                  <span style={{ color: 'var(--forest-600)' }}>
                    {' '}
                    (
                    {delta >= 0 ? '+' : ''}
                    {d.isPeriodic
                      ? `${(delta / 100).toFixed(2)} $ / versement`
                      : new Money(Math.round(delta)).format()}
                    )
                  </span>
                )}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize:  '1.4rem',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {new Money(d.valueCents).format()}
                {d.isPeriodic && (
                  <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)' }}> / versement</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragEnd={onDragEnd}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {COLS.map((c) => (
              <DropColumn
                key={c}
                colId={c}
                label={COL_LABELS[c]}
                highlight={c === 'recommande'}
              >
                {byCol[c].map((p) => (
                  <DraggableCard key={p.id} id={p.id} disabled={sealed}>
                    {p.title}
                  </DraggableCard>
                ))}
              </DropColumn>
            ))}
          </div>
        </DndContext>

        <div
          style={{
            display:  'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap:      8,
            borderTop: '1px solid var(--border-hair)',
            paddingTop: 20,
            marginTop: 8,
          }}
        >
          <span className="overline" style={{ marginRight: 8 }}>Sceller le choix client</span>
          {(['essentiel', 'recommande', 'premium']).map((k) => (
            <Button
              key={k}
              variant={choice === k ? 'primary' : 'secondary'}
              size="sm"
              icon={<Check size={14} />}
              disabled={sealed}
              onClick={() => {
                setChoice(/** @type {any} */ (k));
                void seal(/** @type {any} */ (k));
              }}
            >
              {COL_LABELS[k]}
            </Button>
          ))}
          <Button
            size="sm"
            variant="secondary"
            icon={<Link2 size={14} />}
            onClick={makeShareLink}
            disabled={publishing}
          >
            {publishing ? 'Lien…' : 'Générer un lien de partage'}
          </Button>
          {shareUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--forest-600)', wordBreak: 'break-all', flex: 1, minWidth: 0 }}>
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
        </div>

        {choice && (
          <p style={{ marginTop: 16, fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
            <Sparkles size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            &nbsp;Choix enregistré : <strong>{COL_LABELS[choice]}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
