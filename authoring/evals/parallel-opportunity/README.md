# Parallel opportunity authoring evidence

This change improves the existing parallel scheduler and the debug/review/explore
owners. It adds no public skill, dependency, provider SDK or installation step;
the public inventory remains 25. The owning surface is `existing-skill-mode`,
with implementation in the existing protocol helper and routing harness.

The user authorized implementation after the read-only assessment, asking for a
useful developer pack without unnecessary skills. This is session-scoped
implementation authority, not a claim that the user reviewed generated documents.
The base is `bdc22462070f9e52bb7900619970d8f8f17c5c50`; its worktree was clean
before authoring. Existing historical authoring records and the fixed ten-case
live matrix are unchanged.

## Upstream study and adaptations

Inspected the complete [Superpowers dispatching-parallel-agents skill](https://github.com/obra/superpowers/blob/main/skills/dispatching-parallel-agents/SKILL.md).
The fetched Git blob was `3fa091b348bbe0a18eaa0e17e9092c97f7005cbe`.
The comparison below records design decisions, not a copied skill or a new alias.

| Upstream behavior | SDCoreJS implementation |
|---|---|
| Trigger on 2+ independent tasks, without shared state or sequential dependencies | Existing task owners screen substantial independent evidence-only domains after bounded initial reads. No parallel keyword is required. |
| Group unrelated failing tests and broken subsystems by problem domain | Debug retains the hypothesis ledger; shared fixtures, unknown causes and coupled flows remain with one investigator. File count alone never establishes independence. |
| Give each worker one focused, self-contained task | Reuse the existing task brief and v2 envelope; include bounded source references, failures/questions, constraints and required evidence. |
| Fresh isolated contexts rather than inherited history | Explicit fresh-context rule for read-only workers; unavailable isolation retains parent execution. No recursive fan-out. |
| Dispatch independent tasks concurrently | Use attested concurrency and capacity. Multiple tool calls alone do not prove parallel execution on every host. |
| Each agent may investigate and fix its assigned problem | Investigation uses the existing read-only request branch. Fixes return to Debug; parallel writes retain the approved-plan and delegated-execution gates. |
| Review summaries, detect conflicts, verify combined results | Report fan-in verifies source identity, unchanged paths and citations, reconciles conflicts, deduplicates findings and discloses missing units. Write-capable integration retains its existing verification/ship tail. |
| Avoid related failures, unknown exploratory debugging and shared state | The advisory helper retains owner execution for coupled/unknown, cheap, dependent, denied or recursive work. The scheduler independently rejects normalized resource collisions. |

The discovery helper never grants authority. Its positive output explicitly sets
`dispatch_authorized: false`; current host/session restrictions, runtime evidence
and complete v2 validation still apply. User sequential/no-agent instructions
remain authoritative. Direct approved-plan `auto` behavior is preserved.

## Evidence layers

- `green-sources.json.gz` and `green-manifest.json` preserve the initial candidate
  sources. `red.log.gz` records five initial failing regression tests;
  `green.log` records their first passing run. This was not the final acceptance.
- `instruction-assessments.md` contains sanitized excerpts from fresh isolated
  authoring reviewers. They assessed instructions and inspected source; they did
  not execute a target-project worker workflow. The candidate was a shared dirty
  worktree, not a controlled provider A/B snapshot.
- `verification.json` and `source-manifest.json` bind final source, scenario,
  command-log and review-fix evidence. Intermediate failed runs remain failures.
  Refactoring removes duplicated bootstrap wording and keeps the existing size
  limits; the limits and historical measurements are not relaxed.
- The scenario fixture extends the existing `loadSkillPack`/`dispatchPrompt`
  harness through `runParallelOpportunityEval`. Its semantic inputs are synthetic
  evaluator facts, not a language-understanding model or proof of actual dispatch.
  Source-hook removal and ownership/capability/resource mutations test separate
  routing and contract boundaries.

## Reproduce

```text
npm run test:e2e:parallel
node authoring/evals/run-deterministic.mjs
npm run test:e2e:skill-authoring
npm test
npm run check:skills
npm run check:text-hygiene
npm run check:executable-references
```

The focused suite includes ordinary, explicit, localized, negative, ambiguous,
adversarial and pressure prompts; it preserves primary owners and exercises the
secondary scheduler route. Compiler tests bypass discovery to prove resources
are enforced at the actual scheduling boundary. Shared reads remain eligible;
exclusive-versus-shared claims, typed ports, nested/cross-type filesystem roots,
and malformed claims fail closed.

External credentialed provider A/B and real target-project concurrent workers
are **NOT RUN**. No external-provider authorization was requested or inferred.
The isolated reviewer model/effort/token metadata was not exposed and remains
null. Passing offline checks is not a measured LLM trigger rate or proof that a
host enforces the skill. No statistical reliability or token-saving claim is made.
