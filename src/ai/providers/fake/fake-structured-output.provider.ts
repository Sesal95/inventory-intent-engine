import type {
  StructuredOutputProvider,
  StructuredOutputRequest,
} from '../../contracts/structured-output-provider.js';

export class FakeStructuredOutputProvider implements StructuredOutputProvider {
  constructor(private readonly output: unknown) {}

  generate<T>(request: StructuredOutputRequest<T>): Promise<T> {
    return Promise.resolve(request.schema.parse(this.output));
  }
}
