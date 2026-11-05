# Independent contract/workflow review

Baseline: `origin/docs/skill-audit-content-handoff-2026-11-05`.
Initial inspection: 2026-11-05T09:27:15Z. The implementer edited files concurrently; findings below distinguish initial defects from independently verified repairs.

Review scope: approval aliases and legacy hashes, read-only parallel compilation, Debug attempt/completion lifecycle, Explore action authority, dirty-tree ownership, and Git/Ship disposition. Read root AGENTS.md. No tracked edits, Git mutation, external calls, or live execution were performed. Test fixtures used temporary files only. Content/progressive-disclosure work was intentionally excluded.

## Remaining integration issue at recheck

### CR-06 — P2: parallel dirty-tree gate still rejects unrelated disjoint edits

Location: `_refs/orchestration/parallel-protocol.mjs:349` (`validateWorkingTree`), reached by `validateDispatchContext` at line 237. New policy in `_refs/shared/session-authority.md:45` permits independent owned writes when unrelated edits are disjoint, and the changed sequential helper implements that policy. The parallel helper still asks for a user decision whenever any unrelated dirty path exists. This is incomplete propagation of the new policy, not a newly introduced unsafe authorization.

Read-only reproduction:

```js
const tree = {
  unrelated_dirty_paths: ['notes.md'],
  unstaged_paths: ['notes.md'],
  intended_output_paths: ['src/orders/service.ts'],
};
evaluateWorkingTree(tree); // execution-contract: write_authorized: true
validateWorkingTree(tree); // parallel-protocol: ['unrelated dirty paths require a user decision']
```

Expected: disjoint unrelated paths should not independently force a consent boundary. Keep actual overlaps/unknown ownership blocking and preserve the stronger workspace/output protections used by parallel writes. Add a composed test through dispatch validation so the two entry paths cannot diverge silently.

## Initial findings repaired during review

### CR-01 — P1: dirty-file overlap granted writes for the same physical path

Initial location: `_refs/orchestration/execution-contract.mjs:298`. Exact-string overlap allowed unrelated dirty `src/orders/service.ts` with intended `src/orders/./service.ts` or `src//orders/service.ts`; both returned `dirty-disjoint` and `write_authorized: true`. Ancestor outputs (`src/orders`) and glob outputs (`src/orders/**`) did the same. This was an authorization regression from the former blanket dirty-tree stop.

Repair independently checked: normalization now collapses dot/slash spelling and overlap handles ancestor/glob scopes. All four original probes deny writes; genuine disjoint paths still pass.

### CR-02 — P1: malformed Git action/creation flags could authorize delivery

Initial locations: `_refs/shared/ship-readiness-contract.mjs:449`, `:464`, `:465`.
With otherwise valid current hygiene/acceptance, `action: 'push', authorized_actions: 'do-not-push'` returned `allowed: true` because string `.includes` was used without an array check. `action: 'ready-pr', commit_created: 'false', remote_branch_exists: 'false'` also returned `allowed: true` because the flags were checked by truthiness. These are malformed-input fail-open decisions even when callers are trusted host projections.

Repair independently checked: non-array authorization is denied, and commit/remote flags must be literal `true`. Both original probes now deny delivery.

### CR-03 — P2: nonnumeric flaky retry counts proved completion

Initial location: `_refs/shared/debug-contract.mjs:166-180`. With current passing evidence, `consecutive_post_fix_passes: 'unknown'`, `{}`, `NaN`, or `3.5` yielded `completion_verified: true`. The old numeric comparison coerced values or accepted fractions; the new completion flag gave that malformed evidence a concrete successful result.

Repair independently checked: finite integer semantics now block all tested invalid counts. Normal counts 0/1/2/3 remain covered by the regression suite.

### CR-04 — P2: malformed falsy plan metadata fell through to direct authority

Initial location: `_refs/shared/debug-contract.mjs:139`. Given valid direct authority, `approved_plan_step: false`, `0`, or `''` returned `write_authorized: true`. This contradicted the new documented rule that invalid plan metadata must not fall back to direct authorization.

Repair independently checked: only absent/null plan selects direct authority. The original false/zero/empty-string probes are denied; array rejection is also in the updated test.

### CR-05 — P2: legitimate direct fix could not complete with preserved authority

