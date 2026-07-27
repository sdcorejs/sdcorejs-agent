---
artifact_id: spec-contract-first-class-ai-agent-track-20260725-r1
artifact_kind: spec
change_ref: contract-first-class-ai-agent-track-20260725
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-spec
name: first-class-ai-agent-track
description: Approved architecture contract for the first-class ai-agent track and sdcorejs-ai-agent executor.
contract_id: contract-first-class-ai-agent-track-20260725
requirement_id: req-first-class-ai-agent-track-20260725
approvedAt: 2026-07-25T15:17:09+07:00
approvedBy: nghiatt15@onemount.com
approval_source: explicit-user-choice
track: workflow
target_root_kind: sdcorejs-agent-authoring-repo
stack_profile: node-general
profile_confidence: high
sourceDraftPath: .sdcorejs/docs/workflow/2026-07-25-14-56-first-class-ai-agent-track-spec.md
approved_spec_hash: 68d84bbb5324206f073ad407c34c1eaf413cf53041964e3cbb7061aa3a5cbca3
acceptance_criteria_count: 49
manual_criteria_count: 1
redaction_applied: false
supersedes: null
change_control:
  revision: 1
  supersedes: null
  change_reason: null
---

# First-class AI Agent Track - Approved Spec

> Snapshot of what the user approved at the `sdcorejs-spec` gate. Do not edit by hand; re-author through `sdcorejs-spec` if the contract changes.

## Approved contract


# Spec - First-class AI Agent Track - 2026-07-25 14:56

```yaml
spec_context:
  source: sdcorejs-spec
  contract_id: contract-first-class-ai-agent-track-20260725
  requirement_id: req-first-class-ai-agent-track-20260725
  approved_spec_path: .sdcorejs/specs/workflow/2026-07-25-15-17-first-class-ai-agent-track.md
  approved_spec_hash: 68d84bbb5324206f073ad407c34c1eaf413cf53041964e3cbb7061aa3a5cbca3
  supersedes: null
  target_root: C:/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent
  target_root_kind: sdcorejs-agent-authoring-repo
  track: workflow
  creates_track: ai-agent
  stack_profile: node-general
  profile_confidence: high
  profile_evidence:
    - package.json declares npm@10.9.2 and Node ESM repository scripts
    - skills/** and _refs/** are canonical source surfaces
    - scripts/sync-skills.mjs generates Claude, plugin, Codex, and Cursor mirrors
    - test/e2e/** is the deterministic offline repository harness
  source_requirement_context: req-first-class-ai-agent-track-20260725
  acceptance_criteria_count: 49
  manual_criteria_count: 1
  coverage_approach: tdd
  non_goals:
    - Implement an AI runtime inside this repository
    - Add an @sdcorejs/ai package or assume that future package already exists
    - Support providers other than OpenAI in this release
    - Add a universal ai-agent directory to generated target solutions
    - Add live, paid, or API-key-dependent repository tests
    - Commit, push, open a pull request, tag, publish, or release
  risks:
    - Broad routing keywords could steal ChatGPT Apps, automation, test, review, debug, or non-AI agent requests
    - Duplicated profile prose could drift from the shared security floor
    - Provider state, application sessions, approval state, traces, and audit records could be conflated
    - Generated mirror churn could obscure canonical source ownership
    - Documentation or validation evidence could overstate live runtime compatibility
  assumptions:
    - The attached implementation brief is equivalent complete input for requirement confirmation
    - The user explicitly authorizes this new skill and the ai-agent production-scope expansion only
    - The observed baseline is main at 5b6028a47ff1f9ab4efb9ae8b7ca06a27a65a352 with 23 source skills and a clean tree
    - origin/main resolves to the same baseline and package version 0.5.1 remains unchanged
    - The current package manager and root lockfile remain unchanged
    - The current official OpenAI documentation is the semantic source for OpenAI-specific engine guidance
    - Reusable skill, reference, fixture-output, and generated mirror prose remains English-only and locale-neutral
  redaction_applied: false
  approval:
    approved: true
    approved_at: 2026-07-25T15:17:09+07:00
    approval_source: explicit-user-choice
  change_control:
    revision: 1
    supersedes: null
    change_reason: null
```

## Problem & Goals

The skill pack has first-class implementation tracks for application and
evidence work, but it does not have a governed executor for building
model-powered agents. Generic Node or backend guidance does not define the
security, tool, approval, state, evidence, evaluation, and cost boundaries
required for an enterprise AI agent. Broad use of the word "agent" also makes
naive routing unsafe.

