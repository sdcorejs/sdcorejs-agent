---
name: sdcorejs-spec
description: Spec authoring and approval gate. Use after brainstorming confirms requirements, or when the user asks to write/review/approve/change a spec or design doc. Writes a draft in the matching track directory under .sdcorejs/docs, self-reviews, waits for explicit approval, then persists the approved snapshot in the matching track directory under .sdcorejs/specs before plan. Applies across tracks. Runtime-localized.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 02 - Spec


## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` as a read-only,
   relevance-first context assembler.
4. Read `_refs/shared/artifact-lifecycle.md`; draft and approved spec artifacts
   must emit `artifact_context`.
5. Current user request, current files, diffs, logs, failing tests, and command output override stored context.
6. Before presenting user-facing choices, approval gates, yes/no questions, or mode selections, read and apply `_refs/shared/user-choice-prompt.md` so options are presented as sequential numbered choices.

## Purpose
Turn the confirmed requirement contract into a durable spec, hold the user approval gate, and persist the approved spec corpus inside the same skill.

A spec answers what and why. A plan answers which files and in what order.

## Preconditions
- `sdcorejs-brainstorming` has confirmed the minimum blockers and emitted
  `requirement_context`, or the conversation already contains an equivalent
  complete requirement set with explicit decisions, assumptions, target root,
  target root kind, track, stack profile, and acceptance criteria seed.
- Target root and context/track are known.
- For non-trivial code/test generation, do not proceed from an unconfirmed idea.

If these are missing, route back to `sdcorejs-brainstorming`.

Before drafting, apply `_refs/shared/project-context.md` with:

```text
caller_context: sdcorejs-spec
context_mode: summary-read
side_effects_allowed: true
```

Spec writes are allowed only for the draft/approved spec artifacts owned by this
skill. Missing or stale summary is not permission to refresh context. Use
targeted reads instead unless the user explicitly approved a summary refresh.

## Process

### 1. Load guidance and prior style
Read the relevant guidance:

- angular / nestjs / nextjs: `_refs/sdlc/<track>.md`
- ai-agent: `_refs/sdlc/ai-agent.md` plus
  `_refs/ai-agent/{manifest.json,profile-contract.json,profiles/common.md}`
- test: `_refs/shared/testing-philosophy.md` plus the target stack test ref if known
- product: existing product ledgers under `.sdcorejs/docs/product/`
- generic harness: previous approved specs/plans and available project scripts
- package manager evidence: `packageManager`, lockfiles, workspace files, and
  `package.json` scripts, only to set verification expectations. Do not invent
  scripts or hardcode `npm`, `npx`, or `tsc` as universal commands.

Then read:

- Directly related `.sdcorejs/docs/<track>/*.md`, selected by artifact metadata
  and request scope rather than recency alone.
- Relevant `.sdcorejs/memories/<track>/*.md`.
- Latest 1-3 approved specs under `.sdcorejs/specs/<track>/` to mirror style.
- Any provided `requirement_context`; preserve `contract_id`, `requirement_id`,
  `target_root`, `target_root_kind`, `track`, `stack_profile`,
  `profile_confidence`, explicit decisions, inferred/defaulted assumptions,
  unresolved blockers, and redaction status.

If the user asks to revise an approved spec, do not mutate the approved
snapshot. Create a new revision with `supersedes` and `change_reason`. If a
draft references stale requirement context, stop and return to brainstorming or
ask for an updated requirement contract.

### 2. Write the draft spec file
Write the editable draft to:

```text
<target-project>/.sdcorejs/docs/<track>/<YYYY-MM-DD-HH-mm>-<kebab-topic>-spec.md
```

Use this template:

````markdown
# Spec - <Title> - <YYYY-MM-DD HH:mm>

