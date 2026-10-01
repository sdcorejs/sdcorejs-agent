---
slug: artifacts
title: Artifacts, approval & evidence
description: Understand what you approve, which repository owns each artifact and how to verify a handoff.
kicker: Work with your team
---

## What do you approve?

Spec and plan have separate approvals, then become approved snapshots with identities/hashes. Scope changes must not be silently written into an approved artifact. Architecture is a conditional gate for changes involving ownership, public contracts, security boundaries or significant architecture decisions.

You should see **behavior and non-goals** in the spec, and **owned paths, units, dependencies and verification** in the plan. Approval needs explicit scope. Silence, viewing a mockup or saying "build" does not automatically replace these approvals.

## Which artifacts reveal actual progress?

| Artifact | What to inspect | Owner |
| --- | --- | --- |
| Spec / approved spec | Requirements, AC, invariants and scope | Spec |
| Plan / approved plan | Task-path mapping, dependencies and validation map | Plan |
| Product bundle | PRD, stories, AC, UAT and ledger | Product |
| Design bundle | Flows, handoff, editable wireframes and decision notes | Design |
| Test evidence | Commands/cases actually run, revision, results and related AC | Test |
| Review / repair report | Located findings; repair authority and evidence | Review / Repair |
| Technical docs / guide | Source-backed behavior; real images when captured | Documentation |
| Convergence / readiness | Connect approved intent to current source and evidence | Ship |

The active checklist lives in the thread/runtime. Do not use a "current session" file as a global progress source.

## Paths to recognize

This example describes the canonical layout of the **target repository that owns the artifacts**. It does not require copying every folder into every project:

```text
.sdcorejs/specs/
.sdcorejs/plans/
.sdcorejs/product/prds/<feature>.md
.sdcorejs/product/acceptance-criteria/<feature>.md
.sdcorejs/design/specs/<feature>.md
.sdcorejs/design/wireframes/<feature>/
.sdcorejs/docs/product/<feature>.md
.sdcorejs/docs/design/<feature>.md
.sdcorejs/documentation/technical-docs/<doc-key>/<doc-key>.md
.sdcorejs/documentation/user-guides/<doc-key>/<doc-key>.md
```

A module owns its documentation and assets. A portal owns only its shell, composition, integration and aggregates that reference module sources. The current checkout does not establish ownership. If the owner is unavailable or unwritable, report the blocker instead of writing into the portal.

Root-level `product/` and `design/` are read-only compatibility inputs for older repositories. Updating legacy content requires migrating the bundle and checking conflicts; do not create two editable copies.

## Read verification results

A useful result records the command or test case, environment, current revision/scope, actual outcome and the AC it proves. "Tests are green" is insufficient if they do not check the changed behavior.

- **Deterministic/offline:** local contracts, fixtures and validators.
- **Full E2E:** flows in a prepared environment; dependencies, containers or actual UI must be available.
- **Live-agent/provider:** real sessions, tools/runtime/models and separate evidence.
- **NOT RUN:** not executed; state the reason and the limit on the claim.

An image rendered from a wireframe is a mockup. A real application screenshot must be captured from the actual UI with provenance. A standalone PNG does not replace editable design source.

## Finish gate and handoff

After implementation, complete tests, review/repair for findings, docs/traceability and required artifacts. Simplification is opt-in, with a baseline and focused rechecks. Verification connects current evidence through the validation map and convergence.

`branch-ready` is the final read-only gate. If code/docs are written afterward, rerun it before Git handoff. `sdcorejs-git` creates commits/PRs or Git actions only within existing authority; readiness does not authorize publication or deployment.

## Communication Economy Policy

This policy helps teams receive concise, complete responses while preserving evidence. The `compact`, `standard` and `detailed` profiles adjust detail; approval, security, destructive actions, ambiguity, blockers and failed verification need full explanations. The policy does not promise token or cost reduction.

**Runtime context** preserves the full typed information, scope, IDs, hashes and evidence required by the consumer. **User projection** presents what the user needs to understand the outcome and next decision. When `runtime_context_channel` is unsupported or unknown, a **portable handoff** preserves the exact consumer-required fields and bounded artifact/evidence references. Preserve authority and evidence relationships; do not copy full artifact bodies into the handoff or user response.

For example, an ordinary progress update needs an outcome and blockers. Before approval or handoff, request explicit scope, checks run/skipped and limits. Read the [canonical policy](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/harness/communication-economy.md) for this version's profiles and fallback.

## Handoff checklist

- Does the implemented scope match the spec/plan and approved revision?
- Do changed paths belong to the correct owner?
- Do important AC have corresponding tests or evidence?
- Was the review independent or self-critique? Which part was source-only?
- Are failed/skipped checks, live-provider limits and blockers explicit?
- Were docs/artifacts completed before the final read-only gate?

Sources: [artifact roots](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/shared/system-registry.json), [finish gate](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/shared/finish-gate.md), [documentation layout](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/shared/documentation-layout.md).
