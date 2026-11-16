"""Aggregate fixed independent verdicts; never infer success from exit alone."""
import hashlib
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
RUN = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / 'iteration-1'

def read(path):
    return json.loads(path.read_text())

experiment = read(RUN / 'experiment.json')
cases_bytes = (HERE / 'cases.json').read_bytes()
assert hashlib.sha256(cases_bytes).hexdigest() == experiment['cases_sha256']
cases = {case['id']:case for case in json.loads(cases_bytes)['cases']}
rows = {}
for name in ['grades-a.json', 'grades-b.json']:
    report = read(RUN / name)
    assert report['rubric_sha256'] == experiment['cases_sha256']
    for trial in report['trials']:
        assert trial['trial_id'] not in rows, 'Duplicate trial verdict'
        rows[trial['trial_id']] = trial
assert set(rows) == {trial['id'] for trial in experiment['trials']}

trials = []
for trial in experiment['trials']:
    grade = rows[trial['id']]
    assert grade['case'] == trial['case']
    expected = {item[0] for item in cases[trial['case']]['assertions']}
    assert len(grade['assertions']) == len(expected)
    assert {item['id'] for item in grade['assertions']} == expected
    assert all(item['verdict'] in ['pass','fail','not_assessable'] and item['reason'] and item['evidence'] for item in grade['assertions'])
    counts = {value:sum(item['verdict']==value for item in grade['assertions']) for value in ['pass','fail','not_assessable']}
    response = RUN/'runs'/trial['id']/'capture/response.md'
    trials.append({'trial_id':trial['id'],'case':trial['case'],'arm':experiment['pack_map'][trial['pack']],'assertions':counts,'assertion_total':len(expected),'all_assertions_pass':counts['pass']==len(expected),'visible_final_response_bytes':response.stat().st_size,'token_usage':None,'provider_tool_calls':None,'provider_turns':None})
summary = {}
for arm in ['baseline','candidate']:
    subset = [trial for trial in trials if trial['arm']==arm]
    total = sum(trial['assertion_total'] for trial in subset)
    passed = sum(trial['assertions']['pass'] for trial in subset)
    summary[arm] = {'trials':len(subset),'fully_passing_trials':sum(trial['all_assertions_pass'] for trial in subset),'assertions_passed':passed,'assertions_total':total,'assertion_pass_rate':passed/total,'failed_assertions':sum(trial['assertions']['fail'] for trial in subset),'not_assessable_assertions':sum(trial['assertions']['not_assessable'] for trial in subset)}
result = {'schema_version':1,'kind':'fresh-host-agent-paired-pilot','base_revision':experiment['base_revision'],'rubric_sha256':experiment['cases_sha256'],'pack_manifest_sha256':experiment['pack_manifest_sha256'],'runtime':experiment['runtime'],'repetitions':1,'summary':summary,'observed_pass_rate_difference_percentage_points':100*(summary['candidate']['assertion_pass_rate']-summary['baseline']['assertion_pass_rate']),'trials':trials,'limitations':experiment['limitations']+['No confidence or statistical-significance claim from one attempt per case.','Explicit prompts test requested execution, not spontaneous discovery.','No provider token, turn, tool-call or reliable latency telemetry.','Image fixture has invalid IDAT CRC; byte preservation is measured, image decoding/rendering is not.','Traces are agent reports supplemented by command logs and filesystem deltas, not full provider transcripts.']}
(RUN/'benchmark.json').write_text(json.dumps(result,indent=2)+'\n')
base, current = summary['baseline'], summary['candidate']
delta = result['observed_pass_rate_difference_percentage_points']
conclusion = ('No improvement or regression was observed on these fixed assertions.' if delta == 0 else f'The observed assertion pass-rate difference is {delta:+.2f} percentage points; this pilot does not establish statistical significance.')
lines = [
    '# Verification and benchmark results', '',
    f'Baseline: `{experiment["base_revision"]}`. Candidate: the frozen, uncommitted working tree. Twelve fresh-agent trials were independently graded against a rubric frozen before dispatch. {conclusion}', '',
    '| Metric | Baseline | Candidate |', '|---|---:|---:|',
    f'| Passed assertions | {base["assertions_passed"]}/{base["assertions_total"]} | {current["assertions_passed"]}/{current["assertions_total"]} |',
    f'| Fully passing cases | {base["fully_passing_trials"]}/{base["trials"]} | {current["fully_passing_trials"]}/{current["trials"]} |',
    f'| Unassessable assertions | {base["not_assessable_assertions"]} | {current["not_assessable_assertions"]} |', '',
    '| Case | Baseline assertions | Candidate assertions |', '|---|---:|---:|',
]
for case in cases:
    pair = {trial['arm']:trial for trial in trials if trial['case']==case}
    lines.append(f'| {case} | {pair["baseline"]["assertions"]["pass"]}/6 | {pair["candidate"]["assertions"]["pass"]}/6 |')
