import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const GoogleGlyph = () => (
  <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.4 29.4 35.5 24 35.5c-6.3 0-11.5-5.2-11.5-11.5S17.7 12.5 24 12.5c2.9 0 5.5 1.1 7.5 2.9l5.7-5.7C33.5 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.7 15.1 19 12.5 24 12.5c2.9 0 5.5 1.1 7.5 2.9l5.7-5.7C33.5 6.5 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.1z"/>
    <path fill="#4CAF50" d="M24 43.5c4.9 0 9.3-1.9 12.7-5l-5.9-4.9c-2 1.4-4.5 2.3-6.8 2.3-5.4 0-9.8-3.5-11.3-8.4l-6.5 5C9.4 38.9 16.1 43.5 24 43.5z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2 3.9-3.8 5.2l5.9 4.9c-.4.4 6.1-4.4 6.1-14.1 0-1.2-.1-2.3-.3-3.5z"/>
  </svg>
);
import Button from '../components/ui/Button';

export default function Login() {
  const { loginWithEmail, loginWithGoogle, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const go = () => navigate('/dashboard');

  const handleEmail = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true); setError('');
    try {
      await loginWithEmail(email, password);
      go();
    } catch (err) {
      const msg = {
        'auth/invalid-credential':      'Identifiants incorrects. Vérifiez votre courriel et mot de passe.',
        'auth/user-not-found':          'Aucun compte trouvé avec ce courriel.',
        'auth/wrong-password':          'Mot de passe incorrect.',
        'auth/too-many-requests':       'Trop de tentatives. Réessayez dans quelques minutes.',
        'auth/network-request-failed':  'Erreur réseau. Vérifiez votre connexion.',
      }[err.code] || 'Erreur de connexion. Réessayez.';
      setError(msg);
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try { await loginWithGoogle(); go(); }
    catch { setError('Connexion Google annulée.'); }
    finally { setLoading(false); }
  };

  const handleDemo = () => { loginAsDemo(); go(); };

  return (
    <div
      className="login-layout"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1.15fr 1fr',
        background: 'var(--bg-page)',
      }}
    >
      {/* Hero éditorial — gauche */}
      <aside
        className="login-hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(155deg, var(--graphite-900) 0%, #1A1A1F 50%, #12120F 100%)',
          color: 'var(--ivoire-100)',
          padding: 'clamp(2.5rem, 6vw, 5rem)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Or fumé watermark */}
        <span aria-hidden style={{
          position: 'absolute',
          top: '-0.2em',
          right: '-0.15em',
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'clamp(320px, 44vw, 700px)',
          lineHeight: 0.82,
          color: 'rgba(184, 147, 90, 0.09)',
          letterSpacing: '-0.06em',
          pointerEvents: 'none',
          userSelect: 'none',
          fontWeight: 400,
        }}>A<span style={{ color: 'rgba(184, 147, 90, 0.15)' }}>+</span></span>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span className="overline" style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '0.5rem' }}>
            Avantage Plus · F&I Prestige
          </span>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(2.75rem, 4.5vw, 4.25rem)',
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            color: '#fff',
            maxWidth: '14ch',
          }}>
            L’expérience F&I <span style={{ color: 'var(--or-500)' }}>2.0</span>, signée par vos meilleurs directeurs.
          </div>
          <p style={{
            marginTop: '1.75rem',
            fontSize: 'var(--fs-md)',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.72)',
            maxWidth: '46ch',
          }}>
            Une plateforme prestige, binaire et rapide. Chaque produit, chaque décision, chaque client — valorisé jusqu’à la poignée de main.
          </p>

          <ul style={{
            marginTop: 'auto',
            paddingTop: '3rem',
            listStyle: 'none',
            padding: 0,
            display: 'grid',
            gap: '0.65rem',
          }}>
            {[
              'Présentations binaires : Important / Pas important',
              'Véhicule ancré, prix mensuel, notes directeur',
              'Takeaway digital automatique après la séance',
            ].map((t) => (
              <li key={t} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: 'rgba(255,255,255,0.8)',
                fontSize: 'var(--fs-sm)',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(184,147,90,0.18)',
                  color: 'var(--or-500)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(184,147,90,0.28)',
                }}>
                  <Sparkles size={12} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Form — droite */}
      <main style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(2rem, 5vw, 4rem)',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <header style={{ marginBottom: '2rem' }}>
            <span className="overline">Connexion</span>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'var(--fs-3xl)',
              letterSpacing: '-0.02em',
              margin: '0.25rem 0 0.35rem',
            }}>
              Heureux de vous revoir.
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)', margin: 0 }}>
              Accédez à votre portail F&I Avantage Plus.
            </p>
          </header>

          {error && (
            <div style={{
              padding: '0.75rem 0.9rem',
              borderRadius: 'var(--r-md)',
              background: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              color: 'var(--crimson-500)',
              fontSize: 'var(--fs-xs)',
              marginBottom: '1.25rem',
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Courriel</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="votre@courriel.ca"
                  required
                  autoFocus
                  className="form-input"
                  style={{ paddingLeft: 34 }}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
                }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  required
                  className="form-input"
                  style={{ paddingLeft: 34, paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                  style={{
                    position: 'absolute', right: 10, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-tertiary)', padding: 4,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              loading={loading}
              iconRight={!loading ? <ArrowRight size={16} /> : null}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-hair)' }} />
            <span style={{ fontSize: 'var(--fs-2xs)', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.08em' }}>OU</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-hair)' }} />
          </div>

          <Button
            variant="outline"
            onClick={handleGoogle}
            disabled={loading}
            style={{ width: '100%', marginBottom: '0.5rem' }}
            icon={<GoogleGlyph />}
          >
            Continuer avec Google
          </Button>

          <button
            onClick={handleDemo}
            style={{
              width: '100%', padding: '0.5rem',
              background: 'transparent', border: 'none',
              color: 'var(--text-tertiary)', fontSize: 'var(--fs-xs)',
              cursor: 'pointer', fontWeight: 500,
              transition: 'var(--tx)',
              fontStyle: 'italic',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            Mode démo — sans compte Firebase
          </button>

          <div style={{
            marginTop: '2rem', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 'var(--fs-2xs)', color: 'var(--text-tertiary)',
          }}>
            <ShieldCheck size={12} /> Connexion sécurisée et chiffrée · SSO compatible
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .login-layout { grid-template-columns: 1fr !important; }
          .login-hero { display: none !important; }
        }
      `}</style>
    </div>
  );
}
