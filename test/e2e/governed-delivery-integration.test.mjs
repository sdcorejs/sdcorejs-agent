import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import test from 'node:test';
import { classifyArtifact, buildArtifactClosure } from '../../_refs/shared/artifact-lifecycle.mjs';
import { assembleProjectContext } from '../../_refs/shared/project-context.mjs';
import { resolveExploreWriteAuthority } from '../../_refs/shared/explore-contract.mjs';
import { createTicketSnapshot, createTicketUpdatePlan, verifyTicketUpdateReadback, ticketIdentity } from '../../_refs/product/ticket-intake.mjs';
import { intake, delivery, validation, imageAttachment, identity as fixtureIdentity, now } from './fixtures/ticket-intake-inputs.mjs';
import { buildAggregateUserGuide } from '../../_refs/shared/documentation-layout.mjs';
import { planDocumentationUpdate } from '../../_refs/documentation/documentation-profile.mjs';
import { approveDecisionCoverage } from '../../_refs/shared/decision-coverage.mjs';

const identity = 'a'.repeat(64);
const digest = 'b'.repeat(64);
const ticketPath = `.sdcorejs/tickets/${identity}/snapshots/${digest}.json`;
const blueprintPath = '.sdcorejs/blueprints/application.json';
async function repo(t) {
  const root = await mkdtemp(join(tmpdir(), 'governed-delivery-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q'], { cwd: root });
  return root;
}
async function write(root, path, content) {
  await mkdir(dirname(join(root, path)), { recursive: true });
  await writeFile(join(root, path), typeof content === 'string' || content instanceof Uint8Array ? content : JSON.stringify(content));
}
function snapshotBundle(attachments = []) {
  return createTicketSnapshot({
    identity: { provider: 'github', instance: 'https://github.com', repository: 'example/checkout', id: '7' },
    revision: 'remote-1', updated_at: '2026-11-14T08:00:00Z', captured_at: '2026-11-14T08:01:00Z',
    owner_repository_id: 'github.com/example/checkout', change_ref: 'CHECKOUT-7',
    url: 'https://github.com/example/checkout/issues/7', title: 'Checkout', description: 'Submit an order.',
    comments: [], acceptance_criteria: [], requirements: [], attachments_complete: true, attachments,
  });
}

test('project initialization authorizes blueprint only for the owning writer', () => {
  const action = 'project-blueprint-write-approved';
  assert.equal(resolveExploreWriteAuthority({ action }).write_allowed, false);
  assert.equal(resolveExploreWriteAuthority({ action, approved_initialization: true }).write_allowed, true);
  assert.equal(resolveExploreWriteAuthority({ action, integration_owner_assigned: true }).write_allowed, false);
  assert.equal(resolveExploreWriteAuthority({ action, explicit_authority: true, worker_role: 'parallel-worker' }).write_allowed, false);
  assert.equal(resolveExploreWriteAuthority({ action: 'project-blueprint-read', explicit_authority: true }).write_allowed, false);
});

test('blueprint requires canonical identity and explicit shared ownership', () => {
  const metadata = { artifact_kind: 'project-blueprint', owner: 'sdcorejs-explore' };
  assert.equal(classifyArtifact({ path: blueprintPath, metadata }).bucket, 'conditional');
  assert.equal(classifyArtifact({ path: blueprintPath, metadata, owner: metadata.owner }).bucket, 'shared_owned');
  assert.equal(classifyArtifact({ path: '.sdcorejs/blueprints/../escape.json', metadata, owner: metadata.owner }).bucket, 'unknown');
  assert.equal(classifyArtifact({ path: '.sdcorejs/specs/forged.md', metadata, owner: metadata.owner }).bucket, 'unknown');
});

