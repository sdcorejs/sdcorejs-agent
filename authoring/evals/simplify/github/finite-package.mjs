// Runs in a disposable verifier namespace. Exercise what a consumer installs.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const consumer = mkdtempSync('/tmp/finite-consumer-');
rmSync('/work/dist', { recursive:true, force:true });
execFileSync('/tools/npm', ['run','build'], {stdio:'inherit'});
const pack = JSON.parse(execFileSync('/tools/npm', ['pack','--ignore-scripts','--json','--pack-destination',consumer], {encoding:'utf8'}));
const installed = path.join(consumer, 'node_modules/@sdcorejs/utils');
mkdirSync(installed, {recursive:true});
execFileSync('tar', ['-xf',path.join(consumer,pack[0].filename),'--strip-components=1','-C',installed]);
for (const mode of ['module', 'commonjs']) {
  const load = mode === 'module' ? 'await import' : 'require';
  const probe = `const assert = (${load}('node:assert/strict')).strict;
    for (const name of ['@sdcorejs/utils','@sdcorejs/utils/fns']) {
      const {isFiniteNumericString: finite, NumberUtilities} = ${load}(name);
      for (const guard of [finite, NumberUtilities.isFiniteNumericString]) {
        assert.equal(guard('0xff', {allowHex:true}), true);
        assert.equal(guard('0xff'), false);
        assert.equal(guard('0x' + 'f'.repeat(300), {allowHex:true}), false);
        assert.equal(guard('1e999'), false);
        assert.equal(guard(1), false);
      }
    }`;
  execFileSync('/tools/node',['--input-type='+mode,'--eval',probe],{cwd:consumer,stdio:'inherit'});
  const file = path.join(consumer, mode === 'module' ? 'consumer.mts' : 'consumer.cts');
  writeFileSync(file, `import {isFiniteNumericString, NumberUtilities} from '@sdcorejs/utils';
    import {isFiniteNumericString as fromFunctions} from '@sdcorejs/utils/fns';
    type Equal<A,B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
    type Assert<T extends true> = T;
    declare const value: unknown;
    if (isFiniteNumericString(value, {allowHex:true})) { type Root = Assert<Equal<typeof value,string>>; }
    if (NumberUtilities.isFiniteNumericString(value)) { type Namespace = Assert<Equal<typeof value,string>>; }
    if (fromFunctions(value)) { type Subpath = Assert<Equal<typeof value,string>>; }`);
  execFileSync('/tools/node',['/work/node_modules/typescript/bin/tsc','--noEmit','--strict','--skipLibCheck','--module','NodeNext',file],
    {cwd:consumer,stdio:'inherit'});
}
