import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { generateProject } from '../../../_refs/nestjs/generator/generate-project.mjs';

const npmInvocation = process.platform === 'win32'
  ? {
      command: process.execPath,
      prefix: [path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')],
    }
  : { command: 'npm', prefix: [] };

function runCommand(command, args, cwd, timeoutMs = 240_000) {
  return new Promise((resolve) => {
    const env = { ...process.env, CI: '1', NODE_ENV: 'test' };
    delete env.NODE_TEST_CONTEXT;
    const child = spawn(command, args, {
      cwd,
      env,
      shell: false,
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill(), timeoutMs);
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (exitCode, signal) => {
      clearTimeout(timer);
      resolve({
        command: [command, ...args].join(' '),
        cwd,
        exitCode: exitCode ?? 1,
        signal,
        stdout,
        stderr,
      });
    });
  });
}

export async function runGoldenProfile(profile) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), `sdcorejs-nestjs-${profile}-`));
  const projectRoot = path.join(tempRoot, `golden-${profile}`);
  const commands = [];
  try {
    await generateProject({ profile, output: projectRoot, outputRoot: tempRoot, force: false, readOnly: false });
    const commandPlan = [
      [npmInvocation.command, [...npmInvocation.prefix, 'install', '--ignore-scripts', '--no-audit', '--no-fund']],
      [npmInvocation.command, [...npmInvocation.prefix, 'run', 'build']],
      [process.execPath, ['--test',
        'dist/test/unit/item-policy.spec.js',
        'dist/test/unit/item-service.spec.js',
        'dist/test/config-abuse.spec.js',
        'dist/test/admin-security.spec.js',
        'dist/test/keycloak-saga.spec.js']],
      [process.execPath, ['--test',
        'dist/test/integration/item-repository.spec.js',
        'dist/test/integration/item-route-audit.spec.js']],
      [process.execPath, ['--test',
        'dist/test/e2e/item-auth.e2e-spec.js',
        'dist/test/e2e/item-validation.e2e-spec.js',
        'dist/test/e2e/item-read-only.e2e-spec.js']],
    ];
    if (profile === 'enterprise') {
      commandPlan.push([process.execPath, ['--test',
        'dist/test/tenant-isolation.spec.js',
        'dist/test/workflow-concurrency.spec.js',
        'dist/test/bulk-import.spec.js',
        'dist/test/export-scope.spec.js']]);
    }
    for (const [command, args] of commandPlan) {
      const result = await runCommand(command, args, projectRoot);
      commands.push(result);
      if (result.exitCode !== 0) break;
    }
    return { profile, projectRoot, commands };
  } finally {
    if (process.env.SDCOREJS_KEEP_NESTJS_GOLDEN !== '1') {
      await rm(tempRoot, { recursive: true, force: true });
    }
  }
}
