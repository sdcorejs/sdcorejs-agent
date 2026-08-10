import { createHash } from 'node:crypto';
import {
  CONVENTION_POLICY_PATH,
  CONVENTION_ROOT,
  classifyConventionPath,
  isSafeCategoryId,
  isSafeModuleId,
  isSafeRuleId,
  normalizeConventionPath,
  resolveConventionRulePath,
  validateConventionScopeAgreement,
} from './convention-paths.mjs';
import { systemRegistry } from './system-registry.mjs';

/**
 * Deterministic contract for project convention rules, the capture policy, and
 * the read-only `convention_context` that review emits.
 *
 * The division of labour is deliberate: this module validates schemas,
 * ownership, paths, precedence, redaction, and lifecycle. It never classifies
 * semantics. Deciding that `isActive` and `isActivated` denote the same
 * predicate is agent work with evidence; encoding that judgement as a
 * repository-wide regex would produce confident nonsense.
 */

export const CONVENTION_SCHEMA_VERSION = 1;

const RULE_STATUSES = new Set(systemRegistry.convention_rule_statuses);
const ENFORCEMENT_LEVELS = new Set(systemRegistry.convention_enforcement_levels);
const SOURCE_KINDS = new Set(systemRegistry.convention_source_kinds);
const CAPTURE_MODES = new Set(systemRegistry.convention_capture_modes);
const SCOPE_KINDS = new Set(systemRegistry.convention_scope_kinds);
export const CONSISTENCY_FINDING_KINDS = Object.freeze([
  ...systemRegistry.consistency_finding_kinds,
]);
const FINDING_KINDS = new Set(CONSISTENCY_FINDING_KINDS);
const CONFIDENCE_LEVELS = new Set(['high', 'medium', 'low']);
const FRESHNESS_STATUSES = new Set(['current', 'stale', 'unknown']);

/**
 * Only an authoritative decision may become an accepted rule. An inferred code
 * pattern stays `observed` no matter how dominant it is, because "most files do
 * X" is an observation about the past, not a decision about the future.
 */
const AUTO_ACCEPTABLE_SOURCE_KINDS = Object.freeze({
  'explicit-user-decision': 'explicit_user_decisions',
  'approved-specification': 'approved_specs_and_plans',
  'approved-architecture': 'approved_specs_and_plans',
  'approved-plan': 'approved_specs_and_plans',
  'authoritative-repository-config': 'authoritative_repository_config',
  'public-external-contract': 'public_external_contracts',
});

const INFERRED_SOURCE_KINDS = new Set([
  'existing-code-observation',
  'imported-legacy-convention',
]);

export const DEFAULT_CONVENTION_POLICY = Object.freeze({
  schema_version: CONVENTION_SCHEMA_VERSION,
  artifact_id: 'convention-policy',
  artifact_kind: 'convention',
  document_type: 'policy',
  change_ref: 'shared-project-conventions',
  source_spec: 'none',
  source_plan: 'none',
  commit_policy: 'conditional',
  owner: 'sdcorejs-explore',
  capture: Object.freeze({
    mode: 'after-review',
    persist: Object.freeze({
      accepted_rules: true,
      observed_candidates: true,
      conflicts: true,
      stale_updates: true,
      deprecated_updates: true,
    }),
    auto_accept: Object.freeze({
      explicit_user_decisions: true,
      approved_specs_and_plans: true,
      authoritative_repository_config: true,
      public_external_contracts: true,
      inferred_patterns: false,
    }),
    inference: Object.freeze({
      minimum_independent_evidence: 3,
      dominance_ratio: 0.8,
    }),
    enforcement: Object.freeze({
      accepted: 'required',
      observed: 'advisory',
      conflicted: 'none',
      deprecated: 'compatibility-aware',
      stale: 'none',
    }),
    ownership: Object.freeze({ shared_writes: 'integration-owner-only' }),
  }),
});

// ---------------------------------------------------------------------------
// Redaction
// ---------------------------------------------------------------------------

const SECRET_KEY_HINT =
  /(?:api[_-]?key|authorization|client[_-]?secret|cookie|credential|passphrase|password|private[_-]?key|refresh[_-]?token|secret|session[_-]?id|token)/iu;

/**
 * A credential assigned inside the observed snippet itself.
 *
 * Evidence values are code excerpts, so a secret usually arrives as
 * `password: "hunter2"` in the middle of a line rather than as the whole value.
 * The locator check above never sees that, and the closure-time scanner is
 * line-anchored, so without this pattern the leak clears both gates. Anchoring
 * is deliberately absent here for the same reason.
 *
 * Placeholders, environment lookups, and config references are excluded: those
 * are the shape of correct code, and flagging them would train reviewers to
 * ignore this check.
 */
