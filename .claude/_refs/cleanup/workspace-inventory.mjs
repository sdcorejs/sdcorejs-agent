import path from 'node:path';
import { observeLocalRepository } from './resource-audit.mjs';

export const workspaceAgeGroups = Object.freeze(['0-10', '11-20', 'over-20', 'unknown']);
export const retainedContent = new Set(['git-metadata', 'source-or-manifest', 'dependencies', 'database',
  'handoff-output', 'media-output', 'recovery', 'evidence', 'sdk-installers']);

const contentLabels = {
  'git-metadata': 'Git repository or worktree metadata',
  'source-or-manifest': 'Source or manifests',
  dependencies: 'Installed dependencies',
  'build-test-cache': 'Build or test cache (verify actual producer)',
  'sdk-installers': 'SDKs or installers (verify use)',
  database: 'Database or disk image (verify contents)',
  'build-output': 'Build output (verify regeneration)',
  'handoff-output': 'Potential delivery output (verify copies)',
  'media-output': 'Media output (verify delivery and copies)',
  evidence: 'Potential evidence (verify retention)',
  recovery: 'Potential recovery data (verify retention)',
  logs: 'Logs (verify producer and retention)',
  other: 'Other files (needs verification)',
};

const dayMs = 86_400_000;
const instant = epoch => Number.isFinite(epoch) ? new Date(epoch * 1000).toISOString() : null;
export const containsPath = (root, target) => {
  const relative = path.relative(root, target);
  return relative === '' || !path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`);
};

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}

export function calendarCutoff(asOf, timeZone) {
  if (!validDate(asOf) || typeof timeZone !== 'string' || !timeZone.trim()) throw new Error('EXPLICIT_VALID_CUTOFF_REQUIRED');
  const format = new Intl.DateTimeFormat('en-CA', { timeZone, calendar: 'iso8601', numberingSystem: 'latn',
    year: 'numeric', month: '2-digit', day: '2-digit' });
  return { dateAt: epoch => {
    if (!Number.isFinite(epoch)) return null;
    const parts = Object.fromEntries(format.formatToParts(epoch * 1000).map(item => [item.type, item.value]));
    return `${parts.year.padStart(4, '0')}-${parts.month}-${parts.day}`;
  }, asOf, timeZone };
}

function dateBasis(record, dateAt) {
  const label = path.basename(record.path).match(/^(\d{4}-\d{2}-\d{2})(?=$|[ _.-])/u)?.[1];
  if (validDate(label)) return { date: label, basis: 'workspace-date-label' };
  const birth = dateAt(record.creation_epoch);
  return birth ? { date: birth, basis: 'filesystem-creation-date' } : { date: null, basis: 'unknown' };
}

function ageFor(date, asOf) {
  const days = validDate(date) ? (Date.parse(asOf) - Date.parse(date)) / dayMs : null;
  if (days === null || days < 0) return { age_days: null, age_group: 'unknown' };
  return { age_days: days, age_group: days <= 10 ? '0-10' : days <= 20 ? '11-20' : 'over-20' };
}

function contentsOf(bytes) {
  return Object.entries(bytes).map(([kind, logical_bytes]) => ({ kind, logical_bytes,
    label: contentLabels[kind], confidence: kind === 'git-metadata' ? 'metadata-marker' : 'needs-verification' }))
    .sort((left, right) => right.logical_bytes - left.logical_bytes || left.kind.localeCompare(right.kind));
}

function descriptionOf(contents, projects = []) {
  const prefix = projects.length ? `Project markers: ${projects.map(project => project.name).join(', ')}. ` : '';
  if (!contents.length) return prefix + 'No regular file content observed.';
  return prefix + contents.slice(0, 3).map(item => `${item.label}: ${item.logical_bytes} bytes`).join('. ');
}

function writeFields(record, cutoff) {
  const observed = record.latest_write_observed_epoch;
  const date = cutoff.dateAt(observed);
  const offset = date ? (Date.parse(cutoff.asOf) - Date.parse(date)) / dayMs : null;
  return {
    latest_write_observed: instant(observed),
    latest_write_known: record.coverage === 'complete',
    recent_activity: offset !== null && offset <= 10 ? true : record.coverage === 'complete' ? false : null,
  };
}

function makeRow(record, cutoff, anchor, name, projects, additive, children = []) {
  const contents = contentsOf(record.content_bytes);
  const writes = writeFields(record, cutoff);
  const keep_signals = new Set(record.boundaries);
  if (retainedContent.has(record.directory_role)) keep_signals.add(record.directory_role);
  if (record.coverage !== 'complete') keep_signals.add('partial-scan');
  if (writes.recent_activity) keep_signals.add('recent-write');
  if (!anchor.date) keep_signals.add('age-unknown');
  for (const item of contents) if (retainedContent.has(item.kind)) keep_signals.add(item.kind);
  for (const project of projects) if (project.git_state) {
    keep_signals.add('git-boundary');
    if (project.git_state !== 'no-local-changes-observed') keep_signals.add(project.git_state);
  }
  return { name, path: record.path, projects, logical_bytes: record.logical_bytes, reclaimable_bytes: null,
    files: record.files, age_date: anchor.date, age_basis: anchor.basis, ...ageFor(anchor.date, cutoff.asOf),
    ...writes, coverage: record.coverage, additive, keep_signals: [...keep_signals].sort(), contents,
    largest_subdirectories: children.map(child => ({ name: path.basename(child.path), path: child.path,
      logical_bytes: child.logical_bytes, coverage: child.coverage })),
    description: descriptionOf(contents, projects) };
}

export async function buildWorkspaceInventory(data, cutoff, { inspectGit = true } = {}) {
  const records = data.records;
  const top = new Map(records.filter(record => record.depth === 1).map(record => [record.path, record]));
  const rootRecord = records.find(record => record.depth === 0);
  const groups = new Map();
  const projectsAt = new Map();
  const childrenAt = new Map();
  for (const record of records) {
    if (record.depth === 0) continue;
    const parent = path.dirname(record.path);
    const largest = childrenAt.get(parent) ?? [];
    largest.push(record);
    largest.sort((left, right) => right.logical_bytes - left.logical_bytes || left.path.localeCompare(right.path));
    if (largest.length > 3) largest.pop();
    childrenAt.set(parent, largest);
  }
  const deadline = Date.now() + 5000;
  const workspaceOf = record => path.join(data.root, path.relative(data.root, record.path).split(path.sep)[0]);
  for (const record of records.filter(item => item.markers?.length && !item.path.split(path.sep).some(
    segment => ['.git', 'node_modules', '.venv', 'site-packages', 'vendor'].includes(segment.toLowerCase())
  )).sort((a, b) => a.path.localeCompare(b.path))) {
    const repo = record.markers.includes('.git');
    const workspace = workspaceOf(record);
    if (!repo && workspace !== record.path && record !== rootRecord) continue;
    const project = { name: path.basename(record.path) || record.path, path: record.path, markers: record.markers,
      git_state: repo ? inspectGit && Date.now() < deadline
        ? await observeLocalRepository(record.path, deadline, { ignoreCleanupRuntime: true }) : 'state-unknown' : null };
    projectsAt.set(record.path, project);
    const group = groups.get(workspace) ?? [];
    group.push(project);
    groups.set(workspace, group);
  }
  const rootProjects = groups.get(data.root) ?? [];
  const projectsFor = record => {
    const workspace = workspaceOf(record);
    const nearby = (groups.get(workspace) ?? []).filter(project => containsPath(record.path, project.path) || containsPath(project.path, record.path));
    return workspace === data.root ? rootProjects : [...rootProjects, ...nearby];
  };
  const unknown = { date: null, basis: 'unknown' };
  const root = makeRow(rootRecord, cutoff, dateBasis(rootRecord, cutoff.dateAt), path.basename(data.root) || data.root,
    [...projectsAt.values()], false, childrenAt.get(data.root));
  const workspaces = [...top.values()].map(record => makeRow(record, cutoff, dateBasis(record, cutoff.dateAt),
    path.basename(record.path), projectsFor(record), true, childrenAt.get(record.path)));
  if (data.root_files.files) workspaces.push(makeRow(data.root_files, cutoff, unknown, 'Files directly under root', rootProjects, true));
  workspaces.sort((left, right) => right.logical_bytes - left.logical_bytes || left.path.localeCompare(right.path));
  const details = records.filter(record => record.depth >= 2 && !record.path.split(path.sep).some(segment => segment.toLowerCase() === '.git'))
    .map(record => makeRow(record, cutoff, dateBasis(top.get(workspaceOf(record)), cutoff.dateAt), path.basename(record.path),
      projectsFor(record), false, childrenAt.get(record.path)))
    .sort((left, right) => right.logical_bytes - left.logical_bytes || left.path.localeCompare(right.path));
  const age_groups = workspaceAgeGroups.map(age_group => {
    const rows = workspaces.filter(row => row.age_group === age_group);
    const bytes = Object.create(null);
    for (const row of rows) for (const item of row.contents) bytes[item.kind] = (bytes[item.kind] ?? 0) + item.logical_bytes;
    const contents = contentsOf(bytes);
    const writes = rows.map(row => row.latest_write_observed).filter(Boolean).sort();
    const projects = [...new Map(rows.flatMap(row => row.projects.map(project => [project.path, project]))).values()];
    const coverage = data.status === 'complete' ? 'complete' : 'partial';
    return { name: age_group, path: data.root, projects, age_group, age_date: null, age_basis: 'mixed-workspace-dates',
      files: rows.reduce((total, row) => total + row.files, 0), logical_bytes: rows.reduce((total, row) => total + row.logical_bytes, 0),
      reclaimable_bytes: null, latest_write_observed: writes.at(-1) ?? null, latest_write_known: coverage === 'complete',
      recent_activity: rows.some(row => row.recent_activity === true) ? true : coverage === 'complete' ? false : null,
      coverage, additive: true, workspaces: rows.length, keep_signals: [...new Set(rows.flatMap(row => row.keep_signals))].sort(),
      contents, description: descriptionOf(contents, projects.slice(0, 3)) };
  });
  return { as_of: cutoff.asOf, time_zone: cutoff.timeZone, root, age_groups, workspaces, details,
    accounting: 'Age groups and workspaces are alternative disjoint summaries. Detail rows and root totals overlap them.',
    reclaimability: 'Inventory does not establish recoverable allocation. Logical bytes can include shared links.' };
}

export function workspaceInventoryCsv(view) {
  const columns = ['table', 'as_of', 'time_zone', 'name', 'path', 'projects', 'project_paths', 'logical_bytes', 'reclaimable_bytes', 'files',
    'age_date', 'age_basis', 'age_days', 'age_group', 'latest_write_observed', 'latest_write_known', 'recent_activity',
    'coverage', 'additive', 'keep_signals', 'largest_subdirectories', 'description'];
  const cell = (value) => {
    let text = value == null ? '' : String(value);
    if (typeof value === 'string' && /^(?:\s*[=+@-]|[\t\r\n])/u.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  const sections = [['age', view.age_groups], ['workspace', view.workspaces], ['detail', view.details]];
  const csv = sections.flatMap(([table, rows]) => rows.map(row => {
    const values = { ...row, table, as_of: view.as_of, time_zone: view.time_zone,
      projects: row.projects.map(project => project.name).join(' | '),
      project_paths: row.projects.map(project => project.path).join(' | '),
      largest_subdirectories: (row.largest_subdirectories ?? []).map(child => `${child.name}: ${child.logical_bytes} bytes`).join(' | '),
      keep_signals: row.keep_signals.join(' | ') };
    return columns.map(key => cell(values[key])).join(',');
  }));
  return [columns.join(','), ...csv].join('\r\n') + '\r\n';
}
