import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { selectUiuxReferences } from '../../_refs/design/uiux/select-references.mjs';
import { exactVersionCandidates, detectInstalledPackage } from '../../_refs/angular/core-docs-fetch.mjs';
import { evaluateReviewContract } from '../../_refs/shared/review-contract.mjs';
import { resolveDesignHandoffTarget, buildDesignArtifactContext } from '../../_refs/shared/design-handoff.mjs';
import { loadSkillPack, runPromptEval } from './support/skill-pack-runner.mjs';

const root = new URL('../../', import.meta.url);
const pack = await loadSkillPack(root);
const selectionCases = [
  ['sidebar', 'enterprise-portal', 'improve', ['navigation'], ['navigation']],
  ['mobile-table', 'mobile-web', 'design-new', ['table', 'mobile'], ['tables', 'mobile']],
  ['portal-crud', 'enterprise-portal', 'implement', ['table', 'form', 'state'], ['tables', 'forms', 'states']],
  ['landing', 'landing-page', 'design-new', [], ['public-web', 'visual', 'accessibility']],
  ['review', 'dashboard', 'review', ['chart', 'accessibility'], ['charts', 'accessibility']],
  ['focus-fix', 'enterprise-portal', 'fix', ['focus'], ['accessibility']],
  ['spacing-fix', 'enterprise-portal', 'fix', ['spacing'], ['visual']],
];

for (const [id, surface, task, topics, expected] of selectionCases) {
  test(`on-demand reference selection: ${id}`, () => {
    const input = { surface, task, topics };
    const before = structuredClone(input);
    const result = selectUiuxReferences(input);
    assert.equal(result.status, 'matched');
    assert.deepEqual(result.references.map(({ id }) => id), expected);
    assert.deepEqual(input, before, 'selection must not mutate caller scope');
    assert.deepEqual(result.unmatched_topics, []);
  });
}

test('unknown topics and surfaces never manufacture a marketing match', () => {
  for (const input of [
    { surface: 'enterprise-portal', task: 'improve', topics: ['holographic-controls'] },
    { surface: 'unknown-device', task: 'design-new', topics: ['navigation'] },
    { surface: 'enterprise-portal', task: 'fix', topics: [] },
  ]) {
    const result = selectUiuxReferences(input);
    assert.equal(result.status, 'no-match');
    assert.deepEqual(result.references, []);
    assert.match(result.reason, /general guidance/i);
  }
  const partial = selectUiuxReferences({ surface: 'dashboard', task: 'review', topics: ['chart', 'holographic-controls'] });
  assert.equal(partial.status, 'partial-match');
  assert.deepEqual(partial.unmatched_topics, ['holographic-controls']);
  assert.deepEqual(partial.references.map(({ id }) => id), ['charts']);
});

test('Q&A and non-UI work load no knowledge and malformed requests fail closed', () => {
  for (const task of ['qa', 'non-ui']) {
    assert.deepEqual(selectUiuxReferences({ task }).references, []);
    assert.equal(selectUiuxReferences({ task }).status, 'not-applicable');
  }
  for (const input of [null, [], {}, { task: 'auto-build' }, { task: 'review', surface: 'dashboard', topics: 'chart' }]) {
    assert.throws(() => selectUiuxReferences(input), /UI\/UX selection/);
  }
});

