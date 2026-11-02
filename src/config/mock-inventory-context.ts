import type { InventoryInterpretationContext } from '../application/inventory-interpretation-context.js';

// Demo data only. AXIS will supply client configuration and resolved reference data.
export const MOCK_INVENTORY_CONTEXT: InventoryInterpretationContext = {
  currency: 'COP',
  referencePrices: [
    {
      productName: 'papa',
      price: { amount: 3000, currency: 'COP', basis: 'per_unit', unit: 'kg' },
    },
    {
      productName: 'meat',
      price: { amount: 12000, currency: 'COP', basis: 'per_unit', unit: 'lb' },
    },
  ],
};
