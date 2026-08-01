import { createHash } from 'node:crypto';
import path from 'node:path';
import { inflateSync } from 'node:zlib';
import { resolveArtifactOwner } from './repository-contract.mjs';

export const DOCUMENTATION_LAYOUT_VERSION = 2;
export const DOCUMENTATION_ROOT = '.sdcorejs/documentation';

export const DOCUMENTATION_CATEGORY_REGISTRY = Object.freeze({
  'user-guides': Object.freeze({
    active: true,
    keyType: 'slug',
    extension: '.md',
    assetDirectories: Object.freeze([
      'images',
      'diagrams',
      'examples',
      'schemas',
      'attachments',
      'assets',
    ]),
  }),
  requirements: Object.freeze({
    active: true,
    keyType: 'task-id',
    extension: '.md',
    assetDirectories: Object.freeze(['images', 'attachments']),
  }),
  'technical-docs': Object.freeze({
    active: true,
    keyType: 'slug',
    extension: '.md',
    assetDirectories: Object.freeze([
      'images',
      'diagrams',
      'schemas',
      'examples',
      'attachments',
      'assets',
    ]),
  }),
  presentations: Object.freeze({
    active: false,
    compatibilityRecognized: true,
    keyType: 'slug',
    extension: '.html',
    assetDirectories: Object.freeze(['assets', 'exports']),
  }),
});

export const DOCUMENTATION_SINGLETONS = Object.freeze([
  `${DOCUMENTATION_ROOT}/preferences.md`,
  `${DOCUMENTATION_ROOT}/sdcorejs-user-guide.md`,
  `${DOCUMENTATION_ROOT}/sdcorejs-user-guide.docx`,
  `${DOCUMENTATION_ROOT}/sdcorejs-user-guide.pdf`,
]);

const GIT_REVISION_PATTERN = /^[a-f0-9]{40}$/u;
const DOCUMENTATION_VISUAL_ORIGINS = new Set([
  'real-ui',
  'generated-mockup',
  'illustration',
]);

const WINDOWS_RESERVED_NAMES =
  /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
