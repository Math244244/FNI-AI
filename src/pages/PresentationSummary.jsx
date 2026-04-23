import React, { useEffect, useState } from 'react';
import { Printer, ThumbsUp, ThumbsDown, Check, X, ArrowRight } from 'lucide-react';
import VehicleImage from '../components/slide/VehicleImage';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import getIcon from '../utils/productIcons';
import { dateLong, currencyMonthly } from '../utils/typograph';
import { getInterest } from '../utils/responseHelpers.js';

/**
 * PresentationSummary — écran de fin 60/40 cérémonial.
 * Gauche 60% (vert) : chiffre hero (rate) + véhicule + count-up.
 * Droite 40% (ivoire) : listes produits retenus / déclinés + actions.
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
  const interested = products.filter(p => getInterest(responses[p.id]) === 'yes');
  const declined   = products.filter(p => getInterest(responses[p.id]) === 'no');
  const rate       = products.length ? Math.round((interested.length / products.length) * 100) : 0;
  const monthlyTotal = interested.reduce((s, p) => s + (p.monthly_price || 0), 0);
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

  return (
    <div
      className="summary-grid"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '60fr 40fr',
        background: 'var(--bg-page)',
      }}
    >
      {/* ─── Gauche 60% — Hero vert ─── */}
      <aside
        style={{
          background: 'linear-gradient(160deg, var(--forest-700) 0%, var(--forest-600) 55%, #0A4A2E 100%)',
          color: 'var(--ivoire-100)',
          padding: '3rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Filigrane or fumé */}
        <span aria-hidden style={{
          position: 'absolute',
          top: '-0.2em', right: '-0.15em',
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(280px, 32vw, 520px)',
          lineHeight: 0.9,
          color: 'rgba(184,147,90,0.10)',
          letterSpacing: '-0.04em',
          pointerEvents: 'none',
          userSelect: 'none',
        }}>A<span style={{ color: 'rgba(184,147,90,0.18)' }}>+</span></span>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span className="overline" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '0.75rem' }}>
            Présentation complétée
          </span>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(2.25rem, 3.6vw, 3.25rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: 0,
            color: '#fff',
          }}>
            {clientName ? `Merci, ${clientName}.` : 'Merci de votre temps.'}
          </h1>

          {/* Véhicule visuel */}
          <div style={{
            margin: '2rem 0',
            height: 180,
            filter: 'drop-shadow(0 18px 40px rgba(0,0,0,0.25))',
          }}>
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

          {/* Chiffre hero */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 18,
            marginBottom: '1rem',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: 'clamp(5rem, 10vw, 8rem)',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color: '#fff',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {countRate}
              <span style={{ fontSize: '0.5em', marginLeft: '0.1em', color: 'var(--or-500)' }}>%</span>
            </span>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              paddingBottom: '0.5rem',
            }}>
              <span style={{ fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Taux de protection retenu
              </span>
              <span style={{
                fontSize: 'var(--fs-xs)',
                color: 'rgba(255,255,255,0.55)',
                letterSpacing: '0.03em',
              }}>
                {interested.length} / {products.length} produits · {durationLabel}
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            marginTop: 'auto',
            paddingTop: '2rem',
          }}>
            <span style={{
              width: 40, height: 1, background: 'rgba(255,255,255,0.3)',
            }} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 'var(--fs-sm)',
              color: 'rgba(255,255,255,0.7)',
            }}>
              Avantage Plus · {dateLong(new Date())}
            </span>
          </div>
        </div>
      </aside>

      {/* ─── Droite 40% — Résumé + actions ─── */}
      <main style={{
        padding: '3rem 2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxHeight: '100vh',
        overflowY: 'auto',
      }}>
        <header>
          <span className="overline">Résumé de séance</span>
          <h2 style={{
            fontSize: 'var(--fs-2xl)',
            fontWeight: 700,
            margin: '0.25rem 0 0.25rem',
            letterSpacing: '-0.015em',
          }}>
            {vehicle?.year} {vehicle?.make} {vehicle?.model}
          </h2>
          <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 'var(--fs-sm)' }}>
            {saving ? 'Sauvegarde en cours…' : 'Toutes les décisions ont été enregistrées.'}
          </p>
        </header>

        {/* KPIs mini */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <MiniStat label="Retenus" value={interested.length} tone="green" />
          <MiniStat label="Déclinés" value={declined.length} tone="red" />
          {monthlyTotal > 0 && (
            <div style={{
              gridColumn: '1 / -1',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--r-md)',
              background: 'var(--or-100)',
              border: '1px solid var(--border-warm)',
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12,
            }}>
              <span className="overline" style={{ marginBottom: 0, color: 'var(--or-900)' }}>
                Estimation mensuelle
              </span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontWeight: 600,
                fontSize: 'var(--fs-xl)',
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {currencyMonthly(monthlyTotal)}
              </span>
            </div>
          )}
        </div>

        {/* Liste retenus */}
        <Section title="Retenus" icon={<ThumbsUp size={14} />} tone="green" count={interested.length}>
          {interested.length === 0 ? (
            <Empty label="Aucune protection retenue" />
          ) : interested.map(p => <Row key={p.id} product={p} tone="green" />)}
        </Section>

        {/* Liste déclinés */}
        <Section title="Déclinés" icon={<ThumbsDown size={14} />} tone="red" count={declined.length}>
          {declined.length === 0 ? (
            <Empty label="Aucune décision défavorable" />
          ) : declined.map(p => <Row key={p.id} product={p} tone="red" />)}
        </Section>

        {/* Actions */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-hair)',
          display: 'flex',
          gap: '0.6rem',
          flexWrap: 'wrap',
        }}>
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
      `}</style>
    </div>
  );
}

function MiniStat({ label, value, tone = 'gray' }) {
  const colorMap = {
    green: 'var(--forest-600)',
    red:   'var(--crimson-500)',
    gold:  'var(--or-900)',
    gray:  'var(--text-primary)',
  };
  return (
    <div style={{
      padding: '0.75rem 1rem',
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
  const toneColor = tone === 'green' ? 'var(--forest-600)' : tone === 'red' ? 'var(--crimson-500)' : 'var(--text-secondary)';
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
  const bg = tone === 'green' ? 'var(--brand-green-light)' : 'var(--danger-light)';
  const bd = tone === 'green' ? 'var(--brand-green-border)' : 'var(--danger-border)';
  const color = tone === 'green' ? 'var(--forest-600)' : 'var(--crimson-500)';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0.55rem 0.75rem',
      borderRadius: 'var(--r-sm)',
      background: bg,
      border: `1px solid ${bd}`,
      fontSize: 'var(--fs-sm)',
    }}>
      <Icon size={14} color={color} />
      <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>{product.title}</span>
      {product.monthly_price && tone === 'green' && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-xs)',
          color: 'var(--text-tertiary)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {currencyMonthly(product.monthly_price)}
        </span>
      )}
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
