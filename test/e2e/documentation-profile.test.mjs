import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  hashDocumentationContent,
  planDocumentationUpdate,
  selectDocumentationProfile,
  selectDocumentationCoverage,
  stripDocumentationManagedMarkers,
} from '../../_refs/documentation/documentation-profile.mjs';

const fact = (id, extra = {}) => ({ id, source_refs: [`src/${id}.ts`], ...extra });
const managed = (id, content, eol = '\n') =>
  `<!-- sdcorejs:managed:${id}:start -->${eol}${content}<!-- sdcorejs:managed:${id}:end -->${eol}`;

test('a workflow guide follows a verified journey without manufacturing CRUD screens', () => {
  const input = {
    audience: 'end-user',
    evidence: {
      journeys: [fact('approval', { steps: ['submit', 'approve', 'notify'] })],
      roles: [fact('approver')],
    },
  };
  const profile = selectDocumentationProfile(input);
  assert.equal(profile.status, 'selected');
  assert.equal(profile.mode, 'write-user-guide');
  assert.equal(profile.documentation_scope, 'journey');
  assert.equal(profile.documentation_audience, 'end-user');
  assert.ok(profile.sections.includes('journey-steps'));
  assert.ok(profile.sections.includes('handoffs'));
  assert.ok(profile.predicates.journey);
  assert.deepEqual(profile.evidence_refs, ['src/approval.ts', 'src/approver.ts']);
  assert.doesNotMatch(profile.sections.join(' '), /CRUD|list|create|update|framework/i);
  assert.deepEqual(selectDocumentationProfile(input), profile);
});

test('an API consumer gets a technical feature reference without UI or entity assumptions', () => {
  const profile = selectDocumentationProfile({
    audience: 'api-consumer',
    evidence: { apis: [fact('webhook')], frameworks: [fact('http-framework')] },
  });
  assert.equal(profile.documentation_scope, 'feature');
  assert.equal(profile.mode, 'write-technical-doc');
  assert.ok(profile.sections.includes('endpoints'));
  assert.ok(profile.sections.includes('requests-responses'));
  assert.ok(profile.sections.includes('framework-inventory'));
  assert.doesNotMatch(profile.sections.join(' '), /screens|CRUD|record-actions/i);
  const user = selectDocumentationProfile({
    audience: 'operator', evidence: { tasks: [fact('retry')], frameworks: [fact('http-framework')] },
  });
  assert.ok(!user.sections.includes('framework-inventory'));
});

test('scope predicates cover roles, states, tasks, entities, modules and explicit feature requests', () => {
  for (const [scope, evidence, audience] of [
    ['role', { roles: [fact('reviewer')] }, 'admin'],
    ['state', { states: [fact('submitted', { transitions: ['approved', 'rejected'] })] }, 'operator'],
    ['task', { tasks: [fact('export')] }, 'end-user'],
    ['entity', { entities: [fact('invoice')] }, 'end-user'],
    ['module', { modules: [fact('billing')] }, 'developer'],
    ['feature', { features: [fact('alerts')], tasks: [fact('acknowledge')] }, 'support'],
  ]) {
    const profile = selectDocumentationProfile({ audience, evidence, requested_scope: scope });
    assert.equal(profile.status, 'selected');
    assert.equal(profile.documentation_scope, scope);
    assert.equal(profile.predicates[scope], true);
  }
});

test('unsupported scope and missing evidence stay blocked instead of inventing a module guide', () => {
  assert.equal(selectDocumentationProfile({ audience: 'end-user', evidence: {} }).status, 'blocked');
  const unsupported = selectDocumentationProfile({
    audience: 'end-user', requested_scope: 'journey', evidence: { entities: [fact('order')] },
  });
  assert.equal(unsupported.status, 'blocked');
  assert.equal(unsupported.documentation_scope, null);
  assert.equal(selectDocumentationProfile({
    audience: 'operator', evidence: { journeys: [fact('one-step', { steps: ['start'] })] },
  }).status, 'blocked');
  assert.throws(() => selectDocumentationProfile({ audience: 'unknown', evidence: {} }), /audience/i);
  assert.throws(() => selectDocumentationProfile({
    audience: 'end-user', evidence: { tasks: [{ id: 'invented' }] },
  }), /source_refs/i);
});

