import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { access, lstat, readFile, readdir, readlink, realpath } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import { validateProductOrchestration } from '../product/product-protocol.mjs';
import {
  hashApprovedSnapshot,
  validateApprovedPlanIntegrity
} from '../shared/approved-plan-integrity.mjs';

const WRITE_RESULT_TYPES = new Set(['commit', 'patch', 'working-tree-diff']);
const SENSITIVE_WRITE_CAPABILITIES = new Set(['environment-file', 'package-manifest', 'lockfile', 'migration']);
const SHA256_PATTERN = /^[a-f0-9]{64}$/i;
const execFileAsync = promisify(execFile);
const ISSUED_APPROVED_OWNERSHIP_AUTHORITIES = new WeakMap();
const CONSUMABLE_APPROVED_OWNERSHIP_AUTHORITIES = new WeakMap();
const ISSUED_READ_ONLY_PROOFS = new WeakMap();
const CONSUMABLE_READ_ONLY_PROOFS = new WeakMap();
const ISSUED_INTEGRATION_DECISION_AUTHORITIES = new WeakMap();
const ISSUED_FAN_IN_AUTHORITIES = new WeakMap();
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export async function verifyApprovedOwnershipAuthority(input = {}) {
  const errors = [];
  if (!isRecord(input)) {
    return frozenAuthorityResult(['approved ownership authority input must be an object']);
  }
  const { contract, units, planContext } = input;
  const repositoryRoot = typeof input.repositoryRoot === 'string' && path.isAbsolute(input.repositoryRoot)
    ? path.resolve(input.repositoryRoot)
    : null;
  if (!repositoryRoot) errors.push('approved ownership authority requires an absolute repositoryRoot');
  if (!isRecord(contract)) errors.push('approved ownership authority requires an approved-plan contract object');
  else errors.push(...validateContract(contract, { writeCapable: true }));
  if (!Array.isArray(units)) errors.push('approved ownership authority requires a units array');
  if (!isRecord(planContext)) errors.push('approved ownership authority requires planContext from approved-plan integrity preflight');

  let ownershipManifestDigest = null;
  if (Array.isArray(units)) {
    const unitIds = units.map((unit) => isRecord(unit) ? unit.id : null);
    if (unitIds.some((id) => typeof id !== 'string' || !id.trim())) errors.push('approved ownership authority units require non-empty string IDs');
    if (new Set(unitIds).size !== unitIds.length) errors.push('approved ownership authority rejects duplicate unit IDs');
    try { ownershipManifestDigest = createOwnershipManifestDigest(units); }
    catch (error) { errors.push(`approved ownership authority unit manifest is invalid: ${error.message}`); }
  }
  if (ownershipManifestDigest && contract?.ownership_manifest_digest !== ownershipManifestDigest) {
    errors.push('approved ownership authority live unit manifest does not match contract ownership_manifest_digest');
  }

  const approvedSpecPath = safeRelativeArtifactPath(input.approvedSpecPath, '.sdcorejs/specs/', '.md', 'approved spec', errors);
  const approvedPlanPath = safeRelativeArtifactPath(contract?.approved_plan_path, '.sdcorejs/plans/', '.md', 'approved plan', errors);
  const frozenContractPath = safeRelativeArtifactPath(contract?.frozen_contract_path, '.sdcorejs/plans/', '.parallel.json', 'frozen parallel contract', errors);
  let specText = null;
  let planText = null;
  let frozenText = null;
  let frozenBytes = null;
  let canonicalRepositoryRoot = null;
  let repositoryIdentity = null;
  if (repositoryRoot && approvedSpecPath && approvedPlanPath && frozenContractPath) {
    const repositoryAlias = await firstSymbolicLinkComponent(repositoryRoot).catch((error) => {
      errors.push(`approved ownership authority cannot inspect repositoryRoot path components: ${error.message}`);
      return null;
    });
    if (repositoryAlias) {
      errors.push(`approved ownership authority repositoryRoot must not contain a symlink or junction component: ${repositoryAlias}`);
    }
    const rootReal = await realpath(repositoryRoot).catch((error) => {
      errors.push(`approved ownership authority cannot resolve repositoryRoot: ${error.message}`);
      return null;
    });
    if (rootReal) {
      canonicalRepositoryRoot = rootReal;
      repositoryIdentity = await captureCanonicalRepositoryIdentity(rootReal).catch((error) => {
        errors.push(`approved ownership authority cannot establish canonical repository identity: ${error.message}`);
        return null;
      });
      const [specFile, planFile, frozenFile] = await Promise.all([
        readImmutableAuthorityFile(rootReal, approvedSpecPath, 'approved spec', errors),
        readImmutableAuthorityFile(rootReal, approvedPlanPath, 'approved plan', errors),
        readImmutableAuthorityFile(rootReal, frozenContractPath, 'frozen parallel contract', errors)
      ]);
      specText = specFile?.text ?? null;
      planText = planFile?.text ?? null;
      frozenText = frozenFile?.text ?? null;
      frozenBytes = frozenFile?.bytes ?? null;
    }
  }

  if (canonicalRepositoryRoot && isRecord(planContext)) {
    const targetRoot = typeof planContext.target_root === 'string' && path.isAbsolute(planContext.target_root)
      ? path.resolve(planContext.target_root)
      : null;
    if (!targetRoot) {
      errors.push('approved ownership authority planContext.target_root must be an absolute path so approval chains remain repository-bound');
    } else {
      if (!absolutePathsEqual(targetRoot, repositoryRoot)) {
        errors.push('approved ownership authority planContext.target_root normalized absolute identity must match repositoryRoot; aliases cannot redirect an approval chain');
      }
      const targetAlias = await firstSymbolicLinkComponent(targetRoot).catch((error) => {
        errors.push(`approved ownership authority cannot inspect planContext.target_root path components: ${error.message}`);
        return null;
      });
      if (targetAlias) {
        errors.push(`approved ownership authority planContext.target_root must not contain a symlink or junction component: ${targetAlias}`);
      }
      const canonicalTargetRoot = await realpath(targetRoot).catch((error) => {
        errors.push(`approved ownership authority cannot resolve planContext.target_root: ${error.message}`);
        return null;
      });
      if (canonicalTargetRoot && !absolutePathsEqual(canonicalTargetRoot, canonicalRepositoryRoot)) {
        errors.push('approved ownership authority planContext.target_root canonical realpath must match repositoryRoot; copied approval chains cannot be reissued in another repository');
      }
    }
  }

  if (specText !== null && planText !== null && isRecord(planContext)) {
    errors.push(...validateApprovedPlanIntegrity({
      specText,
      planText,
      specPath: approvedSpecPath,
      planPath: approvedPlanPath,
      planContext
    }).map((error) => `approved-plan integrity: ${error}`));
    try {
      const actualPlanHash = hashApprovedSnapshot(planText, 'approved_plan_hash');
      if (contract.approved_plan_hash !== actualPlanHash) {
        errors.push('approved ownership authority contract approved_plan_hash does not match the file-backed approved plan');
      }
    } catch (error) {
      errors.push(`approved ownership authority approved plan hash failed: ${error.message}`);
    }
    const anchored = parseEmbeddedPlanContext(planText, errors);
    if (anchored) {
      for (const [field, expected] of [
        ['contract_id', contract.contract_id],
        ['frozen_contract_path', contract.frozen_contract_path],
        ['frozen_contract_hash', contract.frozen_contract_hash],
        ['ownership_manifest_digest', contract.ownership_manifest_digest],
        ['parallel_contract_revision', contract.revision],
        ['parallel_contract_supersedes', contract.supersedes]
      ]) {
        if (anchored[field] !== expected) errors.push(`approved plan body plan_context ${field} must match the parallel contract`);
      }
    }
  }

  let frozenContract = null;
  if (frozenText !== null && frozenBytes !== null) {
    const actualFrozenHash = digestBytes(frozenBytes);
    if (contract?.frozen_contract_hash !== actualFrozenHash) {
      errors.push('frozen parallel contract byte hash does not match contract frozen_contract_hash');
    }
    try {
      frozenContract = JSON.parse(frozenText);
    } catch (error) {
      errors.push(`frozen parallel contract must be valid JSON: ${error.message}`);
    }
  }
  if (frozenContract !== null) {
    if (!isRecord(frozenContract)) errors.push('frozen parallel contract must be a JSON object');
    else {
      const allowedTopLevelFields = new Set([
        'schema_version', 'contract_id', 'revision', 'supersedes',
        'ownership_manifest_digest', 'units'
      ]);
      const unknownFields = Object.keys(frozenContract).filter((field) => !allowedTopLevelFields.has(field));
      if (unknownFields.length > 0) errors.push(`frozen parallel contract closed schema rejects unknown fields: ${unknownFields.join(', ')}`);
      if (frozenContract.schema_version !== 2) errors.push('frozen parallel contract schema_version must be 2');
      if (frozenContract.contract_id !== contract?.contract_id) errors.push('frozen parallel contract contract_id mismatch');
      if (frozenContract.revision !== contract?.revision) errors.push('frozen parallel contract revision mismatch');
      if (frozenContract.supersedes !== contract?.supersedes) errors.push('frozen parallel contract supersedes mismatch');
      if (frozenContract.ownership_manifest_digest !== ownershipManifestDigest) errors.push('frozen parallel contract ownership_manifest_digest mismatch');
      if (!Array.isArray(frozenContract.units)) errors.push('frozen parallel contract units must be an array');
      else {
        const frozenUnitIds = frozenContract.units.map((unit) => isRecord(unit) ? unit.id : null);
        if (frozenUnitIds.some((id) => typeof id !== 'string' || !id.trim())) errors.push('frozen parallel contract units require non-empty string IDs');
        if (new Set(frozenUnitIds).size !== frozenUnitIds.length) errors.push('frozen parallel contract rejects duplicate unit IDs');
        try {
          if (createOwnershipManifestDigest(frozenContract.units) !== ownershipManifestDigest) {
            errors.push('frozen parallel contract unit ownership does not match the live normalized unit manifest');
          }
        } catch (error) {
          errors.push(`frozen parallel contract unit ownership is invalid: ${error.message}`);
        }
        if (isRecord(planContext)) {
          errors.push(...validateFrozenOwnershipWithinPlanScope(
            frozenContract.units,
            planContext,
            repositoryIdentity?.case_insensitive ?? process.platform === 'win32'
          ));
        }
      }
    }
  }

  const result = frozenAuthorityResult(errors, {
    repository_root: canonicalRepositoryRoot ?? repositoryRoot,
    contract_id: contract?.contract_id ?? null,
    approved_plan_path: approvedPlanPath,
    approved_plan_hash: contract?.approved_plan_hash ?? null,
    frozen_contract_path: frozenContractPath,
    frozen_contract_hash: contract?.frozen_contract_hash ?? null,
    ownership_manifest_digest: ownershipManifestDigest,
    repository_identity: repositoryIdentity?.digest ?? null,
    repository_case_insensitive: repositoryIdentity?.case_insensitive ?? null,
    revision: contract?.revision ?? null,
    supersedes: contract?.supersedes ?? null
  });
  if (result.verified) {
    ISSUED_APPROVED_OWNERSHIP_AUTHORITIES.set(result, Object.freeze({
      contract_identity: approvedOwnershipContractIdentity(contract),
      ownership_manifest_digest: ownershipManifestDigest,
      repository_root: canonicalRepositoryRoot,
      repository_identity: repositoryIdentity.digest,
      repository_case_insensitive: repositoryIdentity.case_insensitive,
      contract: structuredClone(contract),
      units: structuredClone(units.map((unit) => ({ id: unit.id, ownership: unit.ownership }))),
      approved_spec_path: approvedSpecPath,
      plan_context: structuredClone(planContext),
      ownership_by_unit: new Map(units.map((unit) => [unit.id, structuredClone(unit.ownership)]))
    }));
  }
  return result;
}

async function refreshApprovedOwnershipAuthority(authority, { contract, units, repositoryRoot } = {}) {
  const issuedClaims = ISSUED_APPROVED_OWNERSHIP_AUTHORITIES.get(authority);
  if (!issuedClaims) {
    return { errors: ['trusted file-verified approved ownership authority is required; forged, stale, or already-consumed tokens are rejected'] };
  }
  ISSUED_APPROVED_OWNERSHIP_AUTHORITIES.delete(authority);
  if (!absolutePathsEqual(issuedClaims.repository_root, repositoryRoot)) {
    return { errors: ['approved ownership authority repository binding mismatch; token replay is forbidden'] };
  }
  const liveContract = isRecord(contract) ? contract : issuedClaims.contract;
  const liveUnits = Array.isArray(units) ? units : issuedClaims.units;
  const refreshed = await verifyApprovedOwnershipAuthority({
    repositoryRoot: issuedClaims.repository_root,
    contract: liveContract,
    units: liveUnits,
    approvedSpecPath: issuedClaims.approved_spec_path,
    planContext: issuedClaims.plan_context
  });
  const refreshedClaims = ISSUED_APPROVED_OWNERSHIP_AUTHORITIES.get(refreshed);
  ISSUED_APPROVED_OWNERSHIP_AUTHORITIES.delete(refreshed);
  if (!refreshed.verified || !refreshedClaims) {
    return {
      errors: [
        'approved ownership authority became stale or its file-backed artifacts changed before consumption',
        ...(refreshed.errors ?? [])
      ]
    };
  }
  if (refreshedClaims.repository_identity !== issuedClaims.repository_identity) {
    return { errors: ['approved ownership authority canonical repository identity changed before consumption; target-root replacement or replay is forbidden'] };
  }
  return { errors: [], claims: refreshedClaims };
}

export async function validateDispatchContextWithAuthority(context = {}, options = {}) {
  if (!isRecord(context)) return ['parallel context must be an object'];
  if (context.contract?.source !== 'approved-plan') return validateDispatchContext(context);
  const refreshed = await refreshApprovedOwnershipAuthority(options.approvedOwnershipAuthority, {
    contract: context.contract,
    units: Array.isArray(context.units) ? context.units : [],
    repositoryRoot: context.working_tree?.repo_root
  });
  if (refreshed.errors.length > 0) {
    return [...new Set([...validateDispatchContext(context), ...refreshed.errors])];
  }
  const lease = Object.freeze({});
  CONSUMABLE_APPROVED_OWNERSHIP_AUTHORITIES.set(lease, refreshed.claims);
  const errors = validateDispatchContext(context, { approvedOwnershipAuthority: lease });
  if (errors.length > 0) return errors;
  errors.push(...await validateDispatchWorkspaceRealpaths({
    units: context.units,
    integration: context.integration,
    existingWorktrees: Array.isArray(context.existing_worktrees) ? context.existing_worktrees : []
  }));
  return [...new Set(errors)];
}

export async function observeReadOnlyExecution(input = {}) {
  const errors = [];
  if (!isRecord(input)) {
    const proof = frozenAuthorityResult(['read-only observation input must be an object']);
    return { result: undefined, proof };
  }
  const { contract, unitId, execute } = input;
  errors.push(...validateContract(isRecord(contract) ? contract : {}));
  if (contract?.source !== 'read-only-request') errors.push('parent observation requires a read-only-request contract');
  if (typeof unitId !== 'string' || !unitId.trim()) errors.push('parent observation requires a non-empty unitId');
  if (typeof execute !== 'function') errors.push('parent observation requires an execute callback');
  let repositoryRoot = null;
  if (typeof input.repositoryRoot !== 'string' || !path.isAbsolute(input.repositoryRoot)) {
    errors.push('parent observation requires an absolute repositoryRoot');
  } else {
    repositoryRoot = await realpath(input.repositoryRoot).catch((error) => {
      errors.push(`parent observation cannot resolve repositoryRoot: ${error.message}`);
      return null;
    });
  }
  let beforeSnapshot;
  let afterSnapshot;
  let result;
  if (errors.length === 0) {
    try {
      beforeSnapshot = await captureRepositoryState(repositoryRoot);
      result = await execute();
      afterSnapshot = await captureRepositoryState(repositoryRoot);
    } catch (error) {
      errors.push(`parent-observed read-only execution failed: ${error.message}`);
    }
  }
  if (!beforeSnapshot?.digest) errors.push('internal read-only observation requires a non-empty before repository state');
  if (!afterSnapshot?.digest) errors.push('internal read-only observation requires a non-empty after repository state');
  if (beforeSnapshot?.digest && afterSnapshot?.digest && beforeSnapshot.digest !== afterSnapshot.digest) {
    errors.push('internally observed read-only execution left persistent repository changes');
  }
  if (!isRecord(result)) errors.push('parent-observed read-only result must be an object');
  else {
    if (result.type !== 'report') errors.push('parent-observed read-only result must use type report');
    if (!Array.isArray(result.changed_paths)) errors.push('parent-observed result.changed_paths must be an array');
    else if (result.changed_paths.length > 0) errors.push('parent-observed result must prove zero changed paths');
    if (result.actual_writes !== undefined && (!Array.isArray(result.actual_writes) || result.actual_writes.length > 0)) {
      errors.push('parent-observed result must prove zero actual writes');
    }
  }
  const proof = frozenAuthorityResult(errors, {
    before_state: beforeSnapshot?.digest ?? null,
    after_state: afterSnapshot?.digest ?? null,
    changed_paths: Object.freeze([]),
    actual_writes: Object.freeze([])
  });
  if (proof.verified) {
    ISSUED_READ_ONLY_PROOFS.set(proof, Object.freeze({
      repository_root: repositoryRoot,
      request_hash: contract.request_hash,
      scope_hash: contract.scope_hash,
      unit_id: unitId,
      result_digest: canonicalDigest(result),
      observed_state: afterSnapshot.digest
    }));
  }
  return { result, proof };
}

