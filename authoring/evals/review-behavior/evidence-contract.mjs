import { createHash } from 'node:crypto';
export const evidenceHash = text => createHash('sha256').update(text).digest('hex');
const nonempty = x => typeof x === 'string' && x.trim().length > 0;
const hash = x => typeof x === 'string' && /^[a-f0-9]{64}$/u.test(x);

/** Structural verification and trusted capture binding, never semantic adjudication. */
export function validateFreshRun(record, { expected, verify_capture } = {}) {
  const errors = [];
  if (record?.status === 'NOT RUN') return { valid: false, status: 'NOT RUN', errors: ['fresh reviewer was not run'], semantic_acceptance: false };
  if (record?.schema_version !== 1 || record?.evidence_layer !== 'fresh-reviewer') errors.push('fresh reviewer schema/layer required');
  for (const key of ['scenario_id', 'runtime', 'model', 'original_prompt', 'transcript', 'transcript_ref', 'captured_at']) if (!nonempty(record?.[key])) errors.push(key + ' is required');
  for (const key of ['pack_manifest_hash', 'fixture_manifest_hash', 'input_manifest_hash', 'transcript_hash']) if (!hash(record?.[key])) errors.push(key + ' is required');
  if (!record || !['COMPLETED', 'FAILED'].includes(record.status)) errors.push('actual completion status required');
  if (record?.oracle_exposed !== false || record?.synthetic !== false) errors.push('synthetic or oracle-exposed transcript is not live evidence');
  if (nonempty(record?.transcript) && evidenceHash(record.transcript) !== record.transcript_hash) errors.push('transcript hash mismatch');
  if (!expected) errors.push('independently supplied input identity required');
  else for (const key of ['scenario_id', 'pack_manifest_hash', 'fixture_manifest_hash', 'input_manifest_hash', 'original_prompt']) if (record?.[key] !== expected[key]) errors.push('stale or mismatched ' + key);
  // A JSON assertion such as host_captured:true is not a receipt. The host must
  // verify its own independently captured receipt against the exact transcript.
  try { if (typeof verify_capture !== 'function' || verify_capture(record) !== true) errors.push('independent host capture receipt required'); }
  catch { errors.push('capture receipt verification failed'); }
  return { valid: errors.length === 0, status: errors.length ? 'INVALID' : 'CAPTURE-VERIFIED', errors, semantic_acceptance: false };
}

export function validateScenarioDataset(dataset) {
  const errors = [], ids = new Set();
  if (dataset?.schema_version !== 1 || !Array.isArray(dataset?.scenarios) || dataset.scenarios.length === 0) return { valid: false, errors: ['nonempty versioned scenarios required'] };
  for (const scenario of dataset.scenarios) {
    if (!nonempty(scenario.id) || ids.has(scenario.id)) errors.push('missing or duplicate scenario id');
    ids.add(scenario.id);
    if (!nonempty(scenario.prompt) || !nonempty(scenario.symbol) || !/^[a-z-]+\.(?:mjs|ts)$/u.test(scenario.source ?? '')) errors.push('bounded source/prompt/symbol required');
    if (!Array.isArray(scenario.oracle?.required_findings) || !Array.isArray(scenario.oracle?.forbidden_findings)) errors.push('adjudicator-only oracle required');
  }
  return { valid: errors.length === 0, errors };
}
