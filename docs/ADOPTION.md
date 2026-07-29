# Adoption Guide

Use this guide when deciding whether to install or enforce `sdcorejs-agent` in a
team repository.

## When To Use This

This pack fits teams that want governed AI-assisted development with explicit
requirements, spec, plan, execution, verification, review, and release gates.
It is strongest when the target project uses one of the supported tracks:

- Angular portals using `@sdcorejs/angular`.
- NestJS + Postgres backends.
- Next.js public sites.
- Governed AI-agent application contracts/integration with one approved engine
  profile and one approved business capability profile.
- Product, design, and test-track evidence.
- Generic plans where a strict approval and verification harness is useful.

## When Not To Use This

Do not use the full workflow when:

- The task is pure Q&A with no file edits.
- The target repo is untrusted and has not been sandboxed.
- A team wants casual autocomplete-style suggestions instead of governed SDLC.
- The requested work is production SDLC expansion that has not been explicitly
  approved, such as CI/CD rollout, IaC, observability, SRE, compliance, incident
  response, or release governance.
- A target stack has stronger local project rules that conflict with this pack.

For unsupported stacks, use the generic harness only after the scope and
verification commands are explicit.

Do not adopt the AI-agent track as a turnkey hosted runtime. It ships
provider-portable contracts, two lifecycle profiles, twelve independent
capability profiles, an offline validator, deterministic fixtures, and SDLC
gates. The consuming application owns dependencies, credentials, runtime
deployment, trusted identity/tenant context, tools, data/state, and any
separately authorized live compatibility or behavioral verification.

## Behavior-Preserving Simplification

Use `sdcorejs-simplify` as a workflow utility, not a track, when the request
names recently changed executable source or an explicit file/function/path and
requires clarity or maintainability without behavior changes.

- `analyze-current-diff` and `analyze-explicit-scope` are read-only.
- `apply-current-diff` and `apply-explicit-scope` require a current green
  focused baseline and rerun the same commands afterward.
- Broad repository/architecture/public-contract refactors return to the normal
  brainstorming -> spec -> plan flow.
- Bugs, review findings, tests, documentation/prompts, performance, and
  dependency work retain their dedicated owners.
- Documentation, prompts, configuration, protected strings, tests/fixtures/
  snapshots, public contracts, dependencies, and framework or AI-agent
  contracts are excluded from direct simplification.
- The finish gate presents simplification as an opt-in choice after the test
  baseline; it never runs silently.

Focused tests provide coverage evidence, not proof that arbitrary
transformations are semantically identical. Record limited or unavailable
behavior verification explicitly.

## Fast-Fix Path

The fast-fix path exists for low-risk, one-topic changes. It reduces ceremony
without removing evidence discipline.

Allowed when all are true:

- The user explicitly asks for a small direct fix.
- The behavior and acceptance criteria are already explicit.
- The change is narrow, low risk, and has bounded owned paths.
- No new architecture, workflow, skill, or production SDLC surface is created.
- The agent can run targeted verification before reporting the result.

Required steps:

1. Run the project-context preflight if prior decisions may matter.
2. State the narrow task and the verification command.
3. Make the smallest scoped edit.
4. Run targeted verification and disclose any skipped broader checks.
5. Escalate to the full brainstorming -> spec -> plan flow if scope grows.

Fast-fix is not a bypass for security, destructive commands, hidden Unicode
hygiene, mojibake, or verification-before-done.

Pure Q&A does not enter fast-fix or the full SDLC: answer it directly. Security,
architecture, concurrency, flaky/root-cause, public-contract, ambiguous, or
cross-cutting work always uses the governed workflow. If a fast-fix discovers
one of those conditions, stop and escalate.

For approved plans, one executable unit or unavailable/unsafe parallel
capability auto-selects sequential execution. Ask sequential versus parallel
only when at least two independent units make both choices real.

## Communication Economy Policy

The Communication Economy Policy reduces total communication cost by selecting
only related context, keeping runtime state separate from user-facing prose,
and avoiding repeated summaries. `compact` is the default for direct answers,
routine progress, successful fast-fix, verification, and handoff. It still uses
complete professional sentences. Use `standard` for normal explanations,
trade-offs, review findings, or partially skipped verification.

The resolver automatically selects `detailed` for spec or plan approval,
security warnings, destructive actions, ambiguous or high-impact decisions,
order-sensitive instructions, migrations or public-contract decisions,
verification failure, conflicting evidence, and unresolved blockers. These
clarity rules override a request for shorter output when consequence or approval
scope would otherwise become unclear.

Adopters can ask for `compact`, `standard`, `detailed`, or `full context`.
`full context` is an explicit diagnostic projection; it does not change the
authoritative state or workflow result. The profiles change explanation depth,
not decision, status, evidence, or acceptance outcome.

Do not force compact style onto approved specs, approved plans, architecture
documents, user guides, PR descriptions, release notes, security documents,
durable handoffs, test plans, or traceability artifacts. Those artifacts keep
their canonical templates and complete prose.

## Documentation Layout v2

SDCoreJS writes each project document as a documentation unit:

