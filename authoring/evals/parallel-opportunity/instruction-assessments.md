# Isolated instruction assessment excerpts

These excerpts were returned by actual built-in authoring reviewer agents with
fresh context (`fork_turns: none`). They are not synthetic target-project runs.
Exact model, effort and provider token metadata were not exposed. The parent
selected and shortened excerpts; no omitted conversation is presented as a full
transcript. All work was read-only and confined to this authoring repository.

## Baseline: `/root/parallel_trigger_baseline`

Source: `bdc22462070f9e52bb7900619970d8f8f17c5c50`, before canonical edits.

> The baseline supports parallel analysis **after the scheduler is selected**,
> but does not require proactive parallel-opportunity evaluation for ordinary
> debug, review, or exploration requests.

> A-C have a discovery gap: AG 28 requires description-based selection before
> body loading; PD 3 limits direct discovery to explicitly requested parallel
> review/audit. US 77-79 describes scheduler capability without requiring
> ordinary debug/review/explore to evaluate opportunities.

> I already has an explicit opportunity-evaluation path. The gap is not
> universal across the skill pack.

The reviewer evaluated nine cases: implicit independent diagnosis/review/trace,
shared root cause, unknown independence, sequential/no-agent restriction,
explicit parallel diagnosis, unapproved parallel-fix pressure and approved-plan
auto execution. It found the existing write, capability, ownership and fan-in
guards substantial. It did not run tests or dispatch workers.

## Initial candidate: `/root/parallel_trigger_candidate`

Source: dirty authoring worktree at the same HEAD; the initial candidate is
captured in `green-sources.json.gz`. This review was not a controlled immutable
provider A/B experiment.

> Across eligible read-only cases, readiness additionally requires request/scope
> identity, current capability attestation, valid v2 envelopes, fresh bounded
> contexts, no recursive fan-out, and unchanged-workspace evidence.

> The 38 focused tests passed, but additional in-memory probes exposed gaps
> those tests did not cover.

The reviewer identified two groups of actionable findings:

1. Read-only compilation returned before resource checks, allowing nested cache
   roots and typed port aliases to select parallel, including direct callers
   that bypassed discovery.
2. The deterministic harness missed diagnostic, fix-pressure and no-agent
   paraphrases. These were harness errors, not observed unauthorized writes.

Parent-owned regression and repair added direct compiler controls, normalized
exclusive/shared resource checks, and paired routing cases. The follow-up review
confirmed the original reproductions were resolved and identified two further
cases: CRUD words inside report-only scope and a malformed database namespace.
Those received additional failing regressions before their fixes.

The final bounded reviewer confirmed all reported code reproductions resolved.
It flagged one fixture expectation: a report-only write-path review should retain
Review as its semantic owner. The parent reconciled that expectation and reused
the same write-intent classifier in entrypoint smoke, then passed all 47 focused
tests. Final command evidence is recorded in `verification.json`. Neither reviewer
changed files, called an external provider CLI, or exercised real target-project
concurrent workers. No source/body assessment is labelled full live-agent coverage.
