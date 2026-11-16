import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { approveDecisionCoverage } from '../../_refs/shared/decision-coverage.mjs';
import { evaluateValidationEvidence } from '../../_refs/shared/validation-map.mjs';
import {
  ticketIdentity, classifyTicketArtifactPath, createTicketSnapshot, readTicketSnapshot, compareTicketSnapshots,
  createTicketUpdatePlan, verifyTicketUpdatePreconditions, verifyTicketUpdateReadback,
} from '../../_refs/product/ticket-intake.mjs';
import * as ticketContracts from '../../_refs/product/ticket-intake.mjs';

import { hash, identity, now, png, imageAttachment, intake, validation, twoCriteriaValidation, setFullE2E, e2ePolicy, delivery, authority, ticketScope } from './fixtures/ticket-intake-inputs.mjs';
import { stableJson } from '../../_refs/product/task-breakdown/safety.mjs';

function storedBody(body, section = 'snapshots', directoryIdentity = body.identity) {
  const bytes = Buffer.from(`${stableJson(body)}\n`);
  const content_hash = hash(bytes);
  const path = `${ticketIdentity(directoryIdentity).directory}/${section}/${content_hash}.json`;
  return { bytes, path, hydrated: { ...body, content_hash, path } };
}

function sourceHash(body) {
  const { identity, url, updated_at, original, attachments_complete, attachments } = body;
  return hash(Buffer.from(`${stableJson({ identity, url, updated_at, original, attachments_complete, attachments })}\n`));
}

function deliveredFixture() {
  const input = delivery();
  const { plan } = createTicketUpdatePlan(input);
  const args = { plan, validation_evidence: input.validation_evidence, verified_at: now, write_result: { previous_revision: plan.source.revision, revision: 'etag-2', payload_hash: plan.payload_hash, remote_id: 'remote-1' }, readback: { identity, revision: 'etag-2', updates: [{ id: 'remote-1', body: plan.payload.body }] } };
  return { input, plan, args, result: verifyTicketUpdateReadback(args) };
}

test('canonical passing evidence must belong to the ticket change, approved requirement owner and applied run owner', () => {
  const control = delivery();
  assert.equal(createTicketUpdatePlan(control).status, 'ready');
  for (const [mutate, code] of [
    [(value) => { value.test_evidence.change_ref = 'another-change'; }, 'EVIDENCE_CHANGE_MISMATCH'],
    [(value) => { value.test_evidence.runs[0].repository_id = 'github.com/other/repo'; }, 'EVIDENCE_REPOSITORY_MISMATCH'],
    [(value) => { value.decision_coverage.records[0].owner_repository_id = 'github.com/other/repo'; value.decision_coverage = approveDecisionCoverage(value.decision_coverage, ticketScope); }, 'REQUIREMENT_OWNER_MISMATCH'],
    [(value) => { value.decision_coverage = approveDecisionCoverage(value.decision_coverage, { ...ticketScope, change_ref: 'another-change' }); }, 'DECISION_COVERAGE_SCOPE_MISMATCH'],
  ]) {
    const evidence = validation(); mutate(evidence);
    assert.equal(evaluateValidationEvidence(evidence).ready, true);
    const result = createTicketUpdatePlan(delivery({ validation_evidence: evidence }));
    assert.equal(result.status, 'blocked');
    assert.equal(result.implementation_status, 'FAIL');
    assert.ok(result.blockers.includes(code), JSON.stringify(result.blockers));
  }
});

test('write and readback gates repeat repository and change binding even for rehashed plan evidence', () => {
  const { input, plan, args } = deliveredFixture();
  for (const [mutate, code] of [
    [(value) => { value.test_evidence.change_ref = 'another-change'; }, 'EVIDENCE_CHANGE_MISMATCH'],
    [(value) => { value.test_evidence.runs[0].repository_id = 'github.com/other/repo'; }, 'EVIDENCE_REPOSITORY_MISMATCH'],
  ]) {
    const evidence = validation(); mutate(evidence);
    const changedPlan = structuredClone(plan);
    changedPlan.evidence_hash = hash(Buffer.from(`${stableJson(evidence)}\n`));
    const { plan_hash: _oldHash, ...body } = changedPlan;
    changedPlan.plan_hash = hash(Buffer.from(`${stableJson(body)}\n`));
    const before = verifyTicketUpdatePreconditions({ plan: changedPlan, latest_snapshot: input.snapshot, validation_evidence: evidence, existing_updates: [], authorization: authority(changedPlan) });
    assert.equal(before.status, 'blocked');
    assert.ok(before.blockers.includes(code), JSON.stringify(before.blockers));
    const after = verifyTicketUpdateReadback({ ...args, plan: changedPlan, validation_evidence: evidence });
    assert.equal(after.verified, false);
    assert.ok(after.blockers.includes(code), JSON.stringify(after.blockers));
  }
});

