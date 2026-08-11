---
name: sdcorejs-skill-authoring
description: Use when changing this repository's skill inventory, skill triggers, dispatch behavior, shared skill contracts, or behavioral evals. Internal to sdcorejs-agent authoring; never install or distribute it to target projects.
---

# SDCoreJS Skill Authoring

Author skill-pack changes from behavioral evidence, not from plausible-looking
Markdown. This capability owns authoring discipline only; existing public
skills retain their product, implementation, review, repair, and ship owners.

## Scope boundary

- Apply only while authoring the `sdcorejs-agent` repository or this skill pack.
- Keep this capability under `authoring/`, outside public `skills/**`.
- Never add it to harness manifests, generated mirrors, adapter inventories,
  the site catalog, package installation output, or target projects.
- Edit canonical public sources first. Generate public mirrors only with the
  repository sync command; never hand-copy a mirror.
- Do not treat a deadline, requester title, or batch request as approval to
  change dispatch contracts or inventory limits.

Read `authoring/README.md`, `authoring/evals/scenarios.json`, and
`authoring/evals/skill-authoring-contract.mjs` before making an authoring
decision.

## New-skill decision gate

Default to an existing surface. A new public skill is justified only when all
of these are evidenced:

1. distinct user intent and trigger;
2. distinct lifecycle;
3. distinct artifact authority or execution boundary;
4. no clean expression as an existing skill action, mode, or reference;
5. positive and negative routing evidence;
6. acceptable surface and complexity cost.

Otherwise choose exactly one owned fallback:

- `existing-skill-mode`;
- `shared-reference`;
- `executable-helper`;
- `test-fixture`;
- `documentation-only`.

Call `evaluateNewSkillDecision`. It derives public names/count/hash and the
routing-matrix hash from this repository; supplied count or free-form routing
claims cannot replace them. Proposals are nonempty and cannot duplicate the
inventory. Adding a trigger needs a canonical approved artifact resolved from
the trusted loader and bound to actor, proposal scope, the current Git revision,
and current inventory hash. A colocated JSON file and its caller-computed hash
are not approval. The public count has ceiling 23;
a boolean or owner instruction cannot override it.

## RED-GREEN-REFACTOR

### RED

1. Capture the source revision and dirty-state limitation.
2. Run the unchanged baseline scenario before a candidate edit.
3. For judgment-heavy behavior, use a fresh isolated agent when available and
   retain only a sanitized transcript or structured record.
4. Include positive, negative, ambiguous, adversarial, and pressure prompts.
5. Demonstrate the trigger gap, unsafe behavior, or that the proposed public
   skill is already redundant. A safe baseline may reject the proposal; that
   is valid RED evidence for the decision gate.

### GREEN

1. Run the same scenario against the candidate contract.
2. Prove the intended outcome and its paired safe control.
3. Verify approval, artifact ownership, write scope, and exact commands.
4. Add executable regression and mutation coverage; prose presence alone is
   insufficient.
5. Store a GREEN record linked to RED with the base revision, a distinct
   source-state hash, and the passing behavior-contract hash. Every hash must
   resolve through a repository file manifest; a caller-supplied digest alone
   is not evidence.

### REFACTOR

1. Remove duplicate rules and prefer the existing canonical owner.
2. Check trigger overlap and negative routing boundaries.
3. Preserve Communication Economy and portable required fields.
4. Re-run negative, pressure, and mutation cases.
5. Regenerate mirrors only when canonical public sources changed.
6. Store a REFACTOR record linked to GREEN with a distinct source-state hash
   and the unchanged GREEN behavior-contract hash. Bind the terminal contract
   manifest to the current scenarios, validator, and internal skill sources.

## Behavioral evidence

Extend the existing routing harness; do not replace it. Every stored run must
identify source/contract hashes, scenario, model/effort/runtime metadata when
exposed, task result, turns, visible-output bytes, approval/ownership/
verification completeness, a sanitized transcript reference, and the exact
limitation.

Source-state, contract, behavior, and transcript hashes must resolve to current
repository files. Lifecycle manifests are role-bound typed snapshots: unrelated
existing files cannot stand in for source state, a phase contract, or behavior.
The recorded Git revision must resolve to a commit. The terminal REFACTOR
contract hash must equal the hash of the current canonical authoring sources,
while its behavior hash remains equal to GREEN.

- Record token usage only when the provider supplies it.
- Deterministic runs make zero provider calls and never inspect ambient
  credentials.
- Live A/B runs require explicit authorization. Otherwise store structured
  `NOT RUN` evidence with the exact reason, null transcript, and null tokens.
- Never claim a partial live matrix as full live-agent coverage.
- Validate the exact ten-scenario set in authorized and unauthorized branches.
  Authorized records require a canonical provider-use approval plus one
  canonical provider execution receipt per scenario. Each receipt binds target
  repository and revision, provider/runtime, result, token provenance, and a
  distinct structured transcript whose scenario/result/target fields agree.
  Derive freshness, coverage, aggregate result, and token total from those
  receipts; never trust contradictory top-level booleans.
- The current authoring session is not fresh target-project validation.

Run:

```text
node authoring/evals/run-deterministic.mjs
npm run test:e2e:skill-authoring
```

The required deterministic matrix covers architecture routing and bypass,
blocking assumptions, missing AC mappings, unrelated green tests, convergence
scope, incorrect external feedback, observed conventions, module ownership,
and Node manifest/lockfile engine drift.

## Completion gate

Before reporting an authoring change ready:

1. run the focused authoring suite and affected routing/contract suites;
2. run text hygiene and executable-reference checks;
3. confirm public count and the internal non-distribution invariant; scan
   public content as well as names so a renamed internal-skill copy fails, and
   inspect package/lockfiles for provider SDKs;
4. sync and check mirrors only after canonical public sources stabilize;
5. separate deterministic, full-E2E, and live-agent evidence in the report;
6. state every skipped or `NOT RUN` layer as a limitation, never as a pass.