export async function validateReadOnlyDispatchContext(context = {}, options = {}) {
  if (!isRecord(context)) return ['parallel context must be an object'];
  if (context.contract?.source !== 'read-only-request') return ['read-only dispatch validation requires a read-only-request contract'];
  if (!Array.isArray(context.units)) return ['read-only dispatch units must be an array'];
  const errors = [];
  const canonicalRepositoryRoot = typeof context.working_tree?.repo_root === 'string' && path.isAbsolute(context.working_tree.repo_root)
    ? await realpath(context.working_tree.repo_root).catch((error) => {
      errors.push(`read-only dispatch cannot resolve repository root: ${error.message}`);
      return null;
    })
    : null;
  if (!canonicalRepositoryRoot) errors.push('read-only dispatch requires an absolute canonical repository root');
  const candidates = [];
  for (const [index, unit] of context.units.entries()) {
    if (!isRecord(unit)) {
      errors.push(`read-only unit at index ${index} must be an object`);
      continue;
    }
    const proof = unit.read_only_proof;
    const claims = ISSUED_READ_ONLY_PROOFS.get(proof);
    if (claims) ISSUED_READ_ONLY_PROOFS.delete(proof);
    if (!claims) {
      errors.push(`unit ${unit.id ?? index} requires a trusted one-shot parent-observed read-only proof; reused or consumed proofs are rejected`);
      continue;
    }
    if (!absolutePathsEqual(claims.repository_root, canonicalRepositoryRoot)) errors.push(`unit ${unit.id ?? index} read-only proof repository binding mismatch`);
    if (claims.request_hash !== context.contract.request_hash || claims.scope_hash !== context.contract.scope_hash) {
      errors.push(`unit ${unit.id ?? index} read-only proof request and scope binding mismatch`);
    }
    if (claims.unit_id !== unit.id) errors.push(`unit ${unit.id ?? index} read-only proof unit binding mismatch`);
    if (claims.result_digest !== canonicalDigest(unit.result)) errors.push(`unit ${unit.id ?? index} read-only proof result binding mismatch`);
    let currentSnapshot;
    try {
      currentSnapshot = await captureRepositoryState(canonicalRepositoryRoot);
    } catch (error) {
      errors.push(`unit ${unit.id ?? index} internal current repository state observation failed: ${error.message}`);
    }
    if (!currentSnapshot?.digest) errors.push(`unit ${unit.id ?? index} current repository state must be non-empty`);
    else if (currentSnapshot.digest !== claims.observed_state) errors.push(`unit ${unit.id ?? index} repository state changed after the read-only observation; proof is stale`);
    candidates.push([proof, claims]);
  }
  if (errors.length > 0) return [...new Set(errors)];
  for (const [proof, claims] of candidates) CONSUMABLE_READ_ONLY_PROOFS.set(proof, claims);
  return validateDispatchContext(context);
}

export function createIntegrationDecisionAttestation(input = {}) {
  if (!isRecord(input)) throw new TypeError('integration decision attestation input must be an object');
  return canonicalDigest({
    scheme: 'sha256-canonical-v1',
    approved: input.approved === true,
    contract_identity: input.contract_identity ?? null,
    result_set_identity: input.result_set_identity ?? null,
    integration_identity: input.integration_identity ?? null,
    effective_atomicity: input.effective_atomicity ?? null,
    decision_ref: input.decision_ref ?? null
  });
}

export async function observeIntegrationDecision(input = {}) {
  const errors = [];
  if (!isRecord(input)) return frozenAuthorityResult(['integration decision observation input must be an object']);
  const { contract, units, integration, effectiveAtomicity, decisionRef, observeDecision } = input;
  if (!isRecord(contract)) errors.push('integration decision observation requires the approved-plan contract');
  else errors.push(...validateContract(contract, { writeCapable: true }));
  if (!Array.isArray(units) || units.some((unit) => !isRecord(unit))) {
    errors.push('integration decision observation requires the exact fan-in result set');
  }
  if (!isRecord(integration) || integration.atomicity !== 'user-decision') {
    errors.push('integration decision observation requires a user-decision integration object');
  }
  if (!['all-or-nothing', 'independent-successes'].includes(effectiveAtomicity)) {
    errors.push('integration decision effective atomicity must be all-or-nothing or independent-successes');
  }
  if (typeof decisionRef !== 'string' || !decisionRef.trim()) errors.push('integration decision requires a non-empty durable decision reference');
  if (typeof observeDecision !== 'function') errors.push('integration decision requires a parent observeDecision callback');
  const integrationIdentity = isRecord(integration) ? integrationDecisionIdentity(integration) : null;
  const contractIdentity = isRecord(contract) ? approvedOwnershipContractIdentity(contract) : null;
  const resultSetIdentity = Array.isArray(units) ? fanInResultSetIdentity(units) : null;
  let observed;
  if (errors.length === 0) {
    try {
      observed = await observeDecision({
        attestation_scheme: 'sha256-canonical-v1',
        contract_identity: contractIdentity,
        result_set_identity: resultSetIdentity,
        integration_identity: integrationIdentity,
        effective_atomicity: effectiveAtomicity,
        decision_ref: decisionRef
      });
    } catch (error) {
      errors.push(`parent integration decision observation failed: ${error.message}`);
    }
  }
  const expectedAttestation = isRecord(observed)
    ? createIntegrationDecisionAttestation(observed)
    : null;
  if (
    !isRecord(observed) || observed.approved !== true ||
    observed.attestation_scheme !== 'sha256-canonical-v1' ||
    observed.contract_identity !== contractIdentity ||
    observed.result_set_identity !== resultSetIdentity ||
    observed.integration_identity !== integrationIdentity ||
    observed.effective_atomicity !== effectiveAtomicity ||
    observed.decision_ref !== decisionRef ||
    !SHA256_PATTERN.test(String(observed.decision_attestation ?? '')) ||
    observed.decision_attestation !== expectedAttestation
  ) {
    errors.push('parent integration decision observation must attest the exact approved contract, result set, integration identity, effective atomicity, and decision reference; a raw echo is insufficient');
  }
  const authority = frozenAuthorityResult(errors, {
    effective_atomicity: effectiveAtomicity ?? null,
    decision_ref: decisionRef ?? null,
    decision_attestation: SHA256_PATTERN.test(String(observed?.decision_attestation ?? '')) ? observed.decision_attestation : null
  });
  if (authority.verified) {
    ISSUED_INTEGRATION_DECISION_AUTHORITIES.set(authority, Object.freeze({
      contract_identity: contractIdentity,
      result_set_identity: resultSetIdentity,
      integration_identity: integrationIdentity,
      effective_atomicity: effectiveAtomicity,
      decision_ref: decisionRef,
      decision_attestation: observed.decision_attestation,
      attestation_scheme: 'sha256-canonical-v1'
    }));
  }
  return authority;
}

function validateProductUnitBindings(units, flow) {
  const errors = [];
  if (!Array.isArray(flow.stages)) return ['product_flow stages must be an array'];
  if (!['preflight', 'completed'].includes(flow.validation_phase)) {
    errors.push('product_flow validation_phase must be preflight or completed');
  }
  const completed = flow.validation_phase === 'completed';

  const stages = [];
  for (const [index, stage] of flow.stages.entries()) {
    if (!isRecord(stage)) errors.push(`product_flow stage at index ${index} must be an object`);
    else stages.push(stage);
  }
  if (flow.validation_phase === 'preflight') {
    const stageClaimsCompletion = stages.some((stage) =>
      ['PASS', 'PASSED', 'COMPLETE', 'COMPLETED'].includes(stage.status)
      || Boolean(stage.result_identity || stage.associated_head_or_diff || stage.output_digest || stage.evidence_digest));
    const unitClaimsCompletion = units.some((unit) =>
      unit.status === 'PASSED'
      || Boolean(unit.result?.ref || unit.result?.associated_head_or_diff || unit.result?.output_digest)
      || unit.evidence?.parent_validated === true);
    if (stageClaimsCompletion || unitClaimsCompletion) {
      errors.push('product_flow preflight cannot carry PASS status or completed result/evidence claims');
    }
  }

  const unitById = new Map(units.filter((unit) => unit.id).map((unit) => [unit.id, unit]));
  const stageById = new Map(stages.filter((stage) => stage.id).map((stage) => [stage.id, stage]));
  const unitIds = units.map((unit) => unit.id).filter(Boolean);
  const productStageIds = units.map((unit) => unit.product_stage_id).filter(Boolean);
  const stageUnitIds = stages.map((stage) => stage.unit_id).filter(Boolean);
  if (new Set(unitIds).size !== unitIds.length) errors.push('actual dispatch unit IDs must be unique');
  if (new Set(productStageIds).size !== productStageIds.length) errors.push('actual dispatch units must map to unique product lifecycle stages');
  if (new Set(stageUnitIds).size !== stageUnitIds.length) errors.push('product lifecycle unit_id values must be unique');

  for (const unit of units) {
    const prefix = `unit ${unit.id ?? '<unknown>'}`;
    if (!unit.product_stage_id) {
      errors.push(`${prefix} requires product_stage_id when product_flow is present`);
      continue;
    }
    const stage = stageById.get(unit.product_stage_id);
    if (!stage) errors.push(`${prefix} product_stage_id must name a product lifecycle stage`);
    else if (stage.unit_id !== unit.id) errors.push(`${prefix} product_stage_id requires a bidirectional stage unit_id binding`);
  }

  for (const stage of stages) {
    const label = `${stage.action ?? 'lifecycle'} stage ${stage.id ?? '<unknown>'}`;
    const behaviorStage = ['implementation', 'test-evidence'].includes(stage.action);
    if (behaviorStage && !stage.unit_id) {
      errors.push(`${label} requires unit_id bound to an actual unit`);
      continue;
    }
    if (!stage.unit_id) continue;
    const unit = unitById.get(stage.unit_id);
    if (!unit) errors.push(`${label} unit_id ${stage.unit_id} has no actual unit`);
    else {
      if (unit.product_stage_id !== stage.id) errors.push(`${label} unit_id does not have a bidirectional product_stage_id binding`);
      if (completed && behaviorStage) {
        const result = isRecord(unit.result) ? unit.result : {};
        const evidence = isRecord(unit.evidence) ? unit.evidence : {};
        if (unit.status !== 'PASSED') errors.push(`completed product_flow unit ${unit.id} requires PASSED status`);
        if (!result.ref || !result.associated_head_or_diff || !result.output_digest) {
          errors.push(`completed product_flow stage ${stage.id} requires a non-null result identity and output digest from unit ${unit.id}`);
        }
        if (
          evidence.status !== 'PASS' || evidence.parent_validated !== true || !evidence.output_digest ||
          evidence.associated_head_or_diff !== result.associated_head_or_diff ||
          evidence.result_output_digest !== result.output_digest
        ) {
          errors.push(`completed product_flow unit ${unit.id} requires parent-validated evidence bound to its result identity and output digest`);
        }
        if (
          stage.status !== 'PASS' || stage.result_identity !== result.associated_head_or_diff ||
          stage.output_digest !== result.output_digest || stage.evidence_digest !== evidence.output_digest
        ) {
          errors.push(`completed product_flow stage ${stage.id} status and evidence identity must match unit ${unit.id}`);
        }
      }
    }
  }

  return [...new Set(errors)];
}

export function createOwnershipManifestDigest(units = []) {
  return digest(JSON.stringify(normalizeOwnershipManifest(units)));
}

export function validateContract(contract = {}, { writeCapable = false } = {}) {
  if (!isRecord(contract)) return ['contract must be an object'];
  const errors = [];
  if (!['approved-plan', 'read-only-request'].includes(contract.source)) {
    return ['contract.source must be approved-plan or read-only-request'];
  }
  if (contract.source === 'approved-plan') {
    for (const field of ['contract_id', 'approved_plan_path', 'approved_plan_hash', 'frozen_contract_path', 'frozen_contract_hash', 'ownership_manifest_digest']) {
      if (!contract[field]) errors.push(`approved-plan contract requires ${field}`);
    }
    if (!Number.isInteger(contract.revision) || contract.revision < 1) errors.push('approved-plan contract requires a positive integer revision');
    if (!Object.hasOwn(contract, 'supersedes')) errors.push('approved-plan contract requires supersedes, using null for the first revision');
    for (const forbidden of ['request_hash', 'scope_hash', 'write_policy']) {
      if (Object.hasOwn(contract, forbidden)) errors.push(`approved-plan contract must not define ${forbidden}`);
    }
  } else {
    for (const field of ['request_hash', 'scope_hash']) {
      if (!contract[field]) errors.push(`read-only-request contract requires ${field}`);
    }
    if (contract.write_policy !== 'deny') errors.push('read-only-request write_policy must be deny');
    if (writeCapable) errors.push('write-capable execution requires an approved plan');
    for (const forbidden of ['contract_id', 'approved_plan_path', 'approved_plan_hash', 'frozen_contract_path', 'frozen_contract_hash', 'ownership_manifest_digest', 'revision', 'supersedes']) {
      if (Object.hasOwn(contract, forbidden)) errors.push(`read-only-request must not define ${forbidden}`);
    }
  }
  return errors;
}

export function invalidateForContractRevision(units, { oldHash, newHash, revision }) {
  return units.map((unit) => {
    if (unit.contract_hash !== oldHash) return unit;
    return {
      ...unit,
      status: 'STALE',
      stale_reason: `contract revision ${revision}: ${oldHash} -> ${newHash}`,
      evidence: unit.evidence ? { ...unit.evidence, valid: false, stale_reason: 'contract revision' } : unit.evidence
    };
  });
}

