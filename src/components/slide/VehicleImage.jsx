import React, { useState, useEffect } from 'react';
import { Car } from 'lucide-react';

/**
 * VehicleImage — cascade fallback :
 *   1) CDN imagin.studio (tentée pour toutes les catégories, silencieusement)
 *   2) Silhouette Lucide (Car) dans la teinte graphite si échec CDN ou sans marque/modèle.
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
  const [failed, setFailed] = useState(false);

  useEffect(() => { setFailed(false); }, [year, make, model, category]);

  const baseUrl = make && model
    ? `https://cdn.imagin.studio/getimage?customer=img&make=${encodeURIComponent(make)}&modelFamily=${encodeURIComponent(model)}&modelYear=${year || new Date().getFullYear()}&angle=${angle}&width=${width}`
    : null;

  if (baseUrl && !failed) {
    return (
      <img
        src={baseUrl}
        alt={alt || `${year || ''} ${make} ${model}`.trim() || `Véhicule ${category}`}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
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

  return (
    <div
      role="img"
      aria-label={alt || `Silhouette ${category}`}
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
