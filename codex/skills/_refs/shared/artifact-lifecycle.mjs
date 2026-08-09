#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  DESIGN_ARTIFACT_ROOT,
  DESIGN_LEDGER_ROOT,
  DESIGN_LOCAL_ONLY_DIRECTORIES,
  PRODUCT_DOCUMENT_ROOT,
  PRODUCT_LEDGER_ROOT,
  classifyDesignArtifactPath,
  classifyProductArtifactPath,
  isSafeFeature,
} from './artifact-paths.mjs';
import {
  CONVENTION_ROOT,
  classifyConventionPath,
} from './convention-paths.mjs';
import {
  DOCUMENTATION_ROOT,
  buildCanonicalEntryPath,
  buildLegacyEntryPath,
  classifyDocumentationPath,
  discoverDocumentationEntries,
  resolveDocumentationEntryState,
  validateGuideImageRelationship,
  validateSharedOwnership,
} from './documentation-layout.mjs';

const execFileAsync = promisify(execFile);

const DOCUMENTATION_ROOT_PREFIX = `${DOCUMENTATION_ROOT}/`;

/**
 * Conversation-local runtime root.
 *
 * Declared explicitly rather than relying on the generic `tmp` pattern, so a
 * rename of that pattern can never quietly make a Visual Companion session
 * directory stageable. Session directories hold keys, ports, process ids, and
 * raw browser events; none of that may reach a commit or a durable artifact.
 */
export const LOCAL_RUNTIME_ROOT = '.sdcorejs/tmp';
export const VISUAL_COMPANION_RUNTIME_ROOT = `${LOCAL_RUNTIME_ROOT}/visual-companion`;

const LOCAL_ONLY_PATTERNS = [
  /^\.sdcorejs\/tasks\/current-session\.md$/i,
  /^\.sdcorejs\/tasks\/sessions\//i,
  new RegExp(`^${escapeForPattern(VISUAL_COMPANION_RUNTIME_ROOT)}(?:/|$)`, 'i'),
  new RegExp(`^${escapeForPattern(LOCAL_RUNTIME_ROOT)}(?:/|$)`, 'i'),
  /^\.sdcorejs\/(?:cache|caches|tmp|temp|traces?|storage|codegraph-cache)\//i,
  /^\.sdcorejs\/.*(?:auth-state|browser-state|storage-state)(?:\/|\.|$)/i,
  new RegExp(
    `^${escapeForPattern(DESIGN_ARTIFACT_ROOT)}/(?:${DESIGN_LOCAL_ONLY_DIRECTORIES.map(
      escapeForPattern,
    ).join('|')})/`,
    'i',
  ),
  /\.(?:har|log|trace|webm|mp4)$/i,
];

/**
 * Local-only classification is directory- and extension-driven only.
 *
 * A filename heuristic such as `failure-*.png` cannot be used here: it is
 * checked before the runtime `artifact_context` bucket, so it would silently
 * override an explicit `required_with_change` entry, and `failure-state.png` or
 * `checkout-failed.svg` are legitimate designed states. Renderer failure
 * captures belong in the declared `DESIGN_LOCAL_ONLY_DIRECTORIES`, which is
 * deterministic and cannot swallow an approved artifact.
 */
export function isLocalOnlyArtifactPath(value) {
  const normalizedPath = normalizePath(value);
  return LOCAL_ONLY_PATTERNS.some((pattern) => pattern.test(normalizedPath));
}

/** True for conversation-local runtime state, which is never a durable artifact. */
export function isLocalRuntimePath(value) {
  const normalizedPath = normalizePath(value);
  return new RegExp(`^${escapeForPattern(LOCAL_RUNTIME_ROOT)}(?:/|$)`, 'i').test(normalizedPath);
}

export function isVisualCompanionRuntimePath(value) {
  const normalizedPath = normalizePath(value);
  return new RegExp(`^${escapeForPattern(VISUAL_COMPANION_RUNTIME_ROOT)}(?:/|$)`, 'i').test(
    normalizedPath,
  );
}

