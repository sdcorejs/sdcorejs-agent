"""Capture immutable trial deltas and prepare an arm-neutral grading packet."""
import hashlib
import json
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/workspace/work/sdcorejs-benchmark-20261114/experiment')
HERE = pathlib.Path(__file__).resolve().parent
DEST = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else HERE / 'iteration-1'

def digest(data):
    return hashlib.sha256(data).hexdigest()

def manifest(root):
    return {str(p.relative_to(root)): digest(p.read_bytes()) for p in sorted(root.rglob('*')) if p.is_file() and '.git' not in p.parts}

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')

experiment = json.loads((ROOT / 'manifest.json').read_text())
if DEST.exists():
    raise SystemExit('Refusing to overwrite captured trial results; select a new output directory')
cases_bytes = (HERE / 'cases.json').read_bytes()
assert digest(cases_bytes) == experiment['cases_sha256'], 'Rubric changed after freeze'
assert digest((HERE / 'setup.py').read_bytes()) == experiment['setup_sha256'], 'Setup changed after freeze'
for label in experiment['pack_map']:
    expected = json.loads((ROOT / f'packs/{label}-manifest.json').read_text())
    assert manifest(ROOT / 'packs' / label) == expected, f'Pack mutated: {label}'

cases = {case['id']:case for case in json.loads(cases_bytes)['cases']}
for trial in experiment['trials']:
    for required in ['response.md', 'trace.json', 'before-manifest.json']:
        assert (pathlib.Path(trial['capture']) / required).is_file(), f'Missing {trial["id"]}/{required}'
packet=[]
for trial in experiment['trials']:
    target, capture = pathlib.Path(trial['target']), pathlib.Path(trial['capture'])
    before=json.loads((capture/'before-manifest.json').read_text())
    assert digest(json.dumps(before, sort_keys=True).encode()) == trial['fixture_manifest_sha256'], f'Initial manifest mutated: {trial["id"]}'
    after=manifest(target)
    delta={'added':sorted(set(after)-set(before)), 'deleted':sorted(set(before)-set(after)), 'modified':sorted(p for p in set(before)&set(after) if before[p]!=after[p])}
    out=DEST/'runs'/trial['id']
    shutil.copytree(capture,out/'capture',dirs_exist_ok=True,
                    ignore=shutil.ignore_patterns('npm-cache', '.npm-cache', '__pycache__'))
    for path in delta['added'] + delta['modified']:
        dest=out/'artifacts'/path
        dest.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(target/path,dest)
    diff=subprocess.check_output(['git','diff','--no-ext-diff','--binary'],cwd=target,text=True)
    (out/'tracked.diff').write_text(diff)
    write(out/'after-manifest.json',after)
    write(out/'delta.json',delta)
    row={'trial_id':trial['id'],'case_id':trial['case'],'prompt':cases[trial['case']]['prompt'],'assertions':cases[trial['case']]['assertions'],'target':str(target),'captured_evidence':str(out),'delta':delta,'response_bytes':(capture/'response.md').stat().st_size,'tokens':None,'provider_tool_calls':None,'provider_turns':None}
    packet.append(row)
write(DEST/'grading-packet.json',{'schema_version':1,'cases_sha256':experiment['cases_sha256'],'trials':packet,'grading':'Judge each fixed assertion pass/fail/not_assessable from observed artifacts, actual command logs and scope. Cite exact evidence. Do not infer arm or reward specific helper/filename usage when rubric only specifies behavior. Agent trace is self-reported, not provider telemetry. Do not infer unseen network absence from provider logs: rely on observed execution and qualify the limit.'})
write(DEST/'experiment.json',experiment)
for label in experiment['pack_map']:
    shutil.copy2(ROOT/f'packs/{label}-manifest.json',DEST/f'{label}-manifest.json')
write(DEST/'capture-manifest.json',manifest(DEST/'runs'))
print(json.dumps({'trials':len(packet),'packet':str(DEST/'grading-packet.json'),'captured_file_count':len(manifest(DEST/'runs'))}))
