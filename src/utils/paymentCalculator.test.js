import { describe, it, expect } from 'vitest';
import { numberOfPayments, paymentPerPeriodCents, paymentPerPeriodDollars } from './paymentCalculator.js';
import { withQcTaxCents } from './taxes.js';
import { Money } from './money.js';

describe('numberOfPayments', () => {
  it('60 mois mensuel = 60', () => {
    expect(numberOfPayments(60, 'monthly')).toBe(60);
  });
  it('60 mois bi-hebdo ≈ 130', () => {
    expect(numberOfPayments(60, 'biweekly')).toBe(130);
  });
});

describe('paymentPerPeriodCents', () => {
  it('intérêt 0 → égal capital / n', () => {
    const p = 40000_00;
    const n = numberOfPayments(60, 'biweekly');
    expect(paymentPerPeriodCents({
      annualRatePercent: 0,
      termMonths: 60,
      principalCents: p,
      frequency: 'biweekly',
    })).toBe(Math.round(p / n));
  });
  it('Money: 100$ + 50$ = 150$', () => {
    expect(Money.fromDollars(100).add(Money.fromDollars(50)).cents).toBe(15000);
  });
});

describe('withQcTaxCents', () => {
  it('non taxable', () => {
    expect(withQcTaxCents(10000, undefined, false)).toBe(10000);
  });
  it('taxable', () => {
    const t = withQcTaxCents(10000, { gstPercent: 5, qstPercent: 9.975 }, true);
    expect(t).toBeGreaterThan(10000);
  });
});

describe('paymentPerPeriodDollars', () => {
  it('retourne un nombre fini', () => {
    const x = paymentPerPeriodDollars({
      annualRatePercent: 4.9,
      termMonths: 60,
      principalDollars: 40000,
      frequency: 'biweekly',
    });
    expect(x).toBeGreaterThan(0);
    expect(Number.isFinite(x)).toBe(true);
  });
});