const SECRET_ASSIGNMENT_HINT =
  /(?:api[_-]?key|authorization|client[_-]?secret|passphrase|password|private[_-]?key|refresh[_-]?token|secret|token)\s*[:=]\s*(?!\s*(?:process\.env|import\.meta\.env|env\[|config\.|configService|["'`]?\[REDACTED\]|["'`]?<|["'`]?\$\{|["'`]?(?:none|null|undefined|true|false)\b|["'`]{2}))(?:"[^"\n]+"|'[^'\n]+'|`[^`\n]+`|[^\s,;)}]+)/iu;
const SECRET_VALUE_HINT = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\./u,
  /\b(?:sk|pk|ghp|gho|xox[baprs])[-_][A-Za-z0-9_-]{12,}\b/u,
  /\b[a-z][a-z0-9+.-]*:\/\/[^\s/@]+:[^\s/@]+@/iu,
];
const PII_HINT = [
  /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/u,
  /\b(?:\d[ -]?){13,19}\b/u,
  /\b\d{3}-\d{2}-\d{4}\b/u,
];

export const REDACTED = '[REDACTED]';

/**
 * Convention evidence is stored durably and committed, so a secret that reaches
 * it is a leak with a long tail. Screening is applied to the observed value and
 * to any key-shaped locator, and a positive hit is a rejection rather than a
 * silent rewrite: quietly replacing a token would hide that the reviewer read
 * one in the first place.
 */
export function screenConventionEvidence(entry = {}) {
  const categories = new Set();
  const observed = entry.observed == null ? '' : String(entry.observed);
  const locator = entry.locator == null ? '' : String(entry.locator);
  const candidate = `${locator}\n${observed}`;
  if (SECRET_KEY_HINT.test(locator) && observed !== '' && observed !== REDACTED) {
    categories.add('secret-like-assignment');
  }
  if (SECRET_ASSIGNMENT_HINT.test(observed)) categories.add('secret-like-assignment');
  for (const pattern of SECRET_VALUE_HINT) {
    if (pattern.test(candidate)) categories.add('secret-value');
  }
  for (const pattern of PII_HINT) {
    if (pattern.test(candidate)) categories.add('pii');
  }
  return [...categories].sort();
}

export function validateEvidenceRedaction(evidence = []) {
  const violations = [];
  for (const [index, entry] of evidence.entries()) {
    const categories = screenConventionEvidence(entry);
    if (categories.length > 0) {
      violations.push({ index, path: entry?.path ?? null, categories });
    }
  }
  return { ok: violations.length === 0, violations };
}

// ---------------------------------------------------------------------------
// Canonical form and identity
// ---------------------------------------------------------------------------

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }
  if (typeof value === 'string') return value.replaceAll('\r\n', '\n').normalize('NFC');
  return value;
}

/**
 * Semantic identity of a rule document. Sync compares this hash, so a re-run
 * over unchanged evidence produces no write at all rather than a diff that only
 * moves keys or refreshes a timestamp.
 */
export function conventionContentHash(document) {
  return `sha256:${createHash('sha256')
    .update(JSON.stringify(canonicalize(document)))
    .digest('hex')}`;
}

/** Collision-safe identity for one evidence entry, used for dedup and ordering. */
function evidenceKey(entry = {}) {
  return JSON.stringify([entry.path ?? '', entry.locator ?? '', entry.observed ?? '']);
}

/** Stable, deduplicated evidence ordering so merges never reshuffle a file. */
export function normalizeEvidence(evidence = []) {
  const byKey = new Map();
  for (const entry of evidence) {
    if (!entry || typeof entry !== 'object') continue;
    const normalized = {
      path: normalizeConventionPath(entry.path ?? ''),
      locator: entry.locator ?? null,
      observed: entry.observed ?? null,
    };
    byKey.set(evidenceKey(normalized), normalized);
  }
  return [...byKey.values()].sort((left, right) =>
    evidenceKey(left) < evidenceKey(right) ? -1 : evidenceKey(left) > evidenceKey(right) ? 1 : 0,
  );
}

// ---------------------------------------------------------------------------
// Rule schema
// ---------------------------------------------------------------------------

function requireText(value, field, errors) {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`${field} must be non-empty text`);
    return false;
  }
  return true;
}

export function validateConventionRule(document, { path: candidatePath = null } = {}) {
  const errors = [];
  if (document == null || typeof document !== 'object' || Array.isArray(document)) {
    return { ok: false, errors: ['convention rule must be a mapping'], rule: null };
  }
  if (document.schema_version !== CONVENTION_SCHEMA_VERSION) {
    errors.push(`convention schema_version must be ${CONVENTION_SCHEMA_VERSION}`);
  }
  if (document.artifact_kind !== 'convention') {
    errors.push('artifact_kind must be convention');
  }
  if (document.document_type !== 'rule') {
    errors.push('document_type must be rule');
  }
  requireText(document.artifact_id, 'artifact_id', errors);
  requireText(document.change_ref, 'change_ref', errors);
  requireText(document.owner, 'owner', errors);
  if (!['with-change', 'conditional', 'never'].includes(document.commit_policy)) {
    errors.push('commit_policy must be with-change, conditional, or never');
  }

  const repositoryId = document.repository?.repository_id;
  if (!requireText(repositoryId, 'repository.repository_id', errors)) {
    // keep collecting other errors
  } else if (/^[A-Za-z]:[\\/]/u.test(repositoryId) || repositoryId.startsWith('/')) {
    errors.push('repository.repository_id must not be an absolute checkout path');
  }

  const scope = document.scope ?? {};
  if (!SCOPE_KINDS.has(scope.kind)) {
    errors.push(`scope.kind must be one of ${[...SCOPE_KINDS].join(', ')}`);
  }
  if (scope.kind === 'module') {
    if (!isSafeModuleId(scope.module_id)) {
      errors.push('module-scoped rules require a kebab-case scope.module_id');
    }
  } else if (scope.module_id != null) {
    errors.push('only module-scoped rules may declare scope.module_id');
  }

  const rule = document.rule ?? {};
  if (!isSafeRuleId(rule.id)) {
    errors.push('rule.id must be dotted lowercase kebab-case segments');
  }
  if (!isSafeCategoryId(rule.category)) {
    errors.push('rule.category must be a lowercase kebab-case identifier');
  }
  requireText(rule.concept_id, 'rule.concept_id', errors);
  requireText(rule.semantic_role, 'rule.semantic_role', errors);
  if (!RULE_STATUSES.has(rule.status)) {
    errors.push(`rule.status must be one of ${[...RULE_STATUSES].join(', ')}`);
  }
  if (!ENFORCEMENT_LEVELS.has(rule.enforcement)) {
    errors.push(`rule.enforcement must be one of ${[...ENFORCEMENT_LEVELS].join(', ')}`);
  }
  const expectedEnforcement = enforcementForStatus(rule.status);
  if (expectedEnforcement && rule.enforcement !== expectedEnforcement) {
    errors.push(
      `rule.enforcement ${rule.enforcement} contradicts status ${rule.status} (expected ${expectedEnforcement})`,
    );
  }
  if (rule.status !== 'conflicted' && rule.canonical?.value == null) {
    errors.push('rule.canonical.value is required unless the rule is conflicted');
  }
  if (rule.status === 'conflicted' && (rule.alternatives ?? []).length < 2) {
    errors.push('a conflicted rule must record at least two alternatives');
  }
  if (rule.status === 'deprecated' && !rule.replaced_by) {
    errors.push('a deprecated rule must name its replacement in rule.replaced_by');
  }

  const source = document.source ?? {};
  if (!SOURCE_KINDS.has(source.kind)) {
    errors.push(`source.kind must be one of ${[...SOURCE_KINDS].join(', ')}`);
  }
  if (rule.status === 'accepted' && INFERRED_SOURCE_KINDS.has(source.kind) && document.accepted_by == null) {
    errors.push(
      'an accepted rule inferred from code observation requires an explicit accepted_by decision',
    );
  }
  if (!CONFIDENCE_LEVELS.has(document.confidence)) {
    errors.push('confidence must be high, medium, or low');
  }

  const evidence = document.evidence ?? [];
  if (!Array.isArray(evidence) || evidence.length === 0) {
    errors.push('evidence must be a non-empty array');
  } else {
    for (const [index, entry] of evidence.entries()) {
      if (!entry?.path || !/^[^/\\]/u.test(String(entry.path))) {
        errors.push(`evidence[${index}].path must be repository-relative`);
      }
    }
  }
  const redaction = validateEvidenceRedaction(Array.isArray(evidence) ? evidence : []);
  if (!redaction.ok) {
    errors.push(
      `evidence contains unredacted sensitive material: ${redaction.violations
        .map(({ index, categories }) => `[${index}] ${categories.join('/')}`)
        .join(', ')}`,
    );
  }

  const freshness = document.freshness ?? {};
  if (!FRESHNESS_STATUSES.has(freshness.status)) {
    errors.push(`freshness.status must be one of ${[...FRESHNESS_STATUSES].join(', ')}`);
  }

  if (candidatePath != null) {
    const agreement = validateConventionScopeAgreement({
      path: candidatePath,
      scope,
      rule,
    });
    errors.push(...agreement.errors);
  }

  return { ok: errors.length === 0, errors, rule: errors.length === 0 ? document : null };
}

