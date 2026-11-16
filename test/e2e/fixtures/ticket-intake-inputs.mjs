import { createHash } from 'node:crypto';
import { approveDecisionCoverage } from '../../../_refs/shared/decision-coverage.mjs';
import { createTicketSnapshot } from '../../../_refs/product/ticket-intake.mjs';

export const ticketScope = { owner_repository_id: 'github.com/acme/orders', change_ref: 'totals' };

export const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
export const identity = { provider: 'github', instance: 'https://github.com', repository: 'acme/orders', id: '42' };
export const now = '2026-11-14T08:00:00.000Z';
export const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
export const imageAttachment = (overrides = {}) => ({
  id: 'image-1', filename: 'original.png', media_type: 'image/png', role: 'reference',
  url: 'https://github.com/acme/orders/assets/1?token=private-value', bytes: png,
  privacy_review: { status: 'approved', reviewed_by: 'fixture-reviewer', sha256: hash(png) },
  ...overrides,
});

export function intake(overrides = {}) {
  return {
    identity, revision: 'etag-1', updated_at: now, captured_at: now,
    owner_repository_id: 'github.com/acme/orders', change_ref: 'totals',
    url: 'https://github.com/acme/orders/issues/42',
    title: 'Normalize order totals', description: 'Normalize the submitted decimal value.',
    comments: [{ id: 'comment-1', body: 'Keep the operation deterministic.' }],
    acceptance_criteria: [{ id: 'source-ac-1', text: 'The same input yields the same normalized total.' }],
    attachments_complete: true, attachments: [],
    requirements: [{
      id: 'R-001', statement: 'Normalize order totals deterministically.', source_refs: ['description', 'comment:comment-1'],
      proposed_acceptance_criteria: [{ id: 'AC-001', statement: 'Identical inputs return identical totals.', source_refs: ['criterion:source-ac-1'] }],
    }],
    ...overrides,
  };
}

export function validation() {
  const records = [
    { id: 'R-001', type: 'requirement', statement: 'Normalize totals.', source: 'explicit-user', status: 'active', owner_repository_id: 'github.com/acme/orders', owner_module_id: null, task_refs: ['TASK-001'] },
    { id: 'AC-001', type: 'acceptance-criterion', statement: 'Totals are deterministic.', behavior: 'Normalize identical totals.', expected_result: 'The result is identical.', verification_kind: 'automated', blocking: true, requirement_refs: ['R-001'], task_refs: ['TASK-001'] },
    { id: 'D-001', type: 'decision', statement: 'Use deterministic normalization.', question: 'How are totals normalized?', selected_value: 'Pure deterministic logic', source: 'approved-spec', status: 'approved', blocking: true, scope: 'repository', owner_repository_id: 'github.com/acme/orders', rationale: 'The function has no external boundary.', supersedes: null, revisit_condition: null, convention_impact: { candidate: false, category: null }, downstream_refs: ['R-001', 'AC-001', 'INV-001'], task_refs: ['TASK-001'], validation_boundary: { kind: 'none', source_refs: ['R-001', 'AC-001', 'INV-001'] } },
    { id: 'INV-001', type: 'invariant', statement: 'Normalization remains deterministic.', protected_refs: ['R-001', 'AC-001'], task_refs: ['TASK-001'], evidence_refs: ['EVIDENCE-001'] },
  ];
  const decision_coverage = approveDecisionCoverage({ schema_version: 1, revision: 1, records, history: [{ revision: 1, active: records.map(({ id, type }) => ({ id, type })), tombstones: [] }] }, ticketScope);
  const current = { associated_HEAD_or_diff: 'diff:totals-1', config_fingerprint: `sha256:v1:${'a'.repeat(64)}`, environment_fingerprint: `sha256:v1:${'b'.repeat(64)}` };
  const validation_map = [{
    requirement_id: 'R-001', acceptance_criterion_id: 'AC-001', invariant_refs: ['INV-001'], risk: 'deterministic normalization',
    boundary: { kind: 'none', approval_ref: 'D-001', source_refs: ['R-001', 'AC-001', 'INV-001'] }, authorization_boundary: false,
    levels: ['unit'], case_ids: ['case-totals'], planned_command: 'node --test totals.test.mjs', command_source: 'project-doc', cwd: '.',
    evidence_class: 'UNIT', automation: 'automated', expected_proof: 'Repeated inputs yield identical totals.', status: 'covered', evidence_refs: ['EVIDENCE-001'],
    rationale: null, owner: null, acknowledgement_required: false, module_e2e: false, module_id: null, owner_repository_id: null,
  }];
  const test_evidence = {
    schema_version: 2, source: 'sdcorejs-test', change_ref: 'totals', associated_HEAD_or_diff: current.associated_HEAD_or_diff,
    status: { planning: 'planned', authoring: 'existing', executability: 'ready', execution: 'executed', result: 'pass', evidence: 'current', documentation: 'not-requested' },
    runs: [{
      run_id: 'run-totals', command: validation_map[0].planned_command, command_source: 'project-doc', cwd: '.', runner: 'node:test', package_manager: 'npm', environment_id: 'fixture', environment_class: 'local', evidence_class: 'UNIT', ...current,
      repository_id: 'github.com/acme/orders', source_fingerprint: 'c'.repeat(64), portal_revision: null, module_revision: null, portal_pinned_module_revision: null, actual_command: null, artifact_hashes: {}, persona_ids: [],
      started_at: now, finished_at: now, duration: 'PT0S', exit_code: 0, passed: 1, failed: 0, skipped: 0, interrupted: false, failed_specs: [], first_useful_error: null,
      output_digest: `sha256:v1:${'d'.repeat(64)}`, artifacts_created: [], redactions_applied: true, stale: false,
    }],
    cases: [{ case_id: 'case-totals', requirement_refs: ['R-001', 'AC-001'], invariant_refs: ['INV-001'], test_ref: 'totals.test.mjs#determinism', persona_id: null, result: 'pass', evidence_run_id: 'run-totals', blocker_or_error: null }],
    acknowledgements: [], convergence_evidence_refs: ['EVIDENCE-001'], data_lifecycle: { setup_status: 'not-applicable', cleanup_status: 'not-applicable', residual_data_risk: 'none' }, captures: [], commands_skipped: [], blockers: [], residual_risks: [], redactions_applied: true,
  };
  return { decision_coverage, current, validation_map, coverage_matrix: structuredClone(validation_map), test_evidence };
}

