import type { z } from 'zod/v4';

import type {
  InventoryActionSchema,
  InventoryIntentOutputSchema,
} from './inventory-intent.schema.js';

export type InventoryAction = z.infer<typeof InventoryActionSchema>;
export type InventoryIntent = z.infer<typeof InventoryIntentOutputSchema>;
