import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createCliAdapter, detectCliAdapter } from './support/cli-adapters.mjs';

test('phase 2: Codex and Claude adapters can smoke an available CLI without invoking an LLM', async () => {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'sdcorejs-agent-cli-'));
  const commandExt = process.platform === 'win32' ? '.cmd' : '';

  try {
    await writeFile(
      path.join(tempDir, `codex${commandExt}`),
      process.platform === 'win32'
        ? '@echo off\r\necho codex 1.2.3\r\n'
        : '#!/usr/bin/env sh\necho "codex 1.2.3"\n',
      { mode: 0o755 }
    );
    await writeFile(
      path.join(tempDir, `claude${commandExt}`),
      process.platform === 'win32'
        ? '@echo off\r\necho claude 4.5.6\r\n'
        : '#!/usr/bin/env sh\necho "claude 4.5.6"\n',
      { mode: 0o755 }
    );

    const env = { ...process.env, PATH: `${tempDir}${path.delimiter}${process.env.PATH ?? ''}` };
    const codex = await detectCliAdapter('codex', { env });
    const claude = await detectCliAdapter('claude', { env });

    assert.equal(codex.available, true);
    assert.match(codex.versionOutput, /codex 1\.2\.3/);
    assert.equal(claude.available, true);
    assert.match(claude.versionOutput, /claude 4\.5\.6/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('phase 2: adapter exposes a deterministic prompt contract for real CLI execution gates', () => {
  const adapter = createCliAdapter('codex');

  assert.deepEqual(adapter.buildPromptSmoke('what skills do you have?'), {
    cli: 'codex',
    mode: 'prompt-smoke',
    prompt: 'what skills do you have?',
    requiresHumanReview: true
  });
});
