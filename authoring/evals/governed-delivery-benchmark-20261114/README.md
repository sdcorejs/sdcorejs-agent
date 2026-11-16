# Governed delivery verification and behavioral benchmark

See [the results](RESULTS.md) for the measured comparison and verification limits.

This is a scoped, explicitly authorized comparison of the pre-change skill pack
at `a71251fc03890326af14afd496d5955cc30ccc20` (the fetched `origin/main` revision)
against the frozen working-tree implementation. It is separate from the
canonical ten-scenario authoring matrix and from NVIDIA Tier 3.

## Method

`setup.py` freezes the public pack files, creates six synthetic target-project
fixtures, and records hashes before any trial runs. Both arms receive identical
fixture bytes and the same user task. Pack identities are neutral in the trial
prompts; their dispatch order alternates by case. Each trial runs in a fresh
host agent without parent context, reads only its assigned pack and target, and
writes command logs, a structured trace and a final response. Target repositories
are logically isolated directories, not security-isolated containers.

The six cases cover blueprint initialization, immutable ticket refresh with
local image capture, adaptive operator documentation, verified learning,
read-only ticket review with injected instructions, and pressured delivery with
unrelated evidence and a missing attachment. `cases.json` fixes six observable
assertions per case before execution. There is one attempt per arm per case:
12 trials, 36 assertions per arm. This is a small pilot, not an estimate of
population reliability or a statistically significant improvement claim.

`collect.py` verifies the frozen inputs, records target file deltas and captures
the results. A separate fresh agent grades the fixed assertions using outputs,
file bytes, actual command logs and scope. The arm mapping is withheld from the
grader. The evaluator must cite evidence for each verdict; it cannot reward a
particular filename or helper when the assertion asks only for behavior.

The prompts explicitly ask for the desired workflows. This measures execution
under clear requests, not spontaneous discovery from vague prompts. No live
Jira/GitHub, deployment, browser application or provider credentials are used.
Token usage, provider tool-call counts, model identifier and reasoning effort are
not exposed by the host and remain null/unknown. Self-reported traces do not
become provider telemetry. An all-pass result demonstrates only these observed
tasks; it does not prove universal safety, future bug prevention or publication
readiness.

The first reviewer assigned to the second packet accidentally saw another
reviewer's aggregate result through an agent-status tool. That review was
stopped before it produced grades, and a new fresh-context reviewer received the
original packet with no other results. The disclosure is retained in
`iteration-1/disclosed-review-boundary.json`; it does not contribute verdicts.

The synthetic PNG was subsequently found to have an invalid IDAT CRC. The fixed
asset assertion measures faithful byte preservation and local references, not
image decoding. The original fixture and criteria remain unchanged; this run
does not establish usable rendered images or real UI screenshot evidence. See
`image-fixture-limitation.json` for the independent byte-level check.

## Reproduce

From the repository root, prepare a new experiment directory:

```sh
python3 authoring/evals/governed-delivery-benchmark-20261114/setup.py /workspace/work/governed-delivery-rerun
```

Dispatch each generated `trials/<id>/prompt.txt` to a fresh agent with the same
host/model configuration, without its parent conversation. Preserve the frozen
rubric before dispatch. Run `collect.py` with that directory only after all
trials complete, then obtain independent grading before computing aggregates.
Pass a separate result directory as the second argument to `collect.py` when
reproducing; `iteration-1` is the retained
original capture and must not be overwritten. A different checked-out baseline
or working tree is a new experiment, even when prompts are unchanged.

Exact original public sources are retained in `iteration-1/inputs/p17.tar.gz`
and `p42.tar.gz`, with archive and per-file hashes. The archives were read back
and checked against the frozen manifests. They contain no maintainer-only
authoring skill or target-project artifacts. Trial captures, changed artifacts,
tracked diffs and before/after inventories are under `iteration-1/runs/`;
unchanged synthetic fixture bytes are reproducible from `setup.py`. Original
absolute paths in grading citations map to these captured trial folders.

Repository verification and the independent keyless NVIDIA reports are retained
under `verification/`. Those reports distinguish raw scanner results, contextual
assessment, incomplete scans and unrun tiers. Shared executable references are
covered by repository contract tests; scanning generated SKILL.md directories
does not constitute a security scan of those references.
