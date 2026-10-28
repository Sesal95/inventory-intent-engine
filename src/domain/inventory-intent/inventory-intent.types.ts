import type { z } from 'zod/v4';

import type {
  InventoryActionSchema,
  PriceValueSchema,
  PurchasePriceSchema,
  InventoryIntentOutputSchema,
} from './inventory-intent.schema.js';

export type InventoryAction = z.infer<typeof InventoryActionSchema>;
export type InventoryIntent = z.infer<typeof InventoryIntentOutputSchema>;

export type PriceValue = z.infer<typeof PriceValueSchema>;
export type PurchasePrice = z.infer<typeof PurchasePriceSchema>;