export function enforcementForStatus(status) {
  return {
    accepted: 'required',
    observed: 'advisory',
    conflicted: 'none',
    deprecated: 'compatibility-aware',
    stale: 'none',
  }[status] ?? null;
}

// ---------------------------------------------------------------------------
// Policy schema
// ---------------------------------------------------------------------------

export function validateConventionPolicy(document, { path: candidatePath = null } = {}) {
  const errors = [];
  if (document == null || typeof document !== 'object' || Array.isArray(document)) {
    return { ok: false, errors: ['convention policy must be a mapping'], policy: null };
  }
  if (candidatePath != null && normalizeConventionPath(candidatePath) !== CONVENTION_POLICY_PATH) {
    errors.push(`convention policy must live at ${CONVENTION_POLICY_PATH}`);
  }
  if (document.schema_version !== CONVENTION_SCHEMA_VERSION) {
    errors.push(`convention schema_version must be ${CONVENTION_SCHEMA_VERSION}`);
  }
  if (document.artifact_kind !== 'convention') errors.push('artifact_kind must be convention');
  if (document.document_type !== 'policy') errors.push('document_type must be policy');
  requireText(document.artifact_id, 'artifact_id', errors);
  requireText(document.owner, 'owner', errors);

  const capture = document.capture ?? {};
  if (!CAPTURE_MODES.has(capture.mode)) {
    errors.push(`capture.mode must be one of ${[...CAPTURE_MODES].join(', ')}`);
  }
  const autoAccept = capture.auto_accept ?? {};
  if (autoAccept.inferred_patterns === true) {
    errors.push('capture.auto_accept.inferred_patterns must stay false');
  }
  const inference = capture.inference ?? {};
  const minimumEvidence = inference.minimum_independent_evidence;
  if (!Number.isInteger(minimumEvidence) || minimumEvidence < 2) {
    errors.push('capture.inference.minimum_independent_evidence must be an integer of at least 2');
  }
  const dominance = inference.dominance_ratio;
  if (typeof dominance !== 'number' || dominance <= 0.5 || dominance > 1) {
    errors.push('capture.inference.dominance_ratio must be greater than 0.5 and at most 1');
  }
  const enforcement = capture.enforcement ?? {};
  for (const status of RULE_STATUSES) {
    const expected = enforcementForStatus(status);
    if (enforcement[status] !== expected) {
      errors.push(`capture.enforcement.${status} must be ${expected}`);
    }
  }
  if ((capture.ownership ?? {}).shared_writes !== 'integration-owner-only') {
    errors.push('capture.ownership.shared_writes must be integration-owner-only');
  }

  return { ok: errors.length === 0, errors, policy: errors.length === 0 ? document : null };
}

// ---------------------------------------------------------------------------
// Status resolution
// ---------------------------------------------------------------------------

/**
 * Decide the status a candidate may hold. This is where "dominance is not
 * authority" is enforced: an inferred pattern is capped at `observed`, a thin or
 * evenly split pattern stays a candidate or a conflict, and only an
 * authoritative source can reach `accepted`.
 */
export function resolveCandidateStatus({
  source_kind: sourceKind,
  independent_evidence: independentEvidence = 0,
  dominance_ratio: dominanceRatio = null,
  competing_values: competingValues = 0,
  policy = DEFAULT_CONVENTION_POLICY,
} = {}) {
  const capture = policy?.capture ?? DEFAULT_CONVENTION_POLICY.capture;
  const autoAccept = capture.auto_accept ?? {};
  const inference = capture.inference ?? {};
  const minimumEvidence = inference.minimum_independent_evidence ?? 3;
  const requiredDominance = inference.dominance_ratio ?? 0.8;

  if (!SOURCE_KINDS.has(sourceKind)) {
    return { status: null, reason: `unknown source kind: ${sourceKind}`, enforcement: null };
  }
  const autoAcceptFlag = AUTO_ACCEPTABLE_SOURCE_KINDS[sourceKind];
  if (autoAcceptFlag) {
    if (autoAccept[autoAcceptFlag] === true) {
      return {
        status: 'accepted',
        reason: `authoritative source ${sourceKind} is auto-acceptable under policy`,
        enforcement: 'required',
      };
    }
    return {
      status: 'observed',
      reason: `policy disables auto-accept for ${sourceKind}`,
      enforcement: 'advisory',
    };
  }

  if (competingValues > 1 || (dominanceRatio != null && dominanceRatio < requiredDominance)) {
    return {
      status: 'conflicted',
      reason: 'competing patterns or dominance below the configured ratio',
      enforcement: 'none',
    };
  }
  if (independentEvidence < minimumEvidence) {
    return {
      status: null,
      reason: `inferred pattern needs at least ${minimumEvidence} independent evidence items`,
      enforcement: null,
    };
  }
  return {
    status: 'observed',
    reason: 'inferred pattern is never auto-accepted',
    enforcement: 'advisory',
  };
}

