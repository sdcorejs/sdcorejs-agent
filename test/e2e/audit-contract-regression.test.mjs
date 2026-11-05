// Regression candidates assert the corrected contracts and intentionally fail
// against the captured pre-fix source. No provider or Git mutations occur.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const REPO = fileURLToPath(new URL('../../', import.meta.url));
const WORK = tmpdir();
const fromRepo = (relative) => import(pathToFileURL(path.join(REPO, relative)).href);
const approval = await fromRepo('_refs/shared/approved-artifact.mjs');
const parallel = await fromRepo('_refs/orchestration/parallel-protocol.mjs');
const { evaluateDebugArtifact } = await fromRepo('_refs/shared/debug-contract.mjs');
const { resolveExploreWriteAuthority } = await fromRepo('_refs/shared/explore-contract.mjs');
const { assembleProjectContext } = await fromRepo('_refs/shared/project-context.mjs');

const revision = 'a'.repeat(40);
const fingerprint = 'b'.repeat(64);
const owner = 'github.com/acme/orders';
const parentHash = `sha256:v1:${'c'.repeat(64)}`;

// Read the published source itself; fill every scalar while retaining the
// actual nested structure. This detects producer/consumer composition defects.
async function publishedArtifact(kind, { withAlias = true, delegated = false } = {}) {
  const source = await readFile(path.join(REPO, kind === 'spec'
    ? 'skills/shared/sdlc/02-spec.md' : '_refs/sdlc/plan-approval-artifact.md'), 'utf8');
  const template = [...source.matchAll(/```yaml\n---\n([\s\S]*?)\n---\n```/gu)]
    .map((match) => match[1]).find((block) => block.includes(`artifact_kind: ${kind}\n`));
  assert.ok(template, `published ${kind} frontmatter exists`);
  if (delegated) assert.match(template, /^approval_source:.*delegated-session-scope/m);
  let sequenceField;
  const values = {
    artifact_id: `${kind}-audit-r1`, artifact_kind: kind, schema_version: 1,
    change_ref: 'audit-contract', source_spec: kind === 'spec' ? 'none' : '.sdcorejs/specs/nestjs/orders.md',
    source_plan: 'none', source_architecture: 'none', commit_policy: 'with-change', owner: `sdcorejs-${kind}`,
    name: 'orders-fix', description: 'Bounded order correction', contract_id: 'audit-contract', requirement_id: 'REQ-1',
    owner_repository_id: owner, owner_repository_role: 'standalone', owner_module_id: null,
    repository_relative_path: `.sdcorejs/${kind}s/nestjs/orders.md`, source_revision: revision,
    parent_repository_id: null, approved_at: '2026-11-05T00:00:00.000Z', approved_by: null,
    approval_source: delegated ? 'delegated-session-scope' : 'explicit-user-choice',
    instruction_reference: delegated ? 'session/request/implement-orders' : null,
    document_review_performed: !delegated, track: 'nestjs', target_root_kind: 'target-project',
    stack_profile: 'plain-nestjs', profile_confidence: 'high', sourceDraftPath: '.sdcorejs/docs/nestjs/orders-spec.md',
    approval_hash: parentHash, approved_spec_hash: parentHash, approved_plan_hash: parentHash,
    acceptance_criteria_count: 1, manual_criteria_count: 0, redaction_applied: true,
    supersedes: null, revision: 1, change_reason: null, sourceSpecPath: '.sdcorejs/specs/nestjs/orders.md',
    approved_architecture_reference: null, execution_host_repository_id: owner,
    integration_owner_repository_id: owner, gitlink_updates_in_scope: false,
    task_count: 1, phase_count: 1, approved_architecture_hash: null,
    required: false, approval_required: false, package_manager: 'npm',
  };
  const scalar = (value) => JSON.stringify(value);
  const concrete = template.split('\n').map((line) => {
    const match = line.match(/^(\s*)(- )?([A-Za-z_][A-Za-z0-9_]*):(?: (.*))?$/u);
    if (match) {
      const [, indent, dash = '', key, raw] = match;
      if (raw === undefined) { sequenceField = key; return line; }
      let value;
      if (key === 'repository_id') value = owner;
      else if (key === 'revision' && indent.length >= 4) value = revision;
      else if (key === 'artifact_id' && indent.length >= 2) value = 'spec-parent-r1';
      else if (key === 'artifact_kind' && indent.length >= 2) value = 'spec';
      else if (key === 'repository_relative_path' && indent.length >= 2) value = '.sdcorejs/specs/nestjs/orders.md';
      else { assert.ok(Object.hasOwn(values, key), `populate published key ${key}`); value = values[key]; }
      return `${indent}${dash}${key}: ${scalar(value)}`;
    }
    if (/^\s+- </u.test(line)) {
      const value = { dependency_order: 'orders-fix', allowed_paths: 'src/orders/**',
        prohibited_paths: 'src/orders/generated/**', commands_planned: 'node --test' }[sequenceField];
      assert.ok(value, `populate published sequence ${sequenceField}`);
      return line.replace(/<.*>/u, scalar(value));
    }
    return line;
  }).join('\n');
  const metadata = approval.parseApprovedFrontmatter(concrete);
  const alias = kind === 'spec' ? 'approved_spec_hash' : 'approved_plan_hash';
  delete metadata.approval_hash;
  delete metadata[alias];
  const artifact = approval.createApprovedArtifact({ metadata, body: `# Approved ${kind}\n\nBounded orders correction.\n` });
  if (withAlias) artifact.metadata[alias] = artifact.metadata.approval_hash;
  return artifact;
}

