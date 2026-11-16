from pathlib import Path
import hashlib
import json

C = Path(__file__).resolve().parent
T = C.parent / 'target'
P = C.parents[2] / 'packs/p17'
reference_paths = [
    '_refs/shared/project-context.md',
    '_refs/shared/runtime-protocols.md',
    '_refs/shared/tasklist.md',
    '_refs/shared/session-authority.md',
    '_refs/shared/project-bootstrap.md',
    '_refs/harness/communication-economy.md',
    '_refs/shared/artifact-lifecycle.md',
    '_refs/shared/explore-convention-actions.md',
    '_refs/shared/project-bootstrap-template.md',
    '_refs/shared/convention-context.md',
    '_refs/shared/system-registry.json',
    '_refs/harness/runtime-policy.mjs',
    '_refs/shared/testing-philosophy.md',
    '_refs/shared/module-e2e-contract.md',
    '_refs/documentation/write-technical-doc.md',
    '_refs/shared/documentation-layout.md',
    '_refs/shared/project-bootstrap.mjs',
    '_refs/documentation/intent.mjs',
]
selected = ['skills/shared/workflow/explore.md', 'skills/orchestration/documentation.md']
frontmatter = sorted(str(p.relative_to(P)) for p in (P / 'skills').rglob('*.md') if p.read_text().startswith('---\n'))
def read_command(paths, result):
    return {'command': 'cat ' + ' '.join(str(p) for p in paths), 'exit_code': 0, 'observed_result': result}
reads = [
    read_command([C.parent / 'prompt.txt'], 'Read the bounded offline task and allowed paths.'),
    read_command([P / 'AGENTS.md'], 'Read pack workflow and dispatch rules.'),
    {'command': "rg --files -g '!node_modules' -g '!package-lock.json' -g '!pnpm-lock.yaml' -g '!yarn.lock' " + str(P) + ' ' + str(T), 'exit_code': 0, 'observed_result': 'Listed only allowed pack and target paths; display was truncated; no sibling or rubric content was read.'},
    {'command': "python3 - <<'PY'\nfrom pathlib import Path\nroot=Path('" + str(P / 'skills') + "')\nfor p in sorted(root.rglob('*.md')):\n    t=p.read_text()\n    if t.startswith('---\\n'):\n        print(str(p)+'\\n---'+t.split('---',2)[1]+'---\\n')\nPY", 'exit_code': 0, 'observed_result': 'Displayed frontmatter of all 25 public skills; selected Explore then Documentation.'},
    read_command([P / '_refs/shared/project-context.md', P / '_refs/shared/runtime-protocols.md', P / '_refs/shared/tasklist.md', T / 'AGENTS.md'], 'Read context, runtime, progress and effective target instruction policy.'),
    read_command([P / selected[0], P / '_refs/shared/session-authority.md', P / '_refs/shared/project-bootstrap.md'], 'Read Explore ownership, session authority and controlled automatic instruction projection; repeated last two refs after display truncation.'),
    read_command([P / '_refs/harness/communication-economy.md', P / '_refs/shared/artifact-lifecycle.md'], 'Read output and artifact lifecycle contracts.'),
    read_command([P / '_refs/shared/project-bootstrap.md', P / '_refs/shared/session-authority.md'], 'Recovered full authority and bootstrap text from previous combined truncated display.'),
    {'command': "python3 - <<'PY'\nfrom pathlib import Path\nroot=Path('" + str(T) + "')\nfor p in sorted(root.rglob('*')):\n    if p.is_file() and '.git' not in p.parts:\n        print('FILE '+str(p.relative_to(root)))\n        print(p.read_text())\nPY", 'exit_code': 0, 'invocations': 2, 'observed_result': 'Read eight small target files; repeated once because combined display was truncated. No inputs or nested instructions existed.'},
    read_command([P / '_refs/shared/explore-convention-actions.md', P / '_refs/shared/project-bootstrap-template.md', P / '_refs/shared/convention-context.md'], 'Read convention sync and bootstrap constraints; did not activate or write a convention registry.'),
    read_command([P / '_refs/shared/system-registry.json', P / '_refs/harness/runtime-policy.mjs'], 'Loaded registry and runtime policy; combined display was truncated. Registry establishes documentation/node tracks, node-general/node-esm profiles and standalone role.'),
    read_command([P / selected[1], P / '_refs/shared/testing-philosophy.md', P / '_refs/shared/module-e2e-contract.md'], 'Read Documentation plus behavior-driven testing and module E2E applicability guidance. Documentation body replayed from tool memory after display truncation.'),
    read_command([P / '_refs/documentation/write-technical-doc.md', P / '_refs/shared/documentation-layout.md'], 'Read technical documentation destination and layout contracts.'),
    read_command([P / '_refs/shared/project-bootstrap.mjs'], 'Inspected fixed managed-block projection and ownership requirements; did not invoke it or assert a cooperative writer contract.'),
    read_command([P / '_refs/documentation/intent.mjs'], 'Read direct documentation intent resolver; later executed it locally.'),
]
artifacts = []
for path in ['AGENTS.md', '.sdcorejs/documentation/technical-docs/engineering-blueprint/engineering-blueprint.md']:
    p = T / path
    artifacts.append({'path': path, 'operation': 'modified' if path == 'AGENTS.md' else 'created', 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'scope': 'explicitly authorized project guidance/blueprint and AGENTS link'})