test('automatic selection uses reader-specific role priority while explicit supported scope wins', () => {
  const evidence = {
    roles: [fact('reviewer')], tasks: [fact('approve')],
    states: [fact('pending', { transitions: ['approved'] })],
  };
  assert.equal(selectDocumentationProfile({ audience: 'support', evidence }).documentation_scope, 'role');
  assert.equal(selectDocumentationProfile({ audience: 'end-user', evidence }).documentation_scope, 'state');
  assert.equal(selectDocumentationProfile({
    audience: 'support', requested_scope: 'task', evidence,
  }).documentation_scope, 'task');
});

test('managed updates preserve human prose, unrelated blocks and CRLF bytes in a target file', async t => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-doc-profile-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const file = path.join(temporary, 'guide.md');
  const prefix = '# Manual title\r\n\r\nHuman warning: do not remove.\r\n';
  const suffix = '\r\n## Local notes\r\nKeep this Unicode: café.\r\n' + managed('other', 'Untouched.\r\n', '\r\n');
  const original = prefix + managed('tasks', 'Old steps.\r\n', '\r\n') + suffix;
  await writeFile(file, original);
  const existing = await readFile(file, 'utf8');
  const update = planDocumentationUpdate({
    existing, expected_content_hash: hashDocumentationContent(existing),
    blocks: [{ id: 'tasks', content: 'Verified workflow.\n', expected_hash: hashDocumentationContent('Old steps.\r\n') }],
  });
  assert.equal(update.status, 'updated');
  assert.equal(update.content, prefix + managed('tasks', 'Verified workflow.\r\n', '\r\n') + suffix);
  await writeFile(file, update.content);
  assert.equal(await readFile(file, 'utf8'), update.content);
  const repeated = planDocumentationUpdate({
    existing: update.content, expected_content_hash: update.content_hash,
    blocks: [{ id: 'tasks', content: 'Verified workflow.\n', expected_hash: hashDocumentationContent('Verified workflow.\r\n') }],
  });
  assert.equal(repeated.status, 'unchanged');
  assert.equal(repeated.content, update.content);
});

test('unmarked existing documentation yields a proposal and retains manual content', () => {
  const existing = '---\nowner: sdcorejs-documentation\n---\n# Human guide\nBusiness exception.\n';
  const result = planDocumentationUpdate({
    existing, generated: '# Updated proposal\n', expected_content_hash: hashDocumentationContent(existing),
  });
  assert.equal(result.status, 'proposal');
  assert.equal(result.changed, false);
  assert.equal(result.content, existing);
  assert.equal(result.proposal.generated, '# Updated proposal\n');
});

test('whole-document replacement requires a matching explicit generated-ownership receipt', () => {
  const existing = '# Generated guide\n';
  const generated = '# Current generated guide\n';
  const args = { existing, generated, expected_content_hash: hashDocumentationContent(existing) };
  const replaced = planDocumentationUpdate({
    ...args, generated_ownership: { owner: 'sdcorejs-documentation', content_hash: hashDocumentationContent(existing) },
  });
  assert.equal(replaced.status, 'updated');
  assert.equal(replaced.content, generated);
  const manuallyEdited = planDocumentationUpdate({
    ...args, existing: existing + 'Manual exception.\n',
    expected_content_hash: hashDocumentationContent(existing + 'Manual exception.\n'),
    generated_ownership: { owner: 'sdcorejs-documentation', content_hash: hashDocumentationContent(existing) },
  });
  assert.equal(manuallyEdited.status, 'conflict');
  assert.equal(manuallyEdited.content, existing + 'Manual exception.\n');
});

test('a stale document or edited managed block conflicts without replacing any bytes', () => {
  const existing = managed('tasks', 'Human correction.\n');
  const blocks = [{ id: 'tasks', content: 'New generated text.\n', expected_hash: hashDocumentationContent('Previously generated.\n') }];
  for (const expected of [undefined, hashDocumentationContent('old'), hashDocumentationContent(existing)]) {
    const result = planDocumentationUpdate({ existing, blocks, expected_content_hash: expected });
    assert.equal(result.status, 'conflict');
    assert.equal(result.content, existing);
  }
  assert.equal(planDocumentationUpdate({
    existing, expected_content_hash: hashDocumentationContent(existing),
    blocks: [{ id: 'missing', content: 'New.\n', expected_hash: hashDocumentationContent('') }],
  }).status, 'conflict');
});