test('ticket snapshots require canonical paths, matching kind and change relationship', () => {
  const metadata = { artifact_kind: 'ticket-snapshot', change_ref: 'CHECKOUT-7' };
  assert.equal(classifyArtifact({ path: ticketPath, metadata, changeRef: 'CHECKOUT-7' }).bucket, 'required_with_change');
  assert.equal(classifyArtifact({ path: ticketPath, metadata, changeRef: 'OTHER-2' }).bucket, 'unrelated');
  assert.equal(classifyArtifact({ path: ticketPath, metadata: { ...metadata, artifact_kind: 'spec' }, changeRef: 'CHECKOUT-7' }).bucket, 'unknown');
  assert.equal(classifyArtifact({ path: '.sdcorejs/tickets/invalid.json', metadata, changeRef: 'CHECKOUT-7' }).bucket, 'unknown');
});

test('JSON durable metadata participates in closure and forged binary promotion fails', async (t) => {
  const root = await repo(t);
  const bundle = snapshotBundle();
  for (const file of bundle.files) await write(root, file.path, file.bytes);
  const assetPath = `.sdcorejs/tickets/${identity}/assets/reference/${digest}.png`;
  await write(root, assetPath, 'unreviewed-image-bytes');
  const result = await buildArtifactClosure({ root, changeRef: 'CHECKOUT-7', artifactContext: {
    required_with_change: [{ path: assetPath, kind: 'ticket-asset', privacy_reviewed: true }],
  } });
  assert.ok(result.sdcorejs_artifacts.required_paths.includes(bundle.snapshot.path));
  assert.ok(result.sdcorejs_artifacts.unknown_paths.includes(assetPath));
});

test('closure includes actual reviewed image bytes and rejects snapshot or image tampering', async (t) => {
  const root = await repo(t);
  const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const bundle = snapshotBundle([{ id: 'screen', filename: 'screen.png', media_type: 'image/png', role: 'reference', bytes,
    privacy_review: { status: 'approved', reviewed_by: 'fixture-reviewer', sha256 } }]);
  for (const file of bundle.files) await write(root, file.path, file.bytes);
  let result = await buildArtifactClosure({ root, changeRef: 'CHECKOUT-7' });
  assert.ok(result.sdcorejs_artifacts.required_paths.includes(bundle.assets[0].path));
  await write(root, bundle.assets[0].path, Buffer.concat([bytes, Buffer.from('changed')]));
  result = await buildArtifactClosure({ root, changeRef: 'CHECKOUT-7' });
  assert.ok(result.sdcorejs_artifacts.unknown_paths.includes(bundle.assets[0].path));
  await write(root, bundle.snapshot.path, `${bundle.files[0].bytes.toString()} `);
  result = await buildArtifactClosure({ root, changeRef: 'CHECKOUT-7' });
  assert.ok(result.sdcorejs_artifacts.unknown_paths.includes(bundle.snapshot.path));
});

test('closure binds a delivery receipt to its exact stored source and rejects another ticket directory', async (t) => {
  const root = await repo(t);
  const source = createTicketSnapshot(intake());
  const { plan } = createTicketUpdatePlan(delivery({ snapshot: source.snapshot, latest_snapshot: source.snapshot }));
  const result = verifyTicketUpdateReadback({ plan, validation_evidence: validation(), verified_at: now,
    write_result: { previous_revision: 'etag-1', revision: 'etag-2', payload_hash: plan.payload_hash, remote_id: 'comment-99' },
    readback: { identity: fixtureIdentity, revision: 'etag-2', updates: [{ id: 'comment-99', body: plan.payload.body }] },
  });
  assert.equal(result.verified, true);
  const receipt = result.files[0];
  await write(root, receipt.path, receipt.bytes);
  let closure = (await buildArtifactClosure({ root, changeRef: 'totals' })).sdcorejs_artifacts;
  assert.ok(closure.unknown_paths.includes(receipt.path), 'a delivery record cannot omit its repo-local source');
  for (const file of source.files) await write(root, file.path, file.bytes);
  closure = (await buildArtifactClosure({ root, changeRef: 'totals' })).sdcorejs_artifacts;
  assert.ok(closure.required_paths.includes(receipt.path));
  const other = ticketIdentity({ ...fixtureIdentity, id: '999' });
  const moved = `${other.directory}/delivery/${receipt.sha256}.json`;
  await write(root, moved, receipt.bytes);
  closure = (await buildArtifactClosure({ root, changeRef: 'totals' })).sdcorejs_artifacts;
  assert.ok(closure.unknown_paths.includes(moved));
});