test('rehashed manifests cannot hide incomplete assets, approval gaps or malformed source shape', () => {
  const partial = createTicketSnapshot(intake({ attachments: [imageAttachment({ privacy_review: null })] }));
  for (const mutate of [
    (body) => { body.complete = true; },
    (body) => { body.complete = true; body.blockers = []; },
    (body) => { body.complete = true; body.blockers = []; body.attachments[0].status = 'available'; },
    (body) => { body.original.comments = 'invalid'; },
    (body) => { body.requirements[0].authority = 'approved'; },
  ]) {
    const body = JSON.parse(partial.files[0].bytes);
    mutate(body); body.source_hash = sourceHash(body);
    const stored = storedBody(body);
    assert.throws(() => readTicketSnapshot(stored.bytes, stored.path), TypeError);
    assert.throws(() => createTicketUpdatePlan(delivery({ snapshot: stored.hydrated, latest_snapshot: stored.hydrated })), TypeError);
  }
  const available = createTicketSnapshot(intake({ attachments: [imageAttachment()] }));
  for (const mutate of [
    (body) => { body.attachments[0].privacy_review = null; },
    (body) => { body.attachments[0].privacy_review.sha256 = 'a'.repeat(64); },
    (body) => { body.attachments[0].path = body.attachments[0].path.replace('/reference/', '/real-ui-evidence/'); },
    (body) => { body.attachments_complete = false; },
    (body) => { body.owner_repository_id = ''; },
  ]) {
    const body = JSON.parse(available.files[0].bytes);
    mutate(body); body.source_hash = sourceHash(body);
    const stored = storedBody(body);
    assert.throws(() => readTicketSnapshot(stored.bytes, stored.path), TypeError);
  }
});

test('delivery reader rejects moved, noncanonical and internally contradictory receipt or plan files', () => {
  assert.equal(typeof ticketContracts.readTicketDelivery, 'function');
  const { input, plan, result } = deliveredFixture();
  assert.equal(result.verified, true);
  assert.deepEqual(ticketContracts.readTicketDelivery(result.files[0].bytes, result.files[0].path), result.receipt);
  const planFile = storedBody(plan, 'delivery');
  const loadedPlan = ticketContracts.readTicketDelivery(planFile.bytes, planFile.path);
  assert.equal(loadedPlan.plan_hash, plan.plan_hash);
  assert.equal(verifyTicketUpdatePreconditions({ plan: loadedPlan, latest_snapshot: input.snapshot, validation_evidence: input.validation_evidence, existing_updates: [], authorization: authority(loadedPlan) }).status, 'ready');
  const moved = storedBody(JSON.parse(result.files[0].bytes), 'delivery', { ...identity, id: '999' });
  assert.throws(() => ticketContracts.readTicketDelivery(moved.bytes, moved.path), /identity/u);
  const noncanonical = Buffer.from(JSON.stringify(JSON.parse(result.files[0].bytes), null, 2));
  assert.throws(() => ticketContracts.readTicketDelivery(noncanonical, `${ticketIdentity(identity).directory}/delivery/${hash(noncanonical)}.json`), /canonical/u);
  for (const mutate of [
    (body) => { body.owner_repository_id = 'github.com/other/repo'; },
    (body) => { body.change_ref = 'another-change'; },
    (body) => { body.remote_revision = 'etag-3'; },
    (body) => { body.payload_hash = 'a'.repeat(64); },
    (body) => { body.source.snapshot_path = `${ticketIdentity({ ...identity, id: '999' }).directory}/snapshots/${body.source.snapshot_hash}.json`; },
    (body) => { body.readback.payload_hash = 'b'.repeat(64); },
    (body) => { body.write_result.previous_revision = 'different-source'; },
  ]) {
    const body = JSON.parse(result.files[0].bytes);
    mutate(body);
    const stored = storedBody(body, 'delivery');
    assert.throws(() => ticketContracts.readTicketDelivery(stored.bytes, stored.path), TypeError);
  }
});

