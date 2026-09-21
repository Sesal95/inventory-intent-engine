# Evaluation strategy

The first evaluation set covers:

- Spanish and English inputs.
- One and multiple actions.
- Purchases, deliveries, waste, and adjustments.
- Missing quantities or units.
- Invalid negative quantities.
- Mixed complete and incomplete actions.

Deterministic unit tests validate schemas, application orchestration, and domain invariants without network calls. Live model evaluations are opt-in because they consume tokens and can vary across model versions.

Run live evaluations with:

```bash
pnpm test:evaluation
```

Before comparing providers, expand the fixture set and record model name, prompt version, pass rate, latency, and estimated cost.
