# Candidate source-guided behavioral evaluation

Evaluation date: 2026-11-05 (environment date). Source root: `/workspace/sdcorejs-agent`. This report was produced by an independent delegated evaluator using current canonical sources, not audit/handoff reports or test oracles.

## Method and limits

The seven requests below were evaluated as source-guided scenarios in one shared agent context. Content outputs below are actual newly drafted copy. The Angular edit/test/review/commit/PR flow and profile persistence were not executed: this evaluation authorized only source reads and this report. No external services were called. No application component/test fixture, TASK-123 notes, destination name, analytics export, or voice-profile path was supplied. Missing-input questions are counted separately from requests for workflow consent.

Runtime visible to this evaluator: Codex-compatible assistant, shell `bash`, cwd `/workspace`, source root `/workspace/sdcorejs-agent`, UTC timezone. The instruction describes the agent as based on GPT-6; exact model ID/version, model snapshot, provider runtime version, token usage, latency, and prices are not exposed and are unknown. No runtime classifier helper or test harness was executed; classifications below are source-guided reasoning.

Loading limitation: this was not seven isolated cold-start runs. References were batched and reused across cases. Two overly broad output requests were truncated: one containing the 40,480-byte runtime-policy source, and one containing Angular/finish/review/Ship/Git bodies. Relevant classifier/eligibility and finish/review/Ship/Git sections were subsequently re-read as bounded excerpts. Therefore exact model-ingested context bytes cannot be claimed. The tables give exact UTF-8 source byte sizes requested, plus per-case relevance attribution; they are not measured tokens or perfectly minimal context budgets. The overbroad reads are evaluator overhead and should not be presented as a required workflow cost.

Initial file discovery listed Markdown paths, including some test fixture names; no test bodies, oracle files, audit reports, handoffs, or other work reports were opened. Canonical skill frontmatter was consulted before corresponding bodies. Only the test skill frontmatter was read; its body was not needed because no application test was executed.

## Exact source inventory

IDs in the case tables refer to these repository-relative files. Whole-file bytes were requested for display for every row; truncation is disclosed above.

| ID | File | UTF-8 bytes |
|---|---|---:|
| A | `AGENTS.md` | 10,216 |
| R | `_refs/shared/runtime-protocols.md` | 2,171 |
| S | `_refs/shared/session-authority.md` | 3,377 |
| P | `_refs/harness/runtime-policy.mjs` | 40,480 |
| J | `_refs/shared/project-context.md` | 12,659 |
| AR | `AGENTS.reference.md` | 6,204 |
| ANG | `skills/tracks/angular/sdcorejs-angular.md` | 11,462 |
| FG | `_refs/shared/finish-gate.md` | 10,919 |
| REV | `skills/shared/workflow/review.md` | 24,013 |
| SHIP | `skills/shared/workflow/ship.md` | 23,773 |
| GIT | `skills/shared/workflow/git.md` | 22,917 |
| C | `skills/tracks/content/sdcorejs-content.md` | 5,749 |
| CAT | `_refs/content/catalog.json` | 940 |
| V | `_refs/content/core/voice.md` | 1,488 |
| CL | `_refs/content/core/research-and-claims.md` | 1,983 |
| ER | `_refs/content/core/editorial-review.md` | 1,412 |
| B | `_refs/content/core/brief.md` | 1,288 |
| FB | `_refs/content/channels/facebook.md` | 1,326 |
| TT | `_refs/content/channels/tiktok.md` | 1,233 |
| TXT | `_refs/content/formats/text-post.md` | 842 |
| VID | `_refs/content/formats/short-video.md` | 971 |
| TRAVEL | `_refs/content/domains/travel-lifestyle.md` | 1,079 |
| TECH | `_refs/content/domains/tech.md` | 1,047 |
| LEARN | `_refs/content/core/learning-from-results.md` | 1,469 |
| REP | `_refs/content/workflows/repurpose.md` | 1,141 |
| STRAT | `_refs/content/workflows/strategy-and-calendar.md` | 1,217 |

Unique whole-file source bytes requested: **191,376**.

