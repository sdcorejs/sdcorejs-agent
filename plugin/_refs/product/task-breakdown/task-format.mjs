// Fixed task description format for the sdcorejs-product task-breakdown mode.
// Validators check keys, not display labels, so every language renders the same contract.
import { parseApprovedFrontmatter } from '../../shared/approved-artifact.mjs';
import { isSafeProjectSegment } from '../../shared/artifact-paths.mjs';
import { scanSecrets } from './safety.mjs';
import { scoreTask } from './sizing.mjs';

export const TASK_SECTION_KEYS = Object.freeze([
  'tldr',
  'context',
  'scope',
  'work_items',
  'rules_data',
  'done_criteria',
  'dependencies',
  'confirmations',
  'risks',
  'estimate',
  'sources',
  'traceability',
]);

export const TASK_META_KEYS = Object.freeze([
  'task_id',
  'role',
  'source_refs',
  'size_points',
  'confidence',
  'suggested_assignee',
]);

export const CONFIDENCE_LEVELS = Object.freeze(['verified', 'stale', 'none']);

export const SECTION_LABELS = Object.freeze({
  vi: Object.freeze({
    tldr: 'TL;DR',
    context: 'Bối cảnh',
    scope: 'Phạm vi / Ngoài phạm vi',
    work_items: 'Đầu việc',
    rules_data: 'Quy tắc & dữ liệu',
    done_criteria: 'Tiêu chí hoàn thành',
    dependencies: 'Phụ thuộc / Đợi gì',
    confirmations: 'Cần xác nhận',
    risks: 'Rủi ro / Lưu ý',
    estimate: 'Ước lượng',
    sources: 'Nguồn đã đọc',
    traceability: 'Truy vết',
  }),
  en: Object.freeze({
    tldr: 'TL;DR',
    context: 'Context',
    scope: 'Scope / Out of scope',
    work_items: 'Work items',
    rules_data: 'Rules & data',
    done_criteria: 'Done criteria',
    dependencies: 'Dependencies / Waiting on',
    confirmations: 'Needs confirmation',
    risks: 'Risks / Notes',
    estimate: 'Estimate',
    sources: 'Sources read',
    traceability: 'Traceability',
  }),
});

const NONE_LABELS = Object.freeze({ vi: 'Không có', en: 'None' });

export const REPORT_COLUMNS = Object.freeze([
  { key: 'ticket', label: { vi: 'Ticket', en: 'Ticket' } },
  { key: 'source', label: { vi: 'US / Nguồn', en: 'Story / Source' } },
  { key: 'role', label: { vi: 'Vai trò', en: 'Role' } },
  { key: 'summary', label: { vi: 'Mô tả ngắn', en: 'Summary' } },
  { key: 'size', label: { vi: 'Size', en: 'Size' } },
  { key: 'assignee', label: { vi: 'Assignee', en: 'Assignee' } },
  { key: 'waiting_on', label: { vi: 'Đang chờ', en: 'Waiting on' } },
]);

