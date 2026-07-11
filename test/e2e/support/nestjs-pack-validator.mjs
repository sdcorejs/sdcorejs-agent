import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const canonicalRoots = [
  'skills/tracks/nestjs/sdcorejs-nestjs.md',
  '_refs/sdlc/nestjs.md',
  '_refs/nestjs',
];

const corruptionPatterns = [
  { name: 'localized placeholder', pattern: /<localized text>/giu },
  { name: 'replacement character', pattern: /\uFFFD/gu },
  { name: 'UTF-8 mojibake', pattern: /(?:Ã.|Â.|â€|ðŸ)/gu },
];

export function toPosix(value) {
  return value.split(path.sep).join('/');
}

export async function exists(relativePath) {
  try {
    await access(path.join(repoRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function walk(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  const entries = await readdir(absolutePath, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) output.push(...await walk(child));
    else output.push(toPosix(child));
  }
  return output;
}

export async function canonicalNestjsFiles() {
  const files = [];
  for (const root of canonicalRoots) {
    const absolutePath = path.join(repoRoot, root);
    const stat = await import('node:fs/promises').then(({ stat }) => stat(absolutePath));
    if (stat.isDirectory()) files.push(...await walk(root));
    else files.push(toPosix(root));
  }
  return files.filter((file) => /\.(?:md|json|mjs|ts|tpl)$/u.test(file)).sort();
}

export async function readRepoFile(relativePath) {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

export async function readJson(relativePath) {
  return JSON.parse(await readRepoFile(relativePath));
}

export function scanForbiddenText(text, file = '<memory>') {
  const findings = [];
  for (const { name, pattern } of corruptionPatterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      findings.push({ file, kind: name, index: match.index, value: match[0] });
    }
  }
  return findings;
}

export async function scanCanonicalForbiddenText() {
  const findings = [];
  for (const file of await canonicalNestjsFiles()) {
    findings.push(...scanForbiddenText(await readRepoFile(file), file));
  }
  return findings;
}

export function extractCodeFences(markdown, file = '<memory>') {
  const fences = [];
  const pattern = /```(typescript|ts|tsx)\s*\n([\s\S]*?)```/giu;
  for (const match of markdown.matchAll(pattern)) {
    fences.push({ file, language: match[1].toLowerCase(), source: match[2], index: match.index });
  }
  return fences;
}

export function basicFenceSyntaxErrors(fence) {
  const stack = [];
  const pairs = new Map([[')', '('], [']', '['], ['}', '{']]);
  let quote = null;
  let escaped = false;
  for (const character of fence.source) {
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }
    if ('([{'.includes(character)) stack.push(character);
    else if (pairs.has(character) && stack.pop() !== pairs.get(character)) {
      return [`${fence.file}: mismatched delimiter near offset ${fence.index}`];
    }
  }
  if (quote) return [`${fence.file}: unterminated string in TypeScript fence`];
  if (stack.length > 0) return [`${fence.file}: unclosed delimiter in TypeScript fence`];
  return [];
}

export function typescriptFenceSyntaxErrors(fence) {
  const result = ts.transpileModule(fence.source, {
    fileName: `${fence.file}.${fence.language === 'tsx' ? 'tsx' : 'ts'}`,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      strict: true,
      jsx: fence.language === 'tsx' ? ts.JsxEmit.ReactJSX : undefined,
    },
  });
  return (result.diagnostics ?? [])
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
    .map((diagnostic) => `${fence.file}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`);
}

export function formatFindings(findings, limit = 20) {
  if (findings.length === 0) return 'no findings';
  const shown = findings.slice(0, limit).map((finding) => {
    if (typeof finding === 'string') return finding;
    return `${finding.file}: ${finding.kind} (${JSON.stringify(finding.value)})`;
  });
  if (findings.length > limit) shown.push(`... ${findings.length - limit} more`);
  return shown.join('\n');
}

export function createEvidence({ command, cwd = repoRoot, exitCode, resultIdentity, skippedReason = null }) {
  return { command, cwd, exitCode, resultIdentity, skippedReason };
}

export async function validateManifestAndProfiles() {
  const errors = [];
  let manifest;
  let profileContract;
  try {
    [manifest, profileContract] = await Promise.all([
      readJson('_refs/nestjs/pack-manifest.json'),
      readJson('_refs/nestjs/profile-contract.json'),
    ]);
  } catch (error) {
    return [`contract JSON: ${error.message}`];
  }
  const manifestProfiles = Object.keys(manifest.profiles ?? {}).sort();
  const contractProfiles = Object.keys(profileContract.profiles ?? {}).sort();
  if (JSON.stringify(manifestProfiles) !== JSON.stringify(contractProfiles)) {
    errors.push('manifest/profile contract profile keys disagree');
  }
  if (JSON.stringify(manifestProfiles) !== JSON.stringify(['enterprise', 'simple'])) {
    errors.push('exactly simple and enterprise profiles are required');
  }
  const ids = new Set();
  for (const pack of manifest.packs ?? []) {
    if (!pack.id || ids.has(pack.id)) errors.push(`invalid or duplicate pack id: ${pack.id ?? '<missing>'}`);
    ids.add(pack.id);
    if (!pack.path || !await exists(pack.path)) errors.push(`missing pack path: ${pack.path ?? '<missing>'}`);
    if (!Array.isArray(pack.requiredInputs) || pack.requiredInputs.length === 0) errors.push(`${pack.id}: requiredInputs missing`);
    if (!Array.isArray(pack.writeBoundary) || pack.writeBoundary.length === 0) errors.push(`${pack.id}: writeBoundary missing`);
  }
  for (const pack of manifest.packs ?? []) {
    for (const dependency of pack.dependsOn ?? []) {
      if (!ids.has(dependency)) errors.push(`${pack.id}: unknown dependency ${dependency}`);
    }
  }
  if (!manifest.generator || !await exists(manifest.generator)) errors.push(`missing generator: ${manifest.generator ?? '<missing>'}`);
  for (const verification of manifest.verification ?? []) {
    if (verification.mutates !== false) errors.push(`${verification.id}: verification must be non-mutating`);
  }
  if (profileContract.shared?.missingPermissionBehavior !== 'deny') errors.push('missing permission behavior must be deny');
  if (profileContract.profiles?.enterprise?.missingScopeBehavior !== 'deny') errors.push('enterprise missing scope behavior must be deny');
  return errors;
}

export async function validateMarkdownFences() {
  const errors = [];
  for (const file of (await canonicalNestjsFiles()).filter((candidate) => candidate.endsWith('.md'))) {
    for (const fence of extractCodeFences(await readRepoFile(file), file)) {
      errors.push(...basicFenceSyntaxErrors(fence));
      errors.push(...typescriptFenceSyntaxErrors(fence));
    }
  }
  return errors;
}

export async function validateCanonicalPack() {
  const errors = [];
  errors.push(...(await scanCanonicalForbiddenText()).map((finding) => `${finding.file}: ${finding.kind}`));
  errors.push(...await validateManifestAndProfiles());
  errors.push(...await validateMarkdownFences());
  return [...new Set(errors)].sort();
}
