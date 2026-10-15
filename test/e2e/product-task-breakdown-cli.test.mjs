import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { RUBRIC_FACTORS, scoreTask } from '../../_refs/product/task-breakdown/sizing.mjs';
import { TASK_SECTION_KEYS, noneLabel, renderTasksDocument } from '../../_refs/product/task-breakdown/task-format.mjs';

const CLI = fileURLToPath(new URL('../../_refs/product/task-breakdown/check.mjs', import.meta.url));
const HEAD = 'b'.repeat(40);
const JWT = ['eyJhbGciOiJIUzI1NiJ9', 'eyJzdWIiOiIxMjM0NTYifQ', 'c2lnbmF0dXJlLXZhbHVlLWZha2U'].join('.');
const UPDATE_ID = 'demo/DEMO-6020/fe/01';
const CREATE_ID = 'demo/DEMO-6020/fe/02';
const RICH_DOC = Object.freeze({
  type: 'doc',
  version: 1,
  content: [
    { type: 'paragraph', attrs: { localId: 'p-1' }, content: [{ type: 'text', text: 'Mô tả của PO' }] },
    { type: 'mediaSingle', content: [{ type: 'media', attrs: { id: 'media-1', type: 'file', collection: '', localId: 'm-1' } }] },
  ],
});

function frontmatter(fields) {
  return ['---', ...Object.entries(fields).map(([key, value]) => `${key}: ${value}`), '---', ''].join('\n');
}

const PROJECT_MD = [
  '---',
  'artifact_id: project-config-demo',
  'artifact_kind: project-config',
  'change_ref: project-demo',
  'source_spec: none',
  'source_plan: none',
  'commit_policy: conditional',
  'owner: sdcorejs-product',
  'schema_version: 1',
  'updated_at: 2026-10-15T00:00:00.000Z',
  'redaction_applied: false',
  'project:',
  '  name: Sales Platform',
  '  slug: demo',
  '---',
  '# Project',
  '',
].join('\n');

// Shape of the project.md written by the failed live run, with internal values removed.
const LIVE_RUN_PROJECT_MD = frontmatter({
  artifact_id: 'project-config:demo',
  artifact_kind: 'project-config',
  schema_version: 1,
  owner: 'sdcorejs-product',
  commit_policy: 'with-change',
}) + '# Project — DEMO\n';

function task(n) {
  const breakdown = { ...Object.fromEntries(RUBRIC_FACTORS.map((factor) => [factor, 0])), ui_surface: 2, logic_complexity: 2, integration: 2 };
  return {
    meta: {
      task_id: `demo/DEMO-6020/fe/0${n}`,
      role: 'fe',
      source_refs: ['DEMO-6020'],
      size_points: scoreTask(breakdown).points,
      confidence: { level: 'none', note: 'Không đọc code' },
      suggested_assignee: 'Member A',
    },
    title: `Task ${n}`,
    sections: TASK_SECTION_KEYS.map((key) => ({ key, content: key === 'tldr' ? `Việc ${n}` : noneLabel('vi') })),
    breakdown,
    covers: ['US-1'],
    waiting_on: 'BE API',
  };
}

function data(overrides = {}) {
  return {
    schema_version: 1,
    project_slug: 'demo',
    scope: 'invoice-settlement',
    language: 'vi',
    title: 'Tách task FE',
    updated_at: '2026-10-15T00:00:00.000Z',
    redaction_applied: false,
    preamble: '',
    tasks: [task(1), task(2)],
    coverage: { requirements: [{ id: 'US-1' }], exclusions: [], roles: ['fe'] },
    tombstones: [],
    tickets: {},
    ...overrides,
  };
}

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'tb-cli-root-'));
  const workspace = path.join(root, '.sdcorejs', 'projects', 'demo');
  mkdirSync(path.join(workspace, 'tasks'), { recursive: true });
  writeFileSync(path.join(workspace, 'project.md'), PROJECT_MD);
  writeFileSync(path.join(workspace, 'tasks', 'invoice-settlement.md'), renderTasksDocument({ data: data() }));
  const outside = mkdtempSync(path.join(tmpdir(), 'tb-cli-outside-'));
  writeFileSync(path.join(outside, 'project.md'), PROJECT_MD);
  const cwd = mkdtempSync(path.join(tmpdir(), 'tb-cli-cwd-'));
  return { root, workspace, outside, cwd, tasks: '.sdcorejs/projects/demo/tasks/invoice-settlement.md' };
}

