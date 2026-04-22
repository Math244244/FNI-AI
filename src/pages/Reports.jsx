import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserPresentations, computeAnalytics } from '../services/presentationService';
import { PRODUCTS } from '../data/products';
import { useNavigate } from 'react-router-dom';
import { BarChart2, ArrowLeft, Clock, TrendingUp, Download } from 'lucide-react';

const PRODUCT_NAMES = Object.fromEntries(PRODUCTS.map(p => [p.id, { title: p.title, icon: p.icon }]));

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ height: 6, background: 'var(--border-sm)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color || 'var(--brand-red)', borderRadius: 'var(--r-full)', transition: 'width 0.5s ease' }} />
    </div>
  );
}

export default function Reports() {
  const { currentUser, isDemo } = useAuth();
  const navigate = useNavigate();
  const [presentations, setPres]   = useState([]);
  const [analytics,     setAnalytics] = useState(null);
  const [loading,       setLoading] = useState(true);
  const [tab,           setTab]     = useState('stats');
  const [dateFrom,      setDateFrom]= useState('');
  const [dateTo,        setDateTo]  = useState('');

  useEffect(() => {
    if (isDemo) { setLoading(false); return; }
    getUserPresentations(currentUser.uid).then(pres => {
      setPres(pres);
      setAnalytics(computeAnalytics(pres));
      setLoading(false);
    });
  }, [currentUser, isDemo]);

  /* Apply date filter */
  const filtered = presentations.filter(p => {
    if (!p.createdAt?.toDate) return true;
    const d = p.createdAt.toDate();
    if (dateFrom && d < new Date(dateFrom))         return false;
    if (dateTo   && d > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });
  const filteredAnalytics = computeAnalytics(filtered);

  const fmt  = s => `${Math.floor(s/60)}m ${s%60}s`;
  const date = d => d?.toDate ? new Date(d.toDate()).toLocaleDateString('fr-CA') : '—';

  const exportCSV = () => {
    const rows = [
      ['Date', 'Client', 'Véhicule', 'Produits retenus', 'Taux de protection'],
      ...filtered.map(p => [
        date(p.createdAt),
        p.clientName || 'Anonyme',
        `${p.vehicle?.year||''} ${p.vehicle?.make||''} ${p.vehicle?.model||''}`.trim(),
        (p.interested||[]).join(' | '),
        `${p.protectionRate||0}%`,
      ]),
    ];
    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8' });
    const a    = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mes-rapports-${Date.now()}.csv`;
    a.click();
  };

  const productEntries = filteredAnalytics
    ? Object.entries(filteredAnalytics.productStats)
        .map(([id, s]) => ({
          id,
          name:    PRODUCT_NAMES[id]?.title || id,
          icon:    PRODUCT_NAMES[id]?.icon  || '📄',
          yes:     s.yes, no: s.no, total: s.total,
          rate:    s.total ? Math.round(s.yes/s.total*100) : 0,
          avgTime: s.total && s.timeTotal ? Math.round(s.timeTotal/s.total) : 0,
        }))
        .sort((a,b) => b.rate - a.rate)
    : [];

  return (
    <div className="app-container">
      {/* Topbar */}
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="topbar-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={15} /> Retour
          </button>
          <span className="topbar-divider" />
          <span className="topbar-logo">Avantage <span>Plus</span></span>
          <span className="topbar-divider" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <BarChart2 size={13} /> Mes Rapports
          </span>
        </div>
        <button className="btn-outline" onClick={exportCSV} disabled={!filtered.length}
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.875rem' }}>
          <Download size={13} /> Exporter CSV
        </button>
      </header>

      <main className="main-content" style={{ maxWidth: 960 }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Mes performances</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: 0 }}>
            Suivez vos résultats de présentation et vos clients.
          </p>
        </div>

        {isDemo ? (
          <div style={{
            textAlign: 'center', padding: '3rem',
            background: 'var(--warning-light)', border: '1px solid var(--warning-border)',
            borderRadius: 'var(--r-xl)', color: 'var(--warning)',
          }}>
            ⚠️ Mode démo — connectez-vous pour voir vos rapports réels.
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>Chargement…</div>
        ) : (
          <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
              {[
                { icon: <BarChart2 size={20} color="var(--brand-red)" />, cls: 'red',   value: filteredAnalytics.total, label: 'Présentations' },
                { icon: <TrendingUp size={20} color="var(--success)" />,  cls: 'green', value: `${filteredAnalytics.avgRate}%`, label: 'Taux de protection moyen' },
                { icon: <Clock size={20} color="var(--warning)" />,       cls: 'amber',
                  value: filtered.length
                    ? fmt(Math.round(filtered.reduce((s,p)=>s+(p.avgTimePerSlide||0),0)/filtered.length))
                    : '—',
                  label: 'Temps moyen / slide' },
              ].map((s,i) => (
                <div key={i} className={`stat-card ${s.cls}`}>
                  <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                  <div>
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Date filter bar */}
            <div className="card" style={{ padding: '0.875rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>Du</label>
                <input type="date" className="form-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>Au</label>
                <input type="date" className="form-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
              {(dateFrom || dateTo) && (
                <button className="btn-ghost" style={{ border: '1.5px solid var(--border-md)' }}
                  onClick={() => { setDateFrom(''); setDateTo(''); }}>
                  Réinitialiser
                </button>
              )}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.1rem' }}>
                {filtered.length} présentation{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Tabs */}
            <div className="tabs-nav">
              <button className={`tab-btn ${tab==='stats'  ?'active':''}`} onClick={()=>setTab('stats')}>📈 Par produit</button>
              <button className={`tab-btn ${tab==='history'?'active':''}`} onClick={()=>setTab('history')}>📋 Mes clients</button>
            </div>

            {/* By product */}
            {tab === 'stats' && (
              <div className="animate-in">
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                  Taux d'adhésion et temps moyen passé sur chaque produit.
                </p>
                {productEntries.length === 0 ? (
                  <p style={{ color: 'var(--text-tertiary)' }}>Aucune donnée — commencez une présentation.</p>
                ) : productEntries.map(p => (
                  <div key={p.id} className="card" style={{ marginBottom: '0.75rem', padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
                        background: p.rate >= 60 ? 'var(--success-light)' : p.rate >= 30 ? 'var(--warning-light)' : 'var(--brand-red-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                      }}>{p.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.4rem' }}>{p.name}</div>
                        <Bar value={p.yes} max={p.total}
                          color={p.rate >= 60 ? 'var(--success)' : p.rate >= 30 ? 'var(--warning)' : 'var(--brand-red)'} />
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
                          ✅ {p.yes} intéressés · ✗ {p.no} déclinés · {p.total} total
                          {p.avgTime > 0 && ` · ⏱ ${fmt(p.avgTime)} en moyenne`}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '1.5rem', fontWeight: 900, flexShrink: 0, minWidth: 60, textAlign: 'right',
                        color: p.rate >= 60 ? 'var(--success)' : p.rate >= 30 ? 'var(--warning)' : 'var(--brand-red)',
                      }}>{p.rate}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* History */}
            {tab === 'history' && (
              <div className="animate-in">
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-tertiary)' }}>
                    Aucune présentation dans cette période.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {filtered.map(p => (
                      <div key={p.id} className="card" style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{
                            width: 38, height: 38, borderRadius: '10px', flexShrink: 0,
                            background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '1.1rem',
                          }}>
                            {p.vehicle?.category === 'automobile' ? '🚗' : '🚐'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                              {p.clientName || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Client anonyme</span>}
                            </div>
                            <div style={{ fontSize: '0.775rem', color: 'var(--text-tertiary)' }}>
                              {p.vehicle?.year} {p.vehicle?.make} {p.vehicle?.model}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span className={`badge ${(p.protectionRate||0)>=60?'badge-green':(p.protectionRate||0)>=30?'badge-amber':'badge-red'}`}>
                              {p.protectionRate||0}%
                            </span>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                              {date(p.createdAt)}
                            </div>
                            <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'flex-end', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                              {(p.interested || []).map(id => (
                                <span key={id} title={PRODUCT_NAMES[id]?.title} style={{ fontSize: '0.85rem' }}>
                                  {PRODUCT_NAMES[id]?.icon || '●'}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