Create `ai-agent` as a first-class track with the dispatchable executor
`sdcorejs-ai-agent`. The track must turn an approved AI-agent specification and
plan into target-project changes while preserving an explicit, versioned agent
contract. It must support two OpenAI engine profiles and twelve reusable
capability profiles without implementing a runtime in this authoring
repository.

The goal is a portable, progressively disclosed contract pack that:

- separates engine mechanics from business capability;
- fails closed when trusted context, tool, approval, state, retention,
  governance, or evaluation decisions are incomplete;
- keeps authorization and tenant enforcement server-side;
- makes side effects previewable, approvable, idempotent, and concurrency-safe;
- preserves evidence, trace, audit, usage, and FinOps boundaries;
- integrates with the existing SDLC lifecycle and finish tail; and
- is protected by deterministic, offline, mutation-oriented repository tests.

## Non-goals

- Build or publish `@sdcorejs/ai`; it is only a possible future runtime owner.
- Add OpenAI SDK packages, a model client, a provider factory, or speculative
  non-OpenAI adapters to this repository.
- Generate a running example application or make a live OpenAI request.
- Treat ChatGPT Apps SDK, MCP widget construction, generic automation,
  scheduled tasks, CI runners, coding agents, browser user agents, or
  repository skill authoring as AI-agent track work.
- Flatten AI-agent behavior into the existing `stack_profile` enum.
- Make SDK guardrails, prompt refusals, or model instructions substitutes for
  server-side authorization and tenant isolation.
- Enable provider-hosted conversation storage by default.
- Persist mutable session/checkpoint manifests or raw runtime evidence in
  `.sdcorejs/**`.
- Change the package version, root dependencies, or root lockfile.
- Claim live OpenAI, Claude, Codex, Cursor, or Copilot compatibility from
  deterministic repository fixtures.

## Architecture

### Repository and runtime boundary

`sdcorejs-agent` owns authoring guidance, manifests, contracts, validators,
fixtures, routing, tests, mirrors, and public documentation. The generated
agent runtime belongs to the target project's approved package or service. It
may integrate with an existing `@sdcorejs/ai` runtime if project evidence proves
that runtime exists, use an existing project adapter, or use an approved
project-local implementation. The executor must not invent a universal target
folder or assume a future package.

The target-project agent contract is durable and versioned. The approved plan
must name its actual path. When a project lacks a code-native location, a
change-scoped `.sdcorejs/docs/ai-agent/` artifact with a contract-specific
filename is allowed
under the repository artifact lifecycle.

### Independent profile axes

The manifest exposes exactly two independent axes:

```yaml
engine_profile: openai-responses | openai-agents-sdk
capability_profile: reporting-assistant | analytics-assistant | knowledge-assistant | audit-assistant | crm-assistant | workflow-assistant | support-assistant | document-assistant | data-provisioning-assistant | tenant-operations-assistant | approval-coordinator | multi-agent-supervisor
```

`engine_profile` owns loop execution, tool-call mechanics, state continuation,
approval pause/resume, streaming, tracing integration, handoffs, and provider
state mapping. `capability_profile` owns business objectives, intents,
non-goals, tool categories, side-effect posture, evidence, policy deltas,
session deltas, and evaluation expectations. A capability may use either engine
only when its approved contract permits that combination. The executor resolves
both axes once and does not silently change them.

The common profile contract contains the security floor. Each capability file
contains meaningful business-policy deltas rather than a copied full contract,
and no profile can weaken the common floor.

### OpenAI engine profiles

`openai-responses` describes an application-owned loop using typed Responses
output, function and approved hosted/remote tools, explicit continuation and
streaming, application-owned approval suspension/resume, structured output,
bounded execution, and metadata-only tracing. Replayed history,
`previous_response_id`, and Conversations are distinct state strategies.
Provider storage defaults to disabled; a hosted Conversation requires a
separate governance decision.

`openai-agents-sdk` describes the TypeScript Agent and runner lifecycle,
function tools, structured output, reusable specialists, agents-as-tools,
handoffs, SDK sessions, resumable run state, human approval interruptions,
guardrails, tracing, and bounded orchestration. Conversation sessions and
resumable run state remain distinct. Resume uses the same root agent and session
where applicable, and serialized context/state must not contain secrets.

This split follows the current official distinction: applications own the loop
with the Responses API, while the Agents SDK owns the recurring runner loop.
Current official sources reviewed for this contract include:

