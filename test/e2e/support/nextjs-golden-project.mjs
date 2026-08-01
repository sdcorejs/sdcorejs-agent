import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { generateNextjsGoldenProject } from '../../../_refs/nextjs/generator/generate-golden-project.mjs';
import { resolveNextjsExecution } from '../../../_refs/nextjs/execution-contract.mjs';

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

export async function runNextjsGoldenProject(profile) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), `sdcorejs-nextjs-${profile}-`));
  const projectRoot = path.join(tempRoot, 'golden');
  const commands = [];
  try {
    const generation = await generateNextjsGoldenProject({
      output: projectRoot,
      outputRoot: tempRoot,
      profile,
    });
    const env = {
      ...process.env,
      CI: '1',
      NODE_ENV: 'test',
      NEXT_TELEMETRY_DISABLED: '1',
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
      [npmInvocation.command, [...npmInvocation.prefix, 'test']],
      [npmInvocation.command, [...npmInvocation.prefix, 'run', 'build']],
    ];
    for (const [command, args] of commandPlan) {
      const result = await runCommand(command, args, projectRoot, env);
      commands.push(result);
      if (result.exitCode !== 0) break;
    }
    const ownerRouting = resolveNextjsExecution({
      project_profile: 'nextjs-build-website',
      execution_profile: 'developer',
      website_profile: 'basic',
      explicit_profile_approval: true,
      requested_features: generation.approved_features,
      approved_requirement_features: generation.approved_features,
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
    if (process.env.SDCOREJS_KEEP_NEXTJS_GOLDEN !== '1') {
      await rm(tempRoot, { recursive: true, force: true });
    }
  }
}
