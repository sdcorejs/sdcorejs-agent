import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';
import { stableRepositoryId } from '../../../_refs/shared/repository-contract.mjs';

const root = new URL('../../../', import.meta.url);
const read = async (path) => (await readFile(new URL(path, root), 'utf8')).replace(/\r\n?/g, '\n');
const hash = (text) => `sha256:${createHash('sha256').update(text).digest('hex')}`;
const historyPath = 'authoring/evals/uiux/records.json';
const integrationPath = 'authoring/evals/uiux/ui-review-integration.json';
const previousPath = 'authoring/evals/uiux/design-handoff-integration.json';
const contractPaths = [
  'test/e2e/uiux-knowledge.test.mjs',
  'test/e2e/uiux-review-regression.test.mjs',
  'test/e2e/uiux-skill-creator-regression.test.mjs',
  'test/e2e/review-contract.test.mjs',
];
const command = `node --test --test-reporter=tap ${contractPaths.join(' ')}`;
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true }).trim();
const atRevision = (revision, file) => execFileSync('git', ['show', `${revision}:${file}`],
  { cwd: root, encoding: 'utf8', windowsHide: true }).replace(/\r\n?/g, '\n');

// Bind the inputs read by the behavior suites: retained source inventory, all
// routed skills, test contracts, and their local static module/data dependencies.
async function currentSourcePaths(record) {
  const skills = (await readdir(new URL('skills/', root), { recursive: true }))
    .map(file => `skills/${String(file).replaceAll('\\', '/')}`).filter(file => file.endsWith('.md'));
  const paths = new Set([...record.final_sources.map(entry => entry.path), ...skills,
    ...contractPaths, '_refs/shared/ui-review.md', '_refs/shared/test-ui-evidence.md',
    '_refs/shared/validation-map.md', '_refs/shared/frontend-architecture.md',
    '_refs/orchestration/tail/repair-loop.md', 'test/e2e/communication-economy.test.mjs',
    'test/e2e/support/test-track-forward-harness.mjs', 'authoring/evals/uiux/evidence.test.mjs', 'package.json', 'package-lock.json']);
  for (const file of paths) {
    if (!file.endsWith('.mjs')) continue;
    const text = await read(file);
    // Parse actual imports; code embedded in fixture strings is not a module input.
    const visit = node => {
      const specifier = ts.isImportDeclaration(node) || ts.isExportDeclaration(node) ? node.moduleSpecifier
        : ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword ? node.arguments[0]
          : ts.isNewExpression(node) && node.expression.getText() === 'URL' ? node.arguments?.[0] : null;
      if (specifier && ts.isStringLiteral(specifier) && specifier.text.startsWith('.')) {
        const dependency = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier.text));
        if (/\.(?:mjs|json)$/.test(dependency)) paths.add(dependency);
      }
      ts.forEachChild(node, visit);
    };
    visit(ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS));
  }
  return [...paths].sort();
}