test('the catalog has resolvable rule locations and no hidden eager file loading', async () => {
  const catalog = JSON.parse(await readFile(new URL('_refs/design/uiux/catalog.json', root), 'utf8'));
  const ids = new Set();
  for (const entry of catalog.references) {
    assert.ok(!ids.has(entry.id), entry.id);
    ids.add(entry.id);
    assert.match(entry.path, /^_refs\/(design|shared)\/[a-z0-9/.-]+\.md$/);
    assert.ok(!entry.path.includes('..'));
    const source = await readFile(new URL(entry.path, root), 'utf8');
    for (const rule of entry.rule_ids) assert.ok(source.includes(`### ${rule} `), `${entry.path}: ${rule}`);
  }
  const code = await readFile(new URL('_refs/design/uiux/select-references.mjs', root), 'utf8');
  assert.doesNotMatch(code, /fetch\(|https:|child_process|process\.env|writeFile|mkdir/);
});

test('Core UI exact docs selection supports aliases and refuses version guessing', () => {
  for (const name of ['@sdcorejs/angular', '@sd-angular/core']) {
    assert.deepEqual(exactVersionCandidates({ installedPackage: { name, version: '21.0.7' } }), ['21.0.7']);
    assert.throws(() => exactVersionCandidates({ installedPackage: { name, version: '^21.0.7' } }), /exact/);
    assert.throws(() => exactVersionCandidates({ installedPackage: { name, version: '21.0.7' }, version: '22.0.1' }), /conflict/);
  }
  assert.throws(() => exactVersionCandidates({}), /exact/);
  assert.deepEqual(exactVersionCandidates({ version: '22.0.1' }), ['22.0.1']);
});

test('exact-version resolution uses package evidence without stripping ranges or guessing text locks', async () => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'uiux-version-'));
  try {
    for (const name of ['@sdcorejs/angular', '@sd-angular/core']) {
      await writeFile(path.join(fixture, 'package.json'), JSON.stringify({ dependencies: { [name]: '^21.0.7' } }));
      await writeFile(path.join(fixture, 'pnpm-lock.yaml'), `${name}:\n  specifier: ^21.0.7\n  version: 21.0.9\n`);
      assert.throws(() => exactVersionCandidates({ installedPackage: detectInstalledPackage(fixture, { exact: true }) }), /exact/);
      await writeFile(path.join(fixture, 'package-lock.json'), JSON.stringify({ packages: { [`node_modules/${name}`]: { version: '21.0.9' } } }));
      assert.deepEqual(exactVersionCandidates({ installedPackage: detectInstalledPackage(fixture, { exact: true }) }), ['21.0.9']);
      await rm(path.join(fixture, 'package-lock.json'));
      const installed = path.join(fixture, 'node_modules', name);
      await mkdir(installed, { recursive: true });
      await writeFile(path.join(installed, 'package.json'), JSON.stringify({ version: '21.0.10' }));
      assert.deepEqual(exactVersionCandidates({ installedPackage: detectInstalledPackage(fixture, { exact: true }) }), ['21.0.10']);
      await rm(path.join(fixture, 'node_modules'), { recursive: true, force: true });
    }
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test('UI review requires verification, keeps preferences advisory, and forbids writes', () => {
  const finding = {
    id: 'UX-001', kind: 'uiux', severity: 'Important', dimension: 'accessibility',
    repository_id: 'github.com/example/orders', locator: 'src/orders/table.html:24',
    evidence: 'Checkbox has no label in source at line 24; UI was not rendered.',
    impact: 'A selection control has no accessible name.', required_fix: 'Associate the row identity with the checkbox.',
    uiux: { classification: 'accessibility', rule_id: 'UX-A11Y-NAME', evidence_kind: 'source',
      verification: 'Render the table and inspect each checkbox name with the accessibility tree.',
      limitation: 'Keyboard and screen-reader behavior NOT RUN.' },
  };
  const context = { schema_version: 1, subject_track: 'angular', review_profile: 'angular', mode: 'read-only',
    dimensions: ['accessibility'], write_actions: [], reported_findings: [finding] };
  assert.equal(evaluateReviewContract(context).status, 'reviewed');
  for (const mutate of [
    (item) => { delete item.uiux.verification; },
    (item) => { delete item.uiux.limitation; },
    (item) => { item.uiux.classification = 'aesthetic'; },
    (item) => { item.uiux.evidence_kind = 'imagined-render'; },
  ]) {
    const candidate = structuredClone(context);
    mutate(candidate.reported_findings[0]);
    assert.equal(evaluateReviewContract(candidate).status, 'blocked');
  }
  const preference = structuredClone(context);
  preference.dimensions = ['code'];
  Object.assign(preference.reported_findings[0], { severity: 'Info', dimension: 'code' });
  preference.reported_findings[0].uiux.classification = 'aesthetic';
  assert.equal(evaluateReviewContract(preference).status, 'reviewed');
  for (const fields of [{ gate: 'REQUIRED' }, { repair_tier: 'auto' }, { eligible_for_automatic_repair: true }]) {
    const unsafe = structuredClone(preference);
    Object.assign(unsafe.reported_findings[0], fields);
    assert.equal(evaluateReviewContract(unsafe).status, 'blocked');
  }
  for (const dimensions of [['security'], ['accessibility']]) {
    assert.equal(evaluateReviewContract({ ...preference, dimensions }).status, 'blocked');
  }
  const mislabeled = structuredClone(preference);
  mislabeled.dimensions = ['accessibility'];
  mislabeled.reported_findings[0].dimension = 'accessibility';
  assert.equal(evaluateReviewContract(mislabeled).status, 'blocked');
  preference.write_actions = [{ action: 'edit', path: 'src/orders/table.html' }];
  assert.equal(evaluateReviewContract(preference).read_only_proven, false);
});

test('feature decisions use the existing semantic-owner paths and closure', () => {
  const input = { experience_scope: 'module', feature: 'orders', screens: ['list'],
    module: { id: 'orders', repository_id: 'github.com/example/orders', available: true, writable: true },
    portal: { repository_id: 'github.com/example/portal' }, execution_host_repository_id: 'github.com/example/portal' };
  const target = resolveDesignHandoffTarget(input);
  assert.equal(target.owner_repository_id, input.module.repository_id);
  assert.equal(target.decisions_path, '.sdcorejs/design/decisions/orders.md');
  const closure = buildDesignArtifactContext({ feature: 'orders', change_ref: 'uiux-orders' });
  assert.ok(closure.required_with_change.some(({ path }) => path === target.decisions_path));
  assert.ok(closure.required_with_change.some(({ path }) => path === target.ledger_relative_path));
  assert.throws(() => buildDesignArtifactContext({ feature: 'orders', change_ref: 'uiux-orders', documents: ['master'] }), /unknown design document category/);
  for (const flag of ['available', 'writable']) {
    const candidate = structuredClone(input);
    candidate.module[flag] = false;
    const blocked = resolveDesignHandoffTarget(candidate);
    assert.equal(blocked.status, 'blocked');
    assert.notEqual(blocked.owner_repository_id, input.portal.repository_id);
  }
});

test('routing preserves design, implementation, independent review and direct answers', () => {
  const results = runPromptEval(pack, [
    { id: 'sidebar-design', prompt: 'Design a three-level sidebar improvement for an existing Core UI portal; preserve routes and permissions.', expectedSkill: 'sdcorejs-design' },
    { id: 'mobile-cards', prompt: 'Design mobile cards for a data table with selection and row actions.', expectedSkill: 'sdcorejs-design' },
    { id: 'crud-code', prompt: 'sdcorejs-angular implement the approved CRUD plan.', expectedSkill: 'sdcorejs-angular' },
    { id: 'landing', prompt: 'Design a new landing page.', expectedSkill: 'sdcorejs-design' },
    { id: 'ui-review', prompt: 'Review this UI for usability and accessibility; source only, do not modify code.', expectedSkill: 'sdcorejs-review' },
    { id: 'backend', prompt: 'sdcorejs-nestjs implement the approved backend endpoint.', expectedSkill: 'sdcorejs-nestjs' },
    { id: 'qa', prompt: 'What is the difference between a drawer and a dialog?', expectedSkill: null },
  ]);
  assert.deepEqual(results.filter(({ pass }) => !pass), []);
});

test('public inventory is unchanged from the recorded main revision', () => {
  const baseline = execFileSync('git', ['ls-tree', '-r', '--name-only', '4fa58c66bc8b96c3ddcad887403d1eb9cfb5c8f4', 'skills'], { encoding: 'utf8', windowsHide: true });
  const paths = baseline.trim().split('\n').filter((file) => file.endsWith('.md'));
  assert.equal(pack.sourceSkills.length, paths.length);
  assert.ok(!pack.sourceSkills.some(({ name }) => name === 'sdcorejs-uiux'));
});