Initial location: `_refs/shared/debug-contract.mjs:146-147`. The same direct-authority fingerprint equality was required during attempt and completion. After an authorized fix changed the source fingerprint, fresh passing post-fix evidence could only complete if the original authorization fingerprint was rewritten. Carrying the actual original authority produced `completion_verified: false`.

Repair independently checked: attempt evaluation emits `attempt_context`; completion preserves original direct authority, binds it to that attempt, checks post-fix changed paths, and uses current post-fix test/source evidence. A real baseline-to-new-fingerprint probe passes. Missing attempt context, empty/out-of-scope changed paths, stale test fingerprint, and rewriting original authority all fail.

## Other verified behavior and limits

- Loaded the baseline approval helper read-only with `git show`, created a legacy alias-free artifact in memory, and compared it with the current helper: approval hashes match exactly and the current verifier accepts the legacy artifact.
- Published spec/plan serialization tests pass. Tampering with body, owner, plan parent hash, parent references, or self-alias mismatch is rejected.
- Read-only compilation passes the existing validated two-unit fixture with no writable ownership or invented plan identity. The suite checks forbidden mutation flags and mismatched request/scope identities.
- Explore tests verify initialization/integration ownership does not authorize env/persona/memory writes; exact explicit action authority respects allowed roles; parallel workers and unknown roles remain denied.
- Trusted caller projections are not treated as cryptographic authorization tokens. No finding assumes arbitrary JSON alone is the actual user request.
- The full repository suite was not run by this reviewer; parallel tests containing temporary Git mutations were not run because this review prohibited Git mutation.

Focused command, after fixes:

```text
node --test test/e2e/audit-contract-regression.test.mjs test/e2e/audit-workflow-behavior.test.mjs test/e2e/debug-contract.test.mjs test/e2e/ship-readiness-contract.test.mjs
48 tests passed; 0 failed; 0 skipped.
```

Independent in-memory assertions also re-ran all original malformed/overlap cases and the direct-authority lifecycle, rather than relying only on implementer-authored tests.

## Inspected identities

Initial SHA-256 values (2026-11-05T09:27:15Z):

```text
80ae04165e3da63604a2c8aca542b786dd135fb78011301c67f873324f2efb9a  _refs/shared/approved-artifact.mjs
eb8bf32c461e308d470ec829c5fff862e6826c000a3abc960c80aabd99156e4a  _refs/orchestration/execution-contract.mjs
d78228701aa27171edb3e021cf046729bb3086db93c74a7d7f4663a95accfbfe  _refs/orchestration/parallel-protocol.mjs
634ca150e18c13f0d084e79bb86fa98fa33f2a5520e8ba83d50509a6f94ecf19  _refs/shared/debug-contract.mjs
4ee8036196955c1f4bfeca699b45ce48be3098a5a0db72918bdcaa23beb65467  _refs/shared/explore-contract.mjs
b8ac19c00f42714612f828fe1cbc260eb2ba2e78d19286349cfcdb1959830557  _refs/shared/project-context.mjs
46ec72d18332dcc45abaad9a71c72480dc4bb9c1d55a8a182763d67d2a54e6f0  _refs/shared/ship-readiness-contract.mjs
```

Recheck snapshot 2026-11-05T09:32:57.615486+00:00:

```text
80ae04165e3da63604a2c8aca542b786dd135fb78011301c67f873324f2efb9a  _refs/shared/approved-artifact.mjs
68fcb8640619b5d46fd5bc03f687c0ad31e6439e1b48cc7843d6c9cf68ce4431  _refs/orchestration/execution-contract.mjs
0f1b129cd3057ab9abcfa61e8679170c04c950219a36c1eec498be48d3611dfc  _refs/orchestration/parallel-protocol.mjs
24e8f699e516a2068bfe5b689bd775bb29f1f47354ddafce5d791d367fdaa0c9  _refs/shared/debug-contract.mjs
4ee8036196955c1f4bfeca699b45ce48be3098a5a0db72918bdcaa23beb65467  _refs/shared/explore-contract.mjs
b8ac19c00f42714612f828fe1cbc260eb2ba2e78d19286349cfcdb1959830557  _refs/shared/project-context.mjs
b6a393e16579b13015cb989cffa6226e460fdfc28a8d22fce21c8d4c89653b99  _refs/shared/ship-readiness-contract.mjs
```
