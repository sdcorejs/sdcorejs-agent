---
schema_version: 1
artifact_id: skill-audit-content-cloud-handoff-20261105
artifact_kind: handoff
change_ref: skill-audit-content-handoff-20261105
source_spec: none
source_plan: none
source_revision: 83837d8181f1b587327d8680736a4789626b9255
commit_policy: with-change
owner: sdcorejs-documentation
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
status: ready-for-cloud-scoping
redaction_applied: true
---

# Codex Cloud handoff: skill audit and Content proposal

## Start here

Read the [complete audit and proposal](../../docs/workflow/2026-11-05-full-skill-audit-and-content-proposal.md). It preserves the review of all 24 public skills, the internal authoring skill, source-backed findings, upstream comparisons, the proposed Content capability, validation limits, and the five-phase roadmap.

This is a deliberate documentation-only handoff requested by the user. No finding has been implemented on this branch. The audit and roadmap are not approved spec/plan snapshots. The subsequent Cloud task instruction determines which changes to implement; this handoff does not silently authorize every recommendation, new public inventory, external publishing, or production-SDLC expansion.

Repository: `github.com/sdcorejs/sdcorejs-agent`.

Handoff branch: `docs/skill-audit-content-handoff-2026-11-05`.

Audited baseline: `83837d8181f1b587327d8680736a4789626b9255`.

The two files introduced by the documentation handoff are:

- `.sdcorejs/docs/workflow/2026-11-05-full-skill-audit-and-content-proposal.md`
- `.sdcorejs/handoffs/workflow/2026-11-05-skill-audit-content-handoff.md`

Use repository-relative paths. Local Windows home directories, temporary upstream clones, runtime manifests, and the original chat are not prerequisites for continuing in Cloud. Source line numbers in the audit refer to the audited baseline; locate the current symbols and check for intervening fixes before editing.

## User requirements already established

The user requested a detailed review of every skill using `skill-creator`, with comparisons to Superpowers, UI UX Pro Max, and other relevant skill repositories. The user is considering content creation alongside engineering work.

The user explicitly clarified:

- Content serves **both personal branding and product marketing**.
- The skill should be broad enough for **Facebook, TikTok, and other social networks**.
- Specialized references should adapt it to **tech, marketing/business, travel/lifestyle**, and later domains.
- Do not constrain the capability to developers, tech leads, LinkedIn, or a single channel.
- Preserve these findings and proposals on a branch so implementation can be assigned to Codex Cloud.

Do not reopen these preference questions. Reuse explicit authorization from the subsequent task; only unresolved material scope or product decisions need clarification. First make any proposed change concrete and reviewable within the authorized scope.

## Suggested implementation order

The following work packages are proposals, not immutable approved plan units.

| Package | Scope | Observable acceptance target |
|---|---|---|
| A. Contract correctness | F-001/002/003/004/006/007/008; related retrieval mismatch F-012 | Published producer output can be consumed by its actual validator/executor; tamper, ownership, and unauthorized-write controls still reject |
| B. Proportionate workflow | F-005/009/010/011; session authorization, recovery and repair continuation | Authorized bounded work completes without repeated approval or full artifact bundles; actual risk/scope growth remains visible |
| C. Progressive disclosure | Angular, Review, Plan, Explore, Test first | Less irrelevant context and fewer unnecessary questions with preserved outcomes and invariants |
| D. Behavioral evaluation | Cross-skill transitions, literal templates, representative projects, independent agents | Separate schema/helper/runtime/model evidence, with honest denominators and NOT RUN limits |
| E. Content | One proposed public entrypoint and selected channel/format/domain references | Useful drafts, distinct voices, supported claims, correct routing, and no unauthorized publication |

Package D supports every earlier package; regression is not postponed until the end. Avoid one large undifferentiated rewrite. Revalidate source-backed risks before classifying them as confirmed defects.

## Finding-to-source map

