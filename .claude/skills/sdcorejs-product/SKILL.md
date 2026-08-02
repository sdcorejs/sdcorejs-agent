---
name: sdcorejs-product
description: Product-track executor for PO docs and traceability. Use for PRDs, user stories, acceptance criteria, feature ledgers, requirement review, traceability matrix, UAT checklists, or consistency between requirements, implementation, and tests. Updates product/ docs and .sdcorejs/docs/product/ ledgers; does not generate app code. Applies across tracks. Runtime-localized.
allowed-tools: AskUserQuestion, Bash, Edit, Glob, Grep, Read, TodoWrite, Write
---

<!-- claude-adapter: generated from required-actions; do not edit mirror by hand -->


# Product Track


## Shared Protocols

Read `_refs/shared/runtime-protocols.md` and
`_refs/shared/artifact-lifecycle.md`; load
`_refs/shared/product-ledger.md` for ledger work. Resolve track/profile through
`_refs/shared/system-registry.json`, artifact/approval identity through
`_refs/shared/approved-artifact.mjs`, and semantic repository ownership through
`_refs/shared/repository-contract.mjs`. Emit `artifact_context` for every
product ledger written. The registry is authoritative for every track,
including AI-agent, Design, Documentation, Workflow, and General; never maintain
a second hard-coded track list here.

## Purpose
Maintain PO-facing feature docs and the traceability ledger for every meaningful feature. Human-readable docs explain what the product should do. The `.sdcorejs` ledger records why the feature exists, what was agreed, what was implemented, how it was tested, and what still does not line up.

This skill does not write application code. A ledger is a relationship view,
not a competing spec or plan: specs own approved behavior, plans own execution
steps, Design owns handoffs, and Test owns test artifacts/evidence. It writes
two documentation layers in the semantic owner repository:

```text
<target-project>/product/                 # human-readable PO/QC docs
<target-project>/.sdcorejs/docs/product/  # agent traceability ledger
```

## When to Use

Use this skill in three modes.

| Mode | Trigger | Output |
|---|---|---|
| Seed | after spec approval, or user asks for product/PO doc | PRD + user stories + acceptance criteria + UAT checklist + ledger |
| Update | after plan approval or implementation changes | product docs plus implementation/test mapping updated |
| Audit | before done/commit/PR, or user asks if scope is complete | gap report across requirement, implementation, tests |

If the request is only app code generation, do not replace the app executor. Run this skill alongside it for traceability.

## Step 0 - Context preflight

Before reading product docs or writing ledgers, assemble `project_context`.

- For an existing target project, use valid summary sections when present. If
  summary is missing or stale, use targeted source/config/test reads and a
  scoped code map only when relationships remain unresolved. Do not create or
  refresh summary merely because product work is write-approved.
- For an early product-only phase where no app root exists yet, do not invent
  architecture. Continue from the approved spec/product inputs and mark
  implementation paths as `unknown` until current source evidence exists.
- If stored summary context conflicts with the current approved spec, plan, diff,
  test output, or user correction, prefer current evidence and record the gap.

## Inputs

Load what exists, in this order:

1. Approved product or app spec from `.sdcorejs/specs/<track>/`.
2. Approved plan from `.sdcorejs/plans/<track>/`.
3. Existing PO docs under `product/` for the same feature.
4. Existing design handoff under `design/` for the same feature.
5. Change-scoped execution docs related through `change_ref`, `source_spec`, or
   `source_plan`.
6. Relevant git diff or changed file list.
7. Test output supplied by `sdcorejs-test` or verification commands.
8. Existing product ledger under `.sdcorejs/docs/product/` for the same feature.

If a required input is missing, write the known facts and mark the missing item as a gap instead of inventing it.
Every cross-repository input is an immutable reference containing repository
ID, repository-relative path or artifact ID, exact revision, and applicable
approval/artifact hash. Do not copy an editable requirement into another
repository.

## Output Path

Resolve the owner before selecting output paths. Module-specific product
artifacts belong in the module repository. A missing, ambiguous, unavailable,
or unwritable module owner blocks the write; portal fallback is forbidden.
For a new feature, create or update the human-readable docs in that owner:

```text
<target-project>/product/prds/<kebab-feature>.md
<target-project>/product/user-stories/<kebab-feature>.md
<target-project>/product/acceptance-criteria/<kebab-feature>.md
<target-project>/product/uat-checklists/<kebab-feature>.md
<target-project>/product/decisions/<kebab-feature>.md
```

Also create or update the agent traceability ledger:

