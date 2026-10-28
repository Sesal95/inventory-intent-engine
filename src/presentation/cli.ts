import { OpenAIStructuredOutputProvider } from '../ai/providers/openai/openai-structured-output.provider.js';
import { ParseInventoryIntentUseCase } from '../application/parse-inventory-intent.use-case.js';
import { MOCK_INVENTORY_CONTEXT } from '../config/mock-inventory-context.js';
import { loadEnvironment } from '../config/environment.js';

async function main(): Promise<void> {
  const input = process.argv.slice(2).join(' ').trim();

  if (input.length === 0) {
    console.error('Usage: pnpm start -- "Se compraron 10 kilos de papa."');
    process.exitCode = 1;
    return;
  }

  const environment = loadEnvironment();
  const provider = new OpenAIStructuredOutputProvider(
    environment.OPENAI_API_KEY,
    environment.OPENAI_MODEL,
  );
  const useCase = new ParseInventoryIntentUseCase(provider);
  const result = await useCase.execute(input, MOCK_INVENTORY_CONTEXT);

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(message);
  process.exitCode = 1;
});
