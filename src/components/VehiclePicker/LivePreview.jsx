import React from 'react';
import { User, Car, Calendar, Palette as PaletteIcon, Tag } from 'lucide-react';
import VehicleImage from '../slide/VehicleImage';
import Badge from '../ui/Badge';

/**
 * Aperçu live du véhicule configuré (colonne droite)
 */
export default function LivePreview({
  year, make, model, trim, color,
  category, subType, clientName, condition, transType, compact = false,
}) {
  const ready = year && make && model;

  return (
    <div
      style={{
        position: compact ? 'static' : 'sticky',
        top: 'calc(64px + 2rem)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-hair)',
        borderRadius: 'var(--r-xl)',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      <div className="overline" style={{ marginBottom: 6 }}>Aperçu live</div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontWeight: 500,
        fontSize: 'var(--fs-2xl)',
        letterSpacing: '-0.015em',
        color: 'var(--text-primary)',
        marginBottom: 14,
        lineHeight: 1.15,
        minHeight: '2.4em',
      }}>
        {ready ? (
          <>
            {year} {make}
            <br />
            <span style={{ fontStyle: 'italic', color: 'var(--or-700)' }}>{model}</span>
            {trim && <span style={{ fontStyle: 'normal', color: 'var(--text-secondary)', fontSize: 'var(--fs-md)' }}> · {trim}</span>}
          </>
        ) : (
          <span style={{ color: 'var(--text-tertiary)' }}>Votre véhicule apparaîtra ici</span>
        )}
      </div>

      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 10',
        background: 'var(--ivoire-50)',
        border: '1px solid var(--border-hair)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {ready && category === 'automobile' ? (
          <VehicleImage year={year} make={make} model={model} angle={23} />
        ) : (
          <Car size={64} style={{ color: 'var(--graphite-200)' }} />
        )}
      </div>

      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {clientName && <Badge tone="gold" icon={<User size={10} />}>{clientName}</Badge>}
        {condition && <Badge tone="gray">{condition === 'neuf' ? 'Neuf' : 'Occasion'}</Badge>}
        {transType && (
          <Badge tone="blue">
            {transType === 'financement' ? 'Financement' : transType === 'location' ? 'Location' : 'Comptant'}
          </Badge>
        )}
        {color && <Badge tone="amber" icon={<PaletteIcon size={10} />}>{color}</Badge>}
      </div>

      {ready && (
        <div style={{
          marginTop: 16,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          fontSize: 'var(--fs-xs)',
          color: 'var(--text-tertiary)',
        }}>
          <Row icon={<Calendar size={12} />} label="Année" value={year} />
          <Row icon={<Car size={12} />} label="Marque" value={make} />
          <Row icon={<Tag size={12} />} label="Modèle" value={model} />
          {trim && <Row icon={<Tag size={12} />} label="Version" value={trim} />}
        </div>
      )}
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: 'var(--text-tertiary)' }}>{icon}</span>
      <span style={{ color: 'var(--text-tertiary)' }}>{label} :</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