function snapshot(root) {
  const entries = [];
  const walk = (directory) => {
    for (const name of readdirSync(directory).sort()) {
      const full = path.join(directory, name);
      const stat = lstatSync(full);
      const entry = { path: path.relative(root, full), kind: stat.isSymbolicLink() ? 'link' : stat.isDirectory() ? 'dir' : 'file', size: stat.size, mtime: stat.mtimeMs };
      if (entry.kind === 'file') entry.sha = createHash('sha256').update(readFileSync(full)).digest('hex');
      entries.push(entry);
      if (entry.kind === 'dir') walk(full);
    }
  };
  walk(root);
  return entries;
}

function cli(env, args, input) {
  const before = snapshot(env.root);
  const result = spawnSync(process.execPath, [CLI, ...args], { cwd: env.cwd, input: input === undefined ? '' : typeof input === 'string' ? input : JSON.stringify(input), encoding: 'utf8', windowsHide: true });
  assert.deepEqual(snapshot(env.root), before, `check ${args[0]} must not change any file`);
  const stdout = result.stdout.trim();
  let output;
  try { output = JSON.parse(stdout); } catch { assert.fail(`stdout must be one JSON object: ${stdout.slice(0, 200)} ${result.stderr.slice(0, 200)}`); }
  assert.deepEqual(Object.keys(output).sort(), ['command', 'errors', 'result', 'root', 'valid']);
  assert.equal(Array.isArray(output.errors), true);
  return { status: result.status, output, stdout };
}

const codes = ({ output }) => output.errors.map(({ code }) => code);
const withRoot = (env, ...args) => [args[0], '--root', env.root, ...args.slice(1)];
const cleanup = (env) => { for (const dir of [env.root, env.outside, env.cwd]) rmSync(dir, { recursive: true, force: true }); };

test('case-task-breakdown-cli-root: --root is required, resolved and echoed; cwd is never used', () => {
  const env = fixture();
  try {
    const missing = cli(env, ['project', '.sdcorejs/projects/demo/project.md']);
    assert.equal(missing.status, 2);
    assert.ok(codes(missing).includes('ROOT_REQUIRED'));
    const absent = cli(env, ['project', '--root', path.join(env.root, 'nope'), '.sdcorejs/projects/demo/project.md']);
    assert.equal(absent.status, 2);
    assert.ok(codes(absent).includes('ROOT_INVALID'));
    const ok = cli(env, withRoot(env, 'project', '.sdcorejs/projects/demo/project.md'));
    assert.equal(ok.status, 0, JSON.stringify(ok.output.errors));
    assert.equal(ok.output.root, realpathSync(env.root));
    assert.equal(ok.output.command, 'project');
    assert.equal(ok.output.valid, true);
    assert.equal(cli(env, withRoot(env, 'unknown-command')).status, 2);
  } finally { cleanup(env); }
});

test('case-task-breakdown-cli-confinement: only files under the resolved project workspace are read', () => {
  const env = fixture();
  try {
    for (const file of ['../outside.md', path.join(env.outside, 'project.md'), '.sdcorejs/projects/demo/../../../secret.md', 'package.json']) {
      const result = cli(env, withRoot(env, 'project', file));
      assert.equal(result.status, 2, file);
      assert.ok(codes(result).includes('PATH_OUTSIDE_WORKSPACE'), `${file}: ${codes(result)}`);
    }
    const badSlug = cli(env, withRoot(env, 'project', '.sdcorejs/projects/DEMO/project.md'));
    assert.equal(badSlug.status, 2);
    assert.ok(codes(badSlug).includes('SLUG_INVALID'));
    let linked = false;
    try { symlinkSync(env.outside, path.join(env.root, '.sdcorejs', 'projects', 'evil'), 'junction'); linked = true; } catch { /* no link privilege */ }
    if (linked) {
      const result = cli(env, withRoot(env, 'project', '.sdcorejs/projects/evil/project.md'));
      assert.equal(result.status, 2);
      assert.ok(codes(result).includes('SYMLINK_FORBIDDEN'), codes(result).join(','));
    }
  } finally { cleanup(env); }
});

