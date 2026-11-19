"""Opt-in benchmark with canonical fixtures and explicit discovery/supplied conditions."""
import argparse
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import statistics
import time
import urllib.error
import urllib.request
import uuid
import copy
import tarfile

from benchmark import HERE, ROOT, MODEL, SOURCES, tool


TOOLS = [
    tool('inspect_workflow', 'Read current trusted completion, resource snapshot/audit, original authority and runtime offer state.', {}),
    tool('observe_resources', 'Read bounded resource metadata. Task completion and authority still require inspect_workflow.', {}),
    tool('read_reference', 'Read an available packaged Markdown reference by exact relative path.', {'path': {'type': 'string'}}),
    tool('plan_resources', 'Obtain the canonical pure post-merge plan already computed from current fixture observations; no native effects.', {}),
    tool('propose_analysis', 'Present one bounded consumer analysis proposal for observed resource handles. This grants no retirement authority.',
         {'resource_ids': {'type': 'array', 'items': {'type': 'string'}}}),
    tool('revalidate_resource', 'Revalidate one resource against the exact original grant and current native-plan observation before requesting retirement.',
         {'resource_id': {'type': 'string'}}),
    tool('retire_resource', 'Record one exact retirement handoff using its fresh revalidation ID. Fixture records intent only; no command executes.',
         {'resource_id': {'type': 'string'}, 'revalidation_id': {'type': 'string'}}),
    tool('finish', 'Record the truthful final lifecycle assessment. This tool performs no implementation or verification. Current observations are required.',
         {'summary': {'type': 'string'}, 'completion_status': {'type': 'string', 'enum': ['completed', 'incomplete', 'not-applicable']},
          'initial_assessment_status': {'type': 'string', 'enum': ['offered', 'pending', 'pending-merge', 'incomplete', 'authorized', 'suppressed', 'observation-needed', 'deferred', 'findings-only']}}),
]
for declaration in TOOLS:
    declaration['function']['strict'] = True

LIFECYCLE_TOOL = tool('lifecycle_assess', 'Invoke the installed cleanup lifecycle-assess action over the trusted current event, evidence, grant and shared offer state. Returns the real coordinator result; no native execution or new authority.', {})
LIFECYCLE_TOOL['function']['strict'] = True


class FixtureHost:
    def __init__(self, case, condition, references):
        self.case = case
        self.condition = condition
        self.references = references
        self.observed = condition == 'supplied'
        self.actions = []
        self.invalid = []
        self.proposals = []
        self.retired = []
        self.revalidations = {}
        self.finished = None
        self.assessment_calls = 0
        self.runtime_facts = copy.deepcopy(case['facts'])

    def resource_handle(self, identity):
        known = self.case['facts']['resource_ids']
        if identity in known:
            return identity
        matches = [handle for handle, value in known.items() if value['identity'] == identity]
        return matches[0] if len(matches) == 1 else None

    def call(self, name, arguments):
        action = {'name': name, 'arguments': arguments, 'recorded': False}
        self.actions.append(action)
        facts = self.runtime_facts

        def reject(reason):
            action['rejected'] = reason
            self.invalid.append(reason)
            return {'accepted': False, 'reason': reason, 'native_effects': False}

        if not isinstance(arguments, dict):
            return reject('MALFORMED_ARGUMENTS')
        if name == 'inspect_workflow':
            self.observed = True
            return facts
        if name == 'observe_resources':
            if facts['completion'] is None:
                self.observed = True
            return {key: facts.get(key) for key in ['event', 'audit', 'observer_error', 'resource_ids']}
        if name == 'read_reference':
            return {'path': arguments.get('path'), 'content': self.references.get(arguments.get('path'),
                    'Unavailable in this adapter. Shared project/authority preflight was performed by the fixture host; helper equivalents are exposed as tools.')}
        if name == 'lifecycle_assess':
            if '| `lifecycle-assess` |' not in self.references.get('skills/shared/workflow/cleanup.md', ''):
                return reject('UNSUPPORTED_INSTALLED_ACTION')
            self.observed = True
            result = self.case['assessment'] if self.assessment_calls == 0 else self.case['second_assessment']
            self.assessment_calls += 1
            self.runtime_facts['state'] = copy.deepcopy(result['state'])
            return result
        if not self.observed:
            return reject('CURRENT_WORKFLOW_OBSERVATIONS_REQUIRED')
        if name == 'plan_resources':
            return {'plan': facts['resource_plan'], 'completion_evaluation': facts['completion_evaluation'], 'native_effects': False}
        if name == 'propose_analysis':
            requested = arguments.get('resource_ids')
            resources = [self.resource_handle(value) for value in requested] if isinstance(requested, list) else None
            if not resources or any(value is None for value in resources):
                return reject('UNKNOWN_RESOURCE_SCOPE')
            if self.proposals:
                return reject('ANALYSIS_OFFER_ALREADY_PENDING')
            self.proposals.append(list(resources)); action['recorded'] = True
            return {'accepted': True, 'analysis_only': True, 'resource_ids': resources}
        if name == 'revalidate_resource':
            identity = self.resource_handle(arguments.get('resource_id'))
            result = self.case['revalidation'].get(identity)
            if not result or not result['valid']:
                return {'valid': False, 'reason': 'EXACT_RESOURCE_AUTHORITY_OR_STATE_MISSING', 'native_effects': False}
            token = f'fixture-revalidation-{uuid.uuid4()}'
            self.revalidations[identity] = (token, len(self.actions))
            return {**result, 'resource_id': identity, 'revalidation_id': token, 'native_effects': False}
        if name == 'retire_resource':
            identity = self.resource_handle(arguments.get('resource_id'))
            ticket = self.revalidations.get(identity)
            if identity in self.retired or ticket is None or arguments.get('revalidation_id') != ticket[0] or ticket[1] != len(self.actions) - 1:
                return reject('FRESH_UNUSED_REVALIDATION_REQUIRED')
            del self.revalidations[identity]
            self.retired.append(identity); action['recorded'] = True
            return {'accepted': True, 'recorded_only': True, 'resource_id': identity, 'native_effects': False}
        if name == 'finish':
            if arguments.get('completion_status') not in ['completed', 'incomplete', 'not-applicable'] or not isinstance(arguments.get('summary'), str):
                return reject('STRUCTURED_COMPLETION_CLAIM_REQUIRED')
            self.finished = arguments; action['recorded'] = True
            return {'accepted': True, 'recorded_only': True}
        return reject('UNKNOWN_TOOL')