lines += [
    '', 'The one-attempt, six-case sample tests execution under explicit requests. It does not measure default behavior under short/ambiguous requests, cross-session reliability, provider cost, latency, or live tracker round trips. Neither the numeric score nor the use of a structured helper establishes general superiority.', '',
    '## Repository verification', '',
    '- Repository `node --test` phase: **861/861 passed**, none skipped.',
    '- Focused governed-delivery suite: **85/85 passed** (a subset, not 85 additional tests).',
    '- Deterministic authoring matrix: **10/10 passed**.',
    '- Prerequisite preflight, mirrors, text hygiene, executable references and diff checks passed.',
    '- All 2,351 pre-existing source-file hashes remained unchanged during this task; new work is confined to benchmark evidence/harness files.', '',
    'Native cleanup was not run because this environment provides overlayfs rather than its admitted trusted native fixture. Full framework golden suites were not run. The complete repository script including its cleanup suffix is not reported as passed.', '',
    '## Independent NVIDIA audit', '',
    'SkillEvaluator 0.9.0 keyless Tier 1: **8 passing targets, 1 raw failure (Explore), 1 incomplete scan (Spec)**. Quality scores range from 83.8 to 88.8/100. Every report retains `publication_status: incomplete`.', '',
    'Explore matches a pre-existing setup-instruction sentence as HIGH P6; the independent contextual assessment is a lexical false positive, without suppressing the raw failure. Spec hits a parser expansion boundary in an unchanged template; its incomplete scan is not counted as passing. Other security matches and metadata-contract mismatches are documented in the independent report.', '',
    'These scans cover the ten changed generated SKILL.md targets. Shared executable references are not covered by those security scans. NVIDIA Tier 2/3 were not run: optional runtime/provider dependencies, datasets and a verified provider configuration were not ready. This host-agent A/B is separate from NVIDIA Tier 3.', '',
    '## Evidence and limitations', '',
    '- [Method, reproduction and exact scope](README.md)',
    '- [Independent repository and NVIDIA report](verification/summary.md)',
    '- [Machine-readable aggregate](iteration-1/benchmark.json)',
    '- [Independent grading A](iteration-1/grades-a.md) and [grading B](iteration-1/grades-b.md)',
    '- [Frozen experiment and source identities](iteration-1/experiment.json); exact public sources are archived under `iteration-1/inputs/`.',
    '- Trial responses, execution captures, changed artifacts, diffs and before/after hashes are under `iteration-1/runs/`.',
    '- A reviewer who saw another review result through a status tool was replaced before primary grading; the disclosure is retained and excluded from verdicts.',
    '- The supplied synthetic PNG has an invalid IDAT CRC. This run proves byte capture and local references within its rubric, not image decoding or usable real UI screenshots.',
    '- Provider model/effort identifiers and token/tool/turn telemetry are unavailable; no savings or speedup is claimed. Captured local logs are not a complete provider event stream.', '',
    'No commit, push or live Jira/GitHub change was performed.',
]
(HERE/'RESULTS.md').write_text('\n'.join(lines)+'\n')
print(json.dumps({'summary':summary,'observed_delta_pp':result['observed_pass_rate_difference_percentage_points']}))
