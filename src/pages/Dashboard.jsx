import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUserStats, getUserPresentations } from '../services/presentationService';
import {
  BarChart2, Play, Send, Settings, LogOut,
  TrendingUp, FileText, Shield, ArrowRight, User, Sparkles, Moon, Sun,
} from 'lucide-react';

export default function Dashboard() {
  const { currentUser, userProfile, isDemo, isSuperAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats]   = useState({ total: 0, thisMonth: 0, avgProtectionRate: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayName = currentUser?.displayName?.split(' ')[0] || userProfile?.displayName?.split(' ')[0] || 'Conseiller';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const dealerName = userProfile?.dealerName || 'Avantage Plus';

  useEffect(() => {
    if (isDemo) { setLoading(false); return; }
    async function load() {
      try {
        const [s, r] = await Promise.all([
          getUserStats(currentUser.uid),
          getUserPresentations(currentUser.uid),
        ]);
        setStats(s);
        setRecent(r.slice(0, 5));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [currentUser, isDemo]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="app-container">
      {/* Top Bar */}
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="topbar-logo">
            Avantage <span>Plus</span>
            <span className="topbar-badge">FNI·AI</span>
          </span>
          {userProfile?.dealerName && (
            <>
              <span className="topbar-divider" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                {userProfile.dealerName}
              </span>
            </>
          )}
        </div>

        <div className="topbar-actions">
          {isSuperAdmin && (
            <button className="topbar-btn" onClick={() => navigate('/admin')}>
              <Shield size={14} /> Admin
            </button>
          )}
          <button className="topbar-btn" onClick={() => navigate('/reports')}>
            <BarChart2 size={14} /> Rapports
          </button>
          <button className="topbar-btn" onClick={() => navigate('/settings')} aria-label="Paramètres">
            <Settings size={14} />
          </button>
          <button className="topbar-btn" onClick={toggleTheme} aria-label="Basculer le thème">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <span className="topbar-divider" />
          <span className="topbar-user">{currentUser?.email}</span>
          <button className="topbar-btn danger" onClick={handleLogout}>
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        {/* Header éditorial */}
        <div style={{ marginBottom: '2.5rem' }} className="animate-up">
          <span className="overline">
            {new Date().toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <h1 className="display-italic" style={{
            fontSize: 'var(--fs-3xl)',
            margin: '0.35rem 0 0.25rem',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
            {greeting}, {displayName}.
            {isDemo && <span className="badge badge-amber" style={{ marginLeft: '0.25rem' }}>Mode démo</span>}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', margin: 0 }}>
            {dealerName} · votre tableau de bord F&I
          </p>
        </div>

        {/* KPI row */}
        {!isDemo && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1rem', marginBottom: '2.5rem' }} className="animate-up stagger">
            <KpiCard label="Présentations" value={loading ? '—' : stats.total} accent="gold" icon={<FileText size={15} />} />
            <KpiCard label="Ce mois-ci" value={loading ? '—' : stats.thisMonth} accent="green" icon={<TrendingUp size={15} />} />
            <KpiCard label="Taux de protection" value={loading ? '—' : `${stats.avgProtectionRate}%`} accent="dark" icon={<Shield size={15} />} />
          </div>
        )}

        {/* Action cards */}
        <div style={{ marginBottom: '2rem' }}>
          <div className="section-label">Nouvelle présentation</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', maxWidth: '800px' }} className="animate-up stagger">
            {/* Live */}
            <div
              className="card-action"
              onClick={() => navigate('/select-vehicle')}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '14px',
                background: 'var(--brand-red-light)',
                border: '1px solid var(--brand-red-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <Play size={24} color="var(--brand-red)" />
              </div>
              <h3 style={{ marginBottom: '0.35rem' }}>Présentation Live</h3>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Présentez en temps réel avec votre client en concession
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-red)', fontSize: '0.8125rem', fontWeight: 700 }}>
                Démarrer <ArrowRight size={14} />
              </div>
            </div>

            {/* Remote */}
            <div
              className="card-action"
              onClick={() => navigate('/select-vehicle?mode=remote')}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '14px',
                background: 'var(--info-light)',
                border: '1px solid var(--info-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <Send size={24} color="var(--info)" />
              </div>
              <h3 style={{ marginBottom: '0.35rem' }}>Envoi à Distance</h3>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Générez un lien pour que le client complète à son rythme
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--info)', fontSize: '0.8125rem', fontWeight: 700 }}>
                Préparer <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent presentations */}
        {!isDemo && recent.length > 0 && (
          <div className="animate-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <div className="section-label">Présentations récentes</div>
              <button className="btn-ghost" style={{ fontSize: '0.8rem' }} onClick={() => navigate('/reports')}>
                Voir tout <ArrowRight size={12} />
              </button>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {recent.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.875rem 1.25rem',
                  borderBottom: i < recent.length - 1 ? '1px solid var(--border-sm)' : 'none',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: 'var(--bg-subtle)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontSize: '1rem',
                  }}>
                    <User size={14} color="var(--text-tertiary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {p.clientName || 'Client'}
                    </div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-tertiary)' }}>
                      {p.vehicle?.year} {p.vehicle?.make} {p.vehicle?.model}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${p.protectionRate >= 60 ? 'badge-green' : p.protectionRate >= 30 ? 'badge-amber' : 'badge-red'}`}>
                      {p.protectionRate}%
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                      {p.createdAt?.toDate ? new Date(p.createdAt.toDate()).toLocaleDateString('fr-CA') : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demo hint */}
        {isDemo && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1.25rem 1.5rem',
            background: 'var(--warning-light)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--r-lg)',
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          }}>
            <Sparkles size={16} style={{ marginTop: '0.15rem', color: 'var(--warning)' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--warning)', marginBottom: '0.2rem' }}>
                Mode démo actif
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                Les statistiques et sauvegardes sont désactivées. Connectez-vous avec un compte pour accéder à toutes les fonctionnalités.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function KpiCard({ label, value, accent = 'gold', icon }) {
  const accentMap = {
    gold:  { color: 'var(--or-700)',      bg: 'var(--or-100)',            border: 'var(--border-warm)' },
    green: { color: 'var(--forest-600)',  bg: 'var(--brand-green-light)', border: 'var(--brand-green-border)' },
    red:   { color: 'var(--crimson-500)', bg: 'var(--danger-light)',      border: 'var(--danger-border)' },
    dark:  { color: 'var(--graphite-900)',bg: 'var(--graphite-50)',       border: 'var(--border-hair)' },
  }[accent];
  return (
    <div
      className="card"
      style={{
        padding: '1.25rem 1.35rem',
        borderLeft: `3px solid ${accentMap.color}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 26, height: 26,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 'var(--r-sm)',
          background: accentMap.bg,
          border: `1px solid ${accentMap.border}`,
          color: accentMap.color,
        }}>{icon}</span>
        <span className="overline" style={{ marginBottom: 0 }}>{label}</span>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontWeight: 600,
        fontSize: 'var(--fs-3xl)',
        lineHeight: 1,
        letterSpacing: '-0.02em',
        color: 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
    </div>
  );
}