export function validateDispatchContext(context = {}, options = {}) {
  const errors = [];
  if (!isRecord(context)) return ['parallel context must be an object'];
  const contract = isRecord(context.contract) ? context.contract : {};
  if (!isRecord(context.contract)) errors.push('contract must be an object');
  const writeCapable = contract.source === 'approved-plan';
  errors.push(...validateContract(contract, { writeCapable }));
  if (context.schema_version !== 2) errors.push('schema_version must be 2');
  const units = [];
  if (context.units !== undefined && !Array.isArray(context.units)) errors.push('units must be an array');
  for (const [index, unit] of (Array.isArray(context.units) ? context.units : []).entries()) {
    if (!isRecord(unit)) errors.push(`unit at index ${index} must be an object`);
    else units.push(unit);
  }
  if (writeCapable && contract.ownership_manifest_digest) {
    try {
      const actualOwnershipDigest = createOwnershipManifestDigest(units);
      if (actualOwnershipDigest !== contract.ownership_manifest_digest) {
        errors.push('normalized unit ownership manifest digest must match the trusted outer frozen contract');
      }
    } catch (error) {
      errors.push(`normalized unit ownership manifest is invalid: ${error.message}`);
    }
  }
  if (writeCapable) {
    const authorityToken = options?.approvedOwnershipAuthority;
    const authorityClaims = CONSUMABLE_APPROVED_OWNERSHIP_AUTHORITIES.get(authorityToken);
    if (authorityClaims) CONSUMABLE_APPROVED_OWNERSHIP_AUTHORITIES.delete(authorityToken);
    if (!authorityClaims) {
      errors.push('write dispatch requires a fresh one-shot trusted approved ownership authority lease');
    } else {
      let actualOwnershipDigest = null;
      try { actualOwnershipDigest = createOwnershipManifestDigest(units); }
      catch {}
      if (authorityClaims.contract_identity !== approvedOwnershipContractIdentity(contract)) {
        errors.push('trusted approved ownership authority does not match the live parallel contract identity');
      }
      if (authorityClaims.ownership_manifest_digest !== actualOwnershipDigest) {
        errors.push('trusted approved ownership authority does not match the live normalized unit ownership');
      }
      if (!absolutePathsEqual(authorityClaims.repository_root, context.working_tree?.repo_root)) {
        errors.push('trusted approved ownership authority repository does not match working_tree.repo_root; token replay is forbidden');
      }
    }
  }
  if (context.product_flow !== undefined && context.product_flow !== null) {
    const productFlow = isRecord(context.product_flow) ? context.product_flow : null;
    if (!productFlow) {
      errors.push('product_flow must be an object');
    } else if (contract.source !== 'approved-plan') {
      errors.push('product_flow requires an approved-plan outer contract');
    } else {
      if (productFlow.contract_id !== contract.contract_id) errors.push('product_flow contract_id must match the outer approved-plan contract');
      if (productFlow.frozen_contract_hash !== contract.frozen_contract_hash) errors.push('product_flow frozen contract hash must match the outer approved-plan contract');
    }
    if (productFlow) {
      errors.push(...validateProductUnitBindings(units, productFlow));
      try {
        errors.push(...validateProductOrchestration(productFlow, { validationPhase: productFlow.validation_phase }).map((error) => `product_flow: ${error}`));
      } catch {
        errors.push('product_flow: malformed product lifecycle structure');
      }
    }
  }
  if (context.existing_worktrees !== undefined && !Array.isArray(context.existing_worktrees)) {
    errors.push('existing_worktrees must be an array');
  }
  if (writeCapable) {
    if (!context.working_tree) errors.push('write dispatch requires working_tree preflight');
    else {
      for (const field of ['repo_root', 'current_branch', 'current_head', 'status_snapshot_hash', 'dirty_diff_hash']) {
        if (!context.working_tree[field]) errors.push(`working_tree requires ${field}`);
      }
      errors.push(...validateWorkingTree(context.working_tree));
    }
  }
  const runtime = validateRuntimeCapabilities(context.runtime_capabilities, writeCapable);
  if (writeCapable && ['BLOCKED', 'SEQUENTIAL', 'SEQUENTIAL_WAVES'].includes(runtime.mode)) errors.push(`runtime cannot safely parallelize write work: ${runtime.reason}`);
  if (writeCapable) {
    for (const field of ['workspace_path', 'branch', 'base_head', 'merge_strategy', 'merge_order', 'atomicity']) {
      if (context.integration?.[field] === undefined || context.integration?.[field] === null) errors.push(`integration requires ${field}`);
    }
    if (context.integration?.atomicity === 'all-or-nothing' && !context.integration.rollback_strategy) errors.push('integration requires rollback_strategy for all-or-nothing');
    if (context.integration && !['cherry-pick', 'patch', 'disjoint-same-tree'].includes(context.integration.merge_strategy)) errors.push('integration merge_strategy is invalid');
    if (context.integration && !['all-or-nothing', 'independent-successes', 'user-decision'].includes(context.integration.atomicity)) errors.push('integration atomicity is invalid');
    const unitIds = units.map((unit) => unit.id);
    const mergeOrder = Array.isArray(context.integration?.merge_order) ? context.integration.merge_order : [];
    if (context.integration?.merge_order !== undefined && !Array.isArray(context.integration.merge_order)) errors.push('integration merge_order must be an array');
    if (mergeOrder.length !== unitIds.length || new Set(mergeOrder).size !== mergeOrder.length || mergeOrder.some((id) => !unitIds.includes(id))) errors.push('integration merge_order must name every unit exactly once');
  }
  for (const unit of units) {
    const prefix = `unit ${unit.id ?? '<unknown>'}`;
    errors.push(...validateOwnershipShape(unit.ownership, prefix));
    if (writeCapable) {
      if (unit.contract_hash !== contract.frozen_contract_hash) errors.push(`${prefix} contract_hash must match the outer frozen_contract_hash`);
      if (unit.result !== undefined) {
        if (!isRecord(unit.result)) errors.push(`${prefix} result must be an object`);
        else if (unit.result.contract_hash !== contract.frozen_contract_hash) errors.push(`${prefix} result contract_hash must match the outer frozen_contract_hash`);
      }
      if (unit.evidence !== undefined) {
        if (!isRecord(unit.evidence)) errors.push(`${prefix} evidence must be an object`);
        else if (unit.evidence.contract_hash !== contract.frozen_contract_hash) errors.push(`${prefix} evidence contract_hash must match the outer frozen_contract_hash`);
      }
      if (!['disjoint-same-tree', 'worktree'].includes(unit.workspace?.strategy)) errors.push(`${prefix} has invalid workspace strategy`);
      for (const field of ['strategy', 'path', 'base_head']) {
        if (!unit.workspace?.[field]) errors.push(`${prefix} workspace requires ${field}`);
      }
      if (!unit.ownership?.allowed_paths?.length) errors.push(`${prefix} requires allowed_paths`);
      errors.push(...validateSensitiveCapabilityDeclarations(unit.ownership, prefix));
      if (!unit.verification?.command || !unit.verification?.cwd) errors.push(`${prefix} requires verification command and cwd`);
      if (!WRITE_RESULT_TYPES.has(unit.result?.type)) errors.push(`${prefix} requires immutable or exact-diff result protocol`);
      const compatibleResult = { 'cherry-pick': 'commit', patch: 'patch', 'disjoint-same-tree': 'working-tree-diff' }[context.integration?.merge_strategy];
      if (compatibleResult && unit.result?.type !== compatibleResult) errors.push(`${prefix} result type is incompatible with integration merge_strategy`);
      errors.push(...validateWorkspaceAssignment({
        unit,
        integration: context.integration ?? {},
        existingWorktrees: Array.isArray(context.existing_worktrees) ? context.existing_worktrees : []
      }).map((error) => `${prefix}: ${error}`));
      if (unit.workspace?.strategy === 'disjoint-same-tree' && !isDisjointSameTreeSafe(unit)) errors.push(`${prefix} disjoint-same-tree command or resources are unsafe`);
    } else {
      if (unit.workspace?.strategy !== 'shared-readonly') errors.push(`${prefix} read-only workspace must be shared-readonly`);
      if ((unit.ownership?.allowed_paths ?? []).length > 0) errors.push(`${prefix} read-only allowed_paths must be empty`);
      if (unit.result?.type !== 'report') errors.push(`${prefix} read-only result must be report`);
      errors.push(...validateReadOnlyProof(unit, prefix, contract, context.working_tree?.repo_root));
    }
  }
  if (writeCapable) {
    if (context.final_tail?.verify_before_done !== true) errors.push('verify_before_done must be true');
    if (context.final_tail?.branch_ready_final_gate !== true) errors.push('branch_ready_final_gate must be true');
    if (context.final_tail?.no_writes_after_branch_ready !== true) errors.push('no_writes_after_branch_ready must be true');
  }
  return errors;
}

export function validateWorkingTree(tree = {}, { caseInsensitive = process.platform === 'win32' } = {}) {
  const errors = [];
  if (!isRecord(tree)) return ['working tree must be an object'];
  if (tree.expected_branch && tree.current_branch !== tree.expected_branch) errors.push('branch mismatch');
  if (tree.expected_head && tree.current_head !== tree.expected_head) errors.push('HEAD mismatch');
  const pathFields = [
    'staged_paths', 'unstaged_paths', 'untracked_paths', 'existing_paths',
    'unrelated_dirty_paths', 'intended_output_paths'
  ];
  for (const field of pathFields) {
    if (tree[field] !== undefined && !Array.isArray(tree[field])) errors.push(`working tree ${field} must be an array`);
  }
  const unrelated = Array.isArray(tree.unrelated_dirty_paths) ? tree.unrelated_dirty_paths : [];
  if (unrelated.length > 0 && !tree.user_dirty_tree_decision) errors.push('unrelated dirty paths require a user decision');
  const occupied = [];
  for (const field of ['staged_paths', 'unstaged_paths', 'untracked_paths', 'existing_paths']) {
    for (const candidate of (Array.isArray(tree[field]) ? tree[field] : [])) {
      try { occupied.push(normalizeRelative(candidate)); }
      catch (error) { errors.push(`working tree ${field} contains an invalid path: ${error.message}`); }
    }
  }
  for (const output of (Array.isArray(tree.intended_output_paths) ? tree.intended_output_paths : [])) {
    let normalized;
    try { normalized = normalizeRelative(output); }
    catch (error) { errors.push(`working tree intended_output_paths contains an invalid path: ${error.message}`); continue; }
    if (occupied.some((candidate) => repositoryPathsOverlap(candidate, normalized, caseInsensitive))) {
      errors.push(`existing output overlaps intended output: ${output}`);
    }
  }
  return errors;
}

export function validateRuntimeCapabilities(capabilities = {}, writeHeavy = false) {
  if (!isRecord(capabilities)) return { mode: writeHeavy ? 'BLOCKED' : 'SEQUENTIAL', reason: 'capability unknown' };
  const required = ['supports_subagents', 'supports_parallel_dispatch', 'supports_agent_cwd'];
  if (required.some((key) => typeof capabilities[key] !== 'boolean')) return { mode: writeHeavy ? 'BLOCKED' : 'SEQUENTIAL', reason: 'capability unknown' };
  if (!capabilities.supports_subagents) return { mode: 'SEQUENTIAL', reason: 'subagents unavailable' };
  if (!capabilities.supports_parallel_dispatch) return { mode: 'SEQUENTIAL_WAVES', reason: 'calls serialize' };
  if (writeHeavy && !capabilities.supports_agent_cwd) return { mode: 'DISJOINT_SAME_TREE_ONLY', reason: 'agent cwd unavailable' };
  return {
    mode: 'PARALLEL',
    cancellation: capabilities.supports_cancellation ? 'supported' : 'best-effort',
    resultIdentity: capabilities.supports_result_ref ? 'immutable-ref' : 'exact-diff-snapshot'
  };
}

export function validateWorkspaceAssignment(input = {}) {
  if (!isRecord(input)) return ['workspace assignment input must be an object'];
  const { unit = {}, integration = {}, existingWorktrees = [] } = input;
  const errors = [];
  const workspacePath = path.resolve(unit.workspace?.path ?? '.');
  if (unit.verification?.cwd && path.resolve(unit.verification.cwd) !== workspacePath) errors.push('verification cwd does not match unit workspace');
  if (!Array.isArray(existingWorktrees)) errors.push('existingWorktrees must be an array');
  for (const worktree of (Array.isArray(existingWorktrees) ? existingWorktrees : [])) {
    if (!isRecord(worktree) || typeof worktree.path !== 'string') {
      errors.push('existing worktree entry requires a path');
      continue;
    }
    const existing = path.resolve(worktree.path);
    if (workspacePath !== existing && (isWithin(existing, workspacePath) || isWithin(workspacePath, existing))) {
      errors.push('nested worktree assignment is forbidden');
    }
  }
  if (integration.dirty) errors.push('dirty integration workspace');
  if (unit.workspace?.strategy === 'worktree' && integration.workspace_path && path.resolve(integration.workspace_path) === workspacePath) errors.push('unit worktree must be separate from integration workspace');
  if (integration.base_head && unit.workspace?.base_head && unit.workspace.base_head !== integration.base_head) errors.push('workspace base differs from integration base');
  if (integration.base_head && unit.result?.base_head && unit.result.base_head !== integration.base_head) errors.push('stale result base');
  if (unit.result?.descends_from_base === false) errors.push('result does not descend from expected base');
  return errors;
}

export async function validateWorkspaceRealpaths(input = {}) {
  if (!isRecord(input)) return ['workspace realpath validation input must be an object'];
  const { unit = {}, integration = {}, existingWorktrees = [] } = input;
  const errors = [];
  const workspace = await resolveWorkspaceRealpath(unit.workspace?.path, 'unit workspace', errors);
  const cwd = await resolveWorkspaceRealpath(unit.verification?.cwd, 'verification cwd', errors);
  const integrationWorkspace = await resolveWorkspaceRealpath(integration.workspace_path, 'integration workspace', errors);
  if (workspace && cwd && !absolutePathsEqual(workspace.real, cwd.real)) {
    errors.push('verification cwd realpath does not match unit workspace realpath');
  }
  for (const [kind, location] of [['workspace', workspace], ['verification cwd', cwd]]) {
    if (!location || !integrationWorkspace) continue;
    if (absolutePathsEqual(location.real, integrationWorkspace.real)) {
      errors.push(`unit ${kind} realpath aliases the integration workspace`);
    } else if (isWithin(integrationWorkspace.real, location.real)) {
      errors.push(`unit ${kind} is nested inside the integration workspace by canonical realpath`);
    } else if (isWithin(location.real, integrationWorkspace.real)) {
      errors.push(`integration workspace is nested inside the unit ${kind} by canonical realpath`);
    }
  }
  if (!Array.isArray(existingWorktrees)) {
    errors.push('existingWorktrees must be an array');
  } else {
    for (const [index, worktree] of existingWorktrees.entries()) {
      if (!isRecord(worktree) || typeof worktree.path !== 'string') {
        errors.push(`existing worktree at index ${index} requires a path`);
        continue;
      }
      const existing = await resolveWorkspaceRealpath(worktree.path, `existing worktree ${index}`, errors);
      if (!workspace || !existing) continue;
      const sameRealpath = absolutePathsEqual(workspace.real, existing.real);
      const sameLexicalPath = absolutePathsEqual(workspace.lexical, existing.lexical);
      if (sameRealpath && !sameLexicalPath) errors.push('unit workspace uses a realpath alias of an existing worktree');
      if (!sameRealpath && (isWithin(existing.real, workspace.real) || isWithin(workspace.real, existing.real))) {
        errors.push('unit workspace realpath creates a nested worktree assignment');
      }
    }
  }
  return [...new Set(errors)];
}

export async function validateDispatchWorkspaceRealpaths(input = {}) {
  if (!isRecord(input)) return ['dispatch workspace realpath validation input must be an object'];
  const { units, integration = {}, existingWorktrees = [] } = input;
  if (!Array.isArray(units)) return ['dispatch workspace realpath validation requires a units array'];
  const errors = [];
  const canonicalUnits = [];
  for (const [index, unit] of units.entries()) {
    if (!isRecord(unit)) {
      errors.push(`unit at index ${index} must be an object for workspace realpath validation`);
      continue;
    }
    errors.push(...(await validateWorkspaceRealpaths({ unit, integration, existingWorktrees })).map((error) => `unit ${unit.id ?? index}: ${error}`));
    const workspace = await resolveWorkspaceRealpath(unit.workspace?.path, `unit ${unit.id ?? index} workspace`, errors);
    const cwd = await resolveWorkspaceRealpath(unit.verification?.cwd, `unit ${unit.id ?? index} verification cwd`, errors);
    if (workspace && cwd) canonicalUnits.push({ id: unit.id ?? String(index), workspace, cwd });
  }
  for (let leftIndex = 0; leftIndex < canonicalUnits.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < canonicalUnits.length; rightIndex += 1) {
      const left = canonicalUnits[leftIndex];
      const right = canonicalUnits[rightIndex];
      for (const [leftKind, leftPath] of [['workspace', left.workspace], ['cwd', left.cwd]]) {
        for (const [rightKind, rightPath] of [['workspace', right.workspace], ['cwd', right.cwd]]) {
          if (absolutePathsEqual(leftPath.real, rightPath.real)) {
            const alias = !absolutePathsEqual(leftPath.lexical, rightPath.lexical) ? ' alias' : '';
            errors.push(`pairwise unit workspace collision: unit ${left.id} ${leftKind} and unit ${right.id} ${rightKind} resolve to the same realpath${alias}`);
          } else if (isWithin(leftPath.real, rightPath.real) || isWithin(rightPath.real, leftPath.real)) {
            errors.push(`pairwise unit workspaces are nested by canonical parent/child realpath: ${left.id} and ${right.id}`);
          }
        }
      }
    }
  }
  return [...new Set(errors)];
}

async function resolveWorkspaceRealpath(value, label, errors) {
  if (typeof value !== 'string' || !path.isAbsolute(value)) {
    errors.push(`${label} must be an absolute path for realpath validation`);
    return null;
  }
  const lexical = path.resolve(value);
  const parsed = path.parse(lexical);
  let cursor = parsed.root;
  for (const part of lexical.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, part);
    const stat = await lstat(cursor).catch((error) => {
      errors.push(`${label} realpath component is unavailable: ${error.message}`);
      return null;
    });
    if (!stat) return null;
    if (stat.isSymbolicLink()) errors.push(`${label} contains a symbolic-link or junction alias: ${cursor}`);
  }
  const resolved = await realpath(lexical).catch((error) => {
    errors.push(`${label} cannot be canonicalized with realpath: ${error.message}`);
    return null;
  });
  return resolved ? { lexical, real: resolved } : null;
}

export function validateResultIdentity(unit = {}, { baseHead, readOnly = false } = {}) {
  const errors = [];
  if (!isRecord(unit)) return ['unit must be an object'];
  if (!isRecord(unit.result)) return ['missing result: unit result must be an object'];
  errors.push(...validateChangedPathArray(unit.result.changed_paths, 'unit result changed_paths'));
  if (!unit.result.ref) errors.push('missing result reference');
  if (unit.status === 'PASSED' && unit.result.exit_code !== 0) errors.push('claimed success has non-zero exit code');
  if (baseHead && unit.result.base_head !== baseHead) errors.push('result uses stale base');
  if (unit.result.descends_from_base === false) errors.push('result does not descend from base');
  if (!unit.result.associated_head_or_diff) errors.push('result is missing associated state');
  if (!unit.result.output_digest) errors.push('result is missing output digest');
  if (readOnly && Array.isArray(unit.result.changed_paths) && unit.result.changed_paths.length > 0) errors.push('read-only unit changed files');
  return errors;
}

