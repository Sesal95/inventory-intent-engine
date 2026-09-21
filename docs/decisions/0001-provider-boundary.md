# ADR 0001: Isolate model providers behind a structured-output contract

## Status

Accepted

## Context

The experiment must begin with one provider without making the domain dependent on that provider's SDK or response shape.

## Decision

Application use cases depend on `StructuredOutputProvider`. Vendor SDK usage is restricted to adapter directories.

## Consequences

- Providers can be replaced without changing the domain.
- Unit tests do not require network access or model tokens.
- Each provider adapter must translate provider-specific failures into a stable application-facing error.
