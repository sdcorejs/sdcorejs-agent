import { createDecipheriv, createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const keyText = process.env.SDCOREJS_HANDOFF_KEY;
if (!/^[a-f0-9]{64}$/i.test(keyText ?? '')) {
  throw new Error('Set SDCOREJS_HANDOFF_KEY to the 64-character key supplied privately with the handoff.');
}
const [input = 'sdcorejs-handoff-20261114.tar.gz.enc', output = 'sdcorejs-handoff-20261114.tar.gz'] = process.argv.slice(2);
const packed = await readFile(input);
const magic = Buffer.from('SDCOREJS-HANDOFF-v1\n');
if (packed.length < magic.length + 28 || !packed.subarray(0, magic.length).equals(magic)) {
  throw new Error('Unsupported encrypted handoff format.');
}
const iv = packed.subarray(magic.length, magic.length + 12);
const tag = packed.subarray(magic.length + 12, magic.length + 28);
const decipher = createDecipheriv('aes-256-gcm', Buffer.from(keyText, 'hex'), iv);
decipher.setAAD(magic);
decipher.setAuthTag(tag);
let clear;
try {
  clear = Buffer.concat([decipher.update(packed.subarray(magic.length + 28)), decipher.final()]);
} catch {
  throw new Error('Authentication failed: wrong key or modified handoff. No output was written.');
}
const expected = '22affea899ca3a674106fc211cd2b050a09f1dc7b17113331e6bf7a676872599';
const actual = createHash('sha256').update(clear).digest('hex');
if (actual !== expected) throw new Error('Decrypted archive hash mismatch.');
await writeFile(output, clear, { flag: 'wx', mode: 0o600 });
console.log(JSON.stringify({ output, sha256: actual, bytes: clear.length }));
