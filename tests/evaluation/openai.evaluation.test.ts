import { describe, expect, it } from 'vitest';

import { OpenAIStructuredOutputProvider } from '../../src/ai/providers/openai/openai-structured-output.provider.js';
import { ParseInventoryIntentUseCase } from '../../src/application/parse-inventory-intent.use-case.js';
import { EVALUATION_CASES } from '../fixtures/evaluation-cases.js';

const apiKey = process.env.OPENAI_API_KEY;
const runLiveEvaluations = process.env.RUN_LIVE_EVALS === 'true' && Boolean(apiKey);

describe.skipIf(!runLiveEvaluations)('OpenAI inventory intent evaluation', () => {
  const model = process.env.OPENAI_MODEL ?? 'gpt-5-mini';

  for (const evaluationCase of EVALUATION_CASES) {
    it(evaluationCase.name, async () => {
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is required for live evaluations.');
      }

      const useCase = new ParseInventoryIntentUseCase(
        new OpenAIStructuredOutputProvider(apiKey, model),
      );
      const result = await useCase.execute(evaluationCase.input);

      expect(result.inputLanguage).toBe(evaluationCase.expectedLanguage);
      expect(result.status).toBe(evaluationCase.expectedStatus);
      expect(result.actions).toHaveLength(evaluationCase.expectedActionCount);
    });
  }
});
