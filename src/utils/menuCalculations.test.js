import { describe, it, expect } from 'vitest';
import {
  productIdsForCumulativeLevel,
  defaultPlacementsFromResponses,
} from './menuCalculations.js';

describe('menuCalculations', () => {
  it('mappe intérêts en colonnes par défaut', () => {
    const p = defaultPlacementsFromResponses({
      a: { interest: 'yes' },
      b: { interest: 'maybe' },
      c: { interest: 'no' },
    });
    expect(p.a).toBe('premium');
    expect(p.b).toBe('recommande');
    expect(p.c).toBe('rejet');
  });

  it('cumulative essentiel / recommandé / premium', () => {
    const pl = { x: 'essentiel', y: 'recommande', z: 'premium', w: 'rejet' };
    expect(productIdsForCumulativeLevel(pl, 'essentiel')).toEqual(['x']);
    expect(productIdsForCumulativeLevel(pl, 'recommande').sort()).toEqual(['x', 'y']);
    expect(productIdsForCumulativeLevel(pl, 'premium').sort()).toEqual(['x', 'y', 'z']);
  });
});
