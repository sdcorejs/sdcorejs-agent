import { spawn } from 'node:child_process';
import { access, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { generateAngularGoldenProject } from '../../../_refs/angular/generator/generate-golden-project.mjs';
import { resolveAngularExecution } from '../../../_refs/angular/execution-contract.mjs';

const npmInvocation =
  process.platform === 'win32'
    ? {
        command: process.execPath,
        prefix: [
          path.join(
            path.dirname(process.execPath),
            'node_modules',
            'npm',
            'bin',
            'npm-cli.js',
          ),
        ],
      }
    : { command: 'npm', prefix: [] };

async function firstAvailable(paths) {
  for (const candidate of paths) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next known browser location.
    }
  }
  return null;
}

async function chromeBinary() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  return firstAvailable(
    process.platform === 'win32'
      ? [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
          'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        ]
      : [
          '/usr/bin/google-chrome',
          '/usr/bin/google-chrome-stable',
          '/usr/bin/chromium',
          '/usr/bin/chromium-browser',
        ],
  );
}

function runCommand(command, args, cwd, env, timeoutMs = 300_000) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env,
      shell: false,
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill(), timeoutMs);
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
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

export async function runAngularGoldenProject() {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-angular-golden-'));
  const projectRoot = path.join(tempRoot, 'golden');
  const commands = [];
  try {
    const generation = await generateAngularGoldenProject({
      output: projectRoot,
      outputRoot: tempRoot,
    });
    const chrome = await chromeBinary();
    if (!chrome) {
      commands.push({
        command: 'locate ChromeHeadless runtime',
        cwd: projectRoot,
        exitCode: 1,
        signal: null,
        stdout: '',
        stderr: 'Chrome/Chromium is required for the real Angular unit test run.',
      });
      return { projectRoot, generation, commands, ownerRouting: null };
    }
    const env = {
      ...process.env,
      CHROME_BIN: chrome,
      CI: '1',
      NODE_ENV: 'test',
    };
    delete env.NODE_TEST_CONTEXT;
    const commandPlan = [
      [
        npmInvocation.command,
        [
          ...npmInvocation.prefix,
          'install',
          '--ignore-scripts',
          '--no-audit',
          '--no-fund',
        ],
      ],
      [npmInvocation.command, [...npmInvocation.prefix, 'run', 'typecheck']],
      [npmInvocation.command, [...npmInvocation.prefix, 'run', 'validate:templates']],
      [npmInvocation.command, [...npmInvocation.prefix, 'run', 'build']],
      [npmInvocation.command, [...npmInvocation.prefix, 'test']],
      [npmInvocation.command, [...npmInvocation.prefix, 'run', 'lint']],
    ];
    for (const [command, args] of commandPlan) {
      const result = await runCommand(command, args, projectRoot, env);
      commands.push(result);
      if (result.exitCode !== 0) break;
    }
    const ownerRouting = resolveAngularExecution({
      project_profile: 'core-ui-angular',
      execution_profile: 'developer',
      scope: 'module',
      requested_module: 'catalog',
      topology: {
        modules: [
          {
            module_id: 'catalog',
            repository_id: 'github.com/sdcorejs/catalog',
            role: 'module',
            available: true,
            writable: true,
          },
        ],
      },
      execution_host_repository_id: 'github.com/sdcorejs/portal',
      application: { repository_id: 'github.com/sdcorejs/application' },
      portal: { repository_id: 'github.com/sdcorejs/portal' },
    });
    return { projectRoot, generation, commands, ownerRouting };
  } finally {
    if (process.env.SDCOREJS_KEEP_ANGULAR_GOLDEN !== '1') {
      await rm(tempRoot, { recursive: true, force: true });
    }
  }
}