test('snapshot closure requires actual asset bytes, including committed source dependencies of a new plan', async (t) => {
  const root = await repo(t);
  const bundle = createTicketSnapshot(intake({ attachments: [imageAttachment()] }));
  await write(root, bundle.files[0].path, bundle.files[0].bytes);
  let result = (await buildArtifactClosure({ root, changeRef: 'totals' })).sdcorejs_artifacts;
  assert.notEqual(result.closure_result, 'complete');
  assert.ok(result.missing_required_paths.includes(bundle.assets[0].path));
  await write(root, bundle.assets[0].path, bundle.assets[0].bytes);
  result = (await buildArtifactClosure({ root, changeRef: 'totals' })).sdcorejs_artifacts;
  assert.equal(result.closure_result, 'complete');
  assert.ok(result.required_paths.includes(bundle.assets[0].path));
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', 'commit', '-qm', 'source fixture'], { cwd: root });
  const plan = createTicketUpdatePlan(delivery({ snapshot: bundle.snapshot, latest_snapshot: bundle.snapshot })).files[0];
  await write(root, plan.path, plan.bytes);
  result = (await buildArtifactClosure({ root, changeRef: 'totals' })).sdcorejs_artifacts;
  assert.ok(result.required_paths.includes(bundle.assets[0].path));
  assert.ok(result.required_paths.includes(bundle.snapshot.path));
  await rm(join(root, bundle.assets[0].path));
  result = (await buildArtifactClosure({ root, changeRef: 'totals' })).sdcorejs_artifacts;
  assert.notEqual(result.closure_result, 'complete');
  assert.ok(result.missing_required_paths.includes(bundle.assets[0].path));
});

test('push closure rejects ignored local-only asset bytes behind a committed snapshot', async (t) => {
  const root = await repo(t);
  const bundle = createTicketSnapshot(intake({ attachments: [imageAttachment()] }));
  for (const file of bundle.files) await write(root, file.path, file.bytes);
  await write(root, '.gitignore', `${bundle.assets[0].path}\n`);
  execFileSync('git', ['add', '.gitignore', bundle.snapshot.path], { cwd: root });
  execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', 'commit', '-qm', 'missing asset in history'], { cwd: root });
  const result = (await buildArtifactClosure({ root, changeRef: 'totals', mode: 'push',
    artifactContext: { required_with_change: [bundle.snapshot.path] } })).sdcorejs_artifacts;
  assert.equal(result.push_allowed, false);
  assert.ok(result.uncommitted_included_paths.includes(bundle.assets[0].path));
  const ignoredRoot = await repo(t);
  for (const file of bundle.files) await write(ignoredRoot, file.path, file.bytes);
  await write(ignoredRoot, '.gitignore', '.sdcorejs/tickets/\n');
  execFileSync('git', ['add', '.gitignore'], { cwd: ignoredRoot });
  execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', 'commit', '-qm', 'ignore fixture'], { cwd: ignoredRoot });
  const ignored = (await buildArtifactClosure({ root: ignoredRoot, changeRef: 'totals', mode: 'push',
    artifactContext: { required_with_change: [bundle.snapshot.path] } })).sdcorejs_artifacts;
  assert.equal(ignored.push_allowed, false);
  assert.ok(ignored.uncommitted_included_paths.includes(bundle.snapshot.path));
});

