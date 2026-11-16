import hashlib, json, os, subprocess
from pathlib import Path
root=Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t12/target')
cap=Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t12/capture')
before=json.loads((cap/'review-target-hashes.json').read_text())
after={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(root.rglob('*')) if p.is_file() and '.git' not in p.relative_to(root).parts}
status=subprocess.run(['git','status','--porcelain=v1','--untracked-files=all'],cwd=root,env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},capture_output=True,text=True)
result={'all_target_files_unchanged':before==after,'target_changed_paths':[k for k in sorted(before.keys() | after.keys()) if before.get(k)!=after.get(k)],'git_status_command':['git','status','--porcelain=v1','--untracked-files=all'],'git_status_cwd':str(root),'git_status_exit':status.returncode,'git_status_stdout':status.stdout,'git_status_stderr':status.stderr,'response_exists':(cap/'response.md').is_file()}
print(json.dumps(result,indent=2))
raise SystemExit(0 if before==after and status.returncode==0 and not status.stdout and result['response_exists'] else 1)