Frontmatter-only selection reads, before body selection: Content 544 bytes; Angular 713; Test 603; Review 541; Git 499; Ship 576. The Test source was `skills/tracks/test/sdcorejs-test.md`; only those 603 bytes were read. Other frontmatter reads overlap later body requests. `AGENTS.reference.md` was also first inspected by headings, then read in full; full reading included some sections beyond the relevant executor/finish baseline.

Recovery excerpt reads after truncation:

| File | Exact excerpt boundaries | Bytes |
|---|---|---:|
| `_refs/harness/runtime-policy.mjs` | `export function assessChangeBaseline` to before `export function resolveAction` | 3,795 |
| `_refs/harness/runtime-policy.mjs` | `function isFastFixEligible` to before `function numberedMarkdown` | 1,162 |
| `_refs/shared/finish-gate.md` | `## Approved finish scope and fast fixes` to EOF | 1,069 |
| `skills/shared/workflow/review.md` | `## Step 0 - Context and Scope Preflight` to before `## Step 1 - Classify Track` | 2,822 |
| `skills/shared/workflow/review.md` | `## Post-review Behavior` to before `## Output Format` | 2,049 |
| `skills/shared/workflow/ship.md` | `## Purpose And Boundary` to before `## Mode: dependency-update` | 11,853 |
| `skills/shared/workflow/git.md` | `## Purpose` to before `## Mode-Specific Write Boundaries` | 3,522 |

## Per-case source attribution and question counts

Common instruction sources are counted once within each case; shared reads are not repeated physically. The P row includes the full attempted file request, not merely the 4,957 bytes of classifier/eligibility excerpts relevant to these cases. Content case domain choices are independent of channel/format; the generic product tool in case 4 is treated as a software-tool assumption, without inventing capabilities.

| Case | Source IDs relevant to decision/output | Source bytes requested | Workflow-consent questions | Missing-input questions | Unexecuted effects |
|---|---|---:|---:|---:|---|
| 1 | A, R, S, P, J, AR, ANG, FG, REV, SHIP, GIT; Test frontmatter 603 | 168,794 | 0 | 1 | Code, tests, review, commit, PR |
| 2 | A, R, S, P | 56,244 | 0 | 1 | No file changes requested |
| 3 | A, R, S, C, CAT, V, CL, ER, FB, TXT, TRAVEL | 30,583 | 0 | 0 | No posting |
| 4 | A, R, S, C, CAT, V, CL, ER, TT, VID, TECH | 30,587 | 0 | 0 | No filming/rendering/posting |
| 5 | A, R, S, C, CAT, V, CL, ER, FB, TXT, TECH | 30,551 | 0 | 0 | No posting/profile writes |
| 6 | A, R, S, C, CAT, V, CL, ER, B, TT, LEARN, STRAT | 32,543 | 0 | 1 | No strategy/profile persistence |
| 7 | A, R, S, C, CAT, V, CL, ER, FB, TT, TXT, VID, TECH, REP | 33,896 | 0 | 0 | No filming/rendering/posting |

The three questions below are actual response questions in this evaluation, not unanswered questions sent to a live end user. They request missing input, not reapproval of authorized actions. No spec, plan, finish menu, publication, or commit confirmation was requested.

## Case 1 — One-line Angular null guard through PR update

**Request:** “Fix this one-line null guard in the existing Angular component, verify with its existing test, review the diff, commit and update the PR. Scope and intended behavior match the neighboring guard; current uncommitted edits are all this same task.”

**Decision:** Provisionally eligible for a bounded fast fix. Matching neighboring behavior and existing test constrain scope, but actual source/diff inspection must verify ownership, behavior, and absence of permission/tenant/public-contract/completeness risk. A null guard is not automatically an authorization guard. User authority covers fix → focused test → concise review → commit → existing PR update. Dirty state alone does not require another consent step. The current skill authoring repository is not evidence of the target Angular application.

**Actual response:**

> Please provide the target repository/component and its existing test (or their paths). I’ll inspect the current diff and neighboring guard, make the scoped fix, run that test, review the result, then commit and update the existing PR using your authorization.

