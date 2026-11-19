// Test process only. Exercise the real batch and cleanup engine with a local
// fixture unlink adapter when the host cannot admit the native protocol.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { mock } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = process.argv[2];
assert.match(path.basename(path.dirname(root)), /^cleanup-workspace-/u);
assert.equal(path.basename(root), 'collection');
const modulePath = fileURLToPath(new URL('../../../_refs/cleanup/native-file-operation.mjs', import.meta.url));
mock.module(modulePath, { namedExports: {
  acquireSafeCleanupWriter: async () => ({ lock_verified: true, errors: [] }),
  releaseSafeCleanupWriter: async () => ({ released: true, errors: [] }),
  performSafeFileOperation: async (operation) => {
    assert.equal(operation.root, root);
    assert.equal(operation.source, '2026-10-28-b/cache/log.txt');
    assert.equal(operation.destination, null);
    const file = path.join(root, operation.source);
    const data = await readFile(file);
    assert.equal(operation.fingerprint, 'sha256:' + createHash('sha256').update(data).digest('hex'));
    assert.equal(operation.state.size, data.length);
    assert.equal((await lstat(file)).nlink, 1);
    await unlink(file);
    return { source_removed: true, allocated_bytes: data.length, errors: [] };
  },
} });
const { runCleanupCli } = await import('../../../_refs/cleanup/cli.mjs');
process.stdout.write(JSON.stringify(await runCleanupCli(['workspace-apply', '--root', root, '--input', process.argv[3]])));
