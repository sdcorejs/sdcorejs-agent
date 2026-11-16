import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';

const DIRECTORY_FILES = ['AGENTS.md', 'AGENTS.override.md', 'CLAUDE.md', 'GEMINI.md', 'README.md', 'CONTRIBUTING.md'];
const ROOT_FILES = ['.claude/CLAUDE.md', '.github/copilot-instructions.md', '.cursorrules', '.clinerules'];
const RULE_DIRECTORIES = ['.github/instructions', '.cursor/rules', '.claude/rules'];
const MAX_CANDIDATES = 256;
const MAX_BYTES = 128 * 1024;
const MAX_ENTRIES = 1024;

/** Discover evidence, not effective policy. The host resolves content, path
 * selectors, conflicts and host-specific precedence before applying any rule.
 * No bodies or secret values are returned. No writes or runtime probes occur.
 */
export async function collectProjectInstructions(root, { targetPaths = [] } = {}) {
  const findings = [];
  const candidates = new Set();
  const scopes = new Map();
  let entriesVisited = 0;
  const projection = sources => ({
    status: findings.length ? 'incomplete' : sources.some(source => source.kind === 'agent-instructions') ? 'discovered' : 'missing',
    target_scope: targetPaths.length ? 'target-ancestors' : 'root-only',
    resolution: 'requires-content-review', sources, findings, writes_allowed: false,
    consolidation_candidates: sources.filter(source =>
      source.path === path.posix.join(source.base_scope, 'CLAUDE.md') ||
      source.path === path.posix.join(source.base_scope, '.claude/CLAUDE.md')
    ).map(source => {
      const target = path.posix.join(source.base_scope, 'AGENTS.md');
      return {
        source: source.path, source_sha256: source.sha256, target,
        target_sha256: sources.find(candidate => candidate.path === target)?.sha256 ?? null,
        base_scope: source.base_scope, status: 'proposal', review_required: true,
        writes_allowed: false,
      };
    }),
  });
  const base = await realpath(path.resolve(root)).catch(() => null);
  if (!base || !(await lstat(base).catch(() => null))?.isDirectory()) {
    findings.push({ code: 'INSTRUCTION_ROOT_UNAVAILABLE' });
    return projection([]);
  }
  const directories = new Set(['.']);
  for (const target of targetPaths) {
    if (typeof target !== 'string' || !target || target.includes('\\') || target.includes('\0') || path.posix.isAbsolute(target) || /^[A-Za-z]:/u.test(target) || target.split('/').some(part => part === '..')) {
      findings.push({ code: 'INSTRUCTION_TARGET_INVALID' });
      continue;
    }
    let directory = path.posix.dirname(target);
    // Only ancestors of named target files, never sibling package instructions.
    while (directory !== '.') {
      directories.add(directory);
      const parent = path.posix.dirname(directory);
      if (parent === directory) break;
      directory = parent;
    }
  }
  const add = (relative, scope = '.', scoped = false) => {
    if (candidates.size < MAX_CANDIDATES) {
      candidates.add(relative);
      scopes.set(relative, { scope, scoped });
    }
    else if (!findings.some(item => item.code === 'INSTRUCTION_DISCOVERY_TRUNCATED')) findings.push({ code: 'INSTRUCTION_DISCOVERY_TRUNCATED' });
  };
  for (const directory of [...directories].sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b))) {
    for (const name of DIRECTORY_FILES) add(path.posix.join(directory, name), directory);
    for (const name of ROOT_FILES) add(path.posix.join(directory, name), directory, directory !== '.');
  }

  async function inspect(relative) {
    let current = base;
    for (const part of relative.split('/')) {
      current = path.join(current, part);
      let info;
      try { info = await lstat(current); } catch (error) {
        if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') findings.push({ code: 'INSTRUCTION_UNREADABLE', path: relative });
        return null;
      }
      if (info.isSymbolicLink()) {
        findings.push({ code: 'INSTRUCTION_SYMLINK_SKIPPED', path: relative });
        return null;
      }
    }
    return lstat(current);
  }

  async function walk(relative, scope, depth = 0) {
    const info = await inspect(relative);
    if (!info?.isDirectory()) return;
    if (depth >= 12 || candidates.size >= MAX_CANDIDATES || entriesVisited >= MAX_ENTRIES) {
      findings.push({ code: 'INSTRUCTION_DISCOVERY_TRUNCATED', path: relative });
      return;
    }
    const entries = await readdir(path.join(base, relative), { withFileTypes: true }).catch(() => {
      findings.push({ code: 'INSTRUCTION_UNREADABLE', path: relative });
      return [];
    });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (++entriesVisited > MAX_ENTRIES) {
        findings.push({ code: 'INSTRUCTION_DISCOVERY_TRUNCATED', path: relative });
        break;
      }
      const child = path.posix.join(relative, entry.name);
      if (entry.isSymbolicLink()) await inspect(child);
      else if (entry.isDirectory()) await walk(child, scope, depth + 1);
      else if (/\.(?:md|mdc)$/u.test(entry.name)) add(child, scope, true);
    }
  }
  for (const scope of directories) {
    for (const directory of RULE_DIRECTORIES) await walk(path.posix.join(scope, directory), scope);
  }

  const sources = [];
  for (const relative of candidates) {
    const info = await inspect(relative);
    if (!info?.isFile()) continue;
    if (info.size > MAX_BYTES) {
      findings.push({ code: 'INSTRUCTION_TOO_LARGE', path: relative });
      continue;
    }
    const bytes = await readFile(path.join(base, relative)).catch(() => null);
    if (!bytes) { findings.push({ code: 'INSTRUCTION_UNREADABLE', path: relative }); continue; }
    const { scope, scoped } = scopes.get(relative);
    sources.push({
      path: relative,
      kind: /(?:^|\/)(?:README|CONTRIBUTING)\.md$/u.test(relative) ? 'project-documentation' : 'agent-instructions',
      scope: scoped ? 'declared-in-file' : scope,
      base_scope: scope,
      applicability: scoped ? 'scope-review-required' : 'applicable',
      sha256: createHash('sha256').update(bytes).digest('hex'),
    });
  }
  return projection(sources);
}