const FIBONACCI = new Set([1, 2, 3, 5, 8, 13]);
const TASK_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[A-Z0-9]+(?:-[A-Z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*\/\d{2}$/u;

function issue(code, path, message) {
  return { code, path, message };
}

function isText(value) {
  return typeof value === 'string' && value.trim() !== '';
}

/** Label written into an empty section so readers know it was checked. */
export function noneLabel(language = 'en') {
  return NONE_LABELS[language] ?? NONE_LABELS.en;
}

export function sectionLabel(key, language = 'en') {
  return (SECTION_LABELS[language] ?? SECTION_LABELS.en)[key];
}

function validateConfidence(confidence, errors) {
  if (!confidence || typeof confidence !== 'object') return;
  if (!CONFIDENCE_LEVELS.includes(confidence.level)) {
    errors.push(issue('CONFIDENCE_INVALID', 'meta.confidence.level', `level must be one of ${CONFIDENCE_LEVELS.join(', ')}`));
    return;
  }
  const missing = (message) => errors.push(issue('CONFIDENCE_EVIDENCE_MISSING', 'meta.confidence', message));
  if (confidence.level === 'verified' && (!isText(confidence.ref) || !isText(confidence.date))) {
    missing('verified confidence needs the code ref and the date it was checked');
  }
  if (confidence.level === 'stale' && (!isText(confidence.ref) || !Number.isInteger(confidence.behind_by) || confidence.behind_by < 0)) {
    missing('stale confidence needs the code ref and how many commits it is behind');
  }
  if (confidence.level === 'none' && !isText(confidence.note)) {
    missing('none confidence needs a note explaining why code was not read');
  }
}

/** Validate one task: header meta plus twelve keyed sections in fixed order, none left blank. */
export function validateTask(task) {
  const errors = [];
  const meta = task?.meta ?? {};
  for (const key of TASK_META_KEYS) {
    const value = meta[key];
    const empty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);
    if (empty) errors.push(issue('META_REQUIRED', `meta.${key}`, `${key} is required`));
  }
  if (meta.task_id !== undefined && !TASK_ID.test(meta.task_id)) {
    errors.push(issue('META_INVALID', 'meta.task_id', 'task_id must be <project-slug>/<SOURCE-KEY>/<role>/<NN>'));
  }
  if (meta.size_points !== undefined && !FIBONACCI.has(meta.size_points)) {
    errors.push(issue('META_INVALID', 'meta.size_points', 'size_points must be a Fibonacci point (1, 2, 3, 5, 8, 13)'));
  }
  validateConfidence(meta.confidence, errors);

  const sections = Array.isArray(task?.sections) ? task.sections : [];
  const keys = sections.map((section) => section?.key);
  for (const key of keys) {
    if (!TASK_SECTION_KEYS.includes(key)) errors.push(issue('SECTION_UNKNOWN', `sections.${String(key)}`, 'unknown section key'));
  }
  for (const key of TASK_SECTION_KEYS) {
    if (!keys.includes(key)) errors.push(issue('SECTION_MISSING', `sections.${key}`, `${key} must be present; write the None label when empty`));
  }
  const known = keys.filter((key) => TASK_SECTION_KEYS.includes(key));
  const expectedOrder = TASK_SECTION_KEYS.filter((key) => known.includes(key));
  if (known.join('|') !== expectedOrder.join('|')) {
    errors.push(issue('SECTION_ORDER_INVALID', 'sections', `sections must follow ${TASK_SECTION_KEYS.join(', ')}`));
  }
  for (const section of sections) {
    if (!isText(section?.content)) errors.push(issue('SECTION_EMPTY', `sections.${String(section?.key)}`, 'write the None label instead of leaving a section blank'));
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Every in-scope PRD requirement must map to a task of each selected role, or
 * carry an explicit exclusion with a reason for that role.
 */
export function validatePrdCoverage({ requirements = [], tasks = [], exclusions = [], roles = [] } = {}) {
  const missing = [];
  for (const { id } of requirements) {
    for (const role of roles) {
      const covered = tasks.some((task) => task.role === role && Array.isArray(task.covers) && task.covers.includes(id));
      const excluded = exclusions.some((entry) => entry.requirement_id === id && entry.role === role && isText(entry.reason));
      if (!covered && !excluded) missing.push({ requirement_id: id, role });
    }
  }
  return { valid: missing.length === 0, missing };
}

function cell(value) {
  const text = value === undefined || value === null ? '' : String(value);
  return text.replace(/\r?\n/gu, ' ').replaceAll('|', '\\|').trim();
}

/** Run report as a Markdown table with the fixed column set. */
export function renderReport(rows, { language = 'vi' } = {}) {
  const header = `| ${REPORT_COLUMNS.map(({ label }) => label[language] ?? label.en).join(' | ')} |`;
  const separator = `|${REPORT_COLUMNS.map(() => '---').join('|')}|`;
  const body = (rows ?? []).map((row) => `| ${REPORT_COLUMNS.map(({ key }) => cell(row?.[key])).join(' | ')} |`);
  return `${[header, separator, ...body].join('\n')}\n`;
}

// ---------- Task rendering and the tasks document ----------
// tasks/<scope>.md is rendered from one data block; the CLI checks that the rendered
// task sections still equal renderTask(block), so the data block is the source of truth.

export const TASKS_DATA_FENCE = 'json sdcorejs-task-breakdown';
export const WRITE_PLAN_FENCE = 'json sdcorejs-write-plan';
export const RICH_NODE_TYPES = Object.freeze(['heading', 'paragraph', 'text', 'bulletList', 'listItem', 'table', 'tableRow', 'tableCell', 'codeBlock']);

const META_LABELS = Object.freeze({
  vi: Object.freeze({ role: 'Vai trò', size: 'Size', confidence: 'Độ tin cậy', assignee: 'Đề xuất assignee', sources: 'Nguồn', waiting_on: 'Đang chờ' }),
  en: Object.freeze({ role: 'Role', size: 'Size', confidence: 'Confidence', assignee: 'Suggested assignee', sources: 'Sources', waiting_on: 'Waiting on' }),
});

function metaLabel(key, language) {
  return (META_LABELS[language] ?? META_LABELS.en)[key];
}

function confidenceText(confidence) {
  if (!confidence || typeof confidence !== 'object') return '';
  if (confidence.level === 'verified') return `verified (${confidence.ref}, ${confidence.date})`;
  if (confidence.level === 'stale') return `stale (${confidence.ref}, ${confidence.behind_by} commits behind)`;
  return `none (${confidence.note ?? ''})`;
}

function taskHeading(task) {
  const title = isText(task?.title) ? ` · ${task.title.trim()}` : '';
  return `${task?.meta?.task_id ?? ''}${title}`;
}

function metaLines(task, language) {
  const meta = task?.meta ?? {};
  const lines = [
    [metaLabel('role', language), meta.role],
    [metaLabel('size', language), meta.size_points],
    [metaLabel('confidence', language), confidenceText(meta.confidence)],
    [metaLabel('assignee', language), meta.suggested_assignee],
    [metaLabel('sources', language), Array.isArray(meta.source_refs) ? meta.source_refs.join(', ') : ''],
  ];
  if (isText(task?.waiting_on)) lines.push([metaLabel('waiting_on', language), task.waiting_on.trim()]);
  return lines.map(([label, value]) => `${label}: ${value ?? ''}`);
}

function textNode(text) {
  return { type: 'text', text };
}

function paragraph(text) {
  return { type: 'paragraph', content: text === '' ? [] : [textNode(text)] };
}

function tableCells(line) {
  return line.trim().replace(/^\|/u, '').replace(/\|$/u, '').split(/(?<!\\)\|/u).map((cell) => cell.trim().replaceAll('\\|', '|'));
}

/** Minimal Markdown subset -> rich nodes: paragraphs, bullet lists, tables and code blocks. */
function contentNodes(markdown) {
  const lines = String(markdown ?? '').replace(/\r\n?/gu, '\n').split('\n');
  const nodes = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (line.trim() === '') { index += 1; continue; }
    if (line.trimStart().startsWith('```')) {
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].trimStart().startsWith('```')) { code.push(lines[index]); index += 1; }
      index += 1;
      nodes.push({ type: 'codeBlock', content: code.length === 0 ? [] : [textNode(code.join('\n'))] });
      continue;
    }
    if (line.trimStart().startsWith('|')) {
      const rows = [];
      while (index < lines.length && lines[index].trimStart().startsWith('|')) {
        if (!/^\s*\|?\s*:?-{3,}/u.test(lines[index])) rows.push(tableCells(lines[index]));
        index += 1;
      }
      nodes.push({ type: 'table', content: rows.map((cells) => ({ type: 'tableRow', content: cells.map((cell) => ({ type: 'tableCell', content: [paragraph(cell)] })) })) });
      continue;
    }
    if (/^\s*[-*] /u.test(line)) {
      const items = [];
      while (index < lines.length && /^\s*[-*] /u.test(lines[index])) { items.push(lines[index].replace(/^\s*[-*] /u, '').trim()); index += 1; }
      nodes.push({ type: 'bulletList', content: items.map((item) => ({ type: 'listItem', content: [paragraph(item)] })) });
      continue;
    }
    const text = [];
    while (index < lines.length && lines[index].trim() !== '' && !/^\s*(?:```|\||[-*] )/u.test(lines[index])) { text.push(lines[index].trim()); index += 1; }
    nodes.push(paragraph(text.join(' ')));
  }
  return nodes;
}

/**
 * Render one task deterministically. format "text" returns Markdown; format
 * "rich-json" returns rich document nodes built from RICH_NODE_TYPES only.
 */
export function renderTask(task, { language = 'en', format = 'text' } = {}) {
  const sections = Array.isArray(task?.sections) ? task.sections : [];
  if (format === 'rich-json') {
    const nodes = [
      { type: 'heading', attrs: { level: 2 }, content: [textNode(taskHeading(task))] },
      { type: 'bulletList', content: metaLines(task, language).map((line) => ({ type: 'listItem', content: [paragraph(line)] })) },
    ];
    sections.forEach((section, index) => {
      nodes.push({ type: 'heading', attrs: { level: 3 }, content: [textNode(`${index + 1}. ${sectionLabel(section?.key, language) ?? section?.key}`)] });
      nodes.push(...contentNodes(section?.content));
    });
    return nodes;
  }
  if (format !== 'text') throw new TypeError('format must be text or rich-json');
  const parts = [`## ${taskHeading(task)}`, metaLines(task, language).map((line) => `- ${line}`).join('\n')];
  sections.forEach((section, index) => {
    parts.push(`### ${index + 1}. ${sectionLabel(section?.key, language) ?? section?.key}`);
    parts.push(String(section?.content ?? '').replace(/\r\n?/gu, '\n').trim());
  });
  return parts.join('\n\n');
}

function renderedTasks(data) {
  const language = data?.language ?? 'en';
  return (Array.isArray(data?.tasks) ? data.tasks : []).map((task) => renderTask(task, { language, format: 'text' })).join('\n\n');
}

function fence(info, value) {
  return `\`\`\`${info}\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

/** Full tasks/<scope>.md text: lifecycle frontmatter, title, preamble, rendered tasks and data blocks. */
export function renderTasksDocument({ data, write_plans: writePlans = [] } = {}) {
  if (!data || typeof data !== 'object') throw new TypeError('data must be the task-breakdown data block');
  const id = `task-breakdown-${data.project_slug}-${data.scope}`;
  const frontmatter = [
    '---',
    `artifact_id: ${id}`,
    'artifact_kind: task-breakdown',
    `change_ref: ${id}`,
    'source_spec: none',
    'source_plan: none',
    'commit_policy: conditional',
    'owner: sdcorejs-product',
    'schema_version: 1',
    `updated_at: ${data.updated_at}`,
    `redaction_applied: ${data.redaction_applied === true}`,
    '---',
  ].join('\n');
  const parts = [frontmatter, `# ${data.title ?? id}`];
  if (isText(data.preamble)) parts.push(data.preamble.replace(/\r\n?/gu, '\n').trim());
  const tasks = renderedTasks(data);
  if (tasks) parts.push(tasks);
  parts.push(fence(TASKS_DATA_FENCE, data));
  for (const block of writePlans) parts.push(fence(WRITE_PLAN_FENCE, block));
  return `${parts.join('\n\n')}\n`;
}

function fencedBlocks(text, info) {
  const pattern = new RegExp(`^\`\`\`${info.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}\\n([\\s\\S]*?)\\n\`\`\`$`, 'gmu');
  return [...text.matchAll(pattern)].map((match) => ({ index: match.index, raw: match[1] }));
}

/** Parse a tasks document into frontmatter, data block, write plan blocks and the rendered task text. */
export function parseTasksDocument(text) {
  const normalized = String(text ?? '').replace(/\r\n?/gu, '\n');
  const errors = [];
  let frontmatter = null;
  const head = normalized.match(/^---\n([\s\S]*?)\n---\n/u);
  if (!head) errors.push(issue('FRONTMATTER_INVALID', '(root)', 'tasks documents start with YAML frontmatter'));
  else {
    try { frontmatter = parseApprovedFrontmatter(head[1]); } catch (error) { errors.push(issue('FRONTMATTER_INVALID', '(root)', error.message)); }
  }
  const dataBlocks = fencedBlocks(normalized, TASKS_DATA_FENCE);
  let data = null;
  if (dataBlocks.length === 0) errors.push(issue('DATA_BLOCK_MISSING', '(root)', `a \`\`\`${TASKS_DATA_FENCE} block is required`));
  if (dataBlocks.length > 1) errors.push(issue('DATA_BLOCK_DUPLICATE', '(root)', 'exactly one data block is allowed'));
  if (dataBlocks.length >= 1) {
    try { data = JSON.parse(dataBlocks[0].raw); } catch (error) { errors.push(issue('DATA_BLOCK_INVALID', 'data', error.message)); }
  }
  const writePlans = [];
  for (const [index, block] of fencedBlocks(normalized, WRITE_PLAN_FENCE).entries()) {
    try { writePlans.push(JSON.parse(block.raw)); } catch (error) { errors.push(issue('WRITE_PLAN_INVALID', `write_plans[${index}]`, error.message)); }
  }
  let rendered = null;
  if (data && dataBlocks.length >= 1 && Array.isArray(data.tasks) && data.tasks.length > 0) {
    const firstHeading = `## ${taskHeading(data.tasks[0])}`;
    const start = normalized.indexOf(`\n${firstHeading}\n`);
    rendered = start === -1 || start > dataBlocks[0].index ? '' : normalized.slice(start + 1, dataBlocks[0].index).trim();
  }
  return { frontmatter, data, write_plans: writePlans, rendered, errors };
}

function taskIdsOf(data) {
  const ids = new Set();
  for (const task of Array.isArray(data?.tasks) ? data.tasks : []) if (task?.meta?.task_id) ids.add(task.meta.task_id);
  for (const tombstone of Array.isArray(data?.tombstones) ? data.tombstones : []) if (tombstone?.task_id) ids.add(tombstone.task_id);
  return ids;
}

/**
 * Validate a whole tasks document: lifecycle frontmatter, data block, each task,
 * points recomputed from the rubric breakdown, PRD coverage, ticket mapping,
 * rendered text, write plan blocks, secrets, and task ids reused by sibling files.
 */
export function validateTasksDocument(text, { project_slug: projectSlug, scope, siblings = [] } = {}) {
  const parsed = parseTasksDocument(text);
  const errors = [...parsed.errors];
  const { frontmatter, data } = parsed;
  if (!isSafeProjectSegment(projectSlug) || !isSafeProjectSegment(scope)) errors.push(issue('SCOPE_MISMATCH', '(options)', 'project_slug and scope must be safe project segments'));
  if (frontmatter) {
    const expected = {
      artifact_kind: 'task-breakdown',
      change_ref: `task-breakdown-${projectSlug}-${scope}`,
      source_spec: 'none',
      source_plan: 'none',
      commit_policy: 'conditional',
      owner: 'sdcorejs-product',
      schema_version: 1,
    };
    for (const [field, value] of Object.entries(expected)) {
      if (frontmatter[field] !== value) errors.push(issue('FRONTMATTER_FIELD_INVALID', field, `${field} must be ${value}`));
    }
    if (Number.isNaN(Date.parse(frontmatter.updated_at))) errors.push(issue('FRONTMATTER_FIELD_INVALID', 'updated_at', 'updated_at must be an ISO-8601 timestamp'));
    if (typeof frontmatter.redaction_applied !== 'boolean') errors.push(issue('FRONTMATTER_FIELD_INVALID', 'redaction_applied', 'redaction_applied must be boolean'));
  }
  if (data) {
    if (data.schema_version !== 1) errors.push(issue('DATA_SCHEMA_UNSUPPORTED', 'data.schema_version', 'only schema_version 1 is supported'));
    if (data.project_slug !== projectSlug || data.scope !== scope) errors.push(issue('SCOPE_MISMATCH', 'data', `data block belongs to ${data.project_slug}/${data.scope}`));
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    const seen = new Set();
    const retired = new Set((Array.isArray(data.tombstones) ? data.tombstones : []).map((entry) => entry?.task_id));
    tasks.forEach((task, index) => {
      for (const error of validateTask(task).errors) errors.push({ ...error, path: `tasks[${index}].${error.path}` });
      const id = task?.meta?.task_id;
      if (seen.has(id)) errors.push(issue('TASK_ID_DUPLICATE', `tasks[${index}]`, `${id} appears twice`));
      seen.add(id);
      if (retired.has(id)) errors.push(issue('TASK_ID_REUSED', `tasks[${index}]`, `${id} is tombstoned in this document`));
      try {
        if (scoreTask(task?.breakdown).points !== task?.meta?.size_points) {
          errors.push(issue('POINTS_MISMATCH', `tasks[${index}].meta.size_points`, 'size_points must equal the score of the stored rubric breakdown'));
        }
      } catch (error) {
        errors.push(issue('BREAKDOWN_INVALID', `tasks[${index}].breakdown`, error.message));
      }
    });
    const coverage = data.coverage ?? {};
    const result = validatePrdCoverage({
      requirements: coverage.requirements ?? [],
      exclusions: coverage.exclusions ?? [],
      roles: coverage.roles ?? [],
      tasks: tasks.map((task) => ({ task_id: task?.meta?.task_id, role: task?.meta?.role, covers: task?.covers })),
    });
    for (const missing of result.missing) errors.push(issue('COVERAGE_MISSING', 'data.coverage', `${missing.requirement_id} has no ${missing.role} task or exclusion`));
    for (const id of Object.keys(data.tickets ?? {})) {
      if (!seen.has(id)) errors.push(issue('TICKET_UNKNOWN_TASK', `data.tickets.${id}`, 'ticket mapping must point to a task of this document'));
    }
    for (const sibling of siblings) {
      const other = parseTasksDocument(sibling?.text);
      if (!other.data) { errors.push(issue('SIBLING_INVALID', sibling?.path ?? '(sibling)', 'sibling tasks document has no readable data block')); continue; }
      const otherIds = taskIdsOf(other.data);
      for (const id of seen) if (otherIds.has(id)) errors.push(issue('TASK_ID_REUSED', sibling.path, `${id} is already used or tombstoned in ${sibling.path}`));
    }
    if (tasks.length > 0 && parsed.rendered !== renderedTasks(data)) {
      errors.push(issue('RENDER_MISMATCH', 'rendered', 'rendered task sections must equal renderTask of the data block; render the document again'));
    }
  }
  const runs = new Set();
  parsed.write_plans.forEach((block, index) => {
    if (typeof block?.run_id !== 'string' || block.run_id.trim() === '') errors.push(issue('WRITE_PLAN_INVALID', `write_plans[${index}]`, 'run_id is required'));
    else if (runs.has(block.run_id)) errors.push(issue('WRITE_PLAN_DUPLICATE_RUN', `write_plans[${index}]`, `two write plan blocks for ${block.run_id}`));
    runs.add(block?.run_id);
  });
  for (const finding of scanSecrets(String(text ?? ''), { source: 'tasks-document' }).findings) {
    errors.push(issue('SECRET_VALUE_FORBIDDEN', `line ${finding.line}`, `a ${finding.kind} value must not be stored`));
  }
  return { valid: errors.length === 0, errors, frontmatter, data, write_plans: parsed.write_plans };
}

/** Report rows for renderReport from a data block: ticket key, source, role, title, size, assignee, waiting on. */
export function reportRows(data) {
  return (Array.isArray(data?.tasks) ? data.tasks : []).map((task) => ({
    ticket: data?.tickets?.[task?.meta?.task_id]?.key ?? '',
    source: Array.isArray(task?.meta?.source_refs) ? task.meta.source_refs[0] ?? '' : '',
    role: task?.meta?.role ?? '',
    summary: task?.title ?? '',
    size: task?.meta?.size_points ?? '',
    assignee: task?.meta?.suggested_assignee ?? '',
    waiting_on: task?.waiting_on ?? '',
  }));
}
