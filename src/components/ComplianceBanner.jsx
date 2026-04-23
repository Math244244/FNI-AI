import React, { useState } from 'react';

/**
 * Rappel conformité (AMF / OPC / Loi sur la protection du consommateur) — texte informatif.
 * Ne remplace pas un avis juridique.
 */
export default function ComplianceBanner({ style }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        fontSize: 'var(--fs-xs)',
        color: 'var(--text-tertiary)',
        lineHeight: 1.5,
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          color: 'inherit',
          textDecoration: 'underline',
          cursor: 'pointer',
          font: 'inherit',
        }}
      >
        Information réglementaire
      </button>
      {open && (
        <div style={{ marginTop: 6, maxWidth: 640 }}>
          Les montants, taux et produits F&amp;I présentés dans cet outil servent d’aide à la vente.
          Ils doivent être vérifiés en concession, documentés sur les formules officielles (crédit,
          assurances) et offerts selon le droit des contrats de consommation (Québec). Les
          sollicitations liées à l’assurance de personnes doivent respecter le cadre applicable
          (incl. consentement, divulgation). Validez la conformité avec votre service conformité ou
          vos conseillers légaux.
        </div>
      )}
    </div>
  );
}