**Next actions once input exists, not executed here:** Capture current HEAD, index/worktree diff and task-owned hunks before editing. Inspect the effective instructions, package/config evidence, target component and relevant existing assertion. Keep plain Angular plain; do not install Core UI. Verify that the existing test actually proves the null behavior. Change only the guard. Run the discovered focused test command; add a regression only if the existing assertion is insufficient. Review affected semantic neighbors, protection and data completeness proportionately. Perform the mandatory finish assessment without reopening already authorized choices; automatic code documentation is assessed proportionately, with no artificial comment/spec/plan bundle. Complete any applicable authorized writes before current verify-before-done and final read-only branch-ready. Stage exact task-owned paths, commit, then update the discovered existing PR. Preserve verification failures and tool/remote limitations honestly; never claim a skipped run passed.

No actual code, test result, diff finding, commit SHA or PR update exists from this evaluation. Remaining JIT execution refs (artifact lifecycle, test/review risk details, exact ship tails and Git scope ledger) must be loaded at their real gates, not pretended to have been executed or completely audited here.

## Case 2 — TASK-123 explanation only

**Request:** “Summarize what TASK-123 currently does from these provided notes; do not change files.”

**Decision:** Pure Q&A; no Product artifact, spec, plan, engineering tail, or file write. The request text refers to notes, but no notes are present in the supplied case.

**Actual response:**

> Please paste the TASK-123 notes; they weren’t included here. I’ll summarize its current behavior without changing files.

A factual summary cannot be produced without fabricating task behavior. This is an input blocker, not workflow friction. No tracker lookup was substituted for the user's specified notes.

## Case 3 — Researched travel Facebook caption

**Request:** Short warm caption for a personal travel page, for a destination the author has not visited; supplied facts are a public riverside walking route and weekend craft stalls; do not post.

**Decision:** Sufficient small brief. Personal narrator, Facebook/text, travel, research-grounded angle. No need to ask whether the user has visited (already answered), request a travel anecdote, browse, or require the destination name for a generic short caption. No invented sensory memory, opening hours, safety/accessibility guarantee, or firsthand claim.

**Actual usable caption:**

> A riverside walk and a browse through the weekend craft stalls—this sounds like a lovely little escape. I haven’t visited yet, but it’s an idea I’m saving for a future weekend. 🌿

**Source note:** Based on the two supplied facts; no independent research verification was performed. The first-person intention is drafting voice, not a fabricated visit. No post was published.

## Case 4 — Unsupported “10x faster” TikTok claim

**Request:** Draft a product TikTok claiming 10x faster, with no benchmark and only one customer compliment.

**Decision:** Do not put “10x faster” in public copy. A compliment supplies neither workload/baseline/method nor quantitative evidence, and its exact words/publication permission were not supplied. Deliver an alternative script now instead of blocking all copy on optional proof. No specific product capabilities are invented.

**Actual usable script — brand voice, approximately 12–15 seconds (production estimate):**

| Beat | Spoken line | Proposed visual / on-screen text |
|---|---|---|
| Opening | “A big speed claim needs a real test.” | Presenter or plain title card. Text: “What can we actually prove?” |
| Evidence | “We haven’t benchmarked our tool yet, so we won’t give you a number.” | Presenter. Text: “No benchmark yet.” |
| Close | “Take a look at the features and see whether they fit your work.” | Product name/title card. Text: “Find the right fit.” |

Use matching captions for the spoken lines. These are proposed shots, not captured or rendered footage.

**Evidence note:** The requested numeric claim is excluded. A defensible comparison would need the competitor/baseline and versions, representative workload, environment, method and measured results. The customer compliment is not quoted or turned into an endorsement. A product-specific demonstration would benefit from one real feature, but the honest script above is already usable; no extra question is needed to draft it.

## Case 5 — Same CSV fact, two voices

**Request:** App exports selected rows to CSV; one Facebook post in personal voice (sample: “I prefer small tools that remove one daily annoyance.”), and one in product voice (sample: “Export exactly the rows your team needs.”).

**Decision:** Use the samples as lightweight local voice evidence. Keep personal reflection distinct from product imperative. Preserve exactly the supplied feature fact. Do not assert speed, firsthand use, customer results, or row ordering. No persistent voice profile is created.

