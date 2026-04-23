import { describe, it, expect } from 'vitest';
import {
  numberOfPayments,
  paymentPerPeriodCents,
  paymentPerPeriodDollars,
  leasePaymentPerPeriodCents,
  leaseTotalInterestCents,
} from './paymentCalculator.js';
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

describe('leasePaymentPerPeriodCents', () => {
  it('taux 0 → (capital − résiduel) / n', () => {
    const pay = leasePaymentPerPeriodCents({
      annualRatePercent: 0,
      termMonths: 48,
      capitalCents: 40000_00,
      residualCents: 20000_00,
      frequency: 'monthly',
    });
    expect(pay).toBe(Math.round((40000_00 - 20000_00) / 48));
  });

  it('location < prêt pour même capital / durée / taux (grâce à la résiduelle)', () => {
    const lease = leasePaymentPerPeriodCents({
      annualRatePercent: 4.9,
      termMonths: 48,
      capitalCents: 40000_00,
      residualCents: 20000_00,
      frequency: 'monthly',
    });
    const loan = paymentPerPeriodCents({
      annualRatePercent: 4.9,
      termMonths: 48,
      principalCents: 40000_00,
      frequency: 'monthly',
    });
    expect(lease).toBeGreaterThan(0);
    expect(lease).toBeLessThan(loan);
  });

  it('annuity-due < annuity-ordinary (paiement avancé)', () => {
    const common = {
      annualRatePercent: 6,
      termMonths: 48,
      capitalCents: 40000_00,
      residualCents: 20000_00,
      frequency: 'monthly',
    };
    const ordinary = leasePaymentPerPeriodCents({ ...common, annuityDue: false });
    const due      = leasePaymentPerPeriodCents({ ...common, annuityDue: true });
    expect(due).toBeLessThan(ordinary);
  });

  it('intérêt total > 0 pour taux > 0', () => {
    const interest = leaseTotalInterestCents({
      annualRatePercent: 4.9,
      termMonths: 48,
      capitalCents: 40000_00,
      residualCents: 20000_00,
      frequency: 'monthly',
    });
    expect(interest).toBeGreaterThan(0);
  });
});
