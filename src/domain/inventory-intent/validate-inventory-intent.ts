import { InvalidInventoryIntentError } from './inventory-intent.errors.js';
import type { InventoryIntent, PriceValue, PurchasePrice } from './inventory-intent.types.js';

type PriceContext = {
  currency: string;
  referencePrices: ReadonlyArray<{
    productName: string;
    price: PriceValue;
  }>;
};

export function validateInventoryIntent(
  intent: InventoryIntent,
  context?: PriceContext,
): InventoryIntent {
  if (intent.status === 'ready') {
    if (intent.actions.length === 0) {
      throw new InvalidInventoryIntentError('A ready intent must contain at least one action.');
    }

    if (intent.clarification !== null) {
      throw new InvalidInventoryIntentError('A ready intent cannot request clarification.');
    }
  }

  if (intent.status === 'needs_clarification' && intent.clarification === null) {
    throw new InvalidInventoryIntentError(
      'An intent that needs clarification must include a clarification request.',
    );
  }

  if (intent.clarification && !intent.clarification.question.trim()) {
    throw new InvalidInventoryIntentError('Clarification must contain text.');
  }
  for (const action of intent.actions) {
    if (!action.productName.trim()) {
      throw new InvalidInventoryIntentError('Product name must contain text.');
    }
    const price = action.purchasePrice;
    if ((action.reason === 'purchase') !== (price !== null)) {
      throw new InvalidInventoryIntentError('Only purchases must include purchase price metadata.');
    }
    if (!price) continue;
    const validBasis = (basis: string | null, unit: string | null) =>
      basis === 'per_unit' ? unit !== null : unit === null;
    if (
      !validBasis(price.basis, price.unit) &&
      !(price.status === 'pending' && price.basis === 'per_unit' && price.unit === null)
    ) {
      throw new InvalidInventoryIntentError(
        'A per-unit price needs a unit; other bases must not have one.',
      );
    }
    if (
      price.referencePrice &&
      !validBasis(price.referencePrice.basis, price.referencePrice.unit)
    ) {
      throw new InvalidInventoryIntentError('Invalid reference price basis.');
    }
    if (price.status === 'pending') {
      if (price.pendingReason === null) {
        throw new InvalidInventoryIntentError('Pending price must explain why it is pending.');
      }
      if (
        price.pendingReason === 'awaiting_input' &&
        (intent.status !== 'needs_clarification' ||
          !intent.clarification?.missingFields.some((field) =>
            ['price', 'price_basis', 'currency'].includes(field),
          ))
      ) {
        throw new InvalidInventoryIntentError('Unresolved price must request clarification.');
      }
    } else if (price.amount === null || price.basis === null || price.pendingReason !== null) {
      throw new InvalidInventoryIntentError(
        'Accepted price must include amount and basis without a pending reason.',
      );
    }
    if (context) {
      const reference = context.referencePrices.find(
        (entry) => entry.productName === action.productName,
      )?.price;
      const samePrice = (a: PriceValue | PurchasePrice | null, b: PriceValue | null) =>
        a !== null &&
        b !== null &&
        a.amount === b.amount &&
        a.currency === b.currency &&
        a.basis === b.basis &&
        a.unit === b.unit;
      if (price.referencePrice && (!reference || !samePrice(price.referencePrice, reference))) {
        throw new InvalidInventoryIntentError(
          'Reference price must match supplied context exactly.',
        );
      }
      if (
        price.status === 'confirmed_reference' &&
        (!reference || !samePrice(price, reference) || !samePrice(price.referencePrice, reference))
      ) {
        throw new InvalidInventoryIntentError(
          'Confirmed reference price must match supplied context.',
        );
      }
      if (
        price.currency !== context.currency &&
        (price.status !== 'pending' ||
          price.pendingReason !== 'awaiting_input' ||
          !intent.clarification?.missingFields.includes('currency'))
      ) {
        throw new InvalidInventoryIntentError('Currency mismatch requires clarification.');
      }
    } else if (price.status === 'confirmed_reference') {
      throw new InvalidInventoryIntentError(
        'Reference confirmation requires authoritative context.',
      );
    }
  }
  return intent;
}