// Only serialize the supported YAML subset; the production parser consumes it.
function yaml(value, indent = 0) {
  const prefix = ' '.repeat(indent);
  if (Array.isArray(value)) return value.map((entry) => entry && typeof entry === 'object'
    ? `${prefix}-\n${yaml(entry, indent + 2)}` : `${prefix}- ${JSON.stringify(entry)}`).join('\n');
  return Object.entries(value).map(([key, entry]) => {
    if (entry && typeof entry === 'object' && Object.keys(entry).length > 0)
      return `${prefix}${key}:\n${yaml(entry, indent + 2)}`;
    return `${prefix}${key}: ${JSON.stringify(entry)}`;
  }).join('\n');
}

for (const kind of ['spec', 'plan']) {
  test(`skill-creator review ${kind}: delegated provenance survives the literal template and remains tamper-sensitive`, async () => {
    const artifact = await publishedArtifact(kind, { delegated: true });
    const serialized = `---\n${yaml(artifact.metadata)}\n---\n${artifact.body}`;
    const [, frontmatter, body] = serialized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/u);
    const consumed = { metadata: approval.parseApprovedFrontmatter(frontmatter), body };
    assert.equal(approval.verifyApprovedArtifact(consumed).valid, true);
    assert.equal(consumed.metadata.approval_source, 'delegated-session-scope');
    assert.equal(consumed.metadata.instruction_reference, 'session/request/implement-orders');
    assert.equal(consumed.metadata.document_review_performed, false);
    for (const field of ['instruction_reference', 'document_review_performed', 'approval_source']) {
      const corrupted = structuredClone(consumed);
      corrupted.metadata[field] = field === 'document_review_performed' ? true : 'invented';
      assert.throws(() => approval.verifyApprovedArtifact(corrupted), /hash mismatch/u);
    }
  });
  test(`F-001 ${kind}: literal published metadata survives hash, serialization, parse and verify`, async () => {
    const artifact = await publishedArtifact(kind);
    const serialized = `---\n${yaml(artifact.metadata)}\n---\n${artifact.body}`;
    const [, frontmatter, body] = serialized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/u);
    assert.equal(approval.verifyApprovedArtifact({ metadata: approval.parseApprovedFrontmatter(frontmatter), body }).valid, true);
  });
  test(`F-001 ${kind}: alias-free control validates and protected body/owner/parent hashes reject tampering`, async () => {
    const artifact = await publishedArtifact(kind, { withAlias: false });
    assert.equal(approval.verifyApprovedArtifact(artifact).valid, true);
    for (const mutate of [
      (copy) => { copy.body += 'Tamper.\n'; },
      (copy) => { copy.metadata.owner_repository_id = 'github.com/acme/other'; },
      (copy) => { copy.metadata.parent_references[0].approval_hash = `sha256:v1:${'d'.repeat(64)}`; },
      ...(kind === 'plan' ? [(copy) => { copy.metadata.approved_spec_hash = `sha256:v1:${'d'.repeat(64)}`; }] : []),
    ]) {
      const copy = structuredClone(artifact); mutate(copy);
      assert.throws(() => approval.verifyApprovedArtifact(copy), /hash mismatch/u);
    }
  });
  test(`F-001 ${kind}: mismatched compatibility self alias rejects`, async () => {
    const artifact = await publishedArtifact(kind);
    artifact.metadata[kind === 'spec' ? 'approved_spec_hash' : 'approved_plan_hash'] = `sha256:v1:${'d'.repeat(64)}`;
    assert.throws(() => approval.verifyApprovedArtifact(artifact));
  });
}