const EXTERNAL_LINK_PATTERN =
  /^(?:https?:|mailto:|data:|tel:|ftp:|\/\/|#)/i;
const TEXT_FILE_PATTERN = /\.(?:md|mdx|json|ya?ml|txt|mjs|cjs|js|ts|tsx|jsx|html|htm|xml)$/i;

export function normalizeRepositoryPath(value) {
  if (typeof value !== 'string') {
    return pathFailure('PATH_NOT_STRING', 'Repository path must be a string.');
  }
  if (value.includes('\0')) {
    return pathFailure('PATH_CONTAINS_NUL', 'Repository path contains a NUL byte.');
  }
  if (value !== value.trim()) {
    return pathFailure(
      'PATH_BOUNDARY_WHITESPACE',
      'Repository paths must not contain leading or trailing whitespace.',
    );
  }
  if (!value) return pathFailure('PATH_EMPTY', 'Repository path is empty.');
  if (/^[A-Za-z]:[\\/]/.test(value)) {
    return pathFailure('WINDOWS_ABSOLUTE_PATH', 'Windows absolute paths are not repository paths.');
  }
  if (/^[A-Za-z]:/.test(value)) {
    return pathFailure('WINDOWS_DRIVE_PATH', 'Windows drive paths are not repository paths.');
  }
  if (/^[\\/]{2}/.test(value)) {
    return pathFailure('UNC_ABSOLUTE_PATH', 'UNC paths are not repository paths.');
  }
  if (/^[\\/]/.test(value)) {
    return pathFailure('POSIX_ABSOLUTE_PATH', 'Absolute paths are not repository paths.');
  }

  const normalized = value
    .replaceAll('\\', '/')
    .replace(/^(?:\.\/)+/, '');
  if (normalized.includes('//') || normalized.endsWith('/')) {
    return pathFailure(
      'PATH_EMPTY_SEGMENT',
      'Repository paths must not contain empty or trailing path segments.',
    );
  }
  const segments = normalized.split('/');
  if (segments.some((segment) => segment === '..')) {
    return pathFailure('PATH_TRAVERSAL', 'Repository path traversal is not allowed.');
  }
  for (const segment of segments.filter((candidate) => candidate && candidate !== '.')) {
    const stem = segment.split('.', 1)[0];
    if (segment.endsWith('.') || segment.endsWith(' ')) {
      return pathFailure(
        'PATH_TRAILING_DOT_OR_SPACE',
        'Repository path segments must not end with a dot or space.',
      );
    }
    if (
      /[<>:"|?*\u0000-\u001F]/.test(segment) ||
      WINDOWS_RESERVED_NAMES.test(stem)
    ) {
      return pathFailure(
        'WINDOWS_UNSAFE_PATH_SEGMENT',
        'Repository path contains a Windows-unsafe segment.',
      );
    }
  }
  const compact = segments.filter((segment) => segment !== '.').join('/');
  if (!compact) return pathFailure('PATH_EMPTY', 'Repository path is empty.');
  return { ok: true, path: compact };
}

export function validateDocumentKey(category, key, { existingKeys = [] } = {}) {
  const contract = categoryContract(category, { allowInactive: true });
  if (typeof key !== 'string' || key.length === 0) {
    return keyFailure('EMPTY_KEY', 'Document key is empty.');
  }
  if (key !== key.trim()) {
    return keyFailure('TRAILING_SPACE', 'Document key must not contain leading or trailing spaces.');
  }
  if (key.endsWith('.')) {
    return keyFailure('TRAILING_DOT', 'Document key must not end with a dot.');
  }
  if (['.', '..', '...'].includes(key)) {
    return keyFailure('DOT_SEGMENT', 'Dot path segments are not document keys.');
  }
  if (/^[A-Za-z]:/.test(key) || /^[\\/]/.test(key) || /[\\/]/.test(key)) {
    return keyFailure('PATH_LIKE_KEY', 'Document key must not contain a path.');
  }
  if (WINDOWS_RESERVED_NAMES.test(key)) {
    return keyFailure('WINDOWS_RESERVED_NAME', 'Document key is a Windows reserved name.');
  }

  if (contract.keyType === 'slug') {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) {
      return keyFailure(
        'INVALID_SLUG',
        'Document key must be lowercase kebab-case using only a-z, 0-9, and single hyphens.',
      );
    }
  } else if (!/^[A-Za-z0-9_-]+$/.test(key)) {
    return keyFailure(
      'INVALID_TASK_ID',
      'Requirement key may contain only letters, digits, underscores, and hyphens.',
    );
  }

  const collision = existingKeys.find(
    (candidate) =>
      typeof candidate === 'string' &&
      candidate.toLocaleLowerCase('en-US') === key.toLocaleLowerCase('en-US') &&
      candidate !== key,
  );
  if (collision) {
    return {
      ok: false,
      code: 'CASE_INSENSITIVE_COLLISION',
      message: `Document key collides with ${collision} on a case-insensitive filesystem.`,
      collision,
    };
  }
  return { ok: true, key };
}

export function resolveDocumentationRoot(targetRoot) {
  if (typeof targetRoot !== 'string' || targetRoot.trim() === '') {
    throw new TypeError('targetRoot is required.');
  }
  const absoluteTarget = resolveFilesystemPath(targetRoot);
  return {
    targetRoot: absoluteTarget,
    absolutePath: joinFilesystemPath(
      absoluteTarget,
      '.sdcorejs',
      'documentation',
    ),
    repositoryPath: DOCUMENTATION_ROOT,
  };
}

export function buildCanonicalEntryPath(
  category,
  key,
  { allowInactive = false, existingKeys = [] } = {},
) {
  const contract = categoryContract(category, { allowInactive });
  requireValidKey(category, key, existingKeys);
  return `${DOCUMENTATION_ROOT}/${category}/${key}/${key}${contract.extension}`;
}

export function buildLegacyEntryPath(category, key, { allowInactive = false } = {}) {
  const contract = categoryContract(category, { allowInactive });
  requireValidKey(category, key);
  return `${DOCUMENTATION_ROOT}/${category}/${key}${contract.extension}`;
}

export function buildUnitAssetPath(
  category,
  key,
  assetDirectory,
  filename,
  { allowInactive = false } = {},
) {
  const contract = categoryContract(category, { allowInactive });
  requireValidKey(category, key);
  validateAssetDirectory(contract, assetDirectory);
  const safeFilename = validateRelativeAssetName(filename);
  return `${DOCUMENTATION_ROOT}/${category}/${key}/${assetDirectory}/${safeFilename}`;
}

export function buildSharedAssetPath(
  assetDirectory,
  filename,
  { ownerUnits = [] } = {},
) {
  const ownership = validateSharedOwnership({ ownerUnits });
  if (!ownership.ok) {
    throw new Error(
      'Proven shared ownership requires at least two valid documentation-unit identities.',
    );
  }
  if (!['images', 'diagrams', 'schemas', 'attachments', 'assets'].includes(assetDirectory)) {
    throw new Error(`Unsupported shared asset directory: ${assetDirectory}`);
  }
  const safeFilename = validateRelativeAssetName(filename);
  return `${DOCUMENTATION_ROOT}/_shared/${assetDirectory}/${safeFilename}`;
}

export function validateSharedOwnership({
  ownerUnits = [],
  requiredOwner,
} = {}) {
  if (!Array.isArray(ownerUnits)) {
    return { ok: false, code: 'INVALID_SHARED_OWNER_UNITS', ownerUnits: [] };
  }
  const normalizedOwnerUnits = [];
  for (const ownerUnit of ownerUnits) {
    if (
      typeof ownerUnit !== 'string' ||
      ownerUnit.length === 0 ||
      ownerUnit !== ownerUnit.trim()
    ) {
      return {
        ok: false,
        code: 'INVALID_SHARED_OWNER_UNIT',
        ownerUnits: [],
      };
    }
    const match = ownerUnit.match(/^([^:]+):(.+)$/);
    if (!match) {
      return {
        ok: false,
        code: 'INVALID_SHARED_OWNER_UNIT',
        ownerUnits: [],
      };
    }
    const [, category, key] = match;
    if (category === 'explicit') {
      const explicitRoot = normalizeRepositoryPath(key);
      if (
        !explicitRoot.ok ||
        !isInsideDocumentationRoot(explicitRoot.path) ||
        explicitRoot.path === DOCUMENTATION_ROOT
      ) {
        return {
          ok: false,
          code: 'INVALID_SHARED_OWNER_UNIT',
          ownerUnits: [],
        };
      }
      normalizedOwnerUnits.push(`explicit:${explicitRoot.path}`);
      continue;
    }
    const contract = DOCUMENTATION_CATEGORY_REGISTRY[category];
    if (!contract || !validateDocumentKey(category, key).ok) {
      return {
        ok: false,
        code: 'INVALID_SHARED_OWNER_UNIT',
        ownerUnits: [],
      };
    }
    normalizedOwnerUnits.push(documentIdentity(category, key));
  }
  const uniqueOwners = [...new Set(normalizedOwnerUnits.map(lower))];
  if (uniqueOwners.length < 2) {
    return {
      ok: false,
      code: 'SHARED_OWNERSHIP_REQUIRES_TWO_UNITS',
      ownerUnits: normalizedOwnerUnits,
    };
  }
  if (
    requiredOwner !== undefined &&
    !uniqueOwners.includes(lower(requiredOwner))
  ) {
    return {
      ok: false,
      code: 'SHARED_OWNER_MISSING_REQUIRED_UNIT',
      ownerUnits: normalizedOwnerUnits,
    };
  }
  return {
    ok: true,
    code: null,
    ownerUnits: normalizedOwnerUnits,
  };
}

export function discoverDocumentationEntries(files, { category } = {}) {
  const contract = categoryContract(category, { allowInactive: true });
  const canonicalPattern = new RegExp(
    `^${escapeRegExp(DOCUMENTATION_ROOT)}/${escapeRegExp(category)}/([^/]+)/\\1${escapeRegExp(contract.extension)}$`,
  );
  const legacyPattern = new RegExp(
    `^${escapeRegExp(DOCUMENTATION_ROOT)}/${escapeRegExp(category)}/([^/]+)${escapeRegExp(contract.extension)}$`,
  );
  const canonical = [];
  const legacy = [];
  const excluded = [];
  const collisions = [];
  const keysByFold = new Map();

  for (const [filePath, content] of fileEntries(files)) {
    const normalized = normalizeRepositoryPath(filePath);
    if (!normalized.ok) {
      excluded.push(String(filePath));
      continue;
    }
    if (!normalized.path.startsWith(`${DOCUMENTATION_ROOT}/${category}/`)) continue;
    const canonicalMatch = normalized.path.match(canonicalPattern);
    const legacyMatch = normalized.path.match(legacyPattern);
    if (!canonicalMatch && !legacyMatch) {
      excluded.push(normalized.path);
      continue;
    }
    const key = (canonicalMatch ?? legacyMatch)[1];
    const validation = validateDocumentKey(category, key);
    if (!validation.ok) {
      excluded.push(normalized.path);
      continue;
    }
    const folded = lower(key);
    const prior = keysByFold.get(folded);
    if (prior && prior.key !== key) {
      collisions.push({
        code: 'CASE_INSENSITIVE_COLLISION',
        paths: [prior.path, normalized.path].sort(),
      });
    } else {
      keysByFold.set(folded, { key, path: normalized.path });
    }
    const record = {
      key,
      path: normalized.path,
      content,
      kind: canonicalMatch ? 'canonical' : 'legacy',
    };
    (canonicalMatch ? canonical : legacy).push(record);
  }

  const sorter = (left, right) =>
    compareCodePoints(lower(left.key), lower(right.key)) || compareCodePoints(left.path, right.path);
  canonical.sort(sorter);
  legacy.sort(sorter);
  excluded.sort(compareCodePoints);
  collisions.sort((left, right) => compareCodePoints(left.paths[0], right.paths[0]));
  return { canonical, legacy, excluded, collisions };
}

export function resolveDocumentationEntryState({
  files,
  category,
  key,
  explicitPath,
} = {}) {
  categoryContract(category, { allowInactive: true });
  requireValidKey(category, key);
  const inventory = normalizedFileInventory(files);
  const map = inventory.files;

  if (explicitPath) {
    const normalized = normalizeRepositoryPath(explicitPath);
    if (!normalized.ok || !isInsideDocumentationRoot(normalized.path)) {
      return {
        state: 'invalid-explicit-path',
        selectedPath: null,
        canonicalPath: null,
        legacyPath: null,
        conflict: normalized.ok ? 'outside-documentation-root' : normalized.code,
      };
    }
    const explicitInventoryConflicts = inventoryErrorsForExpectedPaths(
      inventory.errors,
      [normalized.path],
    );
    if (explicitInventoryConflicts.length > 0) {
      return {
        state: 'path-inventory-conflict',
        selectedPath: null,
        canonicalPath: null,
        legacyPath: null,
        conflict: explicitInventoryConflicts[0].code,
        pathConflicts: explicitInventoryConflicts,
      };
    }
    return {
      state: map.has(normalized.path) ? 'explicit-existing' : 'explicit-missing',
      selectedPath: normalized.path,
      canonicalPath: null,
      legacyPath: null,
      conflict: null,
    };
  }

  const canonicalPath = buildCanonicalEntryPath(category, key, { allowInactive: true });
  const legacyPath = buildLegacyEntryPath(category, key, { allowInactive: true });
  const pathInventoryConflicts = inventoryErrorsForExpectedPaths(
    inventory.errors,
    [canonicalPath, legacyPath],
  );
  if (pathInventoryConflicts.length > 0) {
    return {
      state: 'path-inventory-conflict',
      selectedPath: null,
      canonicalPath,
      legacyPath,
      conflict: pathInventoryConflicts[0].code,
      pathConflicts: pathInventoryConflicts,
    };
  }
  const conflictingPaths = [...map.keys()]
    .filter(
      (candidate) =>
        (lower(candidate) === lower(canonicalPath) &&
          candidate !== canonicalPath) ||
        (lower(candidate) === lower(legacyPath) && candidate !== legacyPath),
    )
    .sort(compareCodePoints);
  if (conflictingPaths.length > 0) {
    return {
      state: 'case-insensitive-conflict',
      selectedPath: null,
      canonicalPath,
      legacyPath,
      conflict: 'CASE_INSENSITIVE_COLLISION',
      conflictingPaths,
    };
  }
  const canonical = map.get(canonicalPath);
  const legacy = map.get(legacyPath);
  if (canonical !== undefined && legacy !== undefined) {
    const equivalent = equivalentDocumentationContent(canonical, legacy);
    return {
      state: equivalent ? 'both-equivalent' : 'both-conflicting',
      selectedPath: equivalent ? canonicalPath : null,
      canonicalPath,
      legacyPath,
      conflict: equivalent ? null : 'CANONICAL_LEGACY_CONFLICT',
    };
  }
  if (canonical !== undefined) {
    return {
      state: 'canonical-existing',
      selectedPath: canonicalPath,
      canonicalPath,
      legacyPath,
      conflict: null,
    };
  }
  if (legacy !== undefined) {
    return {
      state: 'legacy-existing',
      selectedPath: legacyPath,
      canonicalPath,
      legacyPath,
      conflict: null,
    };
  }
  return {
    state: 'missing',
    selectedPath: canonicalPath,
    canonicalPath,
    legacyPath,
    conflict: null,
  };
}

export function buildDocumentationMigrationPlan({
  files,
  uiCaptureContexts = [],
  artifactContexts = [],
  authorized = false,
  documentScope = [],
  authorizedDocuments = [],
} = {}) {
  const inputInventory = normalizedFileInventory(files);
  const sourceFiles = inputInventory.files;
  const conflicts = [...inputInventory.errors];
  const warnings = [];
  const orphanAssets = [];
  const operations = [];
  const mappings = new Map();
  const documentMoves = [];
  const destinationRegistry = new Map();
  const scope = normalizeMigrationDocumentSelectors(documentScope);
  const authorization = normalizeMigrationDocumentSelectors(
    authorizedDocuments,
  );
  conflicts.push(...scope.errors, ...authorization.errors);
  if (scope.documentIds.size === 0) {
    conflicts.push({
      code: 'MIGRATION_SCOPE_REQUIRED',
      message: 'Migration planning requires an explicit documentation-unit scope.',
    });
  }
  if (authorized === true) {
    if (scope.documentIds.size === 1) {
      authorization.documentIds.add([...scope.documentIds][0]);
    } else {
      conflicts.push({
        code: 'GLOBAL_MIGRATION_AUTHORIZATION_REJECTED',
        message:
          'Boolean authorization is valid only for one explicitly scoped documentation unit.',
      });
    }
  }
  for (const documentId of authorization.documentIds) {
    if (!scope.documentIds.has(documentId)) {
      conflicts.push({
        code: 'MIGRATION_AUTHORIZATION_OUTSIDE_SCOPE',
        documentId,
      });
    }
  }

  for (const [category, contract] of Object.entries(DOCUMENTATION_CATEGORY_REGISTRY)) {
    if (!contract.active) continue;
    const discovery = discoverDocumentationEntries(sourceFiles, { category });
    conflicts.push(...discovery.collisions);
    const canonicalByKey = new Map(discovery.canonical.map((entry) => [lower(entry.key), entry]));

    for (const legacy of discovery.legacy) {
      if (!scope.documentIds.has(documentIdentity(category, legacy.key))) {
        continue;
      }
      const destination = buildCanonicalEntryPath(category, legacy.key);
      const canonical = canonicalByKey.get(lower(legacy.key));
      if (canonical) {
        if (!equivalentDocumentationContent(canonical.content, legacy.content)) {
          conflicts.push({
            code: 'CANONICAL_LEGACY_CONFLICT',
            category,
            key: legacy.key,
            paths: [canonical.path, legacy.path],
          });
          continue;
        }
        mappings.set(legacy.path, canonical.path);
        operations.push({
          type: 'delete-equivalent-legacy',
          source: legacy.path,
          destination: canonical.path,
          sourceHash: contentHash(legacy.content),
          destinationHash: contentHash(canonical.content),
        });
        warnings.push({
          code: 'EQUIVALENT_LEGACY_COPY',
          path: legacy.path,
          canonicalPath: canonical.path,
        });
        continue;
      }
      registerDestination({
        source: legacy.path,
        destination,
        destinationRegistry,
        sourceFiles,
        conflicts,
        content: legacy.content,
      });
      mappings.set(legacy.path, destination);
      documentMoves.push({
        category,
        key: legacy.key,
        source: legacy.path,
        destination,
        content: legacy.content,
      });
    }
  }

  const documentInventory = collectDocumentInventory(sourceFiles);
  const selectedDocuments = documentInventory.filter((document) =>
    scope.documentIds.has(documentIdentity(document.category, document.key)));
  for (const [category, contract] of Object.entries(DOCUMENTATION_CATEGORY_REGISTRY)) {
    if (!contract.active) continue;
    const selectedCategoryDocuments = selectedDocuments.filter(
      (document) => document.category === category,
    );
    if (selectedCategoryDocuments.length === 0) continue;
    const legacyAssetPrefix = `${DOCUMENTATION_ROOT}/${category}/`;
    const assetPattern = new RegExp(
      `^${escapeRegExp(legacyAssetPrefix)}(${contract.assetDirectories.map(escapeRegExp).join('|')})/([^/]+)$`,
    );
    for (const [assetPath, assetContent] of sourceFiles) {
      const match = assetPath.match(assetPattern);
      if (!match) continue;
      const [, assetDirectory, filename] = match;
      const owners = inferAssetOwners({
        assetPath,
        filename,
        category,
        documents: documentInventory.filter((document) => document.category === category),
        uiCaptureContexts,
        artifactContexts,
      });
      if (owners.length === 0) {
        orphanAssets.push(assetPath);
        warnings.push({
          code: 'ORPHAN_ASSET',
          path: assetPath,
          message: 'Asset ownership is unresolved; the asset remains at its legacy path.',
        });
        continue;
      }
      const selectedOwners = owners.filter((owner) =>
        scope.documentIds.has(documentIdentity(category, owner)));
      if (selectedOwners.length === 0) continue;
      if (selectedOwners.length !== owners.length) {
        conflicts.push({
          code: 'ASSET_OWNER_OUTSIDE_MIGRATION_SCOPE',
          path: assetPath,
          owners,
          selectedOwners,
        });
        continue;
      }

      let destination;
      if (owners.length > 1) {
        destination = buildSharedAssetPath(assetDirectory, filename, {
          ownerUnits: owners.map((owner) => documentIdentity(category, owner)),
        });
      } else {
        const owner = owners[0];
        const conciseFilename = stripOwnedFilenamePrefix(filename, owner);
        destination = buildUnitAssetPath(category, owner, assetDirectory, conciseFilename);
      }
      registerDestination({
        source: assetPath,
        destination,
        destinationRegistry,
        sourceFiles,
        conflicts,
        content: assetContent,
      });
      mappings.set(assetPath, destination);
    }
  }

  const relativeMappingsByDocument = new Map();
  for (const document of documentMoves) {
    relativeMappingsByDocument.set(
      document.source,
      buildDocumentRelativeMappings({
        document,
        sourcePath: document.source,
        destinationPath: document.destination,
        mappings,
        documentInventory,
        uiCaptureContexts,
        artifactContexts,
      }),
    );
  }
  const selectedCanonicalDocuments = selectedDocuments.filter(
    (document) => document.kind === 'canonical',
  );
  for (const document of selectedCanonicalDocuments) {
    relativeMappingsByDocument.set(
      document.path,
      buildDocumentRelativeMappings({
        document,
        sourcePath: document.path,
        destinationPath: document.path,
        mappings,
        documentInventory,
        uiCaptureContexts,
        artifactContexts,
      }),
    );
  }

  if (conflicts.length === 0) {
    const rewrittenDocumentPaths = new Set();
    for (const document of documentMoves) {
      let content = textValue(document.content);
      content = rewriteAuthoritativeRepositoryReferences(content, mappings);
      content = rewriteMarkdownAndHtmlLinks(
        content,
        relativeMappingsByDocument.get(document.source) ?? new Map(),
      );
      operations.push({
        type: 'move',
        source: document.source,
        destination: document.destination,
        sourceHash: contentHash(document.content),
        destinationHash: contentHash(content),
        content,
        binary: false,
      });
    }

    for (const document of selectedCanonicalDocuments) {
      let content = textValue(document.content);
      content = rewriteAuthoritativeRepositoryReferences(content, mappings);
      content = rewriteMarkdownAndHtmlLinks(
        content,
        relativeMappingsByDocument.get(document.path) ?? new Map(),
      );
      rewrittenDocumentPaths.add(document.path);
      if (content === textValue(document.content)) continue;
      operations.push({
        type: 'rewrite',
        path: document.path,
        sourceHash: contentHash(document.content),
        destinationHash: contentHash(content),
        content,
      });
    }

    for (const [source, destination] of mappings) {
      if (documentMoves.some((document) => document.source === source)) continue;
      if (!sourceFiles.has(source)) continue;
      const content = sourceFiles.get(source);
      operations.push({
        type: 'move',
        source,
        destination,
        sourceHash: contentHash(content),
        destinationHash: contentHash(content),
        content,
        binary: isBinary(content),
      });
    }

    for (const [filePath, content] of sourceFiles) {
      if (!isTextFile(filePath, content)) continue;
      if (mappings.has(filePath)) continue;
      if (rewrittenDocumentPaths.has(filePath)) continue;
      const fileMappings = buildFileRelativeMappings(filePath, mappings);
      const rewritten = rewriteAuthoritativeRepositoryReferences(
        textValue(content),
        fileMappings,
      );
      if (rewritten === textValue(content)) continue;
      operations.push({
        type: 'rewrite',
        path: filePath,
        sourceHash: contentHash(content),
        destinationHash: contentHash(rewritten),
        content: rewritten,
      });
    }
  }

  const migrationValidation =
    conflicts.length === 0
      ? validateProjectedMigration(sourceFiles, operations)
      : { checked: false, errors: [] };
  conflicts.push(...migrationValidation.errors);
  const deduplicatedConflicts = uniqueObjects(conflicts);
  const scopedDocumentIds = [...scope.documentIds].sort();
  const authorizedDocumentIds = scopedDocumentIds.filter((documentId) =>
    authorization.documentIds.has(documentId));
  const unauthorizedDocumentIds = scopedDocumentIds.filter(
    (documentId) => !authorization.documentIds.has(documentId),
  );
  return {
    layoutVersion: DOCUMENTATION_LAYOUT_VERSION,
    authorized:
      scopedDocumentIds.length > 0 && unauthorizedDocumentIds.length === 0,
    documentScope: scopedDocumentIds,
    authorizedDocuments: authorizedDocumentIds,
    unauthorizedDocuments: unauthorizedDocumentIds,
    ok: deduplicatedConflicts.length === 0,
    conflicts: deduplicatedConflicts,
    warnings: uniqueObjects(warnings),
    orphanAssets: [...new Set(orphanAssets)].sort(),
    mappings: [...mappings.entries()]
      .map(([source, destination]) => ({ source, destination }))
      .sort(comparePathPair),
    operations: sortMigrationOperations(operations),
    preflight: {
      complete: deduplicatedConflicts.length === 0,
      collisionChecked: true,
      caseInsensitiveCollisionChecked: true,
      containmentChecked: true,
      ownershipChecked: true,
      referenceRewritePlanned: true,
      canonicalLegacyConflictChecked: true,
      localLinkValidationChecked: migrationValidation.checked,
      binaryHashChecked: migrationValidation.checked,
      sourceSnapshotDigest: fileMapDigest(sourceFiles),
      destinationSnapshotDigest:
        migrationValidation.destinationSnapshotDigest ?? null,
    },
  };
}

export function applyMigrationPlanToSnapshot(files, plan) {
  const untouchedFiles = cloneFileMap(new Map(fileEntries(files)));
  if (!plan?.ok) {
    return {
      ok: false,
      changed: false,
      blockers: plan?.conflicts ?? [{ code: 'INVALID_MIGRATION_PLAN' }],
      files: Object.fromEntries(untouchedFiles),
    };
  }
  if (!plan.authorized) {
    return {
      ok: false,
      changed: false,
      blockers: [{ code: 'MIGRATION_NOT_AUTHORIZED' }],
      files: Object.fromEntries(untouchedFiles),
    };
  }
  const currentInventory = normalizedFileInventory(files);
  if (currentInventory.errors.length > 0) {
    return {
      ok: false,
      changed: false,
      blockers: currentInventory.errors,
      files: Object.fromEntries(untouchedFiles),
    };
  }
  const original = currentInventory.files;
  const currentSnapshotDigest = fileMapDigest(original);
  const sourceSnapshotDigest = plan.preflight?.sourceSnapshotDigest;
  const destinationSnapshotDigest = plan.preflight?.destinationSnapshotDigest;
  if (
    typeof sourceSnapshotDigest !== 'string' ||
    typeof destinationSnapshotDigest !== 'string' ||
    ![sourceSnapshotDigest, destinationSnapshotDigest].includes(
      currentSnapshotDigest,
    )
  ) {
    return {
      ok: false,
      changed: false,
      blockers: [
        {
          code: 'SNAPSHOT_CHANGED_SINCE_PREFLIGHT',
          expectedSourceDigest: sourceSnapshotDigest ?? null,
          expectedDestinationDigest: destinationSnapshotDigest ?? null,
          currentDigest: currentSnapshotDigest,
        },
      ],
      files: Object.fromEntries(untouchedFiles),
    };
  }
  const resultFiles = cloneFileMap(original);

  const blockers = [];
  for (const operation of plan.operations ?? []) {
    if (operation.type === 'rewrite') {
      const current = resultFiles.get(operation.path);
      if (current === undefined) {
        blockers.push({ code: 'REWRITE_SOURCE_MISSING', path: operation.path });
        continue;
      }
      const currentHash = contentHash(current);
      if (![operation.sourceHash, operation.destinationHash].includes(currentHash)) {
        blockers.push({ code: 'SOURCE_CHANGED_SINCE_PREFLIGHT', path: operation.path });
      }
      continue;
    }

    const source = resultFiles.get(operation.source);
    const destination = resultFiles.get(operation.destination);
    if (source === undefined) {
      if (destination !== undefined && contentHash(destination) === operation.destinationHash) continue;
      blockers.push({
        code: 'MOVE_SOURCE_MISSING',
        source: operation.source,
        destination: operation.destination,
      });
      continue;
    }
    if (contentHash(source) !== operation.sourceHash) {
      blockers.push({ code: 'SOURCE_CHANGED_SINCE_PREFLIGHT', path: operation.source });
    }
    if (
      destination !== undefined &&
      contentHash(destination) !== operation.destinationHash
    ) {
      blockers.push({
        code: 'DESTINATION_EXISTS',
        source: operation.source,
        destination: operation.destination,
      });
    }
  }
  if (blockers.length > 0) {
    return {
      ok: false,
      changed: false,
      blockers,
      files: Object.fromEntries(resultFiles),
    };
  }

  for (const operation of plan.operations ?? []) {
    if (operation.type === 'rewrite') {
      if (contentHash(resultFiles.get(operation.path)) === operation.destinationHash) continue;
      resultFiles.set(operation.path, cloneContent(operation.content));
      continue;
    }
    if (operation.type === 'delete-equivalent-legacy') {
      if (resultFiles.has(operation.source)) resultFiles.delete(operation.source);
      continue;
    }
    if (operation.type === 'move') {
      if (!resultFiles.has(operation.source)) continue;
      resultFiles.set(operation.destination, cloneContent(operation.content));
      resultFiles.delete(operation.source);
    }
  }

  const changed = fileMapDigest(original) !== fileMapDigest(resultFiles);
  return {
    ok: true,
    changed,
    blockers: [],
    files: Object.fromEntries(resultFiles),
  };
}

export function resolveDocumentationWriteTarget({
  document_role: documentRole,
  category,
  key,
  scope,
  module,
  portal,
  execution_host_repository_id: executionHostRepositoryId,
} = {}) {
  if (
    !['module-source', 'portal-integration', 'portal-index', 'portal-reference', 'aggregate']
      .includes(documentRole)
  ) {
    throw new TypeError(`unsupported documentation role: ${documentRole}`);
  }
  if (documentRole === 'module-source' && scope !== 'module') {
    throw new Error('portal fallback is forbidden for an editable module document');
  }
  if (documentRole === 'aggregate' && scope !== 'cross-repository-aggregate') {
    throw new Error('a cross-repository aggregate must be owned by the portal repository');
  }
  if (
    ['portal-integration', 'portal-index', 'portal-reference'].includes(documentRole) &&
    scope !== 'portal-composition'
  ) {
    throw new Error(`${documentRole} must be owned by the portal repository`);
  }

  const owner = resolveArtifactOwner({
    artifact_kind: 'documentation-asset',
    scope,
    module,
    portal,
    execution_host_repository_id: executionHostRepositoryId,
  });
  if (documentRole === 'module-source') {
    if (module?.available !== true || module?.writable !== true) {
      return {
        status: 'blocked',
        artifact_kind: owner.artifact_kind,
        document_role: documentRole,
        owner_repository_id: owner.owner_repository_id,
        owner_repository_role: owner.owner_repository_role,
        owner_module_id: owner.owner_module_id,
        execution_host_repository_id: owner.execution_host_repository_id,
        repository_relative_path: null,
        blockers: [
          module?.available !== true
            ? `owner repository is unavailable for ${module?.id ?? 'module'}`
            : `owner repository is not writable for ${module?.id ?? 'module'}`,
        ],
      };
    }
    if (category === 'user-guides' && module.id !== key) {
      throw new Error('a module user guide key must equal its semantic module id');
    }
  }

  const repositoryRelativePath =
    documentRole === 'aggregate'
      ? `${DOCUMENTATION_ROOT}/sdcorejs-user-guide.md`
      : buildCanonicalEntryPath(category, key);
  return {
    status: 'resolved',
    artifact_kind: owner.artifact_kind,
    document_role: documentRole,
    owner_repository_id: owner.owner_repository_id,
    owner_repository_role: owner.owner_repository_role,
    owner_module_id: owner.owner_module_id,
    execution_host_repository_id: owner.execution_host_repository_id,
    repository_relative_path: repositoryRelativePath,
    blockers: [],
  };
}

export function buildMultiRepositoryDocumentationAggregate({
  sources,
  projectTitle,
  generatedAt,
  portalRevision,
  changeRef = 'documentation-aggregate',
  sourceSpec = 'none',
  sourcePlan = 'none',
} = {}) {
  const errors = [];
  const warnings = [];
  const modules = [];
  const provenance = [];
  const projectedAssetContent = new Map();
  const seenModules = new Set();
  if (!GIT_REVISION_PATTERN.test(portalRevision ?? '')) {
    errors.push({ code: 'INVALID_PORTAL_REVISION' });
  }
  if (!Array.isArray(sources) || sources.length === 0) {
    errors.push({ code: 'NO_MODULE_SOURCES' });
  }

  const orderedSources = Array.isArray(sources)
    ? [...sources].sort((left, right) =>
        compareCodePoints(
          String(left?.module_id ?? ''),
          String(right?.module_id ?? ''),
        ))
    : [];
  for (const source of orderedSources) {
    const moduleId = source?.module_id;
    const repositoryId = source?.repository_id;
    const revision = source?.source_revision;
    const sourceMode = source?.source_mode;
    const validation = validateDocumentKey('user-guides', moduleId);
    if (
      !validation.ok ||
      typeof repositoryId !== 'string' ||
      repositoryId.trim() === '' ||
      !GIT_REVISION_PATTERN.test(revision ?? '')
    ) {
      errors.push({
        code: 'INVALID_MODULE_SOURCE_IDENTITY',
        module_id: moduleId ?? null,
      });
      continue;
    }
    if (seenModules.has(lower(moduleId))) {
      errors.push({ code: 'DUPLICATE_MODULE_SOURCE', module_id: moduleId });
      continue;
    }
    seenModules.add(lower(moduleId));

    const expectedSourcePath = buildCanonicalEntryPath('user-guides', moduleId);
    const normalizedSourcePath = normalizeRepositoryPath(source.source_path);
    if (
      !normalizedSourcePath.ok ||
      normalizedSourcePath.path !== expectedSourcePath
    ) {
      errors.push({
        code: 'INVALID_MODULE_SOURCE_PATH',
        module_id: moduleId,
        expected: expectedSourcePath,
        actual: source.source_path ?? null,
      });
      continue;
    }
    const sourceRecord = {
      module_id: moduleId,
      repository_id: repositoryId,
      source_revision: revision,
      source_mode: sourceMode,
      source_path: expectedSourcePath,
      export_version: source.export_version ?? null,
      source_url: source.source_url ?? null,
    };

    if (sourceMode === 'repository-link') {
      if (
        typeof source.source_url !== 'string' ||
        !/^https?:\/\//u.test(source.source_url)
      ) {
        errors.push({ code: 'INVALID_REPOSITORY_SOURCE_LINK', module_id: moduleId });
        continue;
      }
      if (source.files && fileEntries(source.files).length > 0) {
        errors.push({ code: 'EDITABLE_PORTAL_COPY_FORBIDDEN', module_id: moduleId });
        continue;
      }
      const title = singleLineText(source.title || titleFromKey(moduleId));
      modules.push({
        key: moduleId,
        title,
        path: expectedSourcePath,
        kind: 'repository-link',
        coverage: { total: 0, met: 0, partial: 0, missing: 0 },
        body:
          `Canonical source: [${title}](${source.source_url})\n\n` +
          `Editable content remains owned by \`${repositoryId}\` at revision \`${revision}\`.`,
        localLinks: [],
      });
      provenance.push(sourceRecord);
      continue;
    }

    if (
      sourceMode !== 'versioned-export' ||
      typeof source.export_version !== 'string' ||
      source.export_version.trim() === ''
    ) {
      errors.push({ code: 'INVALID_VERSIONED_EXPORT', module_id: moduleId });
      continue;
    }
    const inventory = normalizedFileInventory(source.files);
    const guideContent = inventory.files.get(expectedSourcePath);
    if (guideContent === undefined) {
      errors.push({ code: 'MISSING_VERSIONED_SOURCE', module_id: moduleId });
      continue;
    }
    if (
      !/^[a-f0-9]{64}$/iu.test(source.content_sha256 ?? '') ||
      contentHash(guideContent) !== source.content_sha256.toLowerCase()
    ) {
      errors.push({ code: 'SOURCE_CONTENT_HASH_MISMATCH', module_id: moduleId });
      continue;
    }
    errors.push(
      ...inventory.errors
        .filter(isDocumentationInventoryError)
        .map((error) => ({ ...error, module_id: moduleId })),
    );
    const sharedPaths = [...inventory.files.keys()].filter((filePath) =>
      filePath.startsWith(`${DOCUMENTATION_ROOT}/_shared/`));
    if (sharedPaths.length > 0) {
      const sharedOwnership = validateSharedOwnership(source.shared_ownership);
      if (!sharedOwnership.ok) {
        errors.push({
          code: sharedOwnership.code,
          module_id: moduleId,
          paths: sharedPaths,
        });
        continue;
      }
    }

    const moduleBuild = buildAggregateUserGuide({
      files: source.files,
      projectTitle,
      generatedAt,
      gitHead: revision,
      changeRef,
      sourceSpec,
      sourcePlan,
      verifiedImageEvidence: source.verified_image_evidence ?? [],
    });
    if (!moduleBuild.ok || moduleBuild.modules.length !== 1) {
      errors.push(
        ...moduleBuild.errors.map((error) => ({
          ...error,
          module_id: moduleId,
        })),
      );
      continue;
    }
    modules.push(moduleBuild.modules[0]);
    warnings.push(...moduleBuild.warnings.map((warning) => ({
      ...warning,
      module_id: moduleId,
    })));
    provenance.push(sourceRecord);
    for (const [filePath, content] of inventory.files) {
      if (filePath === expectedSourcePath) continue;
      const existing = projectedAssetContent.get(filePath);
      if (existing !== undefined && contentHash(existing) !== contentHash(content)) {
        errors.push({
          code: 'PROJECTED_ASSET_COLLISION',
          module_id: moduleId,
          path: filePath,
        });
        continue;
      }
      projectedAssetContent.set(filePath, content);
    }
  }

  modules.sort((left, right) =>
    compareCodePoints(lower(left.key), lower(right.key)) ||
    compareCodePoints(left.key, right.key));
  provenance.sort((left, right) =>
    compareCodePoints(lower(left.module_id), lower(right.module_id)));
  const coverage = modules.reduce(
    (total, module) => ({
      total: total.total + module.coverage.total,
      met: total.met + module.coverage.met,
      partial: total.partial + module.coverage.partial,
      missing: total.missing + module.coverage.missing,
    }),
    { total: 0, met: 0, partial: 0, missing: 0 },
  );
  const output = renderAggregate({
    projectTitle: projectTitle || 'Project',
    generatedAt: generatedAt || '<ISO8601>',
    gitHead: portalRevision || '<sha>',
    changeRef,
    sourceSpec,
    sourcePlan,
    modules,
    coverage,
    provenance,
    generatedProjection: true,
    editableSource: false,
  });
  return {
    ok: errors.length === 0 && modules.length === orderedSources.length,
    output,
    modules,
    coverage,
    provenance,
    generated_projection: true,
    editable_source: false,
    projected_assets: [...projectedAssetContent.keys()].sort(compareCodePoints),
    warnings: uniqueObjects(warnings),
    errors: uniqueObjects(errors),
  };
}

export function buildAggregateUserGuide({
  files,
  projectTitle,
  generatedAt,
  gitHead,
  changeRef,
  sourceSpec = 'none',
  sourcePlan = 'none',
  verifiedImageEvidence = [],
  requireVerifiedImageEvidence = true,
} = {}) {
  const sourceInventory = normalizedFileInventory(files);
  const sourceFiles = sourceInventory.files;
  const verifiedImages = verifiedImageEvidenceKeys(
    verifiedImageEvidence,
    gitHead,
    changeRef,
    sourceFiles,
  );
  const discovery = discoverDocumentationEntries(sourceFiles, { category: 'user-guides' });
  const warnings = [];
  const errors = [
    ...sourceInventory.errors.filter(isDocumentationInventoryError),
    ...discovery.collisions,
  ];
  const canonicalByKey = new Map(discovery.canonical.map((entry) => [lower(entry.key), entry]));
  const legacyByKey = new Map(discovery.legacy.map((entry) => [lower(entry.key), entry]));
  const keys = [...new Set([...canonicalByKey.keys(), ...legacyByKey.keys()])].sort();
  const modules = [];

  for (const foldedKey of keys) {
    const canonical = canonicalByKey.get(foldedKey);
    const legacy = legacyByKey.get(foldedKey);
    if (
      canonical &&
      legacy &&
      !equivalentDocumentationContent(canonical.content, legacy.content)
    ) {
      errors.push({
        code: 'CANONICAL_LEGACY_CONFLICT',
        key: canonical.key,
        paths: [canonical.path, legacy.path],
      });
      continue;
    }
    if (canonical && legacy) {
      warnings.push({
        code: 'EQUIVALENT_LEGACY_COPY',
        key: canonical.key,
        canonicalPath: canonical.path,
        legacyPath: legacy.path,
      });
    }
    const selected = canonical ?? legacy;
    const parsed = parseDocumentationFrontmatter(textValue(selected.content));
    if (!parsed.exists) {
      warnings.push({
        code: 'MISSING_FRONTMATTER',
        path: selected.path,
      });
    } else if (parsed.malformed) {
      warnings.push({
        code: 'MALFORMED_FRONTMATTER',
        path: selected.path,
      });
    }
    const title = stringValue(parsed.metadata.title) || titleFromKey(selected.key);
    const coverage = parseCoverage(parsed.metadata.coverage);
    const body = shiftGuideBodyHeadings(parsed.body);
    const rewritten = rewriteAggregateLinks(body, {
      entryPath: selected.path,
      existingPaths: [...sourceFiles.keys()],
    });
    errors.push(...rewritten.errors.map((error) => ({ ...error, module: selected.key })));
    if (requireVerifiedImageEvidence) {
      for (const target of rewritten.localLinks.filter(isAggregateImageTarget)) {
        const imagePath = `${DOCUMENTATION_ROOT}/${target.split(/[?#]/, 1)[0]}`;
        if (!verifiedImages.has(`${selected.path}\0${imagePath}`)) {
          errors.push({
            code: 'UNVERIFIED_GUIDE_IMAGE',
            module: selected.key,
            source: selected.path,
            target,
          });
        }
      }
    }
    modules.push({
      key: selected.key,
      title,
      path: selected.path,
      kind: selected.kind,
      coverage,
      body: rewritten.markdown,
      localLinks: rewritten.localLinks,
    });
  }

  modules.sort((left, right) =>
    compareCodePoints(lower(left.key), lower(right.key)) || compareCodePoints(left.key, right.key));
  if (modules.length === 0 && errors.length === 0) {
    errors.push({ code: 'NO_MODULE_GUIDES' });
  }

  const coverage = modules.reduce(
    (total, module) => ({
      total: total.total + module.coverage.total,
      met: total.met + module.coverage.met,
      partial: total.partial + module.coverage.partial,
      missing: total.missing + module.coverage.missing,
    }),
    { total: 0, met: 0, partial: 0, missing: 0 },
  );
  const output = renderAggregate({
    projectTitle: projectTitle || 'Project',
    generatedAt: generatedAt || '<ISO8601>',
    gitHead: gitHead || '<sha>',
    changeRef: changeRef || 'documentation-aggregate',
    sourceSpec,
    sourcePlan,
    modules,
    coverage,
  });

  return {
    ok: errors.length === 0,
    output,
    modules,
    coverage,
    warnings: uniqueObjects(warnings),
    errors: uniqueObjects(errors),
  };
}

export function rewriteAggregateLinks(
  markdown,
  { entryPath, existingPaths = [] } = {},
) {
  const normalizedEntry = normalizeRepositoryPath(entryPath);
  if (!normalizedEntry.ok) {
    return {
      markdown,
      localLinks: [],
      errors: [{ code: normalizedEntry.code, path: entryPath }],
    };
  }
  const canonical = parseCanonicalEntryPath(normalizedEntry.path);
  const legacy = parseLegacyEntryPath(normalizedEntry.path);
  const entry = canonical ?? legacy;
  if (!entry || entry.category !== 'user-guides') {
    return {
      markdown,
      localLinks: [],
      errors: [{ code: 'INVALID_GUIDE_ENTRY_PATH', path: normalizedEntry.path }],
    };
  }

  const existing = new Set(
    existingPaths
      .map((candidate) => normalizeRepositoryPath(candidate))
      .filter((candidate) => candidate.ok)
      .map((candidate) => candidate.path),
  );
  const localLinks = [];
  const errors = [];
  const lines = normalizeText(markdown).split('\n');
  let fence = null;
  const output = lines.map((line) => {
    const fenceState = advanceFenceState(line, fence);
    fence = fenceState.fence;
    if (fenceState.delimiter) {
      return line;
    }
    if (fence) return line;
    return transformOutsideInlineCode(line, (piece) =>
      rewriteLinkSyntax(piece, (target) => {
          const rewritten = rewriteAggregateTarget(target, entry);
          const validation = validateAggregateLocalTarget(rewritten.target, existing);
          if (validation.local) {
            localLinks.push(rewritten.target);
            if (!validation.ok) {
              errors.push({
                code: validation.code,
                source: normalizedEntry.path,
                target: rewritten.target,
              });
            }
          }
          return rewritten.target;
        }),
    );
  });
  return {
    markdown: output.join('\n'),
    localLinks: [...new Set(localLinks)].sort(),
    errors: uniqueObjects(errors),
  };
}

export function buildPandocExportPlan({ targetRoot, format } = {}) {
  if (!['docx', 'pdf'].includes(format)) {
    throw new Error('Pandoc format must be docx or pdf.');
  }
  const resolvedTarget = resolveFilesystemPath(targetRoot);
  const documentationRoot = joinFilesystemPath(
    resolvedTarget,
    '.sdcorejs',
    'documentation',
  );
  const input = joinFilesystemPath(documentationRoot, 'sdcorejs-user-guide.md');
  const output = joinFilesystemPath(
    documentationRoot,
    `sdcorejs-user-guide.${format}`,
  );
  const executable = 'pandoc';
  const args = [input, '-o', output, '--resource-path', documentationRoot];
  return {
    format,
    executable,
    args,
    input,
    output,
    resourceRoot: documentationRoot,
    posixDisplay: [executable, ...args].map(quotePosix).join(' '),
    powerShellDisplay: `& ${[executable, ...args].map(quotePowerShell).join(' ')}`,
  };
}

export function summarizeExportCapabilities({
  pandocAvailable = false,
  pdfEngineAvailable = false,
  aggregateMarkdown,
  docxVerification,
  pdfVerification,
} = {}) {
  const aggregateEvidence = buildAggregateExportEvidence(aggregateMarkdown);
  return {
    docx: summarizeOneExport({
      capability: pandocAvailable,
      unavailableReason: 'Pandoc is unavailable.',
      verification: docxVerification,
      aggregateEvidence,
    }),
    pdf: summarizeOneExport({
      capability: pandocAvailable && pdfEngineAvailable,
      unavailableReason: pandocAvailable
        ? 'PDF engine is unavailable.'
        : 'Pandoc is unavailable.',
      verification: pdfVerification,
      aggregateEvidence,
    }),
  };
}

export function validateGuideImageRelationship({
  guidePath,
  imagePath,
  sharedOwnership,
  explicitApprovedGuidePath = false,
  allowLegacyGuide = false,
} = {}) {
  const guide = normalizeRepositoryPath(guidePath);
  const image = normalizeRepositoryPath(imagePath);
  if (!guide.ok || !image.ok) {
    return {
      ok: false,
      code: !guide.ok ? guide.code : image.code,
      relationship: 'invalid',
    };
  }
  if (!isInsideDocumentationRoot(guide.path) || !isInsideDocumentationRoot(image.path)) {
    return {
      ok: false,
      code: 'OUTSIDE_DOCUMENTATION_ROOT',
      relationship: 'invalid',
    };
  }

  const canonical = parseCanonicalEntryPath(guide.path);
  const legacy = allowLegacyGuide ? parseLegacyEntryPath(guide.path) : null;
  const entry = canonical ?? legacy;
  if (entry && entry.category !== 'user-guides') {
    return {
      ok: false,
      code: 'INVALID_GUIDE_CATEGORY',
      relationship: 'invalid',
    };
  }
  if (!entry && !explicitApprovedGuidePath) {
    return {
      ok: false,
      code: 'INVALID_GUIDE_ENTRY_PATH',
      relationship: 'invalid',
    };
  }
  const explicitUnitRoot = entry ? null : path.posix.dirname(guide.path);
  if (!entry && explicitUnitRoot === DOCUMENTATION_ROOT) {
    return {
      ok: false,
      code: 'INVALID_EXPLICIT_GUIDE_UNIT',
      relationship: 'invalid',
    };
  }
  const unitKey = entry?.key ?? path.posix.basename(explicitUnitRoot);
  const unitIdentity = entry
    ? documentIdentity(entry.category, entry.key)
    : `explicit:${explicitUnitRoot}`;
  const sharedPrefix = `${DOCUMENTATION_ROOT}/_shared/images/`;
  if (image.path.startsWith(sharedPrefix)) {
    const ownership = validateSharedOwnership({
      ownerUnits: sharedOwnership?.ownerUnits,
      requiredOwner: unitIdentity,
    });
    const proven = sharedOwnership?.proven === true && ownership.ok;
    return proven
      ? { ok: true, code: null, relationship: 'proven-shared', unitKey }
      : {
          ok: false,
          code: 'SHARED_OWNERSHIP_UNPROVEN',
          relationship: 'invalid',
          unitKey,
        };
  }
  if (entry?.kind === 'legacy') {
    const legacyImagePrefix =
      `${DOCUMENTATION_ROOT}/${entry.category}/images/${entry.key}-`;
    if (image.path.startsWith(legacyImagePrefix)) {
      return {
        ok: true,
        code: null,
        relationship: 'legacy-owned-flat',
        unitKey,
      };
    }
  }

  const unitRoot = entry
    ? `${DOCUMENTATION_ROOT}/${entry.category}/${entry.key}/`
    : `${explicitUnitRoot}/`;
  if (!image.path.startsWith(unitRoot)) {
    return {
      ok: false,
      code: 'CROSS_UNIT_IMAGE',
      relationship: 'invalid',
      unitKey,
    };
  }
  const relative = image.path.slice(unitRoot.length);
  const firstSegment = relative.split('/')[0];
  if (firstSegment !== 'images' || relative.split('/').includes('..')) {
    return {
      ok: false,
      code: 'INVALID_UNIT_ASSET_PATH',
      relationship: 'invalid',
      unitKey,
    };
  }
  return {
    ok: true,
    code: null,
    relationship: entry ? 'same-unit' : 'explicit-same-unit',
    unitKey,
  };
}

export function validateDocumentationVisualEvidence({ record, sourceFiles } = {}) {
  if (
    !record ||
    typeof record !== 'object' ||
    record.schema_version !== 1 ||
    typeof record.capture_id !== 'string' ||
    record.capture_id.trim() === '' ||
    record.classification !== 'documentation' ||
    record.result !== 'verified' ||
    record.blocker !== null ||
    !DOCUMENTATION_VISUAL_ORIGINS.has(record.evidence_origin)
  ) {
    return { ok: false, code: 'INVALID_VISUAL_EVIDENCE' };
  }
  if (
    !GIT_REVISION_PATTERN.test(record.source_revision ?? '') ||
    !GIT_REVISION_PATTERN.test(record.app_revision ?? '') ||
    record.associated_HEAD_or_diff !== record.source_revision
  ) {
    return { ok: false, code: 'INVALID_VISUAL_REVISION' };
  }
  if (
    record.image?.kind !== 'documentation' ||
    record.image?.exists !== true ||
    record.image?.non_empty !== true ||
    record.image?.decodable !== true ||
    !/^[a-f0-9]{64}$/iu.test(record.image?.sha256 ?? '') ||
    !Number.isInteger(record.image?.width) ||
    record.image.width <= 0 ||
    !Number.isInteger(record.image?.height) ||
    record.image.height <= 0
  ) {
    return { ok: false, code: 'INVALID_VISUAL_IMAGE' };
  }
  if (
    record.evidence_origin === 'real-ui' &&
    (
      typeof record.runner !== 'string' ||
      record.runner.trim() === '' ||
      record.runner === 'unknown' ||
      !['real-ui', 'manual-real-ui'].includes(record.persona?.auth_provenance) ||
      record.assertions?.login_redirect_absent !== true ||
      record.assertions?.access_denied_absent !== true ||
      record.assertions?.target_state_visible !== true ||
      record.assertions?.loading_complete !== true ||
      record.assertions?.pii_screening !== 'pass' ||
      record.redactions_applied !== true
    )
  ) {
    return { ok: false, code: 'INVALID_REAL_UI_EVIDENCE' };
  }
  if (
    record.evidence_origin !== 'real-ui' &&
    (
      typeof record.generator !== 'string' ||
      record.generator.trim() === ''
    )
  ) {
    return { ok: false, code: 'MISSING_VISUAL_GENERATOR' };
  }

  const guide = normalizeRepositoryPath(record.guide_path);
  const image = normalizeRepositoryPath(record.image.file);
  if (!guide.ok || !image.ok) {
    return { ok: false, code: 'INVALID_VISUAL_PATH' };
  }
  const inventory = normalizedFileInventory(sourceFiles);
  const imageContent = inventory.files.get(image.path);
  const imageInspection = inspectRasterImage(imageContent);
  if (
    imageContent === undefined ||
    contentHash(imageContent) !== record.image.sha256.toLowerCase() ||
    !imageInspection.ok ||
    imageInspection.width !== record.image.width ||
    imageInspection.height !== record.image.height
  ) {
    return { ok: false, code: 'VISUAL_CONTENT_MISMATCH' };
  }
  const relationship = validateGuideImageRelationship({
    guidePath: guide.path,
    imagePath: image.path,
    sharedOwnership: record.shared_ownership ?? record.sharedOwnership,
    explicitApprovedGuidePath: record.explicit_approved_guide_path === true,
    allowLegacyGuide: true,
  });
  if (!relationship.ok) {
    return { ok: false, code: relationship.code };
  }
  return {
    ok: true,
    code: null,
    evidence_origin: record.evidence_origin,
    usable_as_real_ui_screenshot: record.evidence_origin === 'real-ui',
    guide_path: guide.path,
    image_path: image.path,
  };
}

function verifiedImageEvidenceKeys(
  records,
  currentHeadOrDiff,
  currentChangeRef,
  sourceFiles,
) {
  const keys = new Set();
  if (!Array.isArray(records) || typeof currentHeadOrDiff !== 'string' || !currentHeadOrDiff) {
    return keys;
  }
  for (const record of records) {
    if (
      record?.change_ref !== currentChangeRef ||
      record?.source_revision !== currentHeadOrDiff
    ) {
      continue;
    }
    const validation = validateDocumentationVisualEvidence({
      record,
      sourceFiles,
    });
    if (!validation.ok || !validation.usable_as_real_ui_screenshot) continue;
    keys.add(`${validation.guide_path}\0${validation.image_path}`);
  }
  return keys;
}

function inspectRasterImage(content) {
  if (!(content instanceof Uint8Array) || content.byteLength === 0) {
    return { ok: false };
  }
  const bytes = Buffer.from(content);
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length >= 33 && bytes.subarray(0, 8).equals(pngSignature)) {
    let offset = 8;
    let width;
    let height;
    let bitDepth;
    let colorType;
    let interlaceMethod;
    let sawPalette = false;
    let sawIend = false;
    const idatChunks = [];
    while (offset + 12 <= bytes.length) {
      const length = bytes.readUInt32BE(offset);
      const chunkEnd = offset + 12 + length;
      if (chunkEnd > bytes.length) return { ok: false };
      const type = bytes.toString('ascii', offset + 4, offset + 8);
      const chunkTypeAndData = bytes.subarray(offset + 4, offset + 8 + length);
      const expectedCrc = bytes.readUInt32BE(offset + 8 + length);
      if (pngCrc32(chunkTypeAndData) !== expectedCrc) return { ok: false };
      if (type === 'IHDR') {
        if (offset !== 8 || length !== 13 || width !== undefined) {
          return { ok: false };
        }
        width = bytes.readUInt32BE(offset + 8);
        height = bytes.readUInt32BE(offset + 12);
        bitDepth = bytes[offset + 16];
        colorType = bytes[offset + 17];
        const compressionMethod = bytes[offset + 18];
        const filterMethod = bytes[offset + 19];
        interlaceMethod = bytes[offset + 20];
        if (
          compressionMethod !== 0 ||
          filterMethod !== 0 ||
          ![0, 1].includes(interlaceMethod) ||
          !validPngColorDepth(colorType, bitDepth)
        ) {
          return { ok: false };
        }
      } else if (type === 'PLTE') {
        sawPalette = length > 0 && length % 3 === 0 && length <= 768;
      } else if (type === 'IDAT') {
        if (length === 0) return { ok: false };
        idatChunks.push(bytes.subarray(offset + 8, offset + 8 + length));
      } else if (type === 'IEND') {
        sawIend = length === 0 && chunkEnd === bytes.length;
        break;
      }
      offset = chunkEnd;
    }
    const expectedInflatedBytes = expectedPngInflatedBytes({
      width,
      height,
      bitDepth,
      colorType,
      interlaceMethod,
    });
    if (
      !sawIend ||
      idatChunks.length === 0 ||
      expectedInflatedBytes === null ||
      (colorType === 3 && !sawPalette)
    ) {
      return { ok: false };
    }
    let inflated;
    try {
      inflated = inflateSync(Buffer.concat(idatChunks), {
        maxOutputLength: expectedInflatedBytes + 1,
      });
    } catch {
      return { ok: false };
    }
    return {
      ok:
        Number.isInteger(width) &&
        width > 0 &&
        Number.isInteger(height) &&
        height > 0 &&
        inflated.length === expectedInflatedBytes &&
        validPngFilterBytes({
          inflated,
          width,
          height,
          bitDepth,
          colorType,
          interlaceMethod,
        }),
      width,
      height,
      format: 'png',
    };
  }
  return { ok: false };
}

