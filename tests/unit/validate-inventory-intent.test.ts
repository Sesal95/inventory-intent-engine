import { describe, expect, it } from 'vitest';

import { InvalidInventoryIntentError } from '../../src/domain/inventory-intent/inventory-intent.errors.js';
import { validateInventoryIntent } from '../../src/domain/inventory-intent/validate-inventory-intent.js';

describe('validateInventoryIntent', () => {
  it('rejects ready intents without actions', () => {
    expect(() =>
      validateInventoryIntent({
        inputLanguage: 'en',
        status: 'ready',
        actions: [],
        clarification: null,
      }),
    ).toThrow(InvalidInventoryIntentError);
  });

  it('accepts clarification in the input language', () => {
    const result = validateInventoryIntent({
      inputLanguage: 'es',
      status: 'needs_clarification',
      actions: [],
      clarification: {
        question: '¿Qué cantidad de papa deseas agregar?',
        missingFields: ['quantity', 'unit'],
      },
    });

    expect(result.clarification?.missingFields).toContain('quantity');
  });
});
