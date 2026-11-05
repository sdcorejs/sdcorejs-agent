---
allowed_paths:
  - skills/**
  - _refs/**
  - authoring/**
  - test/**
  - scripts/**
  - docs/**
  - site/**
  - .sdcorejs/**
  - AGENTS.md
  - AGENTS.reference.md
  - CLAUDE.md
  - README.md
  - package.json
  - package-lock.json
  - .claude/**
  - .cursor/**
  - .github/**
  - plugin/**
  - codex/**
approval_source: delegated-session-scope
approved_at: 2026-11-05T09:17:58.594Z
approved_by: requesting-user
artifact_id: skill-audit-content-20261105-plan
artifact_kind: plan
authorization_basis: "Current task, 2026-11-05: user explicitly authorizes
  autonomous completion and execution of spec/plan for verified F-001..F-012,
  workflow/context improvements, behavioral regressions and sdcorejs-content
  including inventory/routing/mirrors, grouped commits, push and PR to main. No
  separate document-review interaction occurred. This is delegated scope
  authorization, not a claim that the user reviewed these generated documents."
change_ref: skill-audit-content-20261105
commit_policy: with-change
contract_id: skill-audit-content-20261105
document_review_performed: false
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:21af1819137563b3629cdca1b8641fbf0fca6e17958cdd9189e92792aae20145
    artifact_id: skill-audit-content-20261105-spec
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: af42f21a36f12ae31c09abac1009f41f51b3d87f
parent_repository_id: null
prohibited_paths:
  - .sdcorejs/docs/workflow/2026-11-05-full-skill-audit-and-content-proposal.md
  - .sdcorejs/handoffs/workflow/2026-11-05-skill-audit-content-handoff.md
redaction_applied: true
repository_relative_path: .sdcorejs/plans/workflow/2026-11-05-skill-audit-content.md
requirement_id: skill-audit-content-20261105
schema_version: 1
source_plan: none
source_revision: af42f21a36f12ae31c09abac1009f41f51b3d87f
source_spec: .sdcorejs/specs/workflow/2026-11-05-skill-audit-content.md
stack_profile: markdown-skill-pack
supersedes: null
track: workflow
verification_strategy:
  commands_planned:
    - npm run test:e2e:repository
    - npm run check:skills
    - npm run check:text-hygiene
    - npm run check:executable-references
  package_manager: npm
approval_hash: sha256:v1:d40791933b6aa149ad38e9418bfdea54eba226cd08ad4927bec5028851d401ba
---
# Dependency-ordered implementation plan

## Execution authority
Current task, 2026-11-05: user explicitly authorizes autonomous completion and execution of spec/plan for verified F-001..F-012, workflow/context improvements, behavioral regressions and sdcorejs-content including inventory/routing/mirrors, grouped commits, push and PR to main. No separate document-review interaction occurred. This is delegated scope authorization, not a claim that the user reviewed these generated documents.

Parent: .sdcorejs/specs/workflow/2026-11-05-skill-audit-content.md. Implementation is sequential in this checkout; independent agents may evaluate/review without editing canonical sources. Initial tree clean; unrelated future changes stay excluded.

## Units
1. Contract correctness (AC-001..005,008): reproduce current helpers and published shapes; fix approval aliases, read-only compiler, debug phases, Explore action authority, Next.js config, nested commands, Product IDs and memory retrieval. Add regression with paired rejection cases. Commit canonical helpers, references and tests as one reviewable group after focused checks.
2. Workflow consistency (AC-006..008): shared session authority and bounded-change policy; align executors, finish gate, Simplify, Git/Ship and documentation intent. Add cross-skill policy/temporary-repo tests; preserve explicit authorization sources and baseline protection. Depends on unit 1.
3. Progressive disclosure (AC-009): inventory all 24, extract heavy mode/templates for Angular, Review, Plan, Explore and Test first, retain entrypoint invariant/routing and precise JIT hooks. Compare source sizes and independent selected-file loads; do not label static size as measured tokens. Depends on unit 2.
4. Content (AC-010): record versioned 24-to-25 inventory decision using current task authority, real baseline identity and existing gate; add canonical skill, independent refs, routing/inventory/registry/catalog, focused content behavior and negative routes. Do not loosen validators to hide failures. Depends on unit 2; uses unit 3 loading pattern.
5. Integration/delivery (AC-011..012): generate/check mirrors, run focused then integrated checks, independent review and repair, preserve new evidence/limitations in execution report, grouped commits, final read-only branch hygiene, push feature branch and create PR into main. Depends on all units.

## Write scope
Allowed: skills/**, _refs/**, authoring/** (new evidence/continuations; historical records immutable), test/**, scripts/**, AGENTS.md, AGENTS.reference.md, CLAUDE.md, README.md, docs/**, site/** catalog/docs, package.json/package-lock.json only needed script/inventory consistency, .sdcorejs/specs/**, .sdcorejs/plans/**, .sdcorejs/docs/workflow/** new implementation report, .sdcorejs/approvals/** for exact Content authority, generated .claude/**, .cursor/**, .github/**, plugin/** and codex/** via repo sync. Prohibited: historical audit documents/transcripts and raw sensitive/local state; production-SDLC additions; unrelated user changes. Scratch goes in /workspace/work/skill-audit.

## Verification strategy
Package manager: npm (packageManager npm@10.9.2, package-lock.json); Node v24.22.1 satisfies repository engines. Commands: node --test affected test/e2e files; node authoring/evals/run-deterministic.mjs; npm run test:e2e:skill-authoring; npm run sync:skills; npm run check:skills; npm run check:text-hygiene; npm run check:executable-references; npm run test:e2e:repository; npm run test:e2e:nextjs:golden; npm run build:site if catalog affected. Expand only on relevant failures/risks. Record command, exit status, source identity, pass/skip counts and limitation. Existing unchanged baseline debug/parallel suite: 41/41 PASS; this does not resolve new findings.

## Rollback and closure
Each implementation group is revertible by commit. Never reset unrelated work or overwrite historical evidence. Generated mirrors are regenerated, not hand-edited. Before Git delivery: explicit path staging, artifact relationship/secret/conflict checks, current verification, exact branch/base, no force push and no merge. Any post-ready write invalidates readiness.