```text
<semantic-owner-repo>/.sdcorejs/docs/product/<kebab-feature>.md
```

For updates, edit the existing uniquely identified product docs and ledger for
that feature. Ambiguous or duplicate editable sources block; do not create
another dated ledger to hide ambiguity. Use `supersedes` only for an explicit
identity migration.

Add durable metadata to the ledger and emit it as
`artifact_context.required_with_change`:

```yaml
schema_version: 1
artifact_id: product-ledger:<feature>
artifact_kind: product-ledger
contract_id: <approved contract id>
requirement_id: <primary requirement id>
change_ref: <change id>
track: <canonical registry track>
stack_profile: <canonical registry profile>
owner_repository_id: <stable repository id>
owner_repository_role: <registry repository role>
owner_module_id: <module id | null>
ownership_scope: <registry ownership scope>
repository_relative_path: .sdcorejs/docs/product/<feature>.md
source_revision: <40-character Git revision>
parent_references: []
supersedes: <prior artifact id | null>
approval_hash: <sha256:v1 hash when applicable | null>
artifact_hash: <sha256:v1 hash from product-ledger.mjs>
source_spec: <repo-relative path | none>
source_plan: <repo-relative path | none>
commit_policy: with-change
owner: sdcorejs-product
```

A cross-module Product view may belong to the portal integration owner only as
`view_kind: cross-module-view` with `editable_requirements: false`. It must
reference module artifacts with repository/module/path/revision/artifact-hash
provenance and never duplicate their editable requirements.

## Human-Readable Doc Templates

### PRD

```markdown
# PRD - <Feature Title>

## Problem
<The user/business problem.>

## Goal
<Outcome the software should create.>

## Users
- <role> - <need>

## Scope
- <included capability>

## Out Of Scope
- <explicit non-goal>

## Success Criteria
- <observable result>
```

### User Stories

```markdown
# User Stories - <Feature Title>

| ID | As a | I want to | So that | Priority | Acceptance Criteria |
|---|---|---|---|---|---|
| US1 | <role> | <action> | <benefit> | Must | AC1, AC2 |
```

### Acceptance Criteria

```markdown
# Acceptance Criteria - <Feature Title>

| ID | User Story | Criterion | Verification | Status |
|---|---|---|---|---|
| AC1 | US1 | <observable behavior> | unit / integration / e2e / UAT | agreed |
```

### UAT Checklist

```markdown
# UAT Checklist - <Feature Title>

| Scenario | Steps | Expected Result | Owner | Status |
|---|---|---|---|---|
| <scenario> | <manual steps> | <visible result> | PO / QC | pending |
```

### Decisions

```markdown
# Decisions - <Feature Title>

| Date | Decision | Reason | Impact |
|---|---|---|---|
| <date> | <decision> | <why> | <affected tracks> |
```

## Ledger Template

```markdown
---
schema_version: 1
artifact_id: product-ledger:<feature>
artifact_kind: product-ledger
contract_id: <contract id>
requirement_id: <requirement id>
change_ref: <change id>
feature: <kebab-feature>
status: draft | planned | implemented | verified | partial
track: <canonical registry track>
stack_profile: <canonical registry profile>
owner_repository_id: <stable repository id>
owner_repository_role: <registry repository role>
owner_module_id: <module id | null>
ownership_scope: <registry ownership scope>
repository_relative_path: .sdcorejs/docs/product/<kebab-feature>.md
source_revision: <40-character Git revision>
parent_references: []
supersedes: <artifact id | null>
approval_hash: <sha256:v1 hash when applicable | null>
artifact_hash: <sha256:v1 hash>
source_spec: <relative path or none>
source_plan: <relative path or none>
prd_path: product/prds/<kebab-feature>.md
user_stories_path: product/user-stories/<kebab-feature>.md
acceptance_criteria_path: product/acceptance-criteria/<kebab-feature>.md
uat_checklist_path: product/uat-checklists/<kebab-feature>.md
updated_at: <ISO-8601 timestamp>
commit_policy: with-change
owner: sdcorejs-product
---

# Product Feature Ledger - <Title>

## Business Goal
<Why this matters and who benefits.>

## Users And Scenarios
- <user role> can <goal> so that <outcome>.

## Requirement Contract
| ID | Requirement / Acceptance Criterion | Priority | Source | Status |
|---|---|---|---|---|
| AC1 | <criterion> | Must | spec/user | agreed |

## Traceability Map
| Requirement | AC | Design | Plan | Implementation | Test | Evidence | Delivery |
|---|---|---|---|---|---|---|---|
| <requirement id/ref> | AC1 | <handoff ref or missing> | <plan ref or missing> | <repository/path/revision or missing> | <test ref or missing> | <class/result/revision or missing> | draft / planned / implemented / verified / partial / stale / blocked / deferred |

## UAT Checklist
| Scenario | Steps | Expected Result | Owner | Status |
|---|---|---|---|---|
| <business scenario> | <manual steps or link to test> | <observable result> | PO / QC | pending / pass / fail / deferred |

## Gap Review
- Requirement gaps:
- Design gaps:
- Plan gaps:
- Implementation gaps:
- Test gaps:
- Evidence freshness gaps:
- Ambiguities:

## Decisions
- <decision and reason>

## Open Questions
- <question or "None">

## Related Docs
- PRD: product/prds/<kebab-feature>.md
- User stories: product/user-stories/<kebab-feature>.md
- Acceptance criteria: product/acceptance-criteria/<kebab-feature>.md
- UAT checklist: product/uat-checklists/<kebab-feature>.md
- Decisions: product/decisions/<kebab-feature>.md
- Spec: <path>
- Plan: <path>
- Change execution records: <path>
```

