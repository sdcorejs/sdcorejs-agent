import { access, lstat, mkdir, realpath } from 'node:fs/promises';
import path from 'node:path';

function comparable(value) {
  const resolved = path.resolve(value);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

export function assertWithin(root, candidate, label = 'path') {
  const resolvedRoot = comparable(root);
  const resolvedCandidate = comparable(candidate);
  const relative = path.relative(resolvedRoot, resolvedCandidate);
  if (path.isAbsolute(relative) || relative === '..' || relative.startsWith(`..${path.sep}`)) {
    throw new Error(`${label} escapes or is outside output root: ${candidate}`);
  }
}

async function lstatIfExists(value) {
  try {
    return await lstat(value);
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

export async function assertSafeOutputBoundary(outputRoot, output) {
  assertWithin(outputRoot, output, 'output');
  const resolvedRoot = path.resolve(outputRoot);
  const resolvedOutput = path.resolve(output);
  const relative = path.relative(resolvedRoot, resolvedOutput);
  if (path.isAbsolute(relative) || relative === '..' || relative.startsWith(`..${path.sep}`)) {
    throw new Error(`output escapes or is outside output root: ${output}`);
  }
  let cursor = resolvedRoot;
  for (const segment of ['', ...relative.split(path.sep).filter(Boolean)]) {
    if (segment) cursor = path.join(cursor, segment);
    const stat = await lstatIfExists(cursor);
    if (stat?.isSymbolicLink()) {
      throw new Error(`Symlink or junction ancestor is forbidden: ${cursor}`);
    }
    if (stat && cursor !== resolvedOutput && !stat.isDirectory()) {
      throw new Error(`Output ancestor is not a directory: ${cursor}`);
    }
  }
  const rootStat = await lstatIfExists(resolvedRoot);
  if (rootStat) {
    const canonicalRoot = await realpath(resolvedRoot);
    let existing = resolvedOutput;
    while (!await lstatIfExists(existing)) existing = path.dirname(existing);
    const canonicalExisting = await realpath(existing);
    assertWithin(canonicalRoot, canonicalExisting, 'canonical output ancestor');
  }
}

export async function assertOutputAvailable(output, { force = false } = {}) {
  try {
    const stat = await lstat(output);
    if (!stat.isDirectory()) throw new Error(`Output exists and is not a directory: ${output}`);
    const entries = await import('node:fs/promises').then(({ readdir }) => readdir(output));
    if (entries.length > 0 && !force) throw new Error(`Output is not empty; pass --force to replace generated files: ${output}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

export async function prepareOutput(output) {
  await mkdir(output, { recursive: true });
  const parent = await realpath(path.dirname(output));
  assertWithin(parent, output, 'resolved output');
}

export async function pathExists(value) {
  try {
    await access(value);
    return true;
  } catch {
    return false;
  }
}