test('required ticket dependencies cannot be excluded from commit or push closure', async (t) => {
  const root = await repo(t);
  const bundle = createTicketSnapshot(intake({ attachments: [imageAttachment()] }));
  const plan = createTicketUpdatePlan(delivery({ snapshot: bundle.snapshot, latest_snapshot: bundle.snapshot })).files[0];
  for (const file of bundle.files) await write(root, file.path, file.bytes);
  await write(root, plan.path, plan.bytes);
  await write(root, '.gitignore', `${bundle.assets[0].path}\n`);
  execFileSync('git', ['add', '.gitignore', bundle.snapshot.path, plan.path], { cwd: root });
  execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', 'commit', '-qm', 'excluded dependency fixture'], { cwd: root });

  for (const mode of ['commit', 'push']) {
    for (const bucket of ['local_only', 'unrelated_observed']) {
      for (const [required, excluded] of [
        [bundle.snapshot.path, bundle.assets[0].path],
        [plan.path, bundle.snapshot.path],
      ]) {
        const result = (await buildArtifactClosure({ root, changeRef: 'totals', mode,
          artifactContext: { required_with_change: [required], [bucket]: [excluded] },
        })).sdcorejs_artifacts;
        assert.notEqual(result.closure_result, 'complete', `${mode}/${bucket}: a required dependency must stay in closure`);
        assert.equal(result.push_allowed, mode === 'push' ? false : null);
        assert.ok(!result.included_paths.includes(excluded), 'private/excluded bytes must not be promoted');
        assert.ok((bucket === 'local_only' ? result.local_only_paths : result.excluded_unrelated_paths).includes(excluded));
      }
    }
  }

  execFileSync('git', ['add', '-f', bundle.assets[0].path], { cwd: root });
  execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', 'commit', '-qm', 'include reviewed asset'], { cwd: root });
  const complete = (await buildArtifactClosure({ root, changeRef: 'totals', mode: 'push',
    artifactContext: { required_with_change: [plan.path] },
  })).sdcorejs_artifacts;
  assert.equal(complete.push_allowed, true, 'committed, reviewed dependencies remain deliverable');
  assert.ok(complete.included_paths.includes(bundle.assets[0].path));
  assert.ok(complete.included_paths.includes(bundle.snapshot.path));
});

test('ticket dependency traversal follows case-insensitive change relationships', async (t) => {
  for (const [storedRef, changeRef] of [['CHECKOUT-7', 'CHECKOUT-7'], ['CHECKOUT-7', 'checkout-7'], ['checkout-7', 'CHECKOUT-7']]) {
    const root = await repo(t);
    const bundle = createTicketSnapshot(intake({ change_ref: storedRef, attachments: [imageAttachment()] }));
    const validationEvidence = validation();
    validationEvidence.test_evidence.change_ref = storedRef;
    validationEvidence.decision_coverage = approveDecisionCoverage(validationEvidence.decision_coverage, {
      change_ref: storedRef, owner_repository_id: bundle.snapshot.owner_repository_id,
    });
    const prepared = createTicketUpdatePlan(delivery({ snapshot: bundle.snapshot, latest_snapshot: bundle.snapshot, validation_evidence: validationEvidence }));
    assert.ok(prepared.files?.length, JSON.stringify(prepared.blockers));
    const plan = prepared.files[0];
    for (const file of [...bundle.files, plan]) await write(root, file.path, file.bytes);
    const asset = bundle.assets[0].path;
    await write(root, '.gitignore', `${asset}\n`);
    execFileSync('git', ['add', '.gitignore', bundle.snapshot.path, plan.path], { cwd: root });
    execFileSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', 'commit', '-qm', 'case relationship fixture'], { cwd: root });
    for (const required of [bundle.snapshot.path, plan.path]) {
      const uncommitted = (await buildArtifactClosure({ root, changeRef, mode: 'push',
        artifactContext: { required_with_change: [required] },
      })).sdcorejs_artifacts;
      assert.equal(uncommitted.push_allowed, false, `${storedRef}/${changeRef}: ignored dependencies cannot disappear`);
      assert.ok(uncommitted.uncommitted_included_paths.includes(asset));
      const excluded = (await buildArtifactClosure({ root, changeRef, mode: 'push',
        artifactContext: { required_with_change: [required], local_only: [asset] },
      })).sdcorejs_artifacts;
      assert.equal(excluded.push_allowed, false);
      assert.ok(!excluded.included_paths.includes(asset));
    }
    await rm(join(root, asset));
    const missing = (await buildArtifactClosure({ root, changeRef, mode: 'push',
      artifactContext: { required_with_change: [plan.path] },
    })).sdcorejs_artifacts;
    assert.equal(missing.push_allowed, false);
    assert.ok(missing.missing_required_paths.includes(asset));
  }
});