// ---------------------------------------------------------------------------
// Precedence
// ---------------------------------------------------------------------------

export const CONVENTION_PRECEDENCE = Object.freeze([
  'explicit-user-decision',
  'current-public-or-authoritative-contract',
  'approved-specification',
  'approved-architecture',
  'approved-plan',
  'accepted-module-convention',
  'accepted-repository-convention',
  'accepted-portal-composition-convention',
  'observed-project-pattern',
  'framework-recommendation',
]);

const SOURCE_PRECEDENCE_LABEL = {
  'explicit-user-decision': 'explicit-user-decision',
  'public-external-contract': 'current-public-or-authoritative-contract',
  'authoritative-repository-config': 'current-public-or-authoritative-contract',
  'approved-specification': 'approved-specification',
  'approved-architecture': 'approved-architecture',
  'approved-plan': 'approved-plan',
};

const SCOPE_PRECEDENCE_LABEL = {
  module: 'accepted-module-convention',
  repository: 'accepted-repository-convention',
  'portal-composition': 'accepted-portal-composition-convention',
};

/**
 * Rank one rule for a concrete target. `null` means "not enforceable": stale and
 * conflicted rules stay loaded and visible but never win an argument.
 */
export function precedenceRank(rule, { module_id: targetModuleId = null } = {}) {
  const status = rule?.rule?.status;
  const scopeKind = rule?.scope?.kind;
  if (status === 'stale' || status === 'conflicted') return null;
  if (scopeKind === 'module' && rule.scope.module_id !== targetModuleId) return null;
  if (status === 'observed') {
    return CONVENTION_PRECEDENCE.indexOf('observed-project-pattern');
  }
  if (status === 'deprecated') {
    // Compatibility-aware: ranked below every accepted rule so it can never
    // outrank the replacement it points at, but still visible to callers.
    return CONVENTION_PRECEDENCE.indexOf('framework-recommendation');
  }
  const label =
    SOURCE_PRECEDENCE_LABEL[rule?.source?.kind] ?? SCOPE_PRECEDENCE_LABEL[scopeKind] ?? null;
  if (!label) return null;
  return CONVENTION_PRECEDENCE.indexOf(label);
}

/**
 * Tiebreaker within one precedence rank: the narrower scope wins.
 *
 * Source authority alone cannot decide between a module rule and a repository
 * rule that were both read from authoritative config - they would land on the
 * same rank and cancel each other out. Ordering module before repository before
 * portal-composition is what makes "a module rule refines the repository rule
 * inside that module" true, and it is also why a portal-composition rule can
 * never reach past a module's own semantics.
 */
function scopeSpecificity(rule) {
  return { module: 0, repository: 1, 'portal-composition': 2 }[rule?.scope?.kind] ?? 3;
}

export function conceptKey(rule) {
  return [
    rule?.rule?.concept_id ?? '',
    rule?.rule?.semantic_role ?? '',
    rule?.scope?.boundary ?? '',
  ].join('|');
}

function effectiveScopeKey(rule) {
  return [rule?.scope?.kind ?? '', rule?.scope?.module_id ?? '', conceptKey(rule)].join('|');
}

/**
 * Resolve which loaded rules are actually enforceable for a target.
 *
 * Two accepted rules that disagree at the same precedence are not silently
 * resolved by count or file order. They fail closed to `UNRESOLVED_CONVENTION`
 * so the ambiguity surfaces as a decision instead of a coin flip.
 */
export function resolveEffectiveRules(rules = [], { module_id: targetModuleId = null } = {}) {
  const enforced = new Map();
  const unresolved = [];
  const duplicates = [];
  const notEnforceable = [];
  const seenIds = new Map();

  for (const rule of rules) {
    const scopeKey = effectiveScopeKey(rule);
    const idKey = `${scopeKey}|${rule?.rule?.id ?? ''}`;
    if (seenIds.has(idKey)) {
      duplicates.push({
        rule_id: rule?.rule?.id ?? null,
        scope_key: scopeKey,
        paths: [seenIds.get(idKey), rule?.artifact_path ?? null],
      });
      continue;
    }
    seenIds.set(idKey, rule?.artifact_path ?? null);

    const rank = precedenceRank(rule, { module_id: targetModuleId });
    if (rank == null) {
      notEnforceable.push({
        rule_id: rule?.rule?.id ?? null,
        status: rule?.rule?.status ?? null,
        reason:
          rule?.rule?.status === 'stale'
            ? 'stale rules require evidence refresh before enforcement'
            : rule?.rule?.status === 'conflicted'
              ? 'conflicted rules report alternatives instead of enforcing one'
              : 'rule does not apply to this target scope',
      });
      continue;
    }
    const key = conceptKey(rule);
    const specificity = scopeSpecificity(rule);
    const current = enforced.get(key);
    if (!current) {
      enforced.set(key, { rule, rank, specificity });
      continue;
    }
    if (rank < current.rank || (rank === current.rank && specificity < current.specificity)) {
      enforced.set(key, { rule, rank, specificity });
      continue;
    }
    if (rank > current.rank || specificity > current.specificity) continue;
    const sameValue =
      JSON.stringify(canonicalize(current.rule?.rule?.canonical ?? null)) ===
      JSON.stringify(canonicalize(rule?.rule?.canonical ?? null));
    if (sameValue) continue;
    unresolved.push({
      concept_key: key,
      precedence: CONVENTION_PRECEDENCE[rank],
      rule_ids: [current.rule?.rule?.id ?? null, rule?.rule?.id ?? null].sort(),
      finding_kind: 'UNRESOLVED_CONVENTION',
    });
    enforced.delete(key);
  }

  return {
    enforced: [...enforced.values()].map(({ rule, rank }) => ({
      rule,
      precedence: CONVENTION_PRECEDENCE[rank],
      enforcement: enforcementForStatus(rule?.rule?.status),
    })),
    unresolved,
    duplicates,
    not_enforceable: notEnforceable,
    ok: unresolved.length === 0 && duplicates.length === 0,
  };
}

