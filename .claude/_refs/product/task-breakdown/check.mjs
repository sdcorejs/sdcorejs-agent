#!/usr/bin/env node
// Read-only check CLI for the sdcorejs-product task-breakdown mode.
// It reads only files under <root>/.sdcorejs/projects/<slug>/ or stdin, calls the
// pure helpers and prints exactly one JSON verdict. It never writes a file, spawns a
// process or opens a network connection; the skill writes what this CLI returns.
// Exit codes: 0 valid, 1 invalid, 2 usage or I/O error.
import { lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import path from 'node:path';

import { isSafeProjectSegment } from '../../shared/artifact-paths.mjs';
import { detectTicketDrift, mergeTicketContent, ownedRegionPlainText, parseOwnedRegions, parseOwnedRichRegions, richPlainText, ticketFingerprints } from './identity.mjs';
import { approveWritePlan, buildWritePlan, redactValue, scanSecrets, stableJson, verifyWritePlan } from './safety.mjs';
import { balanceLoad, suggestAssignees } from './sizing.mjs';
import { renderReport, renderTask, renderTasksDocument, reportRows, validateTasksDocument } from './task-format.mjs';
import { validateProjectFileText } from './workspace.mjs';

const COMMANDS = Object.freeze(['project', 'tasks', 'scan', 'balance', 'plan-approve', 'plan-verify', 'drift', 'merge', 'report']);
const VALUE_FLAGS = Object.freeze(['root', 'kind', 'slug', 'scope', 'source', 'run-id', 'task-id', 'format', 'source-revision',
  'owner-repository-id', 'owner-repository-role', 'owner-module-id', 'approved-by', 'approved-at']);
const BOOLEAN_FLAGS = Object.freeze(['after-write']);
const PROJECT_FILES = Object.freeze({ 'project.md': 'project', 'task-breakdown.config.md': 'task-breakdown-config' });

class CheckError extends Error {
  constructor(exitCode, code, message, path = '(cli)') {
    super(message);
    this.exitCode = exitCode;
    this.issue = { code, path, message };
  }
}

const usage = (code, message) => new CheckError(2, code, message);
const invalid = (code, message, at) => new CheckError(1, code, message, at);

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const flags = {};
  const positional = [];
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token.startsWith('--')) {
      const name = token.slice(2);
      if (BOOLEAN_FLAGS.includes(name)) { flags[name] = true; continue; }
      if (!VALUE_FLAGS.includes(name)) throw usage('ARGUMENT_UNKNOWN', `unknown option --${name}`);
      if (index + 1 >= rest.length) throw usage('ARGUMENT_REQUIRED', `--${name} needs a value`);
      flags[name] = rest[index + 1];
      index += 1;
    } else positional.push(token);
  }
  return { command, flags, positional };
}

function requireFlag(flags, name) {
  if (typeof flags[name] !== 'string' || flags[name].trim() === '') throw usage('ARGUMENT_REQUIRED', `--${name} is required`);
  return flags[name];
}

function resolveRoot(flags) {
  if (typeof flags.root !== 'string' || flags.root.trim() === '') throw usage('ROOT_REQUIRED', '--root is required; the CLI never infers the target root from the working directory');
  let root;
  try { root = realpathSync(flags.root); } catch { throw usage('ROOT_INVALID', '--root does not exist'); }
  if (!lstatSync(root).isDirectory()) throw usage('ROOT_INVALID', '--root must be a directory');
  return root;
}