function validateChangedPathArray(value, label) {
  if (!Array.isArray(value)) return [`${label} must be an array`];
  const errors = [];
  for (const [index, changedPath] of value.entries()) {
    if (typeof changedPath !== 'string' || !changedPath.trim()) errors.push(`${label}[${index}] must be a non-empty string`);
  }
  return errors;
}

export async function runUnitWithPolicy(run, policy = {}) {
  const maxAttempts = Math.max(1, policy.max_attempts ?? 1);
  let attempts = 0;
  while (attempts < maxAttempts) {
    attempts += 1;
    try {
      const timeoutMs = Math.max(1, Number(policy.timeout_seconds ?? 0) * 1000);
      const value = policy.timeout_seconds ? await withTimeout(run(), timeoutMs) : await run();
      if (!value) return { status: 'FAILED', failure_kind: 'missing-result', attempts };
      if (value.exit_code !== undefined && value.exit_code !== 0) return { status: 'FAILED', failure_kind: 'non-zero-exit', attempts, result: value };
      return { status: 'PASSED', attempts, result: value };
    } catch (error) {
      const deterministic = ['path-violation', 'contract-violation', 'stale-base'].includes(error.kind);
      const transient = error.transient === true || error.kind === 'timeout';
      if (!deterministic && transient && policy.retry_transient_failures && attempts < maxAttempts) continue;
      return { status: 'FAILED', failure_kind: error.kind ?? 'crash', reason: error.message, attempts };
    }
  }
  return { status: 'FAILED', failure_kind: 'attempts-exhausted', attempts };
}

export async function runUnitsWithPolicy(units, policy = {}) {
  const results = [];
  for (let index = 0; index < units.length; index += 1) {
    const unit = units[index];
    const result = { id: unit.id, ...await runUnitWithPolicy(unit.run, policy) };
    results.push(result);
    if (result.status !== 'PASSED' && policy.mode === 'fail-fast') {
      for (const pending of units.slice(index + 1)) {
        results.push({ id: pending.id, status: policy.supports_cancellation ? 'CANCELLED' : 'PENDING', cancellation: policy.supports_cancellation ? 'supported' : 'best-effort' });
      }
      break;
    }
  }
  return { mode: policy.mode ?? 'best-effort', results };
}

export function classifyTopology({ contract, units = [], runtimeCapabilities = {} }) {
  const readOnly = contract?.source === 'read-only-request';
  const runtime = validateRuntimeCapabilities(runtimeCapabilities, !readOnly);
  if (readOnly) return { kind: 'READ_ONLY_FANOUT', verdict: runtime.mode === 'PARALLEL' ? 'PARALLEL-CANDIDATE' : 'SEQUENTIAL', runtime };
  if (!Array.isArray(units)) return { kind: 'SEQUENTIAL_DAG', verdict: 'SEQUENTIAL', runtime, reason: 'units must be an array' };
  const malformedOwnership = units.flatMap((unit, index) => isRecord(unit)
    ? validateOwnershipShape(unit.ownership, `unit ${unit.id ?? index}`)
    : [`unit at index ${index} must be an object`]);
  const malformedDependencies = units.some((unit) => unit?.depends_on !== undefined && !Array.isArray(unit.depends_on));
  if (malformedOwnership.length > 0 || malformedDependencies) {
    return { kind: 'SEQUENTIAL_DAG', verdict: 'SEQUENTIAL', runtime, reason: 'malformed ownership or dependency arrays' };
  }
  if (['BLOCKED', 'SEQUENTIAL', 'SEQUENTIAL_WAVES'].includes(runtime.mode)) return { kind: 'SEQUENTIAL_DAG', verdict: 'SEQUENTIAL', runtime };
  if (runtime.mode === 'DISJOINT_SAME_TREE_ONLY' && units.some((unit) => unit.workspace?.strategy !== 'disjoint-same-tree' || !isDisjointSameTreeSafe(unit))) {
    return { kind: 'SEQUENTIAL_DAG', verdict: 'SEQUENTIAL', runtime, reason: 'runtime lacks safe per-agent cwd' };
  }
  const dependencies = units.some((unit) => (unit.depends_on ?? []).length > 0);
  let pathConflict = true;
  let resourceConflict = true;
  try {
    pathConflict = ownershipOverlaps(units);
    resourceConflict = resourcesOverlap(units);
  } catch {
    return { kind: 'SEQUENTIAL_DAG', verdict: 'SEQUENTIAL', runtime, reason: 'malformed ownership patterns' };
  }
  if (resourceConflict || pathConflict) return { kind: 'SEQUENTIAL_DAG', verdict: 'SEQUENTIAL', reason: resourceConflict ? 'resource overlap' : 'path overlap' };
  if (units.some((unit) => unit.role || unit.contract_bound)) {
    return { kind: 'CONTRACT_BOUND_ROLES', verdict: 'ROLE-SPLIT', ...(dependencies ? { waves: planWaves(units) } : {}) };
  }
  if (dependencies) return { kind: 'SEQUENTIAL_DAG', verdict: 'PARALLEL-CANDIDATE', waves: planWaves(units) };
  return { kind: 'INDEPENDENT_WRITE_UNITS', verdict: units.length >= 2 ? 'PARALLEL-CANDIDATE' : 'SEQUENTIAL' };
}

export function planWaves(units) {
  const remaining = new Map(units.map((unit) => [unit.id, new Set(unit.depends_on ?? [])]));
  const done = new Set();
  const waves = [];
  while (remaining.size > 0) {
    const wave = [...remaining].filter(([, deps]) => [...deps].every((id) => done.has(id))).map(([id]) => id).sort();
    if (wave.length === 0) throw new Error('dependency cycle or missing dependency');
    waves.push(wave);
    for (const id of wave) { remaining.delete(id); done.add(id); }
  }
  return waves;
}

export async function validatePathBoundary(input = {}) {
  if (!isRecord(input)) return { errors: ['path-boundary validation input must be an object'], changed_paths: [] };
  let { repoRoot, unit, actualChanges = [], selfReportedPaths, caseInsensitive = process.platform === 'win32' } = input;
  const errors = [];
  const effectiveCaseInsensitive = process.platform === 'win32' || caseInsensitive === true;
  const ownership = isRecord(unit?.ownership) ? unit.ownership : {};
  errors.push(...validateOwnershipShape(unit?.ownership, 'unit'));
  if (!Array.isArray(actualChanges)) {
    errors.push('actualChanges must be an array');
    actualChanges = [];
  }
  if (selfReportedPaths !== undefined && !Array.isArray(selfReportedPaths)) {
    errors.push('selfReportedPaths must be an array');
    selfReportedPaths = undefined;
  }
  const expanded = [];
  for (const [index, change] of actualChanges.entries()) {
    if (!isRecord(change)) {
      errors.push(`actualChanges[${index}] must be an object`);
      continue;
    }
    const parsedStatus = parseGitNameStatus(change.status);
    if (parsedStatus.error) {
      errors.push(`actualChanges[${index}] ${parsedStatus.error}`);
      continue;
    }
    if (parsedStatus.kind === 'rename') {
      if (typeof change.from !== 'string' || !change.from.trim()) {
        errors.push(`actualChanges[${index}] rename ${change.status} requires a non-empty from source path`);
      } else {
        expanded.push({ status: 'D', path: change.from });
      }
      expanded.push({ status: 'A', path: change.path });
    } else expanded.push(change);
  }
  const normalized = [];
  for (const change of expanded) {
    let rel;
    try { rel = normalizeRelative(change.path); } catch (error) { errors.push(error.message); continue; }
    normalized.push(rel);
    errors.push(...validateOwnershipPathPolicy(rel, ownership, effectiveCaseInsensitive));
    try {
      errors.push(...await inspectFilesystemBoundary(repoRoot, rel, ownership, effectiveCaseInsensitive));
    } catch (error) {
      errors.push(`filesystem boundary validation failed for ${rel}: ${error.message}`);
    }
  }
  const actual = [...new Set(normalized.map((item) => effectiveCaseInsensitive ? item.toLowerCase() : item))].sort();
  if (selfReportedPaths) {
    const reportedPaths = [];
    for (const item of selfReportedPaths) {
      try { reportedPaths.push(normalizeRelative(item)); }
      catch (error) { errors.push(error.message); }
    }
    const reported = [...new Set(reportedPaths.map((item) => effectiveCaseInsensitive ? item.toLowerCase() : item))].sort();
    if (JSON.stringify(actual) !== JSON.stringify(reported)) errors.push('unit self-report differs from actual changed paths');
  }
  return { errors: [...new Set(errors)], changed_paths: [...new Set(normalized)].sort() };
}

export async function verifyFanInAuthority(input = {}) {
  const errors = [];
  if (!isRecord(input)) return frozenAuthorityResult(['fan-in authority input must be an object']);
  const { repositoryRoot, contract, units, integration, approvedSpecPath, planContext } = input;
  if (!isRecord(integration)) errors.push('fan-in authority requires an integration object');
  else {
    if (!['cherry-pick', 'patch', 'disjoint-same-tree'].includes(integration.merge_strategy)) {
      errors.push('fan-in authority requires a supported merge_strategy');
    }
    if (!Array.isArray(integration.merge_order)) errors.push('fan-in authority requires merge_order');
  }
  if (!Array.isArray(units) || units.some((unit) => !isRecord(unit))) {
    errors.push('fan-in authority requires an exact units result set');
  }

  const verified = await verifyApprovedOwnershipAuthority({
    repositoryRoot,
    contract,
    units: Array.isArray(units) ? units : [],
    approvedSpecPath,
    planContext
  });
  const ownershipClaims = ISSUED_APPROVED_OWNERSHIP_AUTHORITIES.get(verified);
  if (ownershipClaims) ISSUED_APPROVED_OWNERSHIP_AUTHORITIES.delete(verified);
  if (!verified.verified || !ownershipClaims) {
    errors.push('fan-in authority requires a fresh re-verification of the approved spec, plan, and frozen ownership contract');
    errors.push(...(verified.errors ?? []));
  }

  let repositoryState = null;
  if (ownershipClaims) {
    repositoryState = await captureRepositoryState(ownershipClaims.repository_root).catch((error) => {
      errors.push(`fan-in authority cannot capture the canonical repository state: ${error.message}`);
      return null;
    });
  }

  const authority = frozenAuthorityResult(errors, {
    repository_root: ownershipClaims?.repository_root ?? null,
    contract_id: contract?.contract_id ?? null,
    merge_strategy: integration?.merge_strategy ?? null
  });
  if (authority.verified) {
    ISSUED_FAN_IN_AUTHORITIES.set(authority, Object.freeze({
      repository_root: ownershipClaims.repository_root,
      repository_identity: ownershipClaims.repository_identity,
      repository_case_insensitive: ownershipClaims.repository_case_insensitive,
      repository_state_digest: repositoryState.digest,
      contract_identity: approvedOwnershipContractIdentity(contract),
      contract_hash: contract.frozen_contract_hash,
      ownership_manifest_digest: ownershipClaims.ownership_manifest_digest,
      ownership_by_unit: ownershipClaims.ownership_by_unit,
      approved_spec_path: approvedSpecPath,
      plan_context: structuredClone(planContext),
      result_set_identity: fanInResultSetIdentity(units),
      integration_identity: integrationDecisionIdentity(integration),
      merge_strategy: integration.merge_strategy
    }));
  }
  return authority;
}

async function reverifyFanInApprovalClaims({ fanInClaims, repositoryRoot, contract, units, integration }) {
  const verified = await verifyApprovedOwnershipAuthority({
    repositoryRoot,
    contract,
    units,
    approvedSpecPath: fanInClaims.approved_spec_path,
    planContext: fanInClaims.plan_context
  });
  const claims = ISSUED_APPROVED_OWNERSHIP_AUTHORITIES.get(verified);
  if (claims) ISSUED_APPROVED_OWNERSHIP_AUTHORITIES.delete(verified);
  const errors = [];
  if (!verified.verified || !claims) {
    errors.push('approved spec, plan, or frozen ownership contract changed or became stale');
    errors.push(...(verified.errors ?? []));
    return { errors, claims: null };
  }
  if (!absolutePathsEqual(claims.repository_root, repositoryRoot)) {
    errors.push('canonical repository root no longer matches the fan-in lease');
  }
  if (claims.repository_identity !== fanInClaims.repository_identity) {
    errors.push('canonical repository identity changed after fan-in lease issuance; target-root replacement or replay is forbidden');
  }
  if (claims.repository_case_insensitive !== fanInClaims.repository_case_insensitive) {
    errors.push('canonical repository filesystem case semantics changed after fan-in lease issuance');
  }
  if (claims.contract_identity !== approvedOwnershipContractIdentity(contract)) {
    errors.push('approved contract identity no longer matches the fan-in lease');
  }
  if (claims.ownership_manifest_digest !== fanInClaims.ownership_manifest_digest) {
    errors.push('frozen ownership manifest no longer matches the fan-in lease');
  }
  if (fanInResultSetIdentity(units) !== fanInClaims.result_set_identity) {
    errors.push('exact fan-in result set no longer matches the fan-in lease');
  }
  if (integrationDecisionIdentity(integration) !== fanInClaims.integration_identity || integration?.merge_strategy !== fanInClaims.merge_strategy) {
    errors.push('integration identity or merge strategy no longer matches the fan-in lease');
  }
  return { errors, claims };
}

