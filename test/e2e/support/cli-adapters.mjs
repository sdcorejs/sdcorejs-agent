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

/** Capture an actual Codex turn. Prompts travel over stdin, never through a shell. */
export function runCliPrompt({ executable = 'codex', cwd, prompt, timeoutMs = 120000, maxBytes = 2_000_000 }) {
  const args = ['exec', '--ephemeral', '--json', '--sandbox', 'read-only', '--skip-git-repo-check', '--cd', cwd, '-'];
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(executable, args, { cwd, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    // Decode across pipe chunks so a split multibyte locale mark is preserved.
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    let stdout = '', stderr = '', bytes = 0, interrupted = null, finished = false;
    const stop = (reason) => { interrupted = reason; child.kill(); };
    const timer = setTimeout(() => stop('timeout'), timeoutMs);
    const collect = (stream) => (chunk) => {
      bytes += Buffer.byteLength(chunk, 'utf8');
      if (bytes > maxBytes) return stop('output-limit');
      if (stream === 'stdout') stdout += chunk; else stderr += chunk;
    };
    child.stdout.on('data', collect('stdout'));
    child.stderr.on('data', collect('stderr'));
    const finish = (exitCode, error = null) => {
      if (finished) return;
      finished = true; clearTimeout(timer);
      resolve({ executable, args, exit_code: exitCode, stdout, stderr, error, interrupted, duration_ms: Date.now() - started });
    };
    child.on('error', error => finish(null, error.message));
    child.on('close', code => finish(code));
    child.stdin.on('error', () => {});
    child.stdin.end(prompt);
  });
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