// ---------------------------------------------------------------------------
// Ownership
// ---------------------------------------------------------------------------

/**
 * A module-owned rule belongs in the module repository. When that repository is
 * missing or read-only the write is blocked, never redirected: a portal copy
 * would become a second editable source of the same rule, and the two would
 * drift the moment either side is edited.
 */
export function resolveConventionOwner({
  scope_kind: scopeKind,
  module_id: moduleId = null,
  topology = {},
  execution_host_repository_id: executionHost = null,
} = {}) {
  const blockers = [];
  if (!SCOPE_KINDS.has(scopeKind)) {
    return { status: 'blocked', owner_repository_id: null, blockers: [`unknown convention scope: ${scopeKind}`] };
  }
  if (scopeKind === 'module') {
    const module = (topology.modules ?? []).find((item) => item.module_id === moduleId);
    if (!module) {
      blockers.push(`module ${moduleId} has no repository mapping`);
    } else {
      if (module.available === false || module.status === 'uninitialized') {
        blockers.push(`module repository for ${moduleId} is unavailable`);
      }
      if (module.writable === false) {
        blockers.push(`module repository for ${moduleId} is not writable`);
      }
    }
    return {
      status: blockers.length === 0 ? 'resolved' : 'blocked',
      owner_repository_id: blockers.length === 0 ? module.repository_id : null,
      owner_repository_role: 'module',
      portal_fallback_used: false,
      blockers,
    };
  }
  const owner =
    scopeKind === 'portal-composition'
      ? topology.portal_repository_id ?? topology.integration_owner_repository_id ?? null
      : topology.repository_id ?? executionHost ?? null;
  if (!owner) blockers.push(`no owner repository resolved for ${scopeKind} conventions`);
  return {
    status: blockers.length === 0 ? 'resolved' : 'blocked',
    owner_repository_id: owner,
    owner_repository_role: scopeKind === 'portal-composition' ? 'portal' : 'repository',
    portal_fallback_used: false,
    blockers,
  };
}

// ---------------------------------------------------------------------------
// Write authority
// ---------------------------------------------------------------------------

/**
 * Roles permitted to merge shared convention state.
 *
 * This is an allowlist rather than a "block parallel-worker" denylist on
 * purpose. A denylist fails open: an unrecognized or misspelled role would sail
 * past the check and gain write authority, which is the wrong direction for a
 * boundary whose whole job is to keep concurrent workers out of shared state.
 */
const SHARED_CONVENTION_WRITE_ROLES = new Set([
  'sequential-owner',
  'integration-owner',
  'fan-in-owner',
]);

/**
 * Review findings are never write authority. Persistence needs an explicit
 * current authorization or a committed `after-review` policy, and in both cases
 * only a sequential or fan-in integration owner may merge shared state.
 */
export function resolveConventionWriteAuthority({
  action,
  explicit_authority: explicitAuthority = false,
  approved_setup: approvedSetup = false,
  policy = null,
  policy_status: policyStatus = 'missing',
  worker_role: workerRole = 'sequential-owner',
} = {}) {
  const blockedReasons = [];
  if (action !== 'conventions-sync-write-approved') {
    return {
      authorized: false,
      write_authority: 'none',
      blocked_reasons: ['convention persistence requires conventions-sync-write-approved'],
    };
  }
  const captureMode = policyStatus === 'valid' ? policy?.capture?.mode ?? 'disabled' : 'disabled';
  let authority = 'none';
  if (explicitAuthority === true) authority = 'explicit';
  else if (approvedSetup === true) authority = 'workflow-owner';
  else if (captureMode === 'after-review') authority = 'project-policy';

  if (authority === 'none') {
    blockedReasons.push(
      policyStatus === 'invalid'
        ? 'convention policy is invalid and cannot authorize persistence'
        : captureMode === 'manual'
          ? 'manual capture mode requires an explicit sync request'
          : 'no explicit authority and no approved after-review capture policy',
    );
  }
  if (!SHARED_CONVENTION_WRITE_ROLES.has(workerRole)) {
    blockedReasons.push(
      workerRole === 'parallel-worker'
        ? 'parallel workers emit candidates through runtime context only'
        : `role ${workerRole} may not merge shared convention state; expected one of ${[...SHARED_CONVENTION_WRITE_ROLES].join(', ')}`,
    );
  }
  return {
    authorized: blockedReasons.length === 0 && authority !== 'none',
    write_authority: blockedReasons.length === 0 ? authority : 'none',
    capture_mode: captureMode,
    blocked_reasons: blockedReasons,
  };
}

// ---------------------------------------------------------------------------
// convention_context
// ---------------------------------------------------------------------------

const LOADED_RULE_BUCKETS = [
  'accepted',
  'observed',
  'conflicted',
  'deprecated',
  'stale',
  'invalid',
];

const FINDING_BUCKETS = {
  direct_violations: 'CONVENTION_VIOLATION',
  semantic_alias_drift: 'SEMANTIC_ALIAS_DRIFT',
  term_collisions: 'TERM_COLLISION',
  cross_layer_drift: 'CROSS_LAYER_DRIFT',
  mapping_gaps: 'BOUNDARY_MAPPING_GAP',
  public_contract_drift: 'PUBLIC_CONTRACT_DRIFT',
};