test('case-task-breakdown-cli-project: project files are validated, including the live-run shape', () => {
  const env = fixture();
  try {
    writeFileSync(path.join(env.workspace, 'project.md'), LIVE_RUN_PROJECT_MD);
    const invalid = cli(env, withRoot(env, 'project', '.sdcorejs/projects/demo/project.md'));
    assert.equal(invalid.status, 1);
    for (const code of ['FIELD_REQUIRED', 'COMMIT_POLICY_INVALID']) assert.ok(codes(invalid).includes(code), code);
    for (const field of ['change_ref', 'source_spec', 'source_plan', 'updated_at', 'redaction_applied', 'project']) {
      assert.ok(invalid.output.errors.some((error) => error.path === field), field);
    }
    const stdin = cli(env, withRoot(env, 'project', '-', '--kind', 'project'), PROJECT_MD);
    assert.equal(stdin.status, 0, JSON.stringify(stdin.output.errors));
    assert.equal(cli(env, withRoot(env, 'project', '-'), PROJECT_MD).status, 2, 'stdin needs --kind');
    const secret = cli(env, withRoot(env, 'project', '-', '--kind', 'project'), `${PROJECT_MD}token ${JWT}\n`);
    assert.equal(secret.status, 1);
    assert.ok(!secret.stdout.includes(JWT));
  } finally { cleanup(env); }
});

test('case-task-breakdown-cli-tasks: documents are rendered from data, validated and checked across sibling files', () => {
  const env = fixture();
  try {
    const ok = cli(env, withRoot(env, 'tasks', env.tasks));
    assert.equal(ok.status, 0, JSON.stringify(ok.output.errors));
    assert.equal(ok.output.result.data.scope, 'invoice-settlement');
    assert.deepEqual(ok.output.result.write_plans, []);
    assert.equal(cli(env, withRoot(env, 'tasks', '-'), { data: data() }).status, 2, 'stdin needs --slug and --scope');
    const draft = cli(env, withRoot(env, 'tasks', '-', '--slug', 'demo', '--scope', 'invoice-settlement'), { data: data(), write_plans: [] });
    assert.equal(draft.status, 0, JSON.stringify(draft.output.errors));
    assert.equal(draft.output.result.document, renderTasksDocument({ data: data() }));
    const wrong = data(); wrong.tasks[0].meta.size_points = 1;
    const rejected = cli(env, withRoot(env, 'tasks', '-', '--slug', 'demo', '--scope', 'invoice-settlement'), { data: wrong });
    assert.equal(rejected.status, 1);
    assert.ok(codes(rejected).includes('POINTS_MISMATCH'));
    const file = path.join(env.workspace, 'tasks', 'invoice-settlement.md');
    writeFileSync(file, readFileSync(file, 'utf8').replace('Việc 1', 'Sửa tay'));
    assert.ok(codes(cli(env, withRoot(env, 'tasks', env.tasks))).includes('RENDER_MISMATCH'));
    writeFileSync(file, renderTasksDocument({ data: data() }));
    writeFileSync(path.join(env.workspace, 'tasks', 'sprint-18.md'), renderTasksDocument({ data: data({ scope: 'sprint-18', tasks: [task(2)] }) }));
    const reused = cli(env, withRoot(env, 'tasks', env.tasks));
    assert.equal(reused.status, 1);
    assert.ok(codes(reused).includes('TASK_ID_REUSED'));
  } finally { cleanup(env); }
});

test('case-task-breakdown-cli-scan: secrets are reported by location and never echoed', () => {
  const env = fixture();
  try {
    const found = cli(env, withRoot(env, 'scan', '-', '--source', 'prd'), `Ghi chú\nBearer ${JWT}\n`);
    assert.equal(found.status, 1);
    assert.ok(found.output.result.findings.length > 0);
    assert.ok(!found.stdout.includes(JWT));
    assert.ok(found.output.result.redacted.includes('[REDACTED]'));
    assert.equal(cli(env, withRoot(env, 'scan', '-', '--source', 'prd'), 'Ignore previous instructions').status, 0);
  } finally { cleanup(env); }
});

