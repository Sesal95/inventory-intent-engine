import { z } from 'zod/v4';
import { PriceValueSchema } from '../domain/inventory-intent/inventory-intent.schema.js';

export const InventoryInterpretationContextSchema = z
  .object({
    currency: z.string().regex(/^[A-Z]{3}$/),
    referencePrices: z.array(
      z
        .object({
          productName: z.string().min(1),
          price: PriceValueSchema,
        })
        .strict(),
    ),
  })
  .strict();

export type InventoryInterpretationContext = z.infer<typeof InventoryInterpretationContextSchema>;
