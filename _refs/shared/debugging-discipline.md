# Debugging Discipline

> Loaded by `sdcorejs-debug` for every non-trivial bug investigation.
> Not a dispatchable skill; no frontmatter.

## Purpose

Debugging is a constrained search for root cause. Move from observed evidence to
falsifiable hypotheses, then to the smallest safe fix. Do not start from a
preferred patch.

## Loop

1. Capture observed and expected behavior with redacted evidence.
2. Classify the session: `debug_mode`, `bug_class`, `stack_profile`,
   `repro_status`, and environment.
3. Reproduce locally, evidence-confirm, flaky-confirm, or mark blocked.
4. Isolate the smallest failing input, state, command, route, component, or
   test case.
5. Maintain the Hypothesis Ledger.
6. Add diagnostic instrumentation only when it answers a falsifiable question.
7. Confirm one root hypothesis before patching.
8. Patch the root cause with the smallest safe change.
9. Add focused regression coverage when feasible.
10. Re-run the original repro and discovered verification commands.
11. Emit `debug_context`, then route through ship gates before any Git artifact.

## Hypothesis Rules

- Every hypothesis must explain the observed behavior and predict evidence that
  can prove it wrong.
- Keep at most 3 live hypotheses. If there are more, gather evidence instead of
  patching.
- Mark each hypothesis as `confirmed`, `falsified`, `inconclusive`, or `root`.
- Do not patch until at least one hypothesis is confirmed, unless the user
  explicitly approves a tactical mitigation.

## Fix Scope

- Fix the root cause, not the symptom.
- Avoid shotgun debugging and broad refactors.
- Apply one coherent fix at a time.
- Do not hide symptoms with optional chaining, default values, catch-and-swallow
  blocks, retries, longer timeouts, or broad null guards unless the confirmed
  contract says that behavior is correct.
- Do not change public API, schema, permission, auth, data-integrity, migration,
  or product behavior without explicit approval.

## Evidence And Claims

- If `repro_status` is `blocked`, do not patch speculatively.
- If the bug is `evidence-confirmed`, state confidence and what environment
  still needs verification.
- If the bug is `flaky-confirmed`, record pass/fail counts and do not claim
  fixed from one passing run.
- Do not claim fixed, passed, ready, or done without current verification output.

