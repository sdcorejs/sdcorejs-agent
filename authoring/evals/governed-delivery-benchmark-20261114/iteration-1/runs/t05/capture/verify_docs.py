from pathlib import Path
import hashlib
import json
import re

target = Path.cwd()
capture = target.parent / 'capture'
guide = target / 'docs/operator-guide.md'
technical = target / '.sdcorejs/documentation/technical-docs/order-cancellation/order-cancellation.md'
before = (capture / 'operator-guide.before.md').read_bytes()
assert guide.read_bytes().startswith(before), 'Original human prose must remain byte-for-byte intact'
print('PASS: complete original operator guide preserved byte-for-byte as prefix')
baseline = json.loads((capture / 'baseline-files.json').read_text())
changed = []
for relative, original_hash in baseline.items():
    digest = hashlib.sha256((target / relative).read_bytes()).hexdigest()
    if digest != original_hash:
        changed.append(relative)
assert changed == ['docs/operator-guide.md'], changed
current = {str(p.relative_to(target)) for p in target.rglob('*') if p.is_file() and '.git' not in p.relative_to(target).parts}
added = sorted(current - set(baseline))
assert added == [str(technical.relative_to(target))], added
print('PASS: only authorized operator guide and technical companion changed; source, tests, dependencies and inputs unchanged')
link_count = 0
for doc in (guide, technical):
    body = doc.read_text(encoding='utf-8')
    assert '\ufffd' not in body
    assert all(line.rstrip() == line for line in body.splitlines())
    assert body.endswith('\n')
    assert '![' not in body, 'No screenshot evidence exists'
    for destination in re.findall(r'\[[^\]]+\]\(([^)]+)\)', body):
        resolved = (doc.parent / destination).resolve()
        assert resolved.is_relative_to(target), destination
        assert resolved.is_file(), destination
        link_count += 1
print(f'PASS: all {link_count} local document links resolve inside target; UTF-8, whitespace and screenshot-link checks passed')
body = technical.read_text()
for field in ['artifact_id', 'artifact_kind', 'change_ref', 'source_spec', 'source_plan', 'commit_policy', 'owner', 'repository_id', 'repository_role', 'generated_at', 'git_head', 'source_revision', 'app_revision', 'approved_source']:
    assert re.search(r'^' + field + ': .+', body, re.M), field
assert 'coverage:\n  total: 1\n  met: 0\n  partial: 1\n  missing: 0\n' in body
print('PASS: scoped documentation metadata and conservative approved-only coverage counts present')
for doc in (guide, technical):
    print(json.dumps({'path': str(doc.relative_to(target)), 'sha256': hashlib.sha256(doc.read_bytes()).hexdigest()}))
