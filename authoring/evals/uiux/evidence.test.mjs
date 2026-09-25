import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';
import { parse } from 'yaml';
import { stableRepositoryId } from '../../../_refs/shared/repository-contract.mjs';
import { verifyApprovedArtifactGraph } from '../../../_refs/shared/approved-artifact.mjs';

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
const historicalBlobs = new Map();
const atRevision = (revision, file) => {
  assert.match(revision, /^[a-f0-9]{40}$/u);
  const key = `${revision}:${file}`;
  if (!historicalBlobs.has(key)) historicalBlobs.set(key, execFileSync('git', ['show', key],
    { cwd: root, encoding: 'utf8', windowsHide: true }).replace(/\r\n?/g, '\n'));
  return historicalBlobs.get(key);
};
const historicalSkills = revision => git('ls-tree', '-r', '--name-only', revision, '--', 'skills').split(/\r?\n/u).filter(file => file.endsWith('.md'));

// Bind the inputs read by the behavior suites: retained source inventory, all
// routed skills, test contracts, and their local static module/data dependencies.
async function currentSourcePaths(record, readSource = read, skillPaths = null) {
  const skills = skillPaths ?? (await readdir(new URL('skills/', root), { recursive: true }))
    .map(file => `skills/${String(file).replaceAll('\\', '/')}`).filter(file => file.endsWith('.md'));
  const paths = new Set([...record.final_sources.map(entry => entry.path), ...skills,
    ...contractPaths, '_refs/shared/ui-review.md', '_refs/shared/test-ui-evidence.md',
    '_refs/shared/validation-map.md', '_refs/shared/frontend-architecture.md',
    '_refs/orchestration/tail/repair-loop.md', 'test/e2e/communication-economy.test.mjs',
    'test/e2e/support/test-track-forward-harness.mjs', 'authoring/evals/uiux/evidence.test.mjs', 'package.json', 'package-lock.json']);
  for (const file of paths) {
    if (!file.endsWith('.mjs')) continue;
    const text = await readSource(file);
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

async function validateCurrentIntegration(record, integration, readSource = read, skillPaths = null) {
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
  assert.deepEqual(integration.source_manifest.map(entry => entry.path), await currentSourcePaths(record, readSource, skillPaths));
  assert.equal(hash(JSON.stringify(integration.source_manifest)), integration.content_fingerprint);
  for (const entry of integration.source_manifest) {
    assert.equal(hash(await readSource(entry.path)), entry.sha256, `current evidence is stale: ${entry.path}`);
  }
}

test('UI/UX authoring evidence binds real baseline, transcripts and historical sources', async () => {
  const record = JSON.parse(await read(historyPath));
  const integration = JSON.parse(await read(integrationPath));
  const continuation = JSON.parse(await read(continuationPath));
  const revision = continuation.previous_integration.revision;
  assert.equal(hash(atRevision(revision, integrationPath)), continuation.previous_integration.sha256);
  await validateCurrentIntegration(record, integration, file => atRevision(revision, file), historicalSkills(revision));
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
  const continuation = JSON.parse(await read(continuationPath)), revision = continuation.previous_integration.revision;
  const readHistorical = file => atRevision(revision, file), skills = historicalSkills(revision);
  await validateCurrentIntegration(record, integration, readHistorical, skills);
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
    await assert.rejects(validateCurrentIntegration(record, candidate, readHistorical, skills));
  }
  const changed = '_refs/shared/design-handoff.md';
  await assert.rejects(validateCurrentIntegration(record, integration, async file =>
    file === changed ? `${readHistorical(file)}\nsource changed at the same HEAD\n` : readHistorical(file), skills), /current evidence is stale/);
  await assert.rejects(validateCurrentIntegration(record, integration, async file => {
    if (file === changed) throw new Error('source missing');
    return readHistorical(file);
  }, skills), /source missing/);
  await assert.rejects(validateCurrentIntegration(record, undefined));
});

const continuationPath = 'authoring/evals/interaction-finish-contract.json';
const continuationPlan = '.sdcorejs/plans/workflow/2026-09-24-12-57-interaction-finish-contract-r2.md';
const continuationPlanHash = 'sha256:v1:115d2a72425a4fbd512b2e072c2abe412217df2442d678adbfd191492ce241f3';
const finishTests = ['harness-behavioral-sentinel','communication-economy','skill-pack-runner','parallel-dispatch-protocol',
  'production-readiness-contract','angular-production-contract','nextjs-production-contract','review-contract',
  'repair-contract','ship-readiness-contract','test-track-contract','simplify-skill-contract','visual-offer-policy'].map(name => `test/e2e/${name}.test.mjs`);
const finishCommand = `node --test --test-concurrency=1 ${finishTests.join(' ')}`;
const currentUiCommand = `node --test --test-concurrency=1 --test-reporter=tap ${contractPaths.join(' ')}`;

async function readApproved(file, readSource) {
  const text = await readSource(file), match = text.match(/^---\n([\s\S]*?)\n---\n/u);
  assert.ok(match, 'approved artifact frontmatter is required');
  return { metadata: parse(match[1]), body: text.slice(match[0].length) };
}

async function continuationSources(plan, historical, readSource, recordPath = continuationPath) {
  const canonical = plan.metadata.allowed_paths.filter(file =>
    !/^(?:\.claude\/|plugin\/|codex\/|\.cursor\/)/u.test(file) && !/sdcorejs-harness\.json$/u.test(file) &&
    !file.startsWith('.sdcorejs/') && file !== recordPath && file !== 'VALIDATION.md');
  const skills = (await readdir(new URL('skills/', root), { recursive: true }))
    .map(file => `skills/${String(file).replaceAll('\\', '/')}`).filter(file => file.endsWith('.md'));
  const roots = [...new Set([...canonical, ...skills, ...historical.source_manifest.map(entry => entry.path),
    'authoring/README.md','authoring/skills/sdcorejs-skill-authoring/SKILL.md','authoring/evals/scenarios.json',
    'authoring/evals/skill-authoring-contract.mjs','authoring/evals/run-deterministic.mjs',
    'test/e2e/documentation-layout-contract.test.mjs','test/e2e/skill-authoring-contract.test.mjs',
    'scripts/sync-skills.mjs','.claude/sync-skills.ps1','scripts/check-text-hygiene.mjs','scripts/check-executable-references.mjs',
    'scripts/measure-communication-economy.mjs','package.json','package-lock.json'])].sort();
  const paths = new Set(roots);
  for (const file of paths) {
    if (!file.endsWith('.mjs')) continue;
    const source = await readSource(file);
    const visit = node => {
      const specifier = ts.isImportDeclaration(node) || ts.isExportDeclaration(node) ? node.moduleSpecifier
        : ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword ? node.arguments[0]
          : ts.isNewExpression(node) && node.expression.getText() === 'URL' ? node.arguments?.[0] : null;
      if (specifier && ts.isStringLiteral(specifier) && specifier.text.startsWith('.')) {
        const dependency = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier.text));
        if (/\.(?:mjs|json|md)$/u.test(dependency)) paths.add(dependency);
      }
      ts.forEachChild(node, visit);
    };
    visit(ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS));
  }
  return { roots, paths: [...paths].sort() };
}