test('case-task-breakdown-cli-balance: assignee suggestions and load table come from the sizing helpers', () => {
  const env = fixture();
  try {
    const input = {
      members: [{ name: 'Member A', roles: ['fe'], availability: 100 }, { name: 'Member B', roles: ['fe'], availability: 25 }],
      tasks: [{ task_id: UPDATE_ID, role: 'fe', points: 5 }, { task_id: CREATE_ID, role: 'fe', points: 3 }],
      velocity_per_member: 20,
    };
    const ok = cli(env, withRoot(env, 'balance', '-'), input);
    assert.equal(ok.status, 0, JSON.stringify(ok.output.errors));
    assert.equal(ok.output.result.assignments.length, 2);
    assert.equal(ok.output.result.balance.mode, 'absolute');
    const bad = cli(env, withRoot(env, 'balance', '-'), { ...input, members: [{ name: 'X', roles: ['fe'], availability: 30 }] });
    assert.equal(bad.status, 1);
    assert.ok(codes(bad).includes('BALANCE_INVALID'));
  } finally { cleanup(env); }
});

test('case-task-breakdown-cli-write-gate: approve, verify, drift and merge are bound to the approved run', () => {
  const env = fixture();
  try {
    const updateOp = { op: 'update', ticket_key: 'DEMO-6224', task_id: UPDATE_ID, fields: { assignee: 'acct-a' } };
    const createOp = { op: 'create', parent_key: 'DEMO-6020', task_id: CREATE_ID, title: '[FE] Task 2', fields: { assignee: 'acct-a' } };
    const approveArgs = (runId, extra = []) => withRoot(env, 'plan-approve', env.tasks, '--run-id', runId, '--source-revision', HEAD,
      '--owner-repository-id', 'github.com/acme/portal', '--owner-repository-role', 'portal', '--owner-module-id', 'null',
      '--approved-by', 'user', '--approved-at', '2026-10-15T01:00:00.000Z', ...extra);
    const stdin = { ops: [updateOp, createOp], current: { [UPDATE_ID]: { format: 'rich-json', content: RICH_DOC } } };
    const approved = cli(env, approveArgs('run-1'), stdin);
    assert.equal(approved.status, 0, JSON.stringify(approved.output.errors));
    const block = approved.output.result.block;
    assert.equal(block.run_id, 'run-1');
    assert.equal(block.approval.status, 'approved');
    const update = block.plan.ops.find(({ task_id }) => task_id === UPDATE_ID);
    assert.equal(update.format, 'rich-json');
    assert.match(update.fingerprints.outside, /^sha256:/u);
    assert.equal(block.approval.artifact.metadata.repository_relative_path, env.tasks);
    writeFileSync(path.join(env.workspace, 'tasks', 'invoice-settlement.md'), approved.output.result.document);
    assert.equal(cli(env, withRoot(env, 'tasks', env.tasks)).status, 0, 'document with the write plan block stays valid');

    const missingArg = withRoot(env, 'plan-approve', env.tasks, '--run-id', 'run-x', '--source-revision', HEAD, '--owner-repository-id', 'github.com/acme/portal');
    assert.equal(cli(env, missingArg, stdin).status, 2);
    const unknownTask = cli(env, approveArgs('run-2'), { ops: [{ ...createOp, task_id: 'demo/DEMO-9999/fe/01' }], current: {} });
    assert.equal(unknownTask.status, 1);
    assert.ok(codes(unknownTask).includes('OP_UNKNOWN_TASK'));
    const noGit = cli(env, withRoot(env, 'plan-approve', env.tasks, '--run-id', 'run-3', '--source-revision', 'none', '--owner-repository-id', 'github.com/acme/portal',
      '--owner-repository-role', 'portal', '--owner-module-id', 'null', '--approved-by', 'user', '--approved-at', '2026-10-15T01:00:00.000Z'), stdin);
    assert.equal(noGit.status, 1);
    assert.ok(codes(noGit).includes('APPROVAL_FALLBACK'));

    assert.equal(cli(env, withRoot(env, 'plan-verify', env.tasks, '--run-id', 'run-1'), { ops: [update] }).status, 0);
    const changed = cli(env, withRoot(env, 'plan-verify', env.tasks, '--run-id', 'run-1'), { ops: [{ ...update, fields: { assignee: 'acct-b' } }] });
    assert.equal(changed.status, 1);
    assert.ok(codes(changed).includes('OP_NOT_APPROVED'));
    const otherRun = cli(env, withRoot(env, 'plan-verify', env.tasks, '--run-id', 'run-9'), { ops: [update] });
    assert.equal(otherRun.status, 1);
    assert.ok(codes(otherRun).includes('RUN_NOT_APPROVED'));

    const clean = cli(env, withRoot(env, 'drift', env.tasks, '--run-id', 'run-1', '--task-id', UPDATE_ID), { format: 'rich-json', content: RICH_DOC });
    assert.equal(clean.status, 0, JSON.stringify(clean.output.errors));
    assert.equal(clean.output.result.changed, false);
    const edited = structuredClone(RICH_DOC); edited.content[0].content[0].text = 'PO sửa';
    const drifted = cli(env, withRoot(env, 'drift', env.tasks, '--run-id', 'run-1', '--task-id', UPDATE_ID), { format: 'rich-json', content: edited });
    assert.equal(drifted.status, 1);
    assert.equal(drifted.output.result.changed, true);

    const merged = cli(env, withRoot(env, 'merge', env.tasks, '--run-id', 'run-1', '--task-id', UPDATE_ID, '--format', 'rich-json'), { content: RICH_DOC });
    assert.equal(merged.status, 0, JSON.stringify(merged.output.errors));
    assert.equal(merged.output.result.mode, 'append');
    assert.deepEqual(merged.output.result.content.content.slice(0, 2), RICH_DOC.content);
    assert.ok(JSON.stringify(merged.output.result.content).includes(UPDATE_ID));
    const leaky = structuredClone(RICH_DOC); leaky.content[0].content[0].text = `token ${JWT}`;
    const refused = cli(env, withRoot(env, 'merge', env.tasks, '--run-id', 'run-1', '--task-id', UPDATE_ID, '--format', 'rich-json'), { content: leaky });
    assert.equal(refused.status, 1);
    assert.ok(codes(refused).includes('SECRET_OUTSIDE_REGION'));
    assert.ok(!refused.stdout.includes(JWT));
    assert.equal(refused.output.result, null);
    assert.equal(cli(env, withRoot(env, 'merge', env.tasks, '--run-id', 'run-1', '--task-id', UPDATE_ID, '--format', 'text'), { content: RICH_DOC }).status, 1, 'read format must match the approved format');
  } finally { cleanup(env); }
});

