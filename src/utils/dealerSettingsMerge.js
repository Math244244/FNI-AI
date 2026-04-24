import { PRODUCTS } from '../data/products';

export const DEALER_SETTINGS_VERSION = 2;

/* ─────────────────────────────────────────────────────────────
   Catégories : chaque dealer configure indépendamment ses
   produits / prix / overrides par catégorie de véhicule.
   ───────────────────────────────────────────────────────────── */
export const CATEGORY_KEYS = ['automobile', 'loisirs', 'vr'];
export const CATEGORY_LABELS = {
  automobile: 'Automobile',
  loisirs: 'Loisirs',
  vr: 'VR',
};

/**
 * Normalise une clé de catégorie (accepte 'loisir' singulier, casse variable, etc.)
 * @param {unknown} cat
 * @returns {'automobile'|'loisirs'|'vr'}
 */
export function normalizeCategoryKey(cat) {
  if (!cat) return 'automobile';
  const c = String(cat).toLowerCase().trim();
  if (c === 'loisir') return 'loisirs';
  if (CATEGORY_KEYS.includes(/** @type {any} */(c))) return /** @type {any} */(c);
  return 'automobile';
}

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
  'title', 'icon', 'hook', 'risk', 'solution', 'facts',
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
 * Retourne la tranche de settings (order/disabled/customs/overrides/pricing)
 * pour la catégorie donnée. Fallback automatique vers les anciens champs
 * plats si le document est en schéma v1 (rétrocompat).
 * @param {object|null|undefined} settings — doc Firestore dealerSettings
 * @param {string} categoryKey
 */
export function getCategorySettings(settings, categoryKey) {
  const empty = { productOrder: [], disabled: [], customProducts: [], overrides: {}, pricing: {} };
  if (!settings) return empty;
  const key = normalizeCategoryKey(categoryKey);
  const byCat = settings.byCategory && settings.byCategory[key];
  if (byCat && typeof byCat === 'object') {
    return {
      productOrder:   Array.isArray(byCat.productOrder)   ? byCat.productOrder   : [],
      disabled:       Array.isArray(byCat.disabled)       ? byCat.disabled       : [],
      customProducts: Array.isArray(byCat.customProducts) ? byCat.customProducts : [],
      overrides:      byCat.overrides && typeof byCat.overrides === 'object' ? byCat.overrides : {},
      pricing:        byCat.pricing   && typeof byCat.pricing   === 'object' ? byCat.pricing   : {},
    };
  }
  // Legacy v1 : champs plats partagés par toutes les catégories
  return {
    productOrder:   Array.isArray(settings.productOrder)   ? settings.productOrder   : [],
    disabled:       Array.isArray(settings.disabled)       ? settings.disabled       : [],
    customProducts: Array.isArray(settings.customProducts) ? settings.customProducts : [],
    overrides:      settings.overrides && typeof settings.overrides === 'object' ? settings.overrides : {},
    pricing:        settings.pricing   && typeof settings.pricing   === 'object' ? settings.pricing   : {},
  };
}

/**
 * @param {object|null|undefined} settings — doc Firestore dealerSettings
 * @param {Array<object>} [catalog=PRODUCTS]
 * @param {string|null} [categoryKey] — si fourni, lit la tranche par catégorie
 * @returns {Array<object>} liste de produits avec active + champs mergés
 */
export function buildMergedProductListFromSettings(settings, catalog = PRODUCTS, categoryKey = null) {
  // Résout le scope : soit la tranche catégorie (v2+), soit settings brut (v1 legacy)
  const scope = categoryKey != null
    ? getCategorySettings(settings, categoryKey)
    : (settings || null);

  // Rien du tout : liste neutre basée sur le catalogue
  if (!scope
      || (!Array.isArray(scope.productOrder)
        && !scope.overrides
        && !scope.customProducts
        && !scope.disabled)) {
    return catalog.map((p) => ({ ...p, active: true }));
  }

  const customList = Array.isArray(scope.customProducts) ? scope.customProducts : [];
  const basePool = [...catalog, ...customList];
  const byId = new Map(basePool.map((p) => [p.id, p]));
  const order = Array.isArray(scope.productOrder) ? scope.productOrder : [];

  // Déduplication stricte : une seule entrée par id dans la sortie finale.
  const seen = new Set();
  const ordered = [];
  const push = (p) => {
    if (!p || seen.has(p.id)) return;
    seen.add(p.id);
    ordered.push(mergeOneRow(p, scope, catalog));
  };

  // 1) Ordre explicite du dealer
  for (const id of order) push(byId.get(id));
  // 2) Produits catalogue non ordonnés → fin
  for (const p of catalog) push(p);
  // 3) Customs non ordonnés → fin
  for (const c of customList) push(c);

  const disabledSet = new Set(Array.isArray(scope.disabled) ? scope.disabled : []);
  return ordered.map((row) => ({
    ...row,
    active: !disabledSet.has(row.id),
  }));
}

function mergeFacts(baseFacts, overrideFacts) {
  if (overrideFacts === null) return null;
  if (overrideFacts === undefined) return baseFacts;
  if (!baseFacts || typeof baseFacts !== 'object') return overrideFacts;
  return { ...baseFacts, ...overrideFacts };
}

function mergeOneRow(p, scope, catalog) {
  const ov = scope.overrides?.[p.id] || {};
  if (p.isCustom) {
    return { ...p, ...ov, facts: mergeFacts(p.facts, ov.facts) };
  }
  const base = catalog.find((c) => c.id === p.id) || p;
  return { ...base, ...ov, facts: mergeFacts(base.facts, ov.facts) };
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
