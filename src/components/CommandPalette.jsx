import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, Car, FileText, Settings as SettingsIcon,
  Users, LogOut, Moon, Sun, BarChart2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const CommandPaletteCtx = createContext(null);

export function CommandPaletteProvider({ children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(() => ({ open, setOpen, toggle: () => setOpen((o) => !o) }), [open]);

  return (
    <CommandPaletteCtx.Provider value={value}>
      {children}
    </CommandPaletteCtx.Provider>
  );
}

export function useCommandPalette() {
  return useContext(CommandPaletteCtx) || { open: false, setOpen: () => {}, toggle: () => {} };
}

export default function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();
  const { currentUser, userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const go = useCallback((to) => {
    setOpen(false);
    setTimeout(() => navigate(to), 40);
  }, [navigate, setOpen]);

  if (!open) return null;

  const isAdmin = userProfile?.role === 'superAdmin';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Palette de commandes"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(14,14,17,0.45)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 'var(--z-cmdk)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 'clamp(3rem, 12vh, 8rem)',
      }}
    >
      <Command
        label="Palette de commandes"
        style={{
          width: 'min(640px, calc(100vw - 2rem))',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-md)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          fontFamily: 'var(--font-body)',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0.9rem 1.1rem',
          borderBottom: '1px solid var(--border-hair)',
        }}>
          <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
          <Command.Input
            autoFocus
            placeholder="Rechercher une action, une page, un client…"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: 'var(--fs-base)',
              fontFamily: 'inherit',
            }}
          />
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.2rem 0.45rem',
            borderRadius: 'var(--r-xs)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-md)',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
          }}>ESC</span>
        </div>

        <Command.List style={{ maxHeight: 380, overflowY: 'auto', padding: '0.5rem' }}>
          <Command.Empty style={{
            padding: '1.5rem',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: 'var(--fs-sm)',
          }}>
            Aucun résultat.
          </Command.Empty>

          <Command.Group heading="Navigation" style={cmdGroupStyle}>
            {!isAdmin && (
              <CmdItem icon={<LayoutDashboard size={16} />} onSelect={() => go('/dashboard')} shortcut="G D">
                Tableau de bord
              </CmdItem>
            )}
            {!isAdmin && (
              <CmdItem icon={<Car size={16} />} onSelect={() => go('/select-vehicle')} shortcut="G V">
                Nouvelle présentation
              </CmdItem>
            )}
            {!isAdmin && (
              <CmdItem icon={<BarChart2 size={16} />} onSelect={() => go('/reports')} shortcut="G R">
                Rapports
              </CmdItem>
            )}
            {!isAdmin && (
              <CmdItem icon={<SettingsIcon size={16} />} onSelect={() => go('/settings')} shortcut="G S">
                Paramètres
              </CmdItem>
            )}
            {isAdmin && (
              <>
                <CmdItem icon={<LayoutDashboard size={16} />} onSelect={() => go('/admin')}>Admin · Tableau de bord</CmdItem>
                <CmdItem icon={<Users size={16} />} onSelect={() => go('/admin/dealers')}>Admin · Concessionnaires</CmdItem>
                <CmdItem icon={<FileText size={16} />} onSelect={() => go('/admin/reports')}>Admin · Rapports</CmdItem>
              </>
            )}
          </Command.Group>

          <Command.Group heading="Actions" style={cmdGroupStyle}>
            <CmdItem
              icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              onSelect={() => { toggleTheme(); setOpen(false); }}
            >
              Basculer en mode {theme === 'dark' ? 'jour' : 'cinéma'}
            </CmdItem>
            {currentUser && (
              <CmdItem
                icon={<LogOut size={16} />}
                onSelect={async () => { setOpen(false); try { await logout(); } catch {} }}
              >
                Se déconnecter
              </CmdItem>
            )}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

const cmdGroupStyle = {
  padding: '0.25rem 0.25rem',
};

function CmdItem({ icon, children, onSelect, shortcut }) {
  return (
    <Command.Item
      onSelect={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0.65rem 0.85rem',
        borderRadius: 'var(--r-md)',
        cursor: 'pointer',
        fontSize: 'var(--fs-sm)',
        color: 'var(--text-primary)',
      }}
      className="cmdk-item"
    >
      <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
      <span style={{ flex: 1 }}>{children}</span>
      {shortcut && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--text-tertiary)',
        }}>{shortcut}</span>
      )}
    </Command.Item>
  );
}