trace = {
    'task': 'Initialize durable Order Desk engineering blueprint',
    'target_root': str(T), 'pack_root': str(P), 'capture_root': str(C),
    'scope': {'allowed_writes': ['target/AGENTS.md', 'target/.sdcorejs/documentation/technical-docs/engineering-blueprint/engineering-blueprint.md', 'capture/**'], 'application_code_changed': False, 'tests_changed': False, 'dependencies_changed': False, 'package_installs': False, 'outbound_network_used': False, 'external_services_used': False, 'subagents_used': False, 'local_http': 'Only the existing test suite server on 127.0.0.1 with an ephemeral port; closed by test teardown.'},
    'authorization': {'source': 'User task in prompt.txt', 'actor': 'user', 'allowed': 'Write project guidance/blueprint and link from AGENTS.md while preserving manual policy; verify available commands.', 'document_review_performed_by_user': False, 'tenant_model_selected': False, 'tenant_model_approved': False},
    'dispatch': {'selection_basis': 'name/description frontmatter, then selected skill bodies', 'skills_frontmatter_loaded': [str(P / p) for p in frontmatter], 'skills_selected': [str(P / p) for p in selected], 'actions': ['sdcorejs-explore: targeted read-only documentation fact harvest', 'sdcorejs-documentation: write-technical-doc'], 'classification': {'tracks': ['documentation', 'node'], 'stack_profiles': ['node-general', 'node-esm'], 'repository_role': 'standalone', 'repository_id': 'github.com/benchmark-sdcorejs/order-desk', 'source_revision': '91f78ce774bd079c2489ccc714064b0422b3de8f'}, 'bootstrap_disposition': 'No existing convention policy; controlled automatic bootstrap remains disabled. The user-authorized one-time plain AGENTS documentation link was appended without replacing human text or creating a managed block, standing sync authority, or convention registry.'},
    'pack_entrypoints_loaded': [str(P / 'AGENTS.md')],
    'references_loaded': [str(P / p) for p in reference_paths],
    'target_evidence_loaded': ['AGENTS.md', 'README.md', 'package.json', 'src/order.mjs', 'src/server.mjs', 'test/unit.test.mjs', 'test/integration.test.mjs', 'test/e2e.test.mjs'],
    'discovery_and_read_commands': reads,
    'commands': json.loads((C / 'command-records.json').read_text()),
    'verification_environment': {'node': 'v24.22.1', 'npm': '11.9.0', 'npm_config': 'Explicit separate empty user/global config files inside capture; update notifier, audit, and fund disabled; cache inside capture.', 'initial_failure': 'All three first test invocations exited 1 before executing tests because both npm configuration paths were /dev/null. Npm rejects loading the same file as global and user config. Retried with distinct empty files; all suites passed. Both initial and retry output retained.'},
    'artifacts_changed': artifacts,
    'capture_artifacts': sorted(p.name for p in C.iterdir() if p.is_file()),
    'verification_summary': {'unit': {'passed': 2, 'failed': 0}, 'integration_script': {'passed': 2, 'failed': 0, 'limitation': 'Pure canCancel tests, not service-boundary integration evidence.'}, 'e2e': {'passed': 1, 'failed': 0, 'scope': 'Real HTTP success path only.'}, 'git_diff_check': 'passed', 'links': '10 local links validated', 'manual_policy': 'Original AGENTS bytes preserved as exact prefix', 'protected_files': 'All original non-AGENTS files retain baseline SHA-256', 'documentation_checks': 'UTF-8, no replacement/NUL characters, trailing whitespace, final newline, required metadata and exact changed-file allowlist passed'},
    'limitations': ['No tenant authorization model selected, approved, implemented, or tested; D-TENANT-001 remains open.', 'Current integration script contains domain-level tests only.', 'E2E success path only; negative HTTP scenarios are documented as uncovered, not passed.', 'No build, lint, format, typecheck, coverage target, browser UI suite, or deployment check is configured.', 'No source or tests changed to close existing coverage or API-hardening gaps because the user limited writes to documentation/guidance.', 'No managed convention registry or automatic instruction projection enabled; observed patterns remain labeled observations.', 'No Git commit, staging, push, external publication, dependency installation, or maintainer authoring tool used.'],
    'final_response': 'response.md'
}
(C / 'trace.json').write_text(json.dumps(trace, indent=2, ensure_ascii=False) + '\n')
print(json.dumps({'trace': str(C / 'trace.json'), 'command_count': len(trace['commands']), 'changed_target_paths': [a['path'] for a in artifacts]}))
