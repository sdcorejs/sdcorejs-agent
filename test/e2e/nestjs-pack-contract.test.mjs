import assert from 'node:assert/strict';
import test from 'node:test';
import {
  basicFenceSyntaxErrors,
  canonicalNestjsFiles,
  exists,
  extractCodeFences,
  formatFindings,
  readRepoFile,
  scanCanonicalForbiddenText,
  scanForbiddenText,
  validateCanonicalPack,
  typescriptFenceSyntaxErrors,
} from './support/nestjs-pack-validator.mjs';

test('canonical NestJS pack exposes a manifest and profile contract', async () => {
  assert.equal(await exists('_refs/nestjs/pack-manifest.json'), true, 'missing pack-manifest.json');
  assert.equal(await exists('_refs/nestjs/profile-contract.json'), true, 'missing profile-contract.json');
});

test('canonical NestJS sources contain no corruption token or mojibake', async () => {
  const findings = await scanCanonicalForbiddenText();
  assert.equal(findings.length, 0, formatFindings(findings));
});

test('forbidden-token scanner accepts clean text and rejects the invalid fixture', async () => {
  const valid = await readRepoFile('test/e2e/fixtures/nestjs-pack/valid-code-fence.md');
  const invalid = await readRepoFile('test/e2e/fixtures/nestjs-pack/invalid-template-token.txt');
  assert.deepEqual(scanForbiddenText(valid), []);
  assert.equal(scanForbiddenText(invalid).length, 1);
});

test('TypeScript fence scanner identifies balanced and malformed fixtures', async () => {
  const valid = extractCodeFences(await readRepoFile('test/e2e/fixtures/nestjs-pack/valid-code-fence.md'))[0];
  const invalid = extractCodeFences(await readRepoFile('test/e2e/fixtures/nestjs-pack/invalid-code-fence.md'))[0];
  assert.deepEqual(basicFenceSyntaxErrors(valid), []);
  assert.notDeepEqual(basicFenceSyntaxErrors(invalid), []);
  const balancedInvalid = extractCodeFences(await readRepoFile('test/e2e/fixtures/nestjs-pack/invalid-balanced-typescript.md'))[0];
  assert.notDeepEqual(typescriptFenceSyntaxErrors(balancedInvalid), []);
});

test('every long canonical NestJS Markdown pack has a contents map', async () => {
  const markdownFiles = (await canonicalNestjsFiles()).filter((file) => file.endsWith('.md'));
  const missing = [];
  for (const file of markdownFiles) {
    const text = await readRepoFile(file);
    if (text.split(/\r?\n/u).length >= 250 && !/(?:table of contents|## contents)/iu.test(text.slice(0, 3000))) {
      missing.push(file);
    }
  }
  assert.deepEqual(missing, [], `long packs without contents map:\n${missing.join('\n')}`);
});

test('focused canonical validator reports no contract error', async () => {
  const errors = await validateCanonicalPack();
  assert.deepEqual(errors, [], errors.join('\n'));
});