function validPngColorDepth(colorType, bitDepth) {
  return (
    (colorType === 0 && [1, 2, 4, 8, 16].includes(bitDepth)) ||
    (colorType === 2 && [8, 16].includes(bitDepth)) ||
    (colorType === 3 && [1, 2, 4, 8].includes(bitDepth)) ||
    (colorType === 4 && [8, 16].includes(bitDepth)) ||
    (colorType === 6 && [8, 16].includes(bitDepth))
  );
}

function expectedPngInflatedBytes({
  width,
  height,
  bitDepth,
  colorType,
  interlaceMethod,
}) {
  if (
    !Number.isInteger(width) ||
    width <= 0 ||
    !Number.isInteger(height) ||
    height <= 0 ||
    !validPngColorDepth(colorType, bitDepth)
  ) {
    return null;
  }
  const samples = new Map([
    [0, 1],
    [2, 3],
    [3, 1],
    [4, 2],
    [6, 4],
  ]).get(colorType);
  const bitsPerPixel = samples * bitDepth;
  const passes =
    interlaceMethod === 0
      ? [[0, 0, 1, 1]]
      : [
          [0, 0, 8, 8],
          [4, 0, 8, 8],
          [0, 4, 4, 8],
          [2, 0, 4, 4],
          [0, 2, 2, 4],
          [1, 0, 2, 2],
          [0, 1, 1, 2],
        ];
  let total = 0;
  for (const [xStart, yStart, xStep, yStep] of passes) {
    const passWidth =
      width <= xStart ? 0 : Math.ceil((width - xStart) / xStep);
    const passHeight =
      height <= yStart ? 0 : Math.ceil((height - yStart) / yStep);
    if (passWidth === 0 || passHeight === 0) continue;
    const rowBytes = Math.ceil((passWidth * bitsPerPixel) / 8);
    total += (rowBytes + 1) * passHeight;
    if (!Number.isSafeInteger(total) || total > 256 * 1024 * 1024) {
      return null;
    }
  }
  return total;
}

