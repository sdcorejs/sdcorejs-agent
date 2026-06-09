import { spawn } from 'node:child_process';

export function createCliAdapter(cli) {
  return {
    cli,
    versionArgs: ['--version'],
    buildPromptSmoke(prompt) {
      return {
        cli,
        mode: 'prompt-smoke',
        prompt,
        requiresHumanReview: true
      };
    }
  };
}

export async function detectCliAdapter(cli, options = {}) {
  const adapter = createCliAdapter(cli);
  const result = await runCommand(cli, adapter.versionArgs, {
    env: options.env ?? process.env,
    timeoutMs: options.timeoutMs ?? 5000
  });

  return {
    ...adapter,
    available: result.exitCode === 0,
    versionOutput: result.stdout.trim(),
    errorOutput: result.stderr.trim(),
    exitCode: result.exitCode
  };
}

function runCommand(command, args, options) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      env: options.env,
      shell: process.platform === 'win32',
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill(), options.timeoutMs);

    child.stdout?.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ exitCode: 127, stdout, stderr: `${stderr}${error.message}` });
    });
    child.on('close', (exitCode) => {
      clearTimeout(timer);
      resolve({ exitCode: exitCode ?? 1, stdout, stderr });
    });
  });
}