const ARTIFACT_KIND_BY_PATH = [
  [/^\.sdcorejs\/specs\//i, 'spec'],
  [/^\.sdcorejs\/plans\//i, 'plan'],
  [new RegExp(`^${escapeForPattern(PRODUCT_LEDGER_ROOT)}/`, 'i'), 'product-ledger'],
  [new RegExp(`^${escapeForPattern(DESIGN_LEDGER_ROOT)}/`, 'i'), 'design-handoff'],
  [/^\.sdcorejs\/docs\//i, 'execution-doc'],
  [new RegExp(`^${escapeForPattern(PRODUCT_DOCUMENT_ROOT)}/`, 'i'), 'product-doc'],
  [new RegExp(`^${escapeForPattern(DESIGN_ARTIFACT_ROOT)}/`, 'i'), 'design-asset'],
  [new RegExp(`^${escapeForPattern(CONVENTION_ROOT)}/`, 'i'), 'convention'],
  [/^\.sdcorejs\/documentation\//i, 'documentation-asset'],
  [/^\.sdcorejs\/handoffs\//i, 'handoff'],
  [/^\.sdcorejs\/memories\//i, 'memory'],
  [/^\.sdcorejs\/tasks\//i, 'task'],
  [/^\.sdcorejs\/persona\.md$/i, 'persona'],
  [/^\.sdcorejs\/summary\.md$/i, 'summary'],
];

/**
 * Shared durable kinds need a proven owner before they may be staged.
 *
 * `convention` belongs here rather than with the change-scoped kinds because a
 * convention outlives the change that discovered it. Treating it as shared is
 * also what stops a parallel worker from staging one: shared writes are the
 * sequential or fan-in integration owner's job, merged once.
 */
const SHARED_KINDS = new Set(['convention', 'memory', 'persona', 'summary', 'task']);
const CHANGE_SCOPED_KINDS = new Set([
  'design-asset',
  'design-handoff',
  'documentation-asset',
  'execution-doc',
  'product-doc',
  'product-ledger',
  'plan',
  'spec',
]);

/**
 * Feature-scoped Product and Design artifacts inherit their change relationship
 * from the ledger that owns the same feature identity.
 */
const FEATURE_LEDGER_KINDS = new Set(['product-doc', 'design-asset']);

const BINARY_EXTENSIONS = new Set([
  '.avif',
  '.bmp',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.mp4',
  '.pdf',
  '.png',
  '.webm',
  '.webp',
  '.woff',
  '.woff2',
  '.zip',
]);

function escapeForPattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

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
  const discoveredFiles = new Map();
  const discoveredContents = new Map();

  for (const relativePath of discovery.discoveredPaths) {
    const file = await readArtifactFile(targetRoot, relativePath);
    discoveredFiles.set(relativePath, file);
    // Text-only consumers never receive binary bytes.
    discoveredContents.set(relativePath, file.binary ? '' : file.text);
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
  const featureLedgers = collectFeatureChangeRefs(
    discovery.discoveredPaths,
    discoveredFiles,
  );
  const featureChangeRefs = featureLedgers.byFeature;

  for (const relativePath of discovery.discoveredPaths) {
    const file = discoveredFiles.get(relativePath) ?? emptyArtifactFile(relativePath);
    const content = file.binary ? '' : file.text;
    const metadata = file.binary ? {} : parseArtifactFrontmatter(content);
    let classification = classifyArtifact({
      path: relativePath,
      metadata,
      changeRef,
      owner,
      ownedSharedPaths,
      runtimeBuckets,
      featureChangeRefs,
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
    const sensitiveCategories =
      file.scan_text === null
        ? scanSensitiveArtifactPath(relativePath)
        : scanSensitiveArtifactContent(relativePath, file.scan_text);
    classifications.push({
      ...classification,
      git_status: discovery.statusByPath[relativePath] ?? [],
      sensitive_categories: sensitiveCategories,
      binary: file.binary,
      byte_size: file.bytes,
      content_hash: file.sha256,
      read_error: file.read_error === true,
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
  // A required durable artifact that cannot be read has no integrity evidence.
  // A staged or working-tree deletion is the one legitimate unreadable case.
  const unreadableRequiredPaths = classifications
    .filter((item) => item.read_error && item.bucket === 'required_with_change')
    .filter((item) => !(item.git_status ?? []).some((status) => status.includes('D')))
    .map((item) => item.path)
    .sort();
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
  if (unreadableRequiredPaths.length > 0) {
    blockers.push('required artifact could not be read for integrity evidence');
  }
  if (featureLedgers.conflicts.length > 0) {
    blockers.push('product or design ledger feature identity conflict');
  }
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
      unreadable_required_paths: unreadableRequiredPaths,
      invalid_context_paths: invalidContextPaths,
      feature_ledger_conflicts: featureLedgers.conflicts,
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
  featureChangeRefs = new Map(),
} = {}) {
  const normalizedPath = normalizePath(artifactPath);
  if (isLocalOnlyArtifactPath(normalizedPath)) {
    return {
      path: normalizedPath,
      kind: normalizedPath.endsWith('/current-session.md') ? 'legacy-session-checkpoint' : 'diagnostic',
      lifecycle: 'diagnostic-local',
      commit_policy: 'never',
      bucket: 'local_only',
      reason:
        'local state, cache, trace, storage state, failure capture, generated diagnostic, or legacy checkpoint',
      metadata,
    };
  }

  const kind = normalizeArtifactKind(
    metadata.artifact_kind ?? inferArtifactKind(normalizedPath),
  );
  const artifactChangeRef = normalizeRef(metadata.change_ref);
  const requestedChangeRef = normalizeRef(changeRef);
  const metadataOwner = normalizeRef(metadata.owner);
  const currentOwner = normalizeRef(owner);
  const commitPolicy = metadata.commit_policy ?? defaultCommitPolicy(kind);
  const runtimeBucket = findRuntimeBucket(normalizedPath, runtimeBuckets);
  const runtimeEntry = findRuntimeEntry(normalizedPath, runtimeBuckets);

  // Documentation-layout promotion rules are scoped to the documentation root so
  // they are not applied to Product or Design artifacts, which have their own
  // canonical roots and their own contracts. Scoping must not become an escape
  // hatch: a `documentation-asset` kind claimed for a path outside that root is
  // a metadata/path contradiction, so it fails closed rather than skipping the
  // gate.
  if (kind === 'documentation-asset' && runtimeBucket === 'required_with_change') {
    if (!normalizedPath.startsWith(DOCUMENTATION_ROOT_PREFIX)) {
      return unknown(
        normalizedPath,
        kind,
        metadata,
        'documentation-asset declared outside the documentation root',
      );
    }
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

  // Convention identity is carried by the path: the scope directory, the module
  // segment, the category, and the rule filename are what prove a rule is owned
  // where it sits. A path that does not parse cannot be trusted to belong to
  // anyone, and a `convention` kind claimed outside the convention root is a
  // metadata/path contradiction, so both fail closed instead of inheriting the
  // shared-artifact path and becoming stageable.
  if (kind === 'convention' || normalizedPath.startsWith(`${CONVENTION_ROOT}/`)) {
    const conventionClassification = classifyConventionPath(normalizedPath);
    if (!conventionClassification.ok) {
      return unknown(
        normalizedPath,
        'convention',
        metadata,
        `invalid convention path: ${conventionClassification.code}`,
      );
    }
    if (kind !== 'convention') {
      return unknown(
        normalizedPath,
        kind,
        metadata,
        'artifact under the convention root declares a non-convention kind',
      );
    }
    if (
      metadata.document_type &&
      metadata.document_type !== conventionClassification.document_type
    ) {
      return unknown(
        normalizedPath,
        kind,
        metadata,
        'convention document_type contradicts its canonical path',
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
    if (FEATURE_LEDGER_KINDS.has(kind)) {
      const ledger = resolveFeatureLedgerRelationship(
        normalizedPath,
        kind,
        featureChangeRefs,
      );
      if (ledger.changeRef && requestedChangeRef && ledger.changeRef === requestedChangeRef) {
        return required(
          normalizedPath,
          kind,
          metadata,
          `${ledger.track} ledger relationship for feature ${ledger.feature}`,
        );
      }
      if (ledger.changeRef && requestedChangeRef && ledger.changeRef !== requestedChangeRef) {
        return unrelated(
          normalizedPath,
          kind,
          metadata,
          `${ledger.track} ledger for feature ${ledger.feature} identifies another change`,
        );
      }
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

/**
 * Path-only secret screening. Safe for binary artifacts because it never
 * inspects, decodes, or prints file bytes.
 */
export function scanSensitiveArtifactPath(artifactPath) {
  const categories = new Set();
  const normalizedPath = normalizePath(artifactPath);
  if (/\.env(?:\.|$)/i.test(normalizedPath) && !/\.example$/i.test(normalizedPath)) {
    categories.add('environment-secret-file');
  }
  if (/(?:credential|private[-_]?key|service[-_]?account)/i.test(path.basename(normalizedPath))) {
    categories.add('credential-file-name');
  }
  return [...categories].sort();
}

export function scanSensitiveArtifactContent(artifactPath, content) {
  const categories = new Set(scanSensitiveArtifactPath(artifactPath));
  if (typeof content !== 'string') return [...categories].sort();
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)) {
    categories.add('private-key');
  }
  const secretAssignment =
    /^\s*(?:api[_-]?key|authorization|client[_-]?secret|password|private[_-]?key|refresh[_-]?token|secret|token)\s*[:=]\s*(?!<|\[REDACTED\]|none\b|null\b|unknown\b|false\b|true\b)(?:"[^"]+"|'[^']+'|\S+)/gim;
  if (secretAssignment.test(content)) categories.add('secret-like-assignment');
  return [...categories].sort();
}

/**
 * Decide whether a discovered artifact must be treated as opaque bytes.
 * Binary artifacts are never parsed as Markdown frontmatter, never scanned as
 * UTF-8 text, and never printed.
 */
export function isBinaryArtifactPath(artifactPath) {
  return BINARY_EXTENSIONS.has(path.extname(normalizePath(artifactPath)).toLowerCase());
}

function emptyArtifactFile(relativePath) {
  return {
    path: normalizePath(relativePath),
    binary: isBinaryArtifactPath(relativePath),
    text: '',
    scan_text: null,
    bytes: 0,
    sha256: null,
    read_error: true,
  };
}

/**
 * Read a discovered artifact once and derive three separate decisions from it,
 * because conflating them is how a credential escapes screening:
 *
 * - `binary` controls structural handling. Bytes are never parsed as Markdown
 *   frontmatter and never exposed as text to documentation comparison.
 * - `scan_text` controls secret screening. It is withheld only when the
 *   extension AND the byte probe agree that the file is genuinely opaque. A
 *   text extension carrying a stray NUL is still screened, and a binary
 *   extension holding decodable text is still screened, so neither shape can
 *   smuggle a private key past closure.
 * - `sha256` is the reportable integrity value for either shape.
 */
async function readArtifactFile(root, relativePath) {
  const normalizedPath = normalizePath(relativePath);
  const buffer = await readFile(path.join(root, normalizedPath)).catch(() => null);
  if (!buffer) return emptyArtifactFile(normalizedPath);
  const binaryExtension = isBinaryArtifactPath(normalizedPath);
  const containsNulBytes = buffer.subarray(0, 8000).includes(0);
  const binary = binaryExtension || containsNulBytes;
  const opaqueBytes = binaryExtension && containsNulBytes;
  return {
    path: normalizedPath,
    binary,
    text: binary ? '' : buffer.toString('utf8'),
    scan_text: opaqueBytes ? null : buffer.toString('utf8'),
    bytes: buffer.byteLength,
    sha256: `sha256:${createHash('sha256').update(buffer).digest('hex')}`,
    read_error: false,
  };
}

/**
 * Map a feature identity to the `change_ref` declared by its Product or Design
 * ledger. Durable Product documents and Design assets - including binary PNG
 * exports that carry no frontmatter - inherit that relationship.
 *
 * The ledger's own path is the identity, not its frontmatter. A ledger that
 * declares another feature's name could otherwise overwrite that feature's
 * mapping and push a genuinely required artifact into `unrelated`, so a
 * mismatch and a duplicate are both reported as conflicts instead of silently
 * winning.
 */
function collectFeatureChangeRefs(discoveredPaths, discoveredFiles) {
  const byFeature = new Map();
  const sources = new Map();
  const conflicts = [];
  for (const relativePath of discoveredPaths) {
    const file = discoveredFiles.get(relativePath);
    if (!file || file.binary) continue;
    const track = ledgerTrackForPath(relativePath);
    if (!track) continue;
    const metadata = parseArtifactFrontmatter(file.text);
    const changeRef = normalizeRef(metadata.change_ref);
    const feature = featureFromLedgerPath(relativePath);
    if (!changeRef || !feature) continue;
    if (!isSafeFeature(feature)) {
      conflicts.push({ code: 'INVALID_LEDGER_FEATURE', path: relativePath, feature });
      continue;
    }
    const declared = normalizeRef(metadata.feature);
    if (declared && declared !== feature) {
      conflicts.push({
        code: 'LEDGER_FEATURE_IDENTITY_MISMATCH',
        path: relativePath,
        declared_feature: declared,
        expected_feature: feature,
      });
      continue;
    }
    const key = `${track}:${feature}`;
    if (byFeature.has(key) && byFeature.get(key) !== changeRef) {
      conflicts.push({
        code: 'DUPLICATE_LEDGER_FEATURE',
        track,
        feature,
        paths: [sources.get(key), relativePath].sort(),
      });
      continue;
    }
    byFeature.set(key, changeRef);
    sources.set(key, relativePath);
  }
  return { byFeature, conflicts };
}

function ledgerTrackForPath(relativePath) {
  const normalizedPath = normalizePath(relativePath);
  if (normalizedPath.startsWith(`${PRODUCT_LEDGER_ROOT}/`)) return 'product';
  if (normalizedPath.startsWith(`${DESIGN_LEDGER_ROOT}/`)) return 'design';
  return null;
}

function featureFromLedgerPath(relativePath) {
  const base = path.basename(normalizePath(relativePath));
  return normalizeRef(base.replace(/\.[^.]+$/u, ''));
}

function resolveFeatureLedgerRelationship(normalizedPath, kind, featureChangeRefs) {
  const track = kind === 'product-doc' ? 'product' : 'design';
  const classification =
    track === 'product'
      ? classifyProductArtifactPath(normalizedPath)
      : classifyDesignArtifactPath(normalizedPath);
  const feature = normalizeRef(classification.feature);
  if (!feature) return { track, feature: null, changeRef: null };
  const lookup = featureChangeRefs instanceof Map ? featureChangeRefs : new Map();
  // `changeRef` is compared against `normalizeRef(changeRef)` by the caller, so
  // normalize here too. `featureChangeRefs` is a public parameter and a
  // caller-supplied mixed-case value would otherwise exclude a required
  // artifact with a confidently wrong reason.
  const changeRef = normalizeRef(lookup.get(`${track}:${feature}`));
  return { track, feature, changeRef: changeRef === '' ? null : changeRef };
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
    const file = await readArtifactFile(root, counterpart);
    result.set(counterpart, file.binary ? '' : file.text);
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

function normalizeArtifactKind(kind) {
  return kind === 'feature-ledger' ? 'product-ledger' : kind;
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
