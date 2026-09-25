# Review Context Extensions

Read only the section whose context is present in the review input. Each
extension adds criteria; none widens review scope or grants write authority.

## AI-agent review

When `ai_agent_context` is present, preserve its approved hashes, selected profiles, contract/target paths, and offline/live evidence status. Load only the
applicable `_refs/ai-agent/**` contracts. Review trust and tenant derivation, server-side authorization, business-shaped tool boundaries, mutation approval,
idempotency/resource versions, session isolation, provider storage governance, evidence provenance/freshness, trace/audit redaction, budgets/limits,
deterministic security gates, dependency/runtime ownership, and honest live claims. Treat any silent weakening of the common floor as a blocking
security-policy finding and `user-decision`, not an automatic style repair.

## Simplification review

When `simplify_context` is present, preserve the canonical v2 payload from
`_refs/simplify/verification.md`. Use `evaluateSimplifyConsumer` with the trusted
host session before reviewing selected files/hunks, the actual repository diff and content-bound preservation receipts. A matching HEAD is insufficient;
legacy and limited claims cannot satisfy current verification. Check for scope expansion, protected file or protected content changes, public-contract
drift, string/prompt changes, framework metadata changes, auth/tenant/permission drift, side-effect or ordering drift, over-simplification, stale test evidence,
and dependency/config churn.
