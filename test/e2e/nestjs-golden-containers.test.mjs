import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { repoRoot } from './support/nestjs-pack-validator.mjs';

const execFileAsync = promisify(execFile);
const composeFile = path.join(repoRoot, '_refs/nestjs/generator/containers/docker-compose.yml');
const project = `sdcorejs-nestjs-${process.pid}`;

async function docker(args, timeout = 120_000) {
  return execFileAsync('docker', args, { cwd: path.dirname(composeFile), timeout, windowsHide: true });
}

async function retry(action, attempts = 45) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
  }
  throw lastError;
}

test('real Postgres and Keycloak containers become usable', { timeout: 300_000 }, async (t) => {
  try {
    await docker(['version', '--format', '{{.Server.Version}}'], 10_000);
  } catch (error) {
    t.skip(`Docker unavailable: ${error.message}`);
    return;
  }

  const compose = ['compose', '--project-name', project, '--file', composeFile];
  try {
    await docker([...compose, 'up', '--detach'], 240_000);
    const postgres = await retry(() => docker([...compose, 'exec', '-T', 'postgres', 'pg_isready', '-U', 'app', '-d', 'app'], 10_000));
    assert.match(postgres.stdout, /accepting connections/iu);

    await retry(() => docker([
      ...compose,
      'exec',
      '-T',
      'keycloak',
      '/opt/keycloak/bin/kcadm.sh',
      'config',
      'credentials',
      '--server',
      'http://localhost:8080',
      '--realm',
      'master',
      '--user',
      'admin',
      '--password',
      'local-test-only',
    ], 15_000));
    const realms = await docker([
      ...compose,
      'exec',
      '-T',
      'keycloak',
      '/opt/keycloak/bin/kcadm.sh',
      'get',
      'realms/sdcorejs-golden',
      '--fields',
      'realm,enabled',
    ], 15_000);
    assert.match(realms.stdout, /sdcorejs-golden/u);
  } finally {
    await docker([...compose, 'down', '--volumes', '--remove-orphans'], 120_000).catch(() => {});
  }
});
