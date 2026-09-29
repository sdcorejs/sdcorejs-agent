# Design and implemented UI review

This private contract belongs to existing Review. Design owns artifacts and
self-critique; Review owns independent assessment; Test owns capture/execution;
the approved executor/repair owner owns implementation writes. No new public
skill, dimension, universal approval gate or implied invocation authority.

## Canonical payload

Ordinary review schema 1 remains readable. A purpose requires the complete
closed ui_review schema 1 below. Tests load this example before substituting
fixture identities. Serialized fields express requests, never host authority.

<!-- ui-review-v1-example -->
~~~json
{
  "schema_version": 1,
  "subject_track": "general",
  "review_profile": "general",
  "mode": "read-only",
  "write_actions": [],
  "owner_repository_id": "github.com/example/application",
  "execution_host_repository_id": "github.com/example/application",
  "change_ref": "orders-change",
  "dimensions": ["code", "accessibility"],
  "file_scope": ["src/page.html", "src/page.css"],
  "purpose": "implemented-ui-conformance",
  "ui_review": {
    "schema_version": 1,
    "assessment_id": "orders-review",
    "baseline": {
      "kind": "unavailable",
      "artifact_ref": null,
      "reason": "No approved design or explicit visual contract is available."
    },
    "targets": [{
      "id": "orders",
      "screen": "orders",
      "state": "loaded",
      "viewport": {"width": 390, "height": 844},
      "source_paths": ["src/page.html", "src/page.css"],
      "build_paths": []
    }],
    "evidence_refs": [],
    "assessment_context": {
      "kind": "independent",
      "author_context": "design-author",
      "reviewer_context": "independent-reviewer"
    }
  },
  "reported_findings": [],
  "artifacts": [],
  "test_evidence": [],
  "provider_evidence": []
}
~~~

Purposes: design-artifact traces authorized requirements/ACs to flows, screens,
states, copy, responsive behavior, accessibility and component mapping.
It can review editable candidates before Design approval; it grants no
implementation authority. Implemented-ui-conformance compares actual UI with
approved Design or an explicit authorized visual contract.

Baseline kinds: design-artifact, visual-contract, unavailable, not-applicable.
Missing design permits scoped review with UNAVAILABLE conformance, or justified
NOT APPLICABLE. Never fabricate a baseline or force new Design work. Resolve
actual owner, artifact kind/revision/hash and change relationships through
existing source/Design verification. Candidate source is not approved evidence.
Targets bind screen/state/viewport and complete applicable source/build paths.
A null viewport requires an explicit non-rendered applicability reason.

## Trust and lifecycle

validateUiReviewContext checks structure only. createUiReviewRuntime creates an
opaque host token; evaluateUiReview/evaluateUiReviewConsumer read current sources
on every use. Portable results are not authorities. Missing trusted sources,
verifier or observations are limitations/blockers, never PASS.

Host provenance establishes invocation authority and reviewer separation.
Self-critique cannot satisfy independent review. Use separate context when
supported; a different model/provider is unnecessary. Unavailable isolation
is disclosed and cannot satisfy required isolation. Caller names are not proof.

Complete before/after observations detect undeclared source/report writes,
deletions, modes and index changes, including ignored files. Incomplete
observation never proves read-only. Review calls no runner/capture/repair or
persistence callback. Persistence is a separately authorized bounded action.
Legacy read_only_declared retains declaration semantics; read_only_proven
requires observed unchanged content. Reviewed means completed, not blocker-free.

## Evidence and applicability

Source inspection, rendered capture and interaction execution stay distinct.
Source-only cannot prove clipping, actual contrast, responsive rendering,
focus behavior or keyboard flow. Mockups/wireframes are not real product
captures. Missing evidence is a verification gap, not an observed bug.

Test records evidence after authorized execution. Command receipts bind actual
nonempty command, cwd/owner, exit code, target, source/build manifest and output
bytes/provenance. Source reads need no invented command. The existing documentation
image decoder is reused through a byte-only adapter; guide-specific fields are not
universal UI requirements. Legacy documentation capture metadata alone remains
unverified and cannot be imported as a UI receipt.

The host `run_command` returns `command`, `cwd`, integer `exit_code`, boolean
`interrupted` and `timed_out`, `target`, `kind`, `artifact_path`, `provenance`,
`build_id`, `image_width`/`image_height` for rendered output and `assertions`
(`{id, result: PASS | FAIL}`) for interaction. A run is completed when its exit
code is an integer, both flags are false, its output is fresh (lstat metadata or
bytes changed inside the command window, so an identical rerun still counts)
and its output is valid for its kind: a decodable image, or at least one
assertion with an id and PASS/FAIL. The receipt `outcome` is PASS for exit 0
with every assertion PASS, otherwise FAIL. A crash, timeout, missing flag or old
output yields no receipt and stays a gap. The command runs in a host command
window of the shared volatile ledger: only the verified plan's finish-policy
`volatile_paths` may change; a direct review without a plan has none.

Optional validation_map row ui_review: schema_version 1, purpose, target_id,
evidence_kinds, independent_review_required, baseline_required. It binds to
approved R/AC/INV/decision identities and projects unchanged. Approved parent
bodies with UI applicability must carry the same obligations and targets in a
ui-review-requirements JSON block (or JSON body ui_review_requirements).
Omitted runtime payload cannot drop required obligations. Required evidence
does not authorize invocation. Preflight enforces only applicable Design
review; implementation capture obligations remain pending for postflight.