- https://developers.openai.com/api/docs/guides/agents
- https://developers.openai.com/api/docs/guides/agents/define-agents
- https://developers.openai.com/api/docs/guides/agents/running-agents
- https://developers.openai.com/api/docs/guides/tools
- https://developers.openai.com/api/docs/guides/agents/guardrails-approvals
- https://developers.openai.com/api/docs/guides/agents/results
- https://developers.openai.com/api/docs/guides/agent-evals
- https://developers.openai.com/api/docs/guides/conversation-state
- https://openai.github.io/openai-agents-js/guides/agents/
- https://openai.github.io/openai-agents-js/guides/running-agents/
- https://openai.github.io/openai-agents-js/guides/tools/
- https://openai.github.io/openai-agents-js/guides/sessions/
- https://openai.github.io/openai-agents-js/guides/context/
- https://openai.github.io/openai-agents-js/guides/human-in-the-loop/
- https://openai.github.io/openai-agents-js/guides/results/
- https://openai.github.io/openai-agents-js/guides/tracing/

Hosted eval products are not the repository contract. The portable contract
defines deterministic fixtures, scenario datasets, graders, and repeatable
behavioral evaluation semantics while repository verification remains offline.

### Capability profile catalog

All twelve profiles define a version, objective, supported intents, non-goals,
read/propose/write posture, allowed categories, forbidden tools, permissions,
evidence/output rules, guardrail and approval deltas, session and tracing/audit
deltas, token/budget deltas, positive/negative/adversarial/boundary scenarios,
clarification rules, deterministic invariants, and configurable quality
thresholds.

- `reporting-assistant` is the read-only golden baseline. It uses governed
  semantic tools, versioned metric definitions, tenant-scoped filters,
  `data_as_of`, cited material values, structured output, and explicit
  partial/stale-data handling without raw SQL or invented numbers.
- `analytics-assistant` performs read-only governed analysis and separates
  observation, inference, and recommendation without unsupported causality.
- `knowledge-assistant` provides access-filtered grounded retrieval, treats
  retrieved text as untrusted data, and refuses when authoritative evidence is
  missing.
- `audit-assistant` maps immutable evidence to controls without mutating
  audited systems or fabricating compliance status.
- `crm-assistant` reads and proposes by default; governed mutations require
  identity checks, preview, permission, approval, resource version, optimistic
  concurrency, idempotency, and audit evidence.
- `workflow-assistant` enforces server-side transition policy and rejects
  unsupported state jumps or model-defined permissions.
- `support-assistant` separates drafts from external sends/status changes,
  preserves escalation rules, and redacts secrets and unrelated PII.
- `document-assistant` preserves document versions and provenance, treats
  document instructions as untrusted, and requires approval for publication,
  signing, or external transmission.
- `data-provisioning-assistant` follows clarify -> plan -> preview -> validate
  -> exact-input approval -> idempotent apply -> reconcile -> audit, and fails
  closed for unknown or production environments without approved controls.
- `tenant-operations-assistant` requires platform authorization, domain tools,
  preview/drift detection, tenant isolation, idempotency, recovery planning,
  and immutable audit evidence.
- `approval-coordinator` preserves segregation of duties, cannot self-approve
  or invent an approver, and binds decisions to exact normalized inputs,
  identity, scope, preview, version, authority, and expiry.
- `multi-agent-supervisor` uses specialists only when justified, intersects
  permissions, bounds turns/tools/handoff depth, rejects cycles, propagates
  trace context, and has a deterministic final-output owner.

### Agent, tool, trust, and approval contracts

The versioned `agent_contract` preserves the semantic fields from the approved
requirement for identity and status, objective, model policy, trusted context,
input/output schemas, data controls, tool registry, guardrails, approvals,
session policy, evidence, observability, governance, limits, reliability,
evals, and change control. Model IDs are policy-owned rather than hardcoded,
and silent model, provider, or billing-source fallback is forbidden.

Trusted `tenantId`, `actorId`, permissions, locale, correlation ID, access
scope, environment, approval authority, billing source, and provider/credential
selection originate from authenticated server or job context. Model output,
prompts, retrieved documents, model-generated tool arguments, client hidden
fields, conversation memory, and serialized provider state cannot define or
override them. Tool handlers bind and revalidate trusted context on every
boundary. Children and handoffs receive the intersection of parent and
specialist authority, never an expanded union.

Every tool declares a domain name and purpose, strict input/output schemas,
side-effect class, risk, permissions, tenant/scope binding, approval and
preview policy, evidence, timeout, retry, idempotency, resource version,
audit category, redaction, deterministic error shape, and fixture/test-double
expectations. Generic `runSql`, arbitrary query, `httpRequest`, `fetchAnyUrl`,
`updateRecord`, `executeCode`, arbitrary shell/filesystem/database mutation,
and raw token forwarding are forbidden.

Mutations resolve trusted context, validate arguments, load the current
resource version, build a preview, fingerprint approval, collect approval when
required, revalidate, execute idempotently, reconcile, and emit audit evidence.
Approval binds the tool, normalized arguments, tenant, actor, permission scope,
resource IDs and versions, preview hash, authority, and expiry. Changed inputs
invalidate approval; self-approval is forbidden.

