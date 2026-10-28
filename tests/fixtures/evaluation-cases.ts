import type { InventoryAction } from '../../src/domain/inventory-intent/inventory-intent.types.js';

export type EvaluationCase = {
  name: string;
  input: string;
  expectedLanguage: 'es' | 'en';
  expectedStatus: 'ready' | 'needs_clarification';
  expectedActionCount: number;
  expectedActions?: Array<
    Partial<Omit<InventoryAction, 'purchasePrice'>> & {
      purchasePrice?: Partial<NonNullable<InventoryAction['purchasePrice']>> | null;
    }
  >;
  expectedMissingFields?: string[];
};

export const EVALUATION_CASES: EvaluationCase[] = [
  {
    name: 'Spanish purchase and breakage',
    input: 'Se compraron 10 kilos de papa y se quebraron 5 huevos.',
    expectedLanguage: 'es',
    expectedStatus: 'needs_clarification',
    expectedActionCount: 2,
    expectedMissingFields: ['price'],
  },
  {
    name: 'English purchase and spill with missing price',
    input: 'We bought 5 kg of rice and spilled 2 liters of milk.',
    expectedLanguage: 'en',
    expectedStatus: 'needs_clarification',
    expectedActionCount: 2,
    expectedMissingFields: ['price'],
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
  {
    name: 'Fractional pounds and total price shorthand preserve product spelling',
    input: 'I bought half pound of meet for 30k total.',
    expectedLanguage: 'en',
    expectedStatus: 'ready',
    expectedActionCount: 1,
    expectedActions: [
      {
        productName: 'meet',
        operation: 'increase',
        reason: 'purchase',
        quantity: 0.5,
        unit: 'lb',
        purchasePrice: {
          status: 'provided',
          amount: 30000,
          currency: 'COP',
          basis: 'total',
          unit: null,
        },
      },
    ],
  },
  {
    name: 'Spanish pounds with explicitly unavailable price',
    input: 'Compré media libra de carne, no tengo el precio.',
    expectedLanguage: 'es',
    expectedStatus: 'ready',
    expectedActionCount: 1,
    expectedActions: [
      {
        productName: 'carne',
        quantity: 0.5,
        unit: 'lb',
        purchasePrice: { status: 'pending', pendingReason: 'user_unavailable', amount: null },
      },
    ],
  },
  {
    name: 'Million shorthand in total price',
    input: 'Compré 100 kg de arroz por 1M en total.',
    expectedLanguage: 'es',
    expectedStatus: 'ready',
    expectedActionCount: 1,
    expectedActions: [
      {
        productName: 'arroz',
        quantity: 100,
        unit: 'kg',
        purchasePrice: { status: 'provided', amount: 1000000, basis: 'total' },
      },
    ],
  },
  {
    name: 'Quantity shorthand is not a price',
    input: 'Discarded 30k eggs due to spoilage.',
    expectedLanguage: 'en',
    expectedStatus: 'ready',
    expectedActionCount: 1,
    expectedActions: [
      { productName: 'eggs', quantity: 30000, unit: 'unit', reason: 'waste', purchasePrice: null },
    ],
  },
  {
    name: 'Explicit reference price acceptance',
    input: 'Compré 10 kg de papa; usa el precio de referencia propuesto.',
    expectedLanguage: 'es',
    expectedStatus: 'ready',
    expectedActionCount: 1,
    expectedActions: [
      {
        productName: 'papa',
        purchasePrice: {
          status: 'confirmed_reference',
          amount: 3000,
          currency: 'COP',
          basis: 'per_unit',
          unit: 'kg',
        },
      },
    ],
  },
  {
    name: 'Reference is a proposal, not an accepted value',
    input: 'Compré 10 kg de papa.',
    expectedLanguage: 'es',
    expectedStatus: 'needs_clarification',
    expectedActionCount: 1,
    expectedMissingFields: ['price'],
    expectedActions: [
      {
        productName: 'papa',
        purchasePrice: {
          status: 'pending',
          amount: null,
          pendingReason: 'awaiting_input',
          referencePrice: { amount: 3000, currency: 'COP', basis: 'per_unit', unit: 'kg' },
        },
      },
    ],
  },
  {
    name: 'Explicit currency conflict is preserved',
    input: 'Bought 2 lb of meat for 20 USD total.',
    expectedLanguage: 'en',
    expectedStatus: 'needs_clarification',
    expectedActionCount: 1,
    expectedMissingFields: ['currency'],
    expectedActions: [
      {
        productName: 'meat',
        purchasePrice: { status: 'pending', amount: 20, currency: 'USD', basis: 'total' },
      },
    ],
  },
  {
    name: 'Price basis is not guessed',
    input: 'Compré 2 kg de papa a 30k.',
    expectedLanguage: 'es',
    expectedStatus: 'needs_clarification',
    expectedActionCount: 1,
    expectedMissingFields: ['price_basis'],
    expectedActions: [{ purchasePrice: { status: 'pending', amount: 30000, basis: null } }],
  },
  {
    name: 'Received stock does not imply purchase',
    input: 'We received 2 kg of rice.',
    expectedLanguage: 'en',
    expectedStatus: 'needs_clarification',
    expectedActionCount: 0,
    expectedMissingFields: ['reason'],
  },
];