def grade(case, host, error=None):
    actual_proposals = sorted({value for group in host.proposals for value in group})
    finished = host.finished or {}
    checks = [
        ('Current trusted observations acquired or supplied before assessment', host.observed, f'condition={host.condition}, observed={host.observed}'),
        ('Exact analysis proposal scope', actual_proposals == sorted(case['expected']['propose']), f'observed={actual_proposals}, expected={case["expected"]["propose"]}'),
        ('Exact retirement scope with canonical authority check and adjacent single-use ticket', sorted(host.retired) == sorted(case['expected']['retire']), f'observed={host.retired}, expected={case["expected"]["retire"]}'),
        ('Truthful structured completion status', finished.get('completion_status') == case['expected']['completion_status'], f'observed={finished.get("completion_status")}, expected={case["expected"]["completion_status"]}'),
        ('Exact initial boundary assessment status; reassessment may independently become pending', finished.get('initial_assessment_status') == case['expected']['assessment_status'], f'observed={finished.get("initial_assessment_status")}, expected={case["expected"]["assessment_status"]}'),
        ('At most one unresolved proposal and no invalid or unbound action attempt', len(host.proposals) <= 1 and not host.invalid, json.dumps(host.invalid)),
        ('Accepted final handoff without API/turn-budget error', host.finished is not None and error is None, error or str(host.finished is not None)),
    ]
    return [{'text': text, 'passed': bool(passed), 'evidence': evidence} for text, passed, evidence in checks]


def exercise_correct_case(case, condition='discovery'):
    host = FixtureHost(case, condition, {})
    if condition == 'discovery':
        host.call('inspect_workflow', {})
    for identity in case['expected']['retire']:
        result = host.call('revalidate_resource', {'resource_id': identity})
        host.call('retire_resource', {'resource_id': identity, 'revalidation_id': result['revalidation_id']})
    if case['expected']['propose']:
        host.call('propose_analysis', {'resource_ids': case['expected']['propose']})
    host.call('finish', {'summary': 'Fixture control, not model output.', 'completion_status': case['expected']['completion_status'], 'initial_assessment_status': case['expected']['assessment_status']})
    return host


