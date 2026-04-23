import { PRODUCTS } from '../data/products';

export const DEALER_SETTINGS_VERSION = 1;

/** @param {unknown} a @param {unknown} b */
export function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const keysA = Object.keys(/** @type {object} */(a));
  const keysB = Object.keys(/** @type {object} */(b));
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!deepEqual(/** @type {Record<string, unknown>} */(a)[k], /** @type {Record<string, unknown>} */(b)[k])) return false;
  }
  return true;
}

const OVERRIDE_FIELDS = [
  'title', 'icon', 'hook', 'risk', 'solution',
  'pdfName', 'pdfBase64', 'customImage', 'customContent',
];

/**
 * Champs d’un produit catalogue modifiables en Settings vs [PRODUCTS].
 * Retourne un patch à persister (ou null si identique au catalogue).
 * @param {object} merged — produit en mémoire (catalogue + état local)
 * @param {object} base — entrée de PRODUCTS
 * @returns {object|null}
 */
export function computeCatalogOverridePatch(merged, base) {
  const diff = {};
  for (const f of OVERRIDE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(merged, f) && (base == null || base[f] == null)) continue;
    const mv = merged[f];
    const bv = base?.[f];
    if (f === 'pdfName' || f === 'pdfBase64') {
      if ((mv || '') === '' && (bv || '') === '') continue;
    }
    if (!deepEqual(mv, bv)) {
      if (f === 'pdfName' || f === 'pdfBase64') {
        if (mv === '' || mv == null) {
          if (bv != null && bv !== '') diff[f] = null;
        } else {
          diff[f] = mv;
        }
      } else {
        diff[f] = mv;
      }
    }
  }
  return Object.keys(diff).length ? diff : null;
}

/**
 * @param {Array<object>} productRows — état `products` dans Settings
 * @param {Array<object>} [catalog=PRODUCTS]
 * @returns {Record<string, object>} map id -> patch (seulement les id avec écarts)
 */
export function buildCatalogOverridesMap(productRows, catalog = PRODUCTS) {
  const out = {};
  for (const p of productRows) {
    if (p.isCustom) continue;
    const base = catalog.find((c) => c.id === p.id);
    if (!base) continue;
    const patch = computeCatalogOverridePatch(p, base);
    if (patch) out[p.id] = patch;
  }
  return out;
}

/**
 * @param {object|null|undefined} settings — doc Firestore dealerSettings
 * @param {Array<object>} [catalog=PRODUCTS]
 * @returns {Array<object>} liste de produits avec active + champs mergés
 */
export function buildMergedProductListFromSettings(settings, catalog = PRODUCTS) {
  // Rien du tout en base : liste neutre basée sur le catalogue
  if (!settings || (!Array.isArray(settings.productOrder)
      && !settings.overrides
      && !settings.customProducts
      && !settings.disabled)) {
    return catalog.map((p) => ({ ...p, active: true }));
  }

  const customList = Array.isArray(settings.customProducts) ? settings.customProducts : [];
  const basePool = [...catalog, ...customList];
  const byId = new Map(basePool.map((p) => [p.id, p]));
  const ordered = [];
  const order = Array.isArray(settings.productOrder) ? settings.productOrder : [];

  // 1) Ordre explicite du dealer
  for (const id of order) {
    const p = byId.get(id);
    if (p) ordered.push(mergeOneRow(p, settings, catalog));
  }
  // 2) Produits catalogue non ordonnés — ajoutés à la fin
  for (const p of catalog) {
    if (!ordered.find((o) => o.id === p.id)) ordered.push(mergeOneRow(p, settings, catalog));
  }
  // 3) Produits custom non ordonnés
  for (const c of customList) {
    if (!ordered.find((o) => o.id === c.id)) ordered.push(mergeOneRow(c, settings, catalog));
  }

  const disabledSet = new Set(Array.isArray(settings.disabled) ? settings.disabled : []);
  return ordered.map((row) => ({
    ...row,
    active: !disabledSet.has(row.id),
  }));
}

function mergeOneRow(p, settings, catalog) {
  if (p.isCustom) {
    return { ...p, ...(settings.overrides?.[p.id] || {}) };
  }
  const base = catalog.find((c) => c.id === p.id) || p;
  const ov = settings.overrides?.[p.id] || {};
  return { ...base, ...ov };
}

/**
 * Produits personnalisés prêts à persister (sans `active`)
 * @param {Array<object>} productRows
 */
export function buildCustomProductsPayload(productRows) {
  return productRows
    .filter((p) => p.isCustom)
    .map((p) => {
      const { active: _a, ...rest } = p;
      return rest;
    });
}
