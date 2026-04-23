import { Money } from './money.js';

export const PERIODS_PER_YEAR = {
  monthly: 12,
  biweekly: 26,
  weekly: 52,
};

/**
 * Nombre de versements sur la durée du prêt.
 * @param {number} termMonths
 * @param {'monthly'|'biweekly'|'weekly'} frequency
 */
export function numberOfPayments(termMonths, frequency) {
  const ppy = PERIODS_PER_YEAR[frequency];
  if (!ppy) throw new Error(`Fréquence inconnue: ${frequency}`);
  const years = termMonths / 12;
  return Math.max(1, Math.round(years * ppy));
}

/**
 * Paiement périodique (même unité que `principalCents` = cents).
 * Formule d’annuité : P * r(1+r)^n / ((1+r)^n - 1)
 *
 * @param {object} p
 * @param {number} p.annualRatePercent Taux d’intérêt annuel (ex. 4.9)
 * @param {number} p.termMonths Durée en mois
 * @param {number} p.principalCents Capital en cents
 * @param {'monthly'|'biweekly'|'weekly'} p.frequency
 * @returns {number} Paiement en cents (entier, arrondi)
 */
export function paymentPerPeriodCents({ annualRatePercent, termMonths, principalCents, frequency }) {
  const n = numberOfPayments(termMonths, frequency);
  const ppy = PERIODS_PER_YEAR[frequency];
  const r = (annualRatePercent / 100) / ppy;
  const p = Math.max(0, Math.round(principalCents));
  if (n <= 0) return 0;
  if (p === 0) return 0;
  if (r === 0) return Math.round(p / n);
  const factor = (1 + r) ** n;
  const pay = p * (r * factor) / (factor - 1);
  return Math.round(pay);
}

/**
 * Paiement (dollars) — pratique pour affichage.
 */
export function paymentPerPeriodDollars(params) {
  return paymentPerPeriodCents({ ...params, principalCents: Money.fromDollars(params.principalDollars).cents })
    / 100;
}

/**
 * Paiement périodique de LOCATION (bail) avec valeur résiduelle.
 *
 * Modèle actuariel (équivalent PMT Excel avec FV = -résiduel) :
 *   PMT = (PV − Résiduel / (1+r)^n) × r / (1 − (1+r)^−n)
 *        = (PV × (1+r)^n − Résiduel) × r / ((1+r)^n − 1)
 *
 * Où :
 *   - PV (capital financé / "cap cost") = valeur du véhicule (moins acompte/échange)
 *   - Résiduel = valeur garantie de rachat à la fin du bail
 *   - r        = taux périodique = (taux annuel / nb de périodes / an)
 *   - n        = nombre de périodes sur la durée du bail
 *
 * Par défaut, calcul en « fin de période » (annuité ordinaire), cohérent avec
 * `paymentPerPeriodCents`. Si `annuityDue=true`, on applique la convention
 * « début de période » (annuity-due), plus typique du leasing nord-américain.
 *
 * @param {object} p
 * @param {number} p.annualRatePercent Taux d’intérêt annuel (%)
 * @param {number} p.termMonths Durée du bail en mois
 * @param {number} p.capitalCents Capital loué en cents (cap cost)
 * @param {number} p.residualCents Valeur résiduelle en cents
 * @param {'monthly'|'biweekly'|'weekly'} p.frequency
 * @param {boolean} [p.annuityDue=false] Paiement dû en début de période
 * @returns {number} Paiement en cents (arrondi)
 */
export function leasePaymentPerPeriodCents({
  annualRatePercent, termMonths, capitalCents, residualCents, frequency, annuityDue = false,
}) {
  const n = numberOfPayments(termMonths, frequency);
  const ppy = PERIODS_PER_YEAR[frequency];
  const r = (annualRatePercent / 100) / ppy;
  const pv = Math.max(0, Math.round(capitalCents));
  const resid = Math.max(0, Math.round(residualCents));
  if (n <= 0) return 0;
  if (pv <= resid && r === 0) return 0;
  if (r === 0) return Math.max(0, Math.round((pv - resid) / n));
  const f = (1 + r) ** n;
  let pay = (pv * f - resid) * r / (f - 1);
  if (annuityDue) pay = pay / (1 + r);
  return Math.max(0, Math.round(pay));
}

/**
 * Charge d’intérêt totale d’un bail (pour affichage).
 * Retourne les cents d’intérêt payés sur la durée.
 */
export function leaseTotalInterestCents({
  annualRatePercent, termMonths, capitalCents, residualCents, frequency, annuityDue = false,
}) {
  const n = numberOfPayments(termMonths, frequency);
  const pay = leasePaymentPerPeriodCents({
    annualRatePercent, termMonths, capitalCents, residualCents, frequency, annuityDue,
  });
  const total = pay * n + Math.max(0, Math.round(residualCents));
  return Math.max(0, total - Math.max(0, Math.round(capitalCents)));
}