export async function integrateResults(input = {}) {
  if (!isRecord(input)) return { status: 'INTEGRATION_BLOCKED', reason: 'fan-in input must be an object' };
  const {
    repositoryRoot, contract, fanInAuthority, units, integration, failurePolicy = {}, validate, review, checkpoint, apply, probe,
    rollbackUnit, rollback, readPostIntegrationState, globalVerify
  } = input;
  if (!Array.isArray(units)) return { status: 'INTEGRATION_BLOCKED', reason: 'fan-in units must be an array' };
  if (!isRecord(integration)) return { status: 'INTEGRATION_BLOCKED', reason: 'fan-in integration must be an object' };
  if (units.some((unit) => !isRecord(unit))) return { status: 'INTEGRATION_BLOCKED', reason: 'each fan-in unit must be an object' };
  const unitIds = units.map((unit) => unit.id);
  if (unitIds.some((id) => typeof id !== 'string' || !id.trim()) || new Set(unitIds).size !== unitIds.length) {
    return { status: 'INTEGRATION_BLOCKED', reason: 'fan-in unit IDs must be non-empty and unique' };
  }
  if (!Array.isArray(integration.merge_order)) return { status: 'INTEGRATION_BLOCKED', reason: 'integration merge_order must be an array' };
  const order = integration.merge_order;
  if (order.length !== units.length || new Set(order).size !== order.length || order.some((id) => !unitIds.includes(id))) {
    return { status: 'INTEGRATION_BLOCKED', reason: 'merge order must name each unit exactly once' };
  }
  if (!isRecord(contract)) return { status: 'INTEGRATION_BLOCKED', reason: 'fan-in requires the approved-plan contract' };
  const contractErrors = validateContract(contract, { writeCapable: true });
  if (contractErrors.length > 0) return { status: 'INTEGRATION_BLOCKED', reason: contractErrors.join('; ') };
  let effectiveIntegration = integration;
  if (integration.atomicity === 'user-decision') {
    const decisionClaims = ISSUED_INTEGRATION_DECISION_AUTHORITIES.get(integration.user_decision);
    if (decisionClaims) ISSUED_INTEGRATION_DECISION_AUTHORITIES.delete(integration.user_decision);
    if (
      !decisionClaims ||
      decisionClaims.contract_identity !== approvedOwnershipContractIdentity(contract) ||
      decisionClaims.result_set_identity !== fanInResultSetIdentity(units) ||
      decisionClaims.integration_identity !== integrationDecisionIdentity(integration) ||
      decisionClaims.attestation_scheme !== 'sha256-canonical-v1' ||
      decisionClaims.decision_attestation !== createIntegrationDecisionAttestation({
        ...decisionClaims,
        approved: true
      })
    ) {
      return { status: 'USER_DECISION_REQUIRED', reason: 'atomicity policy requires a fresh one-shot parent-attested decision authority bound to the approved contract, exact result set, and integration before fan-in' };
    }
    effectiveIntegration = {
      ...integration,
      atomicity: decisionClaims.effective_atomicity,
      decision_ref: decisionClaims.decision_ref
    };
  } else if (!['all-or-nothing', 'independent-successes'].includes(integration.atomicity)) {
    return { status: 'INTEGRATION_BLOCKED', reason: 'integration atomicity is invalid' };
  }
  if (units.some((unit) => unit.status !== 'PASSED')) return { status: 'INTEGRATION_BLOCKED', reason: 'only PASSED units may fan in' };
  if (typeof validate !== 'function' || typeof review !== 'function') return { status: 'INTEGRATION_BLOCKED', reason: 'parent path/Stage A validator and Stage B reviewer are required' };
  if (typeof checkpoint !== 'function') return { status: 'INTEGRATION_BLOCKED', reason: 'an explicit per-unit checkpoint callback is required before mutation' };
  if (typeof apply !== 'function') return { status: 'INTEGRATION_BLOCKED', reason: 'an explicit apply callback is required' };
  if (typeof probe !== 'function') return { status: 'INTEGRATION_BLOCKED', reason: 'an explicit integration probe callback is required' };
  if (typeof rollbackUnit !== 'function') return { status: 'INTEGRATION_BLOCKED', reason: 'an explicit per-unit rollback callback is required' };
  if (effectiveIntegration.atomicity === 'all-or-nothing' && typeof rollback !== 'function') return { status: 'INTEGRATION_BLOCKED', reason: 'all-or-nothing requires an executable rollback' };
  if (typeof readPostIntegrationState !== 'function') return { status: 'INTEGRATION_BLOCKED', reason: 'an independent post-integration state reader is required' };
  if (typeof globalVerify !== 'function') return { status: 'INTEGRATION_BLOCKED', reason: 'global verification callback is required' };

  const canonicalRepositoryRoot = typeof repositoryRoot === 'string' && path.isAbsolute(repositoryRoot)
    ? await realpath(repositoryRoot).catch(() => null)
    : null;
  if (!canonicalRepositoryRoot) return { status: 'INTEGRATION_BLOCKED', reason: 'fan-in requires an absolute canonical repositoryRoot' };
  const fanInClaims = ISSUED_FAN_IN_AUTHORITIES.get(fanInAuthority);
  if (fanInClaims) ISSUED_FAN_IN_AUTHORITIES.delete(fanInAuthority);
  if (!fanInClaims) {
    return { status: 'INTEGRATION_BLOCKED', reason: 'fan-in requires a fresh one-shot private authority derived from file-backed approved-plan re-verification' };
  }
  if (
    !absolutePathsEqual(fanInClaims.repository_root, canonicalRepositoryRoot) ||
    fanInClaims.contract_identity !== approvedOwnershipContractIdentity(contract) ||
    fanInClaims.result_set_identity !== fanInResultSetIdentity(units) ||
    fanInClaims.integration_identity !== integrationDecisionIdentity(integration) ||
    fanInClaims.merge_strategy !== integration.merge_strategy
  ) {
    return { status: 'INTEGRATION_BLOCKED', reason: 'fan-in authority binding does not match the repository, approved contract, exact result set, ownership, or merge strategy' };
  }
  const initialReverification = await reverifyFanInApprovalClaims({
    fanInClaims,
    repositoryRoot: canonicalRepositoryRoot,
    contract,
    units,
    integration
  });
  const refreshedClaims = initialReverification.claims;
  if (initialReverification.errors.length > 0 || !refreshedClaims) {
    return {
      status: 'INTEGRATION_BLOCKED',
      reason: `fan-in approval artifacts changed or became stale before lease consumption: ${initialReverification.errors.join('; ')}`
    };
  }
  let leaseConsumptionState;
  try { leaseConsumptionState = await captureRepositoryState(canonicalRepositoryRoot); }
  catch (error) { return { status: 'INTEGRATION_BLOCKED', reason: `fan-in lease repository-state revalidation failed: ${error.message}` }; }
  if (leaseConsumptionState.digest !== fanInClaims.repository_state_digest) {
    return { status: 'INTEGRATION_BLOCKED', reason: 'fan-in approval or repository state changed after lease issuance; the lease is stale' };
  }
  let liveOwnershipDigest;
  try { liveOwnershipDigest = createOwnershipManifestDigest(units); }
  catch (error) { return { status: 'INTEGRATION_BLOCKED', reason: `fan-in ownership manifest is invalid: ${error.message}` }; }
  if (liveOwnershipDigest !== fanInClaims.ownership_manifest_digest) {
    return { status: 'INTEGRATION_BLOCKED', reason: 'fan-in live unit ownership differs from the freshly verified frozen ownership contract' };
  }

  const effectiveCaseInsensitive = refreshedClaims.repository_case_insensitive === true;
  const byId = new Map(units.map((unit) => [unit.id, unit]));
  const seenPaths = [];
  const compatibleResultType = { 'cherry-pick': 'commit', patch: 'patch', 'disjoint-same-tree': 'working-tree-diff' }[integration.merge_strategy];
  if (!compatibleResultType) return { status: 'INTEGRATION_BLOCKED', reason: 'fan-in merge_strategy is invalid' };
  for (const id of order) {
    const unit = byId.get(id);
    const identityErrors = validateResultIdentity(unit, { baseHead: effectiveIntegration.base_head });
    if (identityErrors.length > 0) return { status: 'INTEGRATION_BLOCKED', reason: identityErrors.join('; ') };
    if (unit.contract_hash !== contract.frozen_contract_hash || unit.result.contract_hash !== contract.frozen_contract_hash) {
      return { status: 'INTEGRATION_BLOCKED', reason: `unit ${id} and its result must bind the approved frozen contract hash` };
    }
    if (unit.result.type !== compatibleResultType) {
      return { status: 'INTEGRATION_BLOCKED', reason: `unit ${id} result type is incompatible with integration merge_strategy ${integration.merge_strategy}` };
    }
    const trustedOwnership = refreshedClaims.ownership_by_unit.get(id);
    if (!isRecord(trustedOwnership)) return { status: 'INTEGRATION_BLOCKED', reason: `unit ${id} has no trusted frozen ownership scope` };
    for (const changed of unit.result.changed_paths) {
      let normalized;
      try { normalized = normalizeRelative(changed); }
      catch (error) { return { status: 'INTEGRATION_BLOCKED', reason: error.message }; }
      const ownershipErrors = validateOwnershipPathPolicy(normalized, trustedOwnership, effectiveCaseInsensitive, `unit ${id}`);
      if (ownershipErrors.length > 0) {
        return { status: 'INTEGRATION_BLOCKED', reason: `trusted ownership rejected changed paths: ${ownershipErrors.join('; ')}` };
      }
      const overlap = seenPaths.find((seen) => repositoryPathsOverlap(seen, normalized, effectiveCaseInsensitive));
      if (overlap) return { status: 'INTEGRATION_BLOCKED', reason: `overlapping shared artifact: ${overlap} and ${normalized}` };
      seenPaths.push(normalized);
    }
  }

  const integrated = [];
  const attempted = [];
  let preFanInState;
  try { preFanInState = await captureRepositoryState(canonicalRepositoryRoot); }
  catch (error) { return { status: 'INTEGRATION_BLOCKED', reason: `pre-fan-in repository state capture failed: ${error.message}` }; }
  const fail = async (reason, status = 'INTEGRATION_BLOCKED') => {
    if (effectiveIntegration.atomicity !== 'all-or-nothing' || attempted.length === 0) {
      return { status, reason, integrated: [...integrated], rollbackRequired: false };
    }
    const rollbackFailure = await rollbackGlobalAndVerify({
      rollback,
      unitIds: [...attempted],
      repositoryRoot: canonicalRepositoryRoot,
      expectedState: preFanInState
    });
    if (rollbackFailure) {
      return {
        status: 'ROLLBACK_FAILED',
        reason: `${reason}; ${rollbackFailure.message}`,
        integrated: [...integrated],
        rollbackRequired: true
      };
    }
    return { status, reason, integrated: [...integrated], rollbackRequired: false, rolledBack: true };
  };
  const rollbackCurrentMutation = async ({ unit, checkpoint: checkpointIdentity, expectedState, reason }) => {
    const rollbackFailure = await rollbackCurrentUnit(
      unit,
      checkpointIdentity,
      rollbackUnit,
      canonicalRepositoryRoot,
      expectedState
    );
    if (!rollbackFailure) return null;
    let globalRollbackFailure = null;
    if (effectiveIntegration.atomicity === 'all-or-nothing') {
      globalRollbackFailure = await rollbackGlobalAndVerify({
        rollback,
        unitIds: [...attempted],
        repositoryRoot: canonicalRepositoryRoot,
        expectedState: preFanInState
      });
    }
    return {
      status: 'ROLLBACK_FAILED',
      reason: `${reason}; ${rollbackFailure.message}${globalRollbackFailure ? `; ${globalRollbackFailure.message}` : ''}`,
      integrated: [...integrated],
      rollbackRequired: true
    };
  };
  let acceptedFinalState = preFanInState;
  for (const id of order) {
    const unit = byId.get(id);
    let preCallbackState;
    try { preCallbackState = await captureRepositoryState(canonicalRepositoryRoot); }
    catch (error) { return fail(`pre-callback repository state capture failed: ${id}: ${error.message}`); }
    let validationResult;
    try { validationResult = await validate(unit); }
    catch (error) { return fail(`unit validation failed: ${id}: ${error.message}`); }
    const verdictPathErrors = validateChangedPathArray(validationResult?.changed_paths, 'parent validation verdict changed_paths');
    if (verdictPathErrors.length > 0) return fail(verdictPathErrors.join('; '));
    if (!isParentValidationPass(validationResult, unit, 'path')) return fail(`unit validation failed: ${id}`);
    let reviewResult;
    try { reviewResult = await review(unit); }
    catch (error) { return fail(`unit review failed: ${id}: ${error.message}`); }
    if (!isParentValidationPass(reviewResult, unit, 'review')) return fail(`unit review failed: ${id}`);

    let attempt = 0;
    const maxAttempts = Math.max(1, Number.isInteger(failurePolicy?.max_attempts) ? failurePolicy.max_attempts : 1);
    while (true) {
      attempt += 1;
      let unitCheckpoint;
      try { unitCheckpoint = await checkpoint(unit, { integrated: [...integrated], attempt }); }
      catch (error) { return fail(`unit checkpoint failed: ${id}: ${error.message}`); }
      if (unitCheckpoint === undefined || unitCheckpoint === null) {
        return fail(`unit checkpoint identity is missing: ${id}`);
      }
      const preApplyReverification = await reverifyFanInApprovalClaims({
        fanInClaims,
        repositoryRoot: canonicalRepositoryRoot,
        contract,
        units,
        integration
      });
      if (preApplyReverification.errors.length > 0 || !preApplyReverification.claims) {
        return fail(`fan-in approval artifacts changed or became stale immediately before apply: ${preApplyReverification.errors.join('; ')}`);
      }
      let preUnitState;
      try { preUnitState = await captureRepositoryState(canonicalRepositoryRoot); }
      catch (error) { return fail(`pre-unit repository state capture failed: ${id}: ${error.message}`); }
      if (preUnitState.digest !== preCallbackState.digest) {
        return fail(`parent validation, review, or checkpoint changed repository state before apply: ${id}`);
      }
      if (!attempted.includes(id)) attempted.push(id);
      try {
        await apply(unit);
      } catch (error) {
        const rollbackResult = await rollbackCurrentMutation({
          unit,
          checkpoint: unitCheckpoint,
          expectedState: preUnitState,
          reason: error.message
        });
        if (rollbackResult) return rollbackResult;
        const retry = error.transient === true && failurePolicy?.retry_transient_failures === true && attempt < maxAttempts;
        if (retry) continue;
        return fail(error.message);
      }
      const postApplyReverification = await reverifyFanInApprovalClaims({
        fanInClaims,
        repositoryRoot: canonicalRepositoryRoot,
        contract,
        units,
        integration
      });
      let postApplyState = null;
      let postApplyFailure = null;
      if (postApplyReverification.errors.length > 0 || !postApplyReverification.claims) {
        postApplyFailure = `fan-in approval artifacts changed or became stale after apply: ${postApplyReverification.errors.join('; ')}`;
      } else {
        try {
          postApplyState = await captureRepositoryState(canonicalRepositoryRoot);
          const actualChangedPaths = deriveRepositoryChangedPaths(preUnitState, postApplyState);
          const trustedOwnership = postApplyReverification.claims.ownership_by_unit.get(id);
          const actualPathErrors = validateInternallyObservedUnitPaths(
            actualChangedPaths,
            unit,
            trustedOwnership,
            effectiveCaseInsensitive
          );
          if (actualPathErrors.length > 0) {
            postApplyFailure = `internally observed actual changed paths after apply violate trusted ownership or result binding: ${actualPathErrors.join('; ')}`;
          }
        } catch (error) {
          postApplyFailure = `post-apply repository state validation failed: ${id}: ${error.message}`;
        }
      }
      if (postApplyFailure) {
        const rollbackResult = await rollbackCurrentMutation({
          unit,
          checkpoint: unitCheckpoint,
          expectedState: preUnitState,
          reason: postApplyFailure
        });
        if (rollbackResult) return rollbackResult;
        return fail(postApplyFailure);
      }
      try {
        await probe(unit);
      } catch (error) {
        const reason = `integration probe failed: ${error.message}`;
        const rollbackResult = await rollbackCurrentMutation({
          unit,
          checkpoint: unitCheckpoint,
          expectedState: preUnitState,
          reason
        });
        if (rollbackResult) return rollbackResult;
        return fail(reason);
      }
      const postProbeReverification = await reverifyFanInApprovalClaims({
        fanInClaims,
        repositoryRoot: canonicalRepositoryRoot,
        contract,
        units,
        integration
      });
      let postProbeState = null;
      let postProbeFailure = null;
      if (postProbeReverification.errors.length > 0 || !postProbeReverification.claims) {
        postProbeFailure = `fan-in approval artifacts changed or became stale after integration probe: ${postProbeReverification.errors.join('; ')}`;
      } else {
        try {
          postProbeState = await captureRepositoryState(canonicalRepositoryRoot);
          if (postProbeState.digest !== postApplyState.digest) {
            postProbeFailure = `integration probe changed repository state after apply for unit ${id}; probes must be read-only`;
          }
        } catch (error) {
          postProbeFailure = `post-probe repository state validation failed: ${id}: ${error.message}`;
        }
      }
      if (postProbeFailure) {
        const rollbackResult = await rollbackCurrentMutation({
          unit,
          checkpoint: unitCheckpoint,
          expectedState: preUnitState,
          reason: postProbeFailure
        });
        if (rollbackResult) return rollbackResult;
        return fail(postProbeFailure);
      }
      acceptedFinalState = postProbeState;
      integrated.push(id);
      break;
    }
  }

  const finalApprovalReverification = await reverifyFanInApprovalClaims({
    fanInClaims,
    repositoryRoot: canonicalRepositoryRoot,
    contract,
    units,
    integration
  });
  if (finalApprovalReverification.errors.length > 0 || !finalApprovalReverification.claims) {
    return fail(
      `fan-in approval artifacts changed or became stale before final verification: ${finalApprovalReverification.errors.join('; ')}`,
      'GLOBAL_VERIFICATION_FAILED'
    );
  }
  let finalPreVerificationState;
  try { finalPreVerificationState = await captureRepositoryState(canonicalRepositoryRoot); }
  catch (error) { return fail(`final repository state capture failed: ${error.message}`, 'GLOBAL_VERIFICATION_FAILED'); }
  if (finalPreVerificationState.digest !== acceptedFinalState.digest) {
    return fail('repository state changed after the final unit was accepted and before global verification', 'GLOBAL_VERIFICATION_FAILED');
  }

  let postIntegrationState;
  try {
    const observed = await readPostIntegrationState({
      repository_state_digest: acceptedFinalState.digest,
      head: acceptedFinalState.head
    });
    postIntegrationState = isRecord(observed) ? observed.associated_head_or_diff : observed;
  } catch (error) {
    return fail(`post-integration state read failed: ${error.message}`, 'GLOBAL_VERIFICATION_FAILED');
  }
  if (!postIntegrationState) return fail('post-integration state is missing', 'GLOBAL_VERIFICATION_FAILED');
  let postIntegrationReadState;
  try { postIntegrationReadState = await captureRepositoryState(canonicalRepositoryRoot); }
  catch (error) { return fail(`post-integration repository state capture failed: ${error.message}`, 'GLOBAL_VERIFICATION_FAILED'); }
  if (postIntegrationReadState.digest !== acceptedFinalState.digest) {
    return fail('post-integration state reader changed the accepted post-apply repository state', 'GLOBAL_VERIFICATION_FAILED');
  }
  let verified;
  try {
    verified = await globalVerify({
      associated_head_or_diff: postIntegrationState,
      repository_state_digest: acceptedFinalState.digest
    });
  }
  catch (error) { return fail(`global verification failed: ${error.message}`, 'GLOBAL_VERIFICATION_FAILED'); }
  if (
    verified?.status !== 'PASS' ||
    verified.associated_head_or_diff !== postIntegrationState ||
    verified.repository_state_digest !== acceptedFinalState.digest ||
    !verified.output_digest
  ) {
    return fail('global verification identity does not match the independently observed post-integration state', 'GLOBAL_VERIFICATION_FAILED');
  }
  let postGlobalVerificationRepositoryState;
  try { postGlobalVerificationRepositoryState = await captureRepositoryState(canonicalRepositoryRoot); }
  catch (error) { return fail(`post-global-verification repository state capture failed: ${error.message}`, 'GLOBAL_VERIFICATION_FAILED'); }
  if (postGlobalVerificationRepositoryState.digest !== acceptedFinalState.digest) {
    return fail('global verification changed the accepted post-apply repository state', 'GLOBAL_VERIFICATION_FAILED');
  }
  let postVerificationState;
  try {
    const observed = await readPostIntegrationState({
      repository_state_digest: acceptedFinalState.digest,
      head: acceptedFinalState.head
    });
    postVerificationState = isRecord(observed) ? observed.associated_head_or_diff : observed;
  } catch (error) {
    return fail(`post-verification state read failed: ${error.message}`, 'GLOBAL_VERIFICATION_FAILED');
  }
  if (!postVerificationState || postVerificationState !== postIntegrationState) {
    return fail('post-verification state changed after global verification (TOCTOU)', 'GLOBAL_VERIFICATION_FAILED');
  }
  let postVerificationRepositoryState;
  try { postVerificationRepositoryState = await captureRepositoryState(canonicalRepositoryRoot); }
  catch (error) { return fail(`post-verification repository state capture failed: ${error.message}`, 'GLOBAL_VERIFICATION_FAILED'); }
  if (postVerificationRepositoryState.digest !== acceptedFinalState.digest) {
    return fail('post-verification state reader changed the accepted post-apply repository state', 'GLOBAL_VERIFICATION_FAILED');
  }
  const finalApprovalCheck = await reverifyFanInApprovalClaims({
    fanInClaims,
    repositoryRoot: canonicalRepositoryRoot,
    contract,
    units,
    integration
  });
  if (finalApprovalCheck.errors.length > 0 || !finalApprovalCheck.claims) {
    return fail(
      `fan-in approval artifacts changed or became stale during final verification: ${finalApprovalCheck.errors.join('; ')}`,
      'GLOBAL_VERIFICATION_FAILED'
    );
  }
  return {
    status: 'GLOBAL_VERIFIED',
    integrated,
    rollbackRequired: false,
    associated_head_or_diff: postVerificationState,
    repository_state_digest: acceptedFinalState.digest
  };
}

