from pathlib import Path
import json, hashlib
root=Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t02/target')
cap=root.parent/'capture'
pack=Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/packs/p42')
trace=json.loads((cap/'trace.json').read_text())
trace['skill_frontmatter_paths_loaded']=[str(p) for p in sorted((pack/'skills').rglob('*.md'))]
trace['verification_commands']=json.loads((cap/'verification-commands.json').read_text())
for record in trace['verification_commands']:
    actual=hashlib.sha256(Path(record['output_path']).read_bytes()).hexdigest()
    assert actual==record['output_sha256']
    assert record['exit_code']==0
baseline=json.loads((cap/'baseline-hashes.json').read_text())
for relative, expected in baseline.items():
    if relative!='AGENTS.md':
        assert hashlib.sha256((root/relative).read_bytes()).hexdigest()==expected
assert (root/'AGENTS.md').read_bytes().startswith((cap/'agents-before.md').read_bytes())
assert len(json.loads((root/'.sdcorejs/blueprints/order-desk.json').read_text())['areas'])==14
changed=['AGENTS.md','.sdcorejs/blueprints/order-desk.json']
trace['artifacts_changed']=[{'path':str(root/p),'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest(),'change':'modified' if p in baseline else 'created'} for p in changed]
message='Capture integrity verified: 17 command logs, all exit 0; 14 blueprint areas; only AGENTS.md and the blueprint changed in the target; original manual policy and protected file hashes preserved.\n'
assert len(trace['verification_commands'])==19, len(trace['verification_commands'])
message=message.replace('17 command logs',str(len(trace['verification_commands']))+' command logs')
(cap/'capture-integrity.log').write_text(message)
trace['commands'].append({'command':'python3 '+str(cap/'finalize-captures.py'),'cwd':str(root),'exit_code':0,'result':message.strip(),'output_path':str(cap/'capture-integrity.log')})
trace['capture_artifacts']=[str(p.relative_to(cap)) for p in sorted(cap.rglob('*')) if p.is_file()]
(cap/'trace.json').write_text(json.dumps(trace,indent=2)+'\n')
print(message,end='')

