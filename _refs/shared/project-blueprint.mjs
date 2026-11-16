import { systemRegistry } from './system-registry.mjs';
import { classifyConventionPath, isSafeRuleId, ruleFileStem } from './convention-paths.mjs';

/** An inventory of decisions, not a second convention or architecture registry. */
export const BLUEPRINT_AREAS = Object.freeze([
  'scope', 'stack', 'architecture', 'coding', 'api-data', 'permissions', 'ui',
  'accessibility', 'unit-testing', 'integration-testing', 'e2e-testing',
  'documentation', 'delivery', 'learning',
]);
const AUTHORITY_KINDS = new Set([
  'accepted-convention', 'approved-architecture', 'approved-specification',
  'approved-plan', 'explicit-user-decision', 'authoritative-repository-config',
  'public-external-contract',
]);
const OBSERVATION_KINDS = new Set(['existing-code-observation', 'imported-legacy-convention']);
const isText = value => typeof value === 'string' && value.trim() !== '';
const isMapping = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value);
const isRelative = value => isText(value) && !/[\\:\u0000-\u001f]/u.test(value) && !value.startsWith('/') && value.split('/').every(part => part !== '' && part !== '.' && part !== '..');
const isRepository = value => isText(value) && /^[a-z0-9.-]+\/[a-z0-9._-]+\/[a-z0-9._/-]+$/iu.test(value) && !value.split('/').includes('..');

function validateReference(reference, label, errors) {
  if (!isMapping(reference)) { errors.push(`${label} must be a mapping`); return; }
  if (!isRelative(reference.path)) errors.push(`${label}.path must be repository-relative`);
  if (!isHash(reference.sha256)) errors.push(`${label}.sha256 must fingerprint source bytes`);
  if (!AUTHORITY_KINDS.has(reference.kind) && !OBSERVATION_KINDS.has(reference.kind)) errors.push(`${label}.kind is unknown`);
  if (reference.kind === 'accepted-convention') {
    const convention = classifyConventionPath(reference.path);
    if (!convention.ok || convention.document_type !== 'rule' || !isSafeRuleId(reference.rule_id) || ruleFileStem(reference.rule_id) !== convention.rule_file) {
      errors.push(`${label} must reference the canonical convention path and matching rule_id`);
    }
  }
  if (reference.kind === 'approved-architecture' && (!isText(reference.path) || !reference.path.startsWith(`${systemRegistry.artifact_roots.architecture}/`))) {
    errors.push(`${label} must reference the canonical approved architecture`);
  }
}

/** Structural completeness never grants implementation, migration or write authority. */
export function validateProjectBlueprint(document, { path: candidatePath = null } = {}) {
  const errors = [], gaps = [], observed = [];
  if (!isMapping(document)) return { ok: false, status: 'invalid', errors: ['blueprint must be a mapping'], gaps, observed };
  if (document.schema_version !== 1) errors.push('schema_version must be 1');
  if (document.artifact_kind !== 'project-blueprint') errors.push('artifact_kind must be project-blueprint');
  if (!isText(document.artifact_id)) errors.push('artifact_id is required');
  if (document.owner !== 'sdcorejs-explore') errors.push('owner must be sdcorejs-explore');
  if (!isRepository(document.owner_repository_id)) errors.push('owner_repository_id must be a stable repository identity');
  if (!isText(document.source_revision)) errors.push('source_revision is required');
  if (!['new', 'existing'].includes(document.project_state)) errors.push('project_state must be new or existing');
  if (document.migration_policy !== 'no-automatic-migration') errors.push('migration_policy must preserve no-automatic-migration');
  if (document.redaction_applied !== true) errors.push('redaction_applied must be true');
  if (candidatePath !== null) {
    const root = systemRegistry.artifact_roots.blueprints;
    const stem = typeof candidatePath === 'string' && typeof root === 'string' && candidatePath.startsWith(`${root}/`) ? candidatePath.slice(root.length + 1) : '';
    if (!isRelative(candidatePath) || !/^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/u.test(stem)) errors.push('blueprint path must be a kebab-case JSON file in the registry blueprint root');
  }
  const areas = isMapping(document.areas) ? document.areas : {};
  for (const unknown of Object.keys(areas).filter(id => !BLUEPRINT_AREAS.includes(id))) errors.push(`unknown blueprint area: ${unknown}`);
  for (const id of BLUEPRINT_AREAS) {
    const area = areas[id];
    if (!isMapping(area)) { errors.push(`areas.${id} requires a decision or explicit gap`); continue; }
    if (!['confirmed', 'observed', 'gap', 'not-applicable'].includes(area.status)) { errors.push(`areas.${id}.status is unknown`); continue; }
    if (area.status === 'gap') {
      gaps.push(id);
      if (!isText(area.reason) || !isText(area.next_action)) errors.push(`areas.${id} gap requires a reason and next_action`);
      continue;
    }
    if (!Array.isArray(area.evidence) || area.evidence.length === 0) errors.push(`areas.${id} requires evidence`);
    for (const [index, reference] of (Array.isArray(area.evidence) ? area.evidence : []).entries()) validateReference(reference, `areas.${id}.evidence[${index}]`, errors);
    if (area.status === 'not-applicable') {
      if (!isText(area.reason)) errors.push(`areas.${id} exemption requires a reason`);
      continue;
    }
    if (!isText(area.decision)) errors.push(`areas.${id}.decision must state an actionable decision or observation`);
    if (area.status === 'confirmed' && !(Array.isArray(area.evidence) && area.evidence.some(entry => AUTHORITY_KINDS.has(entry?.kind)))) errors.push(`areas.${id} cannot confirm an observed pattern without authoritative evidence`);
    if (area.status === 'observed') {
      observed.push(id);
      if (document.project_state !== 'existing') errors.push(`areas.${id} observations require an existing project baseline`);
      if (!isText(area.next_action)) errors.push(`areas.${id} observation requires a next_action`);
    }
  }
  return { ok: errors.length === 0, status: errors.length ? 'invalid' : gaps.length || observed.length ? 'incomplete' : 'complete', errors, gaps, observed };
}