export function twoCriteriaValidation() {
  const evidence = validation();
  const coverage = evidence.decision_coverage;
  coverage.records.splice(2, 0, { ...coverage.records.find(({ id }) => id === 'AC-001'), id: 'AC-002', statement: 'The second behavior is verified.' });
  coverage.records.find(({ id }) => id === 'D-001').downstream_refs.push('AC-002');
  coverage.records.find(({ id }) => id === 'D-001').validation_boundary.source_refs.push('AC-002');
  coverage.records.find(({ id }) => id === 'INV-001').protected_refs.push('AC-002');
  coverage.history[0].active = coverage.records.map(({ id, type }) => ({ id, type }));
  evidence.decision_coverage = approveDecisionCoverage(coverage, ticketScope);
  evidence.validation_map[0].boundary.source_refs.push('AC-002');
  evidence.validation_map.push({ ...structuredClone(evidence.validation_map[0]), acceptance_criterion_id: 'AC-002', case_ids: ['case-second'] });
  evidence.test_evidence.runs.push({ ...structuredClone(evidence.test_evidence.runs[0]), run_id: 'run-second' });
  evidence.test_evidence.cases.push({ ...structuredClone(evidence.test_evidence.cases[0]), case_id: 'case-second', requirement_refs: ['R-001', 'AC-002'], evidence_run_id: 'run-second' });
  evidence.coverage_matrix = structuredClone(evidence.validation_map);
  return evidence;
}

export function setFullE2E(evidence, index, levels) {
  Object.assign(evidence.validation_map[index], { levels, evidence_class: 'FULL_E2E' });
  evidence.coverage_matrix = structuredClone(evidence.validation_map);
  evidence.test_evidence.runs[index].evidence_class = 'FULL_E2E';
}

export const e2ePolicy = { behavior: 'pure-logic', exception: { reason: 'Pure normalization has no browser or API journey.', decision_ref: 'D-001' } };

export function delivery(overrides = {}) {
  const snapshot = createTicketSnapshot(intake()).snapshot;
  return { snapshot, latest_snapshot: snapshot, delivery_id: 'totals-1', summary: 'Implemented deterministic normalization.', validation_evidence: validation(), e2e_policy: e2ePolicy, ...overrides };
}

export function authority(plan) {
  return { source: 'session-delegation', reference: 'Explicit fixture authorization', plan_hash: plan.plan_hash, payload_hash: plan.payload_hash };
}
