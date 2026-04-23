// ════════════════════════════════════════════════════════════
//  Typographie française — ponctuation et espaces insécables
//  Transforme automatiquement les chaînes pour respecter les
//  règles typographiques françaises (guillemets, tirets, espaces)
// ════════════════════════════════════════════════════════════

const NBSP = '\u00A0';       // espace insécable
const NNBSP = '\u202F';      // espace fine insécable (avant ; : ! ?)

/**
 * Applique les règles de typographie française à une chaîne :
 * - Guillemets droits -> guillemets français « »
 * - Espaces insécables avant : ; ! ?
 * - Apostrophes typographiques ’
 * - Tirets longs (--) -> em-dash
 */
export function fr(input) {
  if (typeof input !== 'string') return input;
  let s = input;

  // Apostrophes typographiques (après lettre)
  s = s.replace(/(\w)'(\w)/g, `$1\u2019$2`);

  // Guillemets français (paires)
  s = s.replace(/"([^"]*)"/g, `\u00AB${NBSP}$1${NBSP}\u00BB`);

  // Tirets longs
  s = s.replace(/ -- /g, ` \u2014 `);
  s = s.replace(/([A-Za-zÀ-ÿ]) - ([A-Za-zÀ-ÿ])/g, `$1\u00A0\u2014\u00A0$2`);

  // Espace fine insécable avant : ; ! ?
  s = s.replace(/\s+([;!?:])/g, `${NNBSP}$1`);

  // Numérique : 1 000 au lieu de 1000 (seulement si nombre seul)
  // (on laisse l'auteur gérer, trop risqué d'auto)

  return s;
}

export function number(n, locale = 'fr-CA') {
  if (n == null) return '';
  return new Intl.NumberFormat(locale).format(n);
}

export function currency(n, locale = 'fr-CA', currency = 'CAD') {
  if (n == null) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function currencyMonthly(n, locale = 'fr-CA', currency = 'CAD') {
  if (n == null) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n) + `${NBSP}/${NBSP}mois`;
}

/** Percentage with non-breaking space */
export function percent(n, locale = 'fr-CA') {
  if (n == null) return '';
  return `${new Intl.NumberFormat(locale).format(n)}${NBSP}%`;
}

/** Date longue (fr-CA) */
export function dateLong(date, locale = 'fr-CA') {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString(locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default { fr, number, currency, currencyMonthly, percent, dateLong };
