import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { assembleProjectContext } from '../../../packs/p17/_refs/shared/project-context.mjs';
import { resolveExploreWriteAuthority, validateExploreClassification } from '../../../packs/p17/_refs/shared/explore-contract.mjs';

const root = path.resolve(import.meta.dirname, '../target');
const lesson = '.sdcorejs/memories/node/normalization-category-null-input.md';
const oldMemory = '.sdcorejs/memories/workflow/old-payment-advice.md';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hashFile = async p => sha(await readFile(path.join(root, p)));
const request = {
  root,
  requestScope: 'normalizeCategory category normalization null undefined trim lowercase',
  tracks: ['node'],
  stackProfiles: ['node-general'],
  explicitFiles: ['src/category.mjs', 'test/category.test.mjs', 'inputs/fix.diff'],
  writesAllowed: false,
};
const authority = resolveExploreWriteAuthority({
  action: 'memories-write-approved',
  explicit_authority: true,
  worker_role: 'sequential-owner',
});
assert.equal(authority.write_allowed, true);
assert.deepEqual(validateExploreClassification({ tracks: request.tracks, stack_profiles: request.stackProfiles }), []);
const context = await assembleProjectContext(request);
assert.equal(context.project_context.target_root_kind, 'target-project');
assert(!context.project_context.related_artifacts.memories.includes(oldMemory));

if (process.argv.includes('--preflight')) {
  assert.deepEqual(context.project_context.related_artifacts.memories, []);
  console.log(JSON.stringify({
    phase: 'preflight',
    authority,
    authority_source: 'Explicit user scope: remember the verified normalization lesson; minimal AGENTS pointer allowed; no application changes or new team rules.',
    role: 'sequential owner of the isolated consuming target',
    project_context: context.project_context,
    duplicate_search: 'No normalization-related memory selected; old payment filename unrelated and legacy metadata absent.',
  }, null, 2));
} else {
  assert(context.project_context.related_artifacts.memories.includes(lesson));
  const text = await readFile(path.join(root, lesson), 'utf8');
  assert(text.startsWith('---\n'));
  const metadata = Object.fromEntries(text.split('---', 3)[1].split('\n').flatMap(line => {
    const match = line.match(/^([a-z_]+): (.*)$/);
    return match ? [[match[1], match[2]]] : [];
  }));
  const fields = [
    ['source_path', 'source_fingerprint'],
    ['proof_path', 'proof_fingerprint'],
    ['diff_path', 'diff_fingerprint'],
    ['config_path', 'config_fingerprint'],
  ];
  const current = Object.fromEntries(await Promise.all(fields.map(async ([key]) => [metadata[key], await hashFile(metadata[key])])));
  const evidenceGate = candidate => {
    const mismatches = fields.flatMap(([pathKey, hashKey]) => {
      const observed = 'sha256:' + current[candidate[pathKey]];
      return observed === candidate[hashKey] ? [] : [{ path: candidate[pathKey], expected: candidate[hashKey], observed }];
    });
    return { status: mismatches.length ? 'stale' : 'current-at-capture', advisory_only: true, current_verification_requires_rerun: true, mismatches };
  };
  const fresh = evidenceGate(metadata);
  assert.equal(fresh.status, 'current-at-capture');
  const runs = JSON.parse(await readFile(path.join(import.meta.dirname, 'test-runs.json'), 'utf8'));
  const run = runs.find(x => x.command.join(' ') === 'node --test test/category.test.mjs');
  assert.equal(run.exit_code, 0);
  const outputHash = sha(await readFile(path.join(import.meta.dirname, run.output_path)));
  assert.equal(metadata.proof_output_fingerprint, 'sha256:' + outputHash);
  const diff = await readFile(path.join(root, 'inputs/fix.diff'), 'utf8');
  const preFixSource = diff.split('\n').find(line => line.startsWith('-export ')).slice(1) + '\n';
  const staleSource = evidenceGate({ ...metadata, source_fingerprint: 'sha256:' + sha(preFixSource) });
  assert.equal(staleSource.status, 'stale');
  const proofBytes = await readFile(path.join(root, metadata.proof_path));
  const simulatedChangedProofHash = sha(Buffer.concat([proofBytes, Buffer.from('\n// simulated changed proof; never written to target\n')]));
  const staleProof = evidenceGate({ ...metadata, proof_fingerprint: 'sha256:' + simulatedChangedProofHash });
  assert.equal(staleProof.status, 'stale');
  const byRelationship = await assembleProjectContext({ ...request, requestScope: 'extend normalizer', changeRef: metadata.change_ref });
  assert.deepEqual(byRelationship.project_context.related_artifacts.memories, [lesson]);
  const unrelated = await assembleProjectContext({ ...request, requestScope: 'invoice tax calculation', explicitFiles: [] });
  assert(!unrelated.project_context.related_artifacts.memories.includes(lesson));
  const empty = await assembleProjectContext({ ...request, requestScope: '', explicitFiles: [] });
  assert.deepEqual(empty.project_context.related_artifacts.memories, []);
  const baseline = JSON.parse(await readFile(path.join(import.meta.dirname, 'baseline.json'), 'utf8'));
  assert.equal(await hashFile(oldMemory), baseline[oldMemory]);
  console.log(JSON.stringify({
    phase: 'retrieval-and-freshness-demonstration',
    request: request.requestScope,
    selected_by_explore: context.project_context.related_artifacts.memories,
    relationship_query_selected: byRelationship.project_context.related_artifacts.memories,
    selected_after_evidence_gate: fresh.status === 'current-at-capture' ? [lesson] : [],
    current_fingerprints: current,
    freshness: fresh,
    proof_output_fingerprint_verified: 'sha256:' + outputHash,
    stale_source_control: { simulated: true, origin: 'Pre-fix source bytes from actual inputs/fix.diff; candidate metadata changed in memory only', selected_after_gate: [], ...staleSource },
    stale_proof_control: { simulated: true, origin: 'Synthetic changed regression file fingerprint in memory only', selected_after_gate: [], ...staleProof },
    unrelated_task_selected: unrelated.project_context.related_artifacts.memories,
    empty_scope_selected: empty.project_context.related_artifacts.memories,
    old_memory: { path: oldMemory, result: 'excluded: unrelated filename; no relationship metadata; body not consumed as advice', unchanged_sha256: baseline[oldMemory], promoted: false },
    limitation: 'Explore performs advisory relationship/scope retrieval, not freshness enforcement. The explicit fingerprint gate shown here supplements retrieval; future passing claims require rerunning the regression command.',
  }, null, 2));
}

