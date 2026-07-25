# Test-Driven Development

## Contents

- [Contract](#contract)
- [Cycle](#cycle)
- [Valid RED](#valid-red)
- [Ledger](#ledger)

## Contract

Use this reference only for `tdd-red` or `tdd-cycle`. Preserve the existing
runner, command, workspace, test style, and project architecture. TDD does not
authorize dependency installation, shared config changes, unsafe environments,
or unrelated production refactors.

## Cycle

1. Select one observable behavior from a requirement or current risk.
2. Write the smallest case that expresses that contract.
3. Run the narrowest discovered command and verify RED.
4. In `tdd-red`, stop and hand off the proven failing case.
5. In `tdd-cycle`, write the smallest production change that can satisfy it
   only inside approved production paths. A direct invocation without approved
   production write scope stops after RED and requests a plan/approval.
6. Re-run focused verification and verify GREEN.
7. Refactor only while green, then run the relevant broader discovered command.

Repeat for the next behavior. Do not pre-build several production layers before
proving the first contract.

## Valid RED

A valid RED fails because the intended behavior is absent or wrong. Import,
compile, runner configuration, missing dependency, credential, environment, and
unrelated failures are blockers, not proof. Existing unrelated failures must be
separated from the new case.

Do not weaken assertions, add skips/only markers, inflate retries, or rewrite the
case to match a bug. Root-cause work outside the scoped TDD cycle transfers to
`sdcorejs-debug`.

## Ledger

For each case retain:

```yaml
tdd_cycle:
  case_id: case-<id>
  requirement_refs: []
  red:
    run_id: run-red
    intended_failure_observed: true
  green:
    run_id: run-green
    result: passed
  refactor:
    run_id: run-refactor
    result: passed
  associated_HEAD_or_diff: <sha-or-diff-fingerprint>
```

The ledger supplements v2 `test_context`, `test_status`, and `test_evidence`; it
does not replace them.