test('ticket identity separates provider, instance, project/repository and exact external id', () => {
  const variants = [identity, { ...identity, provider: 'jira' }, { ...identity, instance: 'https://tracker.example.com' }, { ...identity, repository: 'other/orders' }, { provider: 'github', instance: identity.instance, project: identity.repository, id: '42' }, { ...identity, id: '042' }];
  const identities = variants.map(ticketIdentity);
  assert.equal(new Set(identities.map((value) => value.directory)).size, variants.length);
  assert.equal(ticketIdentity({ ...identity, instance: 'https://GITHUB.com/' }).directory, identities[0].directory);
});

test('snapshot bundles redact original text and text assets but preserve reviewed image bytes', () => {
  const secret = 'ghp_abcdefghijklmnopqrstuvwxyz1234567890';
  const input = intake({ description: `Use token=${secret} for example.`, attachments: [
    imageAttachment(), { id: 'notes', filename: 'notes.txt', media_type: 'text/plain', role: 'reference', bytes: Buffer.from(`password=supersecret123\nDetails`) },
  ] });
  const result = createTicketSnapshot(input);
  assert.match(result.snapshot.original.description, /REDACTED/u);
  assert.equal(result.assets.length, 2);
  const image = result.assets.find((file) => file.media_type === 'image/png');
  assert.deepEqual(image.bytes, png);
  assert.equal(image.sha256, hash(image.bytes));
  assert.equal(result.snapshot.attachments[0].url.includes('?'), false);
  for (const file of result.files) {
    assert.equal(hash(file.bytes), file.sha256);
    assert.ok(file.path.includes(file.sha256));
    assert.equal(file.bytes.toString().includes(secret), false);
  }
  assert.equal(result.assets.find((file) => file.media_type === 'text/plain').bytes.toString().includes('supersecret123'), false);
  assert.equal(input.description.includes(secret), true);
  assert.equal(result.snapshot.content_hash, result.files.find((file) => file.artifact_kind === 'ticket-snapshot').sha256);
  assert.equal(result.snapshot.authority, 'external-source-data');
  assert.equal(result.snapshot.requirements[0].authority, 'draft');
  assert.equal(result.snapshot.requirements[0].proposed_acceptance_criteria[0].status, 'proposed');
});

test('partial attachment enumeration and unavailable or unreviewed assets remain explicit blockers', () => {
  const result = createTicketSnapshot(intake({ attachments_complete: false, attachments: [imageAttachment({ privacy_review: null }), { id: 'missing', filename: 'missing.txt', media_type: 'text/plain', role: 'reference', status: 'unavailable', reason: 'Permission denied' }] }));
  assert.equal(result.snapshot.complete, false);
  assert.equal(result.assets.length, 0);
  assert.equal(result.snapshot.attachments.length, 2);
  assert.ok(result.snapshot.blockers.includes('ATTACHMENT_LIST_INCOMPLETE'));
  assert.ok(result.snapshot.blockers.includes('ASSET_PRIVACY_REVIEW_REQUIRED'));
  assert.ok(result.snapshot.blockers.includes('ASSET_UNAVAILABLE'));
  assert.equal(createTicketUpdatePlan(delivery({ snapshot: result.snapshot, latest_snapshot: result.snapshot })).status, 'blocked');
});

test('JSON credentials are redacted by key and unsupported attachment media remain visible gaps', () => {
  const result = createTicketSnapshot(intake({ attachments: [
    { id: 'json', filename: 'request.json', media_type: 'application/json', role: 'reference', bytes: Buffer.from('{"token":"abc123","nested":{"password":"short"},"label":"Keep this"}') },
    { id: 'pdf', filename: 'report.pdf', media_type: 'application/pdf', role: 'reference', bytes: Buffer.from('%PDF-1.4') },
  ] }));
  const json = JSON.parse(result.assets[0].bytes.toString());
  assert.equal(json.token, '[REDACTED]');
  assert.equal(json.nested.password, '[REDACTED]');
  assert.equal(json.label, 'Keep this');
  assert.equal(result.snapshot.attachments[1].media_type, 'application/pdf');
  assert.equal(result.snapshot.attachments[1].status, 'unsupported');
  assert.equal(result.snapshot.complete, false);
  assert.equal(result.assets.length, 1);
});

