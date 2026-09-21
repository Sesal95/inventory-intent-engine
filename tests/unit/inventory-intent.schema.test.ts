import { describe, expect, it } from 'vitest';

import { InventoryIntentOutputSchema } from '../../src/domain/inventory-intent/inventory-intent.schema.js';

describe('InventoryIntentOutputSchema', () => {
  it('accepts a complete bilingual-safe contract', () => {
    const result = InventoryIntentOutputSchema.parse({
      inputLanguage: 'es',
      status: 'ready',
      actions: [
        {
          operation: 'increase',
          productName: 'papa',
          quantity: 10,
          unit: 'kg',
          reason: 'purchase',
        },
      ],
      clarification: null,
    });

    expect(result.actions[0]?.reason).toBe('purchase');
  });

  it('rejects negative quantities', () => {
    const result = InventoryIntentOutputSchema.safeParse({
      inputLanguage: 'en',
      status: 'ready',
      actions: [
        {
          operation: 'decrease',
          productName: 'eggs',
          quantity: -5,
          unit: 'unit',
          reason: 'waste',
        },
      ],
      clarification: null,
    });

    expect(result.success).toBe(false);
  });
});