| Finding | Primary implementation/instruction surfaces | Regression that should expose the problem |
|---|---|---|
| F-001: self-hash aliases | `_refs/shared/approved-artifact.mjs`, `skills/shared/sdlc/02-spec.md`, `_refs/sdlc/plan-approval-artifact.md` | Exact documented spec/plan frontmatter survives create, serialization, parsing, verify; protected metadata/body and parent hashes remain tamper-sensitive |
| F-002: read-only compiler | `_refs/orchestration/parallel-protocol.mjs`, `skills/orchestration/parallel-dispatch.md` | Valid read-only request compiles/schedules with empty writable paths and no invented plan fields |
| F-003: debug lifecycle | `_refs/shared/debug-contract.mjs`, `skills/shared/workflow/debug.md` | First authorized flaky fix can be attempted before post-fix results; success claim still requires evidence; bounded direct fix does not invent a plan |
| F-004: Explore authority | `_refs/shared/explore-contract.mjs`, `skills/shared/workflow/explore.md` | Integration ownership alone cannot authorize env/persona/memory writes; exact action authorization and convention policy remain usable |
| F-005: bounded fixes and repeated consent | `skills/tracks/angular/sdcorejs-angular.md`, `skills/orchestration/using-skills.md`, `_refs/shared/finish-gate.md` | One clearly authorized small fix completes with focused verification; permission-changing work takes the risk-appropriate path |
| F-006: Next.js basic/i18n | `_refs/nextjs/build-website/write-code/init-site.md`, `_refs/nextjs/generator/generate-golden-project.mjs` | Basic generation from the maintained recipe/template has no i18n dependency/import/files and builds; i18n variant works separately |
| F-007: command field | `skills/shared/sdlc/03-plan.md`, `skills/shared/sdlc/04-execute-plan.md` | Actual published plan shape selects `verification_strategy.commands_planned` correctly |
| F-008: AC identifiers | `skills/tracks/product/sdcorejs-product.md`, `_refs/shared/product-ledger.mjs` | Acceptance IDs from the published templates pass normalization/validation and preserve relationships |
| F-009: simplify current diff | `skills/shared/workflow/simplify.md`, `_refs/simplify/scope-and-invariants.md` | Same-change authorized dirty hunks proceed after baseline; ambiguous overlapping user edits remain protected |
| F-010: Git/Ship deferral | `skills/shared/workflow/git.md`, `skills/shared/workflow/ship.md`, `_refs/orchestration/tail/branch-ready.md` | One decision table yields consistent local commit, draft/manual, remote draft PR, and blocked-hygiene behavior |
| F-011: TASKID routing | `skills/orchestration/documentation.md` | Identical ticket IDs in summarize/comment/requirement requests preserve their distinct requested outputs |
| F-012: memory retrieval | `_refs/shared/project-context.mjs`, `_refs/shared/project-context.md` | Relevant memory is discoverable, unrelated memory excluded, stale/conflicting memory not silently authoritative |

Review the per-skill sections for additional opportunities, especially NestJS profile inference, actual AI-agent adapter enforcement, Design small-work branching, repair receipt production, cleanup native acceptance, and internal authoring inventory evolution. Those are not all reproduced runtime defects.

## Reproduction notes

These describe observations from the audit, not new passing regressions. Use synthetic in-memory objects or isolated temporary workspaces when turning them into tests.

### Approval aliases

Start with a valid metadata fixture accepted by `createApprovedArtifact` and verify it. For a spec, append `metadata.approved_spec_hash = metadata.approval_hash`; for a plan append `metadata.approved_plan_hash = metadata.approval_hash`. `verifyApprovedArtifact` then rejects the changed protected payload. This matches the current published templates. A parent spec hash in a plan is different from a self-hash alias and must not accidentally lose protection in the repair.

### Read-only compilation

Construct a `read-only-request` contract with request/scope hashes and `write_policy: deny`. Use report units, `shared-readonly` workspaces, empty `allowed_paths`, and denied Git/artifact mutation. `validateContract` and `validateDispatchContext` accept the valid context. With supported delegation/concurrency and explicit `supports_agent_cwd: false`, `classifyTopology` can return `READ_ONLY_FANOUT` / `PARALLEL-CANDIDATE`.

Calling the mandatory `compileParallelContext` with that context throws `plan_context.parallel_candidates.units must be an array`. Wrapping the same units as compact plan input hardcodes `approved-plan` and treats empty allowlists as ownerless. Neither fabricating plan approval nor adding write paths is an acceptable repair.

### Explore authority

For each of `env-setup-write-approved`, `persona-write-approved`, and `memories-write-approved`, call `resolveExploreWriteAuthority` with `explicit_authority: false` and `integration_owner_assigned: true`. The current helper returns `write_allowed: true`. No actual file mutation was performed. Test action-specific positive and negative authorization combinations, including parallel-worker denial.

### Debug lifecycle

