import { describe, expect, it, vi } from 'vitest';
import { FakeStructuredOutputProvider } from '../../src/ai/providers/fake/fake-structured-output.provider.js';
import { ParseInventoryIntentUseCase } from '../../src/application/parse-inventory-intent.use-case.js';
import { MOCK_INVENTORY_CONTEXT } from '../../src/config/mock-inventory-context.js';
import { InventoryIntentOutputSchema } from '../../src/domain/inventory-intent/inventory-intent.schema.js';
import type { InventoryIntent } from '../../src/domain/inventory-intent/inventory-intent.types.js';
import { validateInventoryIntent } from '../../src/domain/inventory-intent/validate-inventory-intent.js';

function purchase(): InventoryIntent {
  return {
    inputLanguage: 'es',
    status: 'needs_clarification',
    actions: [
      {
        operation: 'increase',
        productName: 'papa',
        quantity: 0.5,
        unit: 'lb',
        reason: 'purchase',
        purchasePrice: {
          status: 'pending',
          amount: null,
          currency: 'COP',
          basis: null,
          unit: null,
          pendingReason: 'awaiting_input',
          referencePrice: { amount: 3000, currency: 'COP', basis: 'per_unit', unit: 'kg' },
        },
      },
    ],
    clarification: {
      question:
        '¿Cuál fue el precio? La referencia es 3000 COP por kg: puedes usarla, indicar otro precio o dejarlo pendiente.',
      missingFields: ['price'],
    },
  };
}
function priceOf(intent: InventoryIntent) {
  const price = intent.actions[0]?.purchasePrice;
  if (!price) throw new Error('Fixture missing purchase price');
  return price;
}
function check(intent: InventoryIntent) {
  return validateInventoryIntent(InventoryIntentOutputSchema.parse(intent), MOCK_INVENTORY_CONTEXT);
}

