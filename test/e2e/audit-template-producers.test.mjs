import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parse } from 'yaml';
import { generateNextjsGoldenProject } from '../../_refs/nextjs/generator/generate-golden-project.mjs';
import * as execution from '../../_refs/orchestration/execution-contract.mjs';

const read = (p) => readFile(new URL('../../' + p, import.meta.url), 'utf8');
test('F-006: recipe basic config and golden producer agree, i18n is opt-in', async () => {
  const recipe = await read('_refs/nextjs/build-website/write-code/init-site.md');
  const basic = recipe.match(/\*\*`next.config.ts`\*\*[^\n]*\n```typescript\n([\s\S]*?)```/u)?.[1];
  assert.ok(basic, 'published basic config exists');
  assert.doesNotMatch(basic, /next-intl|i18n/);
  const root = await mkdtemp(path.join(tmpdir(), 'audit-next-config-'));
  try {
    for (const profile of ['basic','i18n']) {
      const output = path.join(root, profile);
      await generateNextjsGoldenProject({output, outputRoot:root, profile});
      const config = await readFile(path.join(output, 'next.config.ts'), 'utf8');
      const pkg = JSON.parse(await readFile(path.join(output, 'package.json'), 'utf8'));
      if (profile === 'basic') {
        assert.equal(config, basic);
        assert.equal(pkg.dependencies['next-intl'], undefined);
      } else {
        assert.match(config, /next-intl\/plugin/);
        assert.ok(pkg.dependencies['next-intl']);
        assert.ok(await readFile(path.join(output, 'src/i18n/request.ts'), 'utf8'));
      }
    }
  } finally { await rm(root,{recursive:true,force:true}); }
});
test('F-007: literal plan verification block reaches executor and rejects a flat impostor', async () => {
  const source = await read('_refs/sdlc/plan-template.md');
  const block = source.match(/^  verification_strategy:\n(?:    .*\n)+/m)?.[0];
  assert.ok(block);
  const rendered = block.replace('<npm|pnpm|yarn|bun|unknown>', 'npm')
    .replace('[<command/script and proof reason>]', '["node --version"]')
    .replace('[<candidate and skip reason>]', '[]')
    .replace('<detected scripts plus focused and broad checks>', 'focused');
  const context = parse(rendered);
  const consumer = await read('skills/shared/sdlc/04-execute-plan.md');
  const field = consumer.match(/Run every verification command from `plan_context\.([^`]+)`/)?.[1];
  assert.ok(field);
  assert.deepEqual(field.split('.').reduce((value,key) => value?.[key],context), ['node --version']);
  assert.deepEqual(execution.resolveVerificationCommands(context), ['node --version']);
  assert.throws(() => execution.resolveVerificationCommands({commands_planned:['unexpected']}), /verification_strategy/);
  assert.throws(() => execution.resolveVerificationCommands({verification_strategy:{commands_planned:[null]}}), /command/);
});
