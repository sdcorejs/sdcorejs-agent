import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateReviewContract } from '../../_refs/shared/review-contract.mjs';

const revision = 'a'.repeat(40);
export function riskContext() {
  return { schema_version: 1, subject_track: 'general', review_profile: 'general', mode: 'read-only', write_actions: [], owner_repository_id: 'repo', dimensions: ['security'], current_revision_map: { repo: revision }, current_diff_hash: 'diff-1', reported_findings: [], review_baseline_version: 1,
    risk_assessment: { schema_version: 1, repository_id: 'repo', revision, diff_hash: 'diff-1', dimensions: ['security'], categories: ['protection', 'test-adequacy'].map(category => ({ category, status: 'checked', evidence: [{ path: 'src/customers.ts', line: 12, revision, diff_hash: 'diff-1' }], rule_source: 'server authorization contract', confidence: 'high', finding_refs: [], limitation: 'source review; no rendered UI claim' })) } };
}
test('legacy coverage remains unknown and new producers cannot claim an absent baseline', () => {
  const legacy = riskContext(); delete legacy.risk_assessment; delete legacy.review_baseline_version;
  assert.equal(evaluateReviewContract(legacy).risk_coverage, 'unknown');
  assert.equal(evaluateReviewContract({ ...legacy, review_baseline_version: 1 }).status, 'blocked');
});
test('checked needs fresh locators and all mandatory categories in requested scope', () => {
  assert.equal(evaluateReviewContract(riskContext()).risk_coverage, 'complete');
  const combined = riskContext();
  combined.dimensions = ['security', 'performance'];
  combined.risk_assessment.dimensions = [...combined.dimensions];
  assert.equal(evaluateReviewContract(combined).status, 'blocked', 'combined dimensions must retain every applicable risk category');
  for (const mutate of [c => c.risk_assessment.categories.pop(), c => c.risk_assessment.categories[0].evidence = [], c => c.risk_assessment.revision = 'b'.repeat(40), c => c.risk_assessment.categories[0].evidence[0].diff_hash = 'old', c => c.risk_assessment.dimensions.push('code')]) {
    const c = riskContext(); mutate(c); assert.equal(evaluateReviewContract(c).status, 'blocked');
  }
});
test('honest evidence gap is incomplete and cannot be promoted to reviewed-complete', () => {
  const c = riskContext(); c.risk_assessment.categories[0] = { category: 'protection', status: 'no-evidence', reason: 'server repository unavailable', finding_refs: [] };
  assert.equal(evaluateReviewContract(c).risk_coverage, 'incomplete');
  assert.equal(evaluateReviewContract({ ...c, reviewed_complete: true }).status, 'blocked');
});
test('risk findings require trigger, rule provenance, test gap and one primary cause', () => {
  const c = riskContext(); const f = { id: 'F-1', severity: 'High', kind: 'security', dimension: 'security', evidence: 'src/customers.ts:12', locator: 'src/customers.ts:12', repository_id: 'repo', impact: 'another tenant reads a record', required_fix: 'enforce tenant ownership', risk: { category: 'protection', semantic_role: 'tenant-owner-enforcement', path: 'src/customers.ts', trigger: 'cross-tenant request', rule_source: 'server contract', confidence: 'high', test_gap: 'no cross-tenant denial test', root_cause: 'tenant-missing' } };
  c.reported_findings = [f]; c.risk_assessment.categories[0].finding_refs = ['F-1'];
  assert.equal(evaluateReviewContract(c).status, 'reviewed');
  delete f.risk.trigger; assert.equal(evaluateReviewContract(c).status, 'blocked'); f.risk.trigger = 'cross-tenant request';
  c.reported_findings.push({ ...f, id: 'F-2' }); assert.equal(evaluateReviewContract(c).status, 'blocked');
  c.risk_assessment.categories[0].finding_refs.push('F-2');
  c.reported_findings[1].related_to = 'missing'; assert.equal(evaluateReviewContract(c).status, 'blocked');
  c.reported_findings[1].related_to = 'F-1'; assert.equal(evaluateReviewContract(c).status, 'reviewed');
  c.reported_findings.reverse(); assert.equal(evaluateReviewContract(c).status, 'reviewed');
});

test('malformed evidence returns blockers instead of throwing or silently dropping records', () => {
  for (const change of [c => c.risk_assessment.categories = [null], c => c.risk_assessment.categories[0].evidence = {}, c => c.risk_assessment.categories[0].evidence = [null], c => c.risk_assessment.categories[0].finding_refs = 'F-1']) {
    const c = riskContext(); change(c);
    assert.doesNotThrow(() => evaluateReviewContract(c));
    assert.equal(evaluateReviewContract(c).status, 'blocked');
  }
});

test('risk findings cannot borrow another repository or unchecked-category evidence', () => {
  const context = () => {
    const c = riskContext();
    c.reviewed_complete = true;
    c.reported_findings = [{ id: 'F-1', severity: 'High', kind: 'security', dimension: 'security', repository_id: 'repo', evidence: 'src/customers.ts:12', locator: 'src/customers.ts:12', impact: 'cross-tenant access', required_fix: 'enforce tenant ownership', risk: { category: 'protection', path: 'src/customers.ts', semantic_role: 'tenant-boundary', trigger: 'another tenant requests this record', rule_source: 'server contract', confidence: 'high', test_gap: 'missing denial assertion', root_cause: 'tenant-missing' } }];
    c.risk_assessment.categories[0].finding_refs = ['F-1'];
    return c;
  };
  assert.equal(evaluateReviewContract(context()).risk_coverage, 'complete');
  for (const mutate of [
    c => { c.reported_findings[0].repository_id = 'other'; },
    c => { c.risk_assessment.categories[0] = { category: 'protection', status: 'not-applicable', reason: 'no auth changes', finding_refs: ['F-1'], evidence: [{ path: 'src/customers.ts' }] }; },
    c => { c.risk_assessment.categories[0].status = 'not-applicable'; c.risk_assessment.categories[0].reason = 'no auth changes'; },
  ]) {
    const c = context(); mutate(c);
    const result = evaluateReviewContract(c);
    assert.equal(result.status, 'blocked');
    assert.equal(result.risk_coverage, 'incomplete');
  }
});