test('malformed, duplicate, nested and mismatched managed markers fail closed', () => {
  const start = '<!-- sdcorejs:managed:tasks:start -->\n';
  const end = '<!-- sdcorejs:managed:tasks:end -->\n';
  for (const existing of [
    start + 'No close.\n', end, start + start + end + end,
    managed('tasks', 'First.\n') + managed('tasks', 'Second.\n'),
    start + '<!-- sdcorejs:managed:other:end -->\n',
    '<!-- sdcorejs:managed:tasks:start --\n',
    '<!-- sdcorejs:managed:tasks:begin -->\n',
  ]) {
    const result = planDocumentationUpdate({
      existing, generated: '# Replacement\n', expected_content_hash: hashDocumentationContent(existing),
      generated_ownership: { owner: 'sdcorejs-documentation', content_hash: hashDocumentationContent(existing) },
    });
    assert.equal(result.status, 'conflict');
    assert.equal(result.content, existing);
    assert.match(result.reasons.join(' '), /marker/i);
  }
});

test('new documents are created deterministically and injected markers cannot expand an update', () => {
  const generated = '# New guide\n' + managed('tasks', 'Verified task.\n');
  const created = planDocumentationUpdate({ existing: null, generated });
  assert.equal(created.status, 'created');
  assert.equal(created.content, generated);
  assert.deepEqual(planDocumentationUpdate({ existing: null, generated }), created);
  assert.equal(planDocumentationUpdate({ existing: null, generated: '<!-- sdcorejs:managed:tasks:start -->\n' }).status, 'conflict');
  const injected = planDocumentationUpdate({
    existing: generated, expected_content_hash: created.content_hash,
    blocks: [{ id: 'tasks', content: managed('escape', 'Injected.\n'), expected_hash: hashDocumentationContent('Verified task.\n') }],
  });
  assert.equal(injected.status, 'conflict');
  assert.equal(injected.content, generated);
});

test('one conflicting block prevents every block update and a missing id cannot claim ownership', () => {
  const existing = managed('first', 'Original first.\n') + 'Human separator.\n' + managed('second', 'Human second.\n');
  const result = planDocumentationUpdate({
    existing, expected_content_hash: hashDocumentationContent(existing),
    blocks: [
      { id: 'first', content: 'Changed first.\n', expected_hash: hashDocumentationContent('Original first.\n') },
      { id: 'second', content: 'Changed second.\n', expected_hash: hashDocumentationContent('Original second.\n') },
    ],
  });
  assert.equal(result.status, 'conflict');
  assert.equal(result.content, existing);
  assert.equal(planDocumentationUpdate({
    existing: 'Manual.\n', expected_content_hash: hashDocumentationContent('Manual.\n'),
    blocks: [{ content: 'Invalid block.' }],
  }).status, 'conflict');
});

