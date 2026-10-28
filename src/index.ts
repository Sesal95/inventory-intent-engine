export type {
  StructuredOutputProvider,
  StructuredOutputRequest,
} from './ai/contracts/structured-output-provider.js';
export { OpenAIStructuredOutputProvider } from './ai/providers/openai/openai-structured-output.provider.js';
export { ParseInventoryIntentUseCase } from './application/parse-inventory-intent.use-case.js';
export { InventoryIntentOutputSchema } from './domain/inventory-intent/inventory-intent.schema.js';
export type {
  InventoryAction,
  InventoryIntent,
  PriceValue,
  PurchasePrice,
} from './domain/inventory-intent/inventory-intent.types.js';

export type { InventoryInterpretationContext } from './application/inventory-interpretation-context.js';
export { MOCK_INVENTORY_CONTEXT } from './config/mock-inventory-context.js';
