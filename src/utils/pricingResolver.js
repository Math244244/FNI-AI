import { ENRICHED_PRODUCTS, enrichProductWithPricing } from '../data/productPricing.js';

/**
 * @typedef {import('../data/productPricing.js').PRICING_BY_ID} PricingMeta
 */

/**
 * Résout le prix en cents pour un produit (catalogue + surcharge concession).
 * @param {object} product — produit enrichi ou de base
 * @param {object} [dealerSettings] — doc dealerSettings
 * @param {string} [tierId] — ex. ext_4y
 * @param {string} [groupId] — ex. mfg | ext
 */
export function resolvePriceCents(product, dealerSettings, tierId, groupId) {
  const id = product.id;
  const dealer = dealerSettings?.pricing?.[id];

  if (product.pricingMode === 'tiers' && tierId) {
    const gId = groupId || findGroupIdForTier(product, tierId);
    const dGroup = gId && dealer?.tierGroups?.[gId];
    const tOverride = dGroup?.[tierId];
    if (tOverride != null) return Math.round(tOverride);
    for (const g of product.tierGroups || []) {
      const t = g.tiers?.find((x) => x.id === tierId);
      if (t) return t.defaultPriceCents;
    }
    return 0;
  }
  if (product.pricingMode === 'fixed') {
    if (dealer?.defaultPriceCents != null) return Math.round(dealer.defaultPriceCents);
    return Math.round(product.defaultPriceCents ?? 0);
  }
  if (dealer?.defaultPriceCents != null) return Math.round(dealer.defaultPriceCents);
  return Math.round(product.defaultPriceCents ?? 0);
}

function findGroupIdForTier(product, tierId) {
  for (const g of product.tierGroups || []) {
    if (g.tiers?.some((t) => t.id === tierId)) return g.id;
  }
  return null;
}

/**
 * @param {string} productId
 */
export function getEnrichedById(productId) {
  return ENRICHED_PRODUCTS.find((p) => p.id === productId) || null;
}

/**
 * Produit personnalisé (non catalogue) : prix seulement côté dealer.
 * @param {object} product
 * @param {object} [dealerSettings]
 */
export function resolveCustomProductPriceCents(product, dealerSettings) {
  const d = dealerSettings?.pricing?.[product.id];
  if (d?.defaultPriceCents != null) return Math.round(d.defaultPriceCents);
  if (product.defaultPriceCents != null) return Math.round(product.defaultPriceCents);
  return 0;
}

/**
 * @param {object} custom
 */
export function enrichCustomProductForPricing(custom) {
  if (!custom?.id) return custom;
  return {
    ...custom,
    pricingMode: custom.pricingMode || 'fixed',
    defaultPriceCents: custom.defaultPriceCents ?? 0,
    financed: custom.financed !== false,
    taxable: custom.taxable !== false,
  };
}

/**
 * @param {object} base
 */
export function withPricingDefaults(base) {
  const e = ENRICHED_PRODUCTS.find((p) => p.id === base.id);
  if (e) return { ...e, ...base };
  if (base.isCustom) return enrichCustomProductForPricing(base);
  return enrichProductWithPricing(base);
}