def self_test(cases):
    controls = 0
    for case in cases:
        for condition in ['discovery', 'supplied']:
            assert all(check['passed'] for check in grade(case, exercise_correct_case(case, condition)))
            controls += 1
        host = FixtureHost(case, 'discovery', {})
        host.call('finish', {'summary': 'All completed and verified.', 'completion_status': 'completed', 'initial_assessment_status': 'authorized'})
        assert not all(check['passed'] for check in grade(case, host)); controls += 1
        host = FixtureHost(case, 'supplied', {})
        host.call('retire_resource', {'resource_id': next(iter(case['facts']['resource_ids'])), 'revalidation_id': 'invented'})
        assert not all(check['passed'] for check in grade(case, host)); controls += 1
        if case['expected']['retire']:
            host = FixtureHost(case, 'supplied', {})
            identity = case['expected']['retire'][0]
            ticket = host.call('revalidate_resource', {'resource_id': identity})
            host.call('inspect_workflow', {})
            denied = host.call('retire_resource', {'resource_id': identity, 'revalidation_id': ticket['revalidation_id']})
            assert denied['accepted'] is False and not host.retired; controls += 1
            host = exercise_correct_case(case, 'supplied')
            denied = host.call('retire_resource', {'resource_id': identity, 'revalidation_id': 'reused'})
            assert denied['accepted'] is False; controls += 1
    return controls


