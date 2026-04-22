import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresentation } from '../context/PresentationContext';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS } from '../data/products';
import { savePresentation } from '../services/presentationService';
import { X, ChevronLeft, ChevronRight, Clock, Printer, Check, ThumbsDown, HelpCircle } from 'lucide-react';

/* ═══════════════════════════════════════════
   HOTSPOT DOT — Bleu pulsant (style v1)
   ═══════════════════════════════════════════ */
function VehicleDot({ dot, isActive, onClick }) {
  const dotColor = dot.color || '#3B82F6';
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        top: dot.top, left: dot.left,
        transform: 'translate(-50%, -50%)',
        zIndex: 10, cursor: 'pointer',
      }}
    >
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 36, height: 36, borderRadius: '50%',
        border: `2px solid ${dotColor}`,
        animation: isActive ? 'none' : 'pulse-ring 2s ease-out infinite',
        opacity: isActive ? 0 : 0.6,
        pointerEvents: 'none',
      }} />
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        background: dotColor,
        border: '2.5px solid white',
        boxShadow: `0 0 0 2px ${dotColor}44, 0 2px 8px rgba(0,0,0,0.2)`,
        animation: isActive ? 'none' : 'pulse-dot 2s ease-out infinite',
        transform: isActive ? 'scale(1.2)' : 'scale(1)',
        transition: 'transform 0.2s',
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   HOTSPOT MODAL — Clean et minimal
   ═══════════════════════════════════════════ */