/** Classify actual behavior; an installed framework does not determine the layer. */
export function selectBehavioralE2E(behaviors = []) {
  const required = [], exemptions = [], errors = [], seen = new Set();
  if (!Array.isArray(behaviors) || behaviors.length === 0) return { ok: false, required, exemptions, errors: ['declare at least one behavior, including an explicit documentation or pure-logic exemption when applicable'] };
  for (const behavior of behaviors) {
    if (!isMapping(behavior) || !isText(behavior.id)) { errors.push('every behavior requires an id'); continue; }
    if (seen.has(behavior.id)) { errors.push(`duplicate behavior id: ${behavior.id}`); continue; }
    seen.add(behavior.id);
    const fullFlow = ['cli-flow', 'job-flow'].includes(behavior.kind);
    const layer = behavior.kind === 'ui-journey' ? 'browser-e2e' : behavior.kind === 'public-api' ? 'api-e2e' : fullFlow ? 'integration' : null;
    if (layer) {
      if (behavior.exception_reason != null) errors.push(`${behavior.id}: UI, public API, CLI and job flows cannot use a pure-logic exemption`);
      required.push({ behavior_id: behavior.id, layer, ...(fullFlow ? { evidence_class: 'FULL_E2E' } : {}) });
    } else if (['pure-logic', 'documentation'].includes(behavior.kind)) {
      if (!isText(behavior.exception_reason)) errors.push(`${behavior.id}: E2E exemption requires an exception_reason`);
      else exemptions.push({ behavior_id: behavior.id, kind: behavior.kind, reason: behavior.exception_reason });
    } else errors.push(`${behavior.id}: unknown behavior kind`);
  }
  return { ok: errors.length === 0, required, exemptions, errors };
}

/** Policy evidence check only. Canonical validation-map owns delivery readiness. */
export function evaluateBlueprintTesting({ behaviors, evidence = [], current_source_revision: revision } = {}) {
  const selection = selectBehavioralE2E(behaviors);
  const errors = [...selection.errors];
  if (!Array.isArray(evidence)) errors.push('evidence must be an array');
  if (!isText(revision)) errors.push('current_source_revision is required');
  for (const required of selection.required) {
    const records = (Array.isArray(evidence) ? evidence : []).filter(entry => entry?.behavior_id === required.behavior_id && entry?.layer === required.layer);
    if (records.length !== 1) { errors.push(`${required.behavior_id}: exactly one ${required.layer} evidence record is required`); continue; }
    const record = records[0];
    if (record.result !== 'PASSED') errors.push(`${required.behavior_id}: evidence result is not PASSED`);
    if (!isText(record.command) || !(record.cwd === '.' || isRelative(record.cwd))) errors.push(`${required.behavior_id}: actual command and repository-relative cwd are required`);
    if (!isRelative(record.proof?.path) || !isHash(record.proof?.sha256)) errors.push(`${required.behavior_id}: output proof path and hash are required`);
    if (record.source_revision !== revision) errors.push(`${required.behavior_id}: source revision is stale`);
    if (required.evidence_class === 'FULL_E2E') {
      if (record.evidence_class !== 'FULL_E2E') errors.push(`${required.behavior_id}: CLI/job flows require FULL_E2E evidence at the integration level`);
      const kind = behaviors.find(behavior => behavior?.id === required.behavior_id)?.kind;
      const flow = record.flow_proof;
      if (!isMapping(flow) || flow.kind !== kind || !isRelative(flow.entrypoint) || flow.invocation !== (kind === 'cli-flow' ? 'process' : 'job-trigger')) {
        errors.push(`${required.behavior_id}: flow_proof must identify the actual CLI process or job trigger and its repository-relative entrypoint`);
      }
      if (!isText(flow?.observed_outcome) || !Array.isArray(flow?.owned_boundaries) || flow.owned_boundaries.length === 0 || flow.owned_boundaries.some(value => !isText(value))) {
        errors.push(`${required.behavior_id}: flow_proof must describe the observed outcome and exercised owned boundaries`);
      }
      if (!Array.isArray(flow?.mocked_owned_boundaries) || flow.mocked_owned_boundaries.length !== 0) {
        errors.push(`${required.behavior_id}: full flow evidence cannot mock an owned boundary`);
      }
    }
  }
  return { ...selection, ok: errors.length === 0, errors, validation_map_required: true };
}
