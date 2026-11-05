/** Structural evidence validation only. This module never detects source defects. */
export const REVIEW_RISK_CATEGORIES = Object.freeze(['naming', 'routing', 'protection', 'screen-patterns', 'hardcoded-assumptions', 'data-completeness', 'test-adequacy']);
const text = value => typeof value === 'string' && value.trim().length > 0;
const safePath = value => text(value) && !/^(?:[A-Za-z]:|[/\\])/u.test(value) && !value.includes('\\') && !value.split('/').some(p => !p || p === '.' || p === '..');
export function requiredRiskCategories(dimensions = []) {
  if (!Array.isArray(dimensions)) return [];
  if (dimensions.some(d => ['ALL', 'code', 'consistency', 'site-audit'].includes(d))) return [...REVIEW_RISK_CATEGORIES];
  const required = new Set();
  if (dimensions.includes('architecture')) for (const category of ['routing', 'protection', 'data-completeness', 'test-adequacy']) required.add(category);
  if (dimensions.includes('security')) for (const category of ['protection', 'test-adequacy']) required.add(category);
  if (dimensions.includes('performance')) for (const category of ['hardcoded-assumptions', 'data-completeness', 'test-adequacy']) required.add(category);
  return REVIEW_RISK_CATEGORIES.filter(category => required.has(category));
}
export function evaluateRiskAssessment(context = {}) {
  context ??= {};
  const errors = [], gaps = [], assessment = context.risk_assessment;
  const required = requiredRiskCategories(context.dimensions);
  const requiredProducer = context.review_baseline_version !== undefined || context.reviewed_complete === true;
  if (context.review_baseline_version !== undefined && context.review_baseline_version !== 1) errors.push('unsupported review baseline version');
  if (!assessment) {
    if (requiredProducer) errors.push('new review producer requires risk_assessment');
    return { valid: errors.length === 0, coverage: 'unknown', errors, gaps, required_categories: required };
  }
  if (assessment.schema_version !== 1) errors.push('risk assessment schema_version must be 1');
  if (assessment.repository_id !== context.owner_repository_id || !text(assessment.repository_id)) errors.push('risk assessment owner mismatch');
  const revision = context.current_revision_map?.[context.owner_repository_id];
  if (!text(revision) || assessment.revision !== revision || !text(context.current_diff_hash) || assessment.diff_hash !== context.current_diff_hash) errors.push('risk assessment is stale or lacks revision/diff identity');
  if (JSON.stringify(assessment.dimensions) !== JSON.stringify(context.dimensions)) errors.push('risk assessment must preserve requested dimensions');
  const rows = Array.isArray(assessment.categories) ? assessment.categories : [];
  const seen = new Set(), findings = new Map();
  for (const f of context.reported_findings ?? []) {
    if (!text(f?.id) || findings.has(f.id)) errors.push('risk assessment finding identity is missing or duplicated');
    if (f) findings.set(f.id, f);
  }
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) { errors.push('risk category must be a mapping'); continue; }
    const category = row?.category;
    if (!required.includes(category) || seen.has(category)) errors.push('risk assessment has unexpected or duplicate category: ' + category);
    seen.add(category);
    if (!['checked', 'not-applicable', 'no-evidence', 'gap'].includes(row?.status)) errors.push('risk assessment status invalid: ' + category);
    if (row.status === 'checked') {
      if (!text(row.rule_source) || !['high', 'medium', 'low'].includes(row.confidence)) errors.push('checked category needs rule source and confidence: ' + category);
      if (!Array.isArray(row.evidence) || row.evidence.length === 0) errors.push('checked category needs evidence: ' + category);
      for (const e of Array.isArray(row.evidence) ? row.evidence : []) {
        if (!safePath(e?.path) || !Number.isInteger(e?.line) || e.line < 1 || e.revision !== revision || e.diff_hash !== context.current_diff_hash) errors.push('risk evidence locator is invalid or stale: ' + category);
      }
    } else if (!text(row.reason)) errors.push('unchecked category needs a reason: ' + category);
    if (['no-evidence', 'gap'].includes(row.status)) gaps.push({ category, reason: row.reason });
    if (!Array.isArray(row.finding_refs)) errors.push('category needs finding_refs: ' + category);
    for (const id of Array.isArray(row.finding_refs) ? row.finding_refs : []) if (findings.get(id)?.risk?.category !== category) errors.push('dangling or mismatched risk finding: ' + id);
  }
  for (const category of required) if (!seen.has(category)) errors.push('missing mandatory category: ' + category);
  const causes = new Set();
  for (const f of findings.values()) {
    if (!f.risk) continue;
    const risk = f.risk;
    if (f.repository_id !== assessment.repository_id) errors.push('risk finding owner must match its assessment: ' + f.id);
    if (!required.includes(risk.category) || !safePath(risk.path) || !text(risk.semantic_role) || !text(risk.trigger) || !text(risk.rule_source) || !text(risk.test_gap) || !text(risk.root_cause) || !['high', 'medium', 'low'].includes(risk.confidence)) errors.push('risk finding requires path, semantic role, trigger, rule source, confidence, test gap and root cause: ' + f.id);
    if (!rows.some(r => r?.category === risk.category && r.status === 'checked' && Array.isArray(r.finding_refs) && r.finding_refs.includes(f.id) && Array.isArray(r.evidence) && r.evidence.some(e => e?.path === risk.path && Number.isInteger(e.line) && e.line > 0 && e.revision === revision && e.diff_hash === context.current_diff_hash))) errors.push('risk finding must be linked to inspected source evidence: ' + f.id);
    const key = JSON.stringify([f.repository_id, risk.path, risk.root_cause]);
    if (text(f.related_to)) {
      const primary = findings.get(f.related_to);
      const primaryKey = JSON.stringify([primary?.repository_id, primary?.risk?.path, primary?.risk?.root_cause]);
      if (!primary || primary.id === f.id || text(primary.related_to) || primaryKey !== key) errors.push('secondary risk finding must reference its primary cause: ' + f.id);
    } else {
      if (causes.has(key)) errors.push('duplicate primary risk finding: ' + f.id);
      causes.add(key);
    }
  }
  const coverage = errors.length || gaps.length ? 'incomplete' : 'complete';
  if (context.reviewed_complete === true && coverage !== 'complete') errors.push('cannot claim reviewed-complete with missing evidence');
  return { valid: errors.length === 0, coverage, errors, gaps, required_categories: required };
}
