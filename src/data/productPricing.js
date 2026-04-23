import { PRODUCTS } from './products.js';

/**
 * Métadonnées de tarification (catalogue). Fusionnées sur chaque entrée de PRODUCTS.
 * Les concessions surchargent via dealerSettings.pricing[productId].
 */

/** @typedef {{ id: string, label: string, defaultPriceCents: number }} PriceTier */
/** @typedef {{ id: string, label: string, exclusive: boolean, tiers: PriceTier[] }} TierGroup */

export const PRICING_BY_ID = {
  garantie: {
    pricingMode: 'tiers',
    financed: true,
    taxable: true,
    exclusiveGroup: 'warranty_mech',
    defaultTierId: 'ext_4y',
    tierGroups: /** @type {TierGroup[]} */ ([
      {
        id: 'mfg',
        label: 'Garantie manufacturière',
        exclusive: true,
        tiers: [
          { id: 'mfg_1y', label: '1 an',  defaultPriceCents: 45_000 },
          { id: 'mfg_2y', label: '2 ans', defaultPriceCents: 85_000 },
          { id: 'mfg_3y', label: '3 ans', defaultPriceCents: 120_000 },
          { id: 'mfg_4y', label: '4 ans', defaultPriceCents: 150_000 },
          { id: 'mfg_5y', label: '5 ans', defaultPriceCents: 180_000 },
        ],
      },
      {
        id: 'ext',
        label: 'Garantie prolongée',
        exclusive: true,
        tiers: [
          { id: 'ext_1y', label: '1 an',  defaultPriceCents: 80_000 },
          { id: 'ext_2y', label: '2 ans', defaultPriceCents: 145_000 },
          { id: 'ext_3y', label: '3 ans', defaultPriceCents: 195_000 },
          { id: 'ext_4y', label: '4 ans', defaultPriceCents: 240_000 },
          { id: 'ext_5y', label: '5 ans', defaultPriceCents: 275_000 },
          { id: 'ext_6y', label: '6 ans', defaultPriceCents: 310_000 },
        ],
      },
    ]),
  },
  hasard: {
    pricingMode: 'fixed', defaultPriceCents: 120_000, financed: true, taxable: true, exclusiveGroup: null,
  },
  protection: {
    pricingMode: 'fixed', defaultPriceCents: 119_500, financed: true, taxable: true, exclusiveGroup: null,
  },
  assurance_vie: {
    pricingMode: 'fixed', defaultPriceCents: 95_000, financed: true, taxable: false, exclusiveGroup: null,
  },
  assurance_invalidite: {
    pricingMode: 'fixed', defaultPriceCents: 110_000, financed: true, taxable: false, exclusiveGroup: null,
  },
  assurance_perte: {
    pricingMode: 'fixed', defaultPriceCents: 89_500, financed: true, taxable: true, exclusiveGroup: null,
  },
};

/**
 * @param {object} base
 */
export function enrichProductWithPricing(base) {
  const p = PRICING_BY_ID[base.id];
  if (!p) {
    return {
      ...base,
      pricingMode: 'none',
      defaultPriceCents: 0,
      financed: true,
      taxable: true,
      exclusiveGroup: null,
    };
  }
  return { ...base, ...p };
}

/** Catalogue enrichi (usage SlideDeck, calculateur, paramètres) */
export const ENRICHED_PRODUCTS = PRODUCTS.map(enrichProductWithPricing);