/**
 * Validate the read-only context review emits. The single most important
 * assertion here is that review carries no write: findings describe what is
 * wrong, and a separate authorized explore action decides what gets persisted.
 */
export function evaluateConventionContext(context) {
  const blockers = [];
  if (context?.schema_version !== CONVENTION_SCHEMA_VERSION) {
    blockers.push(`convention_context schema_version must be ${CONVENTION_SCHEMA_VERSION}`);
  }
  if (context?.mode !== 'read-only') blockers.push('convention_context mode must be read-only');
  if ((context?.write_actions ?? []).length > 0) {
    blockers.push('read-only convention review cannot contain write actions');
  }

  // Scope is not decoration: `planConventionSync` reads `scope.change_ref`, and
  // the loaded rule set is filtered by the declared repositories, modules, and
  // boundaries. A malformed scope would silently narrow or mis-target the sync
  // that runs later, so it fails closed here rather than downstream.
  const scope = context?.scope ?? {};
  for (const field of ['repositories', 'modules', 'boundaries', 'files']) {
    if (scope[field] !== undefined && !Array.isArray(scope[field])) {
      blockers.push(`scope.${field} must be an array`);
    }
  }
  if (scope.change_ref !== undefined && scope.change_ref !== null && typeof scope.change_ref !== 'string') {
    blockers.push('scope.change_ref must be text or null');
  }

  const policyBlock = context?.policy ?? {};
  if (!['missing', 'valid', 'invalid'].includes(policyBlock.status)) {
    blockers.push('policy.status must be missing, valid, or invalid');
  }
  if (policyBlock.status === 'valid' && !CAPTURE_MODES.has(policyBlock.capture_mode)) {
    blockers.push('a valid policy must declare a supported capture_mode');
  }
  if (
    policyBlock.status !== 'valid' &&
    policyBlock.path &&
    policyBlock.path !== 'none' &&
    normalizeConventionPath(policyBlock.path) !== CONVENTION_POLICY_PATH
  ) {
    blockers.push(`policy.path must be ${CONVENTION_POLICY_PATH} or none`);
  }

  const loaded = context?.loaded_rules ?? {};
  for (const bucket of LOADED_RULE_BUCKETS) {
    if (!Array.isArray(loaded[bucket])) {
      blockers.push(`loaded_rules.${bucket} must be an array`);
    }
  }
  for (const rule of loaded.accepted ?? []) {
    if (rule?.rule?.status !== 'accepted') {
      blockers.push(`loaded_rules.accepted contains a ${rule?.rule?.status ?? 'unknown'} rule`);
    }
  }
  for (const bucket of ['conflicted', 'stale', 'invalid']) {
    for (const rule of loaded[bucket] ?? []) {
      if (precedenceRank(rule, {}) != null && bucket !== 'invalid') {
        blockers.push(`loaded_rules.${bucket} must not be enforceable`);
      }
    }
  }

  const findings = context?.findings ?? {};
  for (const [bucket, expectedKind] of Object.entries(FINDING_BUCKETS)) {
    for (const finding of findings[bucket] ?? []) {
      if (finding?.finding_kind !== expectedKind) {
        blockers.push(
          `findings.${bucket} expects ${expectedKind} but received ${finding?.finding_kind ?? 'nothing'}`,
        );
      }
      blockers.push(...validateConsistencyFinding(finding).errors);
    }
  }

  const persistence = context?.persistence ?? {};
  // Authorization is irrelevant here. A read-only context that reports a
  // completed write is either lying or was produced by something that had no
  // business writing, and both are blockers.
  if (context?.mode === 'read-only' && persistence.performed === true) {
    blockers.push('review must not perform convention persistence');
  }
  for (const target of persistence.target_paths ?? []) {
    if (!classifyConventionPath(target).ok) {
      blockers.push(`persistence target is not a valid convention path: ${target}`);
    }
  }
  if (context?.redaction?.applied !== true) {
    blockers.push('convention_context must record applied redaction');
  }

  const ownership = context?.ownership ?? {};
  for (const unresolvedOwner of ownership.unresolved_owners ?? []) {
    if (!unresolvedOwner?.reason) {
      blockers.push('unresolved owner entries must record a reason');
    }
  }

  return {
    schema_version: CONVENTION_SCHEMA_VERSION,
    registry_version: systemRegistry.registry_version,
    status: blockers.length === 0 ? 'reviewed' : 'blocked',
    read_only_proven: context?.mode === 'read-only' && (context?.write_actions ?? []).length === 0,
    capture_mode: policyBlock.capture_mode ?? 'disabled',
    sync_required:
      blockers.length === 0 &&
      policyBlock.capture_mode === 'after-review' &&
      ((context?.candidates ?? []).length > 0 ||
        (context?.conflicts ?? []).length > 0 ||
        (context?.stale_rules ?? []).length > 0),
    blockers,
  };
}

const REQUIRED_FINDING_FIELDS = [
  'id',
  'severity',
  'confidence',
  'finding_kind',
  'category',
  'concept_id',
  'semantic_role',
  'source_boundary',
  'repository_id',
  'evidence',
  'locator',
  'impact',
  'required_fix',
  'repair_tier',
];

const SEVERITIES = new Set(['Critical', 'High', 'Important', 'Medium', 'Minor', 'Low', 'Info']);
const REPAIR_TIERS = new Set(['auto', 'confirm', 'user-decision']);

/**
 * Findings that require compatibility work are never marked auto-repairable.
 * A public route, persisted column, permission code, event name, queue name, or
 * environment variable rename is a migration with external consequences, and a
 * repair loop must not perform one because a rule said the name was wrong.
 */
