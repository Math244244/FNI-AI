import { getEnrichedById, resolvePriceCents } from './pricingResolver.js';

/**
 * Supporte l’ancien format (string) et v2 (objet avec .interest)
 * @param {string|{ interest?: string }|null|undefined} r
 * @returns {string|undefined}
 */
export function getInterest(r) {
  if (r == null) return undefined;
  if (typeof r === 'string') return r;
  return r.interest;
}

export function isYes(r) { return getInterest(r) === 'yes'; }
export function isNo(r) { return getInterest(r) === 'no'; }
export function isMaybe(r) { return getInterest(r) === 'maybe'; }

/**
 * Construit l’objet de réponse v2 (merge avec l’existant y compris string hérité).
 * @param {any} prev
 * @param {object} product — entrée enrichie (pricingMode, defaultTierId)
 * @param {'yes'|'no'|'maybe'} interest
 * @param {{ pricing?: object }|null} dealerSettingsWrapper — { pricing } comme dealerSettings
 */
export function buildResponseV2Entry(prev, product, interest, dealerSettingsWrapper) {
  const base = typeof prev === 'string' ? { interest: prev } : { ...(prev || {}) };
  const next = { ...base, interest };
  if (product?.pricingMode === 'tiers' && !base.tierId) {
    const e = getEnrichedById(product.id) || product;
    const tid = e?.defaultTierId;
    if (tid) {
      next.tierId = tid;
      next.priceCents = resolvePriceCents(e, dealerSettingsWrapper, tid, null);
    }
  }
  return next;
}