/** Resolve a file under <root>/.sdcorejs/projects/<slug>/ and refuse links on every path segment. */
function workspaceFile(root, target) {
  const full = path.resolve(root, target);
  const relative = path.relative(root, full);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) throw usage('PATH_OUTSIDE_WORKSPACE', 'only files under .sdcorejs/projects/<slug>/ can be read');
  const segments = relative.split(path.sep);
  const [first, second, slug, ...rest] = segments;
  if (first !== '.sdcorejs' || second !== 'projects' || slug === undefined || rest.length === 0) {
    throw usage('PATH_OUTSIDE_WORKSPACE', 'only files under .sdcorejs/projects/<slug>/ can be read');
  }
  if (!isSafeProjectSegment(slug)) throw usage('SLUG_INVALID', 'the project slug must be a safe project segment');
  const isProjectFile = rest.length === 1 && Object.hasOwn(PROJECT_FILES, rest[0]);
  const scope = rest.length === 2 && rest[0] === 'tasks' && rest[1].endsWith('.md') ? rest[1].slice(0, -3) : null;
  if (!isProjectFile && !(scope && isSafeProjectSegment(scope))) throw usage('PATH_OUTSIDE_WORKSPACE', 'only project.md, task-breakdown.config.md and tasks/<scope>.md can be read');
  let current = root;
  for (const segment of segments) {
    current = path.join(current, segment);
    let stat;
    try { stat = lstatSync(current); } catch { throw usage('FILE_NOT_FOUND', `${segments.join('/')} does not exist`); }
    if (stat.isSymbolicLink()) throw usage('SYMLINK_FORBIDDEN', 'links inside the project workspace are refused');
  }
  return { full, relative: segments.join('/'), slug, scope, kind: isProjectFile ? PROJECT_FILES[rest[0]] : null };
}

function readText(file) {
  try { return readFileSync(file, 'utf8'); } catch { throw usage('FILE_UNREADABLE', 'the file cannot be read'); }
}

function readStdin() {
  try { return readFileSync(0, 'utf8'); } catch { return ''; }
}

function readJsonStdin() {
  const text = readStdin();
  try { return JSON.parse(text); } catch { throw usage('STDIN_INVALID', 'stdin must be one JSON object'); }
}

function siblingsOf(root, slug, scope) {
  const directory = path.join(root, '.sdcorejs', 'projects', slug, 'tasks');
  let names = [];
  try { names = readdirSync(directory); } catch { return []; }
  return names.filter((name) => name.endsWith('.md') && name !== `${scope}.md`).sort().map((name) => {
    const file = workspaceFile(root, path.join('.sdcorejs', 'projects', slug, 'tasks', name));
    return { path: file.relative, text: readText(file.full) };
  });
}

function hasSecretError(errors) {
  return errors.some(({ code }) => code === 'SECRET_VALUE_FORBIDDEN');
}

function loadTasks(root, target) {
  const file = workspaceFile(root, target);
  if (!file.scope) throw usage('PATH_OUTSIDE_WORKSPACE', 'expected tasks/<scope>.md');
  const text = readText(file.full);
  const result = validateTasksDocument(text, { project_slug: file.slug, scope: file.scope, siblings: siblingsOf(root, file.slug, file.scope) });
  return { file, text, ...result };
}

function requireValidTasks(tasks) {
  if (!tasks.valid) {
    const error = invalid('TASKS_INVALID', 'the tasks document must be valid first; run check tasks', tasks.file.relative);
    error.extra = tasks.errors;
    throw error;
  }
}

function blockFor(tasks, runId) {
  const block = tasks.write_plans.find((entry) => entry?.run_id === runId);
  if (!block) throw invalid('RUN_NOT_APPROVED', `no approved write plan for run ${runId}`);
  const verdict = verifyWritePlan({ approval: block.approval, plan: block.plan, run_id: runId });
  if (!verdict.valid) throw invalid('APPROVAL_INVALID', verdict.reason);
  return block;
}

function approvedOp(block, taskId) {
  const op = block.plan.ops.find((entry) => entry.task_id === taskId);
  if (!op) throw invalid('OP_NOT_APPROVED', `no approved operation for ${taskId}`);
  return op;
}

const normalizeSpace = (value) => String(value ?? '').replace(/\s+/gu, ' ').trim();

function outsideContent(format, current, taskId) {
  if (format === 'text') {
    const text = String(current ?? '');
    const region = parseOwnedRegions(text).find((entry) => entry.task_id === taskId);
    return region ? `${text.slice(0, region.start)}${text.slice(region.end)}` : text;
  }
  const region = parseOwnedRichRegions(current).find((entry) => entry.task_id === taskId);
  const nodes = region ? [...current.content.slice(0, region.start), ...current.content.slice(region.end + 1)] : current.content;
  return JSON.stringify(nodes);
}

