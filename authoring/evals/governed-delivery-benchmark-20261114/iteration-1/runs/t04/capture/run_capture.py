from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, subprocess, sys

CAP = Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t04/capture')
ROOT = Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t04/target')
name, args = sys.argv[1], sys.argv[3:]
assert sys.argv[2] == '--' and name.replace('-', '').isalnum()
start = datetime.now(timezone.utc).isoformat()
result = subprocess.run(args, cwd=ROOT, text=True, capture_output=True)
output = result.stdout + result.stderr
log = CAP / (name + '.log')
log.write_text(output)
record = {'argv': args, 'cwd': str(ROOT), 'exit_code': result.returncode, 'started_at': start, 'finished_at': datetime.now(timezone.utc).isoformat(), 'output': log.name, 'output_sha256': 'sha256:' + hashlib.sha256(output.encode()).hexdigest()}
records_path = CAP / 'executed-commands.json'
records = json.loads(records_path.read_text()) if records_path.exists() else []
records.append(record)
records_path.write_text(json.dumps(records, indent=2) + '\n')
print(output, end='')
print(json.dumps({'exit_code': result.returncode, 'capture': log.name}))
sys.exit(result.returncode)