test('quoted credentials in tracker prose are sanitized without deleting the surrounding source', () => {
  const result = createTicketSnapshot(intake({ description: 'Example: {"password":"short", "token":"opaque-value"}. Keep the requirement.' }));
  assert.equal(result.snapshot.original.description.includes('short'), false);
  assert.equal(result.snapshot.original.description.includes('opaque-value'), false);
  assert.match(result.snapshot.original.description, /Keep the requirement/u);
});

test('image references cannot become real UI evidence without capture provenance', () => {
  assert.throws(() => createTicketSnapshot(intake({ attachments: [imageAttachment({ role: 'real-ui-evidence' })] })), /provenance/u);
  const result = createTicketSnapshot(intake({ attachments: [imageAttachment({ role: 'real-ui-evidence', provenance: { source: 'real-browser', run_id: 'run-ui', case_id: 'case-ui', associated_HEAD_or_diff: 'diff:ui', captured_at: now } })] }));
  assert.ok(result.assets[0].path.includes('/assets/real-ui-evidence/'));
  assert.equal(result.snapshot.attachments[0].provenance.source, 'real-browser');
});

test('unsafe paths, URLs, asset formats, dangling provenance and malformed values fail closed', () => {
  for (const value of [null, [], '42']) assert.throws(() => ticketIdentity(value), TypeError);
  for (const url of ['file:///etc/passwd', 'https://user:password@github.com', 'https://localhost/x', 'https://127.0.0.1/x', 'https://github.com/%2e%2e/private']) {
    assert.throws(() => createTicketSnapshot(intake({ url })), /URL/u);
  }
  for (const filename of ['../secret.png', '/tmp/secret.png', 'a\\b.png', '%2e%2e.png']) assert.throws(() => createTicketSnapshot(intake({ attachments: [imageAttachment({ filename })] })), /filename/u);
  assert.throws(() => createTicketSnapshot(intake({ attachments: [imageAttachment({ bytes: Buffer.from('<script>unsafe</script>') })] })), /signature/u);
  assert.throws(() => createTicketSnapshot(intake({ attachments: [imageAttachment({ bytes: 'not bytes' })] })), /bytes/u);
  assert.throws(() => createTicketSnapshot(intake({ requirements: [{ id: 'R-001', statement: 'X', source_refs: ['attachment:absent'], proposed_acceptance_criteria: [] }] })), /source_refs/u);
  assert.throws(() => createTicketSnapshot(intake({ requirements: [{ ...intake().requirements[0], proposed_acceptance_criteria: [{ id: 'AC-001', statement: 'X', status: 'approved', source_refs: ['description'] }] }] })), /proposed/u);
  assert.throws(() => createTicketSnapshot(intake({ comments: 'malformed' })), /comments/u);
  assert.throws(() => createTicketSnapshot(intake({ attachments_complete: 'true' })), /attachments_complete/u);
});

test('refresh detects changed revisions, source content and bytes without rewriting approved behavior', () => {
  const first = createTicketSnapshot(intake()).snapshot;
  const refreshed = createTicketSnapshot(intake({ captured_at: '2026-11-14T09:00:00.000Z' })).snapshot;
  assert.equal(compareTicketSnapshots(first, refreshed).status, 'unchanged');
  for (const change of [{ revision: 'etag-2' }, { description: 'New behavior requested' }, { attachments: [{ id: 'new', filename: 'new.txt', media_type: 'text/plain', role: 'reference', bytes: Buffer.from('new attachment') }] }]) {
    const next = createTicketSnapshot(intake(change)).snapshot;
    const result = compareTicketSnapshots(first, next);
    assert.equal(result.status, 'changed');
    assert.equal(result.requires_spec_review, true);
    assert.equal(result.approved_behavior_changed, false);
    assert.notEqual(first.content_hash, next.content_hash);
  }
  assert.throws(() => compareTicketSnapshots(first, { ...first, revision: 'tampered' }), /hash/u);
  assert.throws(() => compareTicketSnapshots(first, createTicketSnapshot(intake({ identity: { ...identity, id: '43' } })).snapshot), /identity/u);
});