function readOnlyContext() {
  const contract = { source: 'read-only-request', request_hash: 'request-hash', scope_hash: 'scope-hash', write_policy: 'deny' };
  const runtime_capabilities = { runtime: 'synthetic-test', supports_subagents: true,
    supports_parallel_dispatch: true, supports_agent_cwd: false, supports_native_worktree: false,
    supports_result_ref: true, supports_timeout: true, supports_cancellation: true, effective_max_concurrency: 2 };
  return {
    schema_version: 2, contract, runtime_capabilities, execution_policy: 'parallel-preferred',
    units: ['audit-a', 'audit-b'].map((id) => ({
      id, depends_on: [], estimated_cost: 5,
      dispatch_envelope: {
        schema_version: 1, source: contract.source, request_hash: contract.request_hash, scope_hash: contract.scope_hash,
        repository_id: owner, repository_role: 'standalone', module_id: null,
        git_root: REPO, source_revision: revision, allowed_paths: [], prohibited_paths: [],
        authority: 'read-only', git_mutations: 'deny', approved_artifact_mutation: 'deny',
        required_validations: ['read-only-boundary'],
        output_evidence_contract: { result_type: 'report', required_fields: ['repository_id', 'source_revision', 'findings'] },
      },
      workspace: { strategy: 'shared-readonly', path: REPO, base_head: revision },
      ownership: { allowed_paths: [], prohibited_paths: [] },
      result: { type: 'report', ref: null, changed_paths: [] },
    })),
  };
}

test('F-002 control: actual read-only contract and dispatch validation pass, topology permits fan-out without per-agent cwd', () => {
  const context = readOnlyContext();
  assert.deepEqual(parallel.validateContract(context.contract), []);
  assert.deepEqual(parallel.validateDispatchContext(context), []);
  const topology = parallel.classifyTopology({ contract: context.contract, units: context.units, runtimeCapabilities: context.runtime_capabilities });
  assert.equal(topology.kind, 'READ_ONLY_FANOUT');
  assert.equal(topology.verdict, 'PARALLEL-CANDIDATE');
});

test('F-002 read-only compiler output passes dispatch validation with no invented plan identity or writable paths', () => {
  const context = readOnlyContext();
  const compiled = parallel.compileParallelContext({ read_only_context: context, runtime_capabilities: context.runtime_capabilities });
  assert.deepEqual(parallel.validateDispatchContext(compiled.parallel_context), []);
  assert.deepEqual(compiled.parallel_context.contract, context.contract);
  assert.equal(compiled.opportunity_report.topology, 'READ_ONLY_FANOUT');
  assert.equal(compiled.opportunity_report.selected_mode, 'parallel');
  assert.deepEqual(compiled.opportunity_report.waves, [['audit-a', 'audit-b']]);
  for (const unit of compiled.parallel_context.units) {
    assert.deepEqual(unit.ownership.allowed_paths, []);
    assert.equal(unit.result.type, 'report');
    assert.equal(unit.dispatch_envelope.git_mutations, 'deny');
    assert.equal(unit.dispatch_envelope.approved_artifact_mutation, 'deny');
  }
});

