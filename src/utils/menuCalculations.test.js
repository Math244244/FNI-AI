import { describe, it, expect } from 'vitest';
import {
  productIdsForCumulativeLevel,
  defaultPlacementsFromResponses,
  defaultBinaryPlacementsFromResponses,
  importantProductIds,
} from './menuCalculations.js';

describe('menuCalculations', () => {
  it('mappe intérêts en colonnes par défaut (legacy 4-col)', () => {
    const p = defaultPlacementsFromResponses({
      a: { interest: 'yes' },
      b: { interest: 'maybe' },
      c: { interest: 'no' },
    });
    expect(p.a).toBe('premium');
    expect(p.b).toBe('recommande');
    expect(p.c).toBe('rejet');
  });

  it('cumulative essentiel / recommandé / premium (legacy)', () => {
    const pl = { x: 'essentiel', y: 'recommande', z: 'premium', w: 'rejet' };
    expect(productIdsForCumulativeLevel(pl, 'essentiel')).toEqual(['x']);
    expect(productIdsForCumulativeLevel(pl, 'recommande').sort()).toEqual(['x', 'y']);
    expect(productIdsForCumulativeLevel(pl, 'premium').sort()).toEqual(['x', 'y', 'z']);
  });

  it('binaire : yes + maybe → important, no → pas_important', () => {
    const p = defaultBinaryPlacementsFromResponses({
      a: { interest: 'yes' },
      b: { interest: 'maybe' },
      c: { interest: 'no' },
      d: 'yes', // ancien format string
    });
    expect(p.a).toBe('important');
    expect(p.b).toBe('important');
    expect(p.c).toBe('pas_important');
    expect(p.d).toBe('important');
  });

  it('importantProductIds ne retient que la colonne important', () => {
    const pl = { a: 'important', b: 'pas_important', c: 'important' };
    expect(importantProductIds(pl).sort()).toEqual(['a', 'c']);
  });
});
