# Contract regression evidence

Baseline: `af42f21a36f12ae31c09abac1009f41f51b3d87f`, initially clean working tree, Node `v24.22.1` (supported by the manifest). The reusable test file is `contract-regression.test.mjs`; set `SDCOREJS_TEST_REPO` to another checkout when needed. Sources were read only. Tests wrote and removed isolated synthetic memory fixtures under this work directory; they did not read env secrets, call providers, launch workers, or mutate Git.

Run: `node --test --test-reporter=tap /workspace/work/skill-audit/contract-regression.test.mjs`.

Result: **23 tests, 13 PASS, 10 expected RED failures, 0 skipped**. Raw TAP is `contract-baseline-red.tap`; source identity and hashes are in `contract-baseline-source.json`; machine-readable summary and evidence hashes are in `contract-baseline-summary.json`.

| Finding | Direct observation | Controls |
|---|---|---|
| F-001 | Actual published spec and plan frontmatter, populated with valid synthetic values, passes creation but fails verification after its documented self-alias is inserted, serialized and parsed. Both fail with approval hash mismatch. | Alias-free spec and plan validate. Body, owner and parent-reference hash tampering reject; a plan's `approved_spec_hash` remains protected; a mismatched self-alias rejects. |
| F-002 | Read-only contract and dispatch context validate, and topology is `READ_ONLY_FANOUT` / `PARALLEL-CANDIDATE` with no per-agent cwd capability. Mandatory compiler throws `plan_context.parallel_candidates.units must be an array`. | Request/scope mismatch, invented plan identity, writable paths, changed result type, Git mutation and approved-artifact mutation reject. |
| F-003 | A plan-authorized first flaky repair attempt with zero post-fix passes is blocked. A bounded directly authorized fix is blocked solely for lacking a plan. | Completion with fewer than three post-fix passes blocks; three passes succeed. Diagnose-only remains read-only; stale evidence, wrong owner, traversal, unverified root, invalid direct-authorization scope/provenance reject. |
| F-004 | Integration ownership alone returns `write_allowed:true` for each of env, persona and memories writes. | Explicit action authority works for allowed owner roles, rejects parallel/unknown roles. Summary initialization and after-review convention policy remain supported; convention policy does not authorize unrelated actions. |
| F-012 | Exact `change_ref` finds the corresponding documentation but returns no memories key, even when matching memories exist. | Fixtures include unrelated newer memory and a stale conflicting memory. Desired projection exposes only related memory paths, labels all as advisory, preserves explicit current-source evidence, and selects no memories without request/relationship relevance. |

## Proposed interfaces used by the tests

- `compileParallelContext({read_only_context, runtime_capabilities})` retains the existing return shape and produces a context accepted by the actual `validateDispatchContext` without writable paths or fabricated plan fields.
- `evaluateDebugArtifact(artifact, {phase:'attempt'|'completion'})` separates pre-write eligibility from post-fix completion. The integration owner selected default `attempt`; completion must be requested explicitly.
- `artifact.direct_authorization` contains `source:'explicit-user-request'`, nonempty `request_id`, exact `owner_repository_id`, `source_revision`, `source_fingerprint`, bounded `allowed_paths`, and `bounded_low_risk:true`. This is a trusted runtime projection of established session evidence; arbitrary caller JSON cannot grant user authorization.
- Existing `resolveExploreWriteAuthority` parameters remain. Ownership alone does not authorize env/persona/memory writes. Initialization authorizes summary refresh; convention capture policy remains usable.
- `project_context.related_artifacts.memories` is a path array. `project_context.memory_policy` includes `authority:'advisory'` and `current_source_precedence:true`. These fields do not claim a stale memory was verified or resolve semantic conflicts automatically.

## Limits and integrity notes

These are current-source contract and isolated filesystem checks, not live-model or provider evaluations. Template tests instantiate literal published frontmatter with synthetic values rather than asking a model to author an artifact. Full parent-graph handoff was not tested. No real scheduler workers were launched. Memory precedence is tested as an explicit returned contract, not as downstream model instruction following.

An initial probe used a nonexistent `nestjs-basic` profile. That fixture defect was corrected to registry-supported `plain-nestjs` before the final RED capture. Its output remains separately preserved as `contract-probe-fixture-error-initial.tap` and is excluded from defect evidence and reported counts. Historical files were not overwritten after final capture.
