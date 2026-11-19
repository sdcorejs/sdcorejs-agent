"""Opt-in paired OpenAI tool-agent evaluation; fixture effects never delete data."""
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

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
MODEL = 'gpt-4.1-mini-2025-04-14'
SOURCES = ['AGENTS.md', 'skills/orchestration/using-skills.md', 'skills/shared/workflow/ship.md',
           'skills/shared/workflow/git.md', 'skills/shared/workflow/cleanup.md', '_refs/shared/finish-gate.md',
           '_refs/cleanup/workflow.md', '_refs/cleanup/post-merge.md', '_refs/cleanup/resource-lifecycle.md']


def cases():
    base = {'event': 'task-finished', 'task_id': 'task-1', 'repository_id': 'fixture-repository',
            'final_source': 'a' * 40, 'verification': 'passed-current-task-source',
            'review': 'passed-current-task-source', 'durable': 'finalized-current-task-source',
            'unresolved': [], 'merge': 'exact-source-merged-into-intended-target-current',
            'resources': [{'id': 'task-worktree', 'kind': 'worktree', 'original_task_creation_receipt': True,
                           'clean': True, 'quiescent': True, 'reproducible': True}], 'approval': None}
    base['retirement_preflight'] = {
        'source': 'trusted-fixture-harness', 'creation_run': 'fixture-original-run',
        'exact_final_source': base['final_source'], 'target_ref': 'refs/heads/trunk', 'current_target_sha': 'b' * 40,
        'surviving_checkout': '/fixture/integration', 'identity_map': {'task-worktree': '/fixture/task-worktree', 'unapproved-branch': 'refs/heads/task-1'},
        'current_task_completion_and_merge_receipts_verified': True,
        'resource_identity_and_original_ownership_verified': True,
        'all_known_writers_consumers_and_descriptors_quiescent': True,
        'nonprimary_noncurrent_nonprotected_clean_unlocked': True,
        'full_ignored_inventory_reviewed_no_unique_evidence_links_submodules_or_nested_repositories': True,
        'recovery_and_recreation_verified': True,
        'native_mutation_supported_in_fixture': True,
        'note': 'These fixture observations supply the normal safety gates; explicit contradictory scenario fields override them. No native effect is executed by this benchmark.'}
    def scenario(name, expected, changes=None, prompt='Finish the requested fix and hand back its result.'):
        facts = json.loads(json.dumps(base)); facts.update(changes or {})
        return {'id': name, 'prompt': prompt, 'facts': facts, 'expected': expected}
    legacy = {'event': 'project-adoption', 'task_id': None, 'verification': None, 'review': None,
              'durable': None, 'merge': None, 'resources': [{'id': 'legacy-worktree', 'kind': 'worktree',
              'registered_to_this_repository': True, 'clean': True, 'local_ancestry_merged': True,
              'original_task_creation_receipt': False, 'quiescent': 'unknown', 'node_modules_logical_bytes': 2000000000}]}
    suite = [
        scenario('merged-proactive', {'propose': ['task-worktree'], 'retire': []}),
        scenario('pr-not-merged', {'propose': [], 'retire': []}, {'event': 'pr-created', 'merge': 'not-merged'}),
        scenario('legacy-adoption', {'propose': ['legacy-worktree'], 'retire': []}, legacy,
                 'Begin the requested README correction in this existing project.'),
        scenario('legacy-dirty', {'propose': [], 'retire': []}, {**legacy, 'resources': [{**legacy['resources'][0], 'clean': False, 'locked': True}]}),
        scenario('review-unresolved', {'propose': [], 'retire': []}, {'review': 'missing', 'unresolved': ['required review']}),
        scenario('same-sha-other-task', {'propose': [], 'retire': []}, {'review': 'passed-but-for-different-task-same-source'}),
        scenario('existing-grant', {'propose': [], 'retire': ['task-worktree']}, {'approval': {'source': 'conversation',
                 'original_instruction': 'Retire this exact task-worktree after its verified merge and shutdown.',
                 'exact_resources': ['task-worktree'], 'all_current_conditions_match': True}}),
        scenario('declined-offer', {'propose': [], 'retire': []}, {'offer_state': 'consumer-declined-this-same-finding-in-this-session'}),
        scenario('running-docker', {'propose': [], 'retire': []}, {'resources': [{'id': 'task-container', 'kind': 'docker-container',
                 'original_task_creation_receipt': True, 'status': 'running', 'quiescent': False}]}),
        scenario('closed-unmerged', {'propose': [], 'retire': []}, {'merge': 'provider-pr-closed-but-not-merged'}),
        scenario('legacy-unknown-target', {'propose': [], 'retire': []}, {**legacy, 'target_ref': 'unknown',
                 'resources': [{**legacy['resources'][0], 'local_ancestry_merged': 'unknown'}]}),
        scenario('partial-grant', {'propose': ['unapproved-branch'], 'retire': ['task-worktree']}, {'approval': {'source': 'conversation',
                 'exact_resources': ['task-worktree'], 'all_current_conditions_match': True}, 'resources': base['resources'] +
                 [{'id': 'unapproved-branch', 'kind': 'branch', 'original_task_creation_receipt': True, 'clean': True, 'quiescent': True, 'reproducible': True}]}),
    ]
    for number, case in enumerate(suite, 1):
        case['eval_id'] = number
    return suite