function validPngFilterBytes({
  inflated,
  width,
  height,
  bitDepth,
  colorType,
  interlaceMethod,
}) {
  const samples = new Map([
    [0, 1],
    [2, 3],
    [3, 1],
    [4, 2],
    [6, 4],
  ]).get(colorType);
  const bitsPerPixel = samples * bitDepth;
  const passes =
    interlaceMethod === 0
      ? [[0, 0, 1, 1]]
      : [
          [0, 0, 8, 8],
          [4, 0, 8, 8],
          [0, 4, 4, 8],
          [2, 0, 4, 4],
          [0, 2, 2, 4],
          [1, 0, 2, 2],
          [0, 1, 1, 2],
        ];
  let offset = 0;
  for (const [xStart, yStart, xStep, yStep] of passes) {
    const passWidth =
      width <= xStart ? 0 : Math.ceil((width - xStart) / xStep);
    const passHeight =
      height <= yStart ? 0 : Math.ceil((height - yStart) / yStep);
    if (passWidth === 0 || passHeight === 0) continue;
    const rowBytes = Math.ceil((passWidth * bitsPerPixel) / 8);
    for (let row = 0; row < passHeight; row += 1) {
      if (inflated[offset] > 4) return false;
      offset += rowBytes + 1;
    }
  }
  return offset === inflated.length;
}

