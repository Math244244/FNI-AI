import { paymentPerPeriodCents, leasePaymentPerPeriodCents } from './paymentCalculator.js';
import {
  getEnrichedById,
  resolveCustomProductPriceCents,
  resolvePriceCents,
} from './pricingResolver.js';
import { withQcTaxCents, DEFAULT_QC_TAX } from './taxes.js';
import { getInterest } from './responseHelpers.js';

/**
 * Map intérêt slide → zone menu par défaut
 * @param {Record<string, any>} responses
 * @returns {Record<string, 'essentiel'|'recommande'|'premium'|'rejet'>}
 */
export function defaultPlacementsFromResponses(responses) {
  const out = {};
  Object.entries(responses || {}).forEach(([id, v]) => {
    const l = getInterest(v);
    if (l === 'yes') out[id] = 'premium';
    else if (l === 'maybe') out[id] = 'recommande';
    else if (l === 'no') out[id] = 'rejet';
  });
  return out;
}

/**
 * @param {object} product — enrichi
 * @param {object} [response]
 * @param {object|null} [dealerSettings]
 * @param {{ gstPercent: number, qstPercent: number }} [taxRates]
 */
export function productFinancedValueCents(product, response, dealerSettings, taxRates = DEFAULT_QC_TAX, categoryKey) {
  const p = getEnrichedById(product.id) || product;
  let base = 0;
  if (response?.priceCents != null) {
    base = response.priceCents;
  } else if (p.pricingMode === 'tiers' && response?.tierId) {
    base = resolvePriceCents(p, dealerSettings, response.tierId, null, categoryKey);
  } else if (p.isCustom) {
    base = resolveCustomProductPriceCents(
      p.pricingMode ? p : { ...p, pricingMode: 'fixed', defaultPriceCents: 0 },
      dealerSettings,
      categoryKey,
    );
  } else {
    base = resolvePriceCents(p, dealerSettings, null, null, categoryKey);
  }
  if (p.financed === false) return 0;
  return withQcTaxCents(base, taxRates, p.taxable !== false);
}

/**
 * @param {string[]} productIds
 * @param {object[]} allProducts
 * @param {Record<string, any>} responses
 * @param {object|null} dealerSettings
 * @param {string} [categoryKey]
 */
export function sumFinancedAddOnCentsForIds(
  productIds,
  allProducts,
  responses,
  dealerSettings,
  categoryKey,
) {
  const byId = Object.fromEntries(allProducts.map((p) => [p.id, p]));
  return productIds.reduce((s, id) => {
    const p = byId[id];
    if (!p) return s;
    return s + productFinancedValueCents(p, responses?.[id], dealerSettings, DEFAULT_QC_TAX, categoryKey);
  }, 0);
}

/**
 * Paliers cumulatifs d’inclusion : rejet exclus partout
 * @param {Record<string, 'essentiel'|'recommande'|'premium'|'rejet'>} placements
 * @param {'essentiel'|'recommande'|'premium'} level
 * @returns {string[]}
 */
export function productIdsForCumulativeLevel(placements, level) {
  const inCol = (id) => placements[id];
  if (level === 'essentiel') {
    return Object.keys(placements).filter((id) => inCol(id) === 'essentiel');
  }
  if (level === 'recommande') {
    return Object.keys(placements).filter(
      (id) => inCol(id) === 'essentiel' || inCol(id) === 'recommande',
    );
  }
  return Object.keys(placements).filter(
    (id) => inCol(id) === 'essentiel' || inCol(id) === 'recommande' || inCol(id) === 'premium',
  );
}

/**
 * Paiement périodique total si capital = véhicule + addOn (financé)
 * @returns {number|null} null si comptant / indéfini
 */
export function paymentForAddonCents(financing, addonCents) {
  if (!financing || financing.transactionType === 'comptant' || financing.basePaymentCents == null) {
    return null;
  }
  const cap = Math.max(0, Math.round((financing.capitalDollars || 0) * 100) + Math.round(addonCents));
  if (financing.transactionType === 'location') {
    const resid = Math.max(0, Math.round((financing.residualDollars || 0) * 100));
    return leasePaymentPerPeriodCents({
      annualRatePercent: financing.interestRate,
      termMonths: financing.termMonths,
      capitalCents: cap,
      residualCents: resid,
      frequency: financing.paymentFrequency,
      annuityDue: !!financing.annuityDue,
    });
  }
  return paymentPerPeriodCents({
    annualRatePercent: financing.interestRate,
    termMonths: financing.termMonths,
    principalCents: cap,
    frequency: financing.paymentFrequency,
  });
}

/**
 * Coût affiché dans le bandeau « Paiement total estimé ».
 *  - Financement / Location : paiement périodique TOTAL (véhicule + add-ons financés).
 *  - Comptant : total du véhicule + add-ons financés (et taxes côté add-ons).
 *
 * @returns {{ valueCents: number, isPeriodic: boolean }}
 */
export function displayColumnCost(financing, addonCents) {
  const safeAddOn = Math.round(addonCents || 0);
  const periodic = paymentForAddonCents(financing, safeAddOn);
  if (periodic != null) {
    return { valueCents: periodic, isPeriodic: true };
  }
  // Comptant : total véhicule + protections
  if (financing && financing.transactionType === 'comptant') {
    const vehicleCents = Math.max(
      0,
      Math.round((financing.totalDueCents != null)
        ? financing.totalDueCents
        : (financing.capitalDollars || 0) * 100),
    );
    return { valueCents: vehicleCents + safeAddOn, isPeriodic: false };
  }
  // Fallback (financing absent, etc.) : seulement les add-ons
  return { valueCents: safeAddOn, isPeriodic: false };
}

/**
 * Map intérêt slide → colonne binaire (Important / Pas important)
 * yes + maybe → important ; no → pas_important
 * @param {Record<string, any>} responses
 * @returns {Record<string, 'important'|'pas_important'>}
 */
export function defaultBinaryPlacementsFromResponses(responses) {
  const out = {};
  Object.entries(responses || {}).forEach(([id, v]) => {
    const l = getInterest(v);
    if (l === 'yes' || l === 'maybe') out[id] = 'important';
    else if (l === 'no') out[id] = 'pas_important';
  });
  return out;
}

/**
 * IDs dans la colonne "important" (seule qui impacte le total)
 * @param {Record<string, 'important'|'pas_important'>} placements
 * @returns {string[]}
 */
export function importantProductIds(placements) {
  return Object.keys(placements || {}).filter((id) => placements[id] === 'important');
}

/**
 * Écart entre le nouveau versement (véhicule + add-ons) et le versement de base.
 * En comptant, renvoie simplement le montant des add-ons (add-on pur).
 * @returns {number|null}
 */
export function deltaVersusBase(financing, addonCents) {
  if (!financing) return null;
  if (financing.transactionType === 'comptant') {
    return Math.round(addonCents || 0);
  }
  const p = paymentForAddonCents(financing, addonCents);
  if (p == null) return null;
  return p - (financing.basePaymentCents || 0);
}
