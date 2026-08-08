#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseTemplate } from '@angular/compiler';
import ts from 'typescript';
import { parse as parseYaml } from 'yaml';

import { systemRegistry } from '../_refs/shared/system-registry.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_MARKER = /<!--\s*executable-reference-default:\s*([a-z-]+)\s*-->/iu;
const FENCE_MARKER = /\bexecutable-reference=([a-z-]+)\b/iu;
const EXECUTABLE_FENCE =
  /^```(?:typescript|ts|tsx|javascript|js|html|json|yaml|yml|bash|sh|shell)\b/iu;

export const CANONICAL_EXECUTABLE_REFERENCE_FILES = Object.freeze([
  '_refs/angular/templates/entity-skeleton.md',
  '_refs/angular/templates/example-product.md',
  '_refs/angular/templates/reactive-form-templates.md',
  '_refs/angular/templates/screen-detail-component.md',
  '_refs/angular/write-code/screen-detail.md',
]);
export const CANONICAL_NEXTJS_EXECUTABLE_REFERENCE_FILES = Object.freeze([
  '_refs/nextjs/build-website/audit-existing-site.md',
  '_refs/nextjs/build-website/content-quality-refs.md',
  '_refs/nextjs/build-website/write-code/contact-form.md',
  '_refs/nextjs/build-website/write-code/i18n.md',
  '_refs/nextjs/build-website/write-code/seo.md',
]);

async function walkMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walkMarkdown(absolute)));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(absolute);
  }
  return files;
}

function quotedAt(line, offset) {
  let quote = null;
  let escaped = false;
  for (let index = 0; index < offset; index += 1) {
    const character = line[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === '\\') {
      escaped = true;
      continue;
    }
    if (quote === null && ["'", '"', '`'].includes(character)) quote = character;
    else if (quote === character) quote = null;
  }
  return quote !== null;
}

export function validateLocalizationPlaceholderContext(source, file = '<source>') {
  const errors = [];
  const lines = source.split(/\r?\n/u);
  for (const [lineIndex, line] of lines.entries()) {
    if (/[A-Za-z]'<localized text>'[A-Za-z]|[A-Za-z]'<localized text>/u.test(line)) {
      errors.push(
        `${file}:${lineIndex + 1} <localized text> corrupts an English word or possessive`,
      );
    }
    let offset = line.indexOf('<localized text>');
    while (offset !== -1) {
      if (!quotedAt(line, offset)) {
        errors.push(
          `${file}:${lineIndex + 1}:${offset + 1} <localized text> must be inside a quoted string, template literal, or Markdown code span`,
        );
      }
      offset = line.indexOf('<localized text>', offset + 1);
    }
  }
  return errors;
}

export function validateExecutableFenceConvention(source, file = '<source>') {
  const errors = [];
  const classes = new Set(systemRegistry.executable_reference_classes);
  const defaultClass = source.match(DEFAULT_MARKER)?.[1] ?? null;
  if (defaultClass && !classes.has(defaultClass)) {
    errors.push(`${file}: unsupported executable-reference default: ${defaultClass}`);
  }
  let open = false;
  for (const [lineIndex, line] of source.split(/\r?\n/u).entries()) {
    if (!line.startsWith('```')) continue;
    if (open) {
      open = false;
      continue;
    }
    open = true;
    if (!EXECUTABLE_FENCE.test(line)) continue;
    const explicitClass = line.match(FENCE_MARKER)?.[1] ?? defaultClass;
    if (!explicitClass) {
      errors.push(
        `${file}:${lineIndex + 1} typed fence requires executable-reference=<class> or a file default`,
      );
    } else if (!classes.has(explicitClass)) {
      errors.push(`${file}:${lineIndex + 1} unsupported executable-reference class: ${explicitClass}`);
    }
  }
  if (open) errors.push(`${file}: unclosed Markdown code fence`);
  return errors;
}

function extractCodeFences(source, defaultClass = null) {
  const fences = [];
  let active = null;
  for (const [lineIndex, line] of source.split(/\r?\n/u).entries()) {
    if (!line.startsWith('```')) {
      if (active) active.lines.push(line);
      continue;
    }
    if (active) {
      fences.push({ ...active, source: active.lines.join('\n') });
      active = null;
      continue;
    }
    const language = line.slice(3).trim().split(/\s+/u)[0]?.toLowerCase() ?? '';
    active = {
      classification: line.match(FENCE_MARKER)?.[1] ?? defaultClass,
      language,
      line: lineIndex + 1,
      lines: [],
    };
  }
  return fences;
}