const handlers = {
  project(root, { flags, positional }) {
    const target = positional[0];
    if (!target) throw usage('ARGUMENT_REQUIRED', 'project needs a file or -');
    let kind; let text;
    if (target === '-') {
      kind = requireFlag(flags, 'kind');
      if (!Object.values(PROJECT_FILES).includes(kind)) throw usage('ARGUMENT_INVALID', '--kind must be project or task-breakdown-config');
      text = readStdin();
    } else {
      const file = workspaceFile(root, target);
      if (!file.kind) throw usage('PATH_OUTSIDE_WORKSPACE', 'expected project.md or task-breakdown.config.md');
      kind = file.kind;
      text = readText(file.full);
    }
    const result = validateProjectFileText(text, { kind });
    return { valid: result.valid, errors: result.errors, result: { kind } };
  },

  tasks(root, { flags, positional }) {
    const target = positional[0];
    if (!target) throw usage('ARGUMENT_REQUIRED', 'tasks needs a file or -');
    if (target !== '-') {
      const tasks = loadTasks(root, target);
      const secret = hasSecretError(tasks.errors);
      return { valid: tasks.valid, errors: tasks.errors, result: { data: secret ? null : tasks.data, write_plans: secret ? [] : tasks.write_plans } };
    }
    const slug = requireFlag(flags, 'slug');
    const scope = requireFlag(flags, 'scope');
    if (!isSafeProjectSegment(slug) || !isSafeProjectSegment(scope)) throw usage('ARGUMENT_INVALID', '--slug and --scope must be safe project segments');
    const input = readStdin();
    let document = input;
    if (input.trimStart().startsWith('{')) {
      let parsed;
      try { parsed = JSON.parse(input); } catch { throw usage('STDIN_INVALID', 'stdin JSON is invalid'); }
      try { document = renderTasksDocument({ data: parsed.data, write_plans: parsed.write_plans ?? [] }); } catch (error) { throw invalid('DATA_BLOCK_INVALID', error.message); }
    }
    const result = validateTasksDocument(document, { project_slug: slug, scope, siblings: siblingsOf(root, slug, scope) });
    const secret = hasSecretError(result.errors);
    return { valid: result.valid, errors: result.errors, result: { document: secret ? null : document, data: secret ? null : result.data, write_plans: secret ? [] : result.write_plans } };
  },

  scan(root, { flags }) {
    const result = scanSecrets(readStdin(), { source: flags.source ?? 'stdin' });
    const errors = result.findings.map((finding) => ({ code: 'SECRET_FOUND', path: `line ${finding.line}`, message: `a ${finding.kind} value was found; use the redacted text` }));
    return { valid: errors.length === 0, errors, result };
  },

  balance() {
    const input = readJsonStdin();
    try {
      const members = input.members ?? [];
      const velocity = input.velocity_per_member;
      let assignments = input.assignments ?? [];
      if (Array.isArray(input.tasks)) {
        const suggested = suggestAssignees({ tasks: input.tasks, members, rules: input.rules ?? {}, velocity_per_member: velocity });
        assignments = suggested.assignments.map((entry) => ({ ...entry, points: input.tasks.find((task) => task.task_id === entry.task_id)?.points ?? 0 }));
      }
      const balance = balanceLoad({ members, assignments, velocity_per_member: velocity });
      return { valid: true, errors: [], result: { assignments, balance } };
    } catch (error) {
      throw invalid('BALANCE_INVALID', error.message);
    }
  },

  'plan-approve'(root, { flags, positional }) {
    const runId = requireFlag(flags, 'run-id');
    const sourceRevision = requireFlag(flags, 'source-revision');
    const owner = requireFlag(flags, 'owner-repository-id');
    const role = requireFlag(flags, 'owner-repository-role');
    const moduleFlag = requireFlag(flags, 'owner-module-id');
    const approvedBy = requireFlag(flags, 'approved-by');
    const approvedAt = requireFlag(flags, 'approved-at');
    if (Number.isNaN(Date.parse(approvedAt))) throw usage('ARGUMENT_INVALID', '--approved-at must be an ISO-8601 timestamp');
    if (!positional[0]) throw usage('ARGUMENT_REQUIRED', 'plan-approve needs the tasks file');
    const tasks = loadTasks(root, positional[0]);
    requireValidTasks(tasks);
    if (tasks.write_plans.some((entry) => entry?.run_id === runId)) throw invalid('WRITE_PLAN_DUPLICATE_RUN', `run ${runId} already has a write plan`);
    const input = readJsonStdin();
    const ignoreAttrs = Array.isArray(input.ignore_attrs) ? input.ignore_attrs.map(String) : [];
    const known = new Set(tasks.data.tasks.map((task) => task.meta.task_id));
    const ops = (Array.isArray(input.ops) ? input.ops : []).map((op, index) => {
      if (!known.has(op?.task_id)) throw invalid('OP_UNKNOWN_TASK', `${op?.task_id} is not a task of this document`, `ops[${index}]`);
      if (op.op !== 'update') return op;
      const current = input.current?.[op.task_id];
      if (!current) throw invalid('CURRENT_REQUIRED', `the current ticket content for ${op.task_id} is required to take fingerprints`, `ops[${index}]`);
      try {
        return { ...op, format: current.format, fingerprints: ticketFingerprints({ format: current.format, current: current.content, task_id: op.task_id, ignore_attrs: ignoreAttrs }) };
      } catch (error) {
        throw invalid('CURRENT_INVALID', error.message, `ops[${index}]`);
      }
    });
    let plan;
    try { plan = buildWritePlan({ project_slug: tasks.file.slug, scope: tasks.file.scope, run_id: runId, ops }); } catch (error) { throw invalid('OP_INVALID', error.message); }
    if (plan.secret_findings.length > 0) throw invalid('SECRET_VALUE_FORBIDDEN', 'an operation contains a secret-shaped value');
    const approval = approveWritePlan({
      plan,
      owner_repository_id: owner,
      owner_repository_role: role,
      owner_module_id: moduleFlag === 'null' ? null : moduleFlag,
      source_revision: sourceRevision,
      repository_relative_path: tasks.file.relative,
      approved_by: approvedBy,
      approved_at: approvedAt,
    });
    if (approval.status !== 'approved') {
      return { valid: false, errors: [{ code: 'APPROVAL_FALLBACK', path: 'approval', message: approval.reason }], result: { fallback: approval.fallback } };
    }
    const block = { run_id: runId, ignore_attrs: ignoreAttrs, plan, approval };
    const document = renderTasksDocument({ data: tasks.data, write_plans: [...tasks.write_plans, block] });
    return { valid: true, errors: [], result: { block, document } };
  },

  'plan-verify'(root, { flags, positional }) {
    const runId = requireFlag(flags, 'run-id');
    if (!positional[0]) throw usage('ARGUMENT_REQUIRED', 'plan-verify needs the tasks file');
    const tasks = loadTasks(root, positional[0]);
    requireValidTasks(tasks);
    const block = blockFor(tasks, runId);
    const approved = new Set(block.plan.ops.map((op) => stableJson(op)));
    const ops = readJsonStdin().ops ?? [];
    if (!Array.isArray(ops) || ops.length === 0) throw usage('STDIN_INVALID', 'stdin must list the operations about to run');
    const errors = ops.flatMap((op, index) => (approved.has(stableJson(op)) ? [] : [{ code: 'OP_NOT_APPROVED', path: `ops[${index}]`, message: 'this operation differs from the approved write plan' }]));
    return { valid: errors.length === 0, errors, result: { run_id: runId, checked: ops.length } };
  },

  drift(root, { flags, positional }) {
    const runId = requireFlag(flags, 'run-id');
    const taskId = requireFlag(flags, 'task-id');
    if (!positional[0]) throw usage('ARGUMENT_REQUIRED', 'drift needs the tasks file');
    const tasks = loadTasks(root, positional[0]);
    requireValidTasks(tasks);
    const block = blockFor(tasks, runId);
    const op = approvedOp(block, taskId);
    if (op.op !== 'update') throw invalid('OP_NOT_APPROVED', `${taskId} is not an approved update`);
    const input = readJsonStdin();
    if (input.format !== op.format) throw invalid('FORMAT_MISMATCH', `the ticket was approved as ${op.format}`);
    let verdict; let regionText;
    try {
      verdict = detectTicketDrift({ approved: op.fingerprints, current: input.content, task_id: taskId, format: op.format, ignore_attrs: block.ignore_attrs ?? [] });
      regionText = ownedRegionPlainText({ format: op.format, current: input.content, task_id: taskId });
    } catch (error) {
      throw invalid('CURRENT_INVALID', error.message);
    }
    if (flags['after-write']) {
      const task = tasks.data.tasks.find((entry) => entry.meta.task_id === taskId);
      const rendered = renderTask(task, { language: tasks.data.language, format: op.format });
      const expected = op.format === 'text' ? rendered : richPlainText(rendered);
      const errors = [];
      if (verdict.regions.includes('outside')) errors.push({ code: 'OUTSIDE_CHANGED', path: 'outside', message: 'content outside the owned region changed during the write' });
      if (normalizeSpace(regionText) !== normalizeSpace(expected)) errors.push({ code: 'REGION_MISMATCH', path: 'inside', message: 'the owned region does not match the approved task' });
      return { valid: errors.length === 0, errors, result: { ...verdict, after_write: true } };
    }
    const errors = verdict.changed ? [{ code: 'TICKET_CHANGED', path: verdict.regions.join(','), message: 'the ticket changed after approval; ask again before writing' }] : [];
    return { valid: !verdict.changed, errors, result: verdict };
  },

  merge(root, { flags, positional }) {
    const runId = requireFlag(flags, 'run-id');
    const taskId = requireFlag(flags, 'task-id');
    const format = requireFlag(flags, 'format');
    if (!['text', 'rich-json'].includes(format)) throw usage('ARGUMENT_INVALID', '--format must be text or rich-json');
    if (!positional[0]) throw usage('ARGUMENT_REQUIRED', 'merge needs the tasks file');
    const tasks = loadTasks(root, positional[0]);
    requireValidTasks(tasks);
    const block = blockFor(tasks, runId);
    const op = approvedOp(block, taskId);
    if (op.format !== undefined && op.format !== format) throw invalid('FORMAT_MISMATCH', `the ticket was approved as ${op.format}`);
    const input = readJsonStdin();
    const current = input.content ?? (format === 'text' ? '' : { type: 'doc', version: 1, content: [] });
    let outside;
    try { outside = outsideContent(format, current, taskId); } catch (error) { throw invalid('CURRENT_INVALID', error.message); }
    if (scanSecrets(outside, { source: 'ticket' }).findings.length > 0) {
      return { valid: false, errors: [{ code: 'SECRET_OUTSIDE_REGION', path: 'outside', message: 'the ticket holds a secret-shaped value outside the owned region; do not write, render a copy-paste draft and warn the user' }], result: null };
    }
    const task = tasks.data.tasks.find((entry) => entry.meta.task_id === taskId);
    const rendered = renderTask(task, { language: tasks.data.language, format });
    const region = format === 'text' ? scanSecrets(rendered, { source: 'task' }).redacted : redactValue(rendered, { source: 'task' }).value;
    let merged;
    try { merged = mergeTicketContent({ format, current, task_id: taskId, content: region }); } catch (error) { throw invalid('CURRENT_INVALID', error.message); }
    return { valid: true, errors: [], result: { mode: merged.mode, content: merged.current, region_text: format === 'text' ? region.trim() : richPlainText(region).trim() } };
  },

  report(root, { positional }) {
    if (!positional[0]) throw usage('ARGUMENT_REQUIRED', 'report needs the tasks file');
    const tasks = loadTasks(root, positional[0]);
    if (!tasks.valid) return { valid: false, errors: tasks.errors, result: { table: null } };
    return { valid: true, errors: [], result: { table: renderReport(reportRows(tasks.data), { language: tasks.data.language ?? 'en' }) } };
  },
};

function main(argv) {
  let command = argv[0] ?? null;
  let root = null;
  try {
    const parsed = parseArgs(argv);
    command = parsed.command ?? null;
    if (!COMMANDS.includes(command)) throw usage('COMMAND_UNKNOWN', `command must be one of ${COMMANDS.join(', ')}`);
    root = resolveRoot(parsed.flags);
    const outcome = handlers[command](root, parsed);
    return { exitCode: outcome.valid ? 0 : 1, output: { command, root, valid: outcome.valid, errors: outcome.errors, result: outcome.result ?? null } };
  } catch (error) {
    if (error instanceof CheckError) {
      return { exitCode: error.exitCode, output: { command, root, valid: false, errors: [error.issue, ...(error.extra ?? [])], result: null } };
    }
    return { exitCode: 2, output: { command, root, valid: false, errors: [{ code: 'INTERNAL_ERROR', path: '(cli)', message: error?.message ?? String(error) }], result: null } };
  }
}

const { exitCode, output } = main(process.argv.slice(2));
process.stdout.write(`${JSON.stringify(output)}\n`);
process.exitCode = exitCode;
