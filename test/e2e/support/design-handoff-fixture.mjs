import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parse, stringify } from 'yaml';
import { createApprovedArtifact } from '../../../_refs/shared/approved-artifact.mjs';

export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export function parseDesignArtifact(text) {
  const normalized = text.replace(/\r\n?/gu, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n/u);
  if (!match) return JSON.parse(normalized);
  return { metadata: parse(match[1]), body: normalized.slice(match[0].length) };
}
export function designFixture(t, { role = 'standalone', experience = 'standalone', module = null } = {}) {
  const root = realpathSync.native(mkdtempSync(path.join(tmpdir(), 'design-contract-')));
  t.after(() => {
    if (path.dirname(root) !== realpathSync.native(tmpdir()) || !path.basename(root).startsWith('design-contract-') || lstatSync(root).isSymbolicLink()) throw Error('unsafe fixture cleanup');
    rmSync(root, { recursive: true, force: true });
  });
  const repo = `github.com/example/${path.basename(root).toLowerCase()}`;
  const git = (...args) => execFileSync('git', ['-c', 'commit.gpgSign=false', '-c', 'core.hooksPath=', ...args], { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 30000, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const put = (file, bytes) => { mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); writeFileSync(path.join(root, file), bytes); };
  git('init', '-q'); git('config', 'user.name', 'Contract Fixture'); git('config', 'user.email', 'fixture@example.invalid');
  git('remote', 'add', 'origin', `https://${repo}.git`);
  put('src/tokens.css', ':root { --gap: 8px; }');
  git('add', '.'); git('commit', '-qm', 'fixture source');
  const revision = git('rev-parse', 'HEAD');
  const doc = readFileSync(new URL('../../../_refs/shared/design-handoff.md', import.meta.url), 'utf8');
  const sample = doc.match(/<!-- design-handoff-v2-example -->\s*```json\n([\s\S]*?)\n```/u);
  if (!sample) throw Error('documented schema-2 payload is missing');
  const handoff = JSON.parse(sample[1]);
  Object.assign(handoff.metadata, { owner_repository_id: repo, owner_repository_role: role, owner_module_id: module, experience_kind: experience, ownership_scope: role === 'module' ? 'module' : experience === 'cross-module' ? 'cross-repository-aggregate' : role === 'portal' ? 'portal-composition' : 'repository', source_revision: revision });
  handoff.lifecycle.state = 'reviewed';
  for (const asset of [...handoff.documents, handoff.editable_source]) {
    const bytes = asset.path.endsWith('.html') ? '<main>Orders</main>' : `# ${asset.path}\nApproved fixture design.`;
    put(asset.path, bytes); asset.sha256 = digest(bytes);
  }
  handoff.design_system_reuse.evidence_refs = [{ repository_id: repo, path: 'src/tokens.css', revision, sha256: digest(readFileSync(path.join(root, 'src/tokens.css'))) }];
  const owner = { repository_id: repo, role, module_id: module };
  const requirements = { required: true, feature: 'orders', experience_kind: experience, owner, surfaces: [{ id: 'mobile', required: true, rendered_required: false, interaction_required: false }] };
  const artifacts = new Map();
  const reference = artifact => ({ repository_id: artifact.metadata.owner_repository_id, artifact_id: artifact.metadata.artifact_id, artifact_kind: artifact.metadata.artifact_kind, repository_relative_path: artifact.metadata.repository_relative_path, revision: artifact.metadata.source_revision, approval_hash: artifact.metadata.approval_hash });
  const approve = (kind, file, body, parents = [], extra = {}) => {
    const artifact = createApprovedArtifact({ metadata: { schema_version: 1, artifact_id: `${kind}:orders`, artifact_kind: kind, contract_id: handoff.metadata.contract_id, requirement_id: handoff.metadata.requirement_id, change_ref: handoff.metadata.change_ref, track: ['spec', 'plan'].includes(kind) ? 'node' : 'design', stack_profile: ['spec', 'plan'].includes(kind) ? 'node-general' : 'design', owner_repository_id: repo, owner_repository_role: role, owner_module_id: module, repository_relative_path: file, source_revision: revision, parent_repository_id: null, parent_references: parents, supersedes: null, approved_at: '2026-09-23T00:00:00.000Z', approved_by: 'fixture-authority', approval_source: 'test-fixture', ...extra }, body: typeof body === 'string' ? body : JSON.stringify(body) });
    put(file, '---\n' + stringify(artifact.metadata, { lineWidth: 0 }) + '---\n' + artifact.body);
    artifacts.set(kind, artifact); return reference(artifact);
  };
  let specRef, planRef, approvalRef;
  const evidence = [];
  const parents = () => {
    specRef = approve('spec', '.sdcorejs/specs/design/orders.md', { design_requirements: requirements });
    planRef = approve('plan', '.sdcorejs/plans/design/orders.md', { design_requirements: requirements }, [specRef], { allowed_paths: ['src/**'], prohibited_paths: [] });
    handoff.metadata.parent_references = [specRef, planRef];
  };
  const approveDesign = () => { approvalRef = approve('design-handoff', handoff.metadata.repository_relative_path, handoff, [specRef, planRef]); return approvalRef; };
  parents(); approveDesign();
  const options = () => ({ repositories: [{ ...owner, root, available: true, writable: true }], expected: { contract_id: handoff.metadata.contract_id, requirement_id: handoff.metadata.requirement_id, change_ref: handoff.metadata.change_ref, spec: specRef, plan: planRef, design: approvalRef }, artifact_references: [specRef, planRef], parse_artifact: parseDesignArtifact, evidence: structuredClone(evidence) });
  const runtime = async (overrides = {}) => { const { createDesignVerificationRuntime } = await import('../../../_refs/shared/design-verification.mjs'); return createDesignVerificationRuntime({ ...options(), ...overrides }); };
  // These are synthetic runner fixtures, not claims of real browser/UI execution.
  const receipt = ({ kind = 'rendered-wireframe', surface = 'mobile', paths = [handoff.editable_source.path], ...overrides } = {}) => {
    const body = { command: 'fixture-renderer --surface mobile', cwd: '.', owner_repository_id: repo, exit_code: 0, surface_id: surface, kind, scope: paths, fingerprints: Object.fromEntries(paths.map(file => [file, digest(readFileSync(path.join(root, file)))])), ...overrides };
    const ref = approve('release-evidence', `.sdcorejs/evidence/design/receipt-${evidence.length}.md`, body, [], { artifact_id: `receipt:${evidence.length}`, contract_id: 'design-command-receipt:v2' });
    const pointer = { artifact_ref: ref.repository_relative_path, approval_hash: ref.approval_hash };
    evidence.push({ ...pointer, repository_id: repo }); return pointer;
  };
  return { root, repo, revision, git, put, handoff, requirements, artifacts, reference, approve, parents, approveDesign, options, runtime, receipt, evidence, read: file => readFileSync(path.join(root, file), 'utf8'), exists: file => existsSync(path.join(root, file)) };
}

export async function designExecutionFixture(fixture) {
  const { repo, artifacts, handoff } = fixture;
  return {
    approved_spec: artifacts.get('spec'), approved_plan: artifacts.get('plan'),
    plan_context: { schema_version: 1 }, owner_revisions: { [repo]: fixture.revision },
    repository_plan: {
      schema_version: 1, integration_owner_repository_id: repo, gitlink_updates_in_scope: false,
      dependency_order: ['implementation'], repositories: fixture.options().repositories,
      steps: [{ id: 'implementation', action: 'EDIT', semantic_scope: 'repository', owner_repository_id: repo, git_roots: [repo], allowed_paths: ['src/**'], prohibited_paths: [], depends_on: [] }],
    },
    design_handoff: handoff, design_runtime: await fixture.runtime(),
  };
}