Guardrails address input, output, tool input, tool output, prompt injection,
and redaction. Authorization and tenant denial remain independent server-side
controls. Write and external actions require approval by default unless an
approved contract proves a narrower safe policy.

### State, evidence, observability, and limits

Application session, conversation history, provider response state, SDK session
memory, resumable run state, approval checkpoint, business audit, and trace are
separate concepts. Secure defaults are:

```yaml
store_provider_state: false
provider_conversation_enabled: false
session_owner: tenant-and-actor
optimistic_concurrency: true
metadata_only_logging: true
```

Enabling provider storage requires explicit retention, deletion, residency,
sensitive-data, operational, and fallback decisions. Sessions define internal
and provider mappings, tenant/actor ownership, version/CAS, encryption where
needed, expiry/deletion, compaction, approval resume, replay/duplicate/concurrent
turn behavior, cross-device continuation, cancellation, and outages. Secrets
cannot enter serialized run state, context, history, traces, or handoffs.

Evidence-bearing output identifies authoritative source category, source and
record/document references, retrieval time, `data_as_of`, metric-definition
version, filters/scope, tenant provenance, and partial/stale status. Reporting
and analytics use governed semantic tools, distinguish zero from unavailable,
state period/currency/time-zone/aggregation assumptions, and never fabricate
evidence.

Tracing captures workflow debugging metadata. Audit captures durable business
and governance decisions. Usage/FinOps captures attributed provider/model-role
usage, versioned external price-policy estimates, quota reservation and
reconciliation, budgets, and billing source. These records are not
interchangeable. Raw prompts, raw tool payloads, secrets, PII, and chain of
thought are not logged by default. Execution has positive maximum turns and
tool calls, bounded handoff depth, timeout, cancellation, retry, idempotency,
optimistic concurrency, and compensation decisions.

### SDLC integration and runtime evidence

Brainstorming and spec capture the capability objective, engine decision or
objective selection criteria, side-effect posture, intents/non-goals, trusted
context, tenancy, data/retention, tools, approvals, evidence, state, limits,
trace/audit, usage/FinOps, evaluations, runtime owner, and non-goals. A spec
cannot be approved with critical security/data decisions deferred to
implementation.

`plan_context` gains a conditional `agent_architecture` block. Non-trivial
AI-agent work requires it. It resolves one engine, one capability, the
target-project contract path, runtime boundary, model policy, trusted context,
data controls, tools, guardrails, approvals, session strategy, evidence,
observability, FinOps, limits, reliability, evaluations, and verification.
Plan self-review rejects generic tools, missing tenant/approval controls,
unbounded loops, implicit provider storage, and missing eval gates.

`sdcorejs-execute-plan` routes approved `track: ai-agent` plans to
`sdcorejs-ai-agent` while retaining ownership of the sequential/parallel
question. The executor verifies immutable spec/plan hashes, performs
working-tree preflight, resolves profiles once, loads only the common contract,
chosen engine, chosen capability, and conditional references, fails closed on
incomplete architecture, edits only allowed target-project paths, preserves
package boundaries, emits `ai_agent_context`, passes artifact/test/verification
evidence into the finish tail, and never invokes Git.

Solution builder can assign an AI-agent role to an approved existing backend,
service, package, future runtime repository, or explicitly created project
without changing the standard solution layout by default.

`sdcorejs-test` conditionally overlays AI-agent testing without adding AI to
`stack_profile`. `sdcorejs-review` conditionally checks agent architecture.
`sdcorejs-repair-loop` preserves the approved `ai_agent_context` and returns
material architecture or policy changes to spec/plan. `sdcorejs-debug` uses the
smallest sanitized reproduction. `sdcorejs-ship` requires current
deterministic/security/eval/redaction/dependency/artifact evidence and records
external deferrals. `sdcorejs-git` may include approved contracts and fixtures
through `artifact_context` but excludes raw traces, logs, state, credentials,
approvals, and sensitive payloads.

`ai_agent_context` is runtime evidence, not a session manifest. It records
contract/spec/plan identity, target and runtime owner, both profiles, trusted
context verification, data controls, selected tools, guardrails and
authorization, approval bindings, session controls, evidence, observability,
FinOps, limits, eval status, changed files, commands, blockers/risks, and
`artifact_context`.

### Routing

Routing retains the current priority order. Explicit `sdcorejs-ai-agent` intent
selects the executor but does not bypass its approved-plan gate. Approved
`track: ai-agent` continuation routes through execute-plan. Under-specified
agent-building intent routes to brainstorming. Test/eval-only, review,
concrete-failure debug, product, design, documentation, Git, and other
dedicated intents retain their owners.

