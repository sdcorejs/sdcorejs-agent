# Visual Offer Policy

Canonical recognition and invitation policy for every decision owner. Load just
before presenting or settling an open choice, including direct Design entry.
Do not load the companion lifecycle for simple work or merely to detect a choice.

## Assess the decision, not the keywords

Briefly establish these facts from the request and current evidence:

1. Is there a real, unresolved decision the user needs to make?
2. Are at least two valid alternatives materially different? Name them and the
   trade-off; never invent alternatives to justify a preview.
3. Would seeing a mockup, layout, flow or diagram help this user choose?
4. Has the user requested, accepted, declined or left an invitation pending in
   the applicable scope? Preserve that response across skills and phases.
5. Is a visual surface supported by the current runtime, or can a supported
   live runtime provide it after its separate explicit consent?

When all apply, invite at the first such decision, before selecting a direction.
The user need not know the name Visual Companion. Clarify a factual blocker
first only if it changes the alternatives; reassess when that blocker resolves.
For example, unresolved cancellation authority or eligibility can change the
confirmation flow. Resolve that rule before offering competing screen flows.
Do not wait for a preview request or for entry into a particular skill.

Examples that can qualify: three-level sidebar navigation, mobile card selection
and actions, wizard versus drawer, dashboard hierarchy, or topology whose
relationships need a diagram. A UI, Angular, design or diagram keyword alone
does not qualify. Renames, typos, fixed spacing, an approved layout, one valid
option and work where the user delegates the choice continue without an offer.

## Invite once, or present what was requested

Use one short, localized invitation naming what will be shown. For example,
adapt: "The two mobile selection layouts have different reach and space costs.
Would you like to see them side by side before choosing?"
Apply `_refs/shared/user-choice-prompt.md` to the invitation. Its native text
picker may collect the preference; it cannot replace the requested preview.
Keep this separate from implementation approval or another dependent decision.

A direct request to see or compare mockups already establishes visual intent:
record acceptance for that decision and proceed to the available surface. Do
not ask whether the user wants visuals again. A requested illustration of an
approved layout does not reopen the approved choice.
An ordinary request to compare approaches is not a preview request or acceptance
of a pending invitation. Look for an explicit request to see a visual or an
explicit response to the invitation; resolving a business blocker grants neither.

Pending means wait for the conversation response, not repeat the invitation.
Accepted means reuse the preference for eligible decisions in that scope.
Declined means continue in text. A new decision ID, wording, skill or phase in
the same visual thread does not cancel a decline. Honor a session-wide decline.
Only an explicit user re-enable overrides it, in the scope actually requested;
a narrow re-enable leaves a broader decline in place for other decisions.

## One surface ladder and separate permissions

Read `_refs/sdlc/visual-companion.md` when preparing a requested/accepted preview
or its runtime consent. Resolve current evidence through
`_refs/harness/capability-contract.json` and optional visual runtime attestation.

- Visual: supported live companion with local-runtime consent, then native
  visual, then static HTML, then numbered Markdown.
- Text decisions and every approval: native structured choice, then numbered
  Markdown. A browser selection is supporting feedback only, never approval.

Unknown is not supported. Unknown browser auto-open does not disable a supported
visual surface: provide the live URL for manual opening when live is consented.
When no visual surface is deliverable, continue in text and briefly explain the
limit if relevant; do not invite an unavailable feature. On failure, preserve
the decision/options and use the next supported surface without another offer.

Visual intent, local runtime writes and browser opening are separate. Reuse an
explicit grant only within its conversation session, scope and purpose. Ask only
for a missing permission needed by the chosen surface. Prefer an available
native/static preview without starting a live session just to satisfy a request.
An explicit runtime refusal suppresses that runtime request until the user
changes it. No permission grants durable artifact writes or implementation.

## Minimal runtime context

Carry `requirement_context.visual_companion` through spec, plan, execution and
Design handoffs; do not reset it on entry. Keep it runtime-only via `context.pass`.
For portable handoffs, pass `stateDelta: {visual_companion: <scoped context>}`
to the existing context projector; its required-field projection omits optional
fields. The consumer restores `state_delta.visual_companion` before assessment
and forwards it again. Native context channels carry the full scoped object.
Never create a mutable session checkpoint or persist runtime permission as a
standing project preference. Approved artifacts remain immutable. Existing
artifact-write authority is separate and remains purpose/owner constrained.

The executable helpers in `_refs/harness/runtime-policy.mjs` consume a grounded
decision assessment; they are not a language classifier or behavioral evidence:

- `evaluateVisualOffer({decision, context, capabilities, failed_surfaces})`
  returns action, status, reason, surface and updated context. `request-consent`
  asks only for the missing runtime permission after visual intent is established.
- `recordVisualResponse` records an explicit conversation acceptance/decline;
  default scope is `visual-thread`, with `decision` and `session` supported.
  Record a new preview request for an already assessed decision as `accepted`
  in the requested scope before calling `evaluateVisualOffer`. The assessment's
  `explicit_visual_request` flag seeds acceptance only on its first evaluation;
  preserving that flag through handoff must not replay an old user response or
  overwrite a later decline. Explicitly recording a new response still permits
  re-enabling that same decision.
- `recordVisualConsent` records `local_runtime_writes` or `browser_open` with
  a purpose and scope. Capability and supporting feedback cannot grant either.
- `resolveVisualCompanionPlan` and `selectInteraction` share the same ladder.
  `consent_required` identifies a missing live permission when no other visual
  surface is usable. A text fallback is not an unfulfilled offer to ask again.

`decision` carries stable `session_id`, `visual_thread_id`, `decision_id`,
`purpose_id`, `open`, `requires_user_choice`, actual `options`,
`material_tradeoff`, `visual_benefit` and a short grounded `reason`; preserve
`approved`, `delegated` and `explicit_visual_request` when applicable. These
session IDs describe conversation scope, not authenticated runtime handles.

Context has `schema_version: 1`, `decisions`, `responses` and `consents` arrays.
Each decision stores its identity, status (`not-evaluated`, `not-applicable`,
`pending`, `accepted`, `declined`), reason, selected/fallback surface and failed
surfaces for that decision, so handoff does not retry a failed surface. Response
and consent records keep identity and scope; consent additionally keeps kind,
purpose and grant. The last applicable conversation response wins. Helpers
replace the record for the same scope rather than building a raw event log.
Legacy offered/selected booleans preserve a conservative pending signal, never
infer scope or permission. Recover a clear response from the conversation.

Executors return unresolved visual decisions to Design for an existing design
task or Brainstorming for unresolved requirements. Pass the same identity/state;
do not reopen approved decisions or bypass spec/plan change control. Confirmed
visual direction is input to normal acceptance criteria and approval gates.

Live lifecycle, waiting/stop/cleanup and `local_only` boundaries remain owned by
the detailed companion reference. Tokens, authenticated URLs and raw events
never enter durable artifacts. Static output uses the existing composer and
artifact lifecycle; no new runtime, classifier, skill or always-on hook.