async function validateCurrentIntegration(record, integration, readSource = read) {
  assert.equal(integration.schema_version, 1);
  assert.equal(integration.change_ref, 'ui-review-contract-20260923');
  assert.equal(integration.evidence_class, 'deterministic-contract');
  assert.equal(integration.previous_integration.path, previousPath);
  assert.equal(hash(await readSource(previousPath)), integration.previous_integration.sha256);
  assert.equal(hash(atRevision(integration.previous_integration.revision, previousPath)), integration.previous_integration.sha256);
  assert.equal(integration.base_record.path, historyPath);
  assert.match(integration.base_record.revision, /^[a-f0-9]{40}$/);
  assert.equal(hash(await readSource(historyPath)), integration.base_record.sha256);
  assert.equal(hash(atRevision(integration.base_record.revision, historyPath)), integration.base_record.sha256);
  assert.equal(integration.owner_repository_id, stableRepositoryId({ remote_url: git('config', '--get', 'remote.origin.url') }));
  assert.equal(integration.cwd, '.');
  assert.equal(integration.content_normalization, 'UTF-8 with LF line endings');
  assert.equal(integration.live_target_project, false);
  assert.equal(integration.live_agent, 'NOT RUN');
  assert.equal(integration.visual, 'NOT RUN');
  assert.equal(integration.tokens, null);
  assert.equal(git('rev-parse', `${integration.source_revision}^{commit}`), integration.source_revision);
  const verification = integration.verification;
  assert.equal(verification.command, command);
  assert.equal(verification.exit_code, 0);
  assert.ok(Number.isFinite(Date.parse(verification.started_at)));
  assert.ok(Date.parse(verification.finished_at) >= Date.parse(verification.started_at));
  assert.equal(hash(verification.transcript), verification.output_sha256);
  assert.ok(Number.isInteger(verification.tests) && verification.tests >= 60);
  const caseIds = ['independence', 'purposes', 'source-limits', 'mockup-denial', 'target-provenance', 'content-staleness', 'missing-baseline', 'aesthetic-advisory', 'conformance-classification', 'observed-read-only', 'narrow-scope', 'real-consumers', 'owner-repair', 'smoke-fixtures', 'legacy-history', 'scope-and-checks'];
  for (const id of caseIds) assert.match(verification.transcript, new RegExp('ok [0-9]+ - case-ui-review-' + id + ':'));
  for (const summary of ['tests ' + verification.tests, 'pass ' + verification.tests, 'fail 0', 'cancelled 0', 'skipped 0', 'todo 0']) {
    assert.match(verification.transcript, new RegExp(`^# ${summary}$`, 'm'));
  }
  const red = integration.baseline_replay;
  assert.equal(red.exit_code, 1);
  assert.equal(hash(red.probe), red.probe_sha256);
  assert.equal(hash(red.transcript), red.output_sha256);
  assert.match(red.transcript, /^# fail 4$/m);
  for (const entry of red.source_manifest) assert.equal(hash(atRevision(red.source_revision, entry.path)), entry.sha256);
  assert.deepEqual(integration.source_manifest.map(entry => entry.path), await currentSourcePaths(record));
  assert.equal(hash(JSON.stringify(integration.source_manifest)), integration.content_fingerprint);
  for (const entry of integration.source_manifest) {
    assert.equal(hash(await readSource(entry.path)), entry.sha256, `current evidence is stale: ${entry.path}`);
  }
}

test('UI/UX authoring evidence binds real baseline, transcripts and current sources', async () => {
  const record = JSON.parse(await read(historyPath));
  const integration = JSON.parse(await read(integrationPath));
  await validateCurrentIntegration(record, integration);
  assert.equal(execFileSync('git', ['rev-parse', `${record.base_revision}^{commit}`], { encoding: 'utf8', windowsHide: true }).trim(), record.base_revision);
  const absent = spawnSync('git', ['cat-file', '-e', `${record.base_revision}:_refs/design/uiux/select-references.mjs`], { windowsHide: true });
  assert.notEqual(absent.status, 0);
  assert.deepEqual(record.phases.map(({ phase }) => phase), ['RED', 'GREEN', 'REFACTOR']);
  const snapshotText = await read(record.green_snapshot.path);
  assert.equal(hash(snapshotText), record.green_snapshot.sha256);
  const snapshot = JSON.parse(snapshotText);
  for (const entry of snapshot.sources) assert.equal(hash(entry.content), entry.sha256, entry.path);
  assert.equal(hash(await read(record.behavior_contract.path)), record.behavior_contract.sha256);
  for (const phase of record.phases) {
    const transcript = await read(phase.transcript.path);
    assert.equal(hash(transcript), phase.transcript.sha256);
    assert.equal(phase.live_target_project, false);
    assert.equal(phase.tokens, null);
    if (phase.phase === 'RED') assert.match(transcript, /ERR_MODULE_NOT_FOUND/);
    else {
      assert.match(transcript, /tests 16/);
      assert.match(transcript, /pass 16/);
      assert.match(transcript, /fail 0/);
    }
  }
  assert.ok(record.refactor_sources.some((entry) => snapshot.sources.find(({ path }) => path === entry.path)?.sha256 !== entry.sha256));
  for (const entry of record.final_sources) {
    assert.equal(hash(atRevision(integration.base_record.revision, entry.path)), entry.sha256, entry.path);
  }
  if (record.visual_offer_integration) {
    const integration = record.visual_offer_integration;
    assert.equal(integration.change_ref, 'visual-companion-offer');
    assert.equal(execFileSync('git', ['rev-parse', `${integration.source_revision}^{commit}`], { encoding: 'utf8', windowsHide: true }).trim(), integration.source_revision);
    for (const entry of integration.previous_final_sources) {
      const historical = execFileSync('git', ['show', `${integration.source_revision}:${entry.path}`], { encoding: 'utf8', windowsHide: true });
      assert.equal(hash(historical.replace(/\r\n?/g, '\n')), entry.sha256, entry.path);
    }
    assert.deepEqual(integration.changed_paths, record.final_sources.filter(entry =>
      integration.previous_final_sources.find(old => old.path === entry.path)?.sha256 !== entry.sha256).map(entry => entry.path));
    const verification = integration.verification;
    assert.equal(verification.exit_code, 0);
    assert.equal(hash(verification.transcript), verification.output_sha256);
    assert.match(verification.transcript, /# tests 25\b/);
    assert.match(verification.transcript, /# pass 25\b/);
    assert.match(verification.transcript, /# fail 0\b/);
    for (const entry of verification.contract_manifest) assert.equal(hash(await read(entry.path)), entry.sha256, entry.path);
  }
  assert.equal(hash(await read(record.post_review.contract.path)), record.post_review.contract.sha256);
  for (const phase of record.post_review.phases) {
    const transcript = await read(phase.transcript.path);
    assert.equal(hash(transcript), phase.transcript.sha256);
    assert.match(transcript, new RegExp(`tests ${phase.tests}`));
    assert.match(transcript, new RegExp(`fail ${phase.failures}`));
  }
  assert.deepEqual(record.skill_creator_repair.finding_ids, ['R1', 'R2', 'R3']);
  assert.equal(hash(await read(record.skill_creator_repair.contract.path)), record.skill_creator_repair.contract.sha256);
  for (const phase of record.skill_creator_repair.phases) {
    const transcript = await read(phase.transcript.path);
    assert.equal(hash(transcript), phase.transcript.sha256);
    assert.match(transcript, new RegExp(`tests ${phase.tests}`));
    assert.match(transcript, new RegExp(`fail ${phase.failures}`));
  }
  assert.equal(record.live_agent.result, 'NOT RUN');
  assert.equal(record.visual.result, 'NOT RUN');
});

test('current UI/UX evidence fails closed for omitted, stale, missing or altered inputs', async () => {
  const record = JSON.parse(await read(historyPath));
  const integration = JSON.parse(await read(integrationPath));
  for (const mutate of [
    value => { value.source_manifest.pop(); value.content_fingerprint = hash(JSON.stringify(value.source_manifest)); },
    value => { value.verification.command = ''; },
    value => { value.verification.exit_code = 1; },
    value => { value.verification.transcript += '\nchanged'; },
    value => { value.verification.transcript = value.verification.transcript.replace('# fail 0', '# fail 1'); value.verification.output_sha256 = hash(value.verification.transcript); },
    value => { value.base_record.sha256 = `sha256:${'0'.repeat(64)}`; },
    value => { value.base_record.revision = '0'.repeat(40); },
    value => { value.owner_repository_id = 'github.com/foreign/repository'; },
    value => { value.cwd = '..'; },
    value => { value.visual = 'PASS'; },
    value => { value.previous_integration.sha256 = 'mutated'; },
    value => { value.baseline_replay.probe += 'changed'; },
  ]) {
    const candidate = structuredClone(integration);
    mutate(candidate);
    await assert.rejects(validateCurrentIntegration(record, candidate));
  }
  const changed = '_refs/shared/design-handoff.md';
  await assert.rejects(validateCurrentIntegration(record, integration, async file =>
    file === changed ? `${await read(file)}\nsource changed at the same HEAD\n` : read(file)), /current evidence is stale/);
  await assert.rejects(validateCurrentIntegration(record, integration, async file => {
    if (file === changed) throw new Error('source missing');
    return read(file);
  }), /source missing/);
  await assert.rejects(validateCurrentIntegration(record, undefined));
});