test('conflicting runtime buckets block closure and preserve explicit exclusions', async (t) => {
  const root = await repo(t);
  const bundle = createTicketSnapshot(intake({ attachments: [imageAttachment()] }));
  for (const file of bundle.files) await write(root, file.path, file.bytes);
  for (const mode of ['commit', 'push']) {
    for (const bucket of ['local_only', 'unrelated_observed']) {
      const asset = bundle.assets[0].path;
      const result = (await buildArtifactClosure({ root, changeRef: 'totals', mode,
        artifactContext: { required_with_change: [bundle.snapshot.path, asset], [bucket]: [asset] },
      })).sdcorejs_artifacts;
      assert.notEqual(result.closure_result, 'complete');
      assert.ok(!result.included_paths.includes(asset), 'inclusion must never override an explicit exclusion');
      assert.ok((bucket === 'local_only' ? result.local_only_paths : result.excluded_unrelated_paths).includes(asset));
    }
  }
});

test('equivalent runtime path aliases preserve exclusions before conflict detection', async (t) => {
  const root = await repo(t);
  const bundle = createTicketSnapshot(intake({ attachments: [imageAttachment()] }));
  for (const file of bundle.files) await write(root, file.path, file.bytes);
  const asset = bundle.assets[0].path;
  const aliases = [asset, `./${asset}`, asset.replaceAll('/', '\\'),
    asset.replace('.sdcorejs/', '.sdcorejs/./'), asset.replace('.sdcorejs/', '.sdcorejs//')];
  for (const mode of ['commit', 'push']) for (const bucket of ['local_only', 'unrelated_observed']) {
    for (const alias of aliases) {
      const result = (await buildArtifactClosure({ root, changeRef: 'totals', mode,
        artifactContext: { required_with_change: [bundle.snapshot.path, asset], [bucket]: [alias] },
      })).sdcorejs_artifacts;
      assert.notEqual(result.closure_result, 'complete');
      assert.ok(!result.included_paths.includes(asset), `${mode}/${bucket}/${alias}: exclusion cannot be lost`);
      assert.ok(result.conflicting_context_paths.includes(asset));
    }
  }
});

test('aggregate consumes guide bodies without duplicate managed ownership markers', () => {
  const guide = (name) => `# ${name}\n\n<!-- sdcorejs:managed:guide-body:start -->\n## Steps\nRead the item.\n<!-- sdcorejs:managed:guide-body:end -->\n`;
  const result = buildAggregateUserGuide({ files: {
    '.sdcorejs/documentation/user-guides/orders/orders.md': guide('Orders'),
    '.sdcorejs/documentation/user-guides/payments/payments.md': guide('Payments'),
  }, gitHead: 'a'.repeat(40) });
  assert.equal(result.ok, true);
  assert.equal(result.output.includes('sdcorejs:managed'), false);
  assert.notEqual(planDocumentationUpdate({ existing: null, generated: result.output }).status, 'blocked');
  const malformed = buildAggregateUserGuide({ files: {
    '.sdcorejs/documentation/user-guides/orders/orders.md': '<!-- sdcorejs:managed:guide-body:start -->\nMissing end',
  } });
  assert.equal(malformed.ok, false);
  assert.ok(malformed.errors.some(({ code }) => code === 'INVALID_MANAGED_MARKERS'));
});