function pngCrc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function resolveDocumentationTailPlan({
  changedPaths = [],
  explicitAggregateRequest = false,
  aggregateStale = false,
  exportRequested = [],
  branchReadyAssociatedHeadOrDiff,
  currentHeadOrDiff,
} = {}) {
  const moduleGuideChanged = changedPaths.some((candidate) => {
    const normalized = normalizeRepositoryPath(candidate);
    if (!normalized.ok) return false;
    const entry = parseCanonicalEntryPath(normalized.path);
    return entry?.category === 'user-guides';
  });
  const exports = [
    ...new Set(exportRequested.filter((item) => ['docx', 'pdf'].includes(item))),
  ];
  const rebuildAggregate =
    moduleGuideChanged ||
    explicitAggregateRequest === true ||
    aggregateStale === true ||
    exports.length > 0;
  const reason = moduleGuideChanged
    ? 'module-guide-changed'
    : explicitAggregateRequest
      ? 'explicit-aggregate-request'
      : aggregateStale
        ? 'approved-stale-aggregate'
        : exports.length > 0
          ? 'export-request'
        : 'not-applicable';
  const branchReadyStale = Boolean(
    branchReadyAssociatedHeadOrDiff &&
      currentHeadOrDiff &&
      branchReadyAssociatedHeadOrDiff !== currentHeadOrDiff,
  );
  return {
    moduleGuideChanged,
    rebuildAggregate,
    rebuildCount: rebuildAggregate ? 1 : 0,
    reason,
    exports,
    branchReadyStale,
    requiresBranchReadyRerun: branchReadyStale,
  };
}

export function classifyDocumentationPath(value) {
  const normalized = normalizeRepositoryPath(value);
  if (!normalized.ok || !isInsideDocumentationRoot(normalized.path)) {
    return { ok: false, code: normalized.ok ? 'OUTSIDE_DOCUMENTATION_ROOT' : normalized.code };
  }
  if (DOCUMENTATION_SINGLETONS.includes(normalized.path)) {
    return { ok: true, kind: 'singleton', path: normalized.path };
  }
  if (normalized.path.startsWith(`${DOCUMENTATION_ROOT}/_shared/`)) {
    const sharedParts = normalized.path.split('/');
    if (
      sharedParts.length < 5 ||
      !['images', 'diagrams', 'schemas', 'attachments', 'assets'].includes(
        sharedParts[3],
      )
    ) {
      return {
        ok: false,
        code: 'INVALID_SHARED_ASSET_PATH',
        path: normalized.path,
      };
    }
    return { ok: true, kind: 'shared-asset', path: normalized.path };
  }
  const canonical = parseCanonicalEntryPath(normalized.path);
  if (canonical) {
    return {
      ...canonical,
      ok: true,
      kind: 'canonical-entry',
      path: normalized.path,
    };
  }
  const legacy = parseLegacyEntryPath(normalized.path);
  if (legacy) {
    return {
      ...legacy,
      ok: true,
      kind: 'legacy-entry',
      path: normalized.path,
    };
  }
  const parts = normalized.path.split('/');
  if (parts.length >= 6) {
    const category = parts[2];
    const key = parts[3];
    const contract = DOCUMENTATION_CATEGORY_REGISTRY[category];
    if (
      contract?.assetDirectories.includes(parts[4]) &&
      validateDocumentKey(category, key).ok
    ) {
      return {
        ok: true,
        kind: 'unit-asset',
        path: normalized.path,
        category,
        key,
        assetDirectory: parts[4],
      };
    }
  }
  return { ok: false, code: 'UNRECOGNIZED_DOCUMENTATION_PATH', path: normalized.path };
}

function categoryContract(category, { allowInactive = false } = {}) {
  const contract = DOCUMENTATION_CATEGORY_REGISTRY[category];
  if (!contract) throw new Error(`Unknown documentation category: ${category}`);
  if (!contract.active && !allowInactive) {
    throw new Error(`Documentation category is not active: ${category}`);
  }
  return contract;
}

function normalizeMigrationDocumentSelectors(selectors) {
  const documentIds = new Set();
  const errors = [];
  if (!Array.isArray(selectors)) {
    return {
      documentIds,
      errors: [{ code: 'INVALID_MIGRATION_DOCUMENT_SCOPE' }],
    };
  }
  for (const selector of selectors) {
    if (typeof selector !== 'string' || selector.length === 0) {
      errors.push({
        code: 'INVALID_MIGRATION_DOCUMENT_SELECTOR',
        selector,
      });
      continue;
    }
    const pathSelector = normalizeRepositoryPath(selector);
    const entry = pathSelector.ok
      ? parseCanonicalEntryPath(pathSelector.path) ??
        parseLegacyEntryPath(pathSelector.path)
      : null;
    if (entry && DOCUMENTATION_CATEGORY_REGISTRY[entry.category]?.active) {
      documentIds.add(documentIdentity(entry.category, entry.key));
      continue;
    }
    const identityMatch = selector.match(/^([^:]+):(.+)$/);
    if (!identityMatch) {
      errors.push({
        code: 'INVALID_MIGRATION_DOCUMENT_SELECTOR',
        selector,
      });
      continue;
    }
    const [, category, key] = identityMatch;
    const contract = DOCUMENTATION_CATEGORY_REGISTRY[category];
    const validation = contract
      ? validateDocumentKey(category, key)
      : { ok: false };
    if (!contract?.active || !validation.ok) {
      errors.push({
        code: 'INVALID_MIGRATION_DOCUMENT_SELECTOR',
        selector,
      });
      continue;
    }
    documentIds.add(documentIdentity(category, key));
  }
  return { documentIds, errors };
}

function documentIdentity(category, key) {
  return `${category}:${key}`;
}

function requireValidKey(category, key, existingKeys = []) {
  const validation = validateDocumentKey(category, key, { existingKeys });
  if (!validation.ok) {
    const error = new Error(validation.message);
    error.code = validation.code;
    throw error;
  }
}

function validateAssetDirectory(contract, assetDirectory) {
  if (!contract.assetDirectories.includes(assetDirectory)) {
    throw new Error(`Unsupported asset directory: ${assetDirectory}`);
  }
}