export function assignRepair({ finding, unit, ownershipTransfer }) {
  if (!Array.isArray(finding?.paths)) throw new Error('repair finding paths must be an array');
  const paths = finding.paths.map(normalizeRelative);
  if (paths.some((item) => isAlwaysProtectedPath(item, true))) throw new Error('repair cannot modify a protected repository or approved contract artifact');
  const outside = paths.filter((item) => !matchesAny(item, unit?.ownership?.allowed_paths ?? [], process.platform === 'win32'));
  if (outside.length > 0) {
    throw new Error('repair needs a fresh file-verified revised ownership authority; caller-authored ownership transfer is forbidden');
  }
  return {
    finding_id: finding.id,
    original_unit_id: unit.id,
    repair_owner: 'original-unit',
    workspace_path: unit.workspace.path,
    base_result_ref: unit.result.ref,
    contract_hash: unit.contract_hash,
    allowed_paths: unit.ownership.allowed_paths,
    ownership_transfer_approved: false,
    evidence_valid: false,
    status: finding.blocking && finding.deferred ? 'BLOCKED' : 'PENDING'
  };
}

export async function assignRepairWithAuthority({ finding, unit, ownershipTransfer, repositoryRoot } = {}) {
  if (!Array.isArray(finding?.paths)) throw new Error('repair finding paths must be an array');
  if (!isRecord(unit) || typeof unit.id !== 'string' || !unit.id.trim()) throw new Error('repair requires an original unit with an ID');
  if (!isRecord(ownershipTransfer)) throw new Error('repair ownership transfer must be an object');
  const paths = finding.paths.map(normalizeRelative);
  if (paths.some((item) => isAlwaysProtectedPath(item, true))) throw new Error('repair cannot modify a protected repository or approved contract artifact');
  const outside = paths.filter((item) => !matchesAny(item, unit?.ownership?.allowed_paths ?? [], process.platform === 'win32'));
  if (outside.length === 0) return assignRepair({ finding, unit });

  const refreshed = await refreshApprovedOwnershipAuthority(ownershipTransfer.approvedOwnershipAuthority, { repositoryRoot });
  if (refreshed.errors.length > 0) throw new Error(refreshed.errors.join('; '));
  const authority = refreshed.claims;
  const revisedOwnership = authority.ownership_by_unit.get(unit.id);
  if (!isRecord(revisedOwnership)) throw new Error('revised authority does not define ownership for the original repair unit');
  if (!Number.isInteger(authority.contract.revision) || authority.contract.revision < 2) {
    throw new Error('repair ownership transfer requires a revised parallel contract revision');
  }
  if (
    typeof unit.frozen_contract_path !== 'string' ||
    ownershipTransfer.supersedes_contract_path !== unit.frozen_contract_path ||
    authority.contract.supersedes !== unit.frozen_contract_path
  ) {
    throw new Error('revised authority must supersede the original frozen contract path');
  }
  if (
    typeof ownershipTransfer.contract_hash !== 'string' ||
    ownershipTransfer.contract_hash === unit.contract_hash ||
    ownershipTransfer.contract_hash !== authority.contract.frozen_contract_hash
  ) {
    throw new Error('repair ownership transfer contract hash must match the new file-verified frozen contract');
  }
  const trustedAllowedPaths = normalizeOwnership(revisedOwnership).allowed_paths ?? [];
  let callerAllowedPaths;
  try {
    callerAllowedPaths = [...new Set((Array.isArray(ownershipTransfer.allowed_paths) ? ownershipTransfer.allowed_paths : []).map(normalizeRelative))].sort();
  } catch (error) {
    throw new Error(`repair ownership transfer allowed_paths are invalid: ${error.message}`);
  }
  if (JSON.stringify(callerAllowedPaths) !== JSON.stringify(trustedAllowedPaths)) {
    throw new Error('repair transfer allowed_paths must exactly match the trusted authority ownership scope; widening is forbidden');
  }
  const policyErrors = paths.flatMap((item) => validateOwnershipPathPolicy(
    item,
    revisedOwnership,
    authority.repository_case_insensitive === true
  ));
  if (policyErrors.length > 0) throw new Error(`repair path violates trusted authority ownership: ${policyErrors.join('; ')}`);
  if (typeof ownershipTransfer.workspace_path !== 'string' || !ownershipTransfer.workspace_path) {
    throw new Error('repair ownership transfer requires an integration workspace_path');
  }
  return {
    finding_id: finding.id,
    original_unit_id: unit.id,
    repair_owner: 'integration-owner',
    workspace_path: ownershipTransfer.workspace_path,
    base_result_ref: unit.result?.ref,
    contract_hash: authority.contract.frozen_contract_hash,
    allowed_paths: trustedAllowedPaths,
    ownership_transfer_approved: true,
    evidence_valid: false,
    status: finding.blocking && finding.deferred ? 'BLOCKED' : 'PENDING'
  };
}

export function createEvidence({ command, cwd, started_at = new Date().toISOString(), finished_at = new Date().toISOString(), exit_code, associated_head_or_diff, output, environment_fingerprint }) {
  return { command, cwd, started_at, finished_at, exit_code, associated_head_or_diff, output_digest: digest(output), environment_fingerprint, valid: true };
}

export function validateEvidence(evidence = {}, expected = {}) {
  if (!isRecord(evidence)) return ['evidence must be an object'];
  if (!isRecord(expected)) return ['expected evidence identity must be an object'];
  const errors = [];
  if (evidence.valid !== true) errors.push('evidence is stale or invalid');
  if (evidence.exit_code !== 0) errors.push('evidence exit code is non-zero');
  if (expected.cwd && evidence.cwd !== expected.cwd) errors.push('evidence cwd mismatch');
  if (expected.associated_head_or_diff && evidence.associated_head_or_diff !== expected.associated_head_or_diff) errors.push('evidence state mismatch');
  if (expected.output !== undefined && evidence.output_digest !== digest(expected.output)) errors.push('evidence output digest mismatch');
  if (!evidence.command || !evidence.started_at || !evidence.finished_at || !evidence.environment_fingerprint) errors.push('evidence is incomplete');
  return errors;
}

export function applyStateEvent(state, event) {
  const exceptional = {
    'CONTRACT_CHANGED': 'PLAN_REVISION_REQUIRED',
    'PATH_VIOLATION': 'UNIT_FAILED',
    'BLOCKING_FINDING': 'UNIT_BLOCKED',
    'MERGE_CONFLICT': 'INTEGRATION_BLOCKED'
  };
  if (event === 'WRITE' && state === 'GLOBAL_VERIFIED') return { state: 'GLOBAL_VERIFICATION_STALE' };
  if (event === 'WRITE' && state === 'BRANCH_READY') return { state: 'BRANCH_READY_STALE' };
  if (event === 'WRITE' && state === 'UNIT_VERIFIED') return { state: 'UNIT_VERIFICATION_STALE' };
  if (event === 'INTEGRATION_WRITE' && state === 'UNIT_VERIFIED') return { state: 'INTEGRATION_VERIFICATION_REQUIRED' };
  if (event === 'UNIT_REPAIRED') return { state: 'UNIT_REVIEWED' };
  return { state: exceptional[event] ?? state };
}

function ownershipOverlaps(units) {
  const roots = units.map((unit) => (unit.ownership?.allowed_paths ?? []).map(patternDescriptor));
  for (let i = 0; i < roots.length; i += 1) for (let j = i + 1; j < roots.length; j += 1) {
    if (roots[i].some((a) => roots[j].some((b) => ownershipPatternsMayIntersect(a, b)))) return true;
  }
  return false;
}

function resourcesOverlap(units) {
  const claimed = [];
  for (const unit of units) for (const resource of exclusiveResourceKeys(unit)) {
    if (claimed.some((item) => resourceClaimsOverlap(item, resource))) return true;
    claimed.push(resource);
  }
  return false;
}