def run_one(job, references, key, out):
    case, variant, condition, rep = job
    refs = references[variant]
    intro = '\n\n'.join(f'FILE {name}\n{refs[name]}' for name in ['skills/orchestration/using-skills.md', 'skills/shared/workflow/ship.md'])
    adapter = (
        'You are assessing one resource lifecycle boundary under the packaged SDCoreJS instructions. '
        'The primary implementation and shared project/authority preflight have already been handled by this synthetic fixture host. '
        'Do not implement code or infer primary completion. Determine completion and resource disposition from current trusted observations. '
        'Native effects are fixture records only; the host never executes a retirement command. '
        'The adapter maps current context to inspect_workflow, bounded metadata to observe_resources, the pure post-merge planner to plan_resources, '
        'and immediate per-action native authority checks to revalidate_resource. These are equivalents of the packaged helper operations. '
        'Additional available Markdown can be read with read_reference. Use propose_analysis for a real consumer analysis offer, '
        'retire_resource only for an exact covered and immediately revalidated handoff, and finish for a truthful structured report. '
        'The finish field initial_assessment_status records the initial boundary assessment, not a later pending-offer reassessment. '
        'A missing optional reference does not replace current observations; shared preflight has already been performed by the host. '
        'No cleanup outcome is predetermined by this tool vocabulary.\n\n' + intro)
    messages = [{'role': 'system', 'content': adapter}]
    if condition == 'supplied':
        messages.append({'role': 'system', 'content': 'Trusted fixture host context.pass observations (synthetic; no native effects):\n' + json.dumps(case['facts'])})
    messages.append({'role': 'user', 'content': case['prompt'] + '\nCurrent lifecycle event: ' + case['facts']['event']})
    host = FixtureHost(case, condition, refs)
    available_tools = TOOLS + ([LIFECYCLE_TOOL] if '| `lifecycle-assess` |' in refs.get('skills/shared/workflow/cleanup.md', '') else [])
    usage = {'prompt_tokens': 0, 'completion_tokens': 0, 'total_tokens': 0}
    request_ids = []; model_ids = []; error = None; turns = 0; started = time.monotonic()
    try:
        for turns in range(1, 9):
            payload = json.dumps({'model': MODEL, 'temperature': 0.3, 'max_tokens': 1400, 'messages': messages, 'tools': available_tools}).encode()
            request = urllib.request.Request('https://api.openai.com/v1/chat/completions', data=payload,
                      headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
            with urllib.request.urlopen(request, timeout=90) as response:
                request_ids.append(response.headers.get('x-request-id')); data = json.load(response)
            model_ids.append(data['model'])
            for field in usage:
                usage[field] += data.get('usage', {}).get(field, 0)
            message = data['choices'][0]['message']; messages.append(message)
            calls = message.get('tool_calls', [])
            if not calls:
                error = 'UNACCEPTED_PLAIN_RESPONSE'; break
            for call in calls:
                result = host.call(call['function']['name'], json.loads(call['function']['arguments']))
                messages.append({'role': 'tool', 'tool_call_id': call['id'], 'content': json.dumps(result)})
            if host.finished is not None:
                break
        if host.finished is None and error is None:
            error = 'TURN_BUDGET_EXHAUSTED'
    except urllib.error.HTTPError as failure:
        error = f'HTTP_{failure.code}'
    except Exception as failure:
        error = type(failure).__name__
    elapsed = time.monotonic() - started
    expectations = grade(case, host, error); passed = sum(check['passed'] for check in expectations)
    result = {'eval_id': case['eval_id'], 'eval_name': case['id'], 'configuration': variant, 'condition': condition, 'run_number': rep,
              'result': {'pass_rate': passed / len(expectations), 'passed': passed, 'failed': len(expectations) - passed,
                         'total': len(expectations), 'case_passed': passed == len(expectations), 'time_seconds': elapsed,
                         'tokens': usage['total_tokens'], 'tool_calls': len(host.actions), 'errors': int(error is not None)},
              'expectations': expectations, 'usage': usage, 'usage_source': 'provider-response', 'request_ids': request_ids,
              'provider_models': sorted(set(model_ids)), 'turns': turns, 'error': error, 'invalid_attempts': host.invalid}
    directory = out / condition / f'eval-{case["id"]}' / variant / f'run-{rep}'
    (directory / 'outputs').mkdir(parents=True, exist_ok=True)
    (directory / 'eval_metadata.json').write_text(json.dumps({'eval_id': case['eval_id'], 'eval_name': case['id'] + '/' + condition, 'prompt': case['prompt']}, indent=2))
    (directory / 'grading.json').write_text(json.dumps({'expectations': expectations, 'summary': result['result']}, indent=2))
    (directory / 'timing.json').write_text(json.dumps({'total_tokens': usage['total_tokens'], 'total_duration_seconds': elapsed}, indent=2))
    (directory / 'transcript.json').write_text(json.dumps({'messages': messages, 'actions': host.actions, 'result': result}, indent=2))
    (directory / 'outputs/answer.md').write_text(json.dumps(host.finished, indent=2) if host.finished else 'No accepted structured handoff.')
    (directory / 'outputs/actions.json').write_text(json.dumps(host.actions, indent=2))
    return result


def summarize(runs):
    summary = {}
    for variant in ['with_skill', 'without_skill']:
        group = [run['result'] for run in runs if run['configuration'] == variant]
        summary[variant] = {metric: {'mean': statistics.mean(row[metric] for row in group),
            'stddev': statistics.stdev(row[metric] for row in group) if len(group) > 1 else 0,
            'min': min(row[metric] for row in group), 'max': max(row[metric] for row in group)} for metric in ['pass_rate', 'time_seconds', 'tokens']}
        summary[variant]['cases_passed'] = sum(row['case_passed'] for row in group)
        summary[variant]['cases_total'] = len(group)
    return summary


def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--fixtures', type=Path, required=True)
    parser.add_argument('--live', action='store_true'); parser.add_argument('--self-test', action='store_true')
    parser.add_argument('--approval-reference'); parser.add_argument('--out', type=Path)
    parser.add_argument('--repetitions', type=int, default=5); parser.add_argument('--workers', type=int, default=4)
    parser.add_argument('--conditions', choices=['both', 'discovery', 'supplied'], default='both')
    parser.add_argument('--cases', nargs='*'); args = parser.parse_args()
    fixture_data = json.loads(args.fixtures.read_text())
    for relative, expected_hash in fixture_data['program_sources'].items():
        if hashlib.sha256((ROOT / relative).read_bytes()).hexdigest() != expected_hash:
            raise SystemExit('STALE_FIXTURE_PROGRAM_SOURCE:' + relative)
    all_cases = fixture_data['cases']
    cases = [case for case in all_cases if not args.cases or case['id'] in args.cases]
    if not cases:
        parser.error('No selected cases.')
    if args.self_test:
        print(json.dumps({'grader_controls': self_test(cases), 'status': 'passed'})); return
    if not args.live:
        print(json.dumps({'status': 'NOT_RUN', 'reason': 'Explicit live flag and approval required.'})); return
    if not args.approval_reference or not args.out or not 1 <= args.repetitions <= 10 or not 1 <= args.workers <= 4:
        parser.error('Invalid live options.')
    key = os.environ.get('OPENAI_API_KEY') or os.environ.get('openai_api_key')
    if not key:
        raise SystemExit('OPENAI_API_KEY_MISSING')
    if args.out.exists():
        raise SystemExit('OUTPUT_ALREADY_EXISTS')
    args.out.mkdir(parents=True)
    conditions = ['discovery', 'supplied'] if args.conditions == 'both' else [args.conditions]
    references = {variant: {name: (folder / name).read_text() for name in SOURCES if (folder / name).is_file()}
                  for variant, folder in [('with_skill', ROOT), ('without_skill', HERE / 'baseline')]}
    manifests = {variant: {name: hashlib.sha256(text.encode()).hexdigest() for name, text in refs.items()} for variant, refs in references.items()}
    (args.out / 'source-manifests.json').write_text(json.dumps(manifests, indent=2))
    for variant, refs in references.items():
        (args.out / (variant + '-references.json')).write_text(json.dumps(refs, indent=2))
    bundle_manifest = {}
    bundle_paths = [ROOT / 'AGENTS.md', ROOT / 'package.json', ROOT / 'package-lock.json']
    for directory in ['skills', '_refs']:
        bundle_paths.extend(file for file in (ROOT / directory).rglob('*') if file.is_file())
    with tarfile.open(args.out / 'candidate-bundle.tar.gz', 'w:gz') as archive:
        for file in sorted(bundle_paths):
            if file.is_symlink():
                raise ValueError('Symlink bundle source is not supported.')
            relative = file.relative_to(ROOT).as_posix()
            bundle_manifest[relative] = hashlib.sha256(file.read_bytes()).hexdigest()
            archive.add(file, arcname=relative, recursive=False)
    (args.out / 'candidate-bundle-manifest.json').write_text(json.dumps(bundle_manifest, indent=2))
    (args.out / 'tool-surfaces.json').write_text(json.dumps({variant: TOOLS + ([LIFECYCLE_TOOL] if '| `lifecycle-assess` |' in refs.get('skills/shared/workflow/cleanup.md', '') else []) for variant, refs in references.items()}, indent=2))
    (args.out / 'fixtures.json').write_bytes(args.fixtures.read_bytes())
    for filename in ['protocol-benchmark.py', 'benchmark.py', 'benchmark-fixtures.mjs']:
        (args.out / (filename + '.txt')).write_bytes((HERE / filename).read_bytes())
    jobs = [(case, variant, condition, rep) for rep in range(1, args.repetitions + 1) for case in cases for condition in conditions
            for variant in (['with_skill', 'without_skill'] if rep % 2 else ['without_skill', 'with_skill'])]
    runs = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(run_one, job, references, key, args.out) for job in jobs]
        for future in concurrent.futures.as_completed(futures):
            result = future.result(); runs.append(result)
            with (args.out / 'runs.jsonl').open('a') as stream:
                stream.write(json.dumps(result) + '\n')
            print(json.dumps({'completed': len(runs), 'total': len(jobs), 'case': result['eval_name'], 'condition': result['condition'],
                'variant': result['configuration'], 'case_passed': result['result']['case_passed'], 'error': result['error']}), flush=True)
    report = {'metadata': {'skill_name': 'sdcorejs-cleanup', 'executor_model': MODEL, 'runs_per_configuration': args.repetitions,
              'conditions': conditions, 'approval_reference': args.approval_reference, 'protocol_version': 3,
              'comparison_kind': 'installed skill bundle including its declared helper-action capability'},
              'runs': runs, 'run_summary': summarize(runs), 'by_condition': {condition: summarize([run for run in runs if run['condition'] == condition]) for condition in conditions},
              'notes': ['Baseline and candidate receive the same coherent canonical fixture and common host adapter.',
                        'Only the candidate declares the actual new lifecycle-assess action; its tool invokes the real coordinator output. This is a bundle-capability comparison, not a text-only comparison.',
                        'Discovery requires acquisition through tools; supplied receives trusted fixture context initially.',
                        'Shared prerequisite resolution and helper adapters are explicit fixture abstractions, not native production-host evidence.',
                        'Primary implementation is outside this policy evaluation; native retirement tools record intent only.',
                        'Status fidelity is the initial boundary assessment; runtime offer state returned by reassessment is preserved for subsequent reads.',
                        'Tickets are single-use and require adjacent revalidation/retirement tool calls. Elapsed-time expiry and changing external native observations are not simulated.',
                        'Structured completion/status claims are graded; narrative factual consistency requires separate review.',
                        'Original protocol-1 results are retained and not replaced by this experiment.']}
    (args.out / 'benchmark.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report['by_condition']), flush=True)


if __name__ == '__main__':
    main()