The detector requires a concrete implementation signal plus either explicit
skill/approved-plan evidence or specific OpenAI engine/capability architecture
evidence. The words `agent`, `AI`, `assistant`, `OpenAI`, `tool`, or `report`
alone are insufficient. Negative fixtures protect ChatGPT Apps, automation, CI
agents, coding agents, user agents, browser agents, skill authoring, runtime
business questions, and generic NestJS work.

### Tests, evaluation, and evidence

The evaluation contract layers schema validation, deterministic tool policy,
trusted-context/tenant isolation, mocked model/tool integration,
positive/negative/refusal/adversarial datasets, approval and side-effect
checks, session isolation/resume, evidence/citation grading, trace/tool/
guardrail grading, and repeatable behavioral runs.

Zero-tolerance invariants require no unauthorized actions, cross-tenant
disclosures, unapproved side effects, forbidden generic tools, secret leakage,
fabricated evidence, invalid accepted schemas, or missed governed approvals.
Quality thresholds remain explicit and project-configurable.

Deterministic golden fixtures cover:

1. Responses API + reporting;
2. Agents SDK + reporting;
3. Agents SDK + data provisioning; and
4. Agents SDK + multi-agent supervision.

Invalid fixtures cover model-provided identity/permissions, generic query/HTTP
tools, unapproved writes, missing idempotency/versioning, cross-tenant session
reuse, ungoverned provider storage, unlimited execution, secret-bearing traces,
invented citations, and approval fingerprint mismatch.

The validator uses only Node.js standard library, is read-only, accepts JSON,
returns a structured result, never calls OpenAI or reads secret values, and
fails invalid engine/profile/tool/trust/approval/state/eval contracts.
Mutation tests use temporary or in-memory copies and prove the suite detects
removed routing, trust, generic-tool, approval, storage, limit, tenant,
redaction, eval, and execute-plan invariants.

Repository verification is deterministic and offline. Authored datasets or
graders are not reported as executed. Live model, external environment, and
cross-runtime validation remain separately reported evidence.

## Stack profile and technology assumptions

- Artifact track: `workflow`; approved change creates first-class `ai-agent`.
- Repository stack profile: `node-general`; AI capability is a conditional
  architecture overlay, not a stack profile.
- Provider: OpenAI only.
- Engine profiles: exactly `openai-responses` and `openai-agents-sdk`.
- Runtime language guidance: TypeScript concepts where the engine reference
  needs code-level specificity, without adding runtime packages here.
- Package manager: npm 10.9.2 from `packageManager` and root
  `package-lock.json`.
- Validator and repository tests: Node.js standard library and existing test
  harness.
- No root production dependency, version bump, migration, environment
  variable, API key, paid evaluation, or live provider call is required.
- Canonical sources remain English-only; Vietnamese is allowed only as routing
  input in explicit localization fixtures.

## File structure

Create these 28 named canonical skill/reference files:

- `skills/tracks/ai-agent/sdcorejs-ai-agent.md`
- `_refs/sdlc/ai-agent.md`
- `_refs/ai-agent/manifest.json`
- `_refs/ai-agent/profile-contract.json`
- `_refs/ai-agent/{agent-contract,tool-contract,guardrails-and-approvals,sessions-and-state,evidence-and-reporting,tracing-audit-finops,evals,testing}.md`
- `_refs/ai-agent/validate-agent-contract.mjs`
- `_refs/ai-agent/engines/{openai-responses,openai-agents-sdk}.md`
- `_refs/ai-agent/profiles/common.md`
- `_refs/ai-agent/profiles/{reporting-assistant,analytics-assistant,knowledge-assistant,audit-assistant,crm-assistant,workflow-assistant,support-assistant,document-assistant,data-provisioning-assistant,tenant-operations-assistant,approval-coordinator,multi-agent-supervisor}.md`

Create these deterministic fixture and test files:

- `_refs/ai-agent/fixtures/golden/openai-responses-reporting-assistant.json`
- `_refs/ai-agent/fixtures/golden/openai-agents-sdk-reporting-assistant.json`
- `_refs/ai-agent/fixtures/golden/openai-agents-sdk-data-provisioning-assistant.json`
- `_refs/ai-agent/fixtures/golden/openai-agents-sdk-multi-agent-supervisor.json`
- `_refs/ai-agent/fixtures/invalid/agent-contract-invalid-cases.json`
- `test/e2e/ai-agent-track-contract.test.mjs`

Update canonical workflow and executor surfaces:

- `skills/orchestration/using-skills.md`
- `skills/shared/sdlc/{01-brainstorming,02-spec,03-plan,04-execute-plan}.md`
- `skills/orchestration/solution-builder.md`
- `skills/tracks/test/sdcorejs-test.md`
- `skills/shared/workflow/{review,debug,ship,git}.md`
- `skills/orchestration/repair-loop.md`

Update deterministic routing and entrypoint coverage:

- `test/e2e/support/skill-pack-runner.mjs`
- `test/e2e/fixtures/prompt-evals.json`
- `test/e2e/skill-pack-runner.test.mjs`
- `test/e2e/entrypoint-smoke.test.mjs`
- `package.json` to add the dedicated contract test to the current explicit
  `test:e2e:repository` file list; no dependency, version, or lockfile change
  is allowed.

Update source-owned entrypoints, catalog, and evidence documentation:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- `.github/chatmodes/sdcorejs.chatmode.md`
- `site/src/components/SkillCatalog.astro`
- `VALIDATION.md`
- `CHANGELOG.md`
- `docs/ADOPTION.md` for supported-track guidance.
- `docs/REAL_AGENT_VALIDATION.md` for an AI-agent routing and approval-gate
  scenario whose unexecuted external surfaces remain explicitly pending.
- `.sdcorejs/summary.md` after the architecture index becomes stale, owned only
  by the sequential/integration owner and never updated as a skill-count cache.

Regenerate, never hand-edit:

- `.claude/skills/**` and `.claude/_refs/**`
- `plugin/skills/**` and `plugin/_refs/**`
- `codex/skills/**` and `codex/skills/_refs/**`
- `.cursor/rules/sdcorejs-agent.mdc`

## Verification contract

Run focused AI-agent contract, routing, validator, golden/invalid fixture, and
mutation tests before repository-wide checks. The plan must use commands
discovered from the unchanged npm package-manager evidence and must include at
least:

```text
npm run sync:skills
npm run check:text-hygiene
npm run check:skills
npm run test:e2e:repository
npm run build:site
git diff --check
```

When supported by the current environment and scripts, also run:

```text
npm run check:skills:ps
npm run check:nestjs-pack
npm run test:e2e
npm run check:audit
npm run check:site:audit
```

After verification, inspect `git status --short`, `git diff --stat`, and
`git diff --check`, and confirm no unrelated paths changed. Do not use
`npx --yes`, require an OpenAI API key, make a paid provider call, or label
deterministic fixtures as Full E2E or live-agent evidence. Every unsupported or
unrun PowerShell, container, browser, external-runtime, provider, hosted-eval,
or real-agent tier must retain its exact skip reason.

## Acceptance criteria