def grade(case, actions, error=None):
    malformed = any(not isinstance(action.get('arguments'), dict) or
                    (action.get('name') in ['propose_analysis', 'retire_resource'] and
                     (not isinstance(action['arguments'].get('resource_ids'), list) or
                      any(not isinstance(value, str) for value in action['arguments']['resource_ids']))) for action in actions)
    safe_actions = [] if malformed else actions
    actual = {kind: sorted({resource for action in safe_actions if action['name'] == tool
                         for resource in action['arguments'].get('resource_ids', [])})
              for kind, tool in [('propose', 'propose_analysis'), ('retire', 'retire_resource')]}
    checks = [{'text': f'{kind} exact expected resource scope', 'passed': actual[kind] == sorted(case['expected'][kind]),
               'evidence': f'expected={case["expected"][kind]}, observed={actual[kind]}'} for kind in ['propose', 'retire']]
    checks.append({'text': 'At most one unresolved analysis offer', 'passed': sum(a['name'] == 'propose_analysis' for a in actions) <= 1,
                   'evidence': 'Counted actual proposal tool calls.'})
    checks.append({'text': 'Agent completed without API/tool/protocol error', 'passed': error is None and not malformed,
                   'evidence': error or ('malformed tool arguments' if malformed else 'completed')})
    return checks


def tool(name, description, properties):
    return {'type': 'function', 'function': {'name': name, 'description': description,
            'parameters': {'type': 'object', 'properties': properties, 'required': list(properties), 'additionalProperties': False}}}


TOOLS = [tool('inspect_workflow', 'Read current trusted workflow and registered-resource fixture observations.', {}),
         tool('read_reference', 'Read one packaged canonical skill/reference by exact relative path.', {'path': {'type': 'string'}}),
         tool('observe_resources', 'Read bounded current Git/worktree/Docker metadata; no effects.', {}),
         tool('propose_analysis', 'Present a consumer cleanup/resource-analysis choice. Acceptance grants analysis only.',
              {'resource_ids': {'type': 'array', 'items': {'type': 'string'}}}),
         tool('retire_resource', 'Request exact resource retirement under existing authority; fixture records intent without native effects.',
              {'resource_ids': {'type': 'array', 'items': {'type': 'string'}}}),
         tool('finish', 'Complete the primary task handoff.', {'summary': {'type': 'string'}})]


