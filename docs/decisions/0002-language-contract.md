# ADR 0002: Use English canonical values and preserve source product names

## Status

Accepted

## Context

The engine accepts Spanish and English and may support more languages later. Persisting localized enum values would fragment the domain vocabulary.

## Decision

Code, schemas, operations, reasons, and units use canonical English values. Product names remain exactly as expressed by the user because translating them could break future catalog matching. User-facing clarification stays in the detected language.

## Consequences

- Business code receives one stable vocabulary.
- New input languages do not require new domain enums.
- Entity resolution must later map source product names and aliases to catalog identifiers.
