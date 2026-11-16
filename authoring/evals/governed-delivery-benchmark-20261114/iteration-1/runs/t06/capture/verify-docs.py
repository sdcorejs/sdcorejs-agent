import hashlib
import json
import re
import subprocess
from pathlib import Path

root = Path('/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t06/target')
capture = root.parent / 'capture'
plan = json.loads((capture / 'documentation-plan.json').read_text())
receipt = json.loads((capture / 'write-receipt.json').read_text())
digest = lambda data: 'sha256:' + hashlib.sha256(data).hexdigest()
guide_path = 'docs/operator-guide.md'
technical_path = plan['technicalPath']
guide = (root / guide_path).read_bytes()
original = (capture / 'operator-guide.before.md').read_bytes()
assert guide.count(original) == 1, 'Original guide bytes were not preserved.'
assert digest(guide) == receipt['guide_hash']
assert digest((root / technical_path).read_bytes()) == receipt['technical_hash']
print('PASS: all original guide bytes preserved, including both human notes and the placeholder.')

for relative, expected in plan['sourceHashes'].items():
    assert digest((root / relative).read_bytes()) == expected, relative
print('PASS: source, tests, dependencies, inputs, README and AGENTS unchanged.')

links = []
for relative in [guide_path, technical_path]:
    text = (root / relative).read_bytes().decode('utf-8', errors='strict')
    assert '\ufffd' not in text
    assert all(line == line.rstrip() for line in text.splitlines()), relative
    assert text.startswith('---\n') and '\n---\n' in text[4:]
    assert 'documentation_profile_version: 1' in text
    assert 'coverage: { status: gap, total: null, met: null, partial: null, missing: null }' in text
    assert 'AC-CANCEL-1' in text and 'AC-NOTIFY-2' in text and 'AC-OLD-3' in text
    assert not re.search(r'!\[[^\]]*\]\(', text), 'Unexpected screenshot claim.'
    for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', text):
        assert not re.match(r'^[a-z]+:', target), 'Unexpected external link.'
        resolved = ((root / relative).parent / target.split('#')[0]).resolve()
        assert resolved.is_relative_to(root.resolve()) and resolved.is_file(), target
        links.append({'source':relative,'target':str(resolved.relative_to(root))})
print('PASS: UTF-8, whitespace, scoped metadata and local Markdown links. No screenshots claimed.')

body = guide.decode().split('### Check whether cancellation is allowed')[1].split('### When the request cannot proceed')[0]
assert 'canCancel' not in body and 'POST /' not in body and 'src/' not in body
assert 'no way to complete a cancellation' in body
assert 'submitted orders cannot be cancelled' in body
print('PASS: operator steps state the implementation limit and exclude technical internals.')

tracked = subprocess.run(['git','diff','--name-only'],cwd=root,capture_output=True,text=True,check=True).stdout.splitlines()
untracked = subprocess.run(['git','ls-files','--others','--exclude-standard'],cwd=root,capture_output=True,text=True,check=True).stdout.splitlines()
staged = subprocess.run(['git','diff','--cached','--name-only'],cwd=root,capture_output=True,text=True,check=True).stdout.splitlines()
assert set(tracked) == {guide_path}, tracked
assert set(untracked) == {technical_path}, untracked
assert staged == [], staged
print('PASS: exactly two scoped documentation artifacts changed; no staging or code changes.')
print(json.dumps({'links':links,'tracked_changes':tracked,'new_files':untracked,'formal_coverage':'gap; null totals','ui':'not applicable; no UI','cancellation_e2e':'not available; no cancellation action'},indent=2))