```yaml
spec_context:
  source: sdcorejs-spec
  contract_id: <from requirement_context or newly created>
  requirement_id: <from requirement_context when present>
  approved_spec_path: <empty until approved>
  approved_spec_hash: <empty until approved>
  supersedes: <prior approved spec path or null>
  target_root: <target root>
  target_root_kind: target-project | sdcorejs-agent-authoring-repo | skill-pack-authoring-repo | unknown
  track: <track>
  stack_profile: <stack profile>
  profile_confidence: high | medium | low
  source_requirement_context: <requirement_context id or embedded summary>
  acceptance_criteria_count: <number>
  manual_criteria_count: <number>
  non_goals:
    - <item>
  risks:
    - <item>
  assumptions:
    - <item>
  redaction_applied: true | false
  approval:
    approved: false
    approved_at: null
    approval_source: explicit-user-choice | imported-approved-spec | equivalent-complete-input
  change_control:
    revision: <integer>
    supersedes: <prior approved spec path or null>
    change_reason: <reason or null>
```

## Problem & Goals
<What problem this solves, who it serves, and what success looks like.>

## Non-goals
- <Explicit out-of-scope item>

## Architecture
<How this fits the project, including context/track-specific conventions.>

## Stack profile and technology assumptions
- Track: <track>
- Stack profile: <stack_profile>
- Profile evidence: <short list>
- Technology assumptions: <explicit, inferred, defaulted, or unknown>

## File structure
- `<path>` - <create/edit intent>

## Acceptance criteria
- AC-001 - <Concrete, testable criterion>

## Risks & mitigations
- **Risk:** <risk> -> **Mitigation:** <mitigation>

## Out of scope (deferred)
- <Deferred item> - defer until <trigger>
````

For test-track specs, "File structure" may describe test files, fixtures, page objects, or harness files. For product-track specs, it may describe product ledgers, UAT checklists, traceability matrices, and source artifacts. For generic harness specs, it may describe the files/commands the harness is allowed to touch.

For `track: ai-agent`, the Architecture section must resolve one engine profile
and one independent capability profile, and specify runtime ownership, target
paths, trust/tenancy/data boundaries, provider storage posture,
business-shaped tool contracts, guardrails, approvals, session/state,
evidence, tracing/audit/usage, limits, reliability, deterministic evals,
separate live-verification evidence, rollout, rollback, and non-goals. Apply
`_refs/sdlc/ai-agent.md`; fail closed when any security or ownership decision is
unresolved.

### 3. Self-review before showing the user
Fix the spec before presenting if any checklist item fails:

- No `TBD`, `TODO`, `???`, or placeholder text.
- Every template section is present and populated.
- At least one explicit non-goal.
- At least one acceptance criterion per user-visible behavior.
- Acceptance criteria have stable IDs such as `AC-001`, `AC-002`; mark manual
  or deferred criteria clearly.
- Architecture matches the confirmed requirement contract.
- File paths match the detected context or are clearly marked generic harness paths.
- Language is consistent with the user.
- Scope is not too large; suggest splitting if the spec is over 2 pages.
- Plain profiles stay plain: do not force SDCoreJS/Core UI/build-website
  assumptions for `plain-angular`, `plain-nestjs`, `plain-nextjs`,
  `react-vite`, `react-cra`, `react-next-generic`, `node-general`, or
  `general`.
- Redact secrets and PII; use `[REDACTED]` placeholders and record
  `redaction_applied: true` if sensitive input appeared.
- For `ai-agent`, verify the selected IDs exist in the manifest, provider state
  remains disabled unless governance approval is explicit, generic raw tools
  are absent, and acceptance criteria cover server denial plus the offline/live
  evidence boundary.

### 4. Present the approval gate
Show a concise summary, not the whole spec:

```text
Spec written: <relative path>

Summary:
- Goal: <1 line>
- Scope: <module/entity/page/test/harness area>
- Files: <N> create, <M> edit
- Acceptance: <N> criteria
- Non-goals: <short list>
- Risks: <short list>

Do you approve this spec?

Options:
1. Approve - snapshot the spec and draft the plan.
2. Change - tell me what to update, then I will revise the spec.
3. Cancel - stop here.

Reply with `1`, `2`, or `3`. If you choose `2`, describe the change.
```

Translate the prompt at runtime.

### 5. Handle user response

Approve:

1. Write an immutable approved-spec snapshot under:

```text
<target-project>/.sdcorejs/specs/<track>/<YYYY-MM-DD-HH-mm>-<kebab-topic>.md
```

Compute `approved_spec_hash` over the canonical approved contract body,
excluding frontmatter and the `approved_spec_hash` field, so the hash is not
self-referential.

2. Include frontmatter:

```yaml
---
artifact_id: spec-<contract-id>-r<revision>
artifact_kind: spec
change_ref: <contract id>
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-spec
name: <kebab-topic>
description: <one-line future-loading hook>
contract_id: <contract id>
requirement_id: <requirement id>
approvedAt: <ISO-8601 timestamp with timezone>
approvedBy: <git user.email or session user when known>
approval_source: explicit-user-choice | imported-approved-spec | equivalent-complete-input
track: <angular|nestjs|nextjs|react|node|fullstack|ai-agent|test|product|design|documentation|workflow|general>
target_root_kind: target-project | sdcorejs-agent-authoring-repo | skill-pack-authoring-repo | unknown
stack_profile: <stack profile>
profile_confidence: high | medium | low
sourceDraftPath: .sdcorejs/docs/<track>/<timestamp>-<topic>-spec.md
approved_spec_hash: <sha256 of approved contract body excluding frontmatter and this hash field>
acceptance_criteria_count: <N>
manual_criteria_count: <N>
redaction_applied: true | false
supersedes: <prior approved spec path or null>
change_control:
  revision: <integer>
  supersedes: <prior approved spec path or null>
  change_reason: <reason or null>
---
```

3. Emit both the draft and approved snapshot in
   `artifact_context.required_with_change`; set `source_spec` to the approved
   snapshot path for downstream producers.

3. Body format:

```markdown
# <Title> - Approved Spec

> Snapshot of what the user approved at the `sdcorejs-spec` gate. Do not edit by hand; re-author through `sdcorejs-spec` if the contract changes.

## Approved contract
<verbatim approved spec content>

## Decisions captured during review
- <what changed during review, or `(approved as drafted)`>

## Skill provenance
sdcorejs-spec (approved on attempt <N> / 3)
```

4. Emit a final `spec_context` block in the handoff. Include the
   `approved_spec_path`, `approved_spec_hash`, approval metadata,
   `change_control`, and source `requirement_context` reference.
5. Only after the approved snapshot succeeds, hand off to `sdcorejs-plan` with
   the draft spec path, approved snapshot path, and `spec_context`.

Change request:

1. Edit the spec in place.
2. Re-run the self-review checklist.
3. Re-present the summary.
4. Cap at 3 revision rounds, then suggest returning to `sdcorejs-brainstorming`.

Abort:

1. Leave the spec file in place.
2. Do not write an approved snapshot.
3. Stop the workflow.

## Rules

### Must do
- Write the spec in the target project, never in the `sdcorejs-agent` repo.
- Wait for explicit approval before writing the approved snapshot or planning.
- Create a new approved snapshot every time; snapshots are immutable history.
- Treat approved specs as immutable snapshots. If requirements change after
  approval, create a new spec revision with `supersedes` and `change_reason`.
- Preserve `contract_id`, `target_root_kind`, `stack_profile`, profile evidence,
  explicit decisions, inferred/defaulted assumptions, non-goals, risks, and
  redaction status.
- Include problem statement, goals, non-goals, users/personas when relevant,
  functional requirements, non-functional requirements when relevant, data/API/
  security/permission implications when relevant, UI/UX constraints when
  relevant, acceptance criteria with stable IDs, manual/deferred criteria,
  risks/open questions, migration/dependency changes if requested, and
  test/verification expectations.
- Redact secrets and PII. Never persist credential values, tokens, API keys,
  database URLs, JWTs, cookies, customer PII, production payloads, sensitive
  logs, or raw stack traces containing secrets. Record env key names only.
- Capture review decisions honestly; never leave the section blank.
- Treat silence, "thanks", and follow-up questions as not approved.
- Preserve the user's language in prose.
- Use English identifiers and route paths.

### Must not
- Mix implementation order into the spec.
- Auto-approve the spec.
- Skip approved snapshot writing on approval.
- Proceed to `sdcorejs-plan` before the SPEC snapshot is written.
- Overwrite an old approved snapshot.
- Mutate an approved snapshot in place.
- Treat stale/missing context as permission to write or refresh `.sdcorejs`
  summary artifacts.
- Add migration or dependency adoption scope unless the requirement context
  explicitly approved it.

## Cross-references
- `sdcorejs-brainstorming` - requirement contract input
- `sdcorejs-plan` - consumes the approved spec
