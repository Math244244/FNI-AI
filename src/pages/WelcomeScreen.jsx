import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePresentation } from '../context/PresentationContext';
import VehicleImage from '../components/slide/VehicleImage';

/**
 * WelcomeScreen — écran cérémonial 3s avant slide 1
 * « Bienvenue Luc, votre Grand Caravan vous attend »
 */
export default function WelcomeScreen({ duration = 3000, onComplete }) {
  const navigate = useNavigate();
  const { vehicle, clientName } = usePresentation();

  useEffect(() => {
    const t = setTimeout(() => {
      if (onComplete) onComplete();
      else navigate('/presentation');
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onComplete, navigate]);

  const firstName = (clientName || '').split(' ')[0];

  return (
    <div
      onClick={() => { if (onComplete) onComplete(); else navigate('/presentation'); }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0E0E11 0%, #1A1A1F 50%, #12120F 100%)',
        color: 'var(--ivoire-100)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        padding: '3rem',
      }}
    >
      {/* Watermark */}
      <span aria-hidden style={{
        position: 'absolute',
        top: '-0.15em',
        right: '-0.1em',
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: 'clamp(400px, 55vw, 900px)',
        lineHeight: 0.85,
        color: 'rgba(184, 147, 90, 0.08)',
        letterSpacing: '-0.05em',
        pointerEvents: 'none',
      }}>A+</span>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, width: '100%', textAlign: 'center' }}>
        <span className="overline" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', display: 'block' }}>
          Avantage Plus
        </span>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
          lineHeight: 1.05,
          letterSpacing: '-0.025em',
          color: '#fff',
          margin: 0,
          animation: 'welcomeFade 1200ms var(--ease-out) both',
        }}>
          {firstName ? `Bienvenue, ${firstName}.` : 'Bienvenue.'}
        </h1>
        {vehicle?.make && (
          <p style={{
            marginTop: '1rem',
            fontSize: 'var(--fs-lg)',
            color: 'rgba(255,255,255,0.75)',
            animation: 'welcomeFade 1400ms 200ms var(--ease-out) both',
          }}>
            Votre {vehicle.year} {vehicle.make} {vehicle.model} vous attend.
          </p>
        )}
        {vehicle?.make && (
          <div style={{
            marginTop: '3rem',
            height: 'clamp(180px, 28vh, 320px)',
            animation: 'welcomeFade 1600ms 400ms var(--ease-out) both',
            filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.45))',
          }}>
            <VehicleImage
              year={vehicle.year}
              make={vehicle.make}
              model={vehicle.model}
              category={vehicle.category}
              angle={23}
              width={1200}
            />
          </div>
        )}
        <div style={{
          marginTop: '3rem',
          fontSize: 'var(--fs-xs)',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.08em',
          animation: 'welcomeFade 1800ms 800ms var(--ease-out) both',
        }}>
          Cliquez n’importe où pour commencer
        </div>
      </div>

      <style>{`
        @keyframes welcomeFade {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
