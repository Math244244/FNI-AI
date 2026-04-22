import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Building2, BarChart2, LogOut, Shield,
} from 'lucide-react';

const NAV = [
  { to: '/admin',         label: 'Vue d\'ensemble', icon: LayoutDashboard, end: true },
  { to: '/admin/dealers', label: 'Concessionnaires', icon: Building2 },
  { to: '/admin/reports', label: 'Rapports',          icon: BarChart2 },
];

export default function AdminLayout() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <span className="topbar-logo">
            Avantage <span>Plus</span>
            <span className="topbar-badge">FNI·AI</span>
          </span>
          <span className="topbar-divider" />
          <span style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600,
          }}>
            <Shield size={13} color="var(--brand-red)" /> SUPER ADMIN
          </span>
        </div>
        <div className="topbar-actions">
          <button className="topbar-btn" onClick={() => navigate('/dashboard')}>
            Tableau de bord
          </button>
          <span className="topbar-divider" />
          <span className="topbar-user">{currentUser?.email}</span>
          <button className="topbar-btn danger" onClick={handleLogout}>
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <nav className="admin-sidebar">
          <div className="sidebar-label">Navigation</div>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}

          {/* Footer */}
          <div style={{ marginTop: 'auto', padding: '1.25rem', borderTop: '1px solid var(--border-sm)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
              Connecté en tant que
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, wordBreak: 'break-all' }}>
              {currentUser?.email}
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