test('delivery uses canonical validation evidence and keeps local implementation separate from tracker sync', () => {
  const result = createTicketUpdatePlan(delivery());
  assert.equal(result.status, 'ready', JSON.stringify(result.blockers));
  assert.equal(result.implementation_status, 'PASS');
  assert.equal(result.remote_sync_status, 'pending');
  assert.match(result.plan.payload.body, /case-totals/u);
  assert.ok(result.plan.payload.body.includes(result.plan.marker));
  for (const mutate of [
    (evidence) => { evidence.current.associated_HEAD_or_diff = 'diff:changed'; },
    (evidence) => { evidence.test_evidence.runs[0].command = 'unrelated command'; },
    (evidence) => { evidence.test_evidence.cases = []; },
    (evidence) => { evidence.coverage_matrix = []; },
    (evidence) => { evidence.test_evidence.runs[0].stale = true; },
    (evidence) => { evidence.decision_coverage.records[1].statement = 'Unapproved changed AC'; },
  ]) {
    const input = delivery(); mutate(input.validation_evidence);
    assert.equal(createTicketUpdatePlan(input).status, 'blocked');
  }
  assert.equal(createTicketUpdatePlan(delivery({ validation_evidence: { passed: true } })).status, 'blocked');
  assert.equal(createTicketUpdatePlan(delivery({ validation_evidence: null })).status, 'blocked');
});

test('explicit manual acceptance remains MANUAL and missing acknowledgement blocks delivery', () => {
  const evidence = validation();
  Object.assign(evidence.validation_map[0], { levels: ['uat'], planned_command: null, command_source: 'manual', evidence_class: 'SUPPLEMENTAL_SMOKE', automation: 'manual', rationale: 'The approved owner reviews the guide.', owner: 'product-owner', acknowledgement_required: true });
  evidence.coverage_matrix = structuredClone(evidence.validation_map);
  Object.assign(evidence.test_evidence, {
    status: { planning: 'approved', authoring: 'not-requested', executability: 'not-applicable', execution: 'not-run', result: 'not-applicable', evidence: 'current', documentation: 'not-requested' }, runs: [], cases: [],
    acknowledgements: [{ case_id: 'case-totals', acknowledged_by: 'product-owner', associated_HEAD_or_diff: evidence.current.associated_HEAD_or_diff }],
  });
  const input = delivery({ validation_evidence: evidence, e2e_policy: { behavior: 'documentation', exception: e2ePolicy.exception } });
  const result = createTicketUpdatePlan(input);
  assert.equal(result.status, 'ready', JSON.stringify(result.blockers));
  assert.equal(result.implementation_status, 'MANUAL');
  assert.match(result.plan.payload.body, /Implementation evidence: MANUAL/u);
  evidence.test_evidence.acknowledgements = [];
  assert.equal(createTicketUpdatePlan(input).status, 'blocked');
});

test('stored manifests require canonical bytes, matching filename hashes and complete path separators', () => {
  const bundle = createTicketSnapshot(intake());
  const file = bundle.files[0];
  assert.deepEqual(readTicketSnapshot(file.bytes, file.path), bundle.snapshot);
  assert.throws(() => readTicketSnapshot(Buffer.from('{}'), file.path), /hash/u);
  assert.throws(() => readTicketSnapshot(file.bytes, file.path.replace(file.sha256, 'f'.repeat(64))), /hash/u);
  const missingSeparator = file.path.replace('/snapshots/', 'snapshots/');
  assert.equal(classifyTicketArtifactPath(missingSeparator).ok, false);
});

test('cyclic or nonportable canonical evidence blocks delivery without leaking malformed values', () => {
  const evidence = validation();
  evidence.test_evidence.extra = evidence.test_evidence;
  assert.equal(createTicketUpdatePlan(delivery({ validation_evidence: evidence })).status, 'blocked');
  const symbolEvidence = validation();
  symbolEvidence.test_evidence.extra = Symbol('opaque');
  assert.equal(createTicketUpdatePlan(delivery({ validation_evidence: symbolEvidence })).status, 'blocked');
});

