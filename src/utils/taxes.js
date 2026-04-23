/**
 * @typedef {{ gstPercent: number, qstPercent: number }} QcTaxRates
 */

/** Taux par défaut Québec (TPS + TVQ) — configurer par concession en prod. */
export const DEFAULT_QC_TAX = {
  gstPercent: 5,
  qstPercent: 9.975,
};

/**
 * TTC sur le montant HT (en cents).
 * @param {number} amountCents
 * @param {QcTaxRates} [rates]
 * @param {boolean} [taxable]
 */
export function withQcTaxCents(amountCents, rates = DEFAULT_QC_TAX, taxable = true) {
  if (!taxable) return Math.round(amountCents);
  const f = 1 + (rates.gstPercent + rates.qstPercent) / 100;
  return Math.round(amountCents * f);
}
