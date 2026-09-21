export class InvalidInventoryIntentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInventoryIntentError';
  }
}