function validateRelativeAssetName(filename) {
  if (typeof filename !== 'string' || filename !== filename.trim() || !filename) {
    throw new Error('Asset filename is empty or contains trailing space.');
  }
  const normalized = normalizeRepositoryPath(filename);
  if (!normalized.ok || normalized.path.includes('/')) {
    throw new Error('Asset filename must be one cross-platform safe relative filename.');
  }
  const stem = filename.split('.', 1)[0];
  if (
    /[<>:"|?*\u0000-\u001F]/.test(filename) ||
    ['.', '..', '...'].includes(stem) ||
    WINDOWS_RESERVED_NAMES.test(stem)
  ) {
    throw new Error('Asset filename is not cross-platform safe.');
  }
  if (filename.endsWith('.') || filename.endsWith(' ')) {
    throw new Error('Asset filename must not end with dot or space.');
  }
  return normalized.path;
}

function parseCanonicalEntryPath(value) {
  for (const [category, contract] of Object.entries(DOCUMENTATION_CATEGORY_REGISTRY)) {
    const pattern = new RegExp(
      `^${escapeRegExp(DOCUMENTATION_ROOT)}/${escapeRegExp(category)}/([^/]+)/\\1${escapeRegExp(contract.extension)}$`,
    );
    const match = value.match(pattern);
    if (match && validateDocumentKey(category, match[1]).ok) {
      return { category, key: match[1], kind: 'canonical' };
    }
  }
  return null;
}

function parseLegacyEntryPath(value) {
  for (const [category, contract] of Object.entries(DOCUMENTATION_CATEGORY_REGISTRY)) {
    const pattern = new RegExp(
      `^${escapeRegExp(DOCUMENTATION_ROOT)}/${escapeRegExp(category)}/([^/]+)${escapeRegExp(contract.extension)}$`,
    );
    const match = value.match(pattern);
    if (match && validateDocumentKey(category, match[1]).ok) {
      return { category, key: match[1], kind: 'legacy' };
    }
  }
  return null;
}

function collectDocumentInventory(files) {
  const result = [];
  for (const [category, contract] of Object.entries(DOCUMENTATION_CATEGORY_REGISTRY)) {
    if (!contract.active) continue;
    const discovery = discoverDocumentationEntries(files, { category });
    for (const entry of [...discovery.canonical, ...discovery.legacy]) {
      result.push({ ...entry, category });
    }
  }
  return result;
}

function inferAssetOwners({
  assetPath,
  filename,
  category,
  documents,
  uiCaptureContexts,
  artifactContexts,
}) {
  const owners = new Set();
  const assetDirectory = assetPath.split('/').at(-2);
  const relativeReference = `${assetDirectory}/${filename}`;
  for (const document of documents) {
    if (
      isText(document.content) &&
      extractStructuralLinkTargets(textValue(document.content)).some((target) => {
        const normalizedTarget = normalizeMarkdownTargetPath(target);
        if (normalizedTarget === relativeReference) return true;
        if (
          EXTERNAL_LINK_PATTERN.test(normalizedTarget) ||
          path.posix.isAbsolute(normalizedTarget) ||
          /^[A-Za-z]:/.test(normalizedTarget)
        ) {
          return false;
        }
        const pathOnly = normalizedTarget.split(/[?#]/, 1)[0];
        const resolved = path.posix.normalize(
          path.posix.join(path.posix.dirname(document.path), pathOnly),
        );
        return resolved === assetPath;
      })
    ) {
      owners.add(document.key);
    }
  }

  if (owners.size === 0) {
    const prefixMatches = [...new Set(
      documents
        .map((document) => document.key)
        .filter((key) => lower(filename).startsWith(`${lower(key)}-`)),
    )];
    if (prefixMatches.length === 1) owners.add(prefixMatches[0]);
  }

  for (const context of [...uiCaptureContexts, ...artifactContexts]) {
    for (const candidate of extractRelatedEntriesForAsset(context, assetPath)) {
      const entry =
        parseCanonicalEntryPath(candidate) ?? parseLegacyEntryPath(candidate);
      if (entry?.category === category) owners.add(entry.key);
    }
  }
  return [...owners].sort((left, right) => compareCodePoints(lower(left), lower(right)));
}

function buildDocumentRelativeMappings({
  document,
  sourcePath,
  destinationPath,
  mappings,
  documentInventory,
  uiCaptureContexts,
  artifactContexts,
}) {
  const relativeMappings = new Map();
  for (const [source, destination] of mappings) {
    if (!isLegacyAssetPathForCategory(source, document.category)) continue;
    const owners = inferAssetOwners({
      assetPath: source,
      filename: path.posix.basename(source),
      category: document.category,
      documents: documentInventory.filter(
        (entry) => entry.category === document.category,
      ),
      uiCaptureContexts,
      artifactContexts,
    });
    if (!owners.map(lower).includes(lower(document.key))) continue;
    const oldRelative = path.posix.relative(path.posix.dirname(sourcePath), source);
    const newRelative = path.posix.relative(
      path.posix.dirname(destinationPath),
      destination,
    );
    relativeMappings.set(oldRelative, newRelative);
  }
  return relativeMappings;
}

function buildFileRelativeMappings(filePath, mappings) {
  const result = new Map(mappings);
  const directory = path.posix.dirname(filePath);
  for (const [source, destination] of mappings) {
    const sourceRelative = path.posix.relative(directory, source);
    const destinationRelative = path.posix.relative(directory, destination);
    if (!sourceRelative || !destinationRelative) continue;
    result.set(sourceRelative, destinationRelative);
    result.set(`./${sourceRelative}`, `./${destinationRelative}`);
  }
  return result;
}

function extractRelatedEntriesForAsset(value, assetPath, result = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      extractRelatedEntriesForAsset(item, assetPath, result);
    }
    return result;
  }
  if (!value || typeof value !== 'object') return result;

  const assetCandidates = [
    value.path,
    value.file,
    value.image_path,
    value.image?.file,
  ]
    .map((candidate) => normalizeRepositoryPath(candidate))
    .filter((candidate) => candidate.ok)
    .map((candidate) => candidate.path);
  if (assetCandidates.includes(assetPath)) {
    for (const candidate of [
      value.guide_path,
      value.guidePath,
      value.related_entry_path,
      value.relatedEntryPath,
    ]) {
      const normalized = normalizeRepositoryPath(candidate);
      if (
        normalized.ok &&
        isInsideDocumentationRoot(normalized.path)
      ) {
        result.push(normalized.path);
      }
    }
  }
  for (const item of Object.values(value)) {
    if (item && typeof item === 'object') {
      extractRelatedEntriesForAsset(item, assetPath, result);
    }
  }
  return result;
}

function isLegacyAssetPathForCategory(value, category) {
  const contract = DOCUMENTATION_CATEGORY_REGISTRY[category];
  return contract.assetDirectories.some((directory) =>
    value.startsWith(`${DOCUMENTATION_ROOT}/${category}/${directory}/`));
}

function stripOwnedFilenamePrefix(filename, owner) {
  const prefix = `${owner}-`;
  if (lower(filename).startsWith(lower(prefix))) return filename.slice(prefix.length);
  return filename;
}

function registerDestination({
  source,
  destination,
  destinationRegistry,
  sourceFiles,
  conflicts,
  content,
}) {
  const folded = lower(destination);
  const prior = destinationRegistry.get(folded);
  if (prior && prior.source !== source) {
    conflicts.push({
      code: 'CASE_INSENSITIVE_DESTINATION_COLLISION',
      destination,
      sources: [prior.source, source].sort(),
    });
    return;
  }
  const existingCasePath = [...sourceFiles.keys()].find(
    (candidate) => lower(candidate) === folded && candidate !== source,
  );
  if (existingCasePath && existingCasePath !== destination) {
    conflicts.push({
      code: 'CASE_INSENSITIVE_DESTINATION_COLLISION',
      destination,
      existingPath: existingCasePath,
      source,
    });
    return;
  }
  if (
    existingCasePath === destination &&
    contentHash(sourceFiles.get(existingCasePath)) !== contentHash(content)
  ) {
    conflicts.push({
      code: 'DESTINATION_EXISTS',
      destination,
      existingPath: existingCasePath,
      source,
    });
    return;
  }
  destinationRegistry.set(folded, { source, destination });
}

const AUTHORITATIVE_PATH_FIELD =
  '(?:guide_path|guidePath|file|path|source_spec|source_plan|related_entry_path|entry_path|artifact_path|image_path)';

function advanceFenceState(line, currentFence) {
  if (!currentFence) {
    const opening = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (!opening) return { fence: null, delimiter: false };
    return {
      fence: {
        character: opening[1][0],
        length: opening[1].length,
      },
      delimiter: true,
    };
  }
  const closing = new RegExp(
    `^\\s{0,3}${escapeRegExp(currentFence.character)}{${currentFence.length},}\\s*$`,
  );
  if (closing.test(line)) {
    return { fence: null, delimiter: true };
  }
  return { fence: currentFence, delimiter: false };
}

function transformOutsideInlineCode(line, transform) {
  let output = '';
  let cursor = 0;
  const openerPattern = /`+/g;
  while (cursor < line.length) {
    openerPattern.lastIndex = cursor;
    const opener = openerPattern.exec(line);
    if (!opener) {
      output += transform(line.slice(cursor));
      break;
    }
    const delimiterLength = opener[0].length;
    const closingPattern = /`+/g;
    closingPattern.lastIndex = opener.index + delimiterLength;
    let closing = closingPattern.exec(line);
    while (closing && closing[0].length !== delimiterLength) {
      closing = closingPattern.exec(line);
    }
    if (!closing) {
      output += transform(line.slice(cursor));
      break;
    }
    output += transform(line.slice(cursor, opener.index));
    const closingEnd = closing.index + delimiterLength;
    output += line.slice(opener.index, closingEnd);
    cursor = closingEnd;
  }
  return output;
}

function rewriteAuthoritativeRepositoryReferences(content, mappings) {
  if (mappings.size === 0) return content;
  const normalizedMappings = new Map(
    [...mappings].map(([source, destination]) => [
      source.replaceAll('\\', '/'),
      destination.replaceAll('\\', '/'),
    ]),
  );
  const rewriteExactValue = (value) => {
    const normalized = value.replaceAll('\\', '/');
    return normalizedMappings.get(normalized) ?? value;
  };
  const yamlField = new RegExp(
    `^(\\s*(?:-\\s+)?${AUTHORITATIVE_PATH_FIELD}\\s*:\\s*)(.*?)(\\s*)$`,
  );
  const yamlBlockField = new RegExp(
    `^(\\s*(?:-\\s+)?${AUTHORITATIVE_PATH_FIELD}\\s*:\\s*)([>|](?:[+-][1-9]?|[1-9][+-]?)?)(\\s*(?:#.*)?)$`,
  );
  const jsonField = new RegExp(
    `("(?:guide_path|guidePath|file|path|source_spec|source_plan|related_entry_path|entry_path|artifact_path|image_path)"\\s*:\\s*")([^"]*)(")`,
    'g',
  );
  const lines = normalizeText(content).split('\n');
  let fence = null;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fenceState = advanceFenceState(line, fence);
    fence = fenceState.fence;
    if (fenceState.delimiter || fence) continue;

    const blockMatch = line.match(yamlBlockField);
    if (blockMatch) {
      rewriteYamlBlockScalar(lines, index, rewriteExactValue);
      continue;
    }
    lines[index] = transformOutsideInlineCode(line, (piece) => {
      const yamlMatch = piece.match(yamlField);
      if (yamlMatch) {
        const rendered = rewriteYamlScalar(
          yamlMatch[2],
          rewriteExactValue,
        );
        if (rendered !== null) {
          return `${yamlMatch[1]}${rendered}${yamlMatch[3]}`;
        }
      }
      return piece.replace(jsonField, (match, prefix, value, suffix) => {
        let decoded;
        try {
          decoded = JSON.parse(`"${value}"`);
        } catch {
          return match;
        }
        const rewritten = rewriteExactValue(decoded);
        if (rewritten === decoded) return match;
        const encoded = JSON.stringify(rewritten).slice(1, -1);
        return `${prefix}${encoded}${suffix}`;
      });
    });
  }
  const rewrittenFields = lines.join('\n');
  return rewriteMarkdownAndHtmlLinks(rewrittenFields, normalizedMappings);
}

function rewriteYamlScalar(scalar, rewriteExactValue) {
  const doubleQuoted = scalar.match(/^"((?:\\.|[^"\\])*)"(\s+#.*)?$/);
  if (doubleQuoted) {
    let decoded;
    try {
      decoded = JSON.parse(`"${doubleQuoted[1]}"`);
    } catch {
      return null;
    }
    const rewritten = rewriteExactValue(decoded);
    return rewritten === decoded
      ? null
      : `${JSON.stringify(rewritten)}${doubleQuoted[2] ?? ''}`;
  }

  const singleQuoted = scalar.match(/^'((?:''|[^'])*)'(\s+#.*)?$/);
  if (singleQuoted) {
    const decoded = singleQuoted[1].replaceAll("''", "'");
    const rewritten = rewriteExactValue(decoded);
    return rewritten === decoded
      ? null
      : `'${rewritten.replaceAll("'", "''")}'${singleQuoted[2] ?? ''}`;
  }

  const comment = scalar.match(/^(\S(?:.*?\S)?)(\s+#.*)$/);
  const value = comment?.[1] ?? scalar;
  const rewritten = rewriteExactValue(value);
  return rewritten === value ? null : `${rewritten}${comment?.[2] ?? ''}`;
}

function rewriteYamlBlockScalar(lines, headerIndex, rewriteExactValue) {
  const headerIndent = lines[headerIndex].match(/^\s*/)[0].length;
  const contentIndexes = [];
  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    const indent = line.match(/^\s*/)[0].length;
    if (indent <= headerIndent) break;
    contentIndexes.push(index);
  }
  if (contentIndexes.length !== 1) return;
  const contentIndex = contentIndexes[0];
  const match = lines[contentIndex].match(/^(\s+)(.*?)(\s*)$/);
  if (!match) return;
  const rewritten = rewriteExactValue(match[2]);
  if (rewritten === match[2]) return;
  lines[contentIndex] = `${match[1]}${rewritten}${match[3]}`;
}