test('documentation producers use adaptive profiles and safe updates without end-user framework inventories', async () => {
  const [guide, technical, template] = await Promise.all([
    readFile(new URL('../../_refs/documentation/write-user-guide.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/documentation/write-technical-doc.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/shared/user-guide-template.md', import.meta.url), 'utf8'),
  ]);
  for (const source of [guide, technical, template]) {
    assert.match(source, /selectDocumentationProfile/);
    assert.match(source, /planDocumentationUpdate/);
    assert.match(source, /documentation_scope/);
    assert.match(source, /documentation_audience/);
  }
  assert.doesNotMatch(guide + template, /## Core UI Components Used|idempotently overwritten|Idempotent overwrite after approval/i);
  assert.match(technical, /Framework \/ Core UI unit/);
  assert.match(guide, /ui_capture_context/);
  assert.match(guide, /semantic owner/);
});

test('aggregate projection strips only validated delimiter lines and rejects malformed ownership markers', () => {
  const original = '# Human heading\r\n' + managed('guide-body', '<!-- ordinary comment -->\r\nVerified steps.\r\n', '\r\n') + 'Manual footer.\r\n';
  assert.equal(stripDocumentationManagedMarkers(original), '# Human heading\r\n<!-- ordinary comment -->\r\nVerified steps.\r\nManual footer.\r\n');
  assert.throws(() => stripDocumentationManagedMarkers('<!-- sdcorejs:managed:guide-body:start -->\nUnclosed.\n'), /marker/i);
  assert.throws(() => stripDocumentationManagedMarkers(managed('same', 'A.\n') + managed('same', 'B.\n')), /marker/i);
});

const coverageCriterion = (id, text, overrides = {}) => ({ id, text, status: 'accepted', lifecycle: 'active', ...overrides });
function coverageSource(overrides = {}) {
  return {
    source_id: 'spec-current', kind: 'spec', lifecycle: 'active',
    repository_id: 'example.com/team/orders', contract_id: 'orders-review',
    source_ref: '.sdcorejs/specs/workflow/review.md', content: '# Approved review specification\n',
    identity: {
      artifact_id: 'spec-review-r2', repository_id: 'example.com/team/orders', contract_id: 'orders-review',
      change_ref: 'review-r2', source_revision: 'a'.repeat(40),
      repository_relative_path: '.sdcorejs/specs/workflow/review.md', approval_hash: `sha256:v1:${'b'.repeat(64)}`,
    },
    criteria: [coverageCriterion('AC-001', 'A reviewer can approve a pending request.')],
    ...overrides,
  };
}
function coverageReceipt(source, overrides = {}) {
  return {
    authority_verified: true, identity: { ...source.identity },
    content_hash: hashDocumentationContent(source.content),
    criteria_hash: hashDocumentationContent(JSON.stringify(source.criteria)),
    verification_refs: ['host:approved-artifact-and-decision-coverage'], ...overrides,
  };
}

test('coverage selects only active accepted criteria from verified current approved specs', () => {
  const spec = coverageSource({ criteria: [
    coverageCriterion('AC-001', 'A reviewer can approve a pending request.'),
    coverageCriterion('AC-002', 'A reviewer can approve a pending request.'),
    coverageCriterion('AC-003', 'Notify an observer.', { status: 'proposed' }),
    coverageCriterion('AC-004', 'Legacy auto-approval.', { lifecycle: 'superseded' }),
  ] });
  const prd = coverageSource({
    source_id: 'prd', kind: 'prd', identity: undefined, source_ref: '.sdcorejs/prd/review.md',
    criteria: [coverageCriterion('AC-005', 'Send a receipt.', { status: 'proposed' })],
  });
  const result = selectDocumentationCoverage({ sources: [spec, prd], verified_current_specs: [coverageReceipt(spec)] });
  assert.equal(result.status, 'selected');
  assert.deepEqual(result.accepted_criteria.map(criterion => criterion.id), ['AC-001', 'AC-002']);
  assert.equal(result.coverage_total, 2, 'same meaning does not collapse distinct stable AC IDs');
  assert.deepEqual(result.proposals.map(criterion => criterion.id), ['AC-003', 'AC-005']);
  assert.deepEqual(result.excluded.map(criterion => criterion.id), ['AC-004']);
  assert.equal(result.accepted_criteria[0].identity.approval_hash, spec.identity.approval_hash);
});

test('spec labels, accepted labels and checkboxes cannot supply coverage authority', () => {
  const spec = coverageSource({ criteria: [coverageCriterion('AC-001', '[x] Approved-looking requirement.')] });
  spec.authority_verified = true;
  spec.verified_current_specs = [coverageReceipt(spec)];
  for (const verified_current_specs of [[], [coverageReceipt(spec, { authority_verified: false })]]) {
    const result = selectDocumentationCoverage({ sources: [spec], verified_current_specs });
    assert.equal(result.status, 'gap');
    assert.equal(result.coverage_total, null);
    assert.deepEqual(result.accepted_criteria, []);
    assert.equal(result.proposals[0].id, 'AC-001');
    assert.ok(result.gaps.length > 0);
  }
});

test('current spec receipt binds both exact source bytes and the verified extraction', () => {
  const spec = coverageSource();
  const receipt = coverageReceipt(spec);
  for (const changed of [
    { ...spec, content: spec.content + 'Unapproved change.\n' },
    { ...spec, criteria: [coverageCriterion('AC-001', 'Silently broaden behavior.')] },
  ]) {
    const result = selectDocumentationCoverage({ sources: [changed], verified_current_specs: [receipt] });
    assert.equal(result.status, 'conflict');
    assert.deepEqual(result.accepted_criteria, []);
    assert.equal(result.coverage_total, null);
  }
});

test('supporting source ID conflicts remain visible without overriding approved criteria', () => {
  const spec = coverageSource();
  const requirement = coverageSource({
    source_id: 'ticket', kind: 'requirement', identity: undefined,
    source_ref: '.sdcorejs/documentation/requirements/T-1/T-1.md',
    criteria: [coverageCriterion('AC-001', 'Anyone can approve every request.')],
  });
  const result = selectDocumentationCoverage({ sources: [spec, requirement], verified_current_specs: [coverageReceipt(spec)] });
  assert.equal(result.status, 'conflict');
  assert.equal(result.accepted_criteria[0].text, spec.criteria[0].text);
  assert.equal(result.conflicts[0].criterion_id, 'AC-001');
  assert.equal(result.proposals[0].text, requirement.criteria[0].text);
  assert.equal(result.coverage_total, null);
  assert.equal(result.provenance.length, 2);
});

test('duplicate criteria or conflicting current spec identities fail closed', () => {
  const spec = coverageSource();
  const duplicate = coverageSource({ criteria: [...spec.criteria, coverageCriterion('AC-001', 'Changed meaning.')] });
  const otherIdentity = coverageSource({
    source_id: 'competing-spec', identity: { ...spec.identity, artifact_id: 'spec-review-r3', approval_hash: `sha256:v1:${'c'.repeat(64)}` },
  });
  for (const input of [
    { sources: [duplicate], verified_current_specs: [coverageReceipt(duplicate)] },
    { sources: [spec, otherIdentity], verified_current_specs: [coverageReceipt(spec), coverageReceipt(otherIdentity)] },
    { sources: [spec], verified_current_specs: [coverageReceipt(spec), coverageReceipt(spec)] },
  ]) {
    const result = selectDocumentationCoverage(input);
    assert.equal(result.status, 'conflict');
    assert.deepEqual(result.accepted_criteria, []);
    assert.equal(result.coverage_total, null);
  }
});

test('superseded source criteria remain excluded and a missing current approved spec is a gap', () => {
  const spec = coverageSource();
  const old = coverageSource({
    source_id: 'spec-old', lifecycle: 'superseded',
    identity: { ...spec.identity, artifact_id: 'spec-review-r1', approval_hash: `sha256:v1:${'d'.repeat(64)}` },
  });
  const missing = selectDocumentationCoverage({ sources: [old], verified_current_specs: [coverageReceipt(spec)] });
  assert.equal(missing.status, 'gap');
  assert.deepEqual(missing.accepted_criteria, []);
  assert.equal(missing.excluded[0].id, 'AC-001');
  assert.equal(missing.coverage_total, null);
  const current = selectDocumentationCoverage({ sources: [old, spec], verified_current_specs: [coverageReceipt(spec)] });
  assert.equal(current.status, 'selected');
  assert.equal(current.coverage_total, 1);
  assert.equal(current.conflicts.length, 0);
});

test('supporting duplicates add provenance without multiplying coverage or borrowing receipt authority', () => {
  const spec = coverageSource();
  const prd = coverageSource({ source_id: 'prd', kind: 'prd', identity: undefined });
  const supported = selectDocumentationCoverage({ sources: [spec, prd], verified_current_specs: [coverageReceipt(spec)] });
  assert.equal(supported.status, 'selected');
  assert.equal(supported.coverage_total, 1);
  assert.equal(supported.provenance.length, 2);
  assert.equal(supported.proposals[0].claimed_status, 'accepted');
  assert.equal(supported.proposals[0].status, 'proposed');
  const impostor = { ...prd, source_id: spec.source_id, contract_id: 'unapproved-contract' };
  const conflict = selectDocumentationCoverage({ sources: [impostor, spec], verified_current_specs: [coverageReceipt(spec)] });
  assert.equal(conflict.status, 'conflict');
  assert.deepEqual(conflict.accepted_criteria, []);
  assert.equal(conflict.coverage_total, null);
});

test('coverage rejects noncanonical IDs and implicit lifecycle rather than normalizing or guessing', () => {
  for (const criterion of [
    coverageCriterion('ac-001', 'Wrong case.'),
    coverageCriterion('AC-01', 'Wrong width.'),
    coverageCriterion('AC-001', 'Unknown lifecycle.', { lifecycle: undefined }),
    coverageCriterion('AC-001', 'Checkbox approval.', { status: true }),
  ]) {
    const spec = coverageSource({ criteria: [criterion] });
    assert.throws(() => selectDocumentationCoverage({ sources: [spec], verified_current_specs: [coverageReceipt(spec)] }), /canonical AC IDs/i);
  }
});

test('guide coverage instructions keep approval authority, stable AC IDs and missing-spec gaps explicit', async () => {
  const guide = await readFile(new URL('../../_refs/documentation/write-user-guide.md', import.meta.url), 'utf8');
  const reference = await readFile(new URL('../../_refs/documentation/documentation-profile.md', import.meta.url), 'utf8');
  assert.match(guide, /selectDocumentationCoverage/);
  assert.match(guide, /decision-coverage\.mjs/);
  assert.match(guide, /approved-artifact\.mjs/);
  assert.doesNotMatch(guide, /merge their criteria|deduplicate by intent|Coverage is best-effort from code harvest/i);
  assert.match(reference, /trusted host/);
  assert.match(reference, /not a new\s+approval authority/);
});
