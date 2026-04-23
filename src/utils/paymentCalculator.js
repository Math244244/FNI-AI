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
