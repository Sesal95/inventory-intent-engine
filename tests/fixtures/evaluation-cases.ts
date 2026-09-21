export type EvaluationCase = {
  name: string;
  input: string;
  expectedLanguage: 'es' | 'en';
  expectedStatus: 'ready' | 'needs_clarification';
  expectedActionCount: number;
};

export const EVALUATION_CASES: EvaluationCase[] = [
  {
    name: 'Spanish purchase and breakage',
    input: 'Se compraron 10 kilos de papa y se quebraron 5 huevos.',
    expectedLanguage: 'es',
    expectedStatus: 'ready',
    expectedActionCount: 2,
  },
  {
    name: 'English delivery and spill',
    input: 'We received 5 kg of rice and spilled 2 liters of milk.',
    expectedLanguage: 'en',
    expectedStatus: 'ready',
    expectedActionCount: 2,
  },
  {
    name: 'Spanish missing quantity and unit',
    input: 'Agrega papa.',
    expectedLanguage: 'es',
    expectedStatus: 'needs_clarification',
    expectedActionCount: 0,
  },
  {
    name: 'English vague quantity',
    input: 'Some eggs broke.',
    expectedLanguage: 'en',
    expectedStatus: 'needs_clarification',
    expectedActionCount: 0,
  },
];