test('aggregate does not turn unresolved requirement authority into zero successful coverage', () => {
  for (const coverage of ['coverage: { status: gap, total: null, met: null, partial: null, missing: null }',
    'coverage:\n  status: conflict\n  total: null\n  met: null\n  partial: null\n  missing: null']) {
    const result = buildAggregateUserGuide({ files: {
      '.sdcorejs/documentation/user-guides/orders/orders.md': `---\n${coverage}\n---\n# Orders\nCurrent guide.\n`,
    } });
    assert.equal(result.ok, true);
    assert.equal(result.coverage.total, null);
    assert.ok(result.warnings.some(({ code }) => code === 'UNRESOLVED_COVERAGE_AUTHORITY'));
    assert.match(result.output, /coverage: \{ status: (?:gap|conflict), total: null/u);
  }
});

test('aggregate requires explicit selected coverage and retains selected status for valid counts', () => {
  const build = coverage => buildAggregateUserGuide({ files: {
    '.sdcorejs/documentation/user-guides/orders/orders.md': `---\ncoverage: ${coverage}\n---\n# Orders\nObserved guide.\n`,
  } });
  for (const coverage of ['{ total: 3, met: 3, partial: 0, missing: 0 }',
    '{ status: selected, total: null, met: null, partial: null, missing: null }',
    '{ status: selected, total: 2, met: 3, partial: 0, missing: 0 }']) {
    const result = build(coverage);
    assert.equal(result.ok, true, 'unassessed legacy guides remain readable');
    assert.equal(result.coverage.status, 'gap');
    assert.equal(result.coverage.total, null);
    assert.ok(result.warnings.some(({ code }) => code === 'UNRESOLVED_COVERAGE_AUTHORITY'));
  }
  const selected = build('{ status: selected, total: 3, met: 2, partial: 0, missing: 1 }');
  assert.deepEqual(selected.coverage, { status: 'selected', total: 3, met: 2, partial: 0, missing: 1 });
});

test('Explore discovers scoped JSON source snapshots and blueprints without loading unrelated tickets', async (t) => {
  const root = await repo(t);
  await write(root, ticketPath, { artifact_kind: 'ticket-snapshot', change_ref: 'CHECKOUT-7' });
  const otherPath = ticketPath.replace(identity, 'c'.repeat(64));
  await write(root, otherPath, { artifact_kind: 'ticket-snapshot', change_ref: 'OTHER-2' });
  await write(root, blueprintPath, { artifact_kind: 'project-blueprint', scope: 'project' });
  const context = (await assembleProjectContext({ root, changeRef: 'CHECKOUT-7' })).project_context;
  assert.deepEqual(context.related_artifacts.tickets, [ticketPath]);
  assert.deepEqual(context.related_artifacts.blueprints, [blueprintPath]);
  assert.equal(context.writes_allowed, false);
});

test('Explore retrieves earlier prevention lessons by current scope without accepting them as rules', async (t) => {
  const root = await repo(t);
  const lessonPath = `.sdcorejs/memories/workflow/lesson-${digest}.json`;
  await write(root, lessonPath, { artifact_kind: 'memory', change_ref: 'OLD-1', applicability: { keywords: ['checkout'], paths: ['src/checkout.mjs'] } });
  await write(root, '.sdcorejs/memories/workflow/unrelated.json', { applicability: { keywords: ['reports'] } });
  await write(root, '.sdcorejs/memories/workflow/malformed.json', { applicability: { keywords: 7, paths: {} } });
  const context = (await assembleProjectContext({ root, changeRef: 'CHECKOUT-7', requestScope: 'checkout permissions' })).project_context;
  assert.deepEqual(context.related_artifacts.memories, [lessonPath]);
  assert.equal(context.memory_policy.authority, 'advisory');
  assert.equal(context.memory_policy.current_source_precedence, true);
});
