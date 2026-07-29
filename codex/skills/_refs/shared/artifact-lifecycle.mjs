#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  buildCanonicalEntryPath,
  buildLegacyEntryPath,
  classifyDocumentationPath,
  discoverDocumentationEntries,
  resolveDocumentationEntryState,
  validateGuideImageRelationship,
  validateSharedOwnership,
} from './documentation-layout.mjs';

const execFileAsync = promisify(execFile);

const LOCAL_ONLY_PATTERNS = [
  /^\.sdcorejs\/tasks\/current-session\.md$/i,
  /^\.sdcorejs\/tasks\/sessions\//i,
  /^\.sdcorejs\/(?:cache|caches|tmp|temp|traces?|storage|codegraph-cache)\//i,
  /^\.sdcorejs\/.*(?:auth-state|browser-state|storage-state)(?:\/|\.|$)/i,
  /\.(?:har|log|trace|webm)$/i,
];

const ARTIFACT_KIND_BY_PATH = [
  [/^\.sdcorejs\/specs\//i, 'spec'],
  [/^\.sdcorejs\/plans\//i, 'plan'],
  [/^\.sdcorejs\/docs\/product\//i, 'feature-ledger'],
  [/^\.sdcorejs\/docs\//i, 'execution-doc'],
  [/^\.sdcorejs\/documentation\//i, 'documentation-asset'],
  [/^\.sdcorejs\/handoffs\//i, 'handoff'],
  [/^\.sdcorejs\/memories\//i, 'memory'],
  [/^\.sdcorejs\/tasks\//i, 'task'],
  [/^\.sdcorejs\/persona\.md$/i, 'persona'],
  [/^\.sdcorejs\/summary\.md$/i, 'summary'],
];

const SHARED_KINDS = new Set(['memory', 'persona', 'summary', 'task']);
const CHANGE_SCOPED_KINDS = new Set([
  'documentation-asset',
  'execution-doc',
  'feature-ledger',
  'plan',
  'spec',
]);

export async function buildArtifactClosure({
  root,
  changeRef,
  artifactContext = {},
  owner,
  mode = 'commit',
  ownedSharedPaths = [],
} = {}) {
  const targetRoot = path.resolve(root ?? process.cwd());
  const discovery = await discoverChangedArtifacts(targetRoot);
  const runtimeBuckets = normalizeRuntimeContext(artifactContext);
  const invalidContextPaths = runtimeBuckets.invalid_paths;
  const classifications = [];
  const discoveredContents = new Map();

  for (const relativePath of discovery.discoveredPaths) {
    discoveredContents.set(
      relativePath,
      await readFile(path.join(targetRoot, relativePath), 'utf8').catch(() => ''),
    );
  }
  const projectedDocumentationContents =
    await collectProjectedDocumentationContents(
      targetRoot,
      discovery.discoveredPaths,
      discoveredContents,
    );
  const documentationDuplicates = analyzeDocumentationDuplicates(
    projectedDocumentationContents,
  );

  for (const relativePath of discovery.discoveredPaths) {
    const content = discoveredContents.get(relativePath) ?? '';
    const metadata = parseArtifactFrontmatter(content);
    let classification = classifyArtifact({
      path: relativePath,
      metadata,
      changeRef,
      owner,
      ownedSharedPaths,
      runtimeBuckets,
    });
    const duplicate = documentationDuplicates.byPath.get(relativePath);
    if (duplicate?.state === 'equivalent-legacy') {
      classification = unrelated(
        relativePath,
        'documentation-asset',
        metadata,
        'equivalent legacy documentation copy is superseded by canonical entry',
      );
    } else if (duplicate?.state === 'conflict') {
      classification = unknown(
        relativePath,
        'documentation-asset',
        metadata,
        'canonical and legacy documentation entries conflict',
      );
    }
    const sensitiveCategories = scanSensitiveArtifactContent(relativePath, content);
    classifications.push({
      ...classification,
      git_status: discovery.statusByPath[relativePath] ?? [],
      sensitive_categories: sensitiveCategories,
    });
  }

  const byBucket = Object.groupBy
    ? Object.groupBy(classifications, (item) => item.bucket)
    : groupBy(classifications, (item) => item.bucket);
  const requiredPaths = uniquePaths(byBucket.required_with_change);
  const sharedOwnedPaths = uniquePaths(byBucket.shared_owned);
  const conditionalPaths = uniquePaths(byBucket.conditional);
  const localOnlyPaths = uniquePaths(byBucket.local_only);
  const unrelatedPaths = uniquePaths(byBucket.unrelated);
  const unknownPaths = uniquePaths(byBucket.unknown);
  const sensitivePaths = classifications
    .filter((item) => item.sensitive_categories.length > 0)
    .map((item) => ({
      path: item.path,
      categories: item.sensitive_categories,
    }));

  const missingRequiredPaths = [];
  for (const requiredPath of runtimeBuckets.required_with_change) {
    if (await exists(path.join(targetRoot, requiredPath))) continue;
    if (await existsAtHead(targetRoot, requiredPath)) continue;
    missingRequiredPaths.push(requiredPath);
  }

  const conditionalIncludedPaths = conditionalPaths.filter((candidatePath) => {
    if (ownedSharedPaths.map(normalizePath).includes(candidatePath)) return true;
    const classification = classifications.find((item) => item.path === candidatePath);
    const metadataOwner = normalizeRef(classification?.metadata?.owner);
    return Boolean(owner && metadataOwner && normalizeRef(owner) === metadataOwner);
  });
  const discoveryFailures = discovery.commandsRun.filter((item) => item.exit !== 0);
  const includedPaths = unique([
    ...requiredPaths,
    ...sharedOwnedPaths,
    ...conditionalIncludedPaths,
  ]);
  const uncommittedIncludedPaths = includedPaths.filter((item) =>
    discovery.discoveredPaths.includes(item)
  );
  const blockers = [];
  if (invalidContextPaths.length > 0) blockers.push('artifact_context contains an invalid or out-of-root path');
  if (discoveryFailures.length > 0) blockers.push('artifact discovery failed');
  if (missingRequiredPaths.length > 0) blockers.push('required artifact missing');
  if (unknownPaths.length > 0) blockers.push('unknown artifact may belong to the change');
  if (sensitivePaths.length > 0) blockers.push('secret or PII screening requires remediation');
  if (documentationDuplicates.conflicts.length > 0) {
    blockers.push('documentation canonical/legacy conflict');
  }
  if (mode === 'push' && uncommittedIncludedPaths.length > 0) {
    blockers.push('artifact closure incomplete: required artifacts remain uncommitted');
  }

  let closureResult = 'complete';
  if (unknownPaths.length > 0) closureResult = 'ambiguous';
  else if (blockers.length > 0) closureResult = 'incomplete';

  return {
    sdcorejs_artifacts: {
      change_ref: changeRef ?? artifactContext.change_ref ?? null,
      discovery_complete: discoveryFailures.length === 0,
      discovery_errors: discoveryFailures,
      discovered_paths: discovery.discoveredPaths,
      required_paths: requiredPaths,
      shared_owned_paths: sharedOwnedPaths,
      conditional_paths: conditionalPaths,
      included_paths: includedPaths,
      excluded_unrelated_paths: unrelatedPaths,
      local_only_paths: localOnlyPaths,
      unknown_paths: unknownPaths,
      missing_required_paths: missingRequiredPaths,
      invalid_context_paths: invalidContextPaths,
      documentation_layout_conflicts: documentationDuplicates.conflicts,
      uncommitted_included_paths: mode === 'push' ? uncommittedIncludedPaths : [],
      sensitive_paths: sensitivePaths,
      closure_result: closureResult,
      blockers,
      staging_policy: 'explicit-paths-only',
      push_allowed: mode === 'push' ? closureResult === 'complete' : null,
    },
    classifications,
    discovery,
  };
}

export async function discoverChangedArtifacts(root) {
  const targetRoot = path.resolve(root);
  const commands = [
    ['git', ['status', '--short', '--untracked-files=all', '--', '.sdcorejs']],
    ['git', ['diff', '--name-status', '--', '.sdcorejs']],
    ['git', ['diff', '--cached', '--name-status', '--', '.sdcorejs']],
  ];
  const statusByPath = {};
  const discovered = new Set();
  const commandsRun = [];

  for (const [command, args] of commands) {
    const display = `${command} ${args.join(' ')}`;
    try {
      const { stdout } = await execFileAsync(command, args, {
        cwd: targetRoot,
        encoding: 'utf8',
        maxBuffer: 5 * 1024 * 1024,
      });
      commandsRun.push({ command: display, exit: 0 });
      for (const record of parseGitPathOutput(stdout, args.includes('--short'))) {
        if (!record.path.startsWith('.sdcorejs/')) continue;
        discovered.add(record.path);
        statusByPath[record.path] ??= [];
        statusByPath[record.path].push(record.status);
      }
    } catch (error) {
      commandsRun.push({ command: display, exit: error?.code ?? 1 });
    }
  }

  return {
    discoveredPaths: [...discovered].sort(),
    statusByPath,
    commandsRun,
    complete: commandsRun.every((item) => item.exit === 0),
    errors: commandsRun.filter((item) => item.exit !== 0),
  };
}

export function classifyArtifact({
  path: artifactPath,
  metadata = {},
  changeRef,
  owner,
  ownedSharedPaths = [],
  runtimeBuckets = normalizeRuntimeContext({}),
} = {}) {
  const normalizedPath = normalizePath(artifactPath);
  if (LOCAL_ONLY_PATTERNS.some((pattern) => pattern.test(normalizedPath))) {
    return {
      path: normalizedPath,
      kind: normalizedPath.endsWith('/current-session.md') ? 'legacy-session-checkpoint' : 'diagnostic',
      lifecycle: 'diagnostic-local',
      commit_policy: 'never',
      bucket: 'local_only',
      reason: 'local state, cache, trace, storage state, or legacy checkpoint',
      metadata,
    };
  }

  const kind = metadata.artifact_kind ?? inferArtifactKind(normalizedPath);
  const artifactChangeRef = normalizeRef(metadata.change_ref);
  const requestedChangeRef = normalizeRef(changeRef);
  const metadataOwner = normalizeRef(metadata.owner);
  const currentOwner = normalizeRef(owner);
  const commitPolicy = metadata.commit_policy ?? defaultCommitPolicy(kind);
  const runtimeBucket = findRuntimeBucket(normalizedPath, runtimeBuckets);
  const runtimeEntry = findRuntimeEntry(normalizedPath, runtimeBuckets);

  if (
    kind === 'documentation-asset' &&
    runtimeBucket === 'required_with_change'
  ) {
    const promotion = validateDocumentationRuntimePromotion(
      normalizedPath,
      runtimeEntry,
    );
    if (!promotion.ok) {
      return unknown(
        normalizedPath,
        kind,
        metadata,
        `documentation promotion rejected: ${promotion.code}`,
      );
    }
  }

  if (SHARED_KINDS.has(kind)) {
    const explicitlyOwned =
      ownedSharedPaths.map(normalizePath).includes(normalizedPath) ||
      (currentOwner && metadataOwner && currentOwner === metadataOwner);

    if (runtimeBucket === 'local_only' || runtimeBucket === 'unrelated') {
      return {
        path: normalizedPath,
        kind,
        lifecycle: lifecycleForBucket(runtimeBucket),
        commit_policy: policyForBucket(runtimeBucket),
        bucket: runtimeBucket,
        reason: `runtime artifact_context excludes shared artifact as ${runtimeBucket}`,
        metadata,
      };
    }

    const runtimeRequestsOwnership =
      runtimeBucket === 'required_with_change' || runtimeBucket === 'shared_owned';
    const bucket =
      runtimeBucket === 'conditional' || !explicitlyOwned
        ? 'conditional'
        : runtimeRequestsOwnership || !runtimeBucket
          ? 'shared_owned'
          : 'conditional';
    let reason = explicitlyOwned
      ? 'current workflow owns the shared artifact'
      : 'shared artifact requires explicit ownership';
    if (runtimeBucket === 'required_with_change') {
      reason = explicitlyOwned
        ? 'runtime required bucket normalized to shared_owned'
        : 'runtime required bucket rejected because shared ownership is not proven';
    } else if (runtimeBucket === 'shared_owned' && !explicitlyOwned) {
      reason = 'runtime shared_owned bucket rejected because shared ownership is not proven';
    }

    return {
      path: normalizedPath,
      kind,
      lifecycle: 'shared-durable',
      commit_policy: commitPolicy === 'never' ? 'never' : 'conditional',
      bucket,
      reason,
      metadata,
    };
  }

  if (runtimeBucket) {
    return {
      path: normalizedPath,
      kind,
      lifecycle: lifecycleForBucket(runtimeBucket),
      commit_policy: policyForBucket(runtimeBucket),
      bucket: runtimeBucket,
      reason: 'runtime artifact_context',
      metadata,
    };
  }

  if (kind === 'handoff') {
    if (artifactChangeRef && requestedChangeRef && artifactChangeRef !== requestedChangeRef) {
      return unrelated(normalizedPath, kind, metadata, 'handoff belongs to another change');
    }
    if (artifactChangeRef && artifactChangeRef === requestedChangeRef) {
      return {
        path: normalizedPath,
        kind,
        lifecycle: 'explicit-handoff',
        commit_policy: commitPolicy,
        bucket: commitPolicy === 'with-change' ? 'required_with_change' : 'conditional',
        reason: 'explicit change-scoped handoff',
        metadata,
      };
    }
    return unknown(normalizedPath, kind, metadata, 'handoff lacks enough relationship metadata');
  }

  if (CHANGE_SCOPED_KINDS.has(kind)) {
    if (artifactChangeRef && requestedChangeRef && artifactChangeRef === requestedChangeRef) {
      return required(normalizedPath, kind, metadata, 'change_ref matches current change');
    }
    if (artifactChangeRef && requestedChangeRef && artifactChangeRef !== requestedChangeRef) {
      return unrelated(normalizedPath, kind, metadata, 'change_ref identifies another change');
    }
    if (legacyRelationshipMatches(normalizedPath, metadata, requestedChangeRef)) {
      return required(normalizedPath, kind, metadata, 'conservative legacy relationship inference');
    }
    return unknown(normalizedPath, kind, metadata, 'change-scoped artifact lacks a provable relationship');
  }

  return unknown(normalizedPath, kind, metadata, 'path is not classified by the lifecycle contract');
}

export function parseArtifactFrontmatter(text) {
  const match = text.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return {};
  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    const scalar = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*?)\s*$/);
    if (!scalar) continue;
    metadata[scalar[1]] = parseScalar(scalar[2]);
  }
  return metadata;
}

export function scanSensitiveArtifactContent(artifactPath, content) {
  const categories = new Set();
  const normalizedPath = normalizePath(artifactPath);
  if (/\.env(?:\.|$)/i.test(normalizedPath) && !/\.example$/i.test(normalizedPath)) {
    categories.add('environment-secret-file');
  }
  if (/(?:credential|private[-_]?key|service[-_]?account)/i.test(path.basename(normalizedPath))) {
    categories.add('credential-file-name');
  }
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)) {
    categories.add('private-key');
  }
  const secretAssignment =
    /^\s*(?:api[_-]?key|authorization|client[_-]?secret|password|private[_-]?key|refresh[_-]?token|secret|token)\s*[:=]\s*(?!<|\[REDACTED\]|none\b|null\b|unknown\b|false\b|true\b)(?:"[^"]+"|'[^']+'|\S+)/gim;
  if (secretAssignment.test(content)) categories.add('secret-like-assignment');
  return [...categories].sort();
}

function normalizeRuntimeContext(context) {
  const keys = [
    'required_with_change',
    'shared_owned',
    'conditional',
    'local_only',
    'unrelated_observed',
  ];
  const result = { invalid_paths: [], entries: new Map() };
  for (const key of keys) {
    result[key] = [];
    for (const item of context?.[key] ?? []) {
      const candidate = normalizePath(typeof item === 'string' ? item : item.path);
      if (!candidate) continue;
      if (!isSafeArtifactPath(candidate)) {
        result.invalid_paths.push(candidate);
        continue;
      }
      result[key].push(candidate);
      if (item && typeof item === 'object') {
        result.entries.set(`${key}:${candidate}`, item);
      }
    }
  }
  result.invalid_paths = unique(result.invalid_paths);
  return result;
}

function findRuntimeEntry(artifactPath, buckets) {
  for (const key of [
    'required_with_change',
    'shared_owned',
    'conditional',
    'local_only',
    'unrelated_observed',
  ]) {
    const entry = buckets.entries?.get(`${key}:${artifactPath}`);
    if (entry) return entry;
  }
  return null;
}

function validateDocumentationRuntimePromotion(artifactPath, entry) {
  const classification = classifyDocumentationPath(artifactPath);
  if (!classification.ok) return classification;
  if (
    ['canonical-entry', 'legacy-entry', 'singleton'].includes(
      classification.kind,
    )
  ) {
    return { ok: true };
  }

  const relatedEntryPath = entry?.guide_path ?? entry?.related_entry_path;
  if (classification.kind === 'shared-asset') {
    if (
      relatedEntryPath &&
      /\.(?:png|jpe?g|webp|gif|svg)$/i.test(artifactPath)
    ) {
      if (entry?.relationship_verified !== true) {
        return {
          ok: false,
          code: 'DOCUMENTATION_RELATIONSHIP_UNVERIFIED',
        };
      }
      return validateGuideImageRelationship({
        guidePath: relatedEntryPath,
        imagePath: artifactPath,
        sharedOwnership: entry?.shared_ownership,
      });
    }
    const ownership = validateSharedOwnership({
      ownerUnits: entry?.shared_ownership?.ownerUnits,
    });
    return entry?.relationship_verified === true &&
      entry?.shared_ownership?.proven === true &&
      ownership.ok
      ? { ok: true }
      : { ok: false, code: 'SHARED_OWNERSHIP_UNPROVEN' };
  }

  if (classification.kind !== 'unit-asset' || !relatedEntryPath) {
    return { ok: false, code: 'DOCUMENTATION_RELATIONSHIP_UNPROVEN' };
  }
  if (
    classification.category === 'user-guides' &&
    classification.assetDirectory === 'images'
  ) {
    if (entry?.relationship_verified !== true) {
      return {
        ok: false,
        code: 'DOCUMENTATION_RELATIONSHIP_UNVERIFIED',
      };
    }
    return validateGuideImageRelationship({
      guidePath: relatedEntryPath,
      imagePath: artifactPath,
      sharedOwnership: entry?.shared_ownership,
    });
  }
  const related = classifyDocumentationPath(relatedEntryPath);
  if (
    !related.ok ||
    !['canonical-entry', 'legacy-entry'].includes(related.kind) ||
    related.category !== classification.category ||
    related.key.toLowerCase() !== classification.key.toLowerCase()
  ) {
    return { ok: false, code: 'CROSS_UNIT_ASSET' };
  }
  return entry?.relationship_verified === true
    ? { ok: true }
    : { ok: false, code: 'DOCUMENTATION_RELATIONSHIP_UNVERIFIED' };
}

async function collectProjectedDocumentationContents(
  root,
  discoveredPaths,
  discoveredContents,
) {
  const result = new Map();
  for (const candidate of discoveredPaths) {
    const classification = classifyDocumentationPath(candidate);
    if (
      !classification.ok ||
      !['canonical-entry', 'legacy-entry'].includes(classification.kind)
    ) {
      continue;
    }
    if (await exists(path.join(root, candidate))) {
      result.set(candidate, discoveredContents.get(candidate) ?? '');
    }
    const counterpart =
      classification.kind === 'canonical-entry'
        ? buildLegacyEntryPath(
            classification.category,
            classification.key,
            { allowInactive: true },
          )
        : buildCanonicalEntryPath(
            classification.category,
            classification.key,
            { allowInactive: true },
          );
    if (result.has(counterpart) || !(await exists(path.join(root, counterpart)))) {
      continue;
    }
    result.set(
      counterpart,
      await readFile(path.join(root, counterpart), 'utf8').catch(() => ''),
    );
  }
  return result;
}

export function analyzeDocumentationDuplicates(files) {
  const byPath = new Map();
  const conflicts = [];
  for (const category of ['user-guides', 'requirements', 'technical-docs']) {
    const discovery = discoverDocumentationEntries(files, { category });
    for (const collision of discovery.collisions) {
      const conflict = {
        ...collision,
        category,
      };
      conflicts.push(conflict);
      for (const conflictPath of collision.paths ?? []) {
        byPath.set(conflictPath, { state: 'conflict' });
      }
    }
    const keys = new Set([
      ...discovery.canonical.map((item) => item.key),
      ...discovery.legacy.map((item) => item.key),
    ]);
    for (const key of keys) {
      const state = resolveDocumentationEntryState({ files, category, key });
      if (state.state === 'both-equivalent') {
        byPath.set(state.legacyPath, { state: 'equivalent-legacy' });
      } else if (state.state === 'both-conflicting') {
        const conflict = {
          code: 'CANONICAL_LEGACY_CONFLICT',
          category,
          key,
          canonical_path: state.canonicalPath,
          legacy_path: state.legacyPath,
        };
        conflicts.push(conflict);
        byPath.set(state.canonicalPath, { state: 'conflict' });
        byPath.set(state.legacyPath, { state: 'conflict' });
      } else if (
        ['case-insensitive-conflict', 'path-inventory-conflict'].includes(
          state.state,
        )
      ) {
        const conflictPaths = [
          ...(state.conflictingPaths ?? []),
          ...(state.pathConflicts ?? []).flatMap((conflict) => [
            conflict.normalizedPath,
            conflict.path,
            ...(conflict.paths ?? []),
          ]),
        ].filter(Boolean);
        const unclassifiedPaths = conflictPaths.filter(
          (conflictPath) => !byPath.has(conflictPath),
        );
        if (unclassifiedPaths.length === 0) continue;
        conflicts.push({
          code:
            state.conflict ??
            (state.state === 'case-insensitive-conflict'
              ? 'CASE_INSENSITIVE_COLLISION'
              : 'PATH_INVENTORY_CONFLICT'),
          category,
          key,
          paths: [...new Set(conflictPaths)].sort(),
        });
        for (const conflictPath of conflictPaths) {
          byPath.set(conflictPath, { state: 'conflict' });
        }
      }
    }
  }
  return { byPath, conflicts };
}

function findRuntimeBucket(artifactPath, buckets) {
  if (buckets.required_with_change.includes(artifactPath)) return 'required_with_change';
  if (buckets.shared_owned.includes(artifactPath)) return 'shared_owned';
  if (buckets.conditional.includes(artifactPath)) return 'conditional';
  if (buckets.local_only.includes(artifactPath)) return 'local_only';
  if (buckets.unrelated_observed.includes(artifactPath)) return 'unrelated';
  return null;
}

function inferArtifactKind(artifactPath) {
  for (const [pattern, kind] of ARTIFACT_KIND_BY_PATH) {
    if (pattern.test(artifactPath)) return kind;
  }
  return 'unknown';
}

function defaultCommitPolicy(kind) {
  if (CHANGE_SCOPED_KINDS.has(kind)) return 'with-change';
  if (kind === 'handoff' || SHARED_KINDS.has(kind)) return 'conditional';
  return 'never';
}

function legacyRelationshipMatches(artifactPath, metadata, changeRef) {
  if (!changeRef) return false;
  const slug = changeRef.split('/').at(-1).replace(/\.[^.]+$/, '');
  const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const pathSlug = artifactPath.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (normalizedSlug.length >= 5 && pathSlug.includes(normalizedSlug)) return true;
  for (const key of ['source_spec', 'source_plan', 'sourceSpecPath', 'sourcePlanPath']) {
    const value = normalizeRef(metadata[key]);
    if (value && (value === changeRef || value.endsWith(changeRef))) return true;
  }
  return false;
}

function required(artifactPath, kind, metadata, reason) {
  return {
    path: artifactPath,
    kind,
    lifecycle: 'change-scoped-durable',
    commit_policy: 'with-change',
    bucket: 'required_with_change',
    reason,
    metadata,
  };
}

function unrelated(artifactPath, kind, metadata, reason) {
  return {
    path: artifactPath,
    kind,
    lifecycle: 'change-scoped-durable',
    commit_policy: metadata.commit_policy ?? 'with-change',
    bucket: 'unrelated',
    reason,
    metadata,
  };
}

function unknown(artifactPath, kind, metadata, reason) {
  return {
    path: artifactPath,
    kind,
    lifecycle: 'unknown',
    commit_policy: 'unknown',
    bucket: 'unknown',
    reason,
    metadata,
  };
}

function lifecycleForBucket(bucket) {
  if (bucket === 'required_with_change') return 'change-scoped-durable';
  if (bucket === 'shared_owned' || bucket === 'conditional') return 'shared-durable';
  if (bucket === 'local_only') return 'diagnostic-local';
  if (bucket === 'unrelated') return 'change-scoped-durable';
  return 'unknown';
}

function policyForBucket(bucket) {
  if (bucket === 'required_with_change') return 'with-change';
  if (bucket === 'shared_owned' || bucket === 'conditional') return 'conditional';
  if (bucket === 'local_only') return 'never';
  return 'unknown';
}

function parseGitPathOutput(output, shortFormat) {
  const records = [];
  for (const line of output.split(/\r?\n/).filter(Boolean)) {
    if (shortFormat) {
      const status = line.slice(0, 2);
      const rawPath = line.slice(3).trim();
      const finalPath = rawPath.includes(' -> ') ? rawPath.split(' -> ').at(-1) : rawPath;
      records.push({ status, path: normalizePath(dequoteGitPath(finalPath)) });
      continue;
    }
    const parts = line.split('\t');
    const finalPath = parts.at(-1);
    if (finalPath) records.push({ status: parts[0], path: normalizePath(dequoteGitPath(finalPath)) });
  }
  return records;
}

function dequoteGitPath(value) {
  if (!value.startsWith('"') || !value.endsWith('"')) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value.slice(1, -1);
  }
}

async function existsAtHead(root, relativePath) {
  try {
    await execFileAsync('git', ['cat-file', '-e', `HEAD:${normalizePath(relativePath)}`], {
      cwd: root,
      encoding: 'utf8',
    });
    return true;
  } catch {
    return false;
  }
}

function normalizePath(value) {
  return String(value ?? '').replaceAll('\\', '/').replace(/^\.\//, '');
}

function isSafeArtifactPath(value) {
  if (!value.startsWith('.sdcorejs/')) return false;
  if (path.posix.isAbsolute(value)) return false;
  return !value.split('/').includes('..');
}

function normalizeRef(value) {
  if (value === null || value === undefined) return '';
  return normalizePath(String(value)).trim().toLowerCase();
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (/^(?:null|none)$/i.test(trimmed)) return null;
  if (/^(?:true|false)$/i.test(trimmed)) return trimmed === 'true';
  return trimmed.replace(/^(['"])([\s\S]*)\1$/, '$2');
}

function uniquePaths(items = []) {
  return unique(items.map((item) => item.path));
}

function unique(items) {
  return [...new Set(items)].sort();
}

function groupBy(items, selector) {
  const result = {};
  for (const item of items) {
    const key = selector(item);
    result[key] ??= [];
    result[key].push(item);
  }
  return result;
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await buildArtifactClosure({
    root: args.root,
    changeRef: args['change-ref'],
    owner: args.owner,
    mode: args.mode ?? 'commit',
    ownedSharedPaths: args['owned-shared'] ?? [],
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.sdcorejs_artifacts.closure_result !== 'complete') process.exitCode = 2;
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith('--')) throw new Error(`Unknown argument: ${key}`);
    const name = key.slice(2);
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`Missing value for --${name}`);
    index += 1;
    if (name === 'owned-shared') {
      result[name] ??= [];
      result[name].push(value);
    } else {
      result[name] = value;
    }
  }
  return result;
}

const isDirectRun =
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === pathToFileURL(fileURLToPath(import.meta.url)).href;

if (isDirectRun) {
  main().catch((error) => {
    process.stderr.write(`${error?.stack ?? error}\n`);
    process.exitCode = 1;
  });
}