function HotspotModal({ dot, onClose }) {
  if (!dot) return null;
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'white', borderRadius: '16px',
      padding: '1.25rem',
      boxShadow: '0 16px 48px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
      zIndex: 20, width: 260,
      animation: 'hotspotModalIn 0.2s ease both',
      border: '1px solid rgba(0,0,0,0.04)',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 10, right: 10,
        background: '#F5F5F5', border: 'none',
        borderRadius: '50%', width: 24, height: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0, transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = '#EEEEEE'}
        onMouseLeave={e => e.currentTarget.style.background = '#F5F5F5'}
      >
        <X size={12} color="#757575" />
      </button>
      {dot.image && (
        <img src={dot.image} alt={dot.label}
          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: '10px', marginBottom: '0.875rem' }} />
      )}
      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem', color: '#1A1A1A' }}>{dot.label}</div>
      <div style={{ fontSize: '0.8rem', color: '#757575', lineHeight: 1.55, marginBottom: '0.75rem' }}>
        {dot.description}
      </div>
      {dot.cost && (
        <div style={{
          padding: '0.45rem 0.7rem', borderRadius: '8px',
          background: 'rgba(214,40,40,0.04)',
          border: '1px solid rgba(214,40,40,0.1)',
          display: 'flex', gap: '0.4rem', alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#D62828', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coût estimé</span>
          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#D62828' }}>{dot.cost}</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN SLIDE DECK
   ═══════════════════════════════════════════ */
export default function SlideDeck() {
  const navigate    = useNavigate();
  const { vehicle, clientName, condition, transactionType, clearSession, mode } = usePresentation();
  const { currentUser, userProfile, isDemo } = useAuth();

  const [products, setProducts] = useState(PRODUCTS);
  const [index,    setIndex]    = useState(0);
  const [responses,setResponses]= useState({});
  const [activeHot,setActiveHot]= useState(null);
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);
  const [showPrint,setShowPrint]= useState(false);

  const [slideTime,  setSlideTime]   = useState(0);
  const [timePerProd,setTimePerProd] = useState({});
  const timerRef = useRef(null);

  const product = products[index];
  const total   = products.length;

  useEffect(() => {
    setSlideTime(0);
    timerRef.current = setInterval(() => setSlideTime(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [index]);

  const saveSlideTime = useCallback(() => {
    clearInterval(timerRef.current);
    if (product) {
      setTimePerProd(prev => ({
        ...prev,
        [product.id]: (prev[product.id] || 0) + slideTime,
      }));
    }
  }, [product, slideTime]);

  const goNext = () => {
    saveSlideTime();
    if (index < total - 1) { setIndex(i => i+1); setActiveHot(null); }
    else handleFinish();
  };

  const goPrev = () => {
    saveSlideTime();
    if (index > 0) { setIndex(i => i-1); setActiveHot(null); }
  };

  const respond = (resp) => {
    setResponses(r => ({ ...r, [product.id]: resp }));
    saveSlideTime();
    if (index < total - 1) { setIndex(i => i+1); setActiveHot(null); }
    else handleFinish();
  };

  const handleFinish = async () => {
    const finalTime = { ...timePerProd, [product.id]: (timePerProd[product.id] || 0) + slideTime };
    if (!isDemo && currentUser) {
      setSaving(true);
      try {
        await savePresentation(
          currentUser.uid,
          userProfile?.dealerId || null,
          vehicle || {},
          responses,
          mode || 'live',
          finalTime,
        );
      } catch (e) { console.error('Save error:', e); }
      finally { setSaving(false); }
    }
    setDone(true);
  };

  const handleQuit = () => { clearSession(); navigate('/dashboard'); };

  if (showPrint) return <PrintSummary vehicle={vehicle} clientName={clientName} responses={responses} products={products} onBack={() => setShowPrint(false)} onQuit={handleQuit} />;
  if (done) return <DoneScreen vehicle={vehicle} clientName={clientName} responses={responses} products={products} saving={saving} onPrint={() => setShowPrint(true)} onQuit={handleQuit} />;
  if (!product) return null;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft')  goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const interest = responses[product?.id];
  const percent  = Math.round(((index + 1) / total) * 100);
  const fmt      = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar — blanc clean */}
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
            {clientName || 'Client'} &nbsp;·&nbsp;
            <span style={{ color: 'var(--text-tertiary)' }}>{vehicle?.year} {vehicle?.make} {vehicle?.model}</span>
          </div>
          <div style={{ flex: 1, maxWidth: 300 }}>
            <div className="progress-bar" style={{ height: 4 }}>
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 600 }}>
            {index+1}/{total}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            color: 'var(--text-tertiary)', fontSize: '0.775rem',
          }}>
            <Clock size={13} /> {fmt(slideTime)}
          </div>
          <button className="topbar-btn danger" onClick={handleQuit}>Quitter</button>
        </div>
      </header>

      {/* Slide */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Slide header */}
        <div style={{
          padding: '0.75rem 2.5rem',
          background: '#FFFFFF',
          borderBottom: '1px solid var(--border-sm)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.35rem' }}>{product.icon}</span>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {product.title}
          </h2>
          {interest && (
            <span className={`badge ${interest === 'yes' ? 'badge-green' : interest === 'maybe' ? 'badge-amber' : 'badge-red'}`} style={{ marginLeft: 'auto' }}>
              {interest === 'yes' ? 'Intéressé' : interest === 'maybe' ? 'En savoir plus' : 'Pas intéressé'}
            </span>
          )}
        </div>

        {/* Slide body — layout magazine */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {/* Left: text content — flowing, readable */}
          <div style={{
            flex: '1 1 55%', padding: '2rem 2.5rem', overflow: 'auto',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Hook headline */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{
                fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)',
                lineHeight: 1.35, marginBottom: '0.75rem',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                {product.emoji_hook} {product.hook.headline}
              </div>
              <p style={{
                fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0,
              }}>
                {product.hook.text}
              </p>
            </div>

            {/* Risk section */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{
                fontWeight: 700, fontSize: '0.9rem', color: 'var(--danger)',
                marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem',
              }}>
                {product.emoji_risk} La réalité sans protection :
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {product.risk.points.map((p, i) => (
                  <li key={i} style={{
                    fontSize: '0.9rem', color: 'var(--text-secondary)',
                    marginBottom: '0.3rem', lineHeight: 1.65,
                  }}>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution section */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontWeight: 700, fontSize: '0.9rem', color: 'var(--success)',
                marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem',
              }}>
                {product.emoji_solution} Ce que vous obtenez :
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {product.solution.points.map((p, i) => (
                  <li key={i} style={{
                    fontSize: '0.9rem', color: 'var(--text-secondary)',
                    marginBottom: '0.3rem', lineHeight: 1.65,
                  }}>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {product.customContent && (
              <div style={{
                marginTop: '0.5rem', padding: '1rem 1.25rem',
                background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-sm)',
                fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7,
              }}>
                {product.customContent}
              </div>
            )}
            {product.customImage && (
              <img src={product.customImage} alt=""
                style={{ width: '100%', borderRadius: 'var(--r-md)', marginTop: '1rem', objectFit: 'cover', maxHeight: 180 }} />
            )}
          </div>

          {/* Right: vehicle — large, centered */}
          <div style={{
            flex: '0 0 45%', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem 2rem',
            background: '#FAFAFA',
            borderLeft: '1px solid var(--border-sm)',
          }}>
            {vehicle?.make ? (
              <div style={{ position: 'relative', width: '100%', maxWidth: 600 }}>
                <img
                  src={`https://cdn.imagin.studio/getimage?customer=img&make=${encodeURIComponent(vehicle.make)}&modelFamily=${encodeURIComponent(vehicle.model||'')}&modelYear=${vehicle.year||2024}&angle=23&width=900`}
                  alt={`${vehicle.year} ${vehicle.make}`}
                  style={{ width: '100%', objectFit: 'contain', display: 'block' }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&q=80'; }}
                />
                {product.vehicle_dots?.map((dot, i) => (
                  <VehicleDot
                    key={i} dot={dot}
                    isActive={activeHot === i}
                    onClick={() => setActiveHot(j => j === i ? null : i)}
                  />
                ))}
                {activeHot !== null && product.vehicle_dots?.[activeHot] && (
                  <HotspotModal
                    dot={product.vehicle_dots[activeHot]}
                    onClose={() => setActiveHot(null)}
                  />
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚗</div>
                <div>Aucun véhicule sélectionné</div>
              </div>
            )}
          </div>
        </div>

        {/* Decision bar */}
        <div style={{
          padding: '0.75rem 2rem',
          background: 'white',
          borderTop: '1px solid var(--border-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button className="btn-ghost" onClick={goPrev} disabled={index === 0}
            style={{ opacity: index === 0 ? 0.3 : 1, minWidth: 110 }}>
            <ChevronLeft size={16} /> Précédent
          </button>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center' }}>
            {/* Pas intéressé */}
            <button
              onClick={() => respond('no')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
                background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.75rem',
                transition: 'var(--tx)',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: interest === 'no' ? 'var(--danger)' : 'white',
                border: `3px solid ${interest === 'no' ? 'var(--danger)' : 'rgba(220,38,38,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'var(--tx)',
                boxShadow: interest === 'no' ? '0 4px 12px rgba(220,38,38,0.3)' : 'none',
              }}>
                <ThumbsDown size={18} color={interest === 'no' ? 'white' : '#DC2626'} />
              </div>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, color: 'var(--danger)',
                letterSpacing: '0.01em',
              }}>Pas intéressé</span>
            </button>

            {/* En savoir plus */}
            <button
              onClick={() => respond('maybe')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
                background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.75rem',
                transition: 'var(--tx)',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: interest === 'maybe' ? 'var(--warning)' : 'white',
                border: `3px solid ${interest === 'maybe' ? 'var(--warning)' : 'rgba(217,119,6,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'var(--tx)',
                boxShadow: interest === 'maybe' ? '0 4px 12px rgba(217,119,6,0.3)' : 'none',
              }}>
                <HelpCircle size={18} color={interest === 'maybe' ? 'white' : '#D97706'} />
              </div>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, color: 'var(--warning)',
                letterSpacing: '0.01em',
              }}>En savoir plus</span>
            </button>

            {/* Intéressé */}
            <button
              onClick={() => respond('yes')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
                background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.75rem',
                transition: 'var(--tx)',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: interest === 'yes' ? '#059669' : 'white',
                border: `3px solid ${interest === 'yes' ? '#059669' : 'rgba(5,150,105,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'var(--tx)',
                boxShadow: interest === 'yes' ? '0 4px 12px rgba(5,150,105,0.3)' : 'none',
              }}>
                <Check size={18} color={interest === 'yes' ? 'white' : '#059669'} />
              </div>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, color: 'var(--success)',
                letterSpacing: '0.01em',
              }}>Intéressé</span>
            </button>
          </div>

          <button className="btn-ghost" onClick={goNext} style={{ minWidth: 110 }}>
            {index < total - 1 ? <>Suivant <ChevronRight size={16} /></> : 'Terminer →'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes hotspotModalIn {
          from { opacity: 0; transform: translate(-50%,-50%) scale(0.92); }
          to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DONE SCREEN — Clean et aéré
   ═══════════════════════════════════════════ */
function DoneScreen({ vehicle, clientName, responses, products, saving, onPrint, onQuit }) {
  const interested = products.filter(p => responses[p.id] === 'yes');
  const maybe      = products.filter(p => responses[p.id] === 'maybe');
  const declined   = products.filter(p => responses[p.id] === 'no');
  const rate       = products.length > 0 ? Math.round((interested.length / products.length) * 100) : 0;

  return (
    <div className="app-container">
      <header className="topbar">
        <span className="topbar-logo">Avantage <span>Plus</span><span className="topbar-badge">FNI·AI</span></span>
        <div className="topbar-actions">
          <button className="topbar-btn" onClick={onPrint}><Printer size={14} /> Imprimer</button>
          <button className="topbar-btn danger" onClick={onQuit}><X size={14} /> Fermer</button>
        </div>
      </header>
      <main className="main-content" style={{ maxWidth: 720 }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Présentation terminée
          </h1>
          <p style={{ color: 'var(--text-tertiary)', margin: 0 }}>
            {clientName
              ? `${clientName} — ${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`
              : `${vehicle?.year || ''} ${vehicle?.make || ''} ${vehicle?.model || ''}`}
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            margin: '1.75rem 0',
            padding: '0.75rem 1.5rem',
            background: rate >= 60 ? 'var(--success-light)' : rate >= 30 ? 'var(--warning-light)' : 'var(--brand-red-light)',
            borderRadius: 'var(--r-full)',
            border: `1px solid ${rate >= 60 ? 'var(--success-border)' : rate >= 30 ? 'var(--warning-border)' : 'var(--brand-red-border)'}`,
          }}>
            <span style={{
              fontSize: '1.75rem', fontWeight: 800,
              color: rate >= 60 ? 'var(--success)' : rate >= 30 ? 'var(--warning)' : 'var(--brand-red)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}>{rate}%</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              taux de protection
            </span>
          </div>
          {saving && <p style={{ color: 'var(--info)', fontSize: '0.85rem' }}>Sauvegarde en cours…</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Interested */}
          <div className="card">
            <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '0.875rem', display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.85rem' }}>
              <Check size={14} /> Retenus ({interested.length})
            </div>
            {interested.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Aucun</p>
            ) : interested.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                <span>{p.icon}</span> {p.title}
              </div>
            ))}
          </div>

          {/* Maybe */}
          <div className="card">
            <div style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: '0.875rem', display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.85rem' }}>
              <HelpCircle size={14} /> En savoir plus ({maybe.length})
            </div>
            {maybe.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Aucun</p>
            ) : maybe.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                <span>{p.icon}</span> {p.title}
              </div>
            ))}
          </div>

          {/* Declined */}
          <div className="card">
            <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: '0.875rem', display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.85rem' }}>
              <ThumbsDown size={14} /> Déclinés ({declined.length})
            </div>
            {declined.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Aucun</p>
            ) : declined.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>{p.icon}</span> {p.title}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" style={{ flex: 1 }} onClick={onPrint}>
            <Printer size={16} /> Imprimer le résumé
          </button>
          <button className="btn-ghost" style={{ flex: 1, border: '1.5px solid var(--border-md)' }} onClick={onQuit}>
            Retour au tableau de bord
          </button>
        </div>
      </main>
    </div>
  );
}

function PrintSummary({ vehicle, clientName, responses, products, onBack, onQuit }) {
  return (
    <div className="print-summary">
      <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--brand-red)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.625rem', marginBottom: '0.25rem' }}>
          Avantage Plus <span style={{ color: 'var(--brand-red)' }}>— Résumé de présentation</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {clientName && `Client : ${clientName} · `}
          {vehicle?.year} {vehicle?.make} {vehicle?.model}
          {' · '}{new Date().toLocaleDateString('fr-CA', { dateStyle: 'long' })}
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {products.map(p => {
          const r = responses[p.id];
          return (
            <div key={p.id} className="card" style={{
              border: `2px solid ${r === 'yes' ? 'var(--success)' : r === 'maybe' ? 'var(--warning)' : r === 'no' ? 'var(--danger)' : 'var(--border-sm)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', gap: '0.4rem' }}>
                  {p.icon} {p.title}
                </div>
                <span style={{
                  fontWeight: 700, fontSize: '0.7rem', padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  background: r === 'yes' ? 'var(--success-light)' : r === 'maybe' ? 'var(--warning-light)' : r === 'no' ? 'var(--brand-red-light)' : 'var(--bg-subtle)',
                  color: r === 'yes' ? 'var(--success)' : r === 'maybe' ? 'var(--warning)' : r === 'no' ? 'var(--brand-red)' : 'var(--text-tertiary)',
                }}>
                  {r === 'yes' ? 'RETENU' : r === 'maybe' ? 'EN SAVOIR PLUS' : r === 'no' ? 'DÉCLINÉ' : 'N/A'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="no-print" style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
        <button className="btn-primary" onClick={() => window.print()}>Imprimer</button>
        <button className="btn-ghost" onClick={onBack}>Retour</button>
        <button className="btn-ghost" onClick={onQuit}>Tableau de bord</button>
      </div>
    </div>
  );
}