test('case-task-breakdown-cli-report: report table uses the fixed columns and ticket keys from the data block', () => {
  const env = fixture();
  try {
    writeFileSync(path.join(env.workspace, 'tasks', 'invoice-settlement.md'), renderTasksDocument({ data: data({ tickets: { [UPDATE_ID]: { key: 'DEMO-6224' } } }) }));
    const report = cli(env, withRoot(env, 'report', env.tasks));
    assert.equal(report.status, 0, JSON.stringify(report.output.errors));
    const lines = report.output.result.table.trim().split('\n');
    assert.equal(lines.length, 4);
    assert.ok(lines[2].includes('DEMO-6224') && lines[2].includes('Task 1'));
  } finally { cleanup(env); }
});

test('case-task-breakdown-cli-read-only: the CLI imports no write, process or network API', () => {
  const source = readFileSync(CLI, 'utf8');
  const imports = [...source.matchAll(/^\s*import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/gmu)].map(([, names, from]) => ({ names, from }));
  assert.ok(imports.length > 0);
  for (const { names, from } of imports) {
    assert.ok(!/(?:^|node:)(?:child_process|net|http|https|http2|dgram|tls|dns|cluster|worker_threads|inspector|vm)$/u.test(from), `forbidden module ${from}`);
    assert.ok(!/(?:^|node:)fs\/promises$/u.test(from), 'fs/promises is not needed by a read-only CLI');
    if (/(?:^|node:)fs$/u.test(from)) {
      const named = names.replace(/[{}]/gu, '').split(',').map((name) => name.trim().split(/\s+as\s+/u)[0]).filter(Boolean);
      for (const name of named) assert.ok(['readFileSync', 'lstatSync', 'realpathSync', 'statSync', 'existsSync', 'readdirSync'].includes(name), `fs.${name} is not read-only`);
    }
    if (from.startsWith('.')) assert.ok(/^\.\.?\/(?:[\w.-]+\/)*[\w.-]+\.mjs$/u.test(from), from);
  }
  assert.ok(!/\bimport\s*\(/u.test(source), 'no dynamic import');
  assert.ok(!/\brequire\s*\(/u.test(source), 'no require');
  assert.ok(!/process\.binding|process\.dlopen|\beval\s*\(|new\s+Function\b/u.test(source), 'no escape hatches');
});
