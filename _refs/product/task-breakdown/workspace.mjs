// Pure validators for project workspace files (.sdcorejs/projects/<slug>/).
// Config text is untrusted: it can be edited by hand, so every value is scanned
// for secrets and per-run rules are never persisted unless marked "always".
import { parseApprovedFrontmatter } from '../../shared/approved-artifact.mjs';
import { isSafeProjectSegment } from '../../shared/artifact-paths.mjs';
import { redactValue, scanSecrets } from './safety.mjs';

export const PROJECT_CONFIG_KINDS = Object.freeze(['project', 'task-breakdown-config']);
export const SOURCE_READ_VIA = Object.freeze(['connector', 'web', 'export', 'paste']);

const LIFECYCLE_FIELDS = Object.freeze([
  'artifact_id',
  'artifact_kind',
  'change_ref',
  'source_spec',
  'source_plan',
  'commit_policy',
  'owner',
  'schema_version',
  'updated_at',
  'redaction_applied',
]);

function issue(code, path, message) {
  return { code, path, message };
}

function isText(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function validateLifecycle(config, errors) {
  for (const field of LIFECYCLE_FIELDS) {
    if (config[field] === undefined || config[field] === null || config[field] === '') {
      errors.push(issue('FIELD_REQUIRED', field, `${field} is required`));
    }
  }
  if (config.schema_version !== undefined && config.schema_version !== 1) {
    errors.push(issue('SCHEMA_VERSION_UNSUPPORTED', 'schema_version', 'only schema_version 1 is supported; refuse instead of guessing'));
  }
  if (config.artifact_kind !== undefined && config.artifact_kind !== 'project-config') {
    errors.push(issue('ARTIFACT_KIND_INVALID', 'artifact_kind', 'project files use artifact_kind project-config'));
  }
  if (config.commit_policy !== undefined && config.commit_policy !== 'conditional') {
    errors.push(issue('COMMIT_POLICY_INVALID', 'commit_policy', 'project workspace files are shared durable state with commit_policy conditional'));
  }
  if (config.owner !== undefined && config.owner !== 'sdcorejs-product') {
    errors.push(issue('OWNER_INVALID', 'owner', 'project workspace files are owned by sdcorejs-product'));
  }
  if (config.change_ref !== undefined && !/^project-[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(String(config.change_ref))) {
    errors.push(issue('FIELD_INVALID', 'change_ref', 'change_ref must be project-<slug>'));
  }
  for (const field of ['source_spec', 'source_plan']) {
    if (config[field] !== undefined && config[field] !== 'none') errors.push(issue('FIELD_INVALID', field, `${field} must be none`));
  }
  if (config.updated_at !== undefined && Number.isNaN(Date.parse(config.updated_at))) {
    errors.push(issue('FIELD_INVALID', 'updated_at', 'updated_at must be an ISO-8601 timestamp'));
  }
  if (config.redaction_applied !== undefined && typeof config.redaction_applied !== 'boolean') {
    errors.push(issue('FIELD_INVALID', 'redaction_applied', 'redaction_applied must be boolean'));
  }
}

function validateProject(config, errors) {
  const project = config.project;
  if (!project || typeof project !== 'object') {
    errors.push(issue('FIELD_REQUIRED', 'project', 'project.name and project.slug are required'));
    return;
  }
  if (!isText(project.name)) errors.push(issue('FIELD_REQUIRED', 'project.name', 'project.name is required'));
  if (!isSafeProjectSegment(project.slug)) errors.push(issue('FIELD_INVALID', 'project.slug', 'project.slug must be a safe project segment'));
  if (config.sources !== undefined) {
    if (!Array.isArray(config.sources)) {
      errors.push(issue('SOURCE_ENTRY_INVALID', 'sources', 'sources must be an array'));
    } else {
      config.sources.forEach((source, index) => {
        if (!source || !isText(source.kind) || !SOURCE_READ_VIA.includes(source.read_via)) {
          errors.push(issue('SOURCE_ENTRY_INVALID', `sources[${index}]`, `each source needs kind and read_via in ${SOURCE_READ_VIA.join(', ')}`));
        }
      });
    }
  }
}

function validateTaskBreakdownConfig(config, errors) {
  if (!Array.isArray(config.roles) || config.roles.length === 0) {
    errors.push(issue('ROLE_ENTRY_INVALID', 'roles', 'roles must be a non-empty array'));
  } else {
    config.roles.forEach((role, index) => {
      if (!role || !isSafeProjectSegment(role.id) || !isText(role.label)) {
        errors.push(issue('ROLE_ENTRY_INVALID', `roles[${index}]`, 'each role needs a kebab-case id and a label'));
      }
    });
  }
  if (config.roster !== undefined) {
    if (!Array.isArray(config.roster)) {
      errors.push(issue('ROSTER_ENTRY_INVALID', 'roster', 'roster must be an array'));
    } else {
      config.roster.forEach((member, index) => {
        if (!member || !isText(member.name) || !Array.isArray(member.roles) || member.roles.length === 0) {
          errors.push(issue('ROSTER_ENTRY_INVALID', `roster[${index}]`, 'each roster entry needs a name and at least one role'));
        }
      });
    }
  }
  for (const field of ['velocity_per_member', 'sprint_length_days']) {
    if (config[field] !== undefined && !(typeof config[field] === 'number' && config[field] > 0)) {
      errors.push(issue('FIELD_INVALID', field, `${field} must be a positive number`));
    }
  }
}

function validateRunRules(config, errors) {
  if (config.run_rules === undefined) return;
  if (!Array.isArray(config.run_rules)) {
    errors.push(issue('RUN_RULE_PERSISTED', 'run_rules', 'run_rules must be an array of rules marked persist: always'));
    return;
  }
  config.run_rules.forEach((rule, index) => {
    if (rule?.persist !== 'always') {
      errors.push(issue('RUN_RULE_PERSISTED', `run_rules[${index}]`, 'a per-run rule is only stored when the user said to apply it always'));
    }
  });
}

/** Validate parsed frontmatter of project.md or task-breakdown.config.md. */
export function validateProjectConfig(config, { kind } = {}) {
  const errors = [];
  if (!PROJECT_CONFIG_KINDS.includes(kind)) throw new TypeError(`kind must be one of ${PROJECT_CONFIG_KINDS.join(', ')}`);
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return { valid: false, errors: [issue('CONFIG_INVALID', '(root)', 'config must be an object')] };
  }
  validateLifecycle(config, errors);
  if (kind === 'project') validateProject(config, errors);
  else validateTaskBreakdownConfig(config, errors);
  validateRunRules(config, errors);
  for (const finding of redactValue(config, { source: kind }).findings) {
    errors.push(issue('SECRET_VALUE_FORBIDDEN', finding.field, `a ${finding.kind} value must not be stored; keep key names only`));
  }
  return { valid: errors.length === 0, errors };
}

/** Validate a whole project file: frontmatter fields, preserved unknown fields and the body. */
export function validateProjectFileText(text, { kind } = {}) {
  const normalized = String(text ?? '').replace(/\r\n?/gu, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/u);
  if (!match) {
    return { valid: false, errors: [issue('FRONTMATTER_INVALID', '(root)', 'project files start with YAML frontmatter')], frontmatter: null, body: normalized };
  }
  let frontmatter;
  try {
    frontmatter = parseApprovedFrontmatter(match[1]);
  } catch (error) {
    return { valid: false, errors: [issue('FRONTMATTER_INVALID', '(root)', error.message)], frontmatter: null, body: normalized.slice(match[0].length) };
  }
  const body = normalized.slice(match[0].length);
  const result = validateProjectConfig(frontmatter, { kind });
  const errors = [...result.errors];
  for (const finding of scanSecrets(body, { source: kind }).findings) {
    errors.push(issue('SECRET_VALUE_FORBIDDEN', 'body', `a ${finding.kind} value on line ${finding.line} must not be stored`));
  }
  return { valid: errors.length === 0, errors, frontmatter, body };
}

const IDENTITY_KEYS = Object.freeze({
  roster: (entry) => entry?.name,
  roles: (entry) => entry?.id,
  sources: (entry) => `${entry?.kind}::${entry?.match ?? ''}`,
});

/**
 * Merge an update into an existing config without dropping unknown fields.
 * Lists merge by identity; per-run rules not marked "always" are dropped.
 */
export function mergeProjectConfig(existing, updates) {
  const merged = structuredClone(existing ?? {});
  for (const [key, value] of Object.entries(updates ?? {})) {
    if (IDENTITY_KEYS[key] && Array.isArray(value)) {
      const identity = IDENTITY_KEYS[key];
      const list = Array.isArray(merged[key]) ? merged[key] : [];
      for (const entry of value) {
        const index = list.findIndex((current) => identity(current) === identity(entry));
        if (index === -1) list.push(structuredClone(entry));
        else list[index] = { ...list[index], ...structuredClone(entry) };
      }
      merged[key] = list;
    } else {
      merged[key] = structuredClone(value);
    }
  }
  if (Array.isArray(merged.run_rules)) {
    const kept = merged.run_rules.filter((rule) => rule?.persist === 'always');
    if (kept.length > 0) merged.run_rules = kept;
    else delete merged.run_rules;
  }
  return merged;
}