export function validateConsistencyFinding(finding = {}) {
  const errors = [];
  for (const field of REQUIRED_FINDING_FIELDS) {
    const value = finding[field];
    if (value == null || value === '') errors.push(`consistency finding is missing ${field}`);
  }
  if (finding.finding_kind && !FINDING_KINDS.has(finding.finding_kind)) {
    errors.push(`unknown consistency finding kind: ${finding.finding_kind}`);
  }
  if (finding.severity && !SEVERITIES.has(finding.severity)) {
    errors.push(`consistency finding uses an unsupported severity: ${finding.severity}`);
  }
  if (finding.repair_tier && !REPAIR_TIERS.has(finding.repair_tier)) {
    errors.push(`consistency finding uses an unsupported repair tier: ${finding.repair_tier}`);
  }
  if (finding.finding_kind === 'CROSS_LAYER_DRIFT' && !finding.target_boundary) {
    errors.push('cross-layer findings must declare a target_boundary');
  }
  if (finding.finding_kind === 'CONVENTION_CANDIDATE') {
    if (!['Info', 'Low', 'Minor'].includes(finding.severity)) {
      errors.push('a convention candidate must stay a non-blocking severity');
    }
    if (finding.eligible_for_automatic_repair === true) {
      errors.push('a convention candidate is never eligible for automatic repair');
    }
  }
  const requiresDecision =
    finding.compatibility_requirement != null && finding.compatibility_requirement !== 'none';
  const requiresMigration =
    finding.migration_requirement != null && finding.migration_requirement !== 'none';
  if ((requiresDecision || requiresMigration) && finding.eligible_for_automatic_repair === true) {
    errors.push(
      'a finding with compatibility or migration requirements is not eligible for automatic repair',
    );
  }
  if (finding.finding_kind === 'PUBLIC_CONTRACT_DRIFT') {
    if (finding.eligible_for_automatic_repair === true) {
      errors.push('public contract drift is never eligible for automatic repair');
    }
    if (!requiresMigration && !requiresDecision) {
      errors.push('public contract drift must declare a compatibility or migration requirement');
    }
  }
  if (finding.user_decision_required === true && finding.repair_tier !== 'user-decision') {
    errors.push('a finding needing a user decision must use the user-decision repair tier');
  }
  return { ok: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Sync planning
// ---------------------------------------------------------------------------

function mergeRule(existing, incoming) {
  const merged = {
    ...structuredClone(existing ?? {}),
    ...structuredClone(incoming),
  };
  merged.evidence = normalizeEvidence([
    ...(existing?.evidence ?? []),
    ...(incoming.evidence ?? []),
  ]);
  // Historical exceptions are institutional memory about why a boundary looks
  // the way it does. A newer sync run adds to them; it never prunes them.
  const exceptions = new Map();
  for (const exception of [...(existing?.exceptions ?? []), ...(incoming.exceptions ?? [])]) {
    exceptions.set(JSON.stringify(canonicalize(exception)), exception);
  }
  if (exceptions.size > 0) merged.exceptions = [...exceptions.values()];
  if (existing?.rule?.status === 'accepted' && incoming?.rule?.status === 'observed') {
    // A later observation adds evidence. It does not demote a decision that was
    // already made, and it does not get to restate the decision: the whole rule
    // body is kept from the accepted version, so an observation that saw mostly
    // singular routes cannot flip an accepted `plural` canonical to `singular`
    // just by being more recent. Source and confidence are kept for the same
    // reason - an accepted rule claiming a code observation as its authority is
    // the self-contradiction the schema refuses to store.
    merged.rule = { ...structuredClone(existing.rule), status: 'accepted', enforcement: 'required' };
    merged.source = structuredClone(existing.source);
    merged.confidence = existing.confidence;
    if (existing.accepted_by !== undefined) merged.accepted_by = existing.accepted_by;
  }
  return merged;
}

/**
 * Plan the write set for `conventions-sync-write-approved`.
 *
 * Every returned entry is a validated path under a resolved semantic owner. A
 * candidate whose owner cannot be resolved is skipped with a reason rather than
 * written somewhere reachable, and an unchanged rule produces no write at all so
 * repeated syncs stay byte-identical.
 */
export function planConventionSync({
  convention_context: conventionContext = {},
  candidates = [],
  existing_rules: existingRules = [],
  topology = {},
  policy = DEFAULT_CONVENTION_POLICY,
  policy_status: policyStatus = 'valid',
  explicit_authority: explicitAuthority = false,
  approved_setup: approvedSetup = false,
  worker_role: workerRole = 'sequential-owner',
  create_policy: createPolicy = false,
} = {}) {
  const authority = resolveConventionWriteAuthority({
    action: 'conventions-sync-write-approved',
    explicit_authority: explicitAuthority,
    approved_setup: approvedSetup,
    policy,
    policy_status: policyStatus,
    worker_role: workerRole,
  });
  if (!authority.authorized) {
    return {
      schema_version: CONVENTION_SCHEMA_VERSION,
      status: 'blocked',
      write_authority: authority.write_authority,
      writes: [],
      skipped: candidates.map((candidate) => ({
        rule_id: candidate?.rule?.id ?? null,
        reason: 'convention persistence is not authorized',
      })),
      blockers: authority.blocked_reasons,
      artifact_context: emptyArtifactContext(policy),
    };
  }

  const existingByPath = new Map(
    existingRules.map((rule) => [normalizeConventionPath(rule.artifact_path ?? ''), rule]),
  );
  const writes = [];
  const skipped = [];
  const blockers = [];
  const seenPaths = new Set();

  for (const candidate of candidates) {
    const scopeKind = candidate?.scope?.kind;
    const moduleId = candidate?.scope?.module_id ?? null;
    const owner = resolveConventionOwner({
      scope_kind: scopeKind,
      module_id: moduleId,
      topology,
    });
    if (owner.status !== 'resolved') {
      skipped.push({
        rule_id: candidate?.rule?.id ?? null,
        reason: owner.blockers.join('; '),
        blocked_owner_repository_id: null,
        portal_fallback_used: false,
      });
      blockers.push(...owner.blockers);
      continue;
    }
    let targetPath;
    try {
      targetPath = resolveConventionRulePath({
        scope_kind: scopeKind,
        module_id: moduleId,
        category: candidate?.rule?.category,
        rule_id: candidate?.rule?.id,
      });
    } catch (error) {
      skipped.push({ rule_id: candidate?.rule?.id ?? null, reason: error.message });
      blockers.push(error.message);
      continue;
    }
    if (seenPaths.has(targetPath)) {
      skipped.push({
        rule_id: candidate?.rule?.id ?? null,
        reason: 'duplicate rule id in the same effective scope',
      });
      blockers.push(`duplicate convention rule target: ${targetPath}`);
      continue;
    }
    seenPaths.add(targetPath);

    const existing = existingByPath.get(targetPath) ?? null;
    const document = mergeRule(existing, {
      ...candidate,
      repository: { repository_id: owner.owner_repository_id },
    });
    delete document.artifact_path;
    const validation = validateConventionRule(document, { path: targetPath });
    if (!validation.ok) {
      skipped.push({
        rule_id: candidate?.rule?.id ?? null,
        reason: `invalid convention rule: ${validation.errors.join('; ')}`,
      });
      blockers.push(...validation.errors);
      continue;
    }
    const contentHash = conventionContentHash(document);
    const existingHash = existing ? conventionContentHash(stripPath(existing)) : null;
    if (existingHash === contentHash) {
      skipped.push({
        rule_id: candidate?.rule?.id ?? null,
        path: targetPath,
        reason: 'unchanged evidence produces no semantic diff',
      });
      continue;
    }
    writes.push({
      path: targetPath,
      operation: existing ? 'update' : 'create',
      owner_repository_id: owner.owner_repository_id,
      owner_repository_role: owner.owner_repository_role,
      module_id: moduleId,
      rule_id: document.rule.id,
      status: document.rule.status,
      content_hash: contentHash,
      document,
    });
  }

  if (createPolicy) {
    writes.unshift({
      path: CONVENTION_POLICY_PATH,
      operation: 'create',
      owner_repository_id: topology.repository_id ?? null,
      owner_repository_role: 'repository',
      module_id: null,
      rule_id: null,
      status: 'policy',
      content_hash: conventionContentHash(policy),
      document: policy,
    });
  }

  writes.sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0));
  const uniqueBlockers = [...new Set(blockers)];
  return {
    schema_version: CONVENTION_SCHEMA_VERSION,
    status: uniqueBlockers.length === 0 ? 'synced' : 'partial',
    write_authority: authority.write_authority,
    change_ref: conventionContext?.scope?.change_ref ?? 'shared-project-conventions',
    writes,
    skipped,
    blockers: uniqueBlockers,
    artifact_context: buildArtifactContext(writes, policy),
  };
}