Start from the valid fixture shape in `test/e2e/debug-contract.test.mjs`. The current baseline is ready. Removing `approved_plan_step` blocks every fix. Setting `debug_mode: flaky` with zero `consecutive_post_fix_passes` blocks pre-write authorization even when the other requirements are valid. Separate attempt eligibility from verified completion; do not weaken stale-owner/scope/root-hypothesis controls.

## Content capability design constraints

Recommended entrypoint: `sdcorejs-content`. The name and integrated/optional packaging remain design proposals until the subsequent task establishes scope.

Keep independent dimensions: author/brand identity, objective, channel, format, and domain. Select only applicable references; do not create one skill per combination or load the whole catalog. Start depth with Facebook/TikTok and tech, marketing/business, travel/lifestyle while retaining extensibility to other networks.

Capabilities: brief, strategy/series, research and claim checking, drafting/editing, repurposing, editorial review, and learning from actual feedback. A single caption should not require an engineering spec/architecture/plan chain. A larger campaign may need explicit strategy and deliverables.

Personal voice and product brand voice must be separate profiles grounded in real writing and edits. They are not the existing technical/nontechnical agent persona. Distinguish verified facts, personal experience, opinion, inference, accepted voice rules, and observed performance. Never invent firsthand travel experience, testimonials, benchmark results, or platform rules.

Reference metadata should explain applicability/exclusions, provenance, verification date, and refresh conditions. Separate stable editorial guidance from platform limits, heuristics, and account-specific observations. Do not hardcode universal posting frequency, algorithm effects, hashtag counts, or causality from one high-performing post.

Drafting, media creation, scheduling, publication, messaging, and persistent profile updates have distinct effects. Use existing authorization for the matching action; drafting alone does not authorize external publication. Use available media capabilities honestly, preserving user tools and avoiding unsolicited installs.

Canonical authoring must fit this repository's `skills/**` and `_refs/**` structure. Update approved inventory, routing, packaging, site and mirrors only when the new public capability is actually authorized. Do not bypass the existing inventory policy by placing public behavior in an internal surface. Do not add CI/CD, infrastructure, SRE, or production-release governance as an incidental consequence.

## Validation and evidence policy

Historical audit verification at the baseline used supported Node 24.19.0:

```sh
node --test test/e2e/debug-contract.test.mjs
node --test --test-name-pattern='compile|read-only|protocol v2' test/e2e/parallel-dispatch-protocol.test.mjs
node --test --test-name-pattern='compact plan compilation' test/e2e/parallel-dispatch-protocol.test.mjs
```

Observed counts: 8 + 5 + 1 passing existing tests. These tests did not expose all newly identified composition errors. The audit report records the separate failing helper probes.

At implementation time:

1. Read current `AGENTS.md`, relevant canonical skills, and internal authoring instructions when changing dispatch/contracts/inventory.
2. Discover the actual supported runtime and package-manager scripts from current manifests. Do not copy the original host's executable paths.
3. Reproduce selected findings with current source before fixing them. Use exact templates and producer-consumer transitions where the defect lies there.
4. Keep focused executable tests, meaningful negative controls, golden/runtime checks, and independent agent evaluations distinct. Prose/regex checks alone cannot prove semantic detection or instruction following.
5. For independent behavior evaluation, give a realistic request and minimal raw inputs without the finding, intended answer, oracle, or author history. Follow the current host's delegation and side-effect permissions.
6. Measure actual selected context and unnecessary interactions for context reductions; static byte counts are only a source-size measurement.
7. Preserve historical transcripts/records and their hashes. Record new runs separately; do not relabel old source-only captures as current full-pack or live-provider evidence.
8. Regenerate and check mirrors after canonical changes stabilize. Run focused checks first, then required integrated checks appropriate to the final change.
9. Report missing runtime, native OS, browser, target-project, or provider coverage as NOT RUN with reasons. Do not infer full coverage from a partial matrix.

The checked-in live-agent matrix includes NOT RUN entries. The earlier 18-case review evaluation remains historical source-only evidence at its documented identities. This handoff contains no new raw captures or full-suite success claim.

## Expected Cloud deliverables after scope is assigned

- A concrete spec/plan or bounded implementation scope appropriate to the Cloud request, preserving the already answered preferences.
- Selected fixes with regression evidence and explicit treatment of deferred opportunities.
- Canonical/mirror consistency and accurate inventory/routing if Content is added.
- A concise implementation report distinguishing observed behavior from remaining limitations.
- Git/PR actions only as requested by the subsequent task; this handoff itself requests no merge, release, or publication.