function assertRun(run, expectedCommand, prefix, minimum, caseIds) {
  assert.equal(run.command, expectedCommand); assert.equal(run.exit_code, 0);
  assert.equal(hash(run.transcript), run.output_sha256);
  assert.ok(Number.isInteger(run.tests) && run.tests >= minimum);
  assert.equal(run.passed, run.tests); assert.equal(run.failed, 0);
  for (const line of [`tests ${run.tests}`, `pass ${run.tests}`, 'fail 0', 'cancelled 0', 'skipped 0', 'todo 0'])
    assert.ok(run.transcript.split('\n').includes(`${prefix} ${line}`), `missing successful summary: ${line}`);
  for (const id of caseIds) assert.ok(run.transcript.split('\n').some(line =>
    (prefix === '#' ? /^ok \d+ - /u : /^✔ /u).test(line) && line.includes(id)), `missing passing case: ${id}`);
}

async function validateEvidenceContinuation(value, readSource = read) {
  assert.equal(value.schema_version, 1); assert.equal(value.change_ref, 'interaction-finish-contract-20260924');
  assert.equal(value.evidence_class, 'deterministic-contract'); assert.equal(value.cwd, '.');
  assert.equal(value.owner_repository_id, stableRepositoryId({ remote_url: git('config', '--get', 'remote.origin.url') }));
  assert.equal(value.scope_plan, continuationPlan);
  const plan = await readApproved(value.scope_plan, readSource);
  assert.equal(plan.metadata.approval_hash, continuationPlanHash, 'only the actual approved r2 scope is authority');
  const spec = await readApproved(plan.metadata.source_spec, readSource), architecture = await readApproved(plan.metadata.source_architecture, readSource);
  verifyApprovedArtifactGraph(plan, [architecture, spec]);
  assert.equal(plan.metadata.owner_repository_id, value.owner_repository_id);
  assert.equal(plan.metadata.change_ref, value.change_ref);
  assert.equal(value.source_revision, plan.metadata.source_revision);
  assert.equal(git('rev-parse', `${value.source_revision}^{commit}`), value.source_revision);
  assert.equal(value.previous_integration.path, integrationPath);
  assert.equal(value.previous_integration.revision, value.source_revision);
  const historicalText = atRevision(value.previous_integration.revision, integrationPath);
  assert.equal(hash(historicalText), value.previous_integration.sha256);
  assert.equal(hash(await readSource(integrationPath)), value.previous_integration.sha256, 'history must remain immutable');
  const historical = JSON.parse(historicalText), record = JSON.parse(await readSource(historyPath));
  assert.equal(hash(await readSource(historyPath)), historical.base_record.sha256, 'base UI history must remain immutable');
  assert.equal(hash(await readSource(previousPath)), historical.previous_integration.sha256, 'Design history must remain immutable');
  await validateCurrentIntegration(record, historical, file => atRevision(value.source_revision, file), historicalSkills(value.source_revision));
  const expected = await continuationSources(plan, historical, readSource);
  assert.deepEqual(value.source_roots, expected.roots);
  assert.deepEqual(value.source_manifest.map(entry => entry.path), expected.paths);
  assert.equal(hash(JSON.stringify(value.source_manifest)), value.content_fingerprint);
  for (const entry of value.source_manifest) assert.equal(hash(await readSource(entry.path)), entry.sha256, `current continuation is stale: ${entry.path}`);
  assert.equal(value.content_normalization, 'UTF-8 with LF line endings');
  assertRun(value.verification, finishCommand, /^# tests /mu.test(value.verification.transcript) ? '#' : 'ℹ', 28, [
    'native-runtime','native-failure','reply-normalization','separate-approval','ambiguous-gates','reuse-choice','stale-choice',
    'worker-entrypoint','simplify-grant','simplify-owner','repair-recursion','assessment-binding','command-scope','required-phase',
    'hook-boundary','tdd-order','canonical-callers','evidence-order','resolved-small-fix','defer','review-only','integration-owner',
    'skip-review','simplify-semantics','repair-consumer','review-consumer','ship-consumer'].map(id => 'case-interaction-finish-' + id));
  assertRun(value.ui_verification, currentUiCommand, '#', 60, [
    'independence','purposes','source-limits','mockup-denial','target-provenance','content-staleness','missing-baseline','aesthetic-advisory',
    'conformance-classification','observed-read-only','narrow-scope','real-consumers','owner-repair','smoke-fixtures','legacy-history','scope-and-checks'
  ].map(id => 'case-ui-review-' + id + ':'));
  assert.equal(value.ui_verification.source_fingerprint, value.content_fingerprint);
  assert.equal(value.ui_verification.content_stable, true);
  assert.equal(value.ui_verification.interrupted, false);
  assert.equal(value.ui_verification.cwd, '.');
  assert.equal(value.ui_verification.owner_repository_id, value.owner_repository_id);
  assert.ok(Number.isFinite(Date.parse(value.ui_verification.started_at)));
  assert.ok(Date.parse(value.ui_verification.finished_at) >= Date.parse(value.ui_verification.started_at));
  assert.equal(value.verification.source_fingerprint, value.content_fingerprint);
  assert.equal(value.verification.content_stable, true); assert.equal(value.verification.interrupted, false);
  assert.equal(value.verification.cwd, '.'); assert.equal(value.verification.owner_repository_id, value.owner_repository_id);
  assert.equal(value.live_agent, 'NOT RUN'); assert.equal(value.visual, 'NOT RUN');
  assert.equal(value.native_picker_automation, 'NOT RUN'); assert.equal(value.live_target_project, false);
  assert.equal(value.tokens, null); assert.equal(value.provider_calls, 0);
}

