import { InvalidInventoryIntentError } from './inventory-intent.errors.js';
import type { InventoryIntent } from './inventory-intent.types.js';

export function validateInventoryIntent(intent: InventoryIntent): InventoryIntent {
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

  return intent;
}
