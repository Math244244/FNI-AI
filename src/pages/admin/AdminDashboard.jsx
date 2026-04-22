import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGlobalStats, getDealers } from '../../services/adminService';
import { getAllPresentations, computeAnalytics } from '../../services/presentationService';
import { Building2, Users, FileText, TrendingUp, ArrowRight, Shield, BarChart2 } from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]     = useState(null);
  const [dealers, setDealers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, d, pres] = await Promise.all([
          getGlobalStats(),
          getDealers(),
          getAllPresentations(),
        ]);
        setStats(s);
        setDealers(d.filter(d => d.active).slice(0, 5));
        setAnalytics(computeAnalytics(pres));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const topProducts = analytics
    ? Object.entries(analytics.productStats)
        .map(([id, s]) => ({ id, rate: s.total ? Math.round(s.yes / s.total * 100) : 0, ...s }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 5)
    : [];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.625rem', marginBottom: '0.25rem' }}>
          Tableau de bord Admin
        </h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
          Vue globale de la plateforme FNI·AI — {new Date().toLocaleDateString('fr-CA', { dateStyle: 'long' })}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: <Building2 size={22} color="var(--brand-red)" />,  cls: 'red',   value: loading ? '—' : stats?.totalDealers,       label: 'Concessionnaires' },
          { icon: <Users size={22} color="var(--success)" />,        cls: 'green', value: loading ? '—' : stats?.totalUsers,         label: 'Utilisateurs' },
          { icon: <FileText size={22} color="var(--info)" />,        cls: 'blue',  value: loading ? '—' : stats?.totalPresentations, label: 'Présentations' },
          { icon: <TrendingUp size={22} color="var(--warning)" />,   cls: 'amber', value: loading ? '—' : `${stats?.avgProtectionRate || 0}%`, label: 'Taux de protection moyen' },
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.cls}`}>
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent dealers */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Building2 size={16} color="var(--brand-red)" /> Concessionnaires actifs
            </h3>
            <button className="btn-ghost" style={{ fontSize: '0.775rem' }} onClick={() => navigate('/admin/dealers')}>
              Gérer <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Chargement…</p>
          ) : dealers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-tertiary)' }}>
              <Building2 size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.85rem' }}>Aucun concessionnaire encore</p>
              <button className="btn-primary" style={{ marginTop: '0.75rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                onClick={() => navigate('/admin/dealers')}>
                Créer un concessionnaire
              </button>
            </div>
          ) : dealers.map(d => (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.625rem 0',
              borderBottom: '1px solid var(--border-sm)',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '8px',
                background: 'var(--brand-red-light)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
              }}>🏢</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{d.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{d.city || d.address || '—'}</div>
              </div>
              <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => navigate('/admin/dealers')}>
                Voir <ArrowRight size={11} />
              </button>
            </div>
          ))}
        </div>

        {/* Top products */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <BarChart2 size={16} color="var(--success)" /> Produits — Taux d'adhésion
            </h3>
            <button className="btn-ghost" style={{ fontSize: '0.775rem' }} onClick={() => navigate('/admin/reports')}>
              Rapports <ArrowRight size={12} />
            </button>
          </div>
          {topProducts.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Pas encore de données</p>
          ) : topProducts.map(p => (
            <div key={p.id} style={{ marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>{p.id}</span>
                <span style={{ fontSize: '0.825rem', fontWeight: 800,
                  color: p.rate >= 60 ? 'var(--success)' : p.rate >= 30 ? 'var(--warning)' : 'var(--brand-red)' }}>
                  {p.rate}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${p.rate}%`,
                  background: p.rate >= 60 ? 'var(--success)' : p.rate >= 30 ? 'var(--warning)' : 'var(--brand-red)',
                }} />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                {p.yes} sur {p.total} présentations
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
