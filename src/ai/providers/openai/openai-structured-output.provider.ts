import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';

import type {
  StructuredOutputProvider,
  StructuredOutputRequest,
} from '../../contracts/structured-output-provider.js';
import { StructuredOutputProviderError } from '../../errors/structured-output-provider.error.js';

export class OpenAIStructuredOutputProvider implements StructuredOutputProvider {
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    this.client = new OpenAI({ apiKey });
  }

  async generate<T>(request: StructuredOutputRequest<T>): Promise<T> {
    try {
      const response = await this.client.responses.parse({
        model: this.model,
        instructions: request.systemPrompt,
        input: request.userInput,
        text: {
          format: zodTextFormat(request.schema, request.schemaName),
        },
      });

      if (response.output_parsed === null) {
        throw new StructuredOutputProviderError(
          `The model returned no parsed output. Response status: ${response.status}.`,
        );
      }

      return response.output_parsed;
    } catch (error: unknown) {
      if (error instanceof StructuredOutputProviderError) {
        throw error;
      }

      throw new StructuredOutputProviderError('Structured output generation failed.', {
        cause: error,
      });
    }
  }
}
