import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-page)',
      padding: '2rem',
      textAlign: 'center',
      gap: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontWeight: 500,
        fontSize: 'clamp(12rem, 32vw, 28rem)',
        color: 'var(--ivoire-200)',
        lineHeight: 1,
        userSelect: 'none',
        zIndex: 0,
        letterSpacing: '-0.05em',
      }}>
        404
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <span className="overline">Page introuvable</span>
        <h1 className="display-italic" style={{ fontSize: 'var(--fs-4xl)', margin: 0 }}>
          Cette route n'existe pas.
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 480, margin: 0 }}>
          La page que vous cherchez a été déplacée ou n'a jamais existé.
          Retournons à l'accueil.
        </p>
        <Link
          to="/"
          style={{
            marginTop: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '0.75rem 1.5rem',
            background: 'var(--graphite-900)',
            color: 'var(--ivoire-100)',
            borderRadius: 'var(--r-md)',
            fontWeight: 600,
            fontSize: 'var(--fs-sm)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