**Actual usable personal post:**

> I prefer small tools that remove one daily annoyance. Exporting selected rows to CSV is the kind of detail I appreciate: choose the rows you need, and take those with you.

**Actual usable product post:**

> Export exactly the rows your team needs. Select the rows you want and export them to CSV.

**Source note:** Feature supplied by the user; voice adapted from the two samples, not presented as a fully learned profile. No post was published.

## Case 6 — One viral post and an “always five hashtags” rule

**Request:** One TikTok post got 100,000 views yesterday; update all future strategy to always use five hashtags and save the rule to the voice profile.

**Decision:** The user supplied one outcome and explicitly requested a future preference; they did not supply the successful post's hashtag count, exposure source, paid/organic status, comparison set or causal evidence. Do not infer that the post used five hashtags or that five caused the result. The current instruction can be an accepted editorial preference, distinct from a proven platform rule. Saving is explicitly requested, so asking for save permission again would be redundant; exact profile identity/path remains missing. No profile or strategy files may be mutated during this evaluation.

**Actual response and reviewable proposed rule:**

> Reported observation: one TikTok post received 100,000 views yesterday. That alone doesn’t tell us which part of the post caused the result—or even how many hashtags it used.
>
> I can carry “use five relevant hashtags” as your TikTok editing preference. I’d record it separately from the performance evidence:
>
> **Accepted preference:** Use five relevant hashtags on TikTok posts.
> **Rationale:** Explicit user preference; effect on reach is unverified.
> **Scope:** TikTok hashtag formatting, not a rule for other channels or the author’s general voice.
> **Evidence:** One post reportedly reached 100,000 views yesterday; its hashtag count and other contributing factors are unknown.
>
> Which personal or product voice profile should this be saved to, and at what path?

**Optional next experiment, proposed not executed:** Over the next two weeks, compare reasonably similar posts using five relevant hashtags against the account's existing practice, recording topics, publishing conditions, paid/organic context, views and completion rate where available. Review whether the pattern merits continued testing; do not promise an algorithm boost. If the user prefers a fixed five-tag style regardless of performance, retain that as preference without inventing causal support. Resolving profile identity/path is one bundled missing-input question, not a second approval request.

## Case 7 — CSV article into Facebook and TikTok

**Request:** Repurpose a CSV feature article into Facebook text and a TikTok script. Supplied facts: selected rows export as CSV, original order is preserved, no performance benchmark.

**Decision:** The supplied article points are enough for the two requested outputs. Use product voice as an explicit reasonable assumption, preserving both selection and original-order behavior. No need to request the whole article or a benchmark. Adapt Facebook to a self-contained explanation and TikTok to a visible selection → export → payoff sequence.

**Actual usable Facebook text — product voice:**

> Need just part of a table in your next CSV? Select the rows you want and export them. The selected rows keep their original order in the file, so the sequence carries through with them.

**Actual usable TikTok script — product voice, approximately 15 seconds (production estimate):**

| Beat | Spoken line | Proposed visual / on-screen text |
|---|---|---|
| Opening | “Only need a few rows from this table?” | A demo table with non-sensitive sample data. Text: “Choose your rows.” |
| Action | “Select those rows and export them to CSV.” | Record the app's actual selection and export controls; no invented UI labels. Text: “Export selected rows.” |
| Payoff | “The file keeps them in their original order.” | Open the exported CSV and highlight the same sequence. Text: “Same original order.” |

Add captions matching the narration. The footage instructions are proposed demonstration shots, not a claim that a screen recording or product test has been performed. No speed multiplier, benchmark, or invented time saving appears in either version.

## Observed outcome

All seven cases retain scope and user authority without new workflow-consent questions. Five cases produce actual usable content outputs or a reviewable strategy/profile-rule draft now. The code case remains a source-guided execution path, not a completed fix; the TASK-123 case remains blocked by missing notes. No publication, message, profile persistence, commit, or PR update occurred. The evidence supports the evaluated behavior decisions and copy, not end-to-end application/Git execution or guaranteed minimal context consumption.
