import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { verifyApprovedArtifact, verifyApprovedArtifactGraph } from './approved-artifact.mjs';
import { classifyDesignArtifactPath, safeDesignPath } from './artifact-paths.mjs';
import { buildDesignArtifactContext, validateDesignHandoff } from './design-handoff.mjs';
import { resolveEvidenceArtifact } from './evidence-artifact.mjs';
import { stableRepositoryId } from './repository-contract.mjs';
import { systemRegistry } from './system-registry.mjs';

// Runtime authority is supplied by the executor host, never deserialized from a
// handoff. Expected approvals/runner receipts must come from that host's workflow.
const runtimes = new WeakMap();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const nonempty = value => typeof value === 'string' && value.trim() !== '';
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };
const key = ref => `${ref?.repository_id}:${ref?.artifact_id}`;
const identity = metadata => ({ repository_id: metadata.owner_repository_id, role: metadata.owner_repository_role, module_id: metadata.owner_module_id });
const sameReference = (a, b) => ['repository_id', 'artifact_id', 'artifact_kind', 'revision', 'approval_hash'].every(field => a?.[field] === b?.[field]);

export function createDesignVerificationRuntime(options = {}) {
  const { parse_artifact, review_changes, module_runtimes, ...data } = options;
  const token = Object.freeze({ kind: 'design-verification-runtime' });
  runtimes.set(token, { ...structuredClone(data), parse_artifact, review_changes, module_runtimes: { ...module_runtimes } });
  return token;
}