test('a replaced asset changes source hashes and privacy approval cannot transfer to other bytes', () => {
  const attachment = { id: 'notes', filename: 'notes.txt', media_type: 'text/plain', role: 'reference', bytes: Buffer.from('before') };
  const before = createTicketSnapshot(intake({ attachments: [attachment] })).snapshot;
  const after = createTicketSnapshot(intake({ attachments: [{ ...attachment, bytes: Buffer.from('after!') }] })).snapshot;
  assert.equal(compareTicketSnapshots(before, after).content_changed, true);
  assert.notEqual(before.attachments[0].path, after.attachments[0].path);
  const result = createTicketSnapshot(intake({ attachments: [imageAttachment({ privacy_review: { status: 'approved', reviewed_by: 'reviewer', sha256: 'a'.repeat(64) } })] }));
  assert.equal(result.snapshot.complete, false);
  assert.equal(result.assets.length, 0);
});

test('E2E is selected by behavior and pure logic requires a documented approved decision', () => {
  for (const policy of [{ behavior: 'ui' }, { behavior: 'api' }, { behavior: 'cli' }, { behavior: 'job' }, { behavior: 'pure-logic' }, { behavior: 'documentation', exception: { reason: 'No application', decision_ref: 'D-999' } }]) {
    assert.equal(createTicketUpdatePlan(delivery({ e2e_policy: policy })).status, 'blocked');
  }
  assert.equal(createTicketUpdatePlan(delivery({ e2e_policy: e2ePolicy })).status, 'ready');
  for (const [behavior, level] of [['ui', 'browser-e2e'], ['api', 'api-e2e'], ['cli', 'integration'], ['job', 'integration']]) {
    const evidence = validation();
    evidence.validation_map[0].levels = [level];
    evidence.validation_map[0].evidence_class = 'FULL_E2E';
    evidence.coverage_matrix = structuredClone(evidence.validation_map);
    evidence.test_evidence.runs[0].evidence_class = 'FULL_E2E';
    assert.equal(createTicketUpdatePlan(delivery({ e2e_policy: { behavior }, validation_evidence: evidence })).status, 'ready');
  }
});

test('an unrelated full E2E criterion cannot satisfy a required UI, API, CLI or job behavior', () => {
  for (const [behavior, level] of [['ui', 'browser-e2e'], ['api', 'api-e2e'], ['cli', 'integration'], ['job', 'integration']]) {
    const evidence = twoCriteriaValidation();
    setFullE2E(evidence, 1, [level]);
    assert.equal(evaluateValidationEvidence(evidence).ready, true, JSON.stringify(evaluateValidationEvidence(evidence).blockers));
    const legacy = createTicketUpdatePlan(delivery({ validation_evidence: evidence, e2e_policy: { behavior } }));
    assert.equal(legacy.status, 'blocked');
    assert.ok(legacy.blockers.includes('BEHAVIOR_E2E_REQUIRED'));
    const scoped = createTicketUpdatePlan(delivery({ validation_evidence: evidence, e2e_policy: { behaviors: [
      { behavior, acceptance_criterion_refs: ['AC-001'] },
      { behavior: 'pure-logic', acceptance_criterion_refs: ['AC-002'], exception: e2ePolicy.exception },
    ] } }));
    assert.equal(scoped.status, 'blocked');
    assert.ok(scoped.blockers.includes('BEHAVIOR_E2E_REQUIRED'));
  }
});

test('mixed behaviors bind each accepted criterion and survive current write and receipt checks', () => {
  const evidence = twoCriteriaValidation();
  setFullE2E(evidence, 0, ['browser-e2e']);
  assert.equal(evaluateValidationEvidence(evidence).ready, true, JSON.stringify(evaluateValidationEvidence(evidence).blockers));
  const input = delivery({ validation_evidence: evidence, e2e_policy: { behaviors: [
    { behavior: 'ui', acceptance_criterion_refs: ['AC-001'] },
    { behavior: 'pure-logic', acceptance_criterion_refs: ['AC-002'], exception: e2ePolicy.exception },
  ] } });
  const result = createTicketUpdatePlan(input);
  assert.equal(result.status, 'ready', JSON.stringify(result.blockers));
  assert.deepEqual(result.plan.e2e_policy.behaviors.map(({ acceptance_criterion_refs }) => acceptance_criterion_refs), [['AC-001'], ['AC-002']]);
  const { plan } = result;
  assert.equal(verifyTicketUpdatePreconditions({ plan, latest_snapshot: input.snapshot, validation_evidence: evidence, authorization: authority(plan), existing_updates: [] }).status, 'ready');
  assert.equal(verifyTicketUpdateReadback({ plan, validation_evidence: evidence, verified_at: now, write_result: { previous_revision: plan.source.revision, revision: 'etag-2', payload_hash: plan.payload_hash, remote_id: 'remote-1' }, readback: { identity, revision: 'etag-2', updates: [{ id: 'remote-1', body: plan.payload.body }] } }).verified, true);
});

