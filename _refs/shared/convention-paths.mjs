import { systemRegistry } from './system-registry.mjs';

/**
 * Deterministic path contract for `.sdcorejs/conventions/**`.
 *
 * Conventions are one rule per file so that concurrent module work never
 * contends on a single mutable catalog. That only holds if the path itself
 * carries the scope, so every helper here fails closed instead of guessing:
 * an unrecognized depth, extension, or identifier is `unknown`, never a rule.
 */

const SAFE_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const RULE_EXTENSION = '.yaml';
const POLICY_FILE = 'policy.yaml';

export const CONVENTION_ROOT = systemRegistry.artifact_roots.conventions;
export const CONVENTION_POLICY_PATH = `${CONVENTION_ROOT}/${POLICY_FILE}`;

/** Path segment that follows the root for each convention scope. */
export const CONVENTION_SCOPE_DIRECTORIES = Object.freeze({
  repository: 'repository',
  module: 'modules',
  'portal-composition': 'portal-composition',
});

export const CONVENTION_SCOPE_KINDS = Object.freeze([
  ...systemRegistry.convention_scope_kinds,
]);

export function normalizeConventionPath(value) {
  return String(value ?? '')
    .replaceAll('\\', '/')
    .replace(/^\.\//u, '');
}

export function isRelativeConventionPath(value) {
  const normalized = normalizeConventionPath(value);
  return (
    normalized !== '' &&
    !normalized.startsWith('/') &&
    !/^[A-Za-z]:\//u.test(normalized) &&
    !normalized.split('/').includes('..')
  );
}

export function isSafeConventionSegment(value) {
  return SAFE_SEGMENT.test(value ?? '');
}

export const isSafeCategoryId = isSafeConventionSegment;
export const isSafeModuleId = isSafeConventionSegment;

/**
 * Rule identifiers are dotted paths such as `api.resource-segment.cardinality`.
 * Each dotted part follows the same kebab-case rule as a path segment, so a
 * rule id can be mapped to a filename without inventing an escaping scheme.
 */
export function isSafeRuleId(value) {
  const raw = String(value ?? '');
  if (raw === '' || raw.length > 120) return false;
  return raw.split('.').every((part) => SAFE_SEGMENT.test(part));
}

/** Filename stem for a rule id. Deterministic and reversible enough to compare. */
export function ruleFileStem(ruleId) {
  if (!isSafeRuleId(ruleId)) {
    throw new TypeError('rule id must be dotted lowercase kebab-case segments');
  }
  return ruleId.replaceAll('.', '-');
}

function assertScope(scopeKind) {
  if (!Object.hasOwn(CONVENTION_SCOPE_DIRECTORIES, scopeKind)) {
    throw new TypeError(`unsupported convention scope kind: ${scopeKind}`);
  }
  return scopeKind;
}

/**
 * Canonical write path for one rule.
 *
 * `module` scope requires a module id; the other scopes reject one, because a
 * module rule stored outside `modules/<module-id>/` would lose the ownership
 * signal that keeps it out of a portal.
 */
export function resolveConventionRulePath({
  scope_kind: scopeKind,
  module_id: moduleId = null,
  category,
  rule_id: ruleId,
} = {}) {
  assertScope(scopeKind);
  if (!isSafeCategoryId(category)) {
    throw new TypeError('convention category must be a lowercase kebab-case identifier');
  }
  const stem = ruleFileStem(ruleId);
  const directory = CONVENTION_SCOPE_DIRECTORIES[scopeKind];
  if (scopeKind === 'module') {
    if (!isSafeModuleId(moduleId)) {
      throw new TypeError('module-scoped conventions require a kebab-case module id');
    }
    return `${CONVENTION_ROOT}/${directory}/${moduleId}/${category}/${stem}${RULE_EXTENSION}`;
  }
  if (moduleId != null) {
    throw new TypeError(`${scopeKind} conventions must not declare a module id`);
  }
  return `${CONVENTION_ROOT}/${directory}/${category}/${stem}${RULE_EXTENSION}`;
}

/**
 * Classify any repository-relative path against the convention root.
 *
 * Returns `{ ok: false, code }` for anything that is not a valid convention
 * artifact so callers can block rather than infer. `code` values are stable
 * because artifact closure and Git staging report them.
 */
export function classifyConventionPath(value) {
  if (!isRelativeConventionPath(value)) {
    return { ok: false, code: 'INVALID_RELATIVE_PATH', path: normalizeConventionPath(value) };
  }
  const normalized = normalizeConventionPath(value);
  if (normalized === CONVENTION_POLICY_PATH) {
    return {
      ok: true,
      kind: 'convention',
      document_type: 'policy',
      scope_kind: 'repository',
      module_id: null,
      category: null,
      rule_file: null,
      path: normalized,
    };
  }
  if (!normalized.startsWith(`${CONVENTION_ROOT}/`)) {
    return { ok: false, code: 'OUTSIDE_CONVENTION_ROOT', path: normalized };
  }
  const segments = normalized.slice(CONVENTION_ROOT.length + 1).split('/');
  const [scopeDirectory] = segments;
  const scopeKind = Object.entries(CONVENTION_SCOPE_DIRECTORIES).find(
    ([, directory]) => directory === scopeDirectory,
  )?.[0];
  if (!scopeKind) {
    return { ok: false, code: 'UNKNOWN_CONVENTION_SCOPE', path: normalized };
  }
  const expectedDepth = scopeKind === 'module' ? 4 : 3;
  if (segments.length !== expectedDepth) {
    return { ok: false, code: 'INVALID_CONVENTION_PATH_DEPTH', path: normalized };
  }
  const moduleId = scopeKind === 'module' ? segments[1] : null;
  const category = segments.at(-2);
  const file = segments.at(-1);
  if (scopeKind === 'module' && !isSafeModuleId(moduleId)) {
    return { ok: false, code: 'INVALID_CONVENTION_MODULE_ID', path: normalized };
  }
  if (!isSafeCategoryId(category)) {
    return { ok: false, code: 'INVALID_CONVENTION_CATEGORY', path: normalized };
  }
  if (!file.endsWith(RULE_EXTENSION)) {
    return { ok: false, code: 'UNSUPPORTED_CONVENTION_EXTENSION', path: normalized };
  }
  const stem = file.slice(0, -RULE_EXTENSION.length);
  if (!isSafeConventionSegment(stem)) {
    return { ok: false, code: 'INVALID_CONVENTION_RULE_FILE', path: normalized };
  }
  return {
    ok: true,
    kind: 'convention',
    document_type: 'rule',
    scope_kind: scopeKind,
    module_id: moduleId,
    category,
    rule_file: stem,
    path: normalized,
  };
}

export function isConventionPath(value) {
  return classifyConventionPath(value).ok === true;
}

/**
 * A rule body declares its own scope. When the declared scope disagrees with the
 * path, neither one is trustworthy, so the mismatch is reported instead of
 * letting the path silently win.
 */
export function validateConventionScopeAgreement({ path: candidatePath, scope = {}, rule = {} } = {}) {
  const errors = [];
  const classification = classifyConventionPath(candidatePath);
  if (!classification.ok) {
    errors.push(`convention path is invalid: ${classification.code}`);
    return { ok: false, errors, classification };
  }
  if (classification.document_type !== 'rule') return { ok: true, errors, classification };
  if (scope.kind !== classification.scope_kind) {
    errors.push(
      `scope.kind ${scope.kind ?? 'missing'} contradicts path scope ${classification.scope_kind}`,
    );
  }
  const declaredModule = scope.module_id ?? null;
  if (declaredModule !== classification.module_id) {
    errors.push(
      `scope.module_id ${declaredModule ?? 'null'} contradicts path module ${classification.module_id ?? 'null'}`,
    );
  }
  if (rule.category !== classification.category) {
    errors.push(
      `rule.category ${rule.category ?? 'missing'} contradicts path category ${classification.category}`,
    );
  }
  if (isSafeRuleId(rule.id) && ruleFileStem(rule.id) !== classification.rule_file) {
    errors.push(`rule.id ${rule.id} does not map to file ${classification.rule_file}`);
  }
  return { ok: errors.length === 0, errors, classification };
}
