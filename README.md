# inventory-intent-engine

Project for translating Spanish and English inventory messages into validated, provider-agnostic domain intents.

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
  "status": "needs_clarification",
  "actions": [
    {
      "operation": "increase",
      "productName": "papa",
      "quantity": 10,
      "unit": "kg",
      "reason": "purchase",
      "purchasePrice": {
        "status": "pending",
        "amount": null,
        "currency": "COP",
        "basis": null,
        "unit": null,
        "pendingReason": "awaiting_input",
        "referencePrice": { "amount": 3000, "currency": "COP", "basis": "per_unit", "unit": "kg" }
      }
    },
    {
      "operation": "decrease",
      "productName": "huevos",
      "quantity": 5,
      "unit": "unit",
      "reason": "waste",
      "purchasePrice": null
    }
  ],
  "clarification": {
    "question": "¿Cuál fue el precio de compra? La referencia es 3000 COP por kg: puedes usarla, indicar otro precio o dejarlo pendiente.",
    "missingFields": ["price"]
  }
}
```

## Design goals

- Spanish and English input with one canonical English domain vocabulary.
- Strict structured outputs validated with Zod.
- Model-provider independence at the application and domain layers.
- Explicit clarification instead of invented data.
- Deterministic tests without API calls plus optional live evaluations.

## Getting started

Requirements: Node.js 22.12+ (22.x) or 24+, and the pnpm version declared in package.json.

```bash
pnpm install
cp -n .env.example .env
```

Set `OPENAI_API_KEY` in `.env`, then run:

```bash
pnpm start "Se compraron 10 kilos de papa y se quebraron 5 huevos."
pnpm start "I bought half pound of meet for 30k total."
```

## Quality commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
RUN_LIVE_EVALS=false pnpm test
pnpm build
```

Live evaluations are intentionally separate because they consume API tokens:

```bash
RUN_LIVE_EVALS=true pnpm exec node --env-file=.env ./node_modules/vitest/vitest.mjs run tests/evaluation
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

## Purchase prices and demo context

The CLI injects `MOCK_INVENTORY_CONTEXT`: COP, papa at 3000 COP/kg, and meat at 12000 COP/lb. These are invented demo fixtures, not current market or catalog prices. Library callers must pass their own context to `execute(input, context)`; there is no hidden default currency.

Purchase actions contain `purchasePrice`; other actions use null. A missing price produces `needs_clarification` while preserving the inventory action. A supplied reference is offered in that same question, separately from the accepted amount. Explicitly leaving the price unavailable permits `ready` with `status: pending` and `pendingReason: user_unavailable`. Pending does not mean unpaid.

`provided` records a user-supplied price. `confirmed_reference` records explicit acceptance of the exact supplied reference. Price basis is `total` (unit null) or `per_unit` (unit required); no unit conversion occurs. Zero is permitted as an explicit price, but never used as a missing-value default. Currency defaults to the injected configuration; an explicit conflict is preserved and requests clarification.

Supported units include `lb` (pound/pounds/libra/libras). Positive fractions such as half a pound become 0.5 lb. Magnitude suffixes such as 30k and 1M become 30000 and 1000000 for the quantity or price identified by the message. Product spelling is preserved, including `meet` in the CLI example.

The experiment is stateless. To demonstrate a follow-up decision, repeat the purchase details:

```bash
pnpm start "Compré 10 kg de papa; usa el precio de referencia propuesto."
pnpm start "Compré 10 kg de papa; no tengo el precio, déjalo pendiente."
```

A bare "yes" cannot resume a purchase. There is no catalog lookup, stored conversation, invoice creation, payment determination, or inventory execution. Reference matching uses exact product names only. The model interprets user acceptance; this is not an authorization mechanism for future execution.
