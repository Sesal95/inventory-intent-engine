import { z } from 'zod/v4';

export const InventoryOperationSchema = z.enum(['increase', 'decrease']);
export const InventoryReasonSchema = z.enum(['purchase', 'waste', 'adjustment']);
export const InventoryUnitSchema = z.enum(['kg', 'g', 'unit', 'liter', 'ml', 'oz', 'lb']);
export const InputLanguageSchema = z.enum(['es', 'en']);

export const MissingFieldSchema = z.enum([
  'product',
  'quantity',
  'unit',
  'operation',
  'reason',
  'price',
  'price_basis',
  'currency',
]);

export const PriceValueSchema = z
  .object({
    amount: z.number().nonnegative(),
    currency: z.string().regex(/^[A-Z]{3}$/),
    basis: z.enum(['per_unit', 'total']),
    unit: InventoryUnitSchema.nullable(),
  })
  .strict();

export const PurchasePriceSchema = z
  .object({
    status: z.enum(['pending', 'provided', 'confirmed_reference']),
    amount: z.number().nonnegative().nullable(),
    currency: z.string().regex(/^[A-Z]{3}$/),
    basis: z.enum(['per_unit', 'total']).nullable(),
    unit: InventoryUnitSchema.nullable(),
    pendingReason: z.enum(['awaiting_input', 'user_unavailable']).nullable(),
    referencePrice: PriceValueSchema.nullable(),
  })
  .strict();

export const InventoryActionSchema = z
  .object({
    operation: InventoryOperationSchema.describe('Canonical inventory operation.'),
    productName: z
      .string()
      .min(1)
      .describe('Product name exactly as expressed by the user, without translation.'),
    quantity: z.number().positive().describe('Positive quantity. Direction belongs in operation.'),
    unit: InventoryUnitSchema.describe('Canonical unit in English.'),
    reason: InventoryReasonSchema.describe('Canonical business reason in English.'),
    purchasePrice: PurchasePriceSchema.nullable().describe(
      'Required for purchases; null for other reasons. Reference prices are proposals until explicitly accepted.',
    ),
  })
  .strict();

export const ClarificationSchema = z
  .object({
    question: z.string().min(1).describe('Question written in the detected input language.'),
    missingFields: z.array(MissingFieldSchema).min(1),
  })
  .strict();

// Kept refinement-free because strict Structured Outputs supports only a JSON Schema subset.
// Cross-field invariants are enforced after the provider boundary.
export const InventoryIntentOutputSchema = z
  .object({
    inputLanguage: InputLanguageSchema,
    status: z.enum(['ready', 'needs_clarification']),
    actions: z.array(InventoryActionSchema),
    clarification: ClarificationSchema.nullable(),
  })
  .strict();