test('additive policies cannot omit, invent or ambiguously assign accepted criteria', () => {
  const evidence = twoCriteriaValidation();
  assert.equal(evaluateValidationEvidence(evidence).ready, true, JSON.stringify(evaluateValidationEvidence(evidence).blockers));
  for (const policy of [
    { behaviors: [{ behavior: 'pure-logic', acceptance_criterion_refs: ['AC-001'], exception: e2ePolicy.exception }] },
    { behaviors: [{ behavior: 'pure-logic', acceptance_criterion_refs: ['AC-001', 'AC-002', 'AC-999'], exception: e2ePolicy.exception }] },
    { behaviors: [{ behavior: 'pure-logic', acceptance_criterion_refs: ['AC-001', 'AC-001', 'AC-002'], exception: e2ePolicy.exception }] },
    { behaviors: [{ behavior: 'pure-logic', exception: e2ePolicy.exception }] },
    { behaviors: [] },
    { behavior: 'pure-logic', acceptance_criterion_refs: null, exception: e2ePolicy.exception },
    { behavior: 'pure-logic', exception: e2ePolicy.exception, behaviors: [{ behavior: 'ui', acceptance_criterion_refs: ['AC-001', 'AC-002'] }] },
  ]) assert.equal(createTicketUpdatePlan(delivery({ validation_evidence: evidence, e2e_policy: policy })).status, 'blocked');
});

test('multiple behaviors on one criterion impose every declared canonical E2E layer', () => {
  const evidence = validation();
  setFullE2E(evidence, 0, ['browser-e2e']);
  const policy = { behaviors: [{ behavior: 'ui', acceptance_criterion_refs: ['AC-001'] }, { behavior: 'api', acceptance_criterion_refs: ['AC-001'] }] };
  assert.equal(createTicketUpdatePlan(delivery({ validation_evidence: evidence, e2e_policy: policy })).status, 'blocked');
  setFullE2E(evidence, 0, ['browser-e2e', 'api-e2e']);
  const result = createTicketUpdatePlan(delivery({ validation_evidence: evidence, e2e_policy: policy }));
  assert.equal(result.status, 'ready', JSON.stringify(result.blockers));
});

test('readback requires the connector write version and rejects edits after that write', () => {
  const input = delivery(); const { plan } = createTicketUpdatePlan(input);
  const writeResult = { previous_revision: plan.source.revision, revision: 'etag-2', payload_hash: plan.payload_hash, remote_id: 'remote-1' };
  const args = { plan, validation_evidence: input.validation_evidence, verified_at: now, write_result: writeResult, readback: { identity, revision: 'etag-2', updates: [{ id: 'remote-1', body: plan.payload.body }] } };
  assert.equal(verifyTicketUpdateReadback(args).verified, true);
  assert.equal(verifyTicketUpdateReadback({ ...args, write_result: null }).verified, false);
  assert.equal(verifyTicketUpdateReadback({ ...args, write_result: { ...writeResult, previous_revision: 'another revision' } }).verified, false);
  assert.equal(verifyTicketUpdateReadback({ ...args, readback: { ...args.readback, revision: 'etag-3' } }).verified, false);
});

test('write authorization binds the exact payload, source refresh and current evidence', () => {
  const input = delivery(); const { plan } = createTicketUpdatePlan(input);
  const args = { plan, latest_snapshot: input.snapshot, validation_evidence: input.validation_evidence, authorization: authority(plan), existing_updates: [] };
  assert.equal(verifyTicketUpdatePreconditions(args).status, 'ready');
  assert.equal(verifyTicketUpdatePreconditions({ ...args, authorization: null }).status, 'blocked');
  assert.equal(verifyTicketUpdatePreconditions({ ...args, plan: { ...plan, payload: { ...plan.payload, body: 'Changed after approval' } } }).status, 'blocked');
  assert.equal(verifyTicketUpdatePreconditions({ ...args, latest_snapshot: createTicketSnapshot(intake({ revision: 'etag-2' })).snapshot }).status, 'blocked');
  const staleEvidence = validation(); staleEvidence.current.config_fingerprint = `sha256:v1:${'e'.repeat(64)}`;
  assert.equal(verifyTicketUpdatePreconditions({ ...args, validation_evidence: staleEvidence }).status, 'blocked');
});

