import React, { useState, useEffect } from 'react';
import { getDealers } from '../../services/adminService';
import { getAllPresentations, getDealerPresentations, computeAnalytics } from '../../services/presentationService';
import { PRODUCTS } from '../../data/products';
import { BarChart2, Filter, Download, Building2, TrendingUp, Clock, Users } from 'lucide-react';

const PRODUCT_NAMES = Object.fromEntries(PRODUCTS.map(p => [p.id, { title: p.title, icon: p.icon }]));

/* ── Bar chart (pure CSS) ── */
function Bar({ value, max, color = 'var(--brand-red)' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ position: 'relative', height: 6, background: 'var(--border-sm)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: color, borderRadius: 'var(--r-full)', transition: 'width 0.5s ease' }} />
    </div>
  );
}

/* ── Mini sparkline (by month) ── */
function MonthChart({ byMonth }) {
  const entries = Object.entries(byMonth).sort(([a],[b]) => a.localeCompare(b)).slice(-6);
  const max     = Math.max(...entries.map(([,v]) => v.count), 1);
  const labels  = ['Jan','Fév','Mar','Avr','Mai','Jui','Jul','Aoû','Sep','Oct','Nov','Déc'];

  return (
    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'flex-end', height: 56 }}>
      {entries.map(([key, v]) => {
        const [y, m] = key.split('-');
        const h = Math.max((v.count / max) * 52, 4);
        return (
          <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flex: 1 }}>
            <div style={{
              width: '100%', height: h,
              background: 'var(--brand-red)', borderRadius: '3px 3px 0 0',
              opacity: 0.8, minHeight: 4,
            }} title={`${v.count} présentations`} />
            <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>{labels[parseInt(m)-1]}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminReports() {
  const [dealers,    setDealers]    = useState([]);
  const [filter,     setFilter]     = useState({ dealerId: '', from: '', to: '' });
  const [presentations, setPres]    = useState([]);
  const [analytics,  setAnalytics]  = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [tab,        setTab]        = useState('overview');

  useEffect(() => {
    getDealers().then(setDealers).catch((e) => console.error('[AdminReports] dealers:', e));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        let pres = filter.dealerId
          ? await getDealerPresentations(filter.dealerId)
          : await getAllPresentations();

        if (filter.from || filter.to) {
          pres = pres.filter((p) => {
            if (!p.createdAt?.toDate) return true;
            const d = p.createdAt.toDate();
            if (filter.from && d < new Date(filter.from)) return false;
            if (filter.to   && d > new Date(filter.to + 'T23:59:59')) return false;
            return true;
          });
        }
        if (cancelled) return;
        setPres(pres);
        setAnalytics(computeAnalytics(pres));
      } catch (e) {
        console.error('[AdminReports] load:', e);
        if (!cancelled) setError('Impossible de charger les rapports. Réessayez.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [filter]);

  const exportCSV = () => {
    const rows = [
      ['Date', 'Client', 'Concessionnaire', 'Vendeur', 'Véhicule', 'Taux de protection', 'Produits retenus', 'Temps moyen (s)'],
      ...presentations.map(p => [
        p.createdAt?.toDate ? new Date(p.createdAt.toDate()).toLocaleDateString('fr-CA') : '',
        p.clientName || '',
        p.dealerId   || '',
        p.userId     || '',
        `${p.vehicle?.year || ''} ${p.vehicle?.make || ''} ${p.vehicle?.model || ''}`.trim(),
        `${p.protectionRate || 0}%`,
        (p.interested || []).join(' | '),
        p.avgTimePerSlide || '',
      ]),
    ];
    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = `rapports-fni-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const productEntries = analytics
    ? Object.entries(analytics.productStats)
        .map(([id, s]) => ({
          id,
          name: PRODUCT_NAMES[id]?.title || id,
          icon: PRODUCT_NAMES[id]?.icon  || '📄',
          yes: s.yes, no: s.no, total: s.total,
          rate: s.total ? Math.round(s.yes / s.total * 100) : 0,
          avgTime: s.total && s.timeTotal ? Math.round(s.timeTotal / s.total) : 0,
        }))
        .sort((a, b) => b.rate - a.rate)
    : [];

  const maxTotal = Math.max(...productEntries.map(p => p.total), 1);
  const fmt      = s => `${Math.floor(s/60)}m ${s%60}s`;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.625rem', marginBottom: '0.25rem' }}>Rapports & Analytiques</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: 0 }}>
            {analytics?.total || 0} présentation{analytics?.total !== 1 ? 's' : ''} analysée{analytics?.total !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-outline" onClick={exportCSV} disabled={!presentations.length || loading}>
          <Download size={14} /> Exporter CSV
        </button>
      </div>

      {error && (
        <div role="alert" style={{
          marginBottom: '1rem', padding: '0.75rem 1rem',
          background: 'var(--danger-light)', border: '1px solid var(--danger-border)',
          color: 'var(--crimson-500)', borderRadius: 'var(--r-md)', fontSize: '0.85rem',
        }}>{error}</div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.75rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label" style={{ marginBottom: '0.3rem' }}>Concessionnaire</label>
            <select className="form-input" style={{ minWidth: 220 }}
              value={filter.dealerId} onChange={e => setFilter(f => ({ ...f, dealerId: e.target.value }))}>
              <option value="">— Tous les concessionnaires —</option>
              {dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: '0.3rem' }}>Du</label>
            <input type="date" className="form-input"
              value={filter.from} onChange={e => setFilter(f => ({ ...f, from: e.target.value }))} />
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: '0.3rem' }}>Au</label>
            <input type="date" className="form-input"
              value={filter.to} onChange={e => setFilter(f => ({ ...f, to: e.target.value }))} />
          </div>
          <button className="btn-ghost"
            style={{ border: '1.5px solid var(--border-md)', marginBottom: '0.05rem' }}
            onClick={() => setFilter({ dealerId: '', from: '', to: '' })}>
            Réinitialiser
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { icon: <BarChart2 size={20} color="var(--brand-red)" />,  cls: 'red',   value: analytics?.total || 0,          label: 'Présentations' },
          { icon: <TrendingUp size={20} color="var(--success)" />,   cls: 'green', value: `${analytics?.avgRate || 0}%`,  label: 'Taux de protection moyen' },
          { icon: <Users size={20} color="var(--info)" />,           cls: 'blue',  value: new Set(presentations.map(p => p.userId)).size, label: 'Vendeurs actifs' },
          { icon: <Clock size={20} color="var(--warning)" />,        cls: 'amber',
            value: presentations.length
              ? fmt(Math.round(presentations.reduce((s,p) => s+(p.avgTimePerSlide||0), 0) / presentations.length))
              : '—',
            label: 'Temps moyen / slide' },
        ].map((s,i) => (
          <div key={i} className={`stat-card ${s.cls}`}>
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.5rem' }}>{loading ? '…' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        {[
          { id: 'overview', label: '📈 Vue d\'ensemble' },
          { id: 'products', label: '🛡️ Par produit' },
          { id: 'history',  label: '📋 Historique' },
        ].map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="animate-in">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Monthly chart */}
            <div className="card">
              <h3 style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>Présentations par mois</h3>
              {analytics?.byMonth && Object.keys(analytics.byMonth).length > 0 ? (
                <MonthChart byMonth={analytics.byMonth} />
              ) : (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Pas encore de données</p>
              )}
            </div>
            {/* Condition breakdown */}
            <div className="card">
              <h3 style={{ fontSize: '0.9375rem', marginBottom: '1rem' }}>Répartition — Condition</h3>
              {['neuf','usage'].map(c => {
                const count = presentations.filter(p => p.vehicle?.condition === c).length;
                const pct   = presentations.length ? Math.round(count/presentations.length*100) : 0;
                return (
                  <div key={c} style={{ marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600 }}>{c === 'neuf' ? '✨ Neuf' : '🔄 Occasion'}</span>
                      <span style={{ fontWeight: 800 }}>{pct}% ({count})</span>
                    </div>
                    <Bar value={count} max={presentations.length} color={c === 'neuf' ? 'var(--success)' : 'var(--warning)'} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      {tab === 'products' && (
        <div className="animate-in">
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Taux d'adhésion, volume, et temps moyen passé par produit.
          </p>
          {productEntries.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)' }}>Aucune donnée disponible</p>
          ) : productEntries.map(p => (
            <div key={p.id} className="card" style={{ marginBottom: '0.75rem', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '10px',
                  background: p.rate >= 60 ? 'var(--success-light)' : p.rate >= 30 ? 'var(--warning-light)' : 'var(--brand-red-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', flexShrink: 0,
                }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>{p.name}</div>
                  <Bar value={p.yes} max={p.total}
                    color={p.rate >= 60 ? 'var(--success)' : p.rate >= 30 ? 'var(--warning)' : 'var(--brand-red)'} />
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 110 }}>
                  <div style={{
                    fontSize: '1.375rem', fontWeight: 900,
                    color: p.rate >= 60 ? 'var(--success)' : p.rate >= 30 ? 'var(--warning)' : 'var(--brand-red)',
                  }}>{p.rate}%</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>
                    ✅ {p.yes} / ✗ {p.no} ({p.total} total)
                  </div>
                  {p.avgTime > 0 && (
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)' }}>
                      ⏱ moy. {fmt(p.avgTime)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="animate-in">
          {presentations.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', padding: '2rem', textAlign: 'center' }}>
              Aucune présentation dans cette période
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Véhicule</th>
                  <th>Vendeur</th>
                  <th>Produits retenus</th>
                  <th>Taux</th>
                </tr>
              </thead>
              <tbody>
                {presentations.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                      {p.createdAt?.toDate ? new Date(p.createdAt.toDate()).toLocaleDateString('fr-CA') : '—'}
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {p.clientName || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Anonyme</span>}
                    </td>
                    <td style={{ fontSize: '0.8375rem', color: 'var(--text-secondary)' }}>
                      {p.vehicle?.year} {p.vehicle?.make} {p.vehicle?.model}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      {p.userId?.slice(0, 8)}…
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {(p.interested || []).slice(0, 3).map(id => (
                          <span key={id} className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                            {PRODUCT_NAMES[id]?.icon || '●'}
                          </span>
                        ))}
                        {(p.interested || []).length > 3 && (
                          <span className="badge badge-navy" style={{ fontSize: '0.68rem' }}>
                            +{p.interested.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        (p.protectionRate||0) >= 60 ? 'badge-green' :
                        (p.protectionRate||0) >= 30 ? 'badge-amber' : 'badge-red'
                      }`}>
                        {p.protectionRate || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
