# Codex evaluation adapter

Use the native fresh-agent runtime for explicit benchmark requests. Preserve source
snapshots, prompts, exact outputs and grading separately. Do not claim native
agent captures are full target-project or Claude CLI trigger validation.

The upstream aggregator defaults missing time/tokens to zero and may fall back
from tokens to output characters. Those values are not provider telemetry. For
the paired `candidate`/`baseline` layout used here, run:

```sh
python scripts/aggregate_codex.py <iteration-directory> --repetitions 2
python eval-viewer/generate_review.py <iteration-directory> --benchmark <iteration-directory>/benchmark.json --static <review.html>
```

The adapter uses upstream pass-rate statistics, checks frozen assertions and
balanced runs, and emits unknown provider telemetry as null. It does not alter
upstream scripts. Grade with `agents/grader.md`; keep exact evidence and report
criticisms of weak or nondiscriminating assertions. Do not substitute character
counts for tokens. Record actual provider metrics separately if a later runtime
exposes them and extend the adapter deliberately before reporting them.