test('F-002 negative controls: read-only writes, identity confusion, Git and artifact mutations remain denied', () => {
  for (const mutate of [
    (context) => { context.contract.contract_id = 'invented-plan'; },
    (context) => { context.units[0].ownership.allowed_paths = ['src/**']; },
    (context) => { context.units[0].dispatch_envelope.request_hash = 'other-request'; },
    (context) => { context.units[0].dispatch_envelope.scope_hash = 'other-scope'; },
    (context) => { context.units[0].dispatch_envelope.git_mutations = 'allow'; },
    (context) => { context.units[0].dispatch_envelope.approved_artifact_mutation = 'allow'; },
    (context) => { context.units[0].result.type = 'patch'; },
  ]) {
    const context = readOnlyContext(); mutate(context);
    assert.ok(parallel.validateDispatchContext(context).length > 0);
  }
  for (const operation of ['write', 'git-stage', 'git-commit', 'git-push', 'mutate-approved-artifact']) {
    assert.ok(parallel.validateWorkerAuthority(readOnlyContext().units[0], {
      operation, current_repository_id: owner, current_git_root: REPO, repository_relative_path: 'src/orders/service.ts',
    }).length > 0);
  }
});

function debugArtifact(overrides = {}) {
  return {
    schema_version: 1, subject_track: 'nestjs', intent: 'fix', debug_mode: 'failing-test',
    owner_repository_id: owner, owner_module_id: 'orders', execution_host_repository_id: 'github.com/acme/portal',
    failing_implementation: { repository_id: owner, path: 'src/orders/order.service.ts', source_revision: revision },
    source_fingerprint: fingerprint, source_revision_map: { [owner]: revision }, environment_fingerprint: 'd'.repeat(64),
    test_evidence: { repository_id: owner, source_revision: revision, source_fingerprint: fingerprint, status: 'current', result: 'PASSED' },
    approved_plan_step: { step_id: 'orders-fix', approval_hash: 'c'.repeat(64), owner_repository_id: owner, allowed_paths: ['src/orders'] },
    hypotheses: [{ id: 'H1', status: 'root', verified: true }], ...overrides,
  };
}

// This object is a trusted runtime projection of already-established session
// evidence. Arbitrary caller JSON cannot itself grant user authorization.
function directAuthorization(overrides = {}) {
  return { source: 'explicit-user-request', request_id: 'REQ-FIX-001', owner_repository_id: owner,
    source_revision: revision, source_fingerprint: fingerprint, allowed_paths: ['src/orders'], bounded_low_risk: true, ...overrides };
}

test('F-003 first authorized flaky repair attempt does not need post-fix passes', () => {
  const result = evaluateDebugArtifact(debugArtifact({ debug_mode: 'flaky', retry_evidence: {
    attempts: 4, passes: 3, failures: 1, consecutive_post_fix_passes: 0,
  } }), { phase: 'attempt' });
  assert.equal(result.status, 'ready', result.blockers.join('; '));
  assert.equal(result.write_authorized, true);
});

test('F-003 completion requires three consecutive post-fix passes and defaults do not change diagnose-only', () => {
  for (const count of [0, 1, 2, 3]) {
    const result = evaluateDebugArtifact(debugArtifact({ debug_mode: 'flaky', retry_evidence: {
      attempts: 4, passes: 3, failures: 1, consecutive_post_fix_passes: count,
    } }), { phase: 'completion' });
    assert.equal(result.status, count >= 3 ? 'ready' : 'blocked');
  }
  const result = evaluateDebugArtifact(debugArtifact({ intent: 'diagnose-only', approved_plan_step: null }));
  assert.equal(result.status, 'ready'); assert.equal(result.write_authorized, false);
});

test('F-003 bounded direct authorization supports a fix without inventing an approved plan', () => {
  const result = evaluateDebugArtifact(debugArtifact({ approved_plan_step: null, direct_authorization: directAuthorization() }), { phase: 'attempt' });
  assert.equal(result.status, 'ready', result.blockers.join('; '));
  assert.equal(result.write_authorized, true);
});