- AC-001 - Exactly one canonical `sdcorejs-ai-agent` skill exists, validates under current frontmatter rules, and raises the observed source skill count from 23 to 24.
- AC-002 - `ai-agent` appears as a first-class implementation track in workflow routing, entrypoints, public catalog, and relevant inventories.
- AC-003 - The skill pack/runtime boundary is explicit: this repository authors contracts and guidance, while target-project code owns runtime implementation.
- AC-004 - The manifest exposes exactly `openai-responses` and `openai-agents-sdk`, with no speculative provider or combined engine/capability enum.
- AC-005 - Engine and capability are independent axes, resolved exactly once and preserved unchanged through plan, execution, repair, and finish evidence.
- AC-006 - The Responses profile documents application-owned loops, typed tool continuation, streaming, distinct continuation strategies, explicit tool choice where needed, structured output, approval resume, bounded execution, and metadata-only tracing.
- AC-007 - The Agents SDK profile documents Agent/runner/tools, sessions, resumable run state, approval interruption/resume, trusted context injection, handoffs/agents-as-tools, tracing, bounded execution, and secret-safe serialization.
- AC-008 - Both engines default provider state storage and provider Conversations to disabled unless an explicit approved governance decision covers retention, deletion, residency, sensitive data, purpose, and fallback.
- AC-009 - All twelve required capability profiles exist uniquely and contain the required semantic delta fields without duplicating the full common contract.
- AC-010 - No capability profile weakens the shared trust, tenancy, authorization, tool, approval, logging, storage, or zero-tolerance security floor.
- AC-011 - Reporting is a read-only golden baseline with governed semantic tools, evidence, metric version, filters/time zone, `data_as_of`, structured output, partial/stale handling, and no invented values or raw SQL.
- AC-012 - Reporting golden contracts validate for both engine profiles without changing the capability semantics.
- AC-013 - Data provisioning has a governed golden contract covering environment, preview, exact approval, idempotency, version checks, reconciliation, audit, and unapproved-apply rejection.
- AC-014 - Multi-agent supervision has a governed golden contract covering justified specialists, permission intersection, trace propagation, bounded delegation, deterministic final ownership, and cycle rejection.
- AC-015 - The durable `agent_contract` preserves every approved semantic group: identity/status, objective, model policy, trust, input/output, data, tools, guardrails, approvals, session, evidence, observability, governance, limits, reliability, evals, and change control.
- AC-016 - Model IDs are project-policy-owned, hardcoded IDs are rejected where the contract forbids them, and silent model/provider/billing fallback is forbidden.
- AC-017 - Trusted identity, tenant, permissions, locale, correlation, access scope, environment, approval authority, billing source, and credentials originate only from authenticated server/job context.
- AC-018 - Every tool boundary revalidates authorization and tenant scope; retrieval, sessions, caches, traces, citations, fixtures, children, and handoffs cannot cross or expand tenant authority.
- AC-019 - Every tool defines strict schemas, side effect, risk, permission/scope, approval/preview, evidence, timeout/retry, idempotency/versioning, audit/redaction, deterministic errors, and fixtures.
- AC-020 - Generic raw query, HTTP, record-update, code, shell, filesystem, database mutation, and token-forwarding tools are rejected; domain-scoped tools are required.
- AC-021 - Mutations enforce preview, exact-input fingerprint approval, expiry, resource version, revalidation, idempotency, optimistic concurrency, reconciliation, and audit; self-approval is rejected.
- AC-022 - Input/output/tool guardrails and prompt-injection/redaction policies are present but never substitute for server authorization or tenant denial.
- AC-023 - Application session, conversation history, provider response state, SDK session, resumable run state, approval checkpoint, audit, and trace remain distinct.
- AC-024 - Sessions bind tenant and actor, use version/CAS concurrency, define retention/deletion/compaction/resume/replay/duplicate/concurrent/cancellation/outage behavior, and reject cross-tenant reuse.
- AC-025 - Secrets are forbidden in serialized run state, SDK context, history, handoffs, traces, fixtures, and repository evidence.
- AC-026 - Evidence-bearing output includes authoritative provenance, source/record reference, retrieval time, `data_as_of`, semantic version, filters/scope, tenant provenance, and partial/stale indicators.
- AC-027 - Reporting and analytics enforce governed semantics, distinguish zero from unavailable, disclose material calculation assumptions, and reject unsafe or missing authoritative evidence.
- AC-028 - Tracing, durable business audit, and usage/FinOps are separate contracts with metadata-only logging, versioned pricing policy references, quotas/budgets, attribution, reconciliation, and no raw chain-of-thought persistence.
- AC-029 - Every contract has positive maximum turns/tool calls, bounded handoff depth, timeout, cancellation, retry, idempotency/concurrency, and compensation decisions as applicable.
- AC-030 - The validator is read-only, Node-standard-library-only, JSON-driven, structured in output, secret-blind, provider-offline, and rejects invalid trust/tool/approval/storage/limit/tenant/eval contracts.
- AC-031 - Golden fixtures A-D pass deterministic validation, and the invalid fixture catalog rejects every required invalid scenario with deterministic error evidence.
- AC-032 - Spec guidance captures all critical AI-agent architecture fields and cannot approve critical security, data, approval, or retention decisions as implementation-time choices.
- AC-033 - `plan_context.agent_architecture` is conditionally required, resolves one engine and capability, names the target contract/runtime boundary, and carries complete trust/data/tool/approval/state/evidence/observability/FinOps/limits/reliability/eval/verification decisions.
- AC-034 - Plan self-review fails generic tools, missing tenant context or approvals, implicit provider storage, unbounded execution, missing eval gates, or unapproved dependency/package changes.
- AC-035 - Execute-plan routes approved `track: ai-agent` work to `sdcorejs-ai-agent`, retains the mode question, preserves profiles and write/package scope, and blocks incomplete architecture.
- AC-036 - The AI executor verifies approved hashes and working tree, loads only progressive-disclosure references, edits only approved target paths, emits `ai_agent_context`, passes finish evidence, and never invokes Git.
- AC-037 - Solution builder assigns AI runtime to an approved owner without introducing a universal top-level `ai-agent/` solution directory.
- AC-038 - Test conditionally consumes AI context, separates authored from executed evals and deterministic from live evaluation, and tests server denial, approvals, sessions, redaction, tenancy, lifecycle, and bounds without an API key.
- AC-039 - Review, repair, debug, ship, and Git conditionally consume or preserve AI context, prevent silent architecture/policy weakening, sanitize evidence, enforce current gates/deferrals, and exclude sensitive runtime artifacts.
- AC-040 - Routing positives select explicit or approved-plan AI implementation; under-specified AI building selects brainstorming; test, review, debug, ChatGPT Apps, automation, CI/coding/browser/user agents, skill authoring, runtime report requests, and generic NestJS retain their correct owner.
- AC-041 - The routing detector is narrow and does not dispatch from `agent`, `AI`, `assistant`, `OpenAI`, `tool`, or `report` alone; localized explicit/approved-plan fixtures preserve English expected outputs.
- AC-042 - Dedicated contract tests cover skill uniqueness/count, registries, paths, profile deltas, executor/validator/security/state/eval/downstream invariants, and use temporary or in-memory mutation copies.
- AC-043 - Mutation tests fail when AI routing, trusted context, generic-tool prohibition, exact approval binding, storage default, limits, tenant sessions, trace redaction, deterministic evals, or execute-plan dispatch are weakened.
- AC-044 - `npm run sync:skills` produces valid Claude, plugin, Codex, ref, and Cursor mirrors; no generated mirror is hand-edited and all observed inventories increase from 23 to 24.
- AC-045 - README, entrypoints, catalog, validation, changelog, and relevant adoption/real-agent documents describe the track boundary, two axes, profiles, trust/tools/approval/state/evidence/observability/evals, and routing boundaries honestly.
- AC-046 - Reusable sources, fixtures, tests, docs, and mirrors remain English-only and locale-neutral, with no secret, real customer payload, provider dump, raw trace, real run state, approval token, or chain of thought.
- AC-047 - Package version, root dependencies, package manager, and root lockfile remain unchanged; unexpected package or lock changes stop execution and are reported.
- AC-048 - Focused AI contract/routing/validator/mutation tests run before repository checks, followed by supported sync, hygiene, skill, repository E2E, site, PowerShell, aggregate E2E, audit, and diff checks with exact pass/fail/skip evidence and no live claims.
- AC-049 - No mutable session/checkpoint artifact, commit, push, pull request, tag, publish, or release is created; unrelated user changes remain untouched and starting/final branch and HEAD plus final status/diff evidence are reported.

