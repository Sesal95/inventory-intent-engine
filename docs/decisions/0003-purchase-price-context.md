# ADR 0003: Preserve inventory intent while purchase price is pending

## Status

Accepted

## Decision

Add nullable purchase-price metadata to every action, required for purchases and null otherwise. Track provided, confirmed_reference, and pending prices. Pending has an explicit reason: awaiting_input or user_unavailable. Preserve partial amounts and basis rather than inventing missing values.

Ask for missing price and offer an available reference in one clarification. Only explicit acceptance permits using the reference. Explicitly unavailable price may coexist with ready inventory intent. A reference remains a separate proposal until accepted.

Currency is part of the contract, but its default belongs to AXIS client configuration. Inject it with mock reference data in this repository. Preserve explicit currency conflicts and ask for clarification without conversion. Reference data matches exact product names; entity resolution remains outside V1.

## Consequences

- The output contract changes: actions must include purchasePrice and callers must supply interpretation context.
- No financial execution or payment status is inferred. Pending price is not equivalent to accounts payable.
- The model interprets intent, including acceptance; structural validation cannot prove semantic faithfulness. Evaluations must test it, and later execution requires domain controls.
- Follow-up demos repeat purchase details and the decision in one input. Persistent conversations remain out of scope.
- Pounds and positive fractional quantities are supported. Numeric suffix normalization is an interpretation task, assessed with live evaluations rather than a fake parser.
