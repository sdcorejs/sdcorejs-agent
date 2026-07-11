import assert from 'node:assert/strict';
import test from 'node:test';
import { runGoldenProfile } from './support/nestjs-golden-project.mjs';

for (const profile of ['simple', 'enterprise']) {
  test(`generated ${profile} NestJS project builds and passes behavioral tests`, { timeout: 300_000 }, async () => {
    const evidence = await runGoldenProfile(profile);
    assert.equal(evidence.profile, profile);
    assert.ok(evidence.commands.length >= 1, 'golden harness returned no command evidence');
    for (const result of evidence.commands) {
      assert.equal(result.exitCode, 0, `${result.command}\n${result.stdout}\n${result.stderr}`);
    }
    assert.equal(evidence.commands.length, profile === 'enterprise' ? 6 : 5);
  });
}
