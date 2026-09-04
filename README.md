# SDCoreJS

[![CI](https://github.com/sdcorejs/sdcorejs-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/sdcorejs/sdcorejs-agent/actions/workflows/ci.yml)
[![Full E2E](https://github.com/sdcorejs/sdcorejs-agent/actions/workflows/full-e2e.yml/badge.svg)](https://github.com/sdcorejs/sdcorejs-agent/actions/workflows/full-e2e.yml)

An engineering-focused SDLC skill pack for developers and technical teams
using AI coding agents. Works in Claude Code, GitHub Copilot, Codex, and
Cursor.

Requests flow through:

```text
brainstorming -> spec -> architecture when required -> plan -> execute-plan -> executor -> convergence -> branch-ready -> git
```

The pack is documentation-driven: markdown skills plus `_refs/` knowledge. There is no runtime server.

## Tracks

| Track | Executor |
|---|---|
| Angular Portal | `sdcorejs-angular` |
| NestJS | `sdcorejs-nestjs` |
| Next.js | `sdcorejs-nextjs` |
| AI-agent | `sdcorejs-ai-agent` |
| Product | `sdcorejs-product` |
| Design | `sdcorejs-design` |
| Test | `sdcorejs-test` |
| Generic harness | `sdcorejs-execute-plan` fallback |

## Workflow

```text
Request
  -> sdcorejs-brainstorming
       Explore if needed, then confirm blockers.
  -> sdcorejs-spec
       Write spec, ask for approval, and persist approved spec.
  -> sdcorejs-architecture (conditional)
       Approve architecture only for architecture-significant scope.
  -> sdcorejs-plan
       Write numbered plan, ask for approval, and persist approved plan.
  -> sdcorejs-execute-plan
       Detect track; compile execution opportunities from the approved plan.
  -> sdcorejs-subagent-driven-development (when delegation is available)
       Run fresh workers in dependency waves with bounded concurrency.
  -> executor
       ai-agent | angular | nestjs | nextjs | product | design | test | generic harness
  -> finish gate and tail chain
       sdcorejs-test -> optional sdcorejs-simplify -> affected focused tests
       -> sdcorejs-review / repair-loop, including verified external feedback
       write-producing docs/task/memory artifacts first
       -> sdcorejs-ship (validation-map and convergence verification)
       -> sdcorejs-ship (branch-ready mode as the final read-only gate)
```

The two approval gates and approved snapshot writes live inside `sdcorejs-spec`
and `sdcorejs-plan`. `sdcorejs-execute-plan` owns track detection,
AI-agent/product/design/test routing, generic fallback, and execution-policy
resolution. `sdcorejs-subagent-driven-development` owns the delegated lifecycle;
`sdcorejs-parallel-dispatch` remains its low-level scheduler. The runtime first
attests delegation, concurrency, cancellation, result-reference, and workspace
isolation capabilities, then selects parallel fresh workers, sequential fresh
workers, or parent execution without treating static adapter metadata as proof.
No write-producing step may run after final branch-ready unless branch-ready is
run again before Git artifacts.

## Governance Contracts

- Decision coverage preserves current assumptions, decisions, requirements,
  acceptance criteria, and invariants as stable `A-*`, `D-*`, `R-*`, `AC-*`,
  and `INV-*` identities. Goal-backward checking rejects plans that omit the
  task, path, or evidence needed to prove an approved outcome.
- `sdcorejs-architecture` remains a conditional gate, not mandatory ceremony.
  Cross-repository ownership, public contracts, security boundaries, and other
  architecture-significant work require an approved architecture artifact; a
  small cohesive change records a concrete not-applicable reason.
- `sdcorejs-subagent-driven-development` is the twenty-third public skill. It
  turns an approved plan into dependency-aware worker waves, while preserving
  `sdcorejs-parallel-dispatch` as the reusable low-level scheduling contract.
- `plan_context.validation_map` is the planning authority. Test preserves its
  exact coverage projection, appends actual runs/cases, and emits only current
  approved evidence IDs. A green but unrelated command cannot satisfy an AC.
- The convergence evaluator joins approved intent/artifacts to executed
  task-path-symbol trace, current test/review evidence, architecture and
  convention conformance, required ledgers, source/module identity, and artifact
  closure. Verify-before-done evaluates it; branch-ready and Git recheck the
  compact result plus its hash-verified receipt against approved change/mode
  and current state. Git derives identity from repositories and approved plans.
- Conventions remain an `sdcorejs-explore` action lifecycle, not a public
  `sdcorejs-conventions` skill. Observed patterns are advisory; only a separately
  authorized conventions-sync action persists accepted rules.
- External review feedback is handled inside `sdcorejs-repair-loop`: it is
  re-read, technically verified, classified, and either repaired within explicit
  tiered authority or answered with revision/path/hash-bound pushback. Writes
  stay inside intersected scopes and carry pre/post hashes plus test-integrity
  proof. Unclear/conflicting feedback and unapproved API migrations do not write.
- Internal `sdcorejs-skill-authoring` lives under `authoring/**` and is excluded
  from public inventories, mirrors, manifests, and the site. The public ceiling
  remains 23 skills. Its gate derives inventory/routing hashes from the repo and
  validates linked RED/GREEN/REFACTOR records and complete live-matrix schemas.
- Deterministic contract tests, prepared-environment Full E2E, and authorized
  live-agent evidence are separate layers. A deterministic pass never implies a
  Full E2E or live-agent pass, and unavailable live validation is `NOT RUN`.

Pure Q&A answers directly. Small, explicit, low-risk fixes use targeted context,
the smallest edit, focused verification, and concise review; they escalate to
the full workflow if scope, risk, ownership, or behavior grows.

Canonical skills declare provider-neutral `required-actions`.
`_refs/harness/capability-contract.json` maps those actions and tri-state
capabilities for Codex, Claude Code, Cursor, and Copilot. Unsupported or unknown
capabilities retain numbered Markdown, static visual, and sequential parent
fallbacks.

## Communication Economy Policy

The Communication Economy Policy improves visible-output and portable-handoff
efficiency through just-in-time context and fewer repeated blocks. Current
evidence does not establish broad token or cost reduction. The policy does not
optimize output length in isolation or turn responses into fragments. Compact
output remains localized, grammatical, and written in complete professional
sentences.

Runtime communication has three distinct layers:

- Authoritative runtime context retains the typed fields required by the next
  consumer for routing, approval, security, verification, and artifact closure.
- User projection reports only the outcome, material evidence, risk, blocker,
  and next decision that the user needs.
- Portable handoff carries required IDs, paths, hashes, state deltas, evidence
  references, and the exact next consumer when a structured runtime context
  channel is unsupported or unknown. Its shape-aware matrix also preserves
  independent test lifecycle/evidence and parallel ownership/fan-in state, and
  rejects missing approval identity or embedded spec/plan/diff/log bodies.

The default profile is `compact`; normal technical explanation and review
findings use `standard`; approval, security, destructive action, ambiguity,
order-sensitive work, public-contract decisions, failed verification, and
unresolved blockers automatically use `detailed`. A user may request `compact`,
`standard`, `detailed`, or `full context`, but a shorter request cannot obscure
an approval scope or safety consequence. Code, commands, paths, identifiers,
hashes, errors, numbers, and verification results remain exact.

Detailed policy is loaded just in time from
`_refs/harness/communication-economy.md`. This is a communication contract, not
a workflow gate or a new `sdcorejs-caveman` skill.

## Visual Companion

Spatial decisions during brainstorming may run on a local, authenticated
browser surface instead of a picker. Visual and non-visual decisions use
separate priority ladders, so a genuinely spatial question is no longer
shadowed by a native structured choice. Approvals never reach a visual surface.

Surfaces, best first: the live companion runtime, a typed native visual
surface, the standalone static composer, then numbered Markdown. All four share
one screen model and always carry the same numbered Markdown fallback.

The live runtime is `_refs/sdlc/visual-companion/`: a zero-dependency Node
server on a loopback origin with an RFC 6455 event channel, a browser client
pinned by CSP hash, server-owned screen revisions that make stale-click
rejection possible, and a bounded event log. Drive it through
`_refs/sdlc/visual-companion/cli.mjs`, which prints one JSON object per command
and exits non-zero on failure.

The Node.js `18.20.8` compatibility exception is limited to the standalone Visual Companion built-ins-only tests. Run the evidence command directly
without `npm ci` or a root dependency install:

```bash
node --test test/e2e/visual-companion-runtime.test.mjs test/e2e/static-visual-composer.test.mjs
```

This exception does not extend the supported root toolchain.

Two independent gates: `live_visual_companion` plus `persistent_local_process`
must be `supported`, and the user must consent to local runtime writes.
Auto-opening a browser is a third, separate consent. Session state lives under
the execution host's `.sdcorejs/tmp/visual-companion/`, which is `local_only`:
never staged, never committed, never read back as project context. Every
browser event is stamped `authority: supporting-feedback` by the server and
asserted on read, so a click can never carry workflow approval.

Contract: `_refs/sdlc/visual-companion.md`. Security model and attribution:
`_refs/sdlc/visual-companion/README.md`.

## Documentation Layout v2

Project documentation below `.sdcorejs/documentation/` uses one directory per
document:

```text
user-guides/<module>/<module>.md
user-guides/<module>/images/<screen>.png
requirements/<TASKID>/<TASKID>.md
technical-docs/<doc-key>/<doc-key>.md
```

Unit-local links stay concise, for example `images/list.png`. `_shared` is used
only when at least two exact documentation units are proven owners. New writes
always use v2; canonical-first discovery can read transitional flat entries,
but migration requires an authorized, collision-free, idempotent preflight.
Canonical/legacy conflicts block migration, aggregate build, and export.

The aggregate remains `.sdcorejs/documentation/sdcorejs-user-guide.md`. Its
builder discovers exact entry shapes, rewrites unit-local links relative to the
documentation root, and validates emitted links. DOCX and PDF are separate
approved capabilities; neither is reported as passing without a non-empty
parseable output and embedded-image verification. The full contract and pure
deterministic helper are loaded just in time from
`_refs/shared/documentation-layout.md` and
`_refs/shared/documentation-layout.mjs`, so unrelated Q&A bootstrap does not
grow.

In a multi-repository system, each module repository owns its module guides,
requirements, technical docs, and assets. The portal owns only
portal/integration docs and generated aggregates. An aggregate links pinned
module sources or consumes versioned exports with repository/revision/hash
provenance; it is not a second editable source of module documentation.

## Product And Design Artifact Layout

Product and Design artifacts live under the target repository's `.sdcorejs/`
directory:

```text
.sdcorejs/product/prds/<feature>.md
.sdcorejs/product/user-stories/<feature>.md
.sdcorejs/product/acceptance-criteria/<feature>.md
.sdcorejs/product/uat-checklists/<feature>.md
.sdcorejs/product/decisions/<feature>.md
.sdcorejs/docs/product/<feature>.md

.sdcorejs/design/flows/<feature>.md
.sdcorejs/design/specs/<feature>.md
.sdcorejs/design/decisions/<feature>.md
.sdcorejs/design/wireframes/<feature>/<screen>.html
.sdcorejs/design/wireframes/<feature>/<screen>.svg
.sdcorejs/design/exports/png/<feature>/<screen>.png
.sdcorejs/design/references/<feature>/<screen>.png
.sdcorejs/docs/design/<feature>.md
```

Canonical roots are declared once as `artifact_roots` in
`_refs/shared/system-registry.json` and resolved through
`_refs/shared/artifact-paths.mjs`. Root-level `product/**` and `design/**` are
legacy read-only compatibility inputs for older target projects: canonical
locations always win on read, a legacy path is read only when no canonical
equivalent exists, updating a legacy-only artifact migrates that feature bundle
to the canonical location in the same approved change, and a conflicting
canonical/legacy pair blocks instead of merging. No skill creates or updates a
root-level Product or Design path.

Durable Design PNG exports and screenshot references participate in Git artifact
closure as binary artifacts. Discovery hashes them, never parses them as
Markdown, never text-scans them for secrets, and never prints their bytes.

The AI-agent track is an approved-plan-only authoring surface, not a bundled
agent runtime. It selects one lifecycle engine (`openai-responses` or
`openai-agents-sdk`) independently from one of twelve business capability
profiles. Its contracts default provider storage off, prohibit generic raw
tools, require trusted server identity and tenant scope, bind approvals to exact
inputs/versions, separate application state, require evidence and redacted
tracing/audit/usage data, and run offline deterministic evals. Live engine/model
verification is always reported separately.

`sdcorejs-simplify` is a daily workflow utility, not an implementation track.
It analyzes or applies bounded refinements to recently changed executable
source or an explicit source scope while preserving observable behavior.
Apply mode requires a green focused baseline and reruns the same verification;
analyze mode is read-only. Prompts, docs, configuration, strings, tests,
fixtures, snapshots, public contracts, dependencies, and framework/AI-agent
contracts are protected. The finish gate presents simplification as a visible
opt-in step; it never auto-runs, and current tests are evidence rather than a
general semantic-equivalence proof.

## Quick Start

This repository is public source, while the root repository tooling manifest
describes a private root Node workspace with `private: true`. The root project
is not distributed through npm. Use GitHub/plugin installation, submodules, or
generated native skill mirrors as the distribution paths.

The root `name` and `version` are synchronized repository/plugin release
metadata, not an npm package identity. The canonical package manager for
repository validation remains npm. Use the committed `package-lock.json` with:

- Root repository tooling requires Node.js `^22.22.3 || ^24.15.0 || >=26.0.0`.
- The Astro showcase under `site/` requires Node.js `>=22.12.0`.

```bash
npm ci
npm run check:text-hygiene
npm run check:skills
npm run test:e2e
```

## 5-Minute Adoption

Pick one install path, start a fresh agent session, then use the smoke prompt to
confirm dispatch behavior before adopting the pack for real work.

| Tool path | Install or attach | Smoke prompt | Expected observation |
|---|---|---|---|
| Claude Code plugin | Install from the plugin marketplace. | `Use sdcorejs-explore to summarize this repo's validation posture.` | The explore skill loads in read-only summary mode, creates a tasklist for non-trivial work, and reports verification status. |
| Codex attached repo | Add this repo as a submodule or keep `AGENTS.md` at the target root. | `Use the SDCoreJS flow to plan a small docs update.` | `AGENTS.md` routes to brainstorming/spec/plan discipline instead of writing immediately. |
| Codex native skills | Copy `codex/skills/**` plus `codex/skills/_refs/**` into `$CODEX_HOME/skills`. | `Use sdcorejs-documentation to write a short technical doc.` | The skill resolves `../_refs/...` and follows tasklist/verification rules. |
| Cursor | Use `AGENTS.md` plus `.cursor/rules/**`. | `Create acceptance criteria for a small feature using SDCoreJS.` | Product/design/test/doc routing selects the matching workflow. |
| GitHub Copilot | Use `.github/copilot-instructions.md` or `.github/chatmodes/**`. | `Create acceptance criteria for a small feature using SDCoreJS.` | Product/design/test/doc routing selects the matching workflow. |

For release adoption, pin a Git tag or GitHub Release rather than a floating
branch, then record the exact tool versions and transcript evidence.

### Claude Code Plugin

```text
/plugin marketplace add sdcorejs/sdcorejs-agent
/plugin install sdcorejs-agent@sdcorejs
```

### Codex Native Skills

```powershell
npm run sync:skills
$dest = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME "skills" } else { Join-Path $HOME ".codex\skills" }
New-Item -ItemType Directory -Force $dest | Out-Null
Copy-Item .\codex\skills\* $dest -Recurse -Force
```

Restart Codex after copying. Keep `codex/skills/_refs` with the skills.

### Attached Repo / Submodule

```bash
cd <your-project>
git submodule add <repo-url> .sdcorejs-agent
ln -s .sdcorejs-agent/CLAUDE.md CLAUDE.md
ln -s .sdcorejs-agent/AGENTS.md AGENTS.md
ln -s .sdcorejs-agent/skills skills
ln -s .sdcorejs-agent/_refs _refs
```

## Tool Support

| Tool | Reads | Verification |
|---|---|---|
| Claude Code plugin | `plugin/skills/**`, `plugin/_refs/**`, `plugin/sdcorejs-harness.json` | Mirror/action/capability drift checks |
| Claude Code direct | `CLAUDE.md`, `.claude/skills/**`, `.claude/sdcorejs-harness.json` | Mirror and behavioral sentinel checks |
| Codex attached repo | `AGENTS.md` | Entrypoint and behavioral sentinel checks |
| Codex native | `codex/skills/**`, `codex/sdcorejs-harness.json` | Codex mirror/action/ref checks |
| Cursor | `AGENTS.md`, `.cursor/rules/sdcorejs-agent.mdc`, `.cursor/sdcorejs-harness.json` | Generated rule/manifest drift checks |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/chatmodes/sdcorejs.chatmode.md`, `.github/sdcorejs-harness.json` | Entrypoint and manifest checks |

For adoption guidance, compatibility evidence, and expected live-tool
transcripts, see:

- `docs/ADOPTION.md` - when to use this pack, when not to use it, fast-fix
  rules, compatibility matrix, and adoption checklist.
- `docs/WORKED_EXAMPLE.md` - example full workflow from request through
  evidence summary.
- `docs/TROUBLESHOOTING.md` - mirror drift, Codex refs, text hygiene, plugin,
  and Full E2E troubleshooting.
- `docs/REAL_AGENT_VALIDATION.md` - sanitized transcript evidence template.
- `docs/RELEASE_PROCESS.md` - tag/release checklist.

## Repo Layout

```text
skills/                 source skills, 23 dispatchable skill files
_refs/                  source reference docs
_refs/harness/          actions, capabilities, model roles, runtime envelopes
.claude/skills/         generated Claude mirror
plugin/skills/          generated Claude plugin mirror
codex/skills/           generated Codex-native mirror
.cursor/rules/          generated Cursor rule
scripts/sync-skills.mjs cross-platform mirror generator
*/sdcorejs-harness.json generated adapter capability/action metadata
```

Run after editing source skills, refs, or `AGENTS.md`:

```bash
npm run sync:skills
npm run check:skills
```

See `MIRROR_POLICY.md` for canonical source ownership and generated mirror
review rules.

## Release Discipline

- Keep `CHANGELOG.md` updated for user-visible skill, ref, workflow, or
  validation changes.
- Create GitHub releases and tags for adopted versions; follow
  `docs/RELEASE_PROCESS.md` and include validation commands, CI run links, Full
  E2E evidence, and real-agent transcript evidence for Claude Code, Codex,
  Cursor, and GitHub Copilot in release notes.
- Treat generated mirrors as supported distribution artifacts. Any source
  change to `skills/`, `_refs/`, or `AGENTS.md` must be followed by
  `npm run sync:skills` and `npm run check:skills`.
- For upgrades, compare the previous tag to the new tag and review
  `CHANGELOG.md`, `VALIDATION.md`, and `docs/ADOPTION.md`.
- Keep repository metadata aligned with this positioning: this is a portable
  SDLC skill pack, not a standalone runtime coding agent.

## Mandatory Behavior

- Runtime-localized output: respond in the user's language and preserve locale-specific marks.
- Non-trivial skills apply the read-only `_refs/shared/project-context.md`.
  Valid summary sections help orientation; missing or stale summary falls back
  to targeted reads or a scoped code map and never blocks work.
- Non-trivial execution tasks use `_refs/shared/tasklist.md`: create visible
  outcome-based progress when work starts, then update only for a meaningful
  outcome, scope change, blocker, verification event, required decision, or
  explicit status request. Disclose skipped verification, blockers, and risks
  without duplicating the final response.
- Live progress remains in the current thread/harness. Durable handoffs are
  explicit and change-scoped; repository files never mirror live checkbox
  state.
- `.sdcorejs/**` producers emit runtime `artifact_context`. Git artifact
  closure automatically includes required same-change specs/plans/docs while
  excluding unrelated and local-only artifacts.
- Requirements before code: use `sdcorejs-brainstorming` until blockers are confirmed.
- Pure Q&A answers directly without entering the SDLC.
- For explicitly small low-risk edits, use the fast-fix path in
  `docs/ADOPTION.md`; escalate to the full workflow if scope grows.
- Explicit approval required for spec and plan.
- Approved plans execute through `sdcorejs-execute-plan`.
- `sdcorejs-execute-plan` asks sequential versus parallel only for two or more
  independent units when both modes are actually feasible.
- Supported native structured interaction may be used for real decisions;
  static visual and numbered Markdown fallbacks keep the workflow portable.
- Product/PO docs, user stories, acceptance criteria, UAT, and traceability use the `sdcorejs-product` track.
- UI/UX design, FE handoff specs, wireframes, and PNG previews use the `sdcorejs-design` track.
- Test-only plans use the `sdcorejs-test` track.
- Confirmed AI-agent implementations use `sdcorejs-ai-agent`; under-specified
  AI-agent ideas return to brainstorming, while test, review, and debug requests
  keep their dedicated owners.
- Codebase understanding, summaries, flow tracing, and local setup discovery use `sdcorejs-explore`.
- Bounded behavior-preserving refinement of recently changed or explicitly
  scoped executable source uses `sdcorejs-simplify`; broad refactors return to
  planning.
- Final gate, acceptance verification, branch readiness, dependency-update delivery, ready-to-merge, and release readiness use `sdcorejs-ship`.
- Commit, PR, changelog, release notes, and Git artifact creation use `sdcorejs-git`.
- Unknown stacks can still run through the generic harness fallback.
- Authentication, authorization, security, and container-based test guidance
  remain embedded in the technical tracks that own those concerns; they are
  not standalone end-to-end packaging workflows.
- Every code-generation run presents the finish gate before tail steps.
- Never claim pass, built, fixed, or done without current verification output.

## License

MIT
