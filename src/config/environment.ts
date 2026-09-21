import 'dotenv/config';

import { z } from 'zod/v4';

const EnvironmentSchema = z.object({
  AI_PROVIDER: z.literal('openai').default('openai'),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default('gpt-5-mini'),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export function loadEnvironment(): Environment {
  const result = EnvironmentSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(
      `Invalid environment configuration:\n${z.prettifyError(result.error)}\nCopy .env.example to .env and provide a valid API key.`,
    );
  }

  return result.data;
}
