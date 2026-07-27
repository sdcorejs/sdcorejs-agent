# Evidence and Reporting

Evidence-backed output separates retrieved facts, calculations, assumptions,
and narrative. Invented evidence is forbidden.

## Evidence Envelope

Each material fact records:

- source identifier and authorized retrieval operation;
- trusted tenant and access policy applied;
- `data_as_of` timestamp and retrieval timestamp;
- metric-definition version and semantic layer identifier;
- dimensions, filters, units, timezone, and currency;
- row count or aggregation coverage;
- partial-data, stale-data, and unavailable-data flags;
- transformation or calculation version;
- citation or drill-through reference safe for the current principal.

## Semantic Policy

Business metrics come from an approved semantic layer or versioned definition,
not model-invented formulas. When definitions conflict, ask for clarification
or present the alternatives with their owners and versions. Do not silently
combine incompatible grains, periods, currencies, or population scopes.

## Reporting Rules

State the reporting window, timezone, filters, units, currency, exclusions, and
`data_as_of`. Label estimates and assumptions. Disclose material partial-data
or stale-data conditions next to the affected conclusion, not only in a footer.

For comparisons, verify both periods use compatible metric definitions. For
rankings, disclose ties and suppressed small cohorts. For totals, reconcile
component coverage and identify non-additive metrics.

## Refusal and Degradation

If required evidence is missing, unauthorized, too stale, definition-ambiguous,
or materially partial, return the available evidence and a bounded explanation
of what cannot be concluded. Never fill gaps with plausible values.

Generated prose may summarize supported facts, but numeric claims, record
status, policy conclusions, and audit assertions must map to evidence items.
Tests should fail when a material claim has no evidence reference.

## Golden Baselines

Deterministic reporting evals compare normalized evidence envelopes and
calculation outputs against versioned golden baselines before assessing prose
quality. Update a baseline only with an approved semantic-definition change and
record its expected impact.
