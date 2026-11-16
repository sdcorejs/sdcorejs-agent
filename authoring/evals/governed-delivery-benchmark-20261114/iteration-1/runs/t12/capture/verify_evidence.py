from pathlib import Path
import hashlib, json, os, subprocess
from datetime import datetime, timezone
ROOT = Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t12/target')
CAP = Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t12/capture')
records = []
def run(args, stem):
    start=datetime.now(timezone.utc).isoformat()
    result=subprocess.run(args, cwd=ROOT, env={**os.environ, 'GIT_OPTIONAL_LOCKS':'0'}, capture_output=True, text=True)
    out=CAP/(stem+'.stdout.txt'); err=CAP/(stem+'.stderr.txt')
    out.write_text(result.stdout); err.write_text(result.stderr)
    records.append(dict(argv=args, cwd=str(ROOT), env_overrides={'GIT_OPTIONAL_LOCKS':'0'}, started_at=start, finished_at=datetime.now(timezone.utc).isoformat(), exit=result.returncode, stdout_path=str(out), stderr_path=str(err), stdout_sha256=hashlib.sha256(result.stdout.encode()).hexdigest(), observed_stdout=result.stdout, observed_stderr=result.stderr))
    print(json.dumps(records[-1]))
    return result.stdout.strip()
head=run(['git','rev-parse','HEAD'], '01-head')
run(['git','status','--porcelain=v1','--untracked-files=all'], '02-status')
run(['git','diff','--no-ext-diff','--no-textconv','--name-only'], '03-worktree-diff')
run(['git','diff','--cached','--no-ext-diff','--no-textconv','--name-only'], '04-index-diff')
run(['git','diff','--check'], '05-diff-check')
run(['node','--version'], '06-node-version')
paths=sorted(p for p in ROOT.rglob('*') if p.is_file() and '.git' not in p.relative_to(ROOT).parts)
manifest={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
(CAP/'review-target-hashes.json').write_text(json.dumps(manifest,indent=2)+'\n')
snapshot=json.loads((ROOT/'inputs/snapshot.json').read_text())
validation=json.loads((ROOT/'inputs/validation.json').read_text())
attachments=[]
for a in snapshot['attachments']:
    candidate=ROOT/a['path']
    within=candidate.resolve().is_relative_to(ROOT.resolve())
    exists=within and candidate.is_file()
    actual_hash=hashlib.sha256(candidate.read_bytes()).hexdigest() if exists else None
    attachments.append({**a,'within_target':within,'exists':exists,'actual_sha256':actual_hash,'hash_verified':actual_hash==a['sha256'] if exists else False,'visually_inspected':False})
checks=dict(associated_HEAD=head,repository_expected=snapshot['owner_repository_id'],repository_observed=validation['repository_id'],repository_matches=validation['repository_id']==snapshot['owner_repository_id'],change_expected=snapshot['change_ref'],change_observed=validation['change_ref'],change_matches=validation['change_ref']==snapshot['change_ref'],revision_expected=snapshot['revision'],revision_observed=validation['ticket_revision'],revision_matches=validation['ticket_revision']==snapshot['revision'],evidence_class=validation['evidence_class'],provided_result=validation['result'],provided_run_id=validation['run_id'],source_revision_binding_present=any(k in validation for k in ['associated_HEAD_or_diff','source_revision','source_sha']),attachments=attachments,summary_exists=(ROOT/'.sdcorejs/summary.md').exists(),convention_policy_exists=(ROOT/'.sdcorejs/conventions/policy.yaml').exists(),target_file_hashes=manifest,tests_executed=False,acceptance_verified=False)
(CAP/'07-evidence-inspection.json').write_text(json.dumps(checks,indent=2)+'\n')
(CAP/'verification-commands.json').write_text(json.dumps(records,indent=2)+'\n')
print(json.dumps(checks,indent=2))