A consumer evaluates UI review when any source it references declares an
obligation (validation_map, approved artifacts, source runtime or UI runtime)
or when the context is a UI review (one of the purposes above, or ui_review).
An ordinary review context is NOT APPLICABLE only when no referenced source
has an obligation; it never masks one and blocks like a missing payload. The
caller chooses its sources; for example Ship reads approved_artifacts from its
payload. Repairing a non-UI finding without UI runtime or context is NOT APPLICABLE.

Relevant source/build/content edits invalidate capture and assessment at the
same HEAD. Reverification restores only its actual evidence layer. Output
separates structure, completion, independence, read-only proof, conformance and
per-target coverage. Layers: PASS, FAIL, GAP, STALE, NOT RUN, NOT APPLICABLE;
conformance also distinguishes FAIL and UNAVAILABLE. A FAIL layer comes from a
completed failing run and is reported in `failures`, separately from `gaps`.
PASS never proves semantic equivalence or unexecuted product behavior.

Acceptance by phase: preflight, postflight, Ship and validation-map require
PASS, and FAIL blocks as a product defect. Repair accepts FAIL coverage only
for the target and kind whose receipt the repaired finding cites; every other
FAIL still blocks. Repair consumes only an assessment that an earlier review
recorded in the same host runtime (same `assessment_id` and inputs); a fresh
assessment id blocks. The citation (`uiux.evidence_ref` and `evidence_kind`) is
read from that assessment's entry with the same `id` and `repository_id` as
`repair_finding`, never from the caller's copy of the finding. Repair also
still needs that finding's owner, scope and write authority.

## Findings and consumers

Retain locator, evidence, impact, severity/gate, repair tier and required fix.
Aesthetic stays advisory and cannot auto-repair. Supported approved requirement
or invariant violations remain conformance; do not downgrade to aesthetic.
UI metadata binds requirement/evidence refs. Narrow dimensions/files/topics
stay narrow. `gate` is optional; when present it is one of `UI_REVIEW_GATES`
(`BLOCKER`, `REQUIRED`, `ADVISORY`, `N/A`, case-sensitive). A runtime finding
cites a current receipt (PASS or FAIL) of its target and kind.

Prose is never evidence: runtime status comes only from receipt coverage. A
source-only finding (`evidence_kind: source`) carries no `evidence_ref` and no
runtime result field. Sentences that mention a runtime topic
(`UI_RUNTIME_TOPICS`, such as render, keyboard, focus, tab order, hover, click,
contrast, clipping, viewport or screen reader) follow a closed rule:

- `verification` starts with an imperative verb (`UI_IMPERATIVE_VERBS`) and has
  no outcome word (`UI_RUNTIME_OUTCOME_WORDS`, such as works, passed, correct,
  fine, OK, verified, confirmed or as expected; not is/are);
- `evidence` carries a source locator (`dir/file.ext` or `file.ext:line`) and
  no outcome word, so `src/dialog.html:12: the close control is a div with no
  keydown handler` is a valid source fact;
- `limitation` marks the check as not run: `not run`, `not verified`, `NOT RUN`,
  `was not rendered`, `has not yet been verified`, `was never run`, or
  `no <runtime activity> <completion>` such as `no rendering observed`. Only
  auxiliaries (has, have, had, was, were, is, are, been, be, being, yet) and
  the closed manner adverbs `UI_DISCLAIMER_ADVERBS` (such as manually, visually
  or independently; never an outcome adverb such as correctly) may separate
  `not`/`never` from the completion verb;
- `impact` and `required_fix` carry no outcome word.

A negated runtime activity is a disclaimer, not a claim. A negation that
reaches a result instead ("never works when tested", "not correct once
rendered") is not a disclaimer. A negated finding ("no failures observed",
"none found", "nothing observed failing", "zero issues found", "never fails")
reports a run result, so it counts as an outcome claim. Inline code (`` `…` ``)
is code, not prose, so it cannot form a negated finding; topics, locators,
outcome words and disclaimers are still read from the whole sentence. "Keyboard focus moves
correctly", "Verified focus order", "Rendered fine" and "Inspect: rendered
output is correct" are rejected; "Render and inspect the accessible name" is
valid. AC-014 (D-009): the guarantee is structural; the lexicon rule is a
mandatory lint layer, and wording that avoids every lexicon term is still never
evidence.

Angular, Next.js and generic frontend use the shared verifier. Stack checks
are additive. Validation/Ship retain required gaps; existing authorized
manual/deferred policy never converts them to automated PASS. Repair preserves
owner/selection/scope/attempt authority, invalidates affected evidence and
never starts another simplify pass.

Legacy notes remain unverified. Unknown/contradictory extensions fail closed.
Historical approvals/evidence remain immutable. Synthetic fixtures prove only
contract mechanics, not real browser rendering or interaction execution.

Host adapters retain receipts and assessment observations in memory. A portable
handoff without those observations blocks verification and must reacquire Test
evidence; serializing a PASS never recreates authority. For a change requiring
both purposes, the host supplies prior_reviews containing the other context and
its original opaque runtime. Each is reverified against current content without
recursive handoffs. An authorized repair may consume a current, observed failing
assessment; it still needs the existing selected-finding and owner write authority.
This never makes the conformance failure acceptable to Ship.