function patternDescriptor(pattern) {
  const normalized = normalizeRelative(pattern).toLowerCase();
  const wildcardIndex = normalized.search(/[!*?+@{([]/);
  if (wildcardIndex === -1) return { root: normalized.replace(/\/$/, ''), prefix: normalized, partial_segment: false, wildcard: false };
  const prefix = normalized.slice(0, wildcardIndex);
  return {
    root: prefix.replace(/\/$/, ''),
    prefix,
    partial_segment: prefix.length > 0 && !prefix.endsWith('/'),
    wildcard: true
  };
}

function ownershipPatternsMayIntersect(left, right) {
  if (!left.root || !right.root) return true;
  if (repositoryPathsOverlap(left.root, right.root, true)) return true;
  if (left.partial_segment && right.prefix.startsWith(left.prefix)) return true;
  if (right.partial_segment && left.prefix.startsWith(right.prefix)) return true;
  return false;
}

function matchesAny(rel, patterns, caseInsensitive) {
  if (!Array.isArray(patterns)) return false;
  return patterns.some((pattern) => {
    try { return globRegex(pattern, caseInsensitive).test(caseInsensitive ? rel.toLowerCase() : rel); }
    catch { return false; }
  });
}

function globRegex(pattern, caseInsensitive) {
  let source = normalizeRelative(pattern);
  const globError = validateGlobPattern(pattern);
  if (globError) throw new Error(globError);
  if (caseInsensitive) source = source.toLowerCase();
  source = source.replace(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll('**', '\u0000').replaceAll('*', '[^/]*').replaceAll('?', '[^/]').replaceAll('\u0000', '.*');
  return new RegExp(`^${source}$`);
}

function parseGitNameStatus(status) {
  if (typeof status !== 'string' || !status) return { error: 'Git name-status must be a non-empty supported status' };
  if (new Set(['A', 'D', 'M', 'T', 'U', 'X', 'B', '??']).has(status)) return { kind: 'change' };
  const rename = status.match(/^R(?:(\d{1,3}))?$/);
  if (rename) {
    if (rename[1] === undefined || Number(rename[1]) <= 100) return { kind: 'rename' };
    return { error: `invalid Git rename score in name-status ${status}; expected R or R0..R100` };
  }
  if (status.startsWith('R')) return { error: `invalid Git rename name-status ${status}; expected R or R0..R100` };
  return { error: `invalid Git name-status ${status}` };
}

function normalizeRelative(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('repository-relative path must be a non-empty string');
  const raw = value.replaceAll('\\', '/');
  if (!raw || path.posix.isAbsolute(raw) || /^[A-Za-z]:/.test(raw)) throw new Error(`invalid repository-relative path: ${value}`);
  const normalized = path.posix.normalize(raw).replace(/^\.\//, '');
  if (normalized === '..' || normalized.startsWith('../')) throw new Error(`path escapes repository: ${value}`);
  return normalized;
}

function validateGlobPattern(value) {
  if (typeof value !== 'string' || !value.trim()) return 'glob pattern must be a non-empty string';
  let normalized;
  try { normalized = normalizeRelative(value); }
  catch (error) { return error.message; }
  if (/[^\x20-\x7e]/.test(normalized)) return `glob pattern contains unsupported control or non-ASCII syntax: ${value}`;
  if (/[\[\]{}()|!+@]/.test(normalized)) return `glob pattern uses unsupported syntax: ${value}`;
  if (/\*{3,}/.test(normalized)) return `glob pattern uses an invalid wildcard sequence: ${value}`;
  if (normalized.split('/').some((segment) => segment.includes('**') && segment !== '**')) {
    return `glob pattern requires ** to occupy a complete path segment: ${value}`;
  }
  return null;
}

function validateOwnershipShape(ownership, prefix) {
  if (!isRecord(ownership)) return [`${prefix} ownership must be an object`];
  const errors = [];
  const arrayFields = [
    'allowed_paths', 'prohibited_paths', 'allowed_lockfiles', 'exclusive_resources',
    'allocated_ports', 'sensitive_write_capabilities'
  ];
  for (const field of arrayFields) {
    const value = ownership[field];
    if (value !== undefined && !Array.isArray(value)) {
      errors.push(`${prefix} ownership.${field} must be an array`);
    }
  }
  for (const field of ['allowed_paths', 'prohibited_paths', 'allowed_lockfiles']) {
    if (!Array.isArray(ownership[field])) continue;
    for (const [index, pattern] of ownership[field].entries()) {
      const error = validateGlobPattern(pattern);
      if (error) errors.push(`${prefix} ownership.${field}[${index}] ${error}`);
    }
  }
  return errors;
}

function validateReadOnlyProof(unit, prefix, contract, repositoryRoot) {
  const errors = [];
  const proof = unit.read_only_proof;
  if (!isRecord(proof)) return [`${prefix} read-only execution requires read_only_proof`];
  const claims = CONSUMABLE_READ_ONLY_PROOFS.get(proof);
  if (claims) CONSUMABLE_READ_ONLY_PROOFS.delete(proof);
  if (!claims) {
    errors.push(`${prefix} requires a fresh one-shot trusted opaque parent-observed read-only proof lease`);
  } else {
    if (!absolutePathsEqual(claims.repository_root, repositoryRoot)) errors.push(`${prefix} read-only proof repository binding mismatch`);
    if (claims.request_hash !== contract?.request_hash || claims.scope_hash !== contract?.scope_hash) {
      errors.push(`${prefix} read-only proof request and scope binding mismatch`);
    }
    if (claims.unit_id !== unit.id) errors.push(`${prefix} read-only proof unit binding mismatch`);
    if (claims.result_digest !== canonicalDigest(unit.result)) errors.push(`${prefix} read-only proof result binding mismatch`);
  }
  for (const [label, value] of [
    ['result.changed_paths', unit.result?.changed_paths],
    ['parent-observed changed_paths', proof.changed_paths],
    ['parent-observed actual_writes', proof.actual_writes]
  ]) {
    if (!Array.isArray(value)) errors.push(`${prefix} read-only ${label} must be an array`);
    else if (value.length > 0) errors.push(`${prefix} read-only ${label} must prove zero writes and changed paths`);
  }
  for (const [label, value] of [['result.actual_writes', unit.result?.actual_writes], ['unit.actual_writes', unit.actual_writes]]) {
    if (value === undefined) continue;
    if (!Array.isArray(value)) errors.push(`${prefix} read-only ${label} must be an array`);
    else if (value.length > 0) errors.push(`${prefix} read-only ${label} must prove zero writes`);
  }
  return errors;
}

function validateOwnershipPathPolicy(rel, ownership, caseInsensitive, label = '') {
  const errors = [];
  const pathLabel = label ? `${label}: ${rel}` : rel;
  if (!matchesAny(rel, ownership.allowed_paths ?? [], caseInsensitive)) errors.push(`out-of-scope path: ${pathLabel}`);
  if (matchesAny(rel, ownership.prohibited_paths ?? [], caseInsensitive)) errors.push(`prohibited path: ${pathLabel}`);
  if (isAlwaysProtectedPath(rel, caseInsensitive)) errors.push(`protected repository path is never writable by a unit: ${pathLabel}`);
  const sensitiveCapability = sensitiveCapabilityForPath(rel, caseInsensitive);
  if (sensitiveCapability && !hasApprovedSensitiveCapability(ownership, sensitiveCapability)) {
    errors.push(`sensitive path requires frozen parent-approved ${sensitiveCapability} capability: ${pathLabel}`);
  }
  if (isLockfile(rel) && !matchesAny(rel, ownership.allowed_lockfiles ?? [], caseInsensitive)) {
    errors.push(`unauthorized lockfile: ${pathLabel}`);
  }
  return errors;
}

function protectedPatternRoot(pattern) {
  try {
    const descriptor = patternDescriptor(pattern);
    return isAlwaysProtectedPath(descriptor.root, true);
  } catch {
    return true;
  }
}

function validateFrozenOwnershipWithinPlanScope(units, planContext, caseInsensitive) {
  const errors = [];
  const planAllowed = Array.isArray(planContext.allowed_paths) ? planContext.allowed_paths : [];
  const planProhibited = Array.isArray(planContext.prohibited_paths) ? planContext.prohibited_paths : [];
  if (planAllowed.length === 0) return ['approved plan allowed_paths must be a non-empty array before issuing ownership authority'];
  if (!Array.isArray(planContext.prohibited_paths)) errors.push('approved plan prohibited_paths must be an array before issuing ownership authority');
  for (const [index, unit] of units.entries()) {
    if (!isRecord(unit) || !isRecord(unit.ownership)) {
      errors.push(`frozen unit at index ${index} requires an ownership object`);
      continue;
    }
    const prefix = `frozen unit ${unit.id ?? index}`;
    errors.push(...validateOwnershipShape(unit.ownership, prefix));
    for (const allowedPattern of (Array.isArray(unit.ownership.allowed_paths) ? unit.ownership.allowed_paths : [])) {
      if (!planAllowed.some((planPattern) => ownershipPatternIsContainedBy(allowedPattern, planPattern, caseInsensitive))) {
        errors.push(`${prefix} ownership pattern ${allowedPattern} widens outside approved plan allowed_paths`);
      }
      let allowedDescriptor;
      try { allowedDescriptor = patternDescriptor(allowedPattern); }
      catch { continue; }
      if (planProhibited.some((prohibitedPattern) => {
        try { return ownershipPatternsMayIntersect(allowedDescriptor, patternDescriptor(prohibitedPattern)); }
        catch { return true; }
      })) {
        errors.push(`${prefix} ownership pattern ${allowedPattern} intersects approved plan prohibited_paths`);
      }
    }
  }
  return errors;
}

export function ownershipPatternIsContainedBy(unitPattern, planPattern, caseInsensitive = process.platform === 'win32') {
  const normalizeCase = (value) => caseInsensitive ? value.toLowerCase() : value;
  const unit = normalizeCase(normalizeRelative(unitPattern));
  const plan = normalizeCase(normalizeRelative(planPattern));
  if (validateGlobPattern(unit) || validateGlobPattern(plan)) return false;
  if (unit === plan) return true;
  const planSegments = plan.split('/');
  if (planSegments.at(-1) !== '**' || planSegments.slice(0, -1).some((segment) => /[*?]/.test(segment))) return false;
  const planRoot = planSegments.slice(0, -1).join('/');
  if (!planRoot) return true;
  return unit.startsWith(`${planRoot}/`) || unit === planRoot;
}

function absolutePathsEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || !path.isAbsolute(left) || !path.isAbsolute(right)) return false;
  const a = path.resolve(left);
  const b = path.resolve(right);
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
}

function approvedOwnershipContractIdentity(contract) {
  return JSON.stringify(stableCanonicalize({
    source: contract?.source,
    contract_id: contract?.contract_id,
    approved_plan_path: contract?.approved_plan_path,
    approved_plan_hash: contract?.approved_plan_hash,
    frozen_contract_path: contract?.frozen_contract_path,
    frozen_contract_hash: contract?.frozen_contract_hash,
    ownership_manifest_digest: contract?.ownership_manifest_digest,
    revision: contract?.revision,
    supersedes: contract?.supersedes
  }));
}

function integrationDecisionIdentity(integration) {
  return JSON.stringify(canonicalizeIdentity({
    workspace_path: integration?.workspace_path,
    branch: integration?.branch,
    base_head: integration?.base_head,
    merge_strategy: integration?.merge_strategy,
    merge_order: integration?.merge_order,
    atomicity: integration?.atomicity,
    rollback_strategy: integration?.rollback_strategy
  }));
}

function fanInResultSetIdentity(units) {
  const normalized = (Array.isArray(units) ? units : []).map((unit) => ({
    id: unit?.id,
    status: unit?.status,
    contract_hash: unit?.contract_hash,
    ownership: unit?.ownership,
    result: unit?.result
  })).sort((left, right) => lexicalCompare(String(left.id ?? ''), String(right.id ?? '')));
  return canonicalDigest(normalized);
}

function frozenAuthorityResult(errors, fields = {}) {
  return Object.freeze({
    verified: errors.length === 0,
    errors: Object.freeze([...new Set(errors)].sort()),
    ...fields
  });
}

function safeRelativeArtifactPath(value, requiredPrefix, requiredSuffix, label, errors) {
  let normalized;
  try { normalized = normalizeRelative(value); }
  catch (error) {
    errors.push(`${label} path is invalid: ${error.message}`);
    return null;
  }
  if (!normalized.startsWith(requiredPrefix) || !normalized.endsWith(requiredSuffix)) {
    errors.push(`${label} path must be an immutable ${requiredSuffix} artifact under ${requiredPrefix}`);
    return null;
  }
  return normalized;
}

async function readImmutableAuthorityFile(rootReal, relativePath, label, errors) {
  const parts = relativePath.split('/');
  let cursor = rootReal;
  try {
    for (const part of parts) {
      cursor = path.join(cursor, part);
      const stat = await lstat(cursor);
      if (stat.isSymbolicLink()) throw new Error(`${label} path components must not be symbolic links`);
    }
    const stat = await lstat(cursor);
    if (!stat.isFile()) throw new Error(`${label} must be a regular file`);
    const realFile = await realpath(cursor);
    if (!isWithin(rootReal, realFile)) throw new Error(`${label} escapes repositoryRoot`);
    const bytes = await readFile(realFile);
    let text;
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
    catch { throw new Error(`${label} must contain valid UTF-8 bytes`); }
    return Object.freeze({ bytes, text });
  } catch (error) {
    const detail = error?.code === 'ENOENT' ? 'is missing or not found' : error.message;
    errors.push(`${label} authority file ${detail}`);
    return null;
  }
}

function parseEmbeddedPlanContext(planText, errors) {
  const normalized = String(planText ?? '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const frontmatterEnd = normalized.indexOf('\n---\n', 4);
  const body = frontmatterEnd === -1 ? normalized : normalized.slice(frontmatterEnd + 5);
  for (const match of body.matchAll(/^```(?:yaml|yml)\s*\n([\s\S]*?)^```\s*$/gm)) {
    const lines = match[1].split('\n');
    const rootIndex = lines.findIndex((line) => line.trim() === 'plan_context:');
    if (rootIndex === -1) continue;
    const rootIndent = lines[rootIndex].match(/^\s*/)[0].length;
    const result = {};
    let listKey = null;
    for (let index = rootIndex + 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (!line.trim()) continue;
      const indent = line.match(/^\s*/)[0].length;
      if (indent <= rootIndent) break;
      const field = line.match(new RegExp(`^ {${rootIndent + 2}}([A-Za-z_][A-Za-z0-9_-]*):(?:[ \\t]*(.*))?$`));
      if (field) {
        const [, key, raw = ''] = field;
        if (Object.hasOwn(result, key)) errors.push(`approved plan body plan_context duplicates ${key}`);
        result[key] = raw === '' ? [] : parseAuthorityScalar(raw);
        listKey = raw === '' ? key : null;
        continue;
      }
      const item = line.match(new RegExp(`^ {${rootIndent + 4}}-\\s+(.+)$`));
      if (item && listKey) result[listKey].push(parseAuthorityScalar(item[1]));
    }
    return result;
  }
  errors.push('approved plan body must contain a YAML plan_context block');
  return null;
}

function parseAuthorityScalar(raw) {
  const value = raw.trim();
  if (value === 'null' || value === '~') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1, -1);
  return value;
}

function repositoryPathsOverlap(left, right, caseInsensitive) {
  const normalizeCase = (value) => caseInsensitive ? value.toLowerCase() : value;
  const a = normalizeCase(left).replace(/\/$/, '');
  const b = normalizeCase(right).replace(/\/$/, '');
  return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
}

function normalizeOwnershipManifest(units) {
  return units.map((unit) => ({
    id: String(unit.id ?? ''),
    ownership: normalizeOwnership(unit.ownership)
  })).sort((left, right) => lexicalCompare(left.id, right.id));
}

function normalizeOwnership(ownership) {
  if (!isRecord(ownership)) return {};
  const pathArrays = new Set(['allowed_paths', 'prohibited_paths', 'allowed_lockfiles']);
  const pathScalars = new Set(['temp_root', 'cache_root', 'coverage_root']);
  const normalized = {};
  for (const key of Object.keys(ownership).sort()) {
    const value = ownership[key];
    if (value === undefined) continue;
    if (pathArrays.has(key)) {
      if (!Array.isArray(value)) throw new Error(`ownership.${key} must be an array`);
      normalized[key] = [...new Set(value.map(normalizeRelative))].sort();
    } else if (pathScalars.has(key) && value) {
      normalized[key] = normalizeRelative(value);
    } else {
      normalized[key] = stableCanonicalize(value);
    }
  }
  return normalized;
}

function stableCanonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(stableCanonicalize).sort((left, right) => lexicalCompare(JSON.stringify(left), JSON.stringify(right)));
  }
  if (isRecord(value)) {
    return Object.fromEntries(Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => [key, stableCanonicalize(value[key])]));
  }
  return value;
}

function canonicalizeIdentity(value) {
  if (Array.isArray(value)) return value.map(canonicalizeIdentity);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => [key, canonicalizeIdentity(value[key])])
    );
  }
  return value;
}

function lexicalCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function validateSensitiveCapabilityDeclarations(ownership, prefix) {
  const capabilities = ownership?.sensitive_write_capabilities;
  if (capabilities === undefined) return [];
  if (!Array.isArray(capabilities)) return [`${prefix} sensitive_write_capabilities must be an array`];
  const errors = [];
  for (const [index, entry] of capabilities.entries()) {
    if (!isRecord(entry)) {
      errors.push(`${prefix} sensitive_write_capabilities[${index}] must be an object`);
      continue;
    }
    if (!SENSITIVE_WRITE_CAPABILITIES.has(entry.capability)) errors.push(`${prefix} has an unknown sensitive write capability`);
    if (entry.approved_by !== 'parent' || typeof entry.approval_ref !== 'string' || !entry.approval_ref.trim()) {
      errors.push(`${prefix} sensitive write capability ${entry.capability ?? '<unknown>'} requires parent approval and approval_ref`);
    }
  }
  return errors;
}

function hasApprovedSensitiveCapability(ownership, capability) {
  return (ownership?.sensitive_write_capabilities ?? []).some((entry) =>
    isRecord(entry) && entry.capability === capability && entry.approved_by === 'parent' &&
    typeof entry.approval_ref === 'string' && Boolean(entry.approval_ref.trim()));
}

function isAlwaysProtectedPath(rel, caseInsensitive) {
  const value = caseInsensitive ? rel.toLowerCase() : rel;
  return value === '.git' || value.startsWith('.git/') ||
    value === '.sdcorejs/specs' || value.startsWith('.sdcorejs/specs/') ||
    value === '.sdcorejs/plans' || value.startsWith('.sdcorejs/plans/');
}

function sensitiveCapabilityForPath(rel, caseInsensitive) {
  const value = caseInsensitive ? rel.toLowerCase() : rel;
  if (isLockfile(value)) return 'lockfile';
  if (/(^|\/)\.env(?:\.|$)/.test(value)) return 'environment-file';
  if (/(^|\/)(package\.json|bower\.json|composer\.json|pyproject\.toml|cargo\.toml)$/.test(value)) return 'package-manifest';
  if (/(^|\/)(migrations?|migrate)(\/|$)/.test(value)) return 'migration';
  return null;
}

function isLockfile(rel) {
  return /(^|\/)(package-lock\.json|npm-shrinkwrap\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?)$/.test(rel.toLowerCase());
}

async function inspectFilesystemBoundary(repoRoot, rel, ownership, caseInsensitive) {
  const errors = [];
  const rootReal = await realpath(repoRoot);
  const parts = rel.split('/');
  let cursor = repoRoot;
  for (let index = 0; index < parts.length; index += 1) {
    cursor = path.join(cursor, parts[index]);
    const stat = await lstat(cursor).catch(() => null);
    if (stat?.isSymbolicLink()) {
      const target = await realpath(cursor).catch(() => null);
      if (!target || !isWithin(rootReal, target)) errors.push(`symlink escape: ${rel}`);
      else {
        const projected = path.join(target, ...parts.slice(index + 1));
        const projectedRel = normalizeRelative(path.relative(rootReal, projected));
        const projectedPolicy = validateOwnershipPathPolicy(projectedRel, ownership, caseInsensitive, `projected symlink target for ${rel}`);
        errors.push(...projectedPolicy);
        if (projectedPolicy.some((error) => /out-of-scope|prohibited path/.test(error))) errors.push(`symlink ownership escape: ${rel} -> ${projectedRel}`);
      }
    }
    if (cursor !== repoRoot && await exists(path.join(cursor, '.git'))) errors.push(`nested repository boundary: ${rel}`);
  }
  return errors;
}

