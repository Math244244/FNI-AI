import React, { useEffect, useState } from 'react';
import { Printer, ThumbsUp, ThumbsDown, Check, X, ArrowRight, ShieldCheck } from 'lucide-react';
import VehicleImage from '../components/slide/VehicleImage';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import getIcon from '../utils/productIcons';
import { dateLong } from '../utils/typograph';
import { getInterest } from '../utils/responseHelpers.js';

/**
 * PresentationSummary — écran de fin cérémonial.
 *
 * - Gauche : véhicule TRÈS grand sans watermark, wording orienté « protection »
 *   (plutôt que « taux de vente »), chiffre hero avec animation.
 * - Droite : résumé produits (sans prix par ligne) + actions.
 * - Une version "print-summary" est rendue (visible uniquement à l'impression)
 *   pour produire un PDF propre au lieu d'une page noire.
 */
export default function PresentationSummary({
  vehicle,
  clientName,
  responses,
  products,
  timePerProd = {},
  saving,
  onQuit,
}) {
  const interested = products.filter((p) => getInterest(responses[p.id]) === 'yes');
  const declined   = products.filter((p) => getInterest(responses[p.id]) === 'no');
  const rate       = products.length
    ? Math.round((interested.length / products.length) * 100)
    : 0;
  const duration = Object.values(timePerProd).reduce((a, b) => a + b, 0);
  const durationLabel = `${Math.floor(duration / 60)} min ${duration % 60}s`;

  const [countRate, setCountRate] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    let raf;
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCountRate(Math.round(rate * ease));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [rate]);

  /* ── Wording protection (orienté bénéfice client, pas « taux de vente ») ── */
  const protectionLabel =
    rate >= 85 ? 'Véhicule protégé à son niveau optimal'
    : rate >= 60 ? 'Véhicule solidement protégé'
    : rate >= 40 ? 'Véhicule partiellement protégé'
    : rate > 0  ? 'Protection de base sélectionnée'
    : 'Aucune protection retenue';

  return (
    <>
      {/* ── Rendu écran ── */}
      <div
        className="summary-grid no-print"
        style={{
          minHeight: '100vh',
          display: 'grid',
          gridTemplateColumns: '62fr 38fr',
          background: 'var(--bg-page)',
        }}
      >
        {/* ─── Gauche 62% — Hero prestige ─── */}
        <aside
          style={{
            background: 'linear-gradient(155deg, #0E3F2A 0%, var(--forest-600) 55%, #0A4A2E 100%)',
            color: 'var(--ivoire-100)',
            padding: 'clamp(2rem, 4vw, 3.5rem)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
            }}
          >
            <span
              className="overline"
              style={{
                color: 'rgba(255,255,255,0.65)',
                marginBottom: '0.75rem',
                letterSpacing: '0.14em',
              }}
            >
              Présentation complétée
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 'clamp(2.5rem, 4.2vw, 4rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                margin: 0,
                color: '#fff',
              }}
            >
              {clientName ? <>Merci, {clientName}.</> : 'Merci de votre temps.'}
            </h1>

            {/* Véhicule GRAND, aucun watermark ─────────────────────── */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                margin: '1.75rem 0 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {vehicle?.make && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: 920,
                    maxHeight: 'clamp(320px, 42vh, 520px)',
                    filter: 'drop-shadow(0 36px 60px rgba(0,0,0,0.45))',
                    animation: 'summary-zoom 1000ms var(--ease-out) both',
                  }}
                >
                  <VehicleImage
                    year={vehicle.year}
                    make={vehicle.make}
                    model={vehicle.model}
                    category={vehicle.category}
                    angle={23}
                    width={1800}
                    alt={`${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`}
                  />
                </div>
              )}
            </div>

            {/* Chiffre hero + wording protection (pas "vente") ─────── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                alignItems: 'center',
                gap: 24,
                marginTop: 'auto',
                paddingTop: '1rem',
                animation: 'summary-fade 700ms 400ms var(--ease-out) both',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  fontSize: 'clamp(5rem, 10vw, 8.5rem)',
                  lineHeight: 1,
                  letterSpacing: '-0.045em',
                  color: '#fff',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {countRate}
                <span
                  style={{
                    fontSize: '0.45em',
                    marginLeft: '0.08em',
                    color: 'var(--or-500)',
                  }}
                >
                  %
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 'clamp(1.1rem, 1.35vw, 1.35rem)',
                    fontWeight: 600,
                    color: '#fff',
                    letterSpacing: '-0.005em',
                  }}
                >
                  <ShieldCheck size={18} color="var(--or-500)" />
                  {protectionLabel}
                </div>
                <span
                  style={{
                    fontSize: 'var(--fs-sm)',
                    color: 'rgba(255,255,255,0.72)',
                    lineHeight: 1.5,
                  }}
                >
                  Votre {vehicle?.year} {vehicle?.make} {vehicle?.model} bénéficie
                  de {interested.length} protection{interested.length > 1 ? 's' : ''}{' '}
                  sur les {products.length} présentées.
                </span>
                <span
                  style={{
                    fontSize: 'var(--fs-xs)',
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.03em',
                  }}
                >
                  Durée de la présentation · {durationLabel}
                </span>
              </div>
            </div>

            {/* Signature */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                marginTop: '1.5rem',
              }}
            >
              <span style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.3)' }} />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 'var(--fs-sm)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                Avantage Plus · {dateLong(new Date())}
              </span>
            </div>
          </div>
        </aside>

        {/* ─── Droite 38% — Résumé + actions ─── */}
        <main
          style={{
            padding: 'clamp(2rem, 3vw, 3rem) clamp(1.5rem, 2.5vw, 2.5rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            maxHeight: '100vh',
            overflowY: 'auto',
          }}
        >
          <header>
            <span className="overline">Résumé de séance</span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 2vw, 2rem)',
                fontWeight: 700,
                margin: '0.25rem 0 0.25rem',
                letterSpacing: '-0.015em',
                lineHeight: 1.15,
              }}
            >
              {vehicle?.year} {vehicle?.make} {vehicle?.model}
            </h2>
            <p
              style={{
                margin: 0,
                color: 'var(--text-tertiary)',
                fontSize: 'var(--fs-sm)',
              }}
            >
              {saving ? 'Sauvegarde en cours…' : 'Toutes les décisions ont été enregistrées.'}
            </p>
          </header>

          {/* KPIs mini (2 seulement — pas d'estimation visible) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <MiniStat label="Important" value={interested.length} tone="green" />
            <MiniStat label="Pas important" value={declined.length} tone="red" />
          </div>

          {/* Liste importants (sans prix par ligne) */}
          <Section
            title="Important"
            icon={<ThumbsUp size={14} />}
            tone="green"
            count={interested.length}
          >
            {interested.length === 0 ? (
              <Empty label="Aucune protection retenue" />
            ) : (
              interested.map((p) => <Row key={p.id} product={p} tone="green" />)
            )}
          </Section>

          {/* Liste pas importants (sans prix) */}
          <Section
            title="Pas important"
            icon={<ThumbsDown size={14} />}
            tone="red"
            count={declined.length}
          >
            {declined.length === 0 ? (
              <Empty label="Aucune décision défavorable" />
            ) : (
              declined.map((p) => <Row key={p.id} product={p} tone="red" />)
            )}
          </Section>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-hair)',
              display: 'flex',
              gap: '0.6rem',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="secondary"
              icon={<Printer size={14} />}
              onClick={() => window.print()}
            >
              Imprimer
            </Button>
            <Button
              variant="primary"
              onClick={onQuit}
              iconRight={<ArrowRight size={14} />}
            >
              Tableau de bord
            </Button>
          </div>
        </main>

        <style>{`
          @media (max-width: 960px) {
            .summary-grid {
              grid-template-columns: 1fr !important;
            }
          }
          @keyframes summary-zoom {
            from { opacity: 0; transform: scale(0.94); }
            to   { opacity: 1; transform: scale(1); }
          }
          @keyframes summary-fade {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      {/* ── Rendu dédié à l'impression ──────────────────────────────── */}
      <PrintableSummary
        clientName={clientName}
        vehicle={vehicle}
        interested={interested}
        declined={declined}
        rate={rate}
        protectionLabel={protectionLabel}
        durationLabel={durationLabel}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  PRINTABLE SUMMARY — rendu noir sur blanc, propre, A4            */
/* ─────────────────────────────────────────────────────────────── */
function PrintableSummary({
  clientName,
  vehicle,
  interested,
  declined,
  rate,
  protectionLabel,
  durationLabel,
}) {
  return (
    <div
      className="print-summary print-only"
      aria-hidden
      style={{
        display: 'none',
        color: '#1a1a1a',
        background: '#fff',
        fontFamily: 'var(--font-body, Inter, sans-serif)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderBottom: '2px solid #1a1a1a',
          paddingBottom: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display, Georgia, serif)',
              fontSize: '20pt',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            Avantage <span style={{ fontStyle: 'italic', color: '#8a6a33' }}>Plus</span>
          </div>
          <div style={{ fontSize: '9pt', color: '#555', marginTop: 2 }}>
            Résumé de présentation F&I
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '9pt', color: '#555' }}>
          {dateLong(new Date())}
        </div>
      </div>

      {/* Bloc client / véhicule */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <div style={PRINT_LABEL}>Client</div>
          <div style={PRINT_VALUE}>{clientName || 'Client anonyme'}</div>
        </div>
        <div>
          <div style={PRINT_LABEL}>Véhicule</div>
          <div style={PRINT_VALUE}>
            {vehicle?.year} {vehicle?.make} {vehicle?.model}
          </div>
        </div>
      </div>

      {/* Indicateur protection */}
      <div
        style={{
          border: '1px solid #d5d5d5',
          borderRadius: 6,
          padding: '12px 16px',
          marginBottom: 18,
          background: '#fafaf7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ ...PRINT_LABEL, color: '#0A4A2E' }}>Niveau de protection</div>
          <div
            style={{
              fontFamily: 'var(--font-display, Georgia, serif)',
              fontStyle: 'italic',
              fontSize: '13pt',
              fontWeight: 600,
              marginTop: 2,
              color: '#0A4A2E',
            }}
          >
            {protectionLabel}
          </div>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: '30pt',
            color: '#0A4A2E',
            lineHeight: 1,
          }}
        >
          {rate}
          <span style={{ fontSize: '0.5em', color: '#8a6a33' }}>%</span>
        </div>
      </div>

      {/* Liste importants */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ ...PRINT_SECTION_H, color: '#0A4A2E' }}>
          Protections retenues ({interested.length})
        </div>
        {interested.length === 0 ? (
          <div style={PRINT_EMPTY}>Aucune</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {interested.map((p) => (
              <li key={p.id} style={PRINT_ROW}>
                <span style={{ color: '#0A4A2E', marginRight: 8 }}>✓</span>
                {p.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Liste pas importants */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ ...PRINT_SECTION_H, color: '#8a1b1b' }}>
          Écartées ({declined.length})
        </div>
        {declined.length === 0 ? (
          <div style={PRINT_EMPTY}>Aucune</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {declined.map((p) => (
              <li key={p.id} style={PRINT_ROW}>
                <span style={{ color: '#8a1b1b', marginRight: 8 }}>×</span>
                {p.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pied de page */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 10,
          borderTop: '1px solid #d5d5d5',
          fontSize: '8.5pt',
          color: '#777',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Durée · {durationLabel}</span>
        <span>Avantage Plus — www.fni-ai.web.app</span>
      </div>
    </div>
  );
}

const PRINT_LABEL = {
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  fontSize: '7.5pt',
  fontWeight: 700,
  color: '#555',
};
const PRINT_VALUE = {
  fontSize: '12pt',
  fontWeight: 600,
  marginTop: 2,
  color: '#1a1a1a',
};
const PRINT_SECTION_H = {
  fontSize: '10pt',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  borderBottom: '1px solid #d5d5d5',
  paddingBottom: 4,
  marginBottom: 8,
};
const PRINT_ROW = {
  fontSize: '11pt',
  padding: '5px 0',
  borderBottom: '1px dotted #e4e4e4',
};
const PRINT_EMPTY = {
  fontSize: '10pt',
  fontStyle: 'italic',
  color: '#777',
  padding: '4px 0',
};

/* ─────────────────────────────────────────────────────────────── */
/*  Composants UI (écran uniquement)                                */
/* ─────────────────────────────────────────────────────────────── */

function MiniStat({ label, value, tone = 'gray' }) {
  const colorMap = {
    green: 'var(--forest-600)',
    red:   'var(--crimson-500)',
    gold:  'var(--or-900)',
    gray:  'var(--text-primary)',
  };
  return (
    <div style={{
      padding: '0.85rem 1rem',
      borderRadius: 'var(--r-md)',
      border: '1px solid var(--border-hair)',
      background: 'var(--bg-card)',
    }}>
      <div className="overline" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontWeight: 600,
        fontSize: 'var(--fs-2xl)',
        color: colorMap[tone],
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
    </div>
  );
}

function Section({ title, icon, tone, count, children }) {
  const toneColor =
    tone === 'green' ? 'var(--forest-600)' :
    tone === 'red'   ? 'var(--crimson-500)' :
    'var(--text-secondary)';
  return (
    <section>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: '0.6rem',
        fontWeight: 600,
        fontSize: 'var(--fs-sm)',
        color: toneColor,
      }}>
        {icon}
        <span>{title}</span>
        <Badge tone={tone || 'gray'} style={{ marginLeft: 'auto' }}>
          {count}
        </Badge>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </section>
  );
}

function Row({ product, tone }) {
  const Icon = getIcon(product.iconName || 'Shield');
  const IconDecision = tone === 'green' ? Check : X;
  const bg    = tone === 'green' ? 'var(--brand-green-light)'  : 'var(--danger-light)';
  const bd    = tone === 'green' ? 'var(--brand-green-border)' : 'var(--danger-border)';
  const color = tone === 'green' ? 'var(--forest-600)'         : 'var(--crimson-500)';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0.65rem 0.85rem',
      borderRadius: 'var(--r-sm)',
      background: bg,
      border: `1px solid ${bd}`,
      fontSize: 'var(--fs-sm)',
    }}>
      <Icon size={14} color={color} />
      <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>
        {product.title}
      </span>
      <IconDecision size={13} color={color} />
    </div>
  );
}

function Empty({ label }) {
  return (
    <div style={{
      padding: '0.75rem',
      color: 'var(--text-tertiary)',
      fontSize: 'var(--fs-xs)',
      fontStyle: 'italic',
      textAlign: 'center',
    }}>
      {label}
    </div>
  );
}
