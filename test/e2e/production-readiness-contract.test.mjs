import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { documentedFinish, finishFixture } from './support/interaction-finish-fixture.mjs';
import { simplifyFixture, documentedSimplifyContext } from './support/simplify-contract-fixture.mjs';

test('case-interaction-finish-simplify-grant: pure resolution preserves the single owner preflight grant', async t => {
  const { completeExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const { resolveFinish } = await import('../../_refs/shared/finish-gate.mjs');
  const { createSimplifyEvidenceSession } = await import('../../_refs/simplify/repository-evidence.mjs');
  const { evaluateSimplifyPostflight } = await import('../../_refs/simplify/simplify-contract.mjs');
  const f = await finishFixture(t, { simplify: 'apply', review: 'skip' });
  const context = documentedSimplifyContext(), hunks = [{ path: 'src/value.mjs', start_line: 1, end_line: 1 }];
  const command = { command: [process.execPath, 'oracle.mjs'], cwd: '.', scope: hunks };
  const session = createSimplifyEvidenceSession({ root: f.root,
    repository_id: f.context.identity.owner_repository_id, change_ref: f.context.identity.change_ref,
    user_scope: hunks, workflow_hunks: hunks, verification_commands: [command],
    classify_source: () => ({ kind: 'executable', hunks, protected_surfaces: [] }),
    verify_preservation: ({ before, after }) => {
      const stripComment = bytes => bytes.toString().replace(/ \/\/ changed/u, '');
      const unchanged = stripComment(before['src/value.mjs']) === stripComment(after['src/value.mjs']);
      return Object.fromEntries(Object.keys(context.preserved_surfaces).map(key => [key, {
        status: unchanged ? 'verified' : 'blocked', reason: 'Exact non-comment bytes and executed constant-value oracle.',
      }]));
    },
  });
  context.session_id = session.id; context.target_root = f.root;
  context.source_revision = f.plan.metadata.source_revision;
  context.artifact_identity.owner_repository_id = f.context.identity.owner_repository_id;
  context.artifact_identity.execution_host_repository_id = f.context.identity.owner_repository_id;
  context.artifact_context.change_ref = f.context.identity.change_ref;
  context.scope.requested = ['src/value.mjs']; context.scope.eligible_files = ['src/value.mjs']; context.scope.eligible_hunks = hunks;
  context.baseline.snapshot = session.captureSnapshot(); context.verification.before = [session.runVerification(command)];
  f.context.simplify_context = context; f.runtime.simplify_runtime = { session }; f.run('baseline');
  for (let i = 0; i < 2; i++) {
    const next = resolveFinish(f.context, f.runtime).next_actions[0];
    assert.equal(next.preflight_required, true); assert.equal(next.source_write_allowed, false);
  }
  assert.equal(session.ledger().length, 0, 'read-only resolution cannot consume pass authority');
  const authorized = completeExecution({ finish_context: f.context }, f.runtime);
  assert.equal(authorized.status, 'pending-action', JSON.stringify(authorized));
  const next = authorized.next_actions[0];
  assert.equal(next.source_write_allowed, true); assert.equal(next.preflight_required, false); assert.ok(next.preflight_ref);
  session.applyEdits(next.preflight_ref, [{ path: 'src/value.mjs', content: 'export const value = 1;\n' }]);
  const post = { ...structuredClone(context), phase: 'postflight', preflight_ref: next.preflight_ref, passes: session.ledger() };
  post.verification.after = [session.runVerification(command)];
  const verified = evaluateSimplifyPostflight(post, { session }); assert.equal(verified.status, 'verified');
  f.context.simplify_context = verified.context; f.run('simplify');
  assert.equal(completeExecution({ finish_context: f.context }, f.runtime).next_actions[0].phase, 'reverify');
});

test('case-interaction-finish-simplify-owner: a valid foreign preflight cannot authorize this finish write', async t => {
  const { completeExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const f = await finishFixture(t, { simplify: 'apply' }), foreign = await simplifyFixture(t);
  f.run('baseline'); f.context.simplify_context = foreign.context; f.runtime.simplify_runtime = foreign.runtime;
  const result = completeExecution({ finish_context: f.context }, f.runtime);
  assert.equal(result.status, 'blocked'); assert.match(result.blockers.join(' '), /simplify.*finish.*owner|simplify.*scope/u);
  assert.equal(foreign.preflight().write_authorized, true, 'the foreign authority remains valid for its own owner');
});

test('case-interaction-finish-repair-recursion: completed repair never reopens simplify', async t => {
  const { completeExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const f = await finishFixture(t, { simplify: 'apply', review: 'review-and-repair' });
  for (const phase of ['baseline','review','repair']) f.run(phase);
  const result = completeExecution({ finish_context: f.context }, f.runtime);
  assert.equal(result.next_actions[0].phase, 'verify');
  f.choose('review', 'review-only');
  assert.equal(completeExecution({ finish_context: f.context }, f.runtime).status, 'blocked');
});

test('case-interaction-finish-assessment-binding: changing the loaded assessment invalidates review proof', async t => {
  const { completeExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const f = await finishFixture(t); f.run('baseline'); f.run('review');
  f.assessment.blocking_findings.push('new-finding');
  const out = completeExecution({ finish_context: f.context }, f.runtime);
  assert.equal(out.status, 'pending-action'); assert.equal(out.next_actions[0].phase, 'review');
});

test('case-interaction-finish-command-scope: final proof must cover the complete authorized scope', async t => {
  const f = await finishFixture(t, { commands: { verify: { command: [process.execPath, 'oracle.mjs'], cwd: '.', scope: ['oracle.mjs'] } } });
  assert.throws(() => f.run('verify'), /complete finish scope/u);
});

test('case-interaction-finish-required-phase: unknown required checks cannot silently disappear', async t => {
  await assert.rejects(() => finishFixture(t, { policy: { required_phases: ['unknown-required-check'] } }), /required phase/u);
});

test('case-interaction-finish-hook-boundary: unrelated empty directories are writes too', async t => {
  const f = await finishFixture(t, { policy: { hooks: [{ id: 'docs', owner: 'sdcorejs-documentation', paths: ['guide.md'] }] } });
  const { mkdirSync } = await import('node:fs');
  const before = f.observation.snapshot(); mkdirSync(path.join(f.root, 'unapproved'));
  assert.throws(() => f.observation.recordHook('docs', before.fingerprint), /outside authorized/u);
});

test('case-interaction-finish-tdd-order: observed RED precedes production; final writes stale prior evidence', async t => {
  const { completeExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const f = await finishFixture(t, { review: 'skip', policy: { test_strategy: 'tdd', hooks: [
    { id: 'implementation', owner: 'executor', paths: ['src/value.mjs'] },
    { id: 'docs', owner: 'sdcorejs-documentation', paths: ['guide.md'], inputs: ['src/value.mjs'] },
  ] } });
  f.write('src/value.mjs', 'export const value = 2;\n'); f.run('red');
  const before = f.observation.snapshot(); f.write('src/value.mjs', 'export const value = 1;\n');
  f.context.phase_receipts.implementation = f.observation.recordHook('implementation', before.fingerprint);
  f.run('baseline'); f.run('verify'); f.run('branch-ready');
  assert.equal(completeExecution({ finish_context: f.context }, f.runtime).next_actions[0].phase, 'docs');
  const docsBefore = f.observation.snapshot(); f.write('guide.md', 'Approved guide.\n');
  f.context.phase_receipts.docs = f.observation.recordHook('docs', docsBefore.fingerprint);
  assert.equal(completeExecution({ finish_context: f.context }, f.runtime).next_actions[0].phase, 'verify');
  f.run('verify'); f.run('branch-ready');
  assert.equal(completeExecution({ finish_context: f.context }, f.runtime).branch_ready, true);
  f.write('src/value.mjs', 'export const value = 2;\n'); f.run('red');
  assert.equal(completeExecution({ finish_context: f.context }, f.runtime).status, 'blocked', 'late RED cannot retroactively justify implementation');
});

test('case-interaction-finish-canonical-callers: documented completion payload is consumed by every stack', async () => {
  const execution = await import('../../_refs/orchestration/execution-contract.mjs');
  const angular = await import('../../_refs/angular/execution-contract.mjs');
  const next = await import('../../_refs/nextjs/execution-contract.mjs');
  assert.equal(typeof execution.completeExecution, 'function');
  assert.equal(typeof angular.completeAngularExecution, 'function');
  assert.equal(typeof next.completeNextjsExecution, 'function');
  for (const complete of [execution.completeExecution, angular.completeAngularExecution, next.completeNextjsExecution]) {
    const result = complete({ finish_context: documentedFinish() });
    assert.equal(result.status, 'blocked', 'payload alone cannot fabricate verified phase evidence');
    assert.equal(result.branch_ready, false);
  }
});

test('case-interaction-finish-evidence-order: serialized ready flags and same HEAD never substitute host observation', async () => {
  const execution = await import('../../_refs/orchestration/execution-contract.mjs');
  assert.equal(typeof execution.completeExecution, 'function');
  const context = documentedFinish();
  context.status = 'tail-complete';
  context.phase_receipts = { baseline: { status: 'PASS' }, verify: { status: 'PASS' }, 'branch-ready': { status: 'PASS' } };
  const result = execution.completeExecution({ finish_context: context });
  assert.equal(result.status, 'blocked');
  assert.equal(result.branch_ready, false);
});

test('case-interaction-finish-resolved-small-fix: all actual completion callers share one tail without repeated prompts', async t => {
  const { completeExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const { completeAngularExecution } = await import('../../_refs/angular/execution-contract.mjs');
  const { completeNextjsExecution } = await import('../../_refs/nextjs/execution-contract.mjs');
  const f = await finishFixture(t, { direct: true }), dispatched = [];
  for (const phase of ['baseline','review','verify','branch-ready']) {
    for (const complete of [completeExecution,completeAngularExecution,completeNextjsExecution]) {
      const out = complete({ finish_context: f.context }, f.runtime);
      assert.equal(out.status, 'pending-action', JSON.stringify({ phase, caller: complete.name, blockers: out.blockers })); assert.equal(out.next_actions[0].phase, phase);
    }
    dispatched.push(phase); f.run(phase);
  }
  assert.equal(completeExecution({ finish_context: f.context }, f.runtime).status, 'tail-complete');
  assert.equal(completeExecution({ finish_context: f.context }, f.runtime).next_actions.length, 0);
  assert.deepEqual(dispatched, ['baseline','review','verify','branch-ready']);
});

test('case-interaction-finish-defer: no baseline, repair, docs or final gate runs after defer', async t => {
  const { completeExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const f = await finishFixture(t, { review: 'defer' });
  assert.equal(completeExecution({ finish_context: f.context }, f.runtime).status, 'deferred');
  assert.deepEqual(f.context.phase_receipts, {});
});

test('case-interaction-finish-review-only: blocking findings never dispatch repair', async t => {
  const { completeExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const f = await finishFixture(t); f.assessment.blocking_findings = ['finding-1']; f.run('baseline'); f.run('review');
  const out = completeExecution({ finish_context: f.context }, f.runtime);
  assert.equal(out.status, 'blocked'); assert.deepEqual(out.next_actions, []);
  f.choose('review', 'review-and-repair');
  const repair = completeExecution({ finish_context: f.context }, f.runtime);
  assert.equal(repair.next_actions[0].phase, 'repair');
  assert.match(repair.next_actions[0].authority, /tier\/scope/u);
});

test('case-interaction-finish-integration-owner: delegated workers stop after unit verification/review', async t => {
  const { completeExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const f = await finishFixture(t, { worker: true, policy: { decisions: {} } });
  for (const phase of ['baseline','unit-review-a','unit-review-b']) f.run(phase);
  const out = completeExecution({ finish_context: f.context }, f.runtime);
  assert.equal(out.status, 'unit-complete'); assert.equal(out.branch_ready, false); assert.deepEqual(out.next_actions, []);
});

test('case-interaction-finish-skip-review: optional skip continues verification; required review remains a gate', async t => {
  const { completeExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const f = await finishFixture(t, { review: 'skip', policy: { required_phases: ['review'] } }); f.run('baseline');
  assert.equal(completeExecution({ finish_context: f.context }, f.runtime).status, 'blocked');
});

test('case-interaction-finish-evidence-order: same-HEAD edits after branch-ready invalidate affected proof', async t => {
  const { completeExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const f = await finishFixture(t); for (const phase of ['baseline','review','verify','branch-ready']) f.run(phase);
  assert.equal(completeExecution({ finish_context: f.context }, f.runtime).branch_ready, true);
  f.write('src/value.mjs', 'export const value = 1; // changed again\n');
  const out = completeExecution({ finish_context: f.context }, f.runtime);
  assert.equal(out.branch_ready, false); assert.equal(out.next_actions[0].phase, 'reverify');
});

test('case-interaction-finish-simplify-semantics: no-op omits the choice; Analyze and Apply have separate authority', async t => {
  const { completeExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const noOp = await finishFixture(t, { classify_source: () => ({ kind: 'protected' }), policy: { decisions: { review: 'skip' } } });
  noOp.context.choices.simplify = undefined; noOp.run('baseline');
  assert.equal(completeExecution({ finish_context: noOp.context }, noOp.runtime).next_actions[0].phase, 'verify');
  const f = await finishFixture(t, { simplify: 'analyze' }); f.run('baseline');
  const analyze = completeExecution({ finish_context: f.context }, f.runtime);
  assert.equal(analyze.next_actions[0].phase, 'simplify'); assert.equal(analyze.next_actions[0].source_write_allowed, false);
  f.choose('simplify', 'apply');
  assert.equal(completeExecution({ finish_context: f.context }, f.runtime).status, 'blocked', 'no hardened preflight proof');
});
import { designExecutionFixture, designFixture } from './support/design-handoff-fixture.mjs';

test('case-design-real-consumer-enforcement: generic execution cannot omit or substitute Design approval', async t => {
  const { prepareExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const f = designFixture(t), args = await designExecutionFixture(f);
  assert.equal(prepareExecution(args).design_verification.verified, true);
  assert.throws(() => prepareExecution({ ...args, design_runtime: undefined }), /Design handoff blocked/u);
  assert.throws(() => prepareExecution({ ...args, design_handoff: undefined }), /Design handoff blocked/u);
  const g = designFixture(t);
  const foreignRuntime = await g.runtime();
  assert.throws(() => prepareExecution({ ...args, design_runtime: foreignRuntime }), /Design handoff blocked/u);
  f.put(f.handoff.metadata.repository_relative_path, f.read(f.handoff.metadata.repository_relative_path) + '\nmutated');
  assert.throws(() => prepareExecution(args), /Design handoff blocked/u);
});

test('Design producer preflight does not depend on its future postflight handoff', async t => {
  const { prepareExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const f = designFixture(t);
  const plan = f.artifacts.get('plan');
  f.approve('plan', plan.metadata.repository_relative_path, plan.body, plan.metadata.parent_references, { track: 'design', stack_profile: 'design', allowed_paths: ['src/**'], prohibited_paths: [] });
  const args = await designExecutionFixture(f);
  const result = prepareExecution({ ...args, design_runtime: undefined, design_handoff: undefined });
  assert.equal(result.valid, true); assert.equal(result.design_verification.status, 'NOT RUN');
});
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repoRoot, relativePath), 'utf8'));
}

async function importRepoModule(relativePath) {
  return import(pathToFileURL(path.join(repoRoot, relativePath)).href);
}

function baseArtifact(overrides = {}) {
  return {
    schema_version: 1,
    artifact_id: 'plan-contract-a-r1',
    artifact_kind: 'plan',
    contract_id: 'contract-a',
    requirement_id: 'requirement-a',
    change_ref: 'change-a',
    track: 'ai-agent',
    stack_profile: 'ai-agent',
    owner_repository_id: 'github.com/sdcorejs/module-a',
    owner_repository_role: 'module',
    owner_module_id: 'module-a',
    repository_relative_path: '.sdcorejs/plans/ai-agent/contract-a.md',
    source_revision: 'a'.repeat(40),
    parent_repository_id: 'github.com/sdcorejs/portal',
    parent_references: [
      {
        repository_id: 'github.com/sdcorejs/portal',
        artifact_id: 'spec-contract-a-r1',
        artifact_kind: 'spec',
        revision: 'b'.repeat(40),
        approval_hash: `sha256:v1:${'c'.repeat(64)}`,
      },
    ],
    supersedes: null,
    approval_source: 'explicit-user-choice',
    approved_at: '2026-07-31T12:00:00.000Z',
    approved_by: null,
    ...overrides,
  };
}

test('central registry is the versioned source of truth for tracks, profiles, repositories, and evidence', async () => {
  const registry = await readJson('_refs/shared/system-registry.json');
  assert.equal(registry.schema_version, 1);
  assert.deepEqual(
    registry.tracks.map(({ id }) => id).sort(),
    [
      'ai-agent',
      'angular',
      'design',
      'documentation',
      'fullstack',
      'general',
      'nestjs',
      'nextjs',
      'node',
      'product',
      'react',
      'test',
      'workflow',
    ],
  );
  assert.equal(registry.aliases.generic, 'general');
  assert.ok(registry.stack_profiles.some(({ id }) => id === 'technical-prototype'));
  for (const profile of ['node-esm', 'markdown-skill-pack', 'astro-site']) {
    assert.ok(
      registry.stack_profiles.some(({ id }) => id === profile),
      `central registry contains the repository profile ${profile}`,
    );
  }
  assert.ok(registry.artifact_kinds.includes('spec'));
  assert.ok(registry.artifact_kinds.includes('plan'));
  assert.ok(registry.repository_roles.includes('portal'));
  assert.ok(registry.repository_roles.includes('module'));
  assert.deepEqual(
    registry.evidence_classes,
    ['UNIT', 'GOLDEN', 'CONTAINER', 'FULL_E2E', 'LIVE_AGENT', 'SUPPLEMENTAL_SMOKE'],
  );
  for (const track of registry.tracks) {
    assert.equal(typeof track.executor, 'string');
    assert.equal(typeof track.review_profile, 'string');
    assert.equal(typeof track.repair_supported, 'boolean');
    assert.equal(typeof track.ship_supported, 'boolean');
  }
});

test('entrypoint routing and adapter manifests consume the central registry without stale enums', async () => {
  const registry = await readJson('_refs/shared/system-registry.json');
  const { resolveTrack, validateSystemRegistry } = await importRepoModule(
    '_refs/shared/system-registry.mjs',
  );
  assert.deepEqual(validateSystemRegistry(registry), []);
  assert.equal(resolveTrack('generic').id, 'general');
  assert.equal(resolveTrack('unknown-stack').executor, 'sdcorejs-execute-plan');

  const usingSkills = await readFile(
    path.join(repoRoot, 'skills/orchestration/using-skills.md'),
    'utf8',
  );
  assert.match(usingSkills, /_refs\/shared\/system-registry\.json/u);
  assert.match(usingSkills, /artifact owner/iu);
  assert.match(usingSkills, /execution host/iu);
  assert.match(usingSkills, /Never infer artifact ownership from the current working directory/iu);

  const sourceSkills = [];
  for (const relativePath of [
    'skills/orchestration/using-skills.md',
    'skills/shared/sdlc/01-brainstorming.md',
    'skills/shared/sdlc/02-spec.md',
    'skills/shared/sdlc/03-plan.md',
    'skills/shared/sdlc/architecture.md',
    'skills/shared/sdlc/04-execute-plan.md',
    'skills/orchestration/parallel-dispatch.md',
    'skills/orchestration/subagent-driven-development.md',
    'skills/shared/workflow/explore.md',
    'skills/orchestration/documentation.md',
    'skills/tracks/product/sdcorejs-product.md',
    'skills/tracks/design/sdcorejs-design.md',
    'skills/tracks/ai-agent/sdcorejs-ai-agent.md',
    'skills/tracks/angular/sdcorejs-angular.md',
    'skills/tracks/nestjs/sdcorejs-nestjs.md',
    'skills/tracks/nextjs/sdcorejs-nextjs.md',
    'skills/tracks/test/sdcorejs-test.md',
    'skills/shared/workflow/debug.md',
    'skills/orchestration/repair-loop.md',
    'skills/shared/workflow/review.md',
    'skills/shared/workflow/simplify.md',
    'skills/shared/workflow/git.md',
    'skills/shared/workflow/ship.md',
  ]) {
    const text = await readFile(path.join(repoRoot, relativePath), 'utf8');
    const name = text.match(/^name:\s*(\S+)/mu)?.[1];
    assert.ok(name, `${relativePath} has a skill name`);
    sourceSkills.push(name);
  }
  assert.equal(new Set(sourceSkills).size, 23);

  const expectedRegistryHash = `sha256:${registry.registry_hash_input ?? ''}`;
  for (const relativePath of [
    '.claude/sdcorejs-harness.json',
    'plugin/sdcorejs-harness.json',
    'codex/sdcorejs-harness.json',
    '.cursor/sdcorejs-harness.json',
    '.github/sdcorejs-harness.json',
  ]) {
    const manifest = await readJson(relativePath);
    assert.equal(manifest.system_registry.source_path, '_refs/shared/system-registry.json');
    assert.match(manifest.system_registry.source_hash, /^sha256:[a-f0-9]{64}$/u);
    assert.notEqual(manifest.system_registry.source_hash, expectedRegistryHash);
    assert.deepEqual(manifest.system_registry.tracks, registry.tracks.map(({ id }) => id));
    assert.deepEqual(manifest.system_registry.aliases, registry.aliases);
  }
});

test('approved artifacts create and verify deterministic protected hashes', async () => {
  const {
    APPROVAL_ALGORITHM,
    createApprovedArtifact,
    verifyApprovedArtifact,
  } = await importRepoModule('_refs/shared/approved-artifact.mjs');
  const first = createApprovedArtifact({
    metadata: baseArtifact(),
    body: '# Approved plan\r\n\r\nExecute module A.\r\n',
  });
  const second = createApprovedArtifact({
    metadata: Object.fromEntries(Object.entries(baseArtifact()).reverse()),
    body: '# Approved plan\n\nExecute module A.\n',
  });
  assert.equal(APPROVAL_ALGORITHM, 'sha256:v1');
  assert.equal(first.metadata.approval_hash, second.metadata.approval_hash);
  assert.equal(verifyApprovedArtifact(first).valid, true);
});

test('approved artifact verification rejects every protected identity mutation', async () => {
  const { createApprovedArtifact, verifyApprovedArtifact } = await importRepoModule(
    '_refs/shared/approved-artifact.mjs',
  );
  const artifact = createApprovedArtifact({ metadata: baseArtifact(), body: 'Approved body.\n' });
  const mutations = [
    ['body', 'Mutated body.\n'],
    ['artifact_id', 'plan-contract-a-r2'],
    ['contract_id', 'contract-b'],
    ['requirement_id', 'requirement-b'],
    ['track', 'nestjs'],
    ['owner_repository_id', 'github.com/sdcorejs/module-b'],
    ['repository_relative_path', '.sdcorejs/plans/ai-agent/other.md'],
    ['source_revision', 'e'.repeat(40)],
    ['supersedes', 'plan-contract-a-r0'],
    ['approved_at', '2026-07-31T12:01:00.000Z'],
    ['approved_by', 'different-approver'],
    [
      'parent_references',
      artifact.metadata.parent_references.map((reference) => ({
        ...reference,
        revision: 'd'.repeat(40),
      })),
    ],
  ];
  for (const [field, value] of mutations) {
    const candidate = structuredClone(artifact);
    if (field === 'body') candidate.body = value;
    else candidate.metadata[field] = value;
    assert.throws(
      () => verifyApprovedArtifact(candidate),
      /approval hash mismatch/iu,
      `${field} mutation should fail`,
    );
  }
});

test('approved artifact CLI creates and verifies specs and fails non-zero after mutation', async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'sdcorejs-approved-artifact-'));
  const inputPath = path.join(tempRoot, 'input.json');
  const artifactPath = path.join(tempRoot, 'approved.json');
  const input = {
    metadata: baseArtifact({
      artifact_id: 'spec-contract-a-r1',
      artifact_kind: 'spec',
      repository_relative_path: '.sdcorejs/specs/ai-agent/contract-a.md',
    }),
    body: '# Approved spec\n\nObservable behavior.\n',
  };
  await writeFile(inputPath, `${JSON.stringify(input)}\n`, 'utf8');
  const helperPath = path.join(repoRoot, '_refs/shared/approved-artifact.mjs');
  const created = spawnSync(
    process.execPath,
    [helperPath, 'create', '--input', inputPath, '--output', artifactPath],
    { encoding: 'utf8' },
  );
  assert.equal(created.status, 0, created.stderr);
  const verified = spawnSync(
    process.execPath,
    [helperPath, 'verify', '--input', artifactPath],
    { encoding: 'utf8' },
  );
  assert.equal(verified.status, 0, verified.stderr);
  assert.match(verified.stdout, /"valid":true/u);

  const artifact = JSON.parse(await readFile(artifactPath, 'utf8'));
  artifact.body = `${artifact.body}\nmutated`;
  await writeFile(artifactPath, `${JSON.stringify(artifact)}\n`, 'utf8');
  const rejected = spawnSync(
    process.execPath,
    [helperPath, 'verify', '--input', artifactPath],
    { encoding: 'utf8' },
  );
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /approval hash mismatch/iu);
});

test('spec gate uses the executable approval helper and semantic owner repository', async () => {
  const [registry, spec] = await Promise.all([
    readJson('_refs/shared/system-registry.json'),
    readFile(path.join(repoRoot, 'skills/shared/sdlc/02-spec.md'), 'utf8'),
  ]);
  const { createApprovedArtifact, verifyApprovedArtifact } = await importRepoModule(
    '_refs/shared/approved-artifact.mjs',
  );
  for (const { id: track } of registry.tracks) {
    const artifact = createApprovedArtifact({
      metadata: baseArtifact({
        artifact_id: `spec-${track}-r1`,
        artifact_kind: 'spec',
        track,
        stack_profile: 'general',
        repository_relative_path: `.sdcorejs/specs/${track}/contract-a.md`,
      }),
      body: `# ${track} approved spec\n`,
    });
    assert.equal(verifyApprovedArtifact(artifact).valid, true, `${track} spec verifies`);
  }
  for (const field of [
    'artifact_id',
    'artifact_kind',
    'schema_version',
    'contract_id',
    'requirement_id',
    'change_ref',
    'track',
    'stack_profile',
    'owner_repository_id',
    'owner_repository_role',
    'owner_module_id',
    'repository_relative_path',
    'source_revision',
    'supersedes',
    'approval_source',
    'approved_at',
    'approved_by',
    'approval_hash',
  ]) {
    assert.match(spec, new RegExp(`\\b${field}\\b`, 'u'), `approved spec carries ${field}`);
  }
  assert.match(spec, /_refs\/shared\/approved-artifact\.mjs/u);
  assert.match(spec, /semantic owner repository/iu);
  assert.match(spec, /authoring repo.*explicit/isu);
  assert.match(spec, /Silence is not approval/iu);
  assert.match(spec, /supersedes/iu);
  assert.match(spec, /portal index.*durable\s+reference/isu);
  assert.match(spec, /Do not\s+write.*module spec.*portal|Copy a full module spec.*portal/isu);
  assert.doesNotMatch(spec, /never in the `sdcorejs-agent` repo/iu);
});

test('approved plans verify their exact approved-spec parent and every registry track', async () => {
  const registry = await readJson('_refs/shared/system-registry.json');
  const {
    createApprovedArtifact,
    verifyApprovedArtifactGraph,
  } = await importRepoModule('_refs/shared/approved-artifact.mjs');
  const spec = createApprovedArtifact({
    metadata: baseArtifact({
      artifact_id: 'spec-contract-a-r1',
      artifact_kind: 'spec',
      repository_relative_path: '.sdcorejs/specs/general/contract-a.md',
      source_revision: 'b'.repeat(40),
      parent_repository_id: null,
      parent_references: [],
    }),
    body: '# Approved spec\n',
  });
  for (const { id: track } of registry.tracks) {
    const plan = createApprovedArtifact({
      metadata: baseArtifact({
        artifact_id: `plan-${track}-r1`,
        artifact_kind: 'plan',
        track,
        stack_profile: 'general',
        repository_relative_path: `.sdcorejs/plans/${track}/contract-a.md`,
        parent_references: [
          {
            repository_id: spec.metadata.owner_repository_id,
            artifact_id: spec.metadata.artifact_id,
            artifact_kind: spec.metadata.artifact_kind,
            revision: spec.metadata.source_revision,
            approval_hash: spec.metadata.approval_hash,
          },
        ],
      }),
      body: `# ${track} approved plan\n`,
    });
    assert.equal(
      verifyApprovedArtifactGraph(plan, [spec]).valid,
      true,
      `${track} plan verifies against its spec`,
    );
  }
  const planWithStaleSpecHash = createApprovedArtifact({
    metadata: baseArtifact({
      parent_references: [
        {
          repository_id: spec.metadata.owner_repository_id,
          artifact_id: spec.metadata.artifact_id,
          artifact_kind: spec.metadata.artifact_kind,
          revision: spec.metadata.source_revision,
          approval_hash: `sha256:v1:${'f'.repeat(64)}`,
        },
      ],
    }),
    body: '# Plan with stale spec hash\n',
  });
  assert.throws(
    () => verifyApprovedArtifactGraph(planWithStaleSpecHash, [spec]),
    /parent reference.*hash/iu,
  );
});

test('multi-repository plan splitting rejects steps spanning Git roots', async () => {
  const {
    splitRepositoryPlan,
    validateRepositoryPlan,
  } = await importRepoModule('_refs/shared/repository-contract.mjs');
  const plan = {
    schema_version: 1,
    integration_owner_repository_id: 'github.com/sdcorejs/portal',
    gitlink_updates_in_scope: false,
    dependency_order: ['module-a', 'portal'],
    repositories: [
      {
        repository_id: 'github.com/sdcorejs/module-a',
        role: 'module',
        module_id: 'module-a',
      },
      {
        repository_id: 'github.com/sdcorejs/portal',
        role: 'portal',
        module_id: null,
      },
    ],
    steps: [
      {
        id: 'module-a-implementation',
        action: 'EDIT',
        semantic_scope: 'module',
        owner_repository_id: 'github.com/sdcorejs/module-a',
        git_roots: ['github.com/sdcorejs/module-a'],
        allowed_paths: ['src/orders/**'],
        prohibited_paths: ['.env'],
        depends_on: [],
      },
      {
        id: 'portal-composition',
        action: 'EDIT',
        semantic_scope: 'portal-composition',
        owner_repository_id: 'github.com/sdcorejs/portal',
        git_roots: ['github.com/sdcorejs/portal'],
        allowed_paths: ['src/app.routes.ts'],
        prohibited_paths: ['modules/module-a/src/**'],
        depends_on: ['module-a-implementation'],
      },
    ],
  };
  assert.deepEqual(validateRepositoryPlan(plan), []);
  const split = splitRepositoryPlan(plan);
  assert.deepEqual(
    split.repository_plans.map(({ repository_id }) => repository_id),
    ['github.com/sdcorejs/module-a', 'github.com/sdcorejs/portal'],
  );
  assert.equal(split.repository_plans[0].steps[0].id, 'module-a-implementation');
  assert.equal(split.parent_integration_plan.repository_id, 'github.com/sdcorejs/portal');

  const invalid = structuredClone(plan);
  invalid.steps[0].git_roots.push('github.com/sdcorejs/portal');
  assert.ok(validateRepositoryPlan(invalid).some((error) => /one Git root/iu.test(error)));
  assert.throws(() => splitRepositoryPlan(invalid), /one Git root/iu);
});

test('plan skill preserves shared artifact identity and repository-local boundaries', async () => {
  const [plan, approvalRef] = await Promise.all([
    readFile(path.join(repoRoot, 'skills/shared/sdlc/03-plan.md'), 'utf8'),
    readFile(path.join(repoRoot, '_refs/sdlc/plan-approval-artifact.md'), 'utf8'),
  ]);
  const combined = `${plan}\n${approvalRef}`;
  for (const field of [
    'contract_id',
    'requirement_id',
    'approved_spec_reference',
    'approved_spec_hash',
    'approved_plan_hash',
    'owner_repository_id',
    'repository_relative_path',
    'allowed_paths',
    'prohibited_paths',
    'dependency_changes',
    'env_changes',
    'migration_changes',
    'verification_strategy',
    'execution_host_repository_id',
    'integration_owner_repository_id',
    'dependency_order',
    'gitlink_updates_in_scope',
  ]) {
    assert.match(combined, new RegExp(`\\b${field}\\b`, 'u'), `plan contract carries ${field}`);
  }
  assert.match(combined, /_refs\/shared\/approved-artifact\.mjs/u);
  assert.match(combined, /_refs\/shared\/system-registry\.json/u);
  assert.match(combined, /one Git root/iu);
  assert.match(combined, /test.*before.*production code/isu);
  assert.match(combined, /module-owned plan.*portal/isu);
  assert.doesNotMatch(
    approvalRef,
    /track:\s*<angular\|nestjs\|nextjs\|test\|product\|generic>/u,
  );
});

test('execute-plan verifies artifacts, source freshness, owner root, and path scope before writes', async () => {
  const {
    authorizePlanWrite,
    evaluateWorkingTree,
    prepareExecution,
    resolveExecutionTarget,
  } = await importRepoModule('_refs/orchestration/execution-contract.mjs');
  const { createApprovedArtifact } = await importRepoModule(
    '_refs/shared/approved-artifact.mjs',
  );
  const spec = createApprovedArtifact({
    metadata: baseArtifact({
      artifact_id: 'spec-contract-a-r1',
      artifact_kind: 'spec',
      repository_relative_path: '.sdcorejs/specs/node/contract-a.md',
      source_revision: 'b'.repeat(40),
      parent_repository_id: null,
      parent_references: [],
    }),
    body: '# Approved spec\n',
  });
  const planArtifact = createApprovedArtifact({
    metadata: baseArtifact({
      artifact_id: 'plan-contract-a-r1',
      artifact_kind: 'plan',
      track: 'node',
      stack_profile: 'node-general',
      repository_relative_path: '.sdcorejs/plans/node/contract-a.md',
      source_revision: 'c'.repeat(40),
      allowed_paths: ['src/orders/**'],
      prohibited_paths: ['src/orders/generated/**', '.env'],
      parent_references: [
        {
          repository_id: spec.metadata.owner_repository_id,
          artifact_id: spec.metadata.artifact_id,
          artifact_kind: spec.metadata.artifact_kind,
          revision: spec.metadata.source_revision,
          approval_hash: spec.metadata.approval_hash,
        },
      ],
    }),
    body: '# Approved plan\n',
  });
  const repositoryPlan = {
    schema_version: 1,
    integration_owner_repository_id: 'github.com/sdcorejs/portal',
    gitlink_updates_in_scope: false,
    dependency_order: ['module-a'],
    repositories: [
      {
        repository_id: 'github.com/sdcorejs/module-a',
        role: 'module',
        module_id: 'module-a',
        available: true,
        writable: true,
      },
      {
        repository_id: 'github.com/sdcorejs/portal',
        role: 'portal',
        module_id: null,
      },
    ],
    steps: [
      {
        id: 'module-write',
        action: 'EDIT',
        semantic_scope: 'module',
        owner_repository_id: 'github.com/sdcorejs/module-a',
        git_roots: ['github.com/sdcorejs/module-a'],
        allowed_paths: ['src/orders/**'],
        prohibited_paths: ['src/orders/generated/**', '.env'],
        depends_on: [],
      },
    ],
  };
  const prepared = prepareExecution({
    approved_plan: planArtifact,
    approved_spec: spec,
    plan_context: { schema_version: 1 },
    repository_plan: repositoryPlan,
    owner_revisions: {
      [planArtifact.metadata.owner_repository_id]: planArtifact.metadata.source_revision,
    },
  });
  assert.equal(prepared.valid, true);
  assert.equal(prepared.track.id, 'node');
  assert.deepEqual(
    resolveExecutionTarget({
      step: repositoryPlan.steps[0],
      repositories: repositoryPlan.repositories,
    }),
    {
      owner_repository_id: 'github.com/sdcorejs/module-a',
      owner_repository_role: 'module',
      owner_module_id: 'module-a',
      execute_in_repository_id: 'github.com/sdcorejs/module-a',
    },
  );
  assert.throws(
    () =>
      resolveExecutionTarget({
        step: repositoryPlan.steps[0],
        repositories: repositoryPlan.repositories.map((repository) => {
          if (repository.repository_id !== 'github.com/sdcorejs/module-a') return repository;
          const withoutAvailabilityProof = { ...repository };
          delete withoutAvailabilityProof.available;
          delete withoutAvailabilityProof.writable;
          return withoutAvailabilityProof;
        }),
      }),
    /unavailable or not writable/iu,
  );
  assert.throws(
    () =>
      resolveExecutionTarget({
        step: {
          ...repositoryPlan.steps[0],
          owner_repository_id: 'github.com/sdcorejs/missing-module',
        },
        repositories: repositoryPlan.repositories,
      }),
    /missing owner repository.*portal fallback/iu,
  );
  assert.equal(
    evaluateWorkingTree({
      unrelated_dirty_paths: ['docs/unrelated.md'],
      intended_output_paths: ['src/orders/order.service.ts'],
    }).status,
    'decision-required',
  );

  assert.equal(
    authorizePlanWrite({
      step: repositoryPlan.steps[0],
      current_repository_id: 'github.com/sdcorejs/module-a',
      repository_relative_path: 'src/orders/order.service.ts',
      final_branch_ready: false,
    }).authorized,
    true,
  );
  assert.throws(
    () =>
      authorizePlanWrite({
        step: repositoryPlan.steps[0],
        current_repository_id: 'github.com/sdcorejs/portal',
        repository_relative_path: 'src/orders/order.service.ts',
        final_branch_ready: false,
      }),
    /wrong Git root/iu,
  );
  assert.throws(
    () =>
      authorizePlanWrite({
        step: repositoryPlan.steps[0],
        current_repository_id: 'github.com/sdcorejs/module-a',
        repository_relative_path: 'src/orders/generated/client.ts',
        final_branch_ready: false,
      }),
    /prohibited_paths/iu,
  );
  assert.throws(
    () =>
      authorizePlanWrite({
        step: repositoryPlan.steps[0],
        current_repository_id: 'github.com/sdcorejs/module-a',
        repository_relative_path: 'src/billing/billing.service.ts',
        final_branch_ready: false,
      }),
    /allowed_paths/iu,
  );
  assert.throws(
    () =>
      authorizePlanWrite({
        step: repositoryPlan.steps[0],
        current_repository_id: 'github.com/sdcorejs/module-a',
        repository_relative_path: 'src/orders/order.service.ts',
        final_branch_ready: true,
      }),
    /final branch-ready/iu,
  );
  assert.throws(
    () =>
      authorizePlanWrite({
        step: repositoryPlan.steps[0],
        current_repository_id: 'github.com/sdcorejs/module-a',
        repository_relative_path: 'src/orders/order.service.ts',
        final_branch_ready: false,
        review_finding_selected: false,
      }),
    /unselected review finding/iu,
  );
  assert.throws(
    () =>
      prepareExecution({
        approved_plan: planArtifact,
        approved_spec: spec,
        plan_context: { schema_version: 1 },
        repository_plan: {
          ...repositoryPlan,
          steps: [
            {
              ...repositoryPlan.steps[0],
              allowed_paths: ['**'],
              prohibited_paths: [],
            },
          ],
        },
        owner_revisions: {
          [planArtifact.metadata.owner_repository_id]: planArtifact.metadata.source_revision,
        },
      }),
    /approved plan.*scope|scope.*approved plan/iu,
  );
  assert.throws(
    () =>
      prepareExecution({
        approved_plan: planArtifact,
        approved_spec: spec,
        plan_context: { schema_version: 1 },
        repository_plan: repositoryPlan,
        owner_revisions: {
          [planArtifact.metadata.owner_repository_id]: 'd'.repeat(40),
        },
      }),
    /stale source/iu,
  );
});

test('execute-plan mode selection is deterministic and capability-aware', async () => {
  const { selectExecutionMode } = await importRepoModule(
    '_refs/orchestration/execution-contract.mjs',
  );
  assert.equal(
    selectExecutionMode({
      units: [{ id: 'one', depends_on: [] }],
      parallel_capability: 'supported',
      isolation_safe: true,
      ownership_disjoint: true,
    }).mode,
    'sequential',
  );
  assert.equal(
    selectExecutionMode({
      units: [{ id: 'a' }, { id: 'b' }],
      parallel_capability: 'unknown',
      isolation_safe: true,
      ownership_disjoint: true,
    }).mode,
    'sequential',
  );
  assert.equal(
    selectExecutionMode({
      units: [{ id: 'a' }, { id: 'b' }],
      parallel_capability: 'supported',
      isolation_safe: false,
      ownership_disjoint: true,
    }).mode,
    'sequential',
  );
  assert.equal(
    selectExecutionMode({
      units: [{ id: 'a' }, { id: 'b' }],
      parallel_capability: 'supported',
      isolation_safe: true,
      ownership_disjoint: true,
    }).mode,
    'choice-required',
  );
});

test('execute-plan skill consumes registry identity and per-repository evidence', async () => {
  const text = await readFile(
    path.join(repoRoot, 'skills/shared/sdlc/04-execute-plan.md'),
    'utf8',
  );
  assert.match(text, /_refs\/shared\/approved-artifact\.mjs/u);
  assert.match(text, /_refs\/shared\/system-registry\.json/u);
  assert.match(text, /_refs\/orchestration\/execution-contract\.mjs/u);
  assert.match(text, /current Git root/iu);
  assert.match(text, /owner_repository_id/u);
  assert.match(text, /execution_host_repository_id/u);
  assert.match(text, /integration_owner_repository_id/u);
  assert.match(text, /repository_revision_map/u);
  assert.match(text, /portal.*module repository/isu);
  assert.match(text, /review finding.*authorized write/isu);
  assert.match(text, /Do not mutate approved/iu);
  assert.match(text, /Finish gate/iu);
  assert.match(text, /current-session\.md/u);
});

test('approved artifact validation is checkout-path independent and rejects stale schemas or tracks', async () => {
  const { createApprovedArtifact } = await importRepoModule('_refs/shared/approved-artifact.mjs');
  const left = createApprovedArtifact({
    metadata: baseArtifact(),
    body: 'Approved body.\n',
    checkout_root: 'C:\\work\\portal',
  });
  const right = createApprovedArtifact({
    metadata: baseArtifact(),
    body: 'Approved body.\n',
    checkout_root: '/mnt/work/portal',
  });
  assert.equal(left.metadata.approval_hash, right.metadata.approval_hash);
  assert.throws(
    () => createApprovedArtifact({ metadata: baseArtifact({ schema_version: 99 }), body: 'x' }),
    /schema version/iu,
  );
  assert.throws(
    () => createApprovedArtifact({ metadata: baseArtifact({ track: 'unknown-track' }), body: 'x' }),
    /unknown track/iu,
  );
});

test('repository identity, ownership, and write guards never depend on cwd or absolute checkout paths', async () => {
  const {
    assertOwnerWriteTarget,
    resolveArtifactOwner,
    stableRepositoryId,
  } = await importRepoModule('_refs/shared/repository-contract.mjs');
  assert.equal(
    stableRepositoryId({ remote_url: 'git@github.com:sdcorejs/module-a.git' }),
    'github.com/sdcorejs/module-a',
  );
  assert.equal(
    stableRepositoryId({ remote_url: 'https://github.com/sdcorejs/module-a.git' }),
    'github.com/sdcorejs/module-a',
  );
  const owner = resolveArtifactOwner({
    artifact_kind: 'e2e-test',
    scope: 'module',
    module: { id: 'module-a', repository_id: 'github.com/sdcorejs/module-a' },
    portal: { repository_id: 'github.com/sdcorejs/portal' },
    execution_host_repository_id: 'github.com/sdcorejs/portal',
  });
  assert.equal(owner.owner_repository_id, 'github.com/sdcorejs/module-a');
  assert.equal(owner.execution_host_repository_id, 'github.com/sdcorejs/portal');
  assert.doesNotThrow(() =>
    assertOwnerWriteTarget({
      owner_repository_id: owner.owner_repository_id,
      current_repository_id: 'github.com/sdcorejs/module-a',
      repository_relative_path: '.sdcorejs/tests/e2e/orders.spec.ts',
    }),
  );
  assert.throws(
    () =>
      assertOwnerWriteTarget({
        owner_repository_id: owner.owner_repository_id,
        current_repository_id: 'github.com/sdcorejs/portal',
        repository_relative_path: '.sdcorejs/tests/e2e/orders.spec.ts',
      }),
    /wrong repository root/iu,
  );
});

test('brainstorming resolves module requirement ownership without portal fallback', async () => {
  const { resolveRequirementOwnership } = await importRepoModule(
    '_refs/shared/repository-contract.mjs',
  );
  const topology = {
    portal: {
      repository_id: 'github.com/sdcorejs/portal',
      role: 'portal',
      available: true,
      writable: true,
    },
    modules: [
      {
        module_id: 'module-a',
        aliases: ['orders', 'shared'],
        repository_id: 'github.com/sdcorejs/module-a',
        role: 'module',
        available: true,
        writable: true,
      },
      {
        module_id: 'module-b',
        aliases: ['billing', 'shared'],
        repository_id: 'github.com/sdcorejs/module-b',
        role: 'module',
        available: true,
        writable: true,
      },
      {
        module_id: 'module-c',
        aliases: ['catalog'],
        repository_id: 'github.com/sdcorejs/module-c',
        role: 'module',
        available: false,
        writable: false,
      },
    ],
  };
  const resolved = resolveRequirementOwnership({
    topology,
    requested_module: 'orders',
    execution_host_repository_id: 'github.com/sdcorejs/portal',
  });
  assert.equal(resolved.status, 'resolved');
  assert.equal(resolved.owner_repository_id, 'github.com/sdcorejs/module-a');
  assert.equal(resolved.owner_module_id, 'module-a');
  assert.equal(resolved.execution_host_repository_id, 'github.com/sdcorejs/portal');

  const ambiguous = resolveRequirementOwnership({
    topology,
    requested_module: 'shared',
    execution_host_repository_id: 'github.com/sdcorejs/portal',
  });
  assert.equal(ambiguous.status, 'blocked');
  assert.equal(ambiguous.write_target, null);
  assert.match(ambiguous.blockers[0], /ambiguous/iu);

  const missing = resolveRequirementOwnership({
    topology,
    requested_module: 'unknown-module',
    execution_host_repository_id: 'github.com/sdcorejs/portal',
  });
  assert.equal(missing.status, 'blocked');
  assert.equal(missing.write_target, null);
  assert.notEqual(missing.owner_repository_id, topology.portal.repository_id);

  const unavailable = resolveRequirementOwnership({
    topology,
    requested_module: 'catalog',
    execution_host_repository_id: 'github.com/sdcorejs/portal',
  });
  assert.equal(unavailable.status, 'blocked');
  assert.equal(unavailable.write_target, null);
  assert.equal(unavailable.owner_repository_id, 'github.com/sdcorejs/module-c');
});

test('brainstorming requirement_context consumes registry identity and remains read-only', async () => {
  const text = await readFile(
    path.join(repoRoot, 'skills/shared/sdlc/01-brainstorming.md'),
    'utf8',
  );
  for (const field of [
    'contract_id',
    'requirement_id',
    'track',
    'stack_profile',
    'profile_confidence',
    'profile_evidence',
    'target_root',
    'target_root_kind',
    'owner_repository_id',
    'owner_repository_role',
    'owner_module_id',
    'execution_host_repository_id',
    'assumptions',
    'non_goals',
    'risks',
    'acceptance_criteria_seed',
    'unresolved_blockers',
  ]) {
    assert.match(text, new RegExp(`\\b${field}\\b`, 'u'), `requirement_context carries ${field}`);
  }
  assert.match(text, /_refs\/shared\/system-registry\.json/u);
  assert.match(text, /missing.*module.*portal|portal.*fallback/isu);
  assert.match(text, /technical-prototype.*explicit/isu);
  assert.match(text, /admin\/auth\/account\/role\/permission.*approved/isu);
  assert.match(text, /Output dialogue only.*Do not write specs, plans, or code/isu);
});

test('module E2E discovery keeps module provenance and exact result classes', async () => {
  const {
    aggregateModuleE2E,
    validateModuleE2EManifest,
  } = await importRepoModule('_refs/shared/repository-contract.mjs');
  const moduleA = validateModuleE2EManifest({
    schema_version: 1,
    module_id: 'module-a',
    repository_id: 'github.com/sdcorejs/module-a',
    e2e: {
      availability: 'available',
      runner: 'playwright',
      command: ['npm', 'run', 'test:e2e'],
      working_directory: '.',
      config_path: 'playwright.config.ts',
      capabilities: ['portal-composed'],
      required_portal_capabilities: ['auth-bootstrap'],
      persona_refs: ['qc'],
      evidence_path: 'test-results/evidence.json',
    },
  });
  const aggregate = aggregateModuleE2E({
    portal_revision: 'a'.repeat(40),
    module_runs: [
      {
        manifest: moduleA,
        module_revision: 'b'.repeat(40),
        portal_pinned_module_revision: 'b'.repeat(40),
        result: 'PASSED',
        actual_command: ['npm', 'run', 'test:e2e'],
      },
      {
        module_id: 'module-b',
        repository_id: 'github.com/sdcorejs/module-b',
        e2e_availability: 'not-applicable',
        result: 'NOT APPLICABLE',
      },
      {
        module_id: 'module-c',
        repository_id: 'github.com/sdcorejs/module-c',
        e2e_availability: 'uninitialized',
        result: 'NOT RUN',
      },
    ],
  });
  assert.deepEqual(
    aggregate.modules.map(({ module_id, result }) => [module_id, result]),
    [
      ['module-a', 'PASSED'],
      ['module-b', 'NOT APPLICABLE'],
      ['module-c', 'NOT RUN'],
    ],
  );
  assert.equal(aggregate.full_e2e_satisfied, false);
  assert.equal(aggregate.modules[0].portal_revision, 'a'.repeat(40));
  assert.equal(aggregate.modules[0].module_revision, 'b'.repeat(40));
  assert.equal(aggregate.modules[0].portal_pinned_module_revision, 'b'.repeat(40));

  assert.throws(
    () =>
      aggregateModuleE2E({
        portal_revision: 'a'.repeat(40),
        module_runs: [
          {
            module_id: 'module-invalid',
            repository_id: 'github.com/sdcorejs/module-invalid',
            e2e_availability: 'uninitialized',
            result: 'NOT APPLICABLE',
          },
        ],
      }),
    /uninitialized.*NOT RUN|NOT APPLICABLE.*uninitialized/iu,
  );
});

test('repository summary and template line endings remain valid on the current source', async () => {
  const { assembleProjectContext } = await importRepoModule(
    '_refs/shared/project-context.mjs',
  );
  const context = await assembleProjectContext({
    root: repoRoot,
    requestScope: 'release readiness',
    tracks: ['workflow'],
    stackProfiles: ['node-esm', 'markdown-skill-pack', 'astro-site'],
  });
  assert.equal(context.project_context.summary.schema, 'v2');
  assert.equal(context.project_context.summary.status, 'fresh');

  const attributes = await readFile(path.join(repoRoot, '.gitattributes'), 'utf8');
  assert.match(attributes, /^\*\.tpl\s+text\s+eol=lf$/mu);
});

test('stale module evidence and unsafe manifests fail closed', async () => {
  const {
    validateEvidenceFreshness,
    validateModuleE2EManifest,
  } = await importRepoModule('_refs/shared/repository-contract.mjs');
  assert.equal(
    validateEvidenceFreshness({
      module_revision: 'a'.repeat(40),
      portal_pinned_module_revision: 'b'.repeat(40),
    }).status,
    'stale',
  );
  assert.throws(
    () =>
      validateModuleE2EManifest({
        schema_version: 1,
        module_id: 'module-a',
        repository_id: 'github.com/sdcorejs/module-a',
        e2e: {
          availability: 'available',
          runner: 'playwright',
          command: ['npm', 'run', 'test:e2e'],
          working_directory: 'C:\\absolute\\module-a',
          config_path: 'playwright.config.ts',
          capabilities: [],
          required_portal_capabilities: [],
          persona_refs: [],
          evidence_path: 'test-results/evidence.json',
        },
      }),
    /repository-relative/iu,
  );
});

test('generated NestJS production auth uses OIDC/JWKS instead of a deny-all production binding', async () => {
  const [authModule, authentication, env, packageTemplate, authTest] = await Promise.all([
    readFile(
      path.join(repoRoot, '_refs/nestjs/generator/templates/common/src/auth/auth.module.ts.tpl'),
      'utf8',
    ),
    readFile(
      path.join(repoRoot, '_refs/nestjs/generator/templates/common/src/auth/authentication.ts.tpl'),
      'utf8',
    ),
    readFile(
      path.join(repoRoot, '_refs/nestjs/generator/templates/common/src/config/env.ts.tpl'),
      'utf8',
    ),
    readFile(
      path.join(repoRoot, '_refs/nestjs/generator/templates/common/package.json.tpl'),
      'utf8',
    ),
    readFile(
      path.join(repoRoot, '_refs/nestjs/generator/templates/common/test/e2e/item-auth.e2e-spec.ts.tpl'),
      'utf8',
    ),
  ]);
  assert.doesNotMatch(authModule, /useClass:\s*DenyAllTokenVerifier/u);
  assert.match(authModule, /useClass:\s*OidcTokenVerifier/u);
  assert.match(authentication, /jwtVerify/u);
  assert.match(authentication, /createRemoteJWKSet/u);
  assert.match(env, /OIDC_ISSUER/u);
  assert.match(env, /OIDC_AUDIENCE/u);
  assert.match(env, /OIDC_JWKS_URI/u);
  assert.match(env, /OIDC_ALLOWED_ALGORITHMS/u);
  assert.match(packageTemplate, /"jose"/u);
  assert.match(authTest, /wrong signature/iu);
  assert.match(authTest, /wrong issuer/iu);
  assert.match(authTest, /wrong audience/iu);
  assert.match(authTest, /expired token/iu);
  assert.match(authTest, /not-yet-valid token/iu);
  assert.match(authTest, /unsupported algorithm/iu);
  assert.match(authTest, /unknown kid/iu);
  assert.match(authTest, /key rotation/iu);
  assert.doesNotMatch(authTest, /overrideProvider\(TOKEN_VERIFIER\)/u);
});

test('executable-reference validator covers marked fences and localization context', async () => {
  const {
    validateCanonicalExecutableReferences,
    validateLocalizationPlaceholderContext,
  } = await importRepoModule('scripts/check-executable-references.mjs');
  assert.deepEqual(await validateCanonicalExecutableReferences(), []);
  assert.deepEqual(
    validateLocalizationPlaceholderContext(
      "const title = condition ? '<localized text>' : 'Fallback';",
      'valid.ts',
    ),
    [],
  );
  assert.ok(
    validateLocalizationPlaceholderContext(
      "const title = condition<localized text>'Broken' : 'Fallback';",
      'invalid.ts',
    ).length > 0,
  );
});

const progressiveBaseRevision = 'b6e6c0cfbef80d93a0c90f6dc4e8a02c2d7cbb87';
const progressiveRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const progressiveSkills = {
  angular: {
    body: 'skills/tracks/angular/sdcorejs-angular.md',
    privateRefs: ['_refs/angular/write-code/generation-process.md', '_refs/angular/write-code/finishing.md'],
    owners: ['_refs/angular/write-code/po-ba-prototype.md', '_refs/angular/write-code/generation-rules.md',
      '_refs/angular/write-code/screen-detail.md', '_refs/angular/write-code/init-entity.md', '_refs/angular/write-code/input-analysis.md',
      '_refs/angular/write-code/reuse-existing-entities.md', '_refs/angular/write-code/mock-api-input.md', '_refs/angular/styling.md',
      '_refs/shared/sdcorejs-utils.md'],
  },
  review: {
    body: 'skills/shared/workflow/review.md',
    privateRefs: ['_refs/review/profiles-and-refs.md', '_refs/review/probes.md', '_refs/review/output-contract.md', '_refs/review/context-extensions.md'],
    owners: [],
  },
  design: {
    body: 'skills/tracks/design/sdcorejs-design.md',
    privateRefs: ['_refs/design/handoff-authoring.md'],
    owners: ['_refs/design/mobile-design.md', '_refs/design/frontend-design.md', '_refs/shared/design-handoff.md'],
  },
  explore: {
    body: 'skills/shared/workflow/explore.md',
    privateRefs: ['_refs/explore/read-actions.md', '_refs/explore/authorized-persistence.md'],
    owners: ['_refs/shared/explore-context.md'],
  },
};
const progressiveRetargetedTests = [
  'test/e2e/ai-agent-track-contract.test.mjs', 'test/e2e/angular-production-contract.test.mjs', 'test/e2e/architecture-contract.test.mjs',
  'test/e2e/artifact-path-convention.test.mjs', 'test/e2e/communication-economy.test.mjs', 'test/e2e/convention-artifact-lifecycle.test.mjs',
  'test/e2e/convention-contract.test.mjs', 'test/e2e/convention-review.test.mjs', 'test/e2e/convergence-contract.test.mjs',
  'test/e2e/decision-coverage-contract.test.mjs', 'test/e2e/design-handoff-contract.test.mjs', 'test/e2e/documentation-layout-contract.test.mjs',
  'test/e2e/explore-topology.test.mjs', 'test/e2e/harness-behavioral-sentinel.test.mjs', 'test/e2e/project-context-artifact-lifecycle.test.mjs',
  'test/e2e/review-contract.test.mjs', 'test/e2e/simplify-protected-contract.test.mjs', 'test/e2e/simplify-skill-contract.test.mjs',
  'test/e2e/skill-pack-runner.test.mjs', 'test/e2e/test-track-contract.test.mjs', 'test/e2e/uiux-knowledge.test.mjs',
  'test/e2e/uiux-review-regression.test.mjs', 'test/e2e/visual-offer-policy.test.mjs', 'test/e2e/production-readiness-contract.test.mjs',
  'test/e2e/support/skill-pack-runner.mjs', 'test/e2e/support/visual-offer-eval-runner.mjs', 'test/e2e/support/ui-review-fixture.mjs',
];

function progressiveAtBase(file) {
  const result = spawnSync('git', ['show', `${progressiveBaseRevision}:${file}`], { cwd: progressiveRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  assert.equal(result.status, 0, `baseline source must resolve: ${file}`);
  return result.stdout.replace(/\r\n?/gu, '\n');
}
async function progressiveCurrent(file) {
  return (await readFile(path.join(progressiveRoot, file), 'utf8')).replace(/\r\n?/gu, '\n');
}
function progressiveFrontmatter(text) {
  return text.match(/^---\n[\s\S]*?\n---\n/u)[0];
}
function progressiveSection(text, heading) {
  const lines = text.split('\n');
  const start = lines.findIndex(line => /^#+\s/u.test(line) && line.replace(/^#+\s+/u, '') === heading);
  if (start < 0) return null;
  const level = lines[start].match(/^#+/u)[0].length;
  let end = start + 1;
  while (end < lines.length && !(new RegExp(`^#{1,${level}}\\s`, 'u').test(lines[end]))) end += 1;
  return lines.slice(start, end).join('\n').trimEnd();
}
// Units are paragraphs, list items and table rows outside fences; fences stay whole.
function progressiveUnits(text) {
  const lines = text.replace(/^---\n[\s\S]*?\n---\n/u, '').split('\n');
  const units = [], fences = [];
  let paragraph = [];
  const flush = () => { if (paragraph.length) units.push(paragraph.join(' ')); paragraph = []; };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fence = line.trim().match(/^(`{3,})/u);
    if (fence) {
      flush();
      const block = [line];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith(fence[1])) { block.push(lines[index]); index += 1; }
      block.push(lines[index] ?? '');
      fences.push(block.join('\n'));
      continue;
    }
    if (line.trim() === '' || /^#{1,6}\s/u.test(line)) { flush(); continue; }
    if (/^\s*(?:[-*]|\d+\.|✅)\s+/u.test(line) || /^\s*\|/u.test(line)) {
      flush();
      paragraph = [line];
      while (index + 1 < lines.length && /^\s{2,}\S/u.test(lines[index + 1]) && !/^\s*(?:[-*]|\d+\.|✅|\|)/u.test(lines[index + 1])) {
        index += 1; paragraph.push(lines[index]);
      }
      flush();
      continue;
    }
    paragraph.push(line);
  }
  flush();
  return { units, fences };
}
function progressiveNormalize(text) {
  return ` ${text
    .replace(/\]\([^)]*\)/gu, ']')
    .replace(/(^|\n)\s*(?:[-*]|\d+\.|✅)\s+/gu, '$1')
    .replace(/(^|\n)#{1,6}\s+/gu, '$1')
    .replace(/\s+/gu, ' ')
    .trim()} `;
}

// Units deduplicated into an existing owner that already states the same rule; every clause needs owner evidence.
const progressiveGenerationRules = '_refs/angular/write-code/generation-rules.md';
const progressivePrototype = '_refs/angular/write-code/po-ba-prototype.md';
const progressiveStyling = '_refs/angular/styling.md';
const progressiveFinishing = '_refs/angular/write-code/finishing.md';
const progressiveTemplateFirst = [[progressivePrototype, '## Template-first invariant'], [progressivePrototype, 'New portal: run `init-portal.md` first'],
  [progressivePrototype, 'Existing portal: modify the existing Core UI portal shell, routes, menu, and component conventions in place.'],
  [progressivePrototype, 'Do not design a custom portal shell, bespoke sidebar/header/menu, standalone dashboard, raw list/table, or hand-built create/update/detail form']];
const progressiveEquivalents = {
  'skills/tracks/angular/sdcorejs-angular.md': [
    { unit: 'Template-first is mandatory for an approved technical prototype:', evidence: progressiveTemplateFirst },
    { unit: 'New portal: run `init-portal.md` first, preserve the Core UI starter template', evidence: progressiveTemplateFirst },
    { unit: 'Existing portal: extend the existing Core UI portal shell', evidence: progressiveTemplateFirst },
    { unit: 'Do not create a parallel custom portal shell', evidence: progressiveTemplateFirst },
    { unit: 'Enforce template-first technical-prototype generation', evidence: progressiveTemplateFirst },
    { unit: 'Design a custom portal shell, landing page, dashboard', evidence: progressiveTemplateFirst },
    { unit: 'Keep independent child CRUD scoped to the parent DETAIL screen', evidence: [
      [progressiveGenerationRules, 'Keep independent child CRUD inside the parent DETAIL screen and use a modal or side drawer rather than separate child routes.'],
      [progressiveGenerationRules, 'Pass, prefill, and lock the current parent id in the child form.'],
      [progressiveGenerationRules, 'Refresh only the child collection after success and preserve the parent route plus active tab/section.']] },
    { unit: 'Navigate from a parent DETAIL child collection', evidence: [[progressiveGenerationRules, 'use a modal or side drawer rather than separate child routes.']] },
    { unit: 'Show independent child create/edit/delete actions', evidence: [[progressiveGenerationRules, 'Hide independent child actions in parent CREATE/UPDATE.']] },
    { unit: 'Use inline `FormArray` for independently persisted child CRUD', evidence: [[progressiveGenerationRules, 'Use `FormArray` only when child rows are saved in the same parent payload.']] },
    { unit: 'Style utility-first', evidence: [[progressiveStyling, 'utility-first, minimal custom CSS'], [progressiveStyling, 'absolute px, integer 0–200'],
      [progressiveStyling, 'Use **multiples of 4**'], [progressiveStyling, 'Tailwind (if the consumer ships it)'], [progressiveStyling, 'Only when no utility fits'],
      [progressiveStyling, 'Add a one-line `// why:` comment'], [progressiveStyling, 'Reuse Core UI tokens inside it']] },
    { unit: 'Hand-write CSS for flex / spacing / alignment / color / typography', evidence: [[progressiveStyling, 'too many unnecessary CSS classes'],
      [progressiveStyling, 'Bootstrap class names (`btn`, `card`, `form-control`, `alert`, `modal`)'], [progressiveStyling, 'Tailwind syntax when the consumer has no Tailwind.'],
      [progressiveStyling, 'component `.scss` is near-empty']] },
    { unit: 'Generate every component with `changeDetection: ChangeDetectionStrategy.OnPush`', evidence: [[progressiveGenerationRules, '`changeDetection: ChangeDetectionStrategy.OnPush`'],
      [progressiveFinishing, 'Every generated component imports and declares `changeDetection: ChangeDetectionStrategy.OnPush`']] },
    { unit: 'Omit `ChangeDetectionStrategy.OnPush` from generated components.', evidence: [[progressiveGenerationRules, '`changeDetection: ChangeDetectionStrategy.OnPush`']] },
    { unit: 'Precompute all values displayed or bound in templates', evidence: [[progressiveGenerationRules, 'Use `signal()` for mutable state and `computed()` for derived display'],
      [progressiveGenerationRules, 'Do not call methods/getters from interpolation or property/class/style/ structural bindings to calculate displayed values.']] },
    { unit: 'Call component methods/getters from HTML', evidence: [[progressiveGenerationRules, 'Do not call methods/getters from interpolation'], [progressiveGenerationRules, 'Allow event handlers']] },
    { unit: 'Keep Service models as Service-owned contracts.', evidence: [[progressiveGenerationRules, 'as Service/Component contracts rather than forced copies of raw API payloads.'],
      [progressiveGenerationRules, 'Put UI-only fields in a local ViewModel, signal, or a documented Service mapper output.']] },
    { unit: 'Treat Service DTOs as scratch objects', evidence: [[progressiveGenerationRules, 'Do not add UI-only fields such as `checked`, `selected`, `expanded`'],
      [progressiveGenerationRules, 'Put UI-only fields in a local ViewModel, signal, or a documented Service mapper output.']] },
  ],
};
async function progressiveEquivalent(body, needle) {
  const entry = (progressiveEquivalents[body] ?? []).find(item => needle.trim().startsWith(progressiveNormalize(item.unit).trim()));
  if (!entry) return false;
  for (const [owner, literal] of entry.evidence) {
    assert.ok(progressiveNormalize(await progressiveCurrent(owner)).includes(progressiveNormalize(literal).trim()), `${owner} proves ${literal}`);
  }
  return true;
}
const progressiveAssertCounts = text => (text.match(/\bassert\.[A-Za-z]+\(/gu) ?? []).length;
const progressiveSkipCounts = text => (text.match(/\b(?:test|it|describe)\.(?:skip|only|todo)\(|\{\s*(?:skip|only|todo)\s*:/gu) ?? []).length;

test('case-progressive-load-body-size: each refactored skill body is smaller than its baseline', async () => {
  for (const { body } of Object.values(progressiveSkills)) {
    const before = Buffer.byteLength(progressiveAtBase(body));
    const after = Buffer.byteLength(await progressiveCurrent(body));
    assert.ok(after < before, `${body} must shrink: ${after} >= ${before}`);
  }
});

test('case-progressive-load-inventory-routing: frontmatter, name, description and required-actions stay byte-identical', async () => {
  for (const { body } of Object.values(progressiveSkills)) {
    assert.equal(progressiveFrontmatter(await progressiveCurrent(body)), progressiveFrontmatter(progressiveAtBase(body)), body);
  }
});

test('case-progressive-load-angular-gates: approval preflight stays first and gates stay in the body', async () => {
  const { body } = progressiveSkills.angular;
  const [current, baseline] = [await progressiveCurrent(body), progressiveAtBase(body)];
  const heading = 'Approval preflight — first action, fail closed';
  assert.equal(current.split('\n').find(line => /^##\s/u.test(line)), `## ${heading}`);
  const approval = progressiveSection(current, heading);
  assert.equal(approval, progressiveSection(baseline, heading));
  assert.ok(current.indexOf(approval) + approval.length <= current.search(/_refs\/angular\/write-code\//u), 'approval precedes every implementation reference');
  for (const literal of ['## Eligibility preflight', '`plain-angular` | Stop and return to `sdcorejs-execute-plan` generic harness', 'technical-prototype',
    '_refs/shared/frontend-architecture.md', '`frontend_architecture`', '_refs/shared/design-handoff.md', 'resolveAngularExecution',
    'completeAngularExecution', 'RED-first', '`standard`', 'Core UI usage summary', 'Test authoring', 'must not create or self-approve']) {
    assert.ok(current.includes(literal), `angular body keeps ${literal}`);
  }
});

test('case-progressive-load-review-boundary: direct review stays read-only in the body', async () => {
  const current = await progressiveCurrent(progressiveSkills.review.body);
  for (const literal of ['`sdcorejs-review` must not edit source code', 'strict read-only by default', 'must not silently write `.sdcorejs` artifacts',
    'Do not auto-run `sdcorejs-repair-loop`.', 'Only option `2` may write a review artifact', 'Classify `track_profile` before loading refs.',
    'design-artifact', 'implemented-ui-conformance', '_refs/shared/ui-review.md', 'evaluateReviewContract', 'Redact secrets',
    '| `code` |', '| `architecture` |', '| `consistency` |', '| `security` |', '| `performance` |', '| `accessibility` |', '| `ALL` |', '| `site-audit` |']) {
    assert.ok(current.includes(literal), `review body keeps ${literal}`);
  }
});

test('case-progressive-load-design-boundary: existing design, draft/approval and ownership stay in the body', async () => {
  const { body } = progressiveSkills.design;
  const [current, baseline] = [await progressiveCurrent(body), progressiveAtBase(body)];
  assert.equal(progressiveSection(current, 'Existing Design First'), progressiveSection(baseline, 'Existing Design First'));
  for (const literal of ['lifecycle.state: draft', 'it is never an implementation contract', 'Material changes return to the decision/approval owner',
    'portal fallback is forbidden', 'resolveDesignHandoffTarget', 'verifyDesignHandoff', 'validateDesignHandoff', 'Emitting only the ledger is',
    'Root-level `design/**` is never a write target', 'Claim a design is approved without explicit user approval']) {
    assert.ok(current.includes(literal), `design body keeps ${literal}`);
  }
});

test('case-progressive-load-explore-boundary: action boundaries, guard and redaction stay in the body', async () => {
  const { body } = progressiveSkills.explore;
  const [current, baseline] = [await progressiveCurrent(body), progressiveAtBase(body)];
  for (const heading of ['Target Root And Authoring-Repo Guard', 'Global Secret And PII Redaction']) {
    assert.equal(progressiveSection(current, heading), progressiveSection(baseline, heading), heading);
  }
  for (const row of progressiveSection(baseline, 'Step 0 - Classify `explore_action`').split('\n').filter(line => /^\| `/u.test(line))) {
    assert.ok(current.includes(row), `explore body keeps action row ${row.slice(0, 40)}`);
  }
  for (const literal of ['Read-only explore actions must not write', 'Write-approved actions must record the approval source']) {
    assert.ok(current.includes(literal), literal);
  }
  const persistenceUse = progressiveUnits(current).units.find(unit => unit.includes('_refs/explore/authorized-persistence.md'));
  assert.match(persistenceUse ?? '', /write-approved/u);
  assert.match(persistenceUse ?? '', /\b(?:only|after)\b/u);
  const readActions = await progressiveCurrent('_refs/explore/read-actions.md');
  assert.doesNotMatch(readActions, /artifact_kind:\s*(?:persona|memory)/u, 'read-only reference carries no persistence template');
});

test('case-progressive-load-reference-loading: private references resolve, load conditionally and form no cycles', async () => {
  const privateRefs = Object.values(progressiveSkills).flatMap(skill => skill.privateRefs);
  const graph = new Map();
  for (const skill of Object.values(progressiveSkills)) {
    const { units } = progressiveUnits(await progressiveCurrent(skill.body));
    for (const ref of skill.privateRefs) {
      const text = await progressiveCurrent(ref);
      assert.ok(text.trim().length > 0, `${ref} exists`);
      assert.doesNotMatch(text, /(?:^|[\s(`])(?:\.\.\/)*skills\//u, `${ref} does not link back to a skill body`);
      const uses = units.filter(unit => unit.includes(ref));
      assert.ok(uses.length > 0, `${skill.body} names ${ref}`);
      assert.ok(uses.every(unit => /\b(?:when|before|after|only|if|for)\b/iu.test(unit)), `${ref} has an explicit load condition`);
      graph.set(ref, privateRefs.filter(other => other !== ref && text.includes(other)));
    }
  }
  const visiting = new Set(), done = new Set();
  const visit = node => {
    assert.ok(!visiting.has(node), `private reference cycle through ${node}`);
    if (done.has(node)) return;
    visiting.add(node); for (const next of graph.get(node) ?? []) visit(next); visiting.delete(node); done.add(node);
  };
  for (const node of graph.keys()) visit(node);
});

test('case-progressive-load-canonical-owner: every baseline unit survives verbatim in the body or one declared owner', async () => {
  for (const skill of Object.values(progressiveSkills)) {
    const current = await progressiveCurrent(skill.body);
    const bodyText = progressiveNormalize(current);
    const privateTexts = await Promise.all(skill.privateRefs.map(progressiveCurrent));
    const ownerTexts = [...privateTexts, ...await Promise.all(skill.owners.map(progressiveCurrent))];
    const privateNormalized = privateTexts.map(progressiveNormalize);
    const ownerNormalized = ownerTexts.map(progressiveNormalize);
    const { units, fences } = progressiveUnits(progressiveAtBase(skill.body));
    for (const unit of units) {
      const needle = progressiveNormalize(unit);
      const inBody = bodyText.includes(needle);
      assert.ok(inBody || ownerNormalized.some(text => text.includes(needle)) || await progressiveEquivalent(skill.body, needle),
        `${skill.body} lost unit: ${unit.slice(0, 120)}`);
      if (inBody && needle.trim().length > 40) {
        assert.ok(!privateNormalized.some(text => text.includes(needle)), `${skill.body} duplicates moved unit: ${unit.slice(0, 120)}`);
      }
    }
    for (const fence of fences) {
      assert.ok(current.includes(fence) || ownerTexts.some(text => text.includes(fence)), `${skill.body} lost fence: ${fence.slice(0, 80)}`);
    }
  }
});

test('case-progressive-load-single-schema: moved schemas and templates keep one byte-identical copy', async () => {
  const moved = [
    ['review', /````markdown\n# Authoritative runtime context[\s\S]*?\n````/u],
    ['design', /```markdown\n# Design Spec - <Feature>[\s\S]*?\n```/u],
    ['explore', /```markdown\n---\nartifact_id: project-persona[\s\S]*?\n```/u],
    ['explore', /```yaml\n---\nartifact_id: memory-<scope>-<timestamp>[\s\S]*?\n```/u],
  ];
  for (const [key, pattern] of moved) {
    const skill = progressiveSkills[key];
    const block = progressiveAtBase(skill.body).match(pattern)?.[0];
    assert.ok(block, `baseline ${key} schema exists`);
    const files = [skill.body, ...skill.privateRefs, ...skill.owners];
    const copies = (await Promise.all(files.map(progressiveCurrent))).reduce((total, text) => total + text.split(block).length - 1, 0);
    assert.equal(copies, 1, `${key} schema has exactly one canonical copy`);
    assert.ok(!(await progressiveCurrent(skill.body)).includes(block), `${key} schema moved out of the body`);
  }
});

test('case-progressive-load-test-integrity: retargeted suites keep every assertion and add no skips', async () => {
  for (const file of progressiveRetargetedTests) {
    const [before, after] = [progressiveAtBase(file), await progressiveCurrent(file)];
    assert.ok(progressiveAssertCounts(after) >= progressiveAssertCounts(before), `${file} assertion count must not decrease`);
    assert.ok(progressiveSkipCounts(after) <= progressiveSkipCounts(before), `${file} must not add skip/only/todo`);
  }
});

test('case-progressive-load-distribution: every private reference is mirrored byte-identically', async () => {
  for (const ref of Object.values(progressiveSkills).flatMap(skill => skill.privateRefs)) {
    const source = await progressiveCurrent(ref);
    for (const mirrorRoot of ['.claude/_refs', 'plugin/_refs', 'codex/skills/_refs']) {
      assert.equal(await progressiveCurrent(`${mirrorRoot}/${ref.slice('_refs/'.length)}`), source, `${mirrorRoot} mirrors ${ref}`);
    }
  }
});

const progressiveSkillName = text => text.match(/^name:\s*(\S+)/mu)?.[1];

test('case-progressive-load-explore-inventory: explore refactor adds no public memory, persona or conventions skill', async () => {
  const currentFiles = (await readdir(path.join(progressiveRoot, 'skills'), { recursive: true }))
    .map(file => `skills/${String(file).replaceAll('\\', '/')}`).filter(file => file.endsWith('.md'));
  const baselineFiles = spawnSync('git', ['ls-tree', '-r', '--name-only', progressiveBaseRevision, '--', 'skills'],
    { cwd: progressiveRoot, encoding: 'utf8' }).stdout.split(/\r?\n/u).filter(file => file.endsWith('.md'));
  const current = (await Promise.all(currentFiles.map(progressiveCurrent))).map(progressiveSkillName).sort();
  const baseline = baselineFiles.map(file => progressiveSkillName(progressiveAtBase(file))).sort();
  assert.equal(current.length, 23);
  assert.deepEqual(current, baseline, 'public skill names stay identical to the baseline');
  for (const name of current) assert.doesNotMatch(name, /memor|persona|convention/iu, `${name} is not a new memory, persona or conventions skill`);
  for (const ref of progressiveSkills.explore.privateRefs) {
    assert.doesNotMatch(await progressiveCurrent(ref), /^---\n[\s\S]*?^name:/mu, `${ref} is a private reference, not a skill`);
  }
  for (const mirrorRoot of ['.claude/skills', 'plugin/skills', 'codex/skills']) {
    const entries = await readdir(path.join(progressiveRoot, mirrorRoot), { withFileTypes: true });
    const exposed = entries.filter(entry => entry.isDirectory() && entry.name !== '_refs').map(entry => entry.name).sort();
    assert.deepEqual(exposed, current, `${mirrorRoot} exposes exactly the public inventory`);
  }
});

test('case-progressive-load-distribution-resolution: mirrored skill bodies resolve every private reference', async () => {
  for (const skill of Object.values(progressiveSkills)) {
    const name = progressiveSkillName(await progressiveCurrent(skill.body));
    for (const distribution of [
      { body: `.claude/skills/${name}/SKILL.md`, mention: ref => ref, resolve: ref => `.claude/${ref}` },
      { body: `plugin/skills/${name}/SKILL.md`, mention: ref => ref, resolve: ref => `plugin/${ref}` },
      { body: `codex/skills/${name}/SKILL.md`, mention: ref => `../${ref}`, resolve: ref => path.posix.join(`codex/skills/${name}`, `../${ref}`) },
    ]) {
      const mirrored = await progressiveCurrent(distribution.body);
      for (const ref of skill.privateRefs) {
        assert.ok(mirrored.includes(distribution.mention(ref)), `${distribution.body} names ${distribution.mention(ref)}`);
        assert.equal(await progressiveCurrent(distribution.resolve(ref)), await progressiveCurrent(ref), `${distribution.body} resolves ${ref}`);
      }
    }
  }
});