function typeScriptFenceErrors(fence, file) {
  const isTsx =
    fence.language === 'tsx' ||
    /return\s*\(\s*</u.test(fence.source) ||
    /return\s*</u.test(fence.source) ||
    /=>\s*</u.test(fence.source) ||
    /<[A-Z][A-Za-z0-9.]*(?:\s|>)/u.test(fence.source);
  const result = ts.transpileModule(fence.source, {
    fileName: isTsx ? 'reference.tsx' : 'reference.ts',
    reportDiagnostics: true,
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  return (result.diagnostics ?? [])
    .filter(({ category }) => category === ts.DiagnosticCategory.Error)
    .map((diagnostic) => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      const position =
        diagnostic.file && diagnostic.start !== undefined
          ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
          : null;
      const line = position ? fence.line + position.line + 1 : fence.line;
      return `${file}:${line} TypeScript/TSX syntax: ${message}`;
    });
}

let resolvedBash;

/**
 * Locate a bash able to run `bash -n`.
 *
 * The well-known paths only cover a machine-wide Git install. A user-scoped
 * install lives under the profile directory, so PATH is consulted as a last
 * resort. The PATH candidate is proven to run before being returned, otherwise
 * a missing shell would surface as a fabricated syntax error instead of the
 * honest "unavailable" report.
 */
function bashExecutable() {
  if (resolvedBash !== undefined) return resolvedBash;
  const wellKnown =
    process.platform === 'win32'
      ? [
          'C:\\Program Files\\Git\\bin\\bash.exe',
          'C:\\Program Files\\Git\\usr\\bin\\bash.exe',
        ]
      : ['/bin/bash', '/usr/bin/bash'];
  const explicit = [process.env.SDCOREJS_BASH, process.env.SHELL].filter(
    (candidate) => typeof candidate === 'string' && /bash(?:\.exe)?$/iu.test(candidate),
  );
  resolvedBash = [...explicit, ...wellKnown].find((candidate) => existsSync(candidate)) ?? null;
  if (resolvedBash === null) {
    const probe = spawnSync('bash', ['-c', 'exit 0'], { encoding: 'utf8', windowsHide: true });
    resolvedBash = probe.status === 0 ? 'bash' : null;
  }
  return resolvedBash;
}

async function executableFenceErrors(source, file, { angularTemplates = false } = {}) {
  const errors = [];
  const defaultClass = source.match(DEFAULT_MARKER)?.[1] ?? null;
  for (const fence of extractCodeFences(source, defaultClass)) {
    if (!['executable', 'copy-ready'].includes(fence.classification)) continue;
    if (['typescript', 'ts', 'tsx', 'javascript', 'js'].includes(fence.language)) {
      errors.push(...typeScriptFenceErrors(fence, file));
    } else if (fence.language === 'html' && angularTemplates) {
      const parsed = parseTemplate(fence.source, file, {
        preserveWhitespaces: false,
        enableBlockSyntax: true,
      });
      for (const error of parsed.errors ?? []) {
        errors.push(`${file}:${fence.line} Angular template: ${error.toString()}`);
      }
    } else if (fence.language === 'json') {
      try {
        JSON.parse(fence.source);
      } catch (error) {
        errors.push(`${file}:${fence.line} JSON syntax: ${error.message}`);
      }
    } else if (['bash', 'sh', 'shell'].includes(fence.language)) {
      const bash = bashExecutable();
      if (!bash) {
        errors.push(`${file}:${fence.line} bash -n unavailable`);
        continue;
      }
      const result = spawnSync(bash, ['-n'], {
        encoding: 'utf8',
        input: fence.source,
        windowsHide: true,
      });
      if (result.status !== 0) {
        errors.push(
          `${file}:${fence.line} shell syntax: ${(result.stderr || result.stdout).trim()}`,
        );
      }
    } else if (['yaml', 'yml'].includes(fence.language)) {
      try {
        parseYaml(fence.source);
      } catch (error) {
        errors.push(`${file}:${fence.line} YAML syntax: ${error.message}`);
      }
    }
  }
  return errors;
}

export async function validateExecutableReferenceSource(
  source,
  file = '<source>',
  options = {},
) {
  return [
    ...validateExecutableFenceConvention(source, file),
    ...validateLocalizationPlaceholderContext(source, file),
    ...(await executableFenceErrors(source, file, options)),
  ];
}

export async function validateCanonicalExecutableReferences() {
  const errors = [];
  for (const relativeFile of CANONICAL_EXECUTABLE_REFERENCE_FILES) {
    const source = await readFile(path.join(repoRoot, relativeFile), 'utf8');
    errors.push(
      ...(await validateExecutableReferenceSource(source, relativeFile, {
        angularTemplates: true,
      })),
    );
  }
  for (const absoluteFile of await walkMarkdown(path.join(repoRoot, '_refs', 'angular'))) {
    const relativeFile = path.relative(repoRoot, absoluteFile).replaceAll('\\', '/');
    if (CANONICAL_EXECUTABLE_REFERENCE_FILES.includes(relativeFile)) continue;
    errors.push(
      ...validateLocalizationPlaceholderContext(
        await readFile(absoluteFile, 'utf8'),
        relativeFile,
      ),
    );
  }
  return errors;
}

export async function validateNextjsExecutableReferences() {
  const errors = [];
  for (const relativeFile of CANONICAL_NEXTJS_EXECUTABLE_REFERENCE_FILES) {
    const source = await readFile(path.join(repoRoot, relativeFile), 'utf8');
    errors.push(...(await validateExecutableReferenceSource(source, relativeFile)));
  }
  for (const absoluteFile of await walkMarkdown(
    path.join(repoRoot, '_refs', 'nextjs'),
  )) {
    const relativeFile = path.relative(repoRoot, absoluteFile).replaceAll('\\', '/');
    if (CANONICAL_NEXTJS_EXECUTABLE_REFERENCE_FILES.includes(relativeFile)) continue;
    errors.push(
      ...validateLocalizationPlaceholderContext(
        await readFile(absoluteFile, 'utf8'),
        relativeFile,
      ),
    );
  }
  return errors;
}

async function main() {
  const errors = [
    ...(await validateCanonicalExecutableReferences()),
    ...(await validateNextjsExecutableReferences()),
  ];
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
    return;
  }
  console.log(
    `Executable references valid: ${
      CANONICAL_EXECUTABLE_REFERENCE_FILES.length +
      CANONICAL_NEXTJS_EXECUTABLE_REFERENCE_FILES.length
    } classified files; typed/JSON/shell syntax and localization contexts are valid.`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
