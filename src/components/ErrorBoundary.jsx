import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (typeof window !== 'undefined' && window.console) {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--bg-page)',
          textAlign: 'center',
          gap: 16,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--r-lg)',
            background: 'var(--danger-light)',
            color: 'var(--crimson-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={28} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'var(--fs-2xl)',
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Une anomalie est survenue
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            maxWidth: 520,
            fontSize: 'var(--fs-sm)',
            margin: 0,
          }}>
            Nous avons rencontré un problème inattendu.
            Rechargez la page — vos données récentes sont préservées.
          </p>
          {this.state.error?.message && (
            <code style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-xs)',
              color: 'var(--text-tertiary)',
              padding: '0.5rem 0.75rem',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--r-sm)',
              maxWidth: 520,
            }}>
              {String(this.state.error.message)}
            </code>
          )}
          <button
            onClick={this.handleReset}
            style={{
              background: 'var(--graphite-900)',
              color: 'var(--ivoire-100)',
              border: 'none',
              borderRadius: 'var(--r-md)',
              padding: '0.75rem 1.5rem',
              fontSize: 'var(--fs-sm)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              marginTop: 8,
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <RefreshCw size={16} />
            Recharger l'application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
