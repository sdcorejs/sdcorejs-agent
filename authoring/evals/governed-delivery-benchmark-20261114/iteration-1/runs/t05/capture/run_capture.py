import json
import os
from pathlib import Path
import shlex
import subprocess
import sys

capture = Path(__file__).resolve().parent
target = capture.parent / 'target'
label, *command = sys.argv[1:]
environment = dict(os.environ, GIT_CONFIG_GLOBAL='/dev/null', GIT_CONFIG_NOSYSTEM='1', GIT_OPTIONAL_LOCKS='0')
result = subprocess.run(command, cwd=target, env=environment, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
output = capture / (label + '.log')
output.write_text(result.stdout)
with (capture / 'commands.jsonl').open('a') as log:
    log.write(json.dumps({'argv': command, 'command': shlex.join(command), 'cwd': str(target), 'exit_code': result.returncode, 'output_file': output.name, 'output': result.stdout}) + '\n')
print(result.stdout, end='')
print('Observed exit code:', result.returncode)
sys.exit(result.returncode)