function isWithin(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

async function firstSymbolicLinkComponent(absolutePath) {
  const resolved = path.resolve(absolutePath);
  const parsed = path.parse(resolved);
  let current = parsed.root;
  const components = resolved.slice(parsed.root.length).split(path.sep).filter(Boolean);
  for (const component of components) {
    current = path.join(current, component);
    const stat = await lstat(current);
    if (stat.isSymbolicLink()) return current;
  }
  return null;
}

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

function digest(value) {
  return createHash('sha256').update(String(value ?? '')).digest('hex');
}

function digestBytes(value) {
  return createHash('sha256').update(value).digest('hex');
}

function canonicalDigest(value) {
  return digest(JSON.stringify(canonicalizeIdentity(value)));
}

async function detectRepositoryCaseInsensitivity(repositoryRoot) {
  const marker = path.join(repositoryRoot, '.git');
  const alternateMarker = path.join(repositoryRoot, '.GIT');
  const [markerReal, markerStat] = await Promise.all([
    realpath(marker),
    lstat(marker, { bigint: true })
  ]);
  const alternateReal = await realpath(alternateMarker).catch((error) => {
    if (error?.code === 'ENOENT') return null;
    throw error;
  });
  if (!alternateReal) return false;
  const alternateStat = await lstat(alternateMarker, { bigint: true });
  return (
    markerReal === alternateReal &&
    markerStat.dev === alternateStat.dev &&
    markerStat.ino === alternateStat.ino
  );
}

async function captureCanonicalRepositoryIdentity(repositoryRoot) {
  const rootReal = await realpath(repositoryRoot);
  const runGitIdentityCommand = async (args) => {
    try {
      const { stdout } = await execFileAsync('git', args, {
        cwd: rootReal,
        encoding: 'utf8',
        maxBuffer: 4 * 1024 * 1024,
        env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
        windowsHide: true
      });
      return String(stdout ?? '').trim();
    } catch (error) {
      const detail = String(error?.stderr ?? error?.message ?? error).trim();
      throw new Error(`Git repository identity failed for ${args.join(' ')}: ${detail}`);
    }
  };
  const [topLevel, gitDirValue, commonDirValue, objectFormat] = await Promise.all([
    runGitIdentityCommand(['rev-parse', '--show-toplevel']),
    runGitIdentityCommand(['rev-parse', '--git-dir']),
    runGitIdentityCommand(['rev-parse', '--git-common-dir']),
    runGitIdentityCommand(['rev-parse', '--show-object-format'])
  ]);
  const topLevelReal = await realpath(topLevel);
  if (!absolutePathsEqual(topLevelReal, rootReal)) throw new Error('repositoryRoot must be the canonical Git top-level directory');
  const resolveGitPath = async (value, label) => {
    if (!value) throw new Error(`${label} is empty`);
    const absolute = path.isAbsolute(value) ? value : path.resolve(rootReal, value);
    return realpath(absolute);
  };
  const gitDirReal = await resolveGitPath(gitDirValue, 'Git directory');
  const commonDirReal = await resolveGitPath(commonDirValue, 'Git common directory');
  const [rootStat, gitDirStat, commonDirStat, caseInsensitive] = await Promise.all([
    lstat(rootReal, { bigint: true }),
    lstat(gitDirReal, { bigint: true }),
    lstat(commonDirReal, { bigint: true }),
    detectRepositoryCaseInsensitivity(rootReal)
  ]);
  if (!rootStat.isDirectory() || !gitDirStat.isDirectory() || !commonDirStat.isDirectory()) {
    throw new Error('canonical repository identity requires directory-backed repository and Git metadata roots');
  }
  const filesystemIdentity = (stat) => ({
    device: String(stat.dev),
    inode: String(stat.ino),
    birthtime_ns: String(stat.birthtimeNs ?? stat.birthtimeMs ?? '')
  });
  const identity = {
    repository_root: rootReal,
    repository_filesystem_identity: filesystemIdentity(rootStat),
    git_directory: gitDirReal,
    git_directory_filesystem_identity: filesystemIdentity(gitDirStat),
    git_common_directory: commonDirReal,
    git_common_directory_filesystem_identity: filesystemIdentity(commonDirStat),
    object_format: objectFormat,
    case_insensitive: caseInsensitive
  };
  return Object.freeze({ ...identity, digest: canonicalDigest(identity) });
}

async function captureRepositoryState(repositoryRoot) {
  const rootReal = await realpath(repositoryRoot);
  const repositoryIdentity = await captureCanonicalRepositoryIdentity(rootReal);
  const runGitSnapshotCommand = async (args, { allowedExitCodes = [] } = {}) => {
    try {
      const { stdout } = await execFileAsync('git', args, {
        cwd: rootReal,
        encoding: 'buffer',
        maxBuffer: 64 * 1024 * 1024,
        env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
        windowsHide: true
      });
      return Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout ?? '');
    } catch (error) {
      if (allowedExitCodes.includes(error?.code)) {
        return Buffer.isBuffer(error?.stdout) ? error.stdout : Buffer.from(error?.stdout ?? '');
      }
      const detail = Buffer.isBuffer(error?.stderr) ? error.stderr.toString('utf8').trim() : String(error?.message ?? error);
      throw new Error(`Git repository observation failed for ${args.join(' ')}: ${detail}`);
    }
  };
  const topLevel = (await runGitSnapshotCommand(['rev-parse', '--show-toplevel'])).toString('utf8').trim();
  const topLevelReal = await realpath(topLevel);
  if (!absolutePathsEqual(topLevelReal, rootReal)) throw new Error('repositoryRoot must be the canonical Git top-level directory');
  const [
    head, symbolicHead, refs, indexEntries, localConfig, worktrees,
    porcelain, unstagedDiff, stagedDiff, rawIndexEntries, unstagedPaths,
    untrackedList, ignoredList
  ] = await Promise.all([
    runGitSnapshotCommand(['rev-parse', '--verify', 'HEAD']),
    runGitSnapshotCommand(['symbolic-ref', '-q', 'HEAD'], { allowedExitCodes: [1] }),
    runGitSnapshotCommand(['for-each-ref', '--format=%(refname)%00%(objectname)%00%(symref)%00']),
    runGitSnapshotCommand(['ls-files', '--stage', '-v', '-z']),
    runGitSnapshotCommand(['config', '--local', '--null', '--list']),
    runGitSnapshotCommand(['worktree', 'list', '--porcelain', '-z']),
    runGitSnapshotCommand(['status', '--porcelain=v1', '-z', '--untracked-files=all']),
    runGitSnapshotCommand(['diff', '--binary', '--no-ext-diff', '--']),
    runGitSnapshotCommand(['diff', '--cached', '--binary', '--no-ext-diff', '--']),
    runGitSnapshotCommand(['ls-files', '--stage', '-z']),
    runGitSnapshotCommand(['diff', '--name-only', '-z', '--no-ext-diff', '--']),
    runGitSnapshotCommand(['ls-files', '--others', '--exclude-standard', '-z']),
    runGitSnapshotCommand(['ls-files', '--others', '--ignored', '--exclude-standard', '-z'])
  ]);
  const snapshotOtherPaths = async (buffer, label) => {
    const candidates = buffer.toString('utf8').split('\0').filter(Boolean).sort(lexicalCompare);
    const snapshots = [];
    for (const candidate of candidates) {
      const relative = normalizeRelative(candidate);
      const absolute = path.resolve(rootReal, ...relative.split('/'));
      if (!isWithin(rootReal, absolute)) throw new Error(`${label} repository path escapes repositoryRoot: ${relative}`);
      const stat = await lstat(absolute).catch((error) => {
        if (error?.code === 'ENOENT') return null;
        throw error;
      });
      if (!stat) {
        snapshots.push({ path: relative, kind: 'missing' });
        continue;
      }
      if (stat.isSymbolicLink()) {
        snapshots.push({ path: relative, kind: 'symlink', target_digest: digest(await readlink(absolute)) });
      } else if (stat.isFile()) {
        snapshots.push({ path: relative, kind: 'file', mode: stat.mode, size: stat.size, content_digest: digestBytes(await readFile(absolute)) });
      } else {
        snapshots.push({ path: relative, kind: stat.isDirectory() ? 'directory' : 'other', mode: stat.mode, size: stat.size });
      }
    }
    return snapshots;
  };
  const parseIndexPathState = (buffer) => {
    const byPath = new Map();
    for (const record of buffer.toString('utf8').split('\0').filter(Boolean)) {
      const separator = record.indexOf('\t');
      if (separator < 1) throw new Error('Git index observation returned a malformed stage entry');
      const metadata = record.slice(0, separator);
      const relative = normalizeRelative(record.slice(separator + 1));
      const entries = byPath.get(relative) ?? [];
      entries.push(metadata);
      byPath.set(relative, entries);
    }
    return [...byPath]
      .map(([entryPath, entries]) => ({ path: entryPath, entries: entries.sort(lexicalCompare) }))
      .sort((left, right) => lexicalCompare(left.path, right.path));
  };
  const snapshotEmptyDirectories = async () => {
    const excludedRoots = [repositoryIdentity.git_directory, repositoryIdentity.git_common_directory]
      .filter((value, index, values) => values.indexOf(value) === index);
    const isExcluded = (candidate) => excludedRoots.some((excluded) => (
      absolutePathsEqual(candidate, excluded) || isWithin(excluded, candidate)
    ));
    const snapshots = [];
    const visit = async (directory) => {
      const entries = (await readdir(directory, { withFileTypes: true }))
        .sort((left, right) => lexicalCompare(left.name, right.name));
      const visibleEntries = [];
      for (const entry of entries) {
        const absolute = path.join(directory, entry.name);
        if (isExcluded(absolute)) continue;
        visibleEntries.push(entry);
        if (entry.isDirectory()) await visit(absolute);
      }
      if (directory !== rootReal && visibleEntries.length === 0) {
        const stat = await lstat(directory);
        snapshots.push({
          path: normalizeRelative(path.relative(rootReal, directory)),
          kind: 'empty-directory',
          mode: stat.mode
        });
      }
    };
    await visit(rootReal);
    return snapshots.sort((left, right) => lexicalCompare(left.path, right.path));
  };
  const snapshotStableMetadataPath = async (absoluteRoot, label) => {
    const snapshots = [];
    const visit = async (absolute, relative = '') => {
      const stat = await lstat(absolute).catch((error) => {
        if (error?.code === 'ENOENT') return null;
        throw error;
      });
      const snapshotPath = relative ? `${label}/${relative.replaceAll('\\', '/')}` : label;
      if (!stat) {
        snapshots.push({ path: snapshotPath, kind: 'missing' });
        return;
      }
      if (stat.isSymbolicLink()) {
        snapshots.push({ path: snapshotPath, kind: 'symlink', target_digest: digest(await readlink(absolute)) });
        return;
      }
      if (stat.isFile()) {
        snapshots.push({
          path: snapshotPath,
          kind: 'file',
          mode: stat.mode,
          size: stat.size,
          content_digest: digestBytes(await readFile(absolute))
        });
        return;
      }
      if (!stat.isDirectory()) {
        snapshots.push({ path: snapshotPath, kind: 'other', mode: stat.mode, size: stat.size });
        return;
      }
      snapshots.push({ path: snapshotPath, kind: 'directory', mode: stat.mode });
      const entries = (await readdir(absolute, { withFileTypes: true }))
        .sort((left, right) => lexicalCompare(left.name, right.name));
      for (const entry of entries) {
        await visit(path.join(absolute, entry.name), relative ? `${relative}/${entry.name}` : entry.name);
      }
    };
    await visit(absoluteRoot);
    return snapshots;
  };
  const stableMetadataScopes = [
    [path.join(repositoryIdentity.git_common_directory, 'objects'), 'common/objects'],
    [path.join(repositoryIdentity.git_common_directory, 'hooks'), 'common/hooks'],
    [path.join(repositoryIdentity.git_common_directory, 'info'), 'common/info'],
    [path.join(repositoryIdentity.git_common_directory, 'packed-refs'), 'common/packed-refs'],
    [path.join(repositoryIdentity.git_common_directory, 'shallow'), 'common/shallow'],
    [path.join(repositoryIdentity.git_directory, 'config.worktree'), 'worktree/config.worktree']
  ];
  const [untracked, ignored, dirtyTracked, emptyDirectories, ...stableMetadataParts] = await Promise.all([
    snapshotOtherPaths(untrackedList, 'untracked'),
    snapshotOtherPaths(ignoredList, 'ignored'),
    snapshotOtherPaths(unstagedPaths, 'dirty tracked'),
    snapshotEmptyDirectories(),
    ...stableMetadataScopes.map(([absolute, label]) => snapshotStableMetadataPath(absolute, label))
  ]);
  const gitStableMetadata = stableMetadataParts.flat().sort((left, right) => lexicalCompare(left.path, right.path));
  const state = {
    repository_root: rootReal,
    repository_identity: repositoryIdentity.digest,
    head: head.toString('utf8').trim(),
    symbolic_head: symbolicHead.toString('utf8').trim() || null,
    refs_digest: digestBytes(refs),
    index_digest: digestBytes(indexEntries),
    local_config_digest: digestBytes(localConfig),
    worktrees_digest: digestBytes(worktrees),
    porcelain_digest: digestBytes(porcelain),
    unstaged_diff_digest: digestBytes(unstagedDiff),
    staged_diff_digest: digestBytes(stagedDiff),
    index_path_state: parseIndexPathState(rawIndexEntries),
    dirty_tracked: dirtyTracked,
    untracked,
    ignored,
    empty_directories: emptyDirectories,
    git_stable_metadata_scope: stableMetadataScopes.map(([, label]) => label),
    git_stable_metadata: gitStableMetadata
  };
  return Object.freeze({ ...state, digest: canonicalDigest(state) });
}

function deriveRepositoryChangedPaths(beforeState, afterState) {
  const changed = new Set();
  const comparePathSnapshots = (beforeEntries, afterEntries, { directory = false } = {}) => {
    const beforeByPath = new Map((Array.isArray(beforeEntries) ? beforeEntries : []).map((entry) => [entry.path, canonicalDigest(entry)]));
    const afterByPath = new Map((Array.isArray(afterEntries) ? afterEntries : []).map((entry) => [entry.path, canonicalDigest(entry)]));
    for (const entryPath of new Set([...beforeByPath.keys(), ...afterByPath.keys()])) {
      if (beforeByPath.get(entryPath) !== afterByPath.get(entryPath)) {
        changed.add(directory ? `${entryPath.replace(/\/$/, '')}/` : entryPath);
      }
    }
  };
  for (const field of ['index_path_state', 'dirty_tracked', 'untracked', 'ignored']) {
    comparePathSnapshots(beforeState?.[field], afterState?.[field]);
  }
  comparePathSnapshots(beforeState?.empty_directories, afterState?.empty_directories, { directory: true });
  return [...changed].sort(lexicalCompare);
}

function validateInternallyObservedUnitPaths(changedPaths, unit, ownership, caseInsensitive) {
  const errors = [];
  const reported = new Set((unit.result?.changed_paths ?? []).map((item) => {
    const normalized = normalizeRelative(item);
    return caseInsensitive ? normalized.toLowerCase() : normalized;
  }));
  for (const changedPath of changedPaths) {
    errors.push(...validateOwnershipPathPolicy(changedPath, ownership, caseInsensitive, `internally observed actual changed path for unit ${unit.id}`));
    if (changedPath.endsWith('/')) continue;
    const comparable = caseInsensitive ? changedPath.toLowerCase() : changedPath;
    if (!reported.has(comparable)) {
      errors.push(`internally observed actual changed path is absent from unit ${unit.id} result.changed_paths: ${changedPath}`);
    }
  }
  return [...new Set(errors)];
}

function withTimeout(promise, timeoutMs) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error('unit timeout');
      error.kind = 'timeout';
      reject(error);
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function rollbackCurrentUnit(unit, checkpoint, rollbackUnit, repositoryRoot, expectedState) {
  try {
    await rollbackUnit(unit, checkpoint);
  } catch (error) {
    return new Error(`current unit rollback callback failed: ${error.message}`);
  }
  let afterRollback;
  try { afterRollback = await captureRepositoryState(repositoryRoot); }
  catch (error) { return new Error(`current unit rollback state verification failed: ${error.message}`); }
  if (afterRollback.digest !== expectedState?.digest) {
    return new Error('current unit rollback did not restore the independently captured pre-unit repository state');
  }
  return null;
}

async function rollbackGlobalAndVerify({ rollback, unitIds, repositoryRoot, expectedState }) {
  try {
    await rollback([...unitIds]);
  } catch (error) {
    return new Error(`global rollback callback failed: ${error.message}`);
  }
  let afterRollback;
  try { afterRollback = await captureRepositoryState(repositoryRoot); }
  catch (error) { return new Error(`global rollback state verification failed: ${error.message}`); }
  if (afterRollback.digest !== expectedState?.digest) {
    return new Error('global rollback did not restore the independently captured pre-fan-in repository state');
  }
  return null;
}

function exclusiveResourceKeys(unit) {
  const ownership = unit.ownership ?? {};
  const values = [
    ...(ownership.exclusive_resources ?? []).map(normalizeExclusiveResource),
    ...(ownership.allocated_ports ?? []).map((item) => ({ type: 'port', value: String(item).toLowerCase(), hierarchical: false })),
    ownership.database_namespace && { type: 'db', value: String(ownership.database_namespace).toLowerCase(), hierarchical: false },
    ownership.temp_root && pathResource('temp', ownership.temp_root),
    ownership.cache_root && pathResource('cache', ownership.cache_root),
    ownership.coverage_root && pathResource('coverage', ownership.coverage_root)
  ];
  return values.filter(Boolean);
}

function isDisjointSameTreeSafe(unit) {
  if (unit.workspace?.mechanically_disjoint !== true) return false;
  const command = String(unit.verification?.command ?? '').toLowerCase();
  if (/\b(install|format|prettier|eslint\s+--fix|git\s+(add|commit|checkout)|generate|codegen)\b/.test(command)) return false;
  return true;
}

function isParentValidationPass(verdict, unit, kind) {
  if (verdict?.status !== 'PASS') return false;
  if (!isRecord(unit?.result) || verdict.associated_head_or_diff !== unit.result.associated_head_or_diff) return false;
  if (kind === 'path') {
    if (
      validateChangedPathArray(verdict.changed_paths, 'parent validation verdict changed_paths').length > 0 ||
      validateChangedPathArray(unit.result.changed_paths, 'unit result changed_paths').length > 0
    ) return false;
    const actual = [...new Set(verdict.changed_paths)].sort();
    const result = [...new Set(unit.result.changed_paths)].sort();
    return JSON.stringify(actual) === JSON.stringify(result);
  }
  return Array.isArray(verdict.blockers) && verdict.blockers.length === 0;
}

function normalizeExclusiveResource(value) {
  const raw = String(value).trim();
  const match = raw.match(/^(port|db|temp|cache|coverage):(.*)$/i);
  if (!match) return { type: 'exclusive', value: raw.toLowerCase(), hierarchical: false };
  const type = match[1].toLowerCase();
  return ['temp', 'cache', 'coverage'].includes(type)
    ? pathResource(type, match[2])
    : { type, value: match[2].toLowerCase(), hierarchical: false };
}

function pathResource(type, value) {
  const raw = String(value).replaceAll('\\', '/');
  const normalized = path.posix.normalize(raw).replace(/^\.\//, '').replace(/\/$/, '').toLowerCase();
  const invalid = path.posix.isAbsolute(raw) || normalized === '..' || normalized.startsWith('../');
  return { type, value: normalized, hierarchical: true, invalid };
}

function resourceClaimsOverlap(left, right) {
  if (left.invalid || right.invalid) return true;
  if (left.type !== right.type) return false;
  if (!left.hierarchical || !right.hierarchical) return left.value === right.value;
  return left.value === right.value || left.value.startsWith(`${right.value}/`) || right.value.startsWith(`${left.value}/`);
}
