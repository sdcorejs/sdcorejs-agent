import { exec, execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);
const SAFE_TARGET_NAME = /^[a-zA-Z0-9_-]+$/;

export function buildGoldenTargetAppPlan(options = {}) {
  const targetName = options.targetName ?? 'sdcorejs-golden-app';
  assertSafeTargetName(targetName);

  const targetDir = path.join('.tmp', targetName);

  return {
    targetName,
    steps: [
      {
        id: 'generate-target-app',
        command: `node test/e2e/golden/generate-target-app.mjs --target ${targetName}`,
        file: process.execPath,
        args: ['test/e2e/golden/generate-target-app.mjs', '--target', targetName],
        verifies: 'skill pack can generate the golden Angular + NestJS target app'
      },
      {
        id: 'install-target-deps',
        command: displayCommand(targetDir, 'npm', ['install']),
        file: npmCommand(),
        args: ['install'],
        cwd: targetDir,
        verifies: 'supertest and Playwright dependencies are available for the generated fixture'
      },
      {
        id: 'install-playwright-browser',
        command: displayCommand(targetDir, 'npx', ['playwright', 'install', 'chromium']),
        file: npxCommand(),
        args: ['playwright', 'install', 'chromium'],
        cwd: targetDir,
        verifies: 'Playwright has a browser available for UI smoke tests'
      },
      {
        id: 'docker-compose-up',
        command: displayCommand(targetDir, 'docker', ['compose', 'up', '--build', '-d']),
        file: 'docker',
        args: ['compose', 'up', '--build', '-d'],
        cwd: targetDir,
        verifies: 'generated app boots with Docker'
      },
      {
        id: 'api-supertest',
        command: displayCommand(targetDir, 'node', ['--test', 'e2e/api.supertest.mjs']),
        file: process.execPath,
        args: ['--test', 'e2e/api.supertest.mjs'],
        cwd: targetDir,
        verifies: 'generated NestJS API responds through supertest'
      },
      {
        id: 'ui-playwright',
        command: displayCommand(targetDir, 'npx', ['playwright', 'test', '--config', 'playwright.config.mjs']),
        file: npxCommand(),
        args: ['playwright', 'test', '--config', 'playwright.config.mjs'],
        cwd: targetDir,
        verifies: 'generated Angular portal passes browser smoke'
      },
      {
        id: 'docker-compose-down',
        command: displayCommand(targetDir, 'docker', ['compose', 'down', '-v']),
        file: 'docker',
        args: ['compose', 'down', '-v'],
        cwd: targetDir,
        verifies: 'golden stack is cleaned up'
      }
    ]
  };
}

export async function runGoldenTargetAppE2E(options = {}) {
  const enabled = options.enabled ?? process.env.SDCOREJS_E2E_FULL === '1';
  const requiredTools = ['docker', 'playwright', 'supertest'];

  if (!enabled) {
    return {
      status: 'skipped',
      requiredTools,
      reason: 'Set SDCOREJS_E2E_FULL=1 to run Docker/Playwright/supertest golden target-app validation.'
    };
  }

  const plan = buildGoldenTargetAppPlan(options);
  const executor = options.executor ?? defaultExecutor;
  const results = [];

  try {
    for (const step of plan.steps) {
      results.push(await executor(step));
    }
    return { status: 'passed', requiredTools, plan, results };
  } catch (error) {
    return { status: 'failed', requiredTools, plan, results, error };
  }
}

async function defaultExecutor(step) {
  const startedAt = Date.now();
  const execOptions = {
    cwd: step.cwd,
    windowsHide: true,
    timeout: Number(process.env.SDCOREJS_E2E_FULL_TIMEOUT_MS ?? 600000)
  };
  const { stdout, stderr } = step.file
    ? await execFileAsync(step.file, step.args ?? [], execOptions)
    : await execAsync(step.command, execOptions);

  return {
    id: step.id,
    command: step.command,
    durationMs: Date.now() - startedAt,
    stdout,
    stderr
  };
}

function assertSafeTargetName(targetName) {
  if (!SAFE_TARGET_NAME.test(targetName)) {
    throw new Error(`Invalid targetName "${targetName}". Use only letters, numbers, dash, and underscore.`);
  }
}

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function npxCommand() {
  return process.platform === 'win32' ? 'npx.cmd' : 'npx';
}

function displayCommand(cwd, command, args) {
  const normalizedCwd = cwd.split(path.sep).join('/');
  return `cd ${normalizedCwd} && ${[command, ...args].join(' ')}`;
}
