import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateReviewContract } from '../../_refs/shared/review-contract.mjs';

const context = (finding, dimensions) => ({
  schema_version: 1, subject_track: 'angular', review_profile: 'angular',
  mode: 'read-only', dimensions, write_actions: [], reported_findings: [finding],
});
const convention = {
  id: 'UX-CONVENTION-1', kind: 'uiux', severity: 'Medium', confidence: 'high',
  dimension: 'consistency', finding_kind: 'CONVENTION_VIOLATION',
  category: 'ui', rule_id: 'ui.control.accessible-name', concept_id: 'selection-control',
  semantic_role: 'row-selection', source_boundary: 'orders-ui',
  repository_id: 'github.com/example/orders', module_id: null,
  evidence: 'Selection control omits the accepted row-name binding in source.',
  locator: 'src/orders/table.html:24', impact: 'The row cannot be identified by its selection control.',
  required_fix: 'Restore the accepted row-name binding.', repair_tier: 'confirm',
  compatibility_requirement: 'none', migration_requirement: 'none',
  user_decision_required: false, specification_required: false, eligible_for_automatic_repair: false,
  uiux: { classification: 'convention', rule_id: 'UX-TABLE-SELECTION', evidence_kind: 'source',
    verification: 'Render and inspect the accessible name of each selection control.',
    limitation: 'Rendered and assistive-technology checks NOT RUN.' },
};

test('aesthetic preferences cannot use either blocking gate label', () => {
  const preference = { ...convention, finding_kind: undefined, dimension: 'code', severity: 'Info',
    uiux: { ...convention.uiux, classification: 'aesthetic' } };
  assert.equal(evaluateReviewContract(context(preference, ['code'])).status, 'reviewed');
  for (const gate of ['BLOCKER', 'REQUIRED']) {
    assert.equal(evaluateReviewContract(context({ ...preference, gate }, ['code'])).status, 'blocked', gate);
  }
});

test('UI convention metadata preserves applicable consistency in code reviews', () => {
  const ordinary = { ...convention, kind: 'convention', uiux: undefined };
  for (const finding of [ordinary, convention]) {
    assert.equal(evaluateReviewContract(context(finding, ['code'])).status, 'reviewed');
  }
});

test('narrow reviews admit only UI conventions that affect their requested dimension', () => {
  for (const uiux of [undefined, convention.uiux]) {
    const finding = { ...convention, kind: uiux ? 'uiux' : 'convention', uiux };
    assert.equal(evaluateReviewContract(context(finding, ['accessibility'])).status, 'blocked');
    assert.equal(evaluateReviewContract(context({ ...finding, affects_requested_dimension: true }, ['accessibility'])).status, 'reviewed');
  }
});
