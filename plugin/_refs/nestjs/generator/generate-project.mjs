#!/usr/bin/env node
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContract, resolveProfile } from './lib/contract.mjs';
import { assertOutputAvailable, assertSafeOutputBoundary, assertWithin, prepareOutput } from './lib/fs-safety.mjs';
import { renderTree } from './lib/render.mjs';

const generatorRoot = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const options = { profile: null, output: null, outputRoot: null, force: false, readOnly: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--force') options.force = true;
    else if (arg === '--read-only') options.readOnly = true;
    else if (arg === '--profile' || arg === '--output' || arg === '--output-root') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
      options[arg.slice(2).replace(/-([a-z])/gu, (_, letter) => letter.toUpperCase())] = value;
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!options.output) throw new Error('--output is required');
  return options;
}

export async function generateProject(rawOptions) {
  const contract = await loadContract();
  const resolvedProfile = resolveProfile(contract, rawOptions.profile);
  const output = path.resolve(rawOptions.output);
  const outputRoot = path.resolve(rawOptions.outputRoot || path.dirname(output));
  assertWithin(outputRoot, output, 'output');
  await assertSafeOutputBoundary(outputRoot, output);
  await assertOutputAvailable(output, { force: rawOptions.force });
  if (rawOptions.force) await rm(output, { recursive: true, force: true });
  await prepareOutput(output);

  const values = {
    PROFILE: resolvedProfile.name,
    PACKAGE_NAME: `sdcorejs-golden-${resolvedProfile.name}`,
  };
  const flags = {
    ENTERPRISE: resolvedProfile.name === 'enterprise',
    SIMPLE: resolvedProfile.name === 'simple',
    MUTATIONS: !rawOptions.readOnly,
    READ_ONLY: rawOptions.readOnly,
  };

  const common = await renderTree({
    templateRoot: path.join(generatorRoot, 'templates', 'common'),
    outputRoot: output,
    values,
    flags,
  });
  const profile = await renderTree({
    templateRoot: path.join(generatorRoot, 'templates', resolvedProfile.name),
    outputRoot: output,
    values,
    flags,
  });
  return {
    profile: resolvedProfile.name,
    output,
    readOnly: rawOptions.readOnly,
    files: [...new Set([...common, ...profile])].sort(),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateProject(parseArgs(process.argv.slice(2)))
    .then((result) => process.stdout.write(`${JSON.stringify(result)}\n`))
    .catch((error) => {
      process.stderr.write(`${error.stack || error.message}\n`);
      process.exitCode = 1;
    });
}
