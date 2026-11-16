from pathlib import Path
import hashlib
import json
import re

CAPTURE = Path(__file__).resolve().parent
ROOT = CAPTURE.parent / 'target'
DOC = ROOT / '.sdcorejs/documentation/technical-docs/engineering-blueprint/engineering-blueprint.md'
baseline = json.loads((CAPTURE / 'baseline-files.json').read_text())
current = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest()
           for p in ROOT.rglob('*') if p.is_file() and '.git' not in p.parts}
expected_changes = {'AGENTS.md', str(DOC.relative_to(ROOT))}
changed = {p for p in set(baseline) | set(current) if baseline.get(p) != current.get(p)}
assert changed == expected_changes, changed
assert (ROOT / 'AGENTS.md').read_bytes().startswith((CAPTURE / 'AGENTS.before.md').read_bytes())
assert 'Manual policy: preserve operator terminology and never log customer secrets.' in (ROOT / 'AGENTS.md').read_text()
links = 0
for p in [ROOT / 'AGENTS.md', DOC]:
    content = p.read_text(encoding='utf-8')
    assert '\ufffd' not in content and '\x00' not in content, p
    assert content.endswith('\n'), p
    for number, line in enumerate(content.splitlines(), 1):
        assert line == line.rstrip(), (p, number, 'trailing whitespace')
    for target in re.findall(r'\[[^\]]+\]\(([^)]+)\)', content):
        assert not re.match(r'^[a-zA-Z]+:', target), target
        resolved = (p.parent / target.split('#')[0]).resolve()
        assert resolved.is_relative_to(ROOT), target
        assert resolved.exists(), (p, target)
        links += 1
for key in ['artifact_id', 'artifact_kind', 'change_ref', 'source_spec', 'source_plan',
            'commit_policy', 'owner', 'repository_id', 'repository_role',
            'source_revision', 'app_revision', 'approval_source', 'document_review_performed']:
    assert re.search(r'^' + key + r': .+$', DOC.read_text(), re.M), key
print(json.dumps({'result': 'passed', 'changed_paths': sorted(changed),
                  'manual_policy_preserved': True, 'baseline_source_tests_and_manifest_unchanged': True,
                  'local_links_validated': links, 'utf8_and_whitespace': 'passed',
                  'sha256': {p: current[p] for p in sorted(changed)}}, indent=2))