// The interaction/finish record is immutable history once its content was committed; the
// skill-body progressive-loading continuation below owns proof for the current tree.
const interactionFinishRevision = 'b6e6c0cfbef80d93a0c90f6dc4e8a02c2d7cbb87';
const interactionFinishRead = async file => atRevision(interactionFinishRevision, file);

test('interaction/finish continuation verifies its committed content separately from historical UI approval', async () => {
  assert.equal(hash(await read(continuationPath)), hash(atRevision(interactionFinishRevision, continuationPath)), 'history must remain immutable');
  const continuation = JSON.parse(await read('authoring/evals/interaction-finish-contract.json'));
  await validateEvidenceContinuation(continuation, interactionFinishRead);
});

test('interaction/finish continuation rejects omitted, stale, mutated and fabricated current evidence', async () => {
  const original = JSON.parse(await read('authoring/evals/interaction-finish-contract.json'));
  await validateEvidenceContinuation(original, interactionFinishRead);
  for (const mutate of [
    value => { value.source_manifest.pop(); value.content_fingerprint = hash(JSON.stringify(value.source_manifest)); },
    value => { value.source_roots.pop(); },
    value => { value.owner_repository_id = 'github.com/foreign/repository'; },
    value => { value.source_revision = 'f'.repeat(40); value.previous_integration.revision = value.source_revision; },
    value => { value.scope_plan = '.sdcorejs/plans/foreign.md'; },
    value => { value.previous_integration.sha256 = 'mutated'; },
    value => { value.verification.command = ''; },
    value => { value.verification.exit_code = 1; },
    value => { value.verification.failed = 1; },
    value => { value.verification.content_stable = false; },
    value => { value.verification.source_fingerprint = 'sha256:' + '0'.repeat(64); },
    value => { value.verification.transcript = ''; value.verification.output_sha256 = hash(''); },
    value => { value.verification.transcript = value.verification.transcript.replace(/([ℹ#]) fail 0/u, '$1 fail 1'); value.verification.output_sha256 = hash(value.verification.transcript); },
    value => { value.verification = null; },
    value => { value.ui_verification = null; },
    value => { value.ui_verification = { ...value.ui_verification, command: '', exit_code: 0 }; },
    value => { value.ui_verification.content_stable = false; },
    value => { value.ui_verification.interrupted = true; },
    value => { value.ui_verification.source_fingerprint = 'sha256:' + '0'.repeat(64); },
    value => { value.ui_verification.owner_repository_id = 'github.com/foreign/repository'; },
    value => { value.ui_verification.exit_code = 1; },
    value => { value.ui_verification.transcript = value.ui_verification.transcript.replace('# fail 0', '# fail 1'); value.ui_verification.output_sha256 = hash(value.ui_verification.transcript); },
    value => { value.ui_verification.transcript = ''; value.ui_verification.output_sha256 = hash(''); },
    value => { value.ui_verification.tests = 0; value.ui_verification.passed = 0; },
    value => { value.visual = 'PASS'; },
  ]) {
    const candidate = structuredClone(original); mutate(candidate);
    await assert.rejects(validateEvidenceContinuation(candidate, interactionFinishRead));
  }
  for (const changed of ['_refs/shared/finish-gate.mjs', '_refs/shared/user-choice-prompt.md', continuationPlan, integrationPath, historyPath, previousPath]) {
    await assert.rejects(validateEvidenceContinuation(original, async file =>
      file === changed ? `${await interactionFinishRead(file)}\nmutated at the same HEAD\n` : interactionFinishRead(file)));
    await assert.rejects(validateEvidenceContinuation(original, async file => {
      if (file === changed) throw new Error('source missing'); return interactionFinishRead(file);
    }), /source missing/);
  }
  await assert.rejects(validateEvidenceContinuation(undefined));
});

const progressivePath = 'authoring/evals/skill-body-progressive-loading.json';
const progressivePlan = '.sdcorejs/plans/workflow/2026-09-25-11-17-skill-body-progressive-loading.md';
const progressivePlanHash = 'sha256:v1:5e1637d40af0a2c9eb2a607ed826981e0e630d14a82fbc55cd3155c8bba13646';
const progressiveTests = ['production-readiness-contract', 'ai-agent-track-contract', 'angular-production-contract', 'architecture-contract',
  'artifact-path-convention', 'communication-economy', 'convention-artifact-lifecycle', 'convention-contract', 'convention-review',
  'convergence-contract', 'decision-coverage-contract', 'design-handoff-contract', 'documentation-layout-contract', 'explore-topology',
  'harness-behavioral-sentinel', 'project-context-artifact-lifecycle', 'review-contract', 'simplify-protected-contract',
  'simplify-skill-contract', 'skill-pack-runner', 'test-track-contract', 'uiux-knowledge', 'uiux-review-regression',
  'visual-offer-policy'].map(name => `test/e2e/${name}.test.mjs`);
const progressiveCommand = `node --test --test-concurrency=1 ${progressiveTests.join(' ')}`;

async function validateProgressiveContinuation(value, readSource = read) {
  assert.equal(value.schema_version, 1); assert.equal(value.change_ref, 'skill-body-progressive-loading-20260925');
  assert.equal(value.evidence_class, 'deterministic-contract'); assert.equal(value.cwd, '.');
  assert.equal(value.owner_repository_id, stableRepositoryId({ remote_url: git('config', '--get', 'remote.origin.url') }));
  assert.equal(value.scope_plan, progressivePlan);
  const plan = await readApproved(value.scope_plan, readSource);
  assert.equal(plan.metadata.approval_hash, progressivePlanHash, 'only the actual approved plan is authority');
  const spec = await readApproved(plan.metadata.source_spec, readSource);
  verifyApprovedArtifactGraph(plan, [spec]);
  assert.equal(plan.metadata.owner_repository_id, value.owner_repository_id);
  assert.equal(plan.metadata.change_ref, value.change_ref);
  assert.equal(value.source_revision, plan.metadata.source_revision);
  assert.equal(git('rev-parse', `${value.source_revision}^{commit}`), value.source_revision);
  assert.equal(value.previous_continuation.path, continuationPath);
  assert.equal(value.previous_continuation.revision, value.source_revision);
  const previousText = atRevision(value.previous_continuation.revision, continuationPath);
  assert.equal(hash(previousText), value.previous_continuation.sha256);
  assert.equal(hash(await readSource(continuationPath)), value.previous_continuation.sha256, 'history must remain immutable');
  const expected = await continuationSources(plan, JSON.parse(previousText), readSource, progressivePath);
  assert.deepEqual(value.source_roots, expected.roots);
  assert.deepEqual(value.source_manifest.map(entry => entry.path), expected.paths);
  assert.equal(hash(JSON.stringify(value.source_manifest)), value.content_fingerprint);
  for (const entry of value.source_manifest) assert.equal(hash(await readSource(entry.path)), entry.sha256, `current continuation is stale: ${entry.path}`);
  assert.equal(value.content_normalization, 'UTF-8 with LF line endings');
  assertRun(value.verification, progressiveCommand, /^# tests /mu.test(value.verification.transcript) ? '#' : 'ℹ', 500, [
    'body-size', 'inventory-routing', 'angular-gates', 'review-boundary', 'design-boundary', 'explore-boundary', 'reference-loading',
    'canonical-owner', 'single-schema', 'test-integrity', 'distribution', 'metrics'].map(id => 'case-progressive-load-' + id));
  assertRun(value.ui_verification, currentUiCommand, '#', 60, [
    'independence','purposes','source-limits','mockup-denial','target-provenance','content-staleness','missing-baseline','aesthetic-advisory',
    'conformance-classification','observed-read-only','narrow-scope','real-consumers','owner-repair','smoke-fixtures','legacy-history','scope-and-checks'
  ].map(id => 'case-ui-review-' + id + ':'));
  for (const run of [value.verification, value.ui_verification]) {
    assert.equal(run.source_fingerprint, value.content_fingerprint);
    assert.equal(run.content_stable, true); assert.equal(run.interrupted, false);
    assert.equal(run.cwd, '.'); assert.equal(run.owner_repository_id, value.owner_repository_id);
    assert.ok(Number.isFinite(Date.parse(run.started_at)));
    assert.ok(Date.parse(run.finished_at) >= Date.parse(run.started_at));
  }
  assert.equal(value.live_agent, 'NOT RUN'); assert.equal(value.visual, 'NOT RUN');
  assert.equal(value.live_target_project, false); assert.equal(value.tokens, null); assert.equal(value.provider_calls, 0);
}

test('case-progressive-load-evidence-continuation: current content is bound to the approved plan and actual runs', async () => {
  await validateProgressiveContinuation(JSON.parse(await read(progressivePath)));
});

test('case-progressive-load-evidence-continuation: omitted, stale, mutated and fabricated evidence is rejected', async () => {
  const original = JSON.parse(await read(progressivePath));
  await validateProgressiveContinuation(original);
  for (const mutate of [
    value => { value.source_manifest.pop(); value.content_fingerprint = hash(JSON.stringify(value.source_manifest)); },
    value => { value.source_roots.pop(); },
    value => { value.owner_repository_id = 'github.com/foreign/repository'; },
    value => { value.source_revision = 'f'.repeat(40); value.previous_continuation.revision = value.source_revision; },
    value => { value.scope_plan = '.sdcorejs/plans/foreign.md'; },
    value => { value.previous_continuation.sha256 = 'mutated'; },
    value => { value.verification.command = ''; },
    value => { value.verification.exit_code = 1; },
    value => { value.verification.failed = 1; },
    value => { value.verification.content_stable = false; },
    value => { value.verification.source_fingerprint = 'sha256:' + '0'.repeat(64); },
    value => { value.verification.transcript = ''; value.verification.output_sha256 = hash(''); },
    value => { value.verification = null; },
    value => { value.ui_verification = null; },
    value => { value.ui_verification.interrupted = true; },
    value => { value.ui_verification.owner_repository_id = 'github.com/foreign/repository'; },
    value => { value.visual = 'PASS'; },
    value => { value.tokens = 1; },
  ]) {
    const candidate = structuredClone(original); mutate(candidate);
    await assert.rejects(validateProgressiveContinuation(candidate));
  }
  for (const changed of ['skills/shared/workflow/review.md', '_refs/review/output-contract.md', progressivePlan, continuationPath]) {
    await assert.rejects(validateProgressiveContinuation(original, async file =>
      file === changed ? `${await read(file)}\nmutated at the same HEAD\n` : read(file)));
    await assert.rejects(validateProgressiveContinuation(original, async file => {
      if (file === changed) throw new Error('source missing'); return read(file);
    }), /source missing/);
  }
  await assert.rejects(validateProgressiveContinuation(undefined));
});
