import React, { useState, useEffect } from 'react';
import { Car } from 'lucide-react';

/**
 * VehicleImage — cascade fallback
 * 1) cdn.imagin.studio (angle configurable)
 * 2) silhouette SVG selon catégorie
 * 3) monogramme Fraunces initiales marque
 */
export default function VehicleImage({
  year,
  make,
  model,
  angle = 23,
  width = 800,
  category = 'automobile',
  alt,
  style,
  fit = 'contain',
}) {
  const [stage, setStage] = useState(0);

  useEffect(() => { setStage(0); }, [year, make, model, category]);

  const baseUrl = make && model
    ? `https://cdn.imagin.studio/getimage?customer=img&make=${encodeURIComponent(make)}&modelFamily=${encodeURIComponent(model)}&modelYear=${year || new Date().getFullYear()}&angle=${angle}&width=${width}`
    : null;

  if (stage === 0 && baseUrl && category === 'automobile') {
    return (
      <img
        src={baseUrl}
        alt={alt || `${year || ''} ${make} ${model}`.trim()}
        loading="lazy"
        decoding="async"
        onError={() => setStage(1)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: fit,
          objectPosition: 'center',
          filter: 'drop-shadow(0 10px 30px rgba(14,14,17,0.08))',
          ...style,
        }}
      />
    );
  }

  if (stage <= 1) {
    return (
      <div
        role="img"
        aria-label={`Silhouette ${category}`}
        style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent',
          color: 'var(--graphite-300)',
          ...style,
        }}
      >
        <Car size="55%" strokeWidth={1.2} />
      </div>
    );
  }

  const initials = (make || '?').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500,
      fontSize: 'clamp(3rem, 12vw, 6rem)',
      color: 'var(--or-700)',
      letterSpacing: '-0.04em',
      ...style,
    }}>
      {initials}
    </div>
  );
}