## Audit Rules

For each acceptance criterion:

1. It must map to at least one implementation artifact or a deliberate "not implemented" decision.
2. It must map to at least one verification artifact: unit, integration, e2e, UAT, or explicit manual check.
3. Preserve applicable Design and approved Plan references without copying
   their bodies or taking ownership of them.
4. Compare evidence revision with the current owner repository revision.
   Mismatches are `STALE`/`stale`, never pass.
5. If implementation exists with no requirement, mark it as scope creep.
6. If test exists with no requirement, mark it as orphan coverage.
7. If requirement exists with no implementation, current test, or current
   evidence, mark it as a blocker before `verified` unless the user explicitly
   defers it. Missing test/evidence is not pass.

Status vocabulary:

- `done`: requirement, implementation, and test evidence all align.
- `verified`: requirement, implementation, test, and current `PASSED` evidence align.
- `partial`: one side is present but incomplete.
- `missing`: no matching artifact.
- `stale`: evidence is bound to an older repository revision.
- `deferred`: user explicitly postponed it.
- `n/a`: not applicable and explained.

## Report Format

When auditing, report briefly:

```markdown
Product traceability - <feature>

| AC | Requirement | Implementation | Test | Status |
|---|---|---|---|---|
| AC1 | agreed | done | done | done |
| AC2 | agreed | partial | missing | blocker |

Verdict: done | partial | blocked
Ledger: `.sdcorejs/docs/product/<file>.md`
Product docs: `product/prds/<file>.md`, `product/user-stories/<file>.md`, `product/acceptance-criteria/<file>.md`

Next actions:
- <only real gaps>
```

## Rules

### Must Do

- Write product docs to the target project, never to the `sdcorejs-agent` repo unless it is the explicit target.
- Keep `product/` docs and `.sdcorejs/docs/product/` ledger in sync for the same feature.
- Preserve the user's language for prose.
- Keep identifiers, route paths, permission codes, and env keys in English.
- Link PRDs, user stories, specs, plans, changed files, and test outputs by path instead of pasting full file contents.
- Preserve requirement, acceptance criterion, Design, Plan, implementation,
  Test, evidence, and delivery references with stable artifact/repository
  identity and exact revisions.
- Treat requirement/implementation/test mismatch as a product gap, not just a testing gap.
- Mark inferred requirements as "inferred - needs confirmation" unless already approved.

### Must Not

- Generate app code.
- Invent acceptance criteria to make a trace look complete.
- Claim a feature is covered without current evidence.
- Hide deferred or missing tests.
- Treat stale evidence as pass.
- Overwrite an unrelated product ledger.
- Duplicate editable module requirements in a portal or cross-module view.
- Write application code, a replacement spec/plan, or Test-owned evidence.
- Update `.sdcorejs/docs/product/` without updating the matching `product/` docs when the user-facing requirement changed.

## Cross-references

- `sdcorejs-brainstorming` - confirms requirements.
- `sdcorejs-spec` - source of approved acceptance criteria.
- `sdcorejs-plan` - source of planned implementation and verification.
- `sdcorejs-design` - maps product stories and acceptance criteria to screens, wireframes, PNG previews, and FE handoff.
- `sdcorejs-test` - source of test evidence.
- `sdcorejs-ship (verify-before-done mode)` - final acceptance gate; product gaps should be resolved or deferred before done.