test('F-003 negative controls: absent, stale, wrong-owner, unbounded and out-of-scope direct authority are rejected', () => {
  for (const authority of [undefined, {},
    directAuthorization({ source: 'inferred-from-repository-role' }), directAuthorization({ request_id: '' }),
    directAuthorization({ owner_repository_id: 'github.com/acme/portal' }),
    directAuthorization({ source_revision: 'e'.repeat(40) }), directAuthorization({ source_fingerprint: 'e'.repeat(64) }),
    directAuthorization({ bounded_low_risk: false }), directAuthorization({ allowed_paths: ['src/billing'] }),
    directAuthorization({ allowed_paths: ['src/orders/../../'] }),
  ]) {
    assert.equal(evaluateDebugArtifact(debugArtifact({ approved_plan_step: null, direct_authorization: authority }), { phase: 'attempt' }).write_authorized, false);
  }
});

test('F-003 negative controls: valid plan does not bypass stale evidence, wrong owner, traversal or unverified root', () => {
  for (const overrides of [
    { test_evidence: { repository_id: owner, source_revision: 'e'.repeat(40), source_fingerprint: fingerprint, status: 'current' } },
    { failing_implementation: { repository_id: 'github.com/acme/portal', path: 'src/orders/order.service.ts', source_revision: revision } },
    { failing_implementation: { repository_id: owner, path: 'src/orders/../../outside.ts', source_revision: revision } },
    { hypotheses: [{ id: 'H1', status: 'root', verified: false }] },
  ]) assert.equal(evaluateDebugArtifact(debugArtifact(overrides), { phase: 'attempt' }).write_authorized, false);
});

for (const action of ['env-setup-write-approved', 'persona-write-approved', 'memories-write-approved']) {
  test(`F-004 ${action}: integration ownership or initialization alone cannot grant authority`, () => {
    for (const flags of [{ integration_owner_assigned: true }, { approved_initialization: true }]) {
      assert.equal(resolveExploreWriteAuthority({ action, explicit_authority: false, ...flags }).write_allowed, false);
    }
  });
  test(`F-004 ${action}: exact action authorization works only for allowed roles`, () => {
    for (const worker_role of ['sequential-owner', 'integration-owner', 'fan-in-owner'])
      assert.equal(resolveExploreWriteAuthority({ action, explicit_authority: true, worker_role }).write_allowed, true);
    for (const worker_role of ['parallel-worker', 'unknown-role'])
      assert.equal(resolveExploreWriteAuthority({ action, explicit_authority: true, worker_role }).write_allowed, false);
  });
}

test('F-004 summary initialization and convention policy remain usable without authorizing other actions', () => {
  assert.equal(resolveExploreWriteAuthority({ action: 'summary-refresh', approved_initialization: true }).write_allowed, true);
  assert.equal(resolveExploreWriteAuthority({ action: 'conventions-sync-write-approved', convention_capture_mode: 'after-review' }).write_allowed, true);
  assert.equal(resolveExploreWriteAuthority({ action: 'conventions-sync-write-approved', convention_capture_mode: 'after-review', worker_role: 'parallel-worker' }).write_allowed, false);
  for (const action of ['env-setup-write-approved', 'persona-write-approved', 'memories-write-approved', 'unknown-action', 'summary-read'])
    assert.equal(resolveExploreWriteAuthority({ action, convention_capture_mode: 'after-review' }).write_allowed, false);
});