function stripPath(rule) {
  const copy = structuredClone(rule);
  delete copy.artifact_path;
  return copy;
}

function emptyArtifactContext(policy) {
  return {
    schema_version: 1,
    change_ref: policy?.change_ref ?? 'shared-project-conventions',
    source_spec: 'none',
    source_plan: 'none',
    required_with_change: [],
    shared_owned: [],
    conditional: [],
    local_only: [],
    unrelated_observed: [],
  };
}

/**
 * Convention artifacts are shared durable state with an explicit owner, so they
 * are emitted as `shared_owned` rather than `required_with_change`. Every write
 * is listed, not just the policy: a sync that reported only `policy.yaml` would
 * leave the rules it just created outside artifact closure.
 */
function buildArtifactContext(writes, policy) {
  const context = emptyArtifactContext(policy);
  context.shared_owned = writes.map((write) => ({
    path: write.path,
    kind: 'convention',
    owner: policy?.owner ?? 'sdcorejs-explore',
    owner_repository_id: write.owner_repository_id,
    reason:
      write.operation === 'create'
        ? 'integration owner created a convention artifact'
        : 'integration owner updated a convention artifact',
  }));
  return context;
}

// ---------------------------------------------------------------------------
// Project-context projection
// ---------------------------------------------------------------------------

/**
 * Compact projection for `project_context`. Rule ids and paths only: dumping
 * rule bodies into every downstream context is how a convention catalog ends up
 * duplicated in the summary it was supposed to stay out of.
 */
export function projectConventionContext({
  policy_status: policyStatus = 'missing',
  policy_path: policyPath = null,
  rules = [],
  invalid_paths: invalidPaths = [],
  unresolved_owner_repositories: unresolvedOwners = [],
} = {}) {
  const byStatus = new Map(systemRegistry.convention_rule_statuses.map((status) => [status, []]));
  const loadedPaths = [];
  for (const rule of rules) {
    const status = rule?.rule?.status;
    if (byStatus.has(status)) byStatus.get(status).push(rule.rule.id);
    if (rule?.artifact_path) loadedPaths.push(normalizeConventionPath(rule.artifact_path));
  }
  const sorted = (values) => [...new Set(values)].sort();
  return {
    policy_status: policyStatus,
    policy_path: policyStatus === 'missing' ? 'none' : policyPath ?? CONVENTION_POLICY_PATH,
    loaded_paths: sorted(loadedPaths),
    accepted_rule_ids: sorted(byStatus.get('accepted') ?? []),
    observed_rule_ids: sorted(byStatus.get('observed') ?? []),
    conflicted_rule_ids: sorted(byStatus.get('conflicted') ?? []),
    deprecated_rule_ids: sorted(byStatus.get('deprecated') ?? []),
    stale_rule_ids: sorted(byStatus.get('stale') ?? []),
    invalid_paths: sorted(invalidPaths.map(normalizeConventionPath)),
    unresolved_owner_repositories: sorted(unresolvedOwners),
  };
}

// ---------------------------------------------------------------------------
// Document loading
// ---------------------------------------------------------------------------

/**
 * Parse a convention document. The YAML parser is imported dynamically so the
 * schema, precedence, and ownership validators above stay usable with plain
 * objects in environments that do not resolve the `yaml` package.
 */
export async function parseConventionDocument(text) {
  try {
    const { parse } = await import('yaml');
    return { ok: true, document: parse(String(text ?? '')) ?? null, error: null };
  } catch (error) {
    return { ok: false, document: null, error: error?.message ?? String(error) };
  }
}

export { CONVENTION_ROOT, CONVENTION_POLICY_PATH };
