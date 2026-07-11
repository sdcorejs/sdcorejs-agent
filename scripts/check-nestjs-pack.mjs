#!/usr/bin/env node
import { validateCanonicalPack } from '../test/e2e/support/nestjs-pack-validator.mjs';

const errors = await validateCanonicalPack();
if (errors.length > 0) {
  process.stderr.write(`NestJS pack validation failed (${errors.length}):\n${errors.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write('NestJS pack validation passed.\n');
}