async function memoryFixture(run) {
  await mkdir(WORK, { recursive: true });
  const root = await mkdtemp(path.join(WORK, 'memory-fixture-'));
  const write = async (relative, content) => { await mkdir(path.dirname(path.join(root, relative)), { recursive: true }); await writeFile(path.join(root, relative), content); };
  try {
    await write('package.json', '{"name":"audit-memory-fixture","type":"module"}\n');
    await write('src/orders.ts', 'export const retryLimit = 2;\n');
    const memory = (id, change, sourceRevision, body) => `---\nartifact_id: ${id}\nartifact_kind: memory\nchange_ref: ${change}\nsource_revision: ${sourceRevision}\nowner_repository_id: ${owner}\n---\n${body}\n`;
    await write('.sdcorejs/memories/nestjs/related.md', memory('orders-memory', 'ORDERS-42', revision, 'Prior investigation context.'));
    await write('.sdcorejs/memories/nestjs/stale.md', memory('orders-stale', 'ORDERS-42', 'e'.repeat(40), 'Historical retryLimit = 99; conflicts with current source.'));
    await write('.sdcorejs/memories/nestjs/unrelated-newest.md', memory('billing-memory', 'BILLING-99', revision, 'Unrelated billing information.'));
    await write('.sdcorejs/docs/nestjs/related.md', memory('orders-doc', 'ORDERS-42', revision, 'Related existing documentation.'));
    await run(root);
  } finally { await rm(root, { recursive: true, force: true }); }
}

test('F-012 related memories are selectively discoverable as advisory; explicit current source remains evidence', async () => {
  await memoryFixture(async (root) => {
    const { project_context: context } = await assembleProjectContext({ root, requestScope: 'orders retry', changeRef: 'ORDERS-42', explicitFiles: ['src/orders.ts'], writesAllowed: false });
    assert.deepEqual(context.related_artifacts.docs, ['.sdcorejs/docs/nestjs/related.md']);
    assert.deepEqual(context.related_artifacts.memories?.sort(), ['.sdcorejs/memories/nestjs/related.md', '.sdcorejs/memories/nestjs/stale.md']);
    assert.equal(context.memory_policy.authority, 'advisory');
    assert.equal(context.memory_policy.current_source_precedence, true);
    assert.deepEqual(context.current_evidence.files, ['src/orders.ts']);
    assert.equal(context.writes_allowed, false);
    assert.equal(JSON.stringify(context).includes('Historical retryLimit = 99'), false, 'memory bodies are not silently promoted to current truth');
  });
});

test('F-012 no relevant relationship or request does not select all memories by recency', async () => {
  await memoryFixture(async (root) => {
    for (const options of [{ requestScope: 'billing', changeRef: 'UNRELATED-0' }, { requestScope: '' }]) {
      const { project_context: context } = await assembleProjectContext({ root, ...options });
      assert.deepEqual(context.related_artifacts.memories, []);
    }
  });
});

test('review regression: malformed retry counts and missing post-fix pass never prove completion',()=>{
 for(const count of ['unknown',{},'3',-1,2.5]) {
  const result=evaluateDebugArtifact(debugArtifact({debug_mode:'flaky',retry_evidence:{consecutive_post_fix_passes:count}}),{phase:'completion'});
  assert.equal(result.completion_verified,false);
 }
 const result=evaluateDebugArtifact(debugArtifact({test_evidence:{repository_id:owner,source_revision:revision,source_fingerprint:fingerprint,status:'current',result:'FAILED'}}),{phase:'completion'});
 assert.equal(result.completion_verified,false);
});

test('review regression: direct fix completion preserves authorized baseline and binds post-fix evidence',()=>{
 const original=debugArtifact({approved_plan_step:null,direct_authorization:directAuthorization()});
 const attempt=evaluateDebugArtifact(original,{phase:'attempt'});
 const post='f'.repeat(64);
 const completed={...original,attempt_context:attempt.attempt_context,post_fix_changed_paths:['src/orders/order.service.ts'],source_fingerprint:post,test_evidence:{...original.test_evidence,source_fingerprint:post,result:'PASSED'}};
 assert.equal(evaluateDebugArtifact(completed,{phase:'completion'}).completion_verified,true);
 for(const patch of [{attempt_context:null},{post_fix_changed_paths:['src/billing/a.ts']},{direct_authorization:directAuthorization({source_fingerprint:post})}]) assert.equal(evaluateDebugArtifact({...completed,...patch},{phase:'completion'}).completion_verified,false);
 for(const plan of [false,0,'',[]]) assert.equal(evaluateDebugArtifact({...original,approved_plan_step:plan}).write_authorized,false);
});