```text
.sdcorejs/documentation/user-guides/<module>/<module>.md
.sdcorejs/documentation/user-guides/<module>/images/<screen>.png
.sdcorejs/documentation/requirements/<TASKID>/<TASKID>.md
.sdcorejs/documentation/technical-docs/<doc-key>/<doc-key>.md
```

Existing flat entries remain readable during the transition. An update probes
the canonical exact path first and the legacy flat path second; it never creates
a duplicate merely because the legacy entry exists. Migration is an explicit
public-contract decision with a complete collision, ownership, containment,
reference-rewrite, and hash preflight. Authorization is scoped to exact
documentation units; approving one guide never migrates unrelated legacy
requirements or technical documents. Conflicting copies and orphan assets are
reported instead of guessed or overwritten.

All provider surfaces consume the same generated canonical contract. Layout v2
does not add an adapter capability or change `context.pass`; unsupported or
unknown runtime-context channels still carry bounded paths, hashes, lifecycle
state, blockers, and the exact consumer through the portable fallback.

## Portable Interaction And Delegation

Canonical skills request semantic actions rather than vendor tool names.
`_refs/harness/capability-contract.json` declares each adapter capability as
`supported`, `unsupported`, or `unknown`; unknown uses the portable fallback.

Choice priority is supported native structured interaction, a typed visual
surface for visual decisions, the static visual composer when only HTML is
available, then numbered Markdown. The written main-conversation response is
authoritative, and visual selection never approves implementation.

The provider-neutral `context.pass` action uses the tri-state
`runtime_context_channel` capability. A `supported` host may pass full typed
authoritative runtime context without echoing it to the user. `unsupported` and
`unknown` use a portable handoff with consumer-required fields, IDs, paths,
hashes, freshness, evidence references, artifact closure, blockers, and the
exact next consumer/action. Missing authoritative fields fail closed; model
conversation memory alone is not evidence of a supported channel. Field shape,
approved artifact identity, independent test status/evidence, parallel
ownership/fan-in state, and nested artifact-body exclusion are validated before
the fallback can be emitted.

Delegation uses the roles `explorer`, `test_writer`, `docs_writer`, `reviewer`,
and `implementation_worker` plus semantic tiers `fast`, `balanced`, and `deep`.
Fast workers may handle only bounded docs or confirmed test scaffolding with an
already-selected layer and disjoint owned paths. They do not decide behavior.
Security, architecture, concurrency, flaky/root-cause, integration, and
public-contract work stays balanced/deep. If model override is unavailable,
workers inherit the parent model.

## Compatibility Matrix

Record exact tool versions in release notes when validating an adopted release.
This matrix tracks supported surfaces and the evidence expected for each.

| Tool surface | Reads from | Repository validation | Release evidence to capture |
|---|---|---|---|
| Claude Code plugin | `plugin/skills/**`, `plugin/_refs/**`, `plugin/sdcorejs-harness.json` | `npm run check:skills` verifies generated mirrors, derived tool allowlists, capabilities, and hashes. | Plugin dispatch plus native-choice/Markdown fallback evidence. |
| Claude Code direct repo | `CLAUDE.md`, `.claude/skills/**`, `.claude/_refs/**`, `.claude/sdcorejs-harness.json` | Mirror sync plus entrypoint and behavioral sentinel tests. | Direct session showing entry-gate, approval, and fallback behavior. |
| Codex attached/native | `AGENTS.md`, `codex/skills/**`, `codex/sdcorejs-harness.json` | Entrypoint, mirror, and behavioral sentinel tests. | Codex session transcript with model/harness/source commit recorded. |
| Cursor | `AGENTS.md`, `.cursor/rules/sdcorejs-agent.mdc`, `.cursor/sdcorejs-harness.json` | Generated rule/manifest drift checks and entrypoint tests. | Cursor session showing Markdown fallback and governed execution. |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/chatmodes/sdcorejs.chatmode.md`, `.github/sdcorejs-harness.json` | Manifest and entrypoint/behavioral checks. | Copilot transcript for direct Q&A, fast-fix, and one governed task. |
| Shared Documentation Layout v2 | Canonical `_refs/shared/documentation-layout.*` through each generated ref mirror | `npm run test:e2e:documentation-layout` plus `npm run check:skills`; no provider capability or action changes. | One canonical nested write and, when legacy data exists, the authorized migration/conflict result with path/hash evidence. |

## Adoption Checklist

- Choose install mode: plugin, direct repo, submodule, or copied native skills.
- Run `npm ci`, `npm run check:text-hygiene`, `npm run check:skills`, and
  `npm run test:e2e` at the source commit.
- Read `SECURITY.md` and decide whether the team needs safe mode.
- Link `docs/TROUBLESHOOTING.md` from team onboarding docs.
- Pin a Git tag or GitHub release instead of a floating branch.
- Capture real-agent transcript evidence for every tool surface claimed by the
  release. For full coverage, validate Claude Code, Codex, Cursor, and GitHub
  Copilot.
- For AI-agent adoption, confirm provider storage defaults off, generic raw
  tools are absent, mutation approval/state/evidence/tracing/limits are
  application-owned, and offline results are not presented as live evidence.
- For simplification adoption, confirm the current-diff/explicit-scope boundary,
  protected content, green baseline, post-change evidence, and
  `simplify_context` freshness are enforced.
