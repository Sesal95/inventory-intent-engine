# inventory-intent-engine

Production-grade proof of concept for translating Spanish and English inventory messages into validated, provider-agnostic domain intents.

> The LLM interprets the requested action. It does not own business rules or mutate inventory.

## Example

Input:

```text
Se compraron 10 kilos de papa y se quebraron 5 huevos.
```

Output:

```json
{
  "inputLanguage": "es",
  "status": "ready",
  "actions": [
    {
      "operation": "increase",
      "productName": "papa",
      "quantity": 10,
      "unit": "kg",
      "reason": "purchase"
    },
    {
      "operation": "decrease",
      "productName": "huevos",
      "quantity": 5,
      "unit": "unit",
      "reason": "waste"
    }
  ],
  "clarification": null
}
```

## Why this repository exists

This repository is an independent learning and portfolio artifact. It explores the AI boundary before the capability is incorporated into a larger product codebase. It is not intended to become that product's source of truth.

## Design goals

- Spanish and English input with one canonical English domain vocabulary.
- Strict structured outputs validated with Zod.
- Model-provider independence at the application and domain layers.
- Explicit clarification instead of invented data.
- Deterministic tests without API calls plus optional live evaluations.
- No database access or inventory mutation in V1.

## Getting started

Requirements: Node.js 22+ and pnpm.

```bash
pnpm install
cp .env.example .env
```

Set `OPENAI_API_KEY` in `.env`, then run:

```bash
pnpm start -- "Se compraron 10 kilos de papa y se quebraron 5 huevos."
pnpm start -- "We received 8 kg of rice and spilled 2 liters of milk."
```

## Quality commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Live evaluations are intentionally separate because they consume API tokens:

```bash
pnpm test:evaluation
```

## Project structure

```text
src/
  ai/             Provider contract, prompts, and adapters
  application/    Parsing use case
  config/         Validated runtime configuration
  domain/         Inventory intent schema, types, and invariants
  presentation/   CLI entry point
tests/
  unit/           Deterministic tests
  evaluation/     Opt-in live model checks
  fixtures/       Shared bilingual cases
docs/
  decisions/      Architecture decision records
```

See [architecture.md](docs/architecture.md) for the boundaries and [evaluation-cases.md](docs/evaluation-cases.md) for the evaluation strategy.

## V1 scope

Included: intent recognition, entity extraction, supported-unit normalization, ambiguity handling, bilingual input, and strict output validation.

Excluded: product IDs, database access, authorization, conversational memory, tool calling, LangGraph, and real inventory execution.

## Roadmap

1. Expand and score the bilingual evaluation dataset.
2. Add a second provider adapter and compare quality, latency, and cost.
3. Introduce entity resolution against a product catalog.
4. Add tool calling only after validation and authorization boundaries exist.
5. Study multi-step workflows before introducing an agent framework.
