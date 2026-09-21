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
} from './domain/inventory-intent/inventory-intent.types.js';
