# Review Output Contract

Read this reference before building `review_context` or rendering the review
report. The user projection and redaction rules in `sdcorejs-review` still
apply: do not echo the full `review_context` by default.

````markdown
# Authoritative runtime context (not user-visible by default)

The following schema is passed to the consumer or reduced by the declared
consumer-required-field matrix for a portable handoff.

# Review - <module/feature> - <track> - <track_profile> - <dimension(s)> - <date>

```yaml
review_context:
  source: sdcorejs-review
  decision_coverage:
    contract: <exact current decision coverage>
  goal_backward_review:
    contract: <exact current goal-backward review>
  architecture_gate: { valid: true, required: true | false, status: required | not-applicable, signals: [], bypass: <exact bypass object or null>, rationale: <exact normalized rationale> }
  architecture_context: null # exact approved object when required
  validation_map: [] # exact approved plan authority
  convergence_findings: { architecture: { status: <conformant|violated|stale>, violated_invariant_refs: [] }, convention: { accepted_violations: [], observed_findings: [] } }
  track: <central-registry track id>
  review_profile: <track.review_profile from central registry>
  track_profile: <detected stack profile or not-applicable>
  artifact_identity:
    contract: <owner repository/module and execution host identities>
  approved_artifact:
    contract: <path, approved/current hashes, and freshness>
  source_revision_map: {}
  portal_pinned_module_revision_map: {}
  dimensions: [code, architecture, consistency, security, performance, accessibility, ALL]
  consistency_scope: complete | applicable | structural | dimension-affecting-only | none
  review_mode: quick-table | table | scored | blocking | site-audit
  approved_frontend_architecture:
    contract: <plan path/hash and compared/unavailable/not-applicable status>
  file_scope: [<path or glob>]
  refs_loaded: [<_refs path>]
  refs_skipped: [<ref and not-applicable reason>]
  package_manager: npm | pnpm | yarn | bun | unknown
  probes_run:
    - <actual command, exit, and redacted notes>
  probes_skipped:
    - <probe and concrete skip reason>
  test_evidence_summary:
    contract: <matrix status, associated HEAD/diff, and gaps>
  finding_ids: [R1, R2]
  findings:
    - <id, severity/gate, dimension, locator, issue, evidence, risk, action, repair tier>
  repair_gate_mapping:
    blocking: Critical/Important or BLOCKER/REQUIRED
    confirm: semantic/non-mechanical fixes
    user_decision: product/contract/security-policy decisions
  convention_context: <read-only block from _refs/shared/convention-context.md>
```

## Findings
| ID | Severity/Gate | Dimension | File/Line or Artifact Locator | Repository/Module | Issue | Evidence | Impact | Required fix | Repair tier | Gate |
|---|---|---|---|---|---|---|---|---|---|
| R1 | High/REQUIRED | security | src/auth.guard.ts:42 | repo-id / module-id | Missing permission check | redacted/summarized evidence | Unauthorized access | Add resource permission guard | confirm | REQUIRED |

## Strengths
| File/Line or Scope | What's good | Reuse where |
|---|---|---|

## N/A And Skipped
| Item | Reason |
|---|---|

## Next Action
- Blocking findings -> `sdcorejs-repair-loop` only after explicit user/finish-gate choice.
- User-decision findings -> ask for the decision before editing.
- Probe gaps -> run skipped probes only after prerequisites/approval exist.
````

Findings rules:

- Cite `file:line` for every file-level finding. If no file/line exists, mark
  the finding as scope-level or architecture-level.
- Do not omit Suggested fix for blocking findings unless the finding is
  `user-decision` or an architecture decision; in those cases, say what decision
  is needed.
- Use `auto` only for mechanical low-risk fixes. Use `confirm` for semantic or
  non-mechanical fixes. Use `user-decision` for product, contract,
  architecture, migration, security-policy, or UX decisions.
- In table mode, accepted gate values are `BLOCKER`, `REQUIRED`, `ADVISORY`,
  and `N/A`. UI findings use the same case-sensitive values in every mode.
- In quick-table mode, a severity table with no rows must contain `_none_`; do
  not omit the heading.
