/**
 * Montants en cents (entiers) pour éviter les erreurs de virgule flottante.
 */
export class Money {
  /** @param {number} cents */
  constructor(cents) {
    this.cents = Math.round(Number(cents));
  }

  /** @param {number} dollars */
  static fromDollars(dollars) {
    return new Money(Math.round((Number(dollars) || 0) * 100));
  }

  add(other) {
    return new Money(this.cents + other.cents);
  }

  subtract(other) {
    return new Money(this.cents - other.cents);
  }

  multiply(factor) {
    return new Money(Math.round(this.cents * factor));
  }

  toDollars() {
    return this.cents / 100;
  }

  /** @param {string} [locale] @param {string} [currency] */
  format(locale = 'fr-CA', currency = 'CAD') {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
      this.toDollars(),
    );
  }
}

export function sumMoney(arr) {
  return arr.reduce((s, m) => s.add(m), new Money(0));
}
