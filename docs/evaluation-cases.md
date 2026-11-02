# Evaluation strategy

Deterministic unit tests cover schemas, orchestration, mock context, and price invariants without calling models. The fake provider returns predefined data; it does not prove natural-language interpretation accuracy.

Opt-in live fixtures cover bilingual purchases and waste, missing inventory data, pounds and half units, k/M suffixes in prices and quantities, unavailable prices, reference proposals and acceptance, price basis ambiguity, and currency conflicts. New cases assert semantic fields rather than only action counts. Exact wording of clarification is intentionally not asserted; language and combined-question quality still require review. Broader adjustment, adversarial, and mixed-incomplete input coverage remains future work.

Ordinary tests discover the evaluation suite but skip it unless RUN_LIVE_EVALS=true and an API key is present. Until test-suite isolation is implemented, force the flag off for deterministic runs:

```bash
RUN_LIVE_EVALS=false pnpm test
```

Load .env explicitly for paid evaluations:

```bash
RUN_LIVE_EVALS=true pnpm exec node --env-file=.env ./node_modules/vitest/vitest.mjs run tests/evaluation
```

`pnpm test:evaluation` also works when the API key is already exported; that script does not load .env. Missing credentials currently skip evaluations. Before comparing providers, record model name, prompt version, pass rate, latency, and estimated cost. Adding cases is not evidence they pass; live runs require explicit authorization.
