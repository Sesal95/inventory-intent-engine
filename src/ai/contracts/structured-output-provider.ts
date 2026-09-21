import type { ZodType } from 'zod/v4';

export type StructuredOutputRequest<T> = {
  schema: ZodType<T>;
  schemaName: string;
  systemPrompt: string;
  userInput: string;
};

export interface StructuredOutputProvider {
  generate<T>(request: StructuredOutputRequest<T>): Promise<T>;
}
