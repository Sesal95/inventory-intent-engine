import { describe, expect, it } from 'vitest';

import { FakeStructuredOutputProvider } from '../../src/ai/providers/fake/fake-structured-output.provider.js';
import { ParseInventoryIntentUseCase } from '../../src/application/parse-inventory-intent.use-case.js';

describe('ParseInventoryIntentUseCase', () => {
  it('keeps the application independent from the model provider', async () => {
    const provider = new FakeStructuredOutputProvider({
      inputLanguage: 'en',
      status: 'ready',
      actions: [
        {
          operation: 'increase',
          productName: 'potatoes',
          quantity: 10,
          unit: 'kg',
          reason: 'purchase',
          purchasePrice: {
            status: 'pending',
            amount: null,
            currency: 'COP',
            basis: null,
            unit: null,
            pendingReason: 'user_unavailable',
            referencePrice: null,
          },
        },
      ],
      clarification: null,
    });
    const useCase = new ParseInventoryIntentUseCase(provider);

    const result = await useCase.execute('We bought 10 kg of potatoes; price unavailable.', {
      currency: 'COP',
      referencePrices: [],
    });

    expect(result.inputLanguage).toBe('en');
    expect(result.actions[0]?.operation).toBe('increase');
  });

  it('rejects empty input before calling a provider', async () => {
    const useCase = new ParseInventoryIntentUseCase(new FakeStructuredOutputProvider({}));

    await expect(useCase.execute('   ', { currency: 'COP', referencePrices: [] })).rejects.toThrow(
      'Input must not be empty.',
    );
  });
});
