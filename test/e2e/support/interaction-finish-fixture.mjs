import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, realpathSync, rmSync, cpSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parse } from 'yaml';
import { createApprovedArtifact } from '../../../_refs/shared/approved-artifact.mjs';
import { decisionFingerprint } from '../../../_refs/harness/runtime-policy.mjs';
import { createHash } from 'node:crypto';

export function documentedInteraction() {
  return documented('../../../_refs/shared/user-choice-prompt.md', 'interaction_context');
}

export function documentedFinish() {
  return documented('../../../_refs/shared/finish-gate.md', 'finish_context');
}

function documented(file, key) {
  const text = readFileSync(new URL(file, import.meta.url), 'utf8');
  const block = [...text.matchAll(/```yaml\r?\n([\s\S]*?)```/gu)]
    .map(match => parse(match[1])).find(value => value?.[key]);
  assert.ok(block, `canonical documented ${key} payload exists`);
  return structuredClone(block[key]);
}

function removeFixture(root) {
  assert.equal(realpathSync.native(path.dirname(root)), realpathSync.native(tmpdir()));
  assert.match(path.basename(root), /^finish-(?:seed|contract)-/u);
  rmSync(root, { recursive: true, force: true });
}

let seed;
function seedRepository() {
  if (seed) return seed;
  seed = mkdtempSync(path.join(tmpdir(), 'finish-seed-'));
  mkdirSync(path.join(seed, 'src'));
  writeFileSync(path.join(seed, 'src/value.mjs'), 'export const value = 1;\n');
  writeFileSync(path.join(seed, 'oracle.mjs'), "import assert from 'node:assert/strict';\nimport { value } from './src/value.mjs';\nassert.equal(value, 1);\n");
  const git = (...args) => execFileSync('git', args, { cwd: seed, windowsHide: true, encoding: 'utf8' });
  git('init', '--quiet'); git('config', 'core.autocrlf', 'false'); git('add', '.');
  git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'fixture');
  process.once('exit', () => removeFixture(seed));
  return seed;
}

export async function finishFixture(t, options = {}) {
  const { createRepositoryObservationRuntime, repositoryScopeFingerprint } = await import('../../../_refs/shared/repository-observation.mjs');
  const root = mkdtempSync(path.join(tmpdir(), 'finish-contract-')); t.after(() => removeFixture(root));
  cpSync(seedRepository(), root, { recursive: true });
  const write = (file, content) => { mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); writeFileSync(path.join(root, file), content); };
  write('src/value.mjs', 'export const value = 1; // changed\n');
  // Audit repair fixtures add ignored output, links or helper commands before the host observes.
  options.setup?.({ root, write });
  const owner = 'github.com/example/app', change = path.basename(root), scope = options.scope ?? ['src/value.mjs', 'guide.md'];
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true }).trim();
  const fingerprint = repositoryScopeFingerprint(scope);
  const policy = { schema_version: 1, scope_fingerprint: fingerprint, test_strategy: 'regression-first',
    required_phases: ['baseline','verify','branch-ready'], hooks: [], decisions: { simplify: 'skip', review: 'review-only' }, ...options.policy };
  const metadata = { schema_version: 1, artifact_id: 'fixture-plan', artifact_kind: 'plan', contract_id: change, requirement_id: 'R-001', change_ref: change,
    track: 'workflow', stack_profile: 'markdown-skill-pack', owner_repository_id: owner, owner_repository_role: 'standalone', owner_module_id: null,
    parent_repository_id: null, parent_references: [], repository_relative_path: '.sdcorejs/plans/workflow/fixture.md', source_revision: revision,
    allowed_paths: scope, prohibited_paths: [], approval_source: 'explicit-user-choice', approved_by: 'fixture-user', approved_at: new Date().toISOString(), supersedes: null };
  // Audit repair fixtures may add further approved fences, such as simplify-host-policy.
  const plan = createApprovedArtifact({ metadata, body: '```finish-policy\n' + JSON.stringify(policy) + '\n```\n' + (options.planBody ?? '') });
  const context = documentedFinish();
  context.identity = { change_ref: change, owner_repository_id: owner, integration_owner_repository_id: owner, scope_fingerprint: fingerprint };
  context.actor = { role: options.worker ? 'worker' : 'integration', repository_id: owner };
  const events = new Map();
  for (const [key, values] of [['simplify',['skip','analyze','apply']], ['review',['skip','review-only','review-and-repair','defer']]]) {
    const item = documentedInteraction();
    item.decision = { ...item.decision, id: `finish-${key}`, gate: `finish:${key}`, purpose: 'finish-policy', change_ref: change, owner_repository_id: owner,
      artifact_id: null, revision: null, scope_fingerprint: fingerprint, approval: false,
      options: values.map((value, i) => ({ id: value, selector: i+1, value, label: value, aliases: [] })) };
    context.choices[key] = item;
  }
  const choose = (key, value) => { const input = context.choices[key], id = 'response-' + key;
    events.set(id, { id, question_id: input.decision.id, decision_fingerprint: decisionFingerprint(input.decision), text: value }); input.reply_ref = id; };
  if (options.simplify) choose('simplify', options.simplify);
  if (options.review) choose('review', options.review);
  const commands = Object.fromEntries(['baseline','simplify','reverify','review','repair','verify','branch-ready','unit-review-a','unit-review-b','red'].map(phase => [phase, {
    command: [process.execPath, 'oracle.mjs'], cwd: '.', scope: ['verify','branch-ready'].includes(phase) ? [...scope, 'oracle.mjs'] : ['src/value.mjs', 'oracle.mjs'],
  }]));
  const assessment = { owner_repository_id: owner, change_ref: change, blocking_findings: [] };
  const policyDecision = documentedInteraction();
  policyDecision.decision = { ...context.choices.simplify.decision, id: 'direct-policy', gate: 'finish:policy', revision,
    options: [{ id: 'confirmed-policy', selector: 1, value: 'sha256:' + createHash('sha256').update(JSON.stringify(policy)).digest('hex'), label: 'Confirmed scoped policy', aliases: [] }] };
  policyDecision.reply_ref = 'policy-event';
  events.set('policy-event', { id: 'policy-event', question_id: 'direct-policy', decision_fingerprint: decisionFingerprint(policyDecision.decision), text: '1' });
  const observation = createRepositoryObservationRuntime({ root, repository_id: owner, change_ref: change, scope, commands: { ...commands, ...options.commands }, read_review: () => assessment,
    ...(options.direct ? { policy, policy_decision: policyDecision } : { load_plan: () => ({ artifact: plan, parents: [] }) }),
    read_response: id => events.get(id), classify_source: options.classify_source ?? (() => ({ kind: 'executable' })), ...options.runtime });
  return { root, write, context, policy, plan, choose, assessment, observation,
    runtime: { observation, read_review: () => assessment }, run: phase => context.phase_receipts[phase] = observation.run(phase) };
}
