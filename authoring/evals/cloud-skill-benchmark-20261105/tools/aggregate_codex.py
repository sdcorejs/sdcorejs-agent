#!/usr/bin/env python3
"""Codex adapter: upstream pass-rate statistics, no fabricated provider telemetry."""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from aggregate_benchmark import calculate_stats


def aggregate(workspace, repetitions=2):
    workspace = Path(workspace)
    results = {'candidate': [], 'baseline': []}
    eval_ids = []
    for evaluation in sorted(workspace.glob('eval-*')):
        meta = json.loads((evaluation / 'eval_metadata.json').read_text())
        eval_ids.append(meta['eval_id'])
        expected = meta['assertions']
        if not expected or len(set(expected)) != len(expected):
            raise ValueError('Missing or duplicate frozen assertions')
        for config in results:
            runs = sorted((evaluation / config).glob('run-*'))
            if len(runs) != repetitions:
                raise ValueError(f'Incomplete repetitions: {evaluation.name}/{config}')
            for run in runs:
                grading = json.loads((run / 'grading.json').read_text())
                checks = grading['expectations']
                if [x['text'] for x in checks] != expected:
                    raise ValueError(f'Assertion mismatch: {run}')
                if not all(type(x['passed']) is bool and isinstance(x['evidence'], str) and x['evidence'].strip() for x in checks):
                    raise ValueError(f'Invalid grading evidence: {run}')
                passed = sum(x['passed'] for x in checks)
                summary = {'passed': passed, 'failed': len(checks)-passed, 'total': len(checks), 'pass_rate': passed/len(checks)}
                if grading['summary'] != summary:
                    raise ValueError(f'Contradictory grading totals: {run}')
                response = run / 'outputs' / 'response.md'
                if not response.is_file() or not response.read_text().strip():
                    raise ValueError(f'Missing substantive output: {run}')
                results[config].append({'eval_id':meta['eval_id'],'configuration':config,'run_number':int(run.name.split('-')[1]),'result':{**summary,'time_seconds':None,'tokens':None,'tool_calls':None,'errors':None},'expectations':checks,'notes':grading.get('user_notes_summary',{}).get('uncertainties',[])})
    if not eval_ids:
        raise ValueError('No evaluations found')
    stats = {config:{'pass_rate':calculate_stats([r['result']['pass_rate'] for r in rows])} for config,rows in results.items()}
    delta = stats['candidate']['pass_rate']['mean']-stats['baseline']['pass_rate']['mean']
    stats['delta']={'pass_rate':f'{delta:+.4f}'}
    return {'metadata':{'skill_name':'sdcorejs-agent-review-followup','executor_model':'Codex native collaboration; exact model revision/effort unexposed','analyzer_model':'independent Codex graders; exact model revision/effort unexposed','timestamp':datetime.now(timezone.utc).isoformat(),'evals_run':eval_ids,'runs_per_configuration':repetitions,'total_runs':sum(map(len,results.values())),'statistics_source':'unmodified Anthropic aggregate_benchmark.calculate_stats','telemetry':'NOT EXPOSED; null is unknown, never zero; output chars are not tokens'},'runs':results['candidate']+results['baseline'],'run_summary':stats,'notes':['Paired source snapshots; two fresh runs per scenario/configuration. Workers can see configuration in their output paths; graders receive masked copies.','Standard deviation is spread across heterogeneous run pass rates, not a confidence interval or causal skill-uplift estimate.','Execution is constrained action selection and editorial output, not target-project implementation or external-effect acceptance.','Provider tokens and duration are unexposed. No speed/cost comparison is reported.']}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('workspace',type=Path)
    parser.add_argument('--repetitions',type=int,default=2)
    args=parser.parse_args()
    result=aggregate(args.workspace,args.repetitions)
    (args.workspace/'benchmark.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'runs':result['metadata']['total_runs'],'summary':result['run_summary']}))

if __name__=='__main__':
    main()