describe('purchase price contract and mock boundary', () => {
  it('preserves fractional inventory and a separate proposal in one clarification', async () => {
    const output = purchase();
    const provider = new FakeStructuredOutputProvider(output);
    const spy = vi.spyOn(provider, 'generate');
    const result = await new ParseInventoryIntentUseCase(provider).execute(
      'Compré media libra de papa.',
      MOCK_INVENTORY_CONTEXT,
    );
    expect(result).toEqual(output);
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0]?.[0].systemPrompt).toContain(JSON.stringify(MOCK_INVENTORY_CONTEXT));
    expect(priceOf(result).amount).toBeNull();
  });

  it('permits ready inventory with price explicitly unavailable', () => {
    const intent = purchase();
    intent.status = 'ready';
    intent.clarification = null;
    priceOf(intent).pendingReason = 'user_unavailable';
    expect(check(intent).status).toBe('ready');
  });

  it('does not permit silently leaving an omitted price pending', () => {
    const intent = purchase();
    intent.status = 'ready';
    intent.clarification = null;
    expect(() => check(intent)).toThrow('Unresolved price');
  });

  it('accepts a provided total price independent of the reference', () => {
    const intent = purchase();
    intent.status = 'ready';
    intent.clarification = null;
    Object.assign(priceOf(intent), {
      status: 'provided',
      amount: 30000,
      basis: 'total',
      unit: null,
      pendingReason: null,
    });
    expect(check(intent).status).toBe('ready');
  });

  it('accepts an explicitly confirmed reference only when it matches context', () => {
    const intent = purchase();
    intent.status = 'ready';
    intent.clarification = null;
    Object.assign(priceOf(intent), {
      status: 'confirmed_reference',
      amount: 3000,
      basis: 'per_unit',
      unit: 'kg',
      pendingReason: null,
    });
    expect(check(intent).status).toBe('ready');
    priceOf(intent).amount = 4000;
    expect(() => check(intent)).toThrow('Confirmed reference');
  });

  it('rejects a fabricated reference price', () => {
    const intent = purchase();
    priceOf(intent).referencePrice = { amount: 1, currency: 'COP', basis: 'total', unit: null };
    expect(() => check(intent)).toThrow('Reference price must match');
  });

  it('does not perform catalog alias matching', () => {
    const intent = purchase();
    intent.actions[0]!.productName = 'papas';
    expect(() => check(intent)).toThrow('Reference price must match');
  });

  it('supports missing price without a reference', () => {
    const intent = purchase();
    priceOf(intent).referencePrice = null;
    expect(check(intent).status).toBe('needs_clarification');
  });

  it('preserves partial price data while clarifying its basis', () => {
    const intent = purchase();
    priceOf(intent).amount = 30000;
    intent.clarification!.missingFields = ['price_basis'];
    expect(priceOf(check(intent)).amount).toBe(30000);
  });

  it('preserves an explicit per-unit basis while its unit is unknown', () => {
    const intent = purchase();
    Object.assign(priceOf(intent), { amount: 30, basis: 'per_unit', unit: null });
    intent.clarification!.missingFields = ['price_basis'];
    expect(priceOf(check(intent)).basis).toBe('per_unit');
  });

  it('preserves a conflicting currency and requires clarification', () => {
    const intent = purchase();
    Object.assign(priceOf(intent), { amount: 20, currency: 'USD', basis: 'total' });
    intent.clarification!.missingFields = ['currency'];
    expect(priceOf(check(intent)).currency).toBe('USD');
    intent.status = 'ready';
    intent.clarification = null;
    Object.assign(priceOf(intent), { status: 'provided', pendingReason: null });
    expect(() => check(intent)).toThrow('Currency mismatch');
  });

  it.each([
    { status: 'provided', pendingReason: null, amount: null, basis: 'total' },
    { status: 'pending', pendingReason: null },
    { status: 'provided', pendingReason: null, amount: 30, basis: 'per_unit', unit: null },
    { basis: 'total', unit: 'kg' },
    { amount: -1 },
  ])('rejects inconsistent price metadata: %j', (patch) => {
    const intent = purchase();
    Object.assign(priceOf(intent), patch);
    expect(() => check(intent)).toThrow();
  });

  it('requires price metadata for purchases and forbids it for waste', () => {
    const intent = purchase();
    intent.actions[0]!.reason = 'waste';
    expect(() => check(intent)).toThrow('Only purchases');
    intent.actions[0]!.reason = 'purchase';
    intent.actions[0]!.purchasePrice = null;
    expect(() => check(intent)).toThrow('Only purchases');
  });

  it('retains complete waste actions alongside purchase clarification', () => {
    const intent = purchase();
    intent.actions.push({
      operation: 'decrease',
      productName: 'huevos',
      quantity: 5,
      unit: 'unit',
      reason: 'waste',
      purchasePrice: null,
    });
    expect(check(intent).actions).toHaveLength(2);
  });

  it('validates provider output again at the application boundary', async () => {
    const provider = new FakeStructuredOutputProvider(purchase());
    const invalid = purchase();
    priceOf(invalid).amount = -1;
    vi.spyOn(provider, 'generate').mockResolvedValue(invalid);
    await expect(
      new ParseInventoryIntentUseCase(provider).execute('Compra', MOCK_INVENTORY_CONTEXT),
    ).rejects.toThrow();
  });

  it('rejects invalid context before calling the provider', async () => {
    const provider = new FakeStructuredOutputProvider(purchase());
    const spy = vi.spyOn(provider, 'generate');
    await expect(
      new ParseInventoryIntentUseCase(provider).execute('Compra', {
        currency: 'cop',
        referencePrices: [],
      }),
    ).rejects.toThrow();
    expect(spy).not.toHaveBeenCalled();
  });

  it('rejects blank product names without trimming valid names', () => {
    const intent = purchase();
    intent.actions[0]!.productName = '   ';
    expect(() => check(intent)).toThrow('Product name');
  });
});