function observer(options) {
  requireThat(Array.isArray(options.repositories), 'repository topology is unavailable');
  const repositories = new Map();
  for (const repository of options.repositories) {
    requireThat(!repositories.has(repository.repository_id), 'ambiguous repository identity');
    requireThat(systemRegistry.repository_roles.includes(repository.role), 'unknown registry repository role');
    repositories.set(repository.repository_id, repository);
  }
  const roots = new Map(), observed = new Map();
  const git = (root, args) => execFileSync('git', ['--no-optional-locks', ...args], { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 30000, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const repository = id => {
    if (roots.has(id)) return roots.get(id);
    const value = repositories.get(id);
    requireThat(value?.available === true && nonempty(value.root), `repository source unavailable: ${id}`);
    const root = realpathSync.native(value.root);
    requireThat(path.resolve(value.root) === root && realpathSync.native(git(root, ['rev-parse', '--show-toplevel'])) === root, 'different Git root or aliased repository root');
    requireThat(stableRepositoryId({ remote_url: git(root, ['remote', 'get-url', 'origin']) }) === id, `repository identity mismatch: ${id}`);
    const result = { ...value, root, revision: git(root, ['rev-parse', 'HEAD']) };
    roots.set(id, result); return result;
  };
  const contained = (id, file, directory = false) => {
    requireThat(safeDesignPath(file), `unsafe design path: ${file}`);
    const repo = repository(id); let cursor = repo.root;
    for (const segment of file.split('/')) {
      cursor = path.join(cursor, segment);
      const stat = lstatSync(cursor);
      const rel = path.relative(repo.root, realpathSync.native(cursor));
      requireThat(!stat.isSymbolicLink() && rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel), `unproven symlink containment: ${file}`);
      requireThat(!(stat.isDirectory() && existsSync(path.join(cursor, '.git'))), `different nested Git root: ${file}`);
    }
    requireThat(directory ? lstatSync(cursor).isDirectory() : lstatSync(cursor).isFile(), `unsupported source entry: ${file}`);
    return cursor;
  };
  const read = (id, file) => {
    const absolute = contained(id, file), before = lstatSync(absolute), bytes = readFileSync(absolute), after = lstatSync(absolute);
    requireThat(before.size === after.size && before.mtimeMs === after.mtimeMs && before.ino === after.ino, 'source changed during observation');
    observed.set(`${id}:${file}`, { repository_id: id, path: file, sha256: hash(bytes), bytes });
    return bytes;
  };
  const inventory = (id, feature) => {
    const files = [];
    const walk = file => {
      const absolute = contained(id, file, true);
      for (const name of readdirSync(absolute).sort()) {
        const member = `${file}/${name}`, stat = lstatSync(path.join(absolute, name));
        requireThat(!stat.isSymbolicLink(), `unproven symlink containment: ${member}`);
        if (stat.isDirectory()) { walk(member); continue; }
        contained(id, member);
        const classified = classifyDesignArtifactPath(member);
        if (classified.ok && classified.feature === feature) files.push(member);
        else if (member.split('/').includes(feature) || path.basename(member).split('.')[0] === feature) requireThat(classified.ok && classified.kind === 'diagnostic', `invalid feature artifact path: ${member}`);
      }
    };
    walk('.sdcorejs/design'); return files.sort();
  };
  const finish = () => {
    for (const [id, repo] of roots) {
      requireThat(realpathSync.native(repo.root) === repo.root && realpathSync.native(git(repo.root, ['rev-parse', '--show-toplevel'])) === repo.root && git(repo.root, ['rev-parse', 'HEAD']) === repo.revision && stableRepositoryId({ remote_url: git(repo.root, ['remote', 'get-url', 'origin']) }) === id, 'repository identity changed during verification');
    }
    for (const file of observed.values()) requireThat(hash(readFileSync(contained(file.repository_id, file.path))) === file.sha256, 'content changed during verification');
  };
  return { repository, contained, read, inventory, finish, observed };
}

function artifactLoader(options, io) {
  const cache = new Map(), active = new Set();
  const references = [...(options.artifact_references ?? []), ...Object.values(options.expected ?? {}).filter(value => value?.artifact_id)];
  const load = reference => {
    requireThat(reference && safeDesignPath(reference.repository_relative_path), 'approved artifact source path is unavailable');
    const repo = io.repository(reference.repository_id);
    const artifact = (options.parse_artifact ?? JSON.parse)(io.read(reference.repository_id, reference.repository_relative_path).toString('utf8'));
    verifyApprovedArtifact(artifact);
    const m = artifact.metadata;
    requireThat(m.owner_repository_id === reference.repository_id && m.owner_repository_role === repo.role && m.owner_module_id === (repo.module_id ?? null), 'approved artifact repository ownership mismatch');
    requireThat(m.repository_relative_path === reference.repository_relative_path && m.artifact_id === reference.artifact_id && m.artifact_kind === reference.artifact_kind && m.source_revision === reference.revision && m.approval_hash === reference.approval_hash, 'approved artifact identity mismatch');
    requireThat(m.source_revision === repo.revision, 'stale approved artifact source revision');
    requireThat(['contract_id', 'requirement_id', 'change_ref'].every(field => m[field] === options.expected?.[field]), 'approved artifact belongs to a different change');
    if (['spec', 'plan', 'architecture'].includes(m.artifact_kind)) {
      const prefix = m.artifact_kind === 'architecture' ? '.sdcorejs/architecture/' : `.sdcorejs/${m.artifact_kind}s/`;
      requireThat(reference.repository_relative_path.startsWith(prefix) && /^[a-z0-9-]+\/[a-z0-9-]+\.md$/u.test(reference.repository_relative_path.slice(prefix.length)), 'noncanonical approved parent path');
    }
    return artifact;
  };
  const graph = reference => {
    const id = key(reference);
    if (cache.has(id)) {
      const artifact = cache.get(id);
      requireThat(artifact.metadata.approval_hash === reference.approval_hash && artifact.metadata.source_revision === reference.revision && artifact.metadata.artifact_kind === reference.artifact_kind, 'conflicting parent references');
      return artifact;
    }
    requireThat(!active.has(id) && active.size < 32, 'cyclic or excessive parent graph'); active.add(id);
    const artifact = load(reference);
    const parents = artifact.metadata.parent_references.map(ref => {
      const source = references.filter(candidate => sameReference(candidate, ref));
      requireThat(source.length > 0 && new Set(source.map(r => r.repository_relative_path)).size === 1, 'parent source is missing or ambiguous');
      return graph(source[0]);
    });
    verifyApprovedArtifactGraph(artifact, parents);
    active.delete(id); cache.set(id, artifact); return artifact;
  };
  return { load, graph, cache };
}

export function readDesignRequirements(artifact) {
  try {
    const body = JSON.parse(artifact.body);
    return body.design_requirements ?? null;
  } catch {
    const block = artifact?.body?.match(/```design-requirements\s*\n([\s\S]*?)\n```/u);
    if (block) return JSON.parse(block[1]);
    return null;
  }
}

// Read actual pinned parent sources without requiring a completed Design.
// Candidate assessment uses this path; implementation still uses the full
// verifyDesignHandoff approval/evidence gate below.
export function readVerifiedDesignSources(runtime) {
  const options = runtimes.get(runtime);
  requireThat(options, 'trusted artifact source runtime is unavailable');
  const io = observer(options), loader = artifactLoader(options, io);
  requireThat(options.expected?.spec?.artifact_kind === 'spec', 'expected spec source is required');
  const spec = loader.graph(options.expected.spec);
  const plan = options.expected.plan ? loader.graph(options.expected.plan) : null;
  if (plan) {
    const descends = artifact => artifact.metadata.parent_references.some(ref =>
      sameReference(ref, options.expected.spec) || descends(loader.cache.get(key(ref))));
    requireThat(descends(plan), 'plan does not descend from expected spec');
  }
  const pinned = [...Object.values(options.expected).filter(v => v?.artifact_id), ...(options.artifact_references ?? [])];
  const load = reference => {
    requireThat(pinned.some(pin => sameReference(pin, reference) && pin.repository_relative_path === reference.repository_relative_path), 'artifact was not pinned by host');
    return loader.graph(reference);
  };
  io.finish();
  return { spec, plan, expected: structuredClone(options.expected), load,
    read: io.read, repository: io.repository, finish: io.finish };
}

function verifyParents(options, io, loader) {
  const expected = options.expected;
  requireThat(['contract_id', 'requirement_id', 'change_ref'].every(field => nonempty(expected?.[field])), 'expected change identity is unavailable');
  requireThat(expected.spec?.artifact_kind === 'spec' && expected.plan?.artifact_kind === 'plan', 'expected spec/plan identities are required');
  const spec = loader.graph(expected.spec), plan = loader.graph(expected.plan);
  // A plan must descend from this spec (possibly through architecture), not just
  // coexist with an unrelated, individually valid approved spec.
  const descends = artifact => artifact.metadata.parent_references.some(ref => sameReference(ref, expected.spec) || descends(loader.cache.get(key(ref))));
  requireThat(descends(plan), 'approved plan does not descend from expected spec');
  const requirements = readDesignRequirements(spec);
  requireThat(requirements && typeof requirements.required === 'boolean', 'approved Design applicability is unavailable');
  const planned = readDesignRequirements(plan);
  requireThat(!planned || isDeepStrictEqual(planned, requirements), 'plan changes approved Design requirements');
  const owner = requirements.owner, repo = io.repository(owner?.repository_id);
  requireThat(isDeepStrictEqual({ repository_id: repo.repository_id, role: repo.role, module_id: repo.module_id ?? null }, owner), 'approved semantic owner disagrees with topology');
  requireThat(repo.writable === true, 'semantic owner is unwritable; fallback is forbidden');
  if (!requirements.required) { requireThat(nonempty(requirements.reason), 'non-Design applicability requires an approved reason'); return requirements; }
  requireThat(Array.isArray(requirements.surfaces) && new Set(requirements.surfaces.map(s => s.id)).size === requirements.surfaces.length, 'approved surface applicability is unavailable');
  for (const surface of requirements.surfaces) {
    requireThat(nonempty(surface.id) && ['required', 'rendered_required', 'interaction_required'].every(field => typeof surface[field] === 'boolean'), 'invalid approved surface requirements');
    requireThat(surface.required || nonempty(surface.reason) && !surface.rendered_required && !surface.interaction_required, 'invalid approved not-applicable surface');
  }
  return requirements;
}

function materialProjection(handoff) {
  const copy = structuredClone(handoff);
  delete copy.metadata.artifact_hash;
  for (const asset of [...copy.documents, copy.editable_source, ...copy.editable_sources, ...copy.static_exports, ...copy.product_screenshots]) {
    delete asset.sha256; delete asset.source_editable_sha256; delete asset.evidence_ref;
  }
  for (const surface of copy.responsive.surfaces) { delete surface.rendered_evidence; delete surface.interaction_evidence; }
  return copy;
}

export function verifyDesignHandoff(input, { runtime } = {}) {
  const structural = validateDesignHandoff(input);
  const result = { verified: false, status: 'BLOCKED', layers: { structural: structural.ok ? 'PASS' : 'FAIL', parents: 'NOT RUN', approval: 'NOT RUN', evidence: 'NOT RUN' }, blockers: structural.errors.map(e => e.code) };
  let layer = 'parents';
  try {
    requireThat(structural.ok && input.metadata.schema_version === 2, 'verified handoff requires canonical schema 2; legacy remains unverified');
    const options = runtimes.get(runtime);
    requireThat(options, 'trusted Design verification runtime is unavailable');
    const io = observer(options), loader = artifactLoader(options, io);
    const requirements = verifyParents(options, io, loader), h = structural.handoff, m = h.metadata;
    requireThat(requirements.required, 'approved requirements do not authorize this Design handoff');
    requireThat(['contract_id', 'requirement_id', 'change_ref'].every(field => m[field] === options.expected[field]) && isDeepStrictEqual(identity(m), requirements.owner) && m.feature === requirements.feature && m.experience_kind === requirements.experience_kind, 'handoff exceeds approved requirements/owner');
    requireThat(m.source_revision === io.repository(m.owner_repository_id).revision, 'stale Design source revision');
    requireThat(h.metadata.parent_references.length === 2 && [options.expected.spec, options.expected.plan].every(ref => h.metadata.parent_references.some(parent => sameReference(parent, ref))), 'handoff parent identity differs from expected approvals');
    result.layers.parents = 'PASS'; layer = 'approval';
    requireThat(h.lifecycle.state === 'reviewed', 'exploratory draft cannot authorize implementation');
    requireThat(options.expected.design?.artifact_kind === 'design-handoff' && options.expected.design.repository_id === m.owner_repository_id && options.expected.design.repository_relative_path === m.repository_relative_path, 'Design review/approval source is unavailable');
    const approval = loader.graph(options.expected.design);
    requireThat([options.expected.spec, options.expected.plan].every(ref => approval.metadata.parent_references.some(parent => sameReference(parent, ref))), 'Design approval has unrelated parents');
    const approved = JSON.parse(approval.body);
    requireThat(validateDesignHandoff(approved).ok && approved.metadata.schema_version === 2, 'Design approval contains no canonical handoff');
    const stripHash = value => { const copy = structuredClone(value); delete copy.metadata.artifact_hash; return copy; };
    let reviewNeeded = !isDeepStrictEqual(stripHash(approved), stripHash(h));
    if (reviewNeeded) requireThat(isDeepStrictEqual(materialProjection(approved), materialProjection(h)) && typeof options.review_changes === 'function', 'material Design change requires its decision/approval owner');
    result.layers.approval = reviewNeeded ? 'NOT RUN' : 'PASS'; layer = 'evidence';
    const owner = m.owner_repository_id;
    const editables = [h.editable_source, ...h.editable_sources];
    const assets = [...h.documents, ...editables, ...h.static_exports, ...h.product_screenshots];
    requireThat(new Set(assets.map(a => a.path)).size === assets.length, 'duplicate editable or asset source');
    for (const asset of assets) requireThat(hash(io.read(owner, asset.path)) === asset.sha256, `stale Design content: ${asset.path}`);
    const inventory = io.inventory(owner, m.feature);
    requireThat(isDeepStrictEqual(inventory, assets.map(a => a.path).sort()), 'Design artifact closure omits or invents a feature asset');
    const source = reference => {
      requireThat(reference && nonempty(reference.sha256), 'source fingerprint is unavailable');
      requireThat(io.repository(reference.repository_id).revision === reference.revision, 'stale component/source revision');
      requireThat(hash(io.read(reference.repository_id, reference.path)) === reference.sha256, 'stale component/source content');
    };
    requireThat(h.design_system_reuse.inspected === true && h.design_system_reuse.evidence_refs.length > 0, 'existing design inspection requires observed source');
    h.design_system_reuse.evidence_refs.forEach(source);
    h.component_mapping.filter(c => c.status === 'confirmed').forEach(c => c.evidence_refs.forEach(source));
    const receipt = (ref, kind, surface, requiredPaths) => {
      const pins = (options.evidence ?? []).filter(pin => pin.artifact_ref === ref?.artifact_ref && pin.approval_hash === ref?.approval_hash);
      requireThat(pins.length === 1, 'evidence was not observed/pinned by the host runner');
      const [pin] = pins;
      const artifact = (options.parse_artifact ?? JSON.parse)(io.read(pin.repository_id, pin.artifact_ref).toString('utf8'));
      const errors = [], resolved = resolveEvidenceArtifact(ref, [artifact], 'design-command-receipt:v2', errors, 'Design evidence');
      requireThat(resolved, errors.join('; '));
      const b = resolved.body, a = artifact.metadata;
      requireThat(a.owner_repository_id === owner && pin.repository_id === owner && a.change_ref === m.change_ref && a.source_revision === m.source_revision, 'foreign/stale evidence identity');
      requireThat(nonempty(b.command) && b.cwd === '.' && b.owner_repository_id === owner && b.exit_code === 0 && b.kind === kind && b.surface_id === surface, 'evidence command/provenance does not match check');
      requireThat(Array.isArray(b.scope) && b.scope.length > 0 && new Set(b.scope).size === b.scope.length && requiredPaths.every(file => b.scope.includes(file)) && isDeepStrictEqual(Object.keys(b.fingerprints ?? {}).sort(), [...b.scope].sort()), 'evidence scope/fingerprints are incomplete');
      for (const file of b.scope) requireThat(hash(io.read(owner, file)) === b.fingerprints[file], 'evidence is stale at the same HEAD');
      return b;
    };
    requireThat(h.responsive.surfaces.length === requirements.surfaces.length, 'surface applicability differs from approved requirements');
    for (const required of requirements.surfaces) {
      const s = h.responsive.surfaces.find(value => value.id === required.id);
      requireThat(s && s.applicability === (required.required ? 'required' : 'not-applicable'), 'required responsive surface is absent or waived');
      if (!required.required) { requireThat(nonempty(s.reason), 'not-applicable surface requires a reason'); continue; }
      const sourcePaths = required.source_paths ?? editables.map(source => source.path);
      requireThat(Array.isArray(sourcePaths) && sourcePaths.length > 0 && sourcePaths.every(file => editables.some(source => source.path === file)), 'approved surface source is absent from editable closure');
      if (required.rendered_required || s.rendered_evidence) receipt(s.rendered_evidence, 'rendered-wireframe', s.id, sourcePaths);
      if (required.interaction_required || s.interaction_evidence) receipt(s.interaction_evidence, 'interaction', s.id, sourcePaths);
    }
    for (const screenshot of h.product_screenshots) {
      const appSources = requirements.surfaces.find(surface => surface.id === screenshot.surface_id)?.app_source_paths;
      requireThat(Array.isArray(appSources) && appSources.length > 0 && appSources.every(file => safeDesignPath(file) && !assets.some(asset => asset.path === file)), 'real product capture requires approved app source scope');
      const body = receipt(screenshot.evidence_ref, 'real-product-screenshot', screenshot.surface_id, [screenshot.path, ...appSources]);
      requireThat(body.app_revision === m.source_revision && nonempty(body.capture?.url) && !Number.isNaN(Date.parse(body.capture?.captured_at)), 'real product capture provenance is missing');
    }
    const modules = new Set(), repositories = new Set();
    for (const reference of h.cross_repository_references) {
      requireThat(m.experience_kind === 'cross-module' && reference.editable === false && reference.artifact_kind === 'design-handoff', 'invalid cross-module reference');
      const repo = io.repository(reference.repository_id), classified = classifyDesignArtifactPath(reference.repository_relative_path);
      requireThat(repo.role === 'module' && repo.module_id === reference.module_id && reference.repository_id !== owner && classified.ok && classified.kind === 'design-handoff', 'cross-module reference is not an actual module source');
      requireThat(!modules.has(reference.module_id) && !repositories.has(reference.repository_id), 'cross-module sources must be distinct modules and repositories');
      modules.add(reference.module_id); repositories.add(reference.repository_id);
      // Cross-module artifacts may have their own change/contract. Each source
      // supplies host-pinned authority and its own verified runtime, never a
      // caller's serialized PASS. Recursion is forbidden at this boundary.
      const childRuntime = options.module_runtimes?.[reference.repository_id];
      const childOptions = runtimes.get(childRuntime);
      requireThat(childOptions && sameReference(reference, childOptions.expected?.design), 'module source revision/provenance is unavailable');
      const childBytes = io.read(reference.repository_id, reference.repository_relative_path);
      const child = (options.parse_artifact ?? JSON.parse)(childBytes.toString('utf8'));
      const payload = JSON.parse(child.body);
      requireThat(payload.metadata.experience_kind === 'module' && payload.cross_repository_references?.length === 0, 'recursive cross-module Design is forbidden');
      requireThat(verifyDesignHandoff(payload, { runtime: childRuntime }).verified, 'module Design source is unverified or stale');
    }
    requireThat(m.experience_kind !== 'cross-module' || modules.size >= 2, 'cross-module design requires distinct module sources');
    if (reviewNeeded) {
      layer = 'approval';
      const files = [...io.observed.values()].map(file => ({ ...file, bytes: Buffer.from(file.bytes) }));
      const review = options.review_changes({ approved_handoff: structuredClone(approved), current_handoff: structuredClone(h), files });
      const fingerprints = Object.fromEntries(files.map(file => [`${file.repository_id}:${file.path}`, file.sha256]));
      requireThat(review?.within_approved_scope === true && isDeepStrictEqual(review.fingerprints, fingerprints), 'bounded review did not attest current content within approved scope');
      result.layers.approval = 'PASS';
    }
    layer = 'evidence'; io.finish();
    requireThat(isDeepStrictEqual(io.inventory(owner, m.feature), inventory), 'Design closure changed during verification');
    result.artifact_context = buildDesignArtifactContext({ feature: m.feature, change_ref: m.change_ref, source_spec: options.expected.spec.repository_relative_path, source_plan: options.expected.plan.repository_relative_path, editable_sources: editables.map(a => a.path), static_exports: h.static_exports.map(a => a.path), product_screenshots: h.product_screenshots.map(a => a.path) });
    result.fingerprints = Object.fromEntries([...io.observed].map(([id, file]) => [id, file.sha256]));
    result.owner = identity(m);
    result.layers.evidence = 'PASS'; result.status = 'PASS'; result.verified = true;
  } catch (error) {
    result.layers[layer] = 'FAIL';
    result.blockers.push(error?.message ?? String(error));
  }
  return result;
}

/** Real consumers call this on each use; a portable result is not authority. */
export function evaluateDesignExecution(handoff, { runtime, owner_repository_id, owner_repository_role, owner_module_id, expected_spec_hash, expected_plan_hash } = {}) {
  const options = runtimes.get(runtime);
  if (!options) return { verified: false, status: 'BLOCKED', blockers: ['trusted Design applicability/runtime is unavailable'] };
  try {
    if (expected_spec_hash) requireThat(options.expected?.spec?.approval_hash === expected_spec_hash && options.expected?.plan?.approval_hash === expected_plan_hash, 'Design runtime does not match execution approvals');
    const io = observer(options), requirements = verifyParents(options, io, artifactLoader(options, io));
    requireThat(!owner_repository_id || requirements.owner.repository_id === owner_repository_id, 'Design semantic owner differs from execution owner');
    requireThat(!owner_repository_role || requirements.owner.role === owner_repository_role, 'Design owner role differs from execution owner');
    requireThat(owner_module_id === undefined || requirements.owner.module_id === owner_module_id, 'Design module differs from execution owner');
    if (!requirements.required) { requireThat(!handoff, 'unexpected Design payload for non-Design scope'); io.finish(); return { verified: true, status: 'NOT APPLICABLE', blockers: [] }; }
    return verifyDesignHandoff(handoff, { runtime });
  } catch (error) { return { verified: false, status: 'BLOCKED', blockers: [error.message] }; }
}