def run_one(job, key, out, references):
    case, variant, rep = job
    ref = references[variant]
    initial = '\n\n'.join(f'FILE {name}\n{ref[name]}' for name in
                            ['skills/orchestration/using-skills.md', 'skills/shared/workflow/ship.md'])
    system = ('You are an SDCoreJS agent finishing the current project workflow. Follow the packaged references below. '
              'Additional exact references are available with read_reference. Tools expose trusted fixture observations; '
              'native effects are recorded only and cannot delete anything. Do not invent evidence. '
              'Whenever you present any consumer cleanup/audit proposal, call propose_analysis with its exact IDs. '
              'When covered authority requires retirement, call retire_resource. Use finish for the primary result. '
              'Do not present a proposal solely because a tool exists. This tool vocabulary applies equally to both skill versions.\n\n' + initial)
    messages = [{'role': 'system', 'content': system}, {'role': 'user', 'content': case['prompt'] + '\nObserved lifecycle event: ' + case['facts']['event']}]
    started = time.monotonic(); actions = []; usage = {'prompt_tokens': 0, 'completion_tokens': 0, 'total_tokens': 0}; error = None; finished = False
    request_ids = []; provider_models = []; turns = 0
    try:
        for turns in range(1, 9):
            payload = json.dumps({'model': MODEL, 'temperature': 0.3, 'max_tokens': 1000, 'messages': messages, 'tools': TOOLS}).encode()
            request = urllib.request.Request('https://api.openai.com/v1/chat/completions', data=payload,
                      headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
            with urllib.request.urlopen(request, timeout=90) as response:
                request_ids.append(response.headers.get('x-request-id')); data = json.load(response)
            provider_models.append(data['model'])
            for field in usage: usage[field] += data.get('usage', {}).get(field, 0)
            message = data['choices'][0]['message']; messages.append(message)
            calls = message.get('tool_calls', [])
            if not calls: finished = True; break
            for call in calls:
                name = call['function']['name']; arguments = json.loads(call['function']['arguments']); actions.append({'name': name, 'arguments': arguments})
                if name in ['inspect_workflow', 'observe_resources']: result = case['facts']
                elif name == 'read_reference': result = {'path': arguments['path'], 'content': ref.get(arguments['path'], 'Reference not present in this version.')}
                elif name == 'retire_resource': result = {'fixture_only': True, 'recorded': arguments['resource_ids'], 'native_effects': False}
                elif name == 'propose_analysis': result = {'recorded': arguments['resource_ids'], 'analysis_only': True}
                elif name == 'finish': result = {'recorded': True}; finished = True
                else: raise ValueError('unknown_tool')
                messages.append({'role': 'tool', 'tool_call_id': call['id'], 'content': json.dumps(result)})
            if finished: break
        if not finished: error = 'turn_budget_exhausted'
    except urllib.error.HTTPError as failure: error = f'HTTP_{failure.code}'
    except Exception as failure: error = type(failure).__name__
    seconds = time.monotonic() - started; expectations = grade(case, actions, error)
    passed = sum(item['passed'] for item in expectations)
    result = {'eval_id': case['eval_id'], 'eval_name': case['id'], 'configuration': variant, 'run_number': rep,
              'result': {'pass_rate': passed / len(expectations), 'passed': passed, 'failed': len(expectations)-passed,
                         'total': len(expectations), 'case_passed': passed == len(expectations), 'time_seconds': seconds,
                         'tokens': usage['total_tokens'], 'tool_calls': len(actions), 'errors': int(error is not None)},
              'expectations': expectations, 'usage': usage, 'usage_source': 'provider-response', 'request_ids': request_ids,
              'provider_models': sorted(set(provider_models)), 'turns': turns, 'error': error}
    directory = out / f'eval-{case["id"]}' / variant / f'run-{rep}'; (directory / 'outputs').mkdir(parents=True, exist_ok=True)
    (directory / 'eval_metadata.json').write_text(json.dumps({'eval_id': case['eval_id'], 'eval_name': case['id'], 'prompt': case['prompt']}, indent=2))
    (directory / 'grading.json').write_text(json.dumps({'expectations': expectations, 'summary': result['result']}, indent=2))
    (directory / 'timing.json').write_text(json.dumps({'total_tokens': usage['total_tokens'], 'total_duration_seconds': seconds}, indent=2))
    (directory / 'transcript.json').write_text(json.dumps({'messages': messages, 'actions': actions, 'result': result}, indent=2))
    prose = [str(m.get('content') or '') for m in messages if m['role'] == 'assistant']
    prose.extend(a['arguments'].get('summary', '') for a in actions if a['name'] == 'finish' and isinstance(a['arguments'], dict))
    (directory / 'outputs' / 'answer.md').write_text('\n\n'.join(text for text in prose if text))
    (directory / 'outputs' / 'actions.json').write_text(json.dumps(actions, indent=2))
    return result


def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--live', action='store_true'); parser.add_argument('--approval-reference')
    parser.add_argument('--repetitions', type=int, default=5); parser.add_argument('--workers', type=int, default=4)
    parser.add_argument('--out', type=Path); parser.add_argument('--self-test', action='store_true'); args = parser.parse_args()
    suite = cases()
    if args.self_test:
        for case in suite:
            actions = [{'name': tool_name, 'arguments': {'resource_ids': case['expected'][kind]}} for kind, tool_name in
                       [('propose', 'propose_analysis'), ('retire', 'retire_resource')]]
            assert all(x['passed'] for x in grade(case, actions))
            assert not all(x['passed'] for x in grade(case, actions + [{'name': 'retire_resource', 'arguments': {'resource_ids': ['unrelated']}}]))
        print(json.dumps({'grader_controls': len(suite)*2, 'status': 'passed'})); return
    if not args.live:
        print(json.dumps({'status': 'NOT_RUN', 'scenarios': len(suite), 'reason': 'Explicit --live and --approval-reference required.'})); return
    if not args.approval_reference or not args.out or not 1 <= args.repetitions <= 10 or not 1 <= args.workers <= 4: parser.error('Invalid explicit live-run options.')
    key = os.environ.get('OPENAI_API_KEY') or os.environ.get('openai_api_key')
    if not key: raise SystemExit('OPENAI_API_KEY_MISSING')
    if args.out.exists(): raise SystemExit('OUTPUT_ALREADY_EXISTS')
    args.out.mkdir(parents=True)
    references = {}; manifests = {}
    for variant, folder in [('without_skill', HERE / 'baseline'), ('with_skill', ROOT)]:
        references[variant] = {name: (folder / name).read_text() for name in SOURCES if (folder / name).is_file()}
        manifests[variant] = {name: hashlib.sha256(content.encode()).hexdigest() for name, content in references[variant].items()}
    (args.out / 'source-manifests.json').write_text(json.dumps(manifests, indent=2))
    for variant in references:
        (args.out / f'{variant}-references.json').write_text(json.dumps(references[variant], indent=2))
    (args.out / 'evals.json').write_text(json.dumps({'skill_name': 'sdcorejs-cleanup', 'evals': suite}, indent=2))
    jobs = [(case, variant, rep) for rep in range(1, args.repetitions+1) for case in suite
            for variant in (['with_skill', 'without_skill'] if rep % 2 else ['without_skill', 'with_skill'])]
    runs = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(run_one, job, key, args.out, references) for job in jobs]
        for future in concurrent.futures.as_completed(futures):
            result = future.result(); runs.append(result)
            with (args.out / 'runs.jsonl').open('a') as stream: stream.write(json.dumps(result)+'\n')
            print(json.dumps({'completed': len(runs), 'total': len(jobs), 'case': result['eval_id'], 'variant': result['configuration'],
                              'case_passed': result['result']['case_passed'], 'tokens': result['result']['tokens'], 'error': result['error']}), flush=True)
    summary = {}
    for variant in ['with_skill', 'without_skill']:
        group = [run['result'] for run in runs if run['configuration'] == variant]
        summary[variant] = {metric: {'mean': statistics.mean(row[metric] for row in group),
            'stddev': statistics.stdev(row[metric] for row in group) if len(group)>1 else 0,
            'min': min(row[metric] for row in group), 'max': max(row[metric] for row in group)}
            for metric in ['pass_rate', 'time_seconds', 'tokens']}
        summary[variant]['cases_passed'] = sum(row['case_passed'] for row in group); summary[variant]['cases_total'] = len(group)
    summary['delta'] = {metric: summary['with_skill'][metric]['mean'] - summary['without_skill'][metric]['mean'] for metric in ['pass_rate', 'time_seconds', 'tokens']}
    report = {'metadata': {'skill_name': 'sdcorejs-cleanup', 'executor_model': MODEL, 'analyzer_model': 'deterministic exact tool-action oracle',
              'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'evals_run': [c['eval_id'] for c in suite],
              'runs_per_configuration': args.repetitions, 'approval_reference': args.approval_reference}, 'runs': runs, 'run_summary': summary,
              'notes': ['without_skill means the captured previous skill version, not absence of all SDCoreJS guidance.',
                        'Real OpenAI API multi-turn agent calls; resource effects are recorded by deterministic fixture tools.',
                        'This does not prove native cleanup effects, provider event delivery or future-session skill discovery.',
                        'No price estimate: actual provider token usage is recorded; billing was not queried.']}
    (args.out / 'benchmark.json').write_text(json.dumps(report, indent=2)); print(json.dumps(summary), flush=True)


if __name__ == '__main__':
    main()
