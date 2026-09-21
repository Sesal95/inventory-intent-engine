import type { StructuredOutputProvider } from '../ai/contracts/structured-output-provider.js';
import { INVENTORY_INTENT_SYSTEM_PROMPT } from '../ai/prompts/inventory-intent.prompt.js';
import { InventoryIntentOutputSchema } from '../domain/inventory-intent/inventory-intent.schema.js';
import type { InventoryIntent } from '../domain/inventory-intent/inventory-intent.types.js';
import { validateInventoryIntent } from '../domain/inventory-intent/validate-inventory-intent.js';

export class ParseInventoryIntentUseCase {
  constructor(private readonly provider: StructuredOutputProvider) {}

  async execute(input: string): Promise<InventoryIntent> {
    const normalizedInput = input.trim();

    if (normalizedInput.length === 0) {
      throw new TypeError('Input must not be empty.');
    }

    const intent = await this.provider.generate({
      schema: InventoryIntentOutputSchema,
      schemaName: 'inventory_intent',
      systemPrompt: INVENTORY_INTENT_SYSTEM_PROMPT,
      userInput: normalizedInput,
    });

    return validateInventoryIntent(intent);
  }
}
