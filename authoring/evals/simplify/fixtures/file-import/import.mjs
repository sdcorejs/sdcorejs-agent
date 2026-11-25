import { readFileSync } from 'node:fs';
import { extname } from 'node:path';

const input = process.argv[2];
const formats = JSON.parse(readFileSync(new URL('./extensions.json', import.meta.url), 'utf8'));
const format = formats[extname(input)];
if (format !== 'ndjson') throw new Error('Unsupported input extension');
const lines = readFileSync(input, 'utf8').split(/\r?\n/).filter(line => line.trim());
console.log(JSON.stringify(lines.map(line => JSON.parse(line))));
