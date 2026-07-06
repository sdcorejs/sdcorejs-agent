#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

if (args.length > 1) {
  console.error('Usage: node scripts/check-text-hygiene.mjs [root]');
  process.exit(2);
}

const root = path.resolve(args[0] ?? repoRoot);

const ignoredDirs = new Set([
  '.git',
  '.tmp',
  'coverage',
  'dist',
  'node_modules',
]);

const textExtensions = new Set([
  '.cmd',
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mdc',
  '.mjs',
  '.ps1',
  '.scss',
  '.sh',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);

const textFilenames = new Set([
  '.clinerules',
  '.gitattributes',
  '.gitignore',
  'AGENTS.md',
  'CLAUDE.md',
  'Dockerfile',
  'LICENSE',
]);

const hiddenFormatNames = new Map([
  [0x00ad, 'SOFT HYPHEN'],
  [0x061c, 'ARABIC LETTER MARK'],
  [0x200b, 'ZERO WIDTH SPACE'],
  [0x200c, 'ZERO WIDTH NON-JOINER'],
  [0x200d, 'ZERO WIDTH JOINER'],
  [0x200e, 'LEFT-TO-RIGHT MARK'],
  [0x200f, 'RIGHT-TO-LEFT MARK'],
  [0x202a, 'LEFT-TO-RIGHT EMBEDDING'],
  [0x202b, 'RIGHT-TO-LEFT EMBEDDING'],
  [0x202c, 'POP DIRECTIONAL FORMATTING'],
  [0x202d, 'LEFT-TO-RIGHT OVERRIDE'],
  [0x202e, 'RIGHT-TO-LEFT OVERRIDE'],
  [0x2060, 'WORD JOINER'],
  [0x2066, 'LEFT-TO-RIGHT ISOLATE'],
  [0x2067, 'RIGHT-TO-LEFT ISOLATE'],
  [0x2068, 'FIRST STRONG ISOLATE'],
  [0x2069, 'POP DIRECTIONAL ISOLATE'],
  [0xfeff, 'BYTE ORDER MARK'],
]);

main().catch((error) => {
  console.error(error?.stack ?? String(error));
  process.exit(1);
});

async function main() {
  const files = (await listCandidateFiles(root)).filter(isTextCandidate);
  const findings = [];

  await Promise.all(files.map(async (file) => {
    const text = await readFile(file, 'utf8');
    findings.push(...scanText(file, text));
  }));

  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);

  if (findings.length > 0) {
    console.error('Text hygiene check failed. Remove hidden/control/bidi Unicode characters:');
    for (const finding of findings) {
      console.error(
        `  ${toDisplayPath(finding.file)}:${finding.line}:${finding.column} ${toCode(finding.code)} ${finding.name} (${finding.kind})`
      );
    }
    process.exit(1);
  }

  console.log(`Text hygiene check passed (${files.length} file(s) scanned).`);
}

async function listCandidateFiles(targetRoot) {
  const tracked = await listGitTrackedFiles(targetRoot);
  if (tracked) return tracked.map((file) => path.join(targetRoot, file));
  return listFiles(targetRoot);
}

async function listGitTrackedFiles(targetRoot) {
  return new Promise((resolve) => {
    execFile('git', ['-C', targetRoot, 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'buffer' }, (error, stdout) => {
      if (error) {
        resolve(null);
        return;
      }

      const files = stdout
        .toString('utf8')
        .split('\0')
        .filter(Boolean);
      resolve(files);
    });
  });
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(entries.map(async (entry) => {
    if (ignoredDirs.has(entry.name)) return [];

    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(entryPath);
    return entry.isFile() ? [entryPath] : [];
  }));
  return nested.flat();
}

function isTextCandidate(file) {
  const base = path.basename(file);
  if (textFilenames.has(base)) return true;
  return textExtensions.has(path.extname(base).toLowerCase());
}

function scanText(file, text) {
  const findings = [];
  let line = 1;
  let column = 1;

  for (let index = 0; index < text.length;) {
    const code = text.codePointAt(index);
    const char = String.fromCodePoint(code);
    const finding = classifyCodePoint(code, index);

    if (finding) {
      findings.push({
        file,
        line,
        column,
        code,
        ...finding,
      });
    }

    if (char === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }

    index += char.length;
  }

  return findings;
}

function classifyCodePoint(code, index) {
  if (isAllowedWhitespace(code)) return null;

  if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) {
    return {
      kind: 'control character',
      name: 'CONTROL CHARACTER',
    };
  }

  if (code === 0xfeff && index === 0) return null;

  if (hiddenFormatNames.has(code)) {
    const isBidi = code === 0x061c || code === 0x200e || code === 0x200f || (code >= 0x202a && code <= 0x202e) || (code >= 0x2066 && code <= 0x2069);
    return {
      kind: isBidi ? 'bidirectional control' : 'hidden format character',
      name: hiddenFormatNames.get(code),
    };
  }

  return null;
}

function isAllowedWhitespace(code) {
  return code === 0x09 || code === 0x0a || code === 0x0d;
}

function toDisplayPath(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function toCode(code) {
  return `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
}
