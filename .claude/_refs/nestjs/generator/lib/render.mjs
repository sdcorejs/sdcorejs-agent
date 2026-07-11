import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { assertWithin } from './fs-safety.mjs';

async function walk(root, current = root) {
  const output = [];
  for (const entry of await readdir(current, { withFileTypes: true })) {
    const child = path.join(current, entry.name);
    if (entry.isDirectory()) output.push(...await walk(root, child));
    else if (entry.name.endsWith('.tpl')) output.push(path.relative(root, child));
  }
  return output.sort();
}

export function renderTemplate(source, values, flags) {
  let rendered = source;
  for (const [flag, enabled] of Object.entries(flags)) {
    const pattern = new RegExp(`\\{\\{#${flag}\\}\\}([\\s\\S]*?)\\{\\{/${flag}\\}\\}`, 'gu');
    rendered = rendered.replace(pattern, enabled ? '$1' : '');
  }
  rendered = rendered.replace(/\{\{([A-Z][A-Z0-9_]*)\}\}/gu, (_, key) => {
    if (!Object.hasOwn(values, key)) throw new Error(`Unknown template placeholder: ${key}`);
    return String(values[key]);
  });
  const unresolved = rendered.match(/\{\{[#/]?[A-Z][A-Z0-9_]*\}\}/gu);
  if (unresolved) throw new Error(`Unresolved template placeholders: ${[...new Set(unresolved)].join(', ')}`);
  return rendered;
}

export async function renderTree({ templateRoot, outputRoot, values, flags }) {
  const written = [];
  for (const relativeTemplate of await walk(templateRoot)) {
    const relativeOutput = relativeTemplate.slice(0, -4);
    const destination = path.join(outputRoot, relativeOutput);
    assertWithin(outputRoot, destination, 'template output');
    await mkdir(path.dirname(destination), { recursive: true });
    const source = await readFile(path.join(templateRoot, relativeTemplate), 'utf8');
    await writeFile(destination, renderTemplate(source, values, flags), 'utf8');
    written.push(relativeOutput.split(path.sep).join('/'));
  }
  return written;
}
