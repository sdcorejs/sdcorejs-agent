import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { lstatSync, readdirSync, readFileSync, realpathSync, existsSync } from 'node:fs';
import path from 'node:path';

// Read-only extraction: preserve simplify manifest/fingerprint and inventory caps.
const hash = value => 'sha256:' + createHash('sha256').update(value).digest('hex');
const text = value => typeof value === 'string' && value.trim() !== '';

export function safeRepositoryPath(value) {
  return text(value) && value === value.trim() && !/[\\:\0\r\n*?]/u.test(value) &&
    !value.startsWith('/') && !value.split('/').some(segment => !segment || segment === '.' || segment === '..' || /[. ]$/u.test(segment) || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(segment));
}

function inside(root, file) {
  const rel = path.relative(root, file);
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel));
}

export function containedRepositoryFile(state, file) {
  if (!safeRepositoryPath(file)) throw new Error(`unsafe repository path: ${file}`);
  let cursor = state.root;
  for (const segment of file.split('/')) {
    cursor = path.join(cursor, segment);
    if (!existsSync(cursor)) throw new Error(`source path is unavailable: ${file}`);
    const stat = lstatSync(cursor);
    if (stat.isSymbolicLink() || !inside(state.root, realpathSync.native(cursor))) throw new Error(`symlink containment is unproven: ${file}`);
    if (stat.isDirectory() && existsSync(path.join(cursor, '.git'))) throw new Error(`different nested Git root: ${file}`);
  }
  if (!lstatSync(cursor).isFile()) throw new Error(`not a regular source file: ${file}`);
  return cursor;
}

export function repositoryGit(state, args, accept = [0]) {
  const result = spawnSync('git', ['--no-optional-locks', ...args], { cwd: state.root, encoding: 'utf8', windowsHide: true, shell: false, timeout: 30000, maxBuffer: 32 * 1024 * 1024 });
  if (result.error || !accept.includes(result.status)) throw new Error(`repository observation failed: git ${args[0]}`);
  return result.stdout;
}

export function captureRepository(state) {
  const realRoot = realpathSync.native(state.root);
  const [rootPath, revision, indexPath] = repositoryGit(state, ['rev-parse', '--show-toplevel', 'HEAD', '--git-path', 'index']).trim().split(/\r?\n/u);
  const gitRoot = realpathSync.native(rootPath);
  if (realRoot !== state.root || gitRoot !== state.root) throw new Error('different Git root');
  if (!/^[a-f0-9]{40}$/u.test(revision)) throw new Error('repository HEAD is unavailable');
  const indexFile = path.resolve(state.root, indexPath);
  const readIndex = () => existsSync(indexFile) ? readFileSync(indexFile) : Buffer.alloc(0);
  const index = readIndex();
  // Bind staged path/mode/blob identities, not Git's refreshable stat cache.
  const indexEntries = repositoryGit(state, ['ls-files', '--stage', '-z']);
  const files = {}, bytes = {};
  let totalBytes = 0, count = 0;
  function walk(directory, prefix = '') {
    for (const name of readdirSync(directory).sort()) {
      if (!prefix && name === '.git') continue;
      const file = prefix + name, absolute = path.join(directory, name);
      if (!safeRepositoryPath(file)) throw new Error(`unobservable repository path: ${file}`);
      if (++count > 100000) throw new Error('repository inventory limit exceeded');
      const stat = lstatSync(absolute);
      if (stat.isSymbolicLink()) {
        throw new Error(`symlink content/containment is unproven: ${file}`);
      } else if (stat.isDirectory()) {
        if (name === '.git') {
          files[file] = { kind: 'nested-repository', mode: stat.mode, sha256: hash('nested-repository') };
        } else {
          files[file] = { kind: 'directory', mode: stat.mode, sha256: hash('directory') };
          walk(absolute, `${file}/`);
        }
      } else if (stat.isFile()) {
        // Include ignored output. Excluding it based on agent scope would hide writes.
        totalBytes += stat.size;
        if (totalBytes > 128 * 1024 * 1024) throw new Error('repository byte limit exceeded; observation incomplete');
        const content = readFileSync(absolute), after = lstatSync(absolute);
        if (stat.size !== after.size || stat.mtimeMs !== after.mtimeMs || stat.ino !== after.ino) throw new Error('repository changed during snapshot');
        bytes[file] = content;
        files[file] = { kind: name === '.git' ? 'nested-repository' : 'file', mode: stat.mode, sha256: hash(content) };
      } else throw new Error(`unsupported filesystem entry: ${file}`);
    }
  }
  walk(state.root);
  if (revision !== repositoryGit(state, ['rev-parse', 'HEAD']).trim() || !index.equals(readIndex())) throw new Error('Git identity changed during snapshot');
  const manifest = { root: state.root, repository_id: state.owner, revision, index_hash: hash(indexEntries), files };
  return { ...manifest, bytes, fingerprint: hash(JSON.stringify(manifest)), complete: true, ignored_policy: 'include-all-except-root-git-metadata' };
}