test('retries reuse an exact marker and payload, while manual or duplicate marker edits conflict', () => {
  const input = delivery(); const { plan } = createTicketUpdatePlan(input);
  const args = { plan, latest_snapshot: input.snapshot, validation_evidence: input.validation_evidence, authorization: authority(plan) };
  assert.equal(verifyTicketUpdatePreconditions({ ...args, existing_updates: [{ id: 'remote-1', body: plan.payload.body }] }).status, 'already-applied');
  assert.equal(verifyTicketUpdatePreconditions({ ...args, existing_updates: [{ id: 'remote-1', body: `${plan.payload.body}\nManual edit` }] }).status, 'conflict');
  assert.equal(verifyTicketUpdatePreconditions({ ...args, existing_updates: [{ id: 'remote-1', body: plan.payload.body }, { id: 'remote-2', body: plan.payload.body }] }).status, 'conflict');
});

test('readback verifies exact target/payload and receipt freshness with independent remote status', () => {
  const input = delivery(); const { plan } = createTicketUpdatePlan(input);
  const args = { plan, validation_evidence: input.validation_evidence, verified_at: now, write_result: { previous_revision: plan.source.revision, revision: 'etag-2', payload_hash: plan.payload_hash, remote_id: 'remote-1' }, readback: { identity, revision: 'etag-2', updates: [{ id: 'remote-1', body: plan.payload.body }] } };
  const result = verifyTicketUpdateReadback(args);
  assert.equal(result.verified, true);
  assert.equal(result.remote_sync_status, 'verified');
  assert.equal(result.receipt.payload_hash, plan.payload_hash);
  assert.equal(result.receipt.remote_id, 'remote-1');
  assert.equal(hash(result.files[0].bytes), result.files[0].sha256);
  assert.equal(verifyTicketUpdateReadback({ ...args, readback: { ...args.readback, updates: [] } }).verified, false);
  assert.equal(verifyTicketUpdateReadback({ ...args, readback: { ...args.readback, identity: { ...identity, id: '43' } } }).verified, false);
  const staleEvidence = validation(); staleEvidence.current.associated_HEAD_or_diff = 'diff:changed';
  const stale = verifyTicketUpdateReadback({ ...args, validation_evidence: staleEvidence });
  assert.equal(stale.verified, false);
  assert.equal(stale.implementation_status, 'FAIL');
  assert.equal(stale.remote_sync_status, 'verified');
  assert.equal(stale.receipt, null);
});

test('portable snapshot and asset bundles persist immutably in a temporary target and classify narrowly', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ticket-intake-contract-'));
  try {
    const first = createTicketSnapshot(intake({ attachments: [imageAttachment()] }));
    const next = createTicketSnapshot(intake({ revision: 'etag-2', description: 'Revised requirement', attachments: [imageAttachment()] }));
    const written = new Map();
    for (const file of [...first.files, ...next.files]) {
      const classification = classifyTicketArtifactPath(file.path);
      assert.equal(classification.artifact_kind, file.artifact_kind);
      assert.equal(classification.commit_policy, 'with-change');
      const absolute = join(root, file.path);
      if (written.has(file.path)) { assert.deepEqual(written.get(file.path), file.bytes); continue; }
      await mkdir(dirname(absolute), { recursive: true });
      await writeFile(absolute, file.bytes, { flag: 'wx' });
      written.set(file.path, file.bytes);
    }
    assert.equal(written.size, 3);
    assert.equal(hash(await readFile(join(root, first.snapshot.path))), first.snapshot.content_hash);
    assert.equal(hash(await readFile(join(root, next.snapshot.path))), next.snapshot.content_hash);
    assert.deepEqual(await readFile(join(root, first.assets[0].path)), png);
    for (const path of ['.sdcorejs/tickets/random.json', `${first.snapshot.path}/../escape.json`]) assert.equal(classifyTicketArtifactPath(path).ok, false);
    for (const path of [`/${first.snapshot.path}`, first.snapshot.path.replaceAll('/', '\\')]) assert.equal(classifyTicketArtifactPath(path), null);
  } finally { await rm(root, { recursive: true, force: true }); }
});