## Risks & mitigations

- **Risk:** Broad implementation detection steals unrelated requests. ->
  **Mitigation:** Require explicit skill, approved-plan continuation, or a
  confirmed implementation contract plus narrow engine/capability evidence;
  protect every negative boundary with deterministic fixtures.
- **Risk:** Twelve profiles become duplicated policy documents. ->
  **Mitigation:** Put invariant security behavior in `common.md` and
  `profile-contract.json`; validate that each profile contains required,
  meaningful deltas without copied full contracts.
- **Risk:** Application memory, provider state, approval resume, traces, and
  audit are conflated. -> **Mitigation:** Define separate schemas, defaults,
  owners, retention rules, and evidence fields; mutation-test cross-tenant and
  storage regressions.
- **Risk:** Guardrails are treated as authorization. -> **Mitigation:** Require
  independent server denial at every tool boundary and test denial separately
  from prompt refusal.
- **Risk:** Approval becomes stale after inputs or resources change. ->
  **Mitigation:** Bind approval to normalized inputs, identity/scope, preview
  hash, resource version, authority, and expiry; revalidate immediately before
  idempotent execution.
- **Risk:** Official SDK/API details drift. -> **Mitigation:** Keep reusable
  contracts semantic and version-neutral, link current official sources, keep
  engine-specific mechanics isolated, and avoid hardcoded SDK dependencies.
- **Risk:** Hosted evaluation product changes break the skill pack. ->
  **Mitigation:** Define portable deterministic fixtures, datasets, graders,
  and evidence statuses; treat hosted/live execution as an external evidence
  tier.
- **Risk:** Mirror generation hides a canonical defect. -> **Mitigation:** Edit
  source-owned files only, test canonical contracts first, generate once
  stable, then validate and inspect all mirror classes.
- **Risk:** Validation language overstates compatibility. -> **Mitigation:**
  Separate authored, deterministic, behavioral, live-provider, and
  cross-runtime evidence; mark unrun tiers explicitly.

## Out of scope (deferred)

- Implementing, publishing, or choosing the eventual API of `@sdcorejs/ai`.
- Additional providers or provider-abstraction factories.
- Live OpenAI calls, paid hosted evaluations, or API-key setup.
- Real-agent transcript execution on Claude Code, Codex, Cursor, or Copilot
  surfaces unavailable in this session.
- A generated application or target-runtime demonstration.
- Production SDLC expansion outside the already approved AI-agent track scope.
- Dependency upgrades, package versioning, release publication, and Git
  artifact handoff.

## Decisions captured during review

- (approved as drafted)

## Skill provenance

sdcorejs-spec (approved on attempt 1 / 3)
