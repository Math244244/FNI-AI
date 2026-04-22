import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader, Shield } from 'lucide-react';

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            fontSize: '2rem', fontWeight: 800,
            color: '#1A1A1A',
            fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
            letterSpacing: '-0.03em', marginBottom: '0.5rem',
          }}>
            Avantage <span style={{ color: '#D62828' }}>Plus</span>
            <span style={{
              fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.06em',
              background: 'rgba(214,40,40,0.05)', color: '#D62828',
              border: '1px solid rgba(214,40,40,0.15)',
              padding: '0.15rem 0.4rem', borderRadius: '4px',
              marginLeft: '0.5rem', verticalAlign: 'middle',
            }}>FNI·AI</span>
          </div>
          <div style={{ color: '#999', fontSize: '0.875rem', fontWeight: 500 }}>
            Portail de présentations F&I
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            background: 'rgba(220,38,38,0.05)',
            border: '1px solid rgba(220,38,38,0.12)',
            color: '#DC2626',
            fontSize: '0.825rem',
            marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleEmail}>
          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block', fontSize: '0.8rem', fontWeight: 600,
              color: '#555', marginBottom: '0.4rem',
            }}>Courriel</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{
                position: 'absolute', left: '0.875rem', top: '50%',
                transform: 'translateY(-50%)', color: '#BDBDBD',
              }} />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="votre@courriel.ca"
                required
                autoFocus
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.625rem',
                  borderRadius: '12px', fontSize: '0.9rem',
                  background: '#FFFFFF',
                  border: '1.5px solid #E5E5E5',
                  color: '#1A1A1A', fontFamily: 'inherit',
                  outline: 'none', transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#D62828'; e.target.style.boxShadow = '0 0 0 3px rgba(214,40,40,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = '#E5E5E5'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{
              display: 'block', fontSize: '0.8rem', fontWeight: 600,
              color: '#555', marginBottom: '0.4rem',
            }}>Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{
                position: 'absolute', left: '0.875rem', top: '50%',
                transform: 'translateY(-50%)', color: '#BDBDBD',
              }} />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '0.75rem 2.75rem 0.75rem 2.625rem',
                  borderRadius: '12px', fontSize: '0.9rem',
                  background: '#FFFFFF',
                  border: '1.5px solid #E5E5E5',
                  color: '#1A1A1A', fontFamily: 'inherit',
                  outline: 'none', transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#D62828'; e.target.style.boxShadow = '0 0 0 3px rgba(214,40,40,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = '#E5E5E5'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(s => !s)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#BDBDBD', padding: '0.2rem',
                }}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.85rem',
              background: loading ? '#E5E5E5' : '#D62828',
              color: loading ? '#999' : 'white',
              borderRadius: '12px',
              fontWeight: 700, fontSize: '0.9rem',
              border: 'none', cursor: loading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(214,40,40,0.18)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#C02020'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
            onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#D62828'; e.currentTarget.style.transform = 'translateY(0)'; }}}
          >
            {loading
              ? <><Loader size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Connexion…</>
              : <>Se connecter <ArrowRight size={15} /></>}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: 1, background: '#F0F0F0' }} />
          <span style={{ fontSize: '0.725rem', color: '#BDBDBD', fontWeight: 600, letterSpacing: '0.05em' }}>OU</span>
          <div style={{ flex: 1, height: 1, background: '#F0F0F0' }} />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%', padding: '0.795rem',
            background: '#FFFFFF',
            border: '1.5px solid #E5E5E5',
            color: '#424242', borderRadius: '12px',
            fontWeight: 600, fontSize: '0.85rem',
            cursor: 'pointer', marginBottom: '0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#D5D5D5'; e.currentTarget.style.background = '#FAFAFA'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.background = '#FFFFFF'; }}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{ width: 16, height: 16 }} />
          Continuer avec Google
        </button>

        {/* Demo */}
        <button
          onClick={handleDemo}
          style={{
            width: '100%', padding: '0.625rem',
            background: 'transparent', border: 'none',
            color: '#BDBDBD', fontSize: '0.775rem',
            cursor: 'pointer', fontWeight: 500,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#999'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#BDBDBD'; }}
        >
          Mode démo — sans compte Firebase
        </button>

        {/* Footer */}
        <div style={{
          marginTop: '2rem', textAlign: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
          fontSize: '0.75rem', color: '#BDBDBD',
        }}>
          <Shield size={12} /> Connexion sécurisée et chiffrée
        </div>
      </div>

    </div>
  );
}