function rewriteMarkdownAndHtmlLinks(content, mappings) {
  if (mappings.size === 0) return content;
  const normalizedMappings = new Map(
    [...mappings].map(([source, destination]) => [
      source.replaceAll('\\', '/'),
      destination.replaceAll('\\', '/'),
    ]),
  );
  const rewriteMappedTarget = (target) => {
    const normalized = normalizeMarkdownTargetPath(target);
    const suffixIndex = normalized.search(/[?#]/);
    const pathOnly =
      suffixIndex === -1 ? normalized : normalized.slice(0, suffixIndex);
    const suffix = suffixIndex === -1 ? '' : normalized.slice(suffixIndex);
    const destination = normalizedMappings.get(pathOnly);
    return destination === undefined ? target : `${destination}${suffix}`;
  };
  const lines = normalizeText(content).split('\n');
  let fence = null;
  return lines
    .map((line) => {
      const fenceState = advanceFenceState(line, fence);
      fence = fenceState.fence;
      if (fenceState.delimiter) {
        return line;
      }
      if (fence) return line;
      return transformOutsideInlineCode(
        line,
        (piece) => rewriteLinkSyntax(piece, rewriteMappedTarget),
      );
    })
    .join('\n');
}

function validateProjectedMigration(sourceFiles, operations) {
  const projected = cloneFileMap(sourceFiles);
  const affectedEntries = new Set();
  const errors = [];

  for (const operation of operations) {
    if (operation.type === 'rewrite') {
      projected.set(operation.path, cloneContent(operation.content));
      if (isInsideDocumentationRoot(operation.path)) {
        affectedEntries.add(operation.path);
      }
      continue;
    }
    if (operation.type === 'delete-equivalent-legacy') {
      projected.delete(operation.source);
      affectedEntries.add(operation.destination);
      continue;
    }
    if (operation.type === 'move') {
      projected.set(operation.destination, cloneContent(operation.content));
      projected.delete(operation.source);
      if (parseCanonicalEntryPath(operation.destination)) {
        affectedEntries.add(operation.destination);
      }
    }
  }

  for (const operation of operations) {
    if (operation.type !== 'move') continue;
    const destination = projected.get(operation.destination);
    if (
      destination === undefined ||
      contentHash(destination) !== operation.destinationHash
    ) {
      errors.push({
        code: 'MIGRATION_DESTINATION_HASH_MISMATCH',
        source: operation.source,
        destination: operation.destination,
      });
    }
    if (
      operation.binary &&
      operation.sourceHash !== operation.destinationHash
    ) {
      errors.push({
        code: 'MIGRATION_BINARY_HASH_MISMATCH',
        source: operation.source,
        destination: operation.destination,
      });
    }
  }

  const existingPaths = new Set(projected.keys());
  for (const entryPath of [...affectedEntries].sort()) {
    const content = projected.get(entryPath);
    if (!isText(content)) continue;
    for (const target of extractStructuralLinkTargets(content)) {
      const validation = validateMigratedEntryTarget(
        target,
        entryPath,
        existingPaths,
      );
      if (!validation.ok) {
        errors.push({
          code: validation.code,
          source: entryPath,
          target,
        });
      }
    }
  }
  return {
    checked: true,
    errors: uniqueObjects(errors),
    destinationSnapshotDigest: fileMapDigest(projected),
  };
}

function extractStructuralLinkTargets(content) {
  const result = [];
  const lines = normalizeText(content).split('\n');
  let fence = null;
  for (const line of lines) {
    const fenceState = advanceFenceState(line, fence);
    fence = fenceState.fence;
    if (fenceState.delimiter) continue;
    if (fence) continue;
    transformOutsideInlineCode(line, (piece) => {
      rewriteLinkSyntax(piece, (target) => {
        result.push(target);
        return target;
      });
      return piece;
    });
  }
  return result;
}

function validateMigratedEntryTarget(target, entryPath, existingPaths) {
  const normalized = normalizeMarkdownTargetPath(target);
  if (
    EXTERNAL_LINK_PATTERN.test(normalized) ||
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:/.test(normalized)
  ) {
    return { ok: true };
  }
  const pathOnly = normalized.split(/[?#]/, 1)[0];
  if (!pathOnly) return { ok: true };
  const isUnitAsset =
    /^(?:images|diagrams|examples|schemas|attachments|assets)\//.test(pathOnly);
  const isSharedAsset = /^(?:\.\.\/)+_shared\//.test(pathOnly);
  const isDocumentationPath =
    pathOnly === DOCUMENTATION_ROOT ||
    pathOnly.startsWith(`${DOCUMENTATION_ROOT}/`);
  const candidate = isDocumentationPath
    ? path.posix.normalize(pathOnly)
    : path.posix.normalize(path.posix.join(path.posix.dirname(entryPath), pathOnly));
  const resolvesInsideDocumentationRoot = isInsideDocumentationRoot(candidate);
  if (
    !isUnitAsset &&
    !isSharedAsset &&
    !isDocumentationPath &&
    !resolvesInsideDocumentationRoot
  ) {
    return { ok: true };
  }
  if (!isInsideDocumentationRoot(candidate)) {
    return { ok: false, code: 'MIGRATED_LINK_OUTSIDE_DOCUMENTATION_ROOT' };
  }
  return existingPaths.has(candidate)
    ? { ok: true }
    : { ok: false, code: 'BROKEN_MIGRATED_LINK' };
}

function rewriteLinkSyntax(value, rewriteTarget) {
  const markdown = transformMarkdownInlineLinks(
    value,
    ({ target }) => rewriteTarget(target),
  );
  const html = markdown.replace(
    /(\b(?:src|href)\s*=\s*["'])([^"']+)(["'])/gi,
    (_match, prefix, target, suffix) => `${prefix}${rewriteTarget(target)}${suffix}`,
  );
  const unquotedHtml = html.replace(
    /(\b(?:src|href)\s*=\s*)(?!["'])([^\s"'=<>`]+)/gi,
    (_match, prefix, target) => `${prefix}${rewriteTarget(target)}`,
  );
  return unquotedHtml.replace(
    /^(\s{0,3}\[[^\]]+\]:[ \t]*)(<[^>\r\n]+>|[^ \t]+)(.*)$/gm,
    (_match, prefix, target, suffix) =>
      `${prefix}${rewriteMarkdownTargetToken(target, rewriteTarget)}${suffix}`,
  );
}

function transformMarkdownInlineLinks(value, transformTarget) {
  let output = '';
  let outputCursor = 0;
  let searchCursor = 0;
  while (searchCursor < value.length) {
    const labelStart = value.indexOf('[', searchCursor);
    if (labelStart === -1) break;
    if (isEscapedCharacter(value, labelStart)) {
      searchCursor = labelStart + 1;
      continue;
    }
    const labelEnd = findClosingDelimiter(value, labelStart, '[', ']');
    if (labelEnd === -1 || value[labelEnd + 1] !== '(') {
      searchCursor = labelStart + 1;
      continue;
    }
    const destinationClose = findClosingDelimiter(
      value,
      labelEnd + 1,
      '(',
      ')',
    );
    if (destinationClose === -1) {
      searchCursor = labelEnd + 1;
      continue;
    }
    const destination = parseMarkdownDestination(
      value,
      labelEnd + 2,
      destinationClose,
    );
    if (!destination) {
      searchCursor = destinationClose + 1;
      continue;
    }
    const isImage =
      labelStart > 0 &&
      value[labelStart - 1] === '!' &&
      !isEscapedCharacter(value, labelStart - 1);
    const target = value.slice(destination.start, destination.end);
    output += value.slice(outputCursor, destination.start);
    output += transformTarget({ target, isImage });
    outputCursor = destination.end;
    searchCursor = destinationClose + 1;
  }
  return `${output}${value.slice(outputCursor)}`;
}

function findClosingDelimiter(value, openingIndex, opening, closing) {
  let depth = 1;
  for (let index = openingIndex + 1; index < value.length; index += 1) {
    if (isEscapedCharacter(value, index)) continue;
    if (value[index] === opening) depth += 1;
    if (value[index] !== closing) continue;
    depth -= 1;
    if (depth === 0) return index;
  }
  return -1;
}

function parseMarkdownDestination(value, start, end) {
  let cursor = start;
  while (cursor < end && /[ \t]/.test(value[cursor])) cursor += 1;
  if (cursor >= end) return null;
  if (value[cursor] === '<') {
    for (let index = cursor + 1; index < end; index += 1) {
      if (value[index] === '>' && !isEscapedCharacter(value, index)) {
        return { start: cursor + 1, end: index };
      }
    }
    return null;
  }
  const targetStart = cursor;
  let nested = 0;
  while (cursor < end) {
    if (isEscapedCharacter(value, cursor)) {
      cursor += 1;
      continue;
    }
    const character = value[cursor];
    if (character === '(') nested += 1;
    if (character === ')' && nested > 0) nested -= 1;
    if (/[ \t]/.test(character) && nested === 0) break;
    cursor += 1;
  }
  return cursor === targetStart
    ? null
    : { start: targetStart, end: cursor };
}

function isEscapedCharacter(value, index) {
  let backslashes = 0;
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === '\\'; cursor -= 1) {
    backslashes += 1;
  }
  return backslashes % 2 === 1;
}

function rewriteMarkdownTargetToken(token, rewriteTarget) {
  if (token.startsWith('<') && token.endsWith('>')) {
    return `<${rewriteTarget(token.slice(1, -1))}>`;
  }
  return rewriteTarget(token);
}

function rewriteAggregateTarget(target, entry) {
  const normalized = normalizeMarkdownTargetPath(target);
  if (
    EXTERNAL_LINK_PATTERN.test(normalized) ||
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:/.test(normalized)
  ) {
    return { changed: false, target };
  }
  const assetPrefix = /^(images|diagrams|examples|schemas|attachments|assets)\//;
  if (assetPrefix.test(normalized)) {
    return {
      changed: true,
      target:
        entry.kind === 'canonical'
          ? `user-guides/${entry.key}/${normalized}`
          : `user-guides/${normalized}`,
    };
  }
  if (/^(?:\.\.\/){1,2}_shared\//.test(normalized)) {
    return {
      changed: true,
      target: normalized.replace(/^(?:\.\.\/){1,2}/, ''),
    };
  }
  return { changed: false, target };
}

function validateAggregateLocalTarget(target, existingPaths) {
  const normalized = normalizeMarkdownTargetPath(target);
  if (
    EXTERNAL_LINK_PATTERN.test(normalized) ||
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:/.test(normalized)
  ) {
    return { local: false, ok: true };
  }

  const pathOnly = normalized.split(/[?#]/, 1)[0];
  if (!pathOnly) return { local: false, ok: true };
  const candidate = pathOnly.startsWith(`${DOCUMENTATION_ROOT}/`)
    ? pathOnly
    : `${DOCUMENTATION_ROOT}/${pathOnly}`;
  const resolved = normalizeRepositoryPath(candidate);
  if (!resolved.ok) {
    return { local: true, ok: false, code: resolved.code };
  }
  if (
    resolved.path !== DOCUMENTATION_ROOT &&
    !resolved.path.startsWith(`${DOCUMENTATION_ROOT}/`)
  ) {
    return {
      local: true,
      ok: false,
      code: 'OUTSIDE_DOCUMENTATION_ROOT',
    };
  }
  return {
    local: true,
    ok: existingPaths.has(resolved.path),
    code: existingPaths.has(resolved.path) ? undefined : 'BROKEN_LOCAL_LINK',
  };
}

function isAggregateImageTarget(target) {
  const normalized = normalizeMarkdownTargetPath(target).split(/[?#]/, 1)[0];
  return (
    /^user-guides\/[^/]+\/images\/.+/.test(normalized) ||
    /^user-guides\/images\/.+/.test(normalized) ||
    /^_shared\/images\/.+/.test(normalized)
  );
}

function parseDocumentationFrontmatter(content) {
  const normalized = normalizeText(content).replace(/^\uFEFF/, '');
  if (!normalized.startsWith('---\n')) {
    return { exists: false, malformed: false, metadata: {}, body: normalized };
  }
  const end = normalized.indexOf('\n---\n', 4);
  if (end < 0) {
    return { exists: true, malformed: true, metadata: {}, body: normalized };
  }
  const block = normalized.slice(4, end);
  const metadata = {};
  for (const line of block.split('\n')) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*?)\s*$/);
    if (!match) continue;
    metadata[match[1]] = parseFrontmatterValue(match[2]);
  }
  return {
    exists: true,
    malformed: false,
    metadata,
    body: normalized.slice(end + 5),
  };
}

function parseFrontmatterValue(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    const result = {};
    for (const part of trimmed.slice(1, -1).split(',')) {
      const match = part.trim().match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(\d+)$/);
      if (match) result[match[1]] = Number(match[2]);
    }
    return result;
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1).split(',').map((item) => item.trim()).filter(Boolean);
  }
  return trimmed.replace(/^(['"])([\s\S]*)\1$/, '$2');
}

function parseCoverage(value) {
  const coverage = value && typeof value === 'object' ? value : {};
  return {
    total: nonNegativeInteger(coverage.total),
    met: nonNegativeInteger(coverage.met),
    partial: nonNegativeInteger(coverage.partial),
    missing: nonNegativeInteger(coverage.missing),
  };
}

function shiftGuideBodyHeadings(body) {
  const lines = normalizeText(body).split('\n');
  let firstHeading = -1;
  let headingFence = null;
  for (let index = 0; index < lines.length; index += 1) {
    const fenceState = advanceFenceState(lines[index], headingFence);
    headingFence = fenceState.fence;
    if (fenceState.delimiter) continue;
    if (!headingFence && /^#\s+/.test(lines[index])) {
      firstHeading = index;
      break;
    }
  }
  if (firstHeading >= 0) lines.splice(firstHeading, 1);
  let fence = null;
  return lines
    .map((line) => {
      const fenceState = advanceFenceState(line, fence);
      fence = fenceState.fence;
      if (fenceState.delimiter) return line;
      if (fence) return line;
      return line.replace(/^(#{2,5})(\s+)/, '#$1$2');
    })
    .join('\n')
    .trim();
}

function renderAggregate({
  projectTitle,
  generatedAt,
  gitHead,
  changeRef,
  sourceSpec,
  sourcePlan,
  modules,
  coverage,
  provenance = [],
  generatedProjection = false,
  editableSource = true,
}) {
  const moduleKeys = modules.map((module) => yamlScalar(module.key)).join(', ');
  const displayProjectTitle = singleLineText(projectTitle);
  const toc = modules
    .map((module, index) => `${index + 1}. [${module.title}](#${slugAnchor(module.title)})`)
    .join('\n');
  const sections = modules
    .map((module) => `## ${module.title}\n\n${module.body}`.trim())
    .join('\n\n');
  const rows = modules
    .map(
      (module) =>
        `| ${module.title} | ${module.coverage.met} | ${module.coverage.partial} | ${module.coverage.missing} |`,
    )
    .join('\n');
  const totalRow = `| **Total** | **${coverage.met}** | **${coverage.partial}** | **${coverage.missing}** |`;
  const provenanceYaml =
    provenance.length === 0
      ? 'source_provenance: []'
      : `source_provenance:\n${provenance
          .map(
            (source) =>
              `  - module_id: ${yamlScalar(source.module_id)}\n` +
              `    repository_id: ${yamlScalar(source.repository_id)}\n` +
              `    source_revision: ${yamlScalar(source.source_revision)}\n` +
              `    source_mode: ${yamlScalar(source.source_mode)}\n` +
              `    source_path: ${yamlScalar(source.source_path)}\n` +
              `    export_version: ${yamlScalar(source.export_version)}\n` +
              `    source_url: ${yamlScalar(source.source_url)}`,
          )
          .join('\n')}`;
  return `---
artifact_id: guide-aggregate
artifact_kind: documentation-asset
change_ref: ${yamlScalar(changeRef)}
source_spec: ${yamlScalar(sourceSpec)}
source_plan: ${yamlScalar(sourcePlan)}
commit_policy: with-change
owner: sdcorejs-documentation
title: ${yamlScalar(`${projectTitle} - User Guide`)}
generated_at: ${yamlScalar(generatedAt)}
git_head: ${yamlScalar(gitHead)}
modules: [${moduleKeys}]
coverage: { total: ${coverage.total}, met: ${coverage.met}, partial: ${coverage.partial}, missing: ${coverage.missing} }
generated_projection: ${generatedProjection}
editable_source: ${editableSource}
${provenanceYaml}
---

# ${displayProjectTitle} - User Guide

## Table Of Contents

${toc || '_No module guides were discovered._'}

## System Overview

This aggregate contains the canonical module user guides selected by Documentation Layout v2.

${sections}

## Coverage Vs Requirements Summary

| Module | Met | Partial | Missing |
|---|---:|---:|---:|
${rows}
${totalRow}
`;
}

function buildAggregateExportEvidence(aggregateMarkdown) {
  if (typeof aggregateMarkdown !== 'string') {
    return { ok: false, sha256: null, expectedImagePaths: [] };
  }
  const expectedImagePaths = [
    ...new Set(
      extractEmbeddedImageTargets(aggregateMarkdown)
        .map((target) => normalizeMarkdownTargetPath(target).split(/[?#]/, 1)[0])
        .filter(
          (target) =>
            !EXTERNAL_LINK_PATTERN.test(target) &&
            !path.posix.isAbsolute(target) &&
            /\.(?:png|jpe?g|gif|webp|svg)$/i.test(target),
        ),
    ),
  ].sort(compareCodePoints);
  return {
    ok: true,
    sha256: contentHash(aggregateMarkdown),
    expectedImagePaths,
  };
}

function extractEmbeddedImageTargets(content) {
  const targets = [];
  const referenceLabels = new Set();
  const definitions = new Map();
  const lines = normalizeText(content).split('\n');
  let fence = null;
  for (const line of lines) {
    const fenceState = advanceFenceState(line, fence);
    fence = fenceState.fence;
    if (fenceState.delimiter || fence) continue;
    transformOutsideInlineCode(line, (piece) => {
      transformMarkdownInlineLinks(
        piece,
        ({ target, isImage }) => {
          if (isImage) targets.push(target);
          return target;
        },
      );
      piece.replace(
        /!\[([^\]]*)\]\[([^\]]*)\]/g,
        (_match, alternative, label) => {
          referenceLabels.add(normalizeReferenceLabel(label || alternative));
          return _match;
        },
      );
      piece.replace(
        /!\[([^\]]+)\](?![\[(])/g,
        (_match, label) => {
          referenceLabels.add(normalizeReferenceLabel(label));
          return _match;
        },
      );
      const definition = piece.match(
        /^\s{0,3}\[([^\]]+)\]:[ \t]*(<[^>\r\n]+>|[^ \t]+)(?:[ \t]+.*)?$/,
      );
      if (definition) {
        definitions.set(
          normalizeReferenceLabel(definition[1]),
          markdownTargetValue(definition[2]),
        );
      }
      for (const imageTag of piece.matchAll(/<img\b[^>]*>/gi)) {
        const source = imageTag[0].match(
          /\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s"'=<>`]+))/i,
        );
        const target = source?.[1] ?? source?.[2] ?? source?.[3];
        if (target) targets.push(target);
      }
      return piece;
    });
  }
  for (const label of referenceLabels) {
    const target = definitions.get(label);
    if (target) targets.push(target);
  }
  return targets;
}

function markdownTargetValue(value) {
  return value.startsWith('<') && value.endsWith('>')
    ? value.slice(1, -1)
    : value;
}

function normalizeReferenceLabel(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeMarkdownTargetPath(value) {
  let unescaped = '';
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const next = value[index + 1];
    if (
      character === '\\' &&
      typeof next === 'string' &&
      isAsciiPunctuation(next)
    ) {
      unescaped += next;
      index += 1;
      continue;
    }
    unescaped += character;
  }
  return unescaped.replaceAll('\\', '/');
}

function isAsciiPunctuation(value) {
  const code = value.codePointAt(0);
  return (
    (code >= 0x21 && code <= 0x2f) ||
    (code >= 0x3a && code <= 0x40) ||
    (code >= 0x5b && code <= 0x60) ||
    (code >= 0x7b && code <= 0x7e)
  );
}

function summarizeOneExport({
  capability,
  unavailableReason,
  verification,
  aggregateEvidence,
}) {
  if (!capability) {
    return {
      capability: 'unavailable',
      result: 'skipped',
      verification: null,
      reason: unavailableReason,
    };
  }
  if (!verification) {
    return {
      capability: 'available',
      result: 'not-run',
      verification: null,
      reason: 'Export verification did not run.',
    };
  }
  const embeddedImagePaths = Array.isArray(verification.embeddedImagePaths)
    ? [
        ...new Set(
          verification.embeddedImagePaths
            .filter((item) => typeof item === 'string')
            .map((item) => item.replaceAll('\\', '/').split(/[?#]/, 1)[0]),
        ),
      ].sort(compareCodePoints)
    : [];
  const expectedImagePaths = aggregateEvidence.expectedImagePaths;
  const aggregateEvidenceBound =
    aggregateEvidence.ok &&
    verification.sourceAggregateSha256 === aggregateEvidence.sha256;
  const imageManifestEvidenceSupplied =
    aggregateEvidenceBound &&
    Array.isArray(verification.embeddedImagePaths) &&
    embeddedImagePaths.length === verification.embeddedImagePaths.length;
  const allExpectedImagesEmbedded =
    imageManifestEvidenceSupplied &&
    embeddedImagePaths.length === expectedImagePaths.length &&
    expectedImagePaths.every((expected) => embeddedImagePaths.includes(expected));
  const imageCountEvidenceSupplied =
    Number.isInteger(verification.embeddedImages) &&
    verification.embeddedImages >= 0 &&
    Number.isInteger(verification.expectedEmbeddedImages) &&
    verification.expectedEmbeddedImages >= 0 &&
    verification.expectedEmbeddedImages === expectedImagePaths.length &&
    verification.embeddedImages === embeddedImagePaths.length &&
    verification.embeddedImages === verification.expectedEmbeddedImages;
  const embeddedImagesPass =
    imageCountEvidenceSupplied &&
    allExpectedImagesEmbedded;
  const pass =
    verification.exitCode === 0 &&
    verification.outputExists === true &&
    Number(verification.outputBytes) > 0 &&
    verification.parseable === true &&
    embeddedImagesPass;
  return {
    capability: 'available',
    result: pass ? 'pass' : 'fail',
    verification: {
      exitCode: verification.exitCode,
      outputExists: verification.outputExists === true,
      outputBytes: Number(verification.outputBytes) || 0,
      parseable: verification.parseable === true,
      expectedEmbeddedImages: nonNegativeInteger(verification.expectedEmbeddedImages),
      embeddedImages: nonNegativeInteger(verification.embeddedImages),
      imageCountEvidenceSupplied,
      imageManifestEvidenceSupplied,
      aggregateEvidenceBound,
      expectedImagePaths,
      embeddedImagePaths,
    },
    reason: pass ? null : 'Output or embedded-image verification failed.',
  };
}

function equivalentDocumentationContent(left, right) {
  if (!isText(left) || !isText(right)) return contentHash(left) === contentHash(right);
  return normalizeSemanticText(left) === normalizeSemanticText(right);
}

function normalizeSemanticText(value) {
  return normalizeText(value)
    .replace(/^\uFEFF/, '')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .trim();
}

function normalizeText(value) {
  return String(value ?? '').replace(/\r\n?/g, '\n');
}

function textValue(value) {
  if (typeof value === 'string') return value;
  if (value instanceof Uint8Array) return Buffer.from(value).toString('utf8');
  return String(value ?? '');
}

function isText(value) {
  return typeof value === 'string';
}

function isBinary(value) {
  return value instanceof Uint8Array && typeof value !== 'string';
}

function isTextFile(filePath, content) {
  return isText(content) && TEXT_FILE_PATTERN.test(filePath);
}

function normalizedFileMap(files) {
  return normalizedFileInventory(files).files;
}

function normalizedFileInventory(files) {
  const result = new Map();
  const errors = [];
  const originalByNormalized = new Map();
  const normalizedByFold = new Map();
  for (const [filePath, content] of fileEntries(files)) {
    const normalized = normalizeRepositoryPath(filePath);
    if (!normalized.ok) {
      errors.push({
        code: normalized.code,
        path: String(filePath),
      });
      continue;
    }
    const originalPath = String(filePath);
    const priorOriginal = originalByNormalized.get(normalized.path);
    if (priorOriginal !== undefined) {
      if (
        priorOriginal !== originalPath ||
        contentHash(result.get(normalized.path)) !== contentHash(content)
      ) {
        errors.push({
          code: 'NORMALIZED_PATH_COLLISION',
          normalizedPath: normalized.path,
          paths: [priorOriginal, originalPath].sort(compareCodePoints),
        });
      }
      continue;
    }
    const folded = lower(normalized.path);
    const priorFolded = normalizedByFold.get(folded);
    if (priorFolded && priorFolded.normalizedPath !== normalized.path) {
      errors.push({
        code: 'CASE_INSENSITIVE_PATH_COLLISION',
        paths: [priorFolded.originalPath, originalPath].sort(compareCodePoints),
      });
      continue;
    }
    result.set(normalized.path, cloneContent(content));
    originalByNormalized.set(normalized.path, originalPath);
    normalizedByFold.set(folded, {
      normalizedPath: normalized.path,
      originalPath,
    });
  }
  return {
    files: result,
    errors: uniqueObjects(errors),
  };
}

function inventoryErrorsForExpectedPaths(errors, expectedPaths) {
  const expected = new Set(expectedPaths.map(lower));
  return errors.filter((error) => {
    const candidates = [
      error.normalizedPath,
      error.path,
      ...(error.paths ?? []),
    ];
    return candidates.some((candidate) => {
      const normalized = normalizeRepositoryPath(candidate);
      if (normalized.ok && expected.has(lower(normalized.path))) return true;
      const filesystemAlias = windowsFilesystemAlias(candidate);
      return filesystemAlias !== null && expected.has(lower(filesystemAlias));
    });
  });
}

function windowsFilesystemAlias(value) {
  if (typeof value !== 'string' || value.includes('\0')) return null;
  if (/^[A-Za-z]:/.test(value) || /^[\\/]/.test(value)) return null;
  const repositoryStyle = value
    .replaceAll('\\', '/')
    .replace(/^(?:\.\/)+/, '');
  const segments = repositoryStyle.split('/');
  if (segments.some((segment) => segment === '..')) return null;
  const compact = segments
    .filter((segment) => segment !== '' && segment !== '.')
    .map((segment) => segment.replace(/[ .]+$/g, ''))
    .filter(Boolean)
    .join('/');
  return compact || null;
}

function isDocumentationInventoryError(error) {
  return [
    error.normalizedPath,
    error.path,
    ...(error.paths ?? []),
  ].some((candidate) => {
    if (typeof candidate !== 'string') return false;
    const repositoryStyle = candidate.replaceAll('\\', '/').replace(/^(?:\.\/)+/, '');
    return (
      repositoryStyle === DOCUMENTATION_ROOT ||
      repositoryStyle.startsWith(`${DOCUMENTATION_ROOT}/`)
    );
  });
}

function fileEntries(files) {
  if (files instanceof Map) return [...files.entries()];
  if (Array.isArray(files)) {
    return files.map((item) =>
      Array.isArray(item) ? item : [item.path, item.content]);
  }
  if (files && typeof files === 'object') return Object.entries(files);
  return [];
}

function cloneFileMap(map) {
  return new Map([...map].map(([filePath, content]) => [filePath, cloneContent(content)]));
}

function cloneContent(value) {
  if (value instanceof Uint8Array) return Uint8Array.from(value);
  return value;
}

function contentHash(value) {
  const hash = createHash('sha256');
  hash.update(value instanceof Uint8Array ? value : Buffer.from(String(value ?? ''), 'utf8'));
  return hash.digest('hex');
}

function fileMapDigest(map) {
  const hash = createHash('sha256');
  for (const [filePath, content] of [...map].sort(([left], [right]) =>
    compareCodePoints(left, right))) {
    hash.update(filePath).update('\0');
    hash.update(content instanceof Uint8Array ? content : Buffer.from(String(content ?? '')));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function sortMigrationOperations(operations) {
  const order = {
    rewrite: 0,
    move: 1,
    'delete-equivalent-legacy': 2,
  };
  return [...operations].sort((left, right) => {
    const orderDelta = (order[left.type] ?? 9) - (order[right.type] ?? 9);
    if (orderDelta) return orderDelta;
    const leftPath = left.path ?? left.source ?? '';
    const rightPath = right.path ?? right.source ?? '';
    return compareCodePoints(leftPath, rightPath);
  });
}

function uniqueObjects(items) {
  const result = new Map();
  for (const item of items) result.set(stableStringify(item), item);
  return [...result.values()].sort((left, right) =>
    compareCodePoints(stableStringify(left), stableStringify(right)));
}

function stableStringify(value) {
  if (value instanceof Uint8Array) return JSON.stringify([...value]);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function comparePathPair(left, right) {
  return (
    compareCodePoints(left.source, right.source) ||
    compareCodePoints(left.destination, right.destination)
  );
}

function compareCodePoints(left, right) {
  const leftValue = String(left);
  const rightValue = String(right);
  return leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
}

function resolveFilesystemPath(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError('Filesystem root is required.');
  }
  if (/^[A-Za-z]:[\\/]/.test(value) || /^[\\/]{2}/.test(value)) {
    return path.win32.resolve(value);
  }
  return path.resolve(value);
}

function joinFilesystemPath(root, ...segments) {
  const implementation = /^[A-Za-z]:[\\/]/.test(root) || /^[\\/]{2}/.test(root)
    ? path.win32
    : path;
  return implementation.join(root, ...segments);
}

function quotePosix(value) {
  return `'${String(value).replaceAll("'", "'\"'\"'")}'`;
}

function quotePowerShell(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function pathFailure(code, message) {
  return { ok: false, code, message, path: null };
}

function keyFailure(code, message) {
  return { ok: false, code, message, key: null };
}

function isInsideDocumentationRoot(value) {
  return value === DOCUMENTATION_ROOT || value.startsWith(`${DOCUMENTATION_ROOT}/`);
}

function nonNegativeInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : 0;
}

function titleFromKey(key) {
  return key
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}`)
    .join(' ');
}

function slugAnchor(value) {
  return value
    .toLocaleLowerCase('en-US')
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function stringValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function yamlScalar(value) {
  return JSON.stringify(String(value ?? ''));
}

function singleLineText(value) {
  return String(value ?? '').replace(/\s*\r?\n\s*/g, ' ').trim();
}

function lower(value) {
  return String(value).toLocaleLowerCase('en-US');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
