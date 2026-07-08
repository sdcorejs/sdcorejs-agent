#!/usr/bin/env node
// On-demand Core UI doc fetcher for `@sdcorejs/angular` (or the legacy `@sd-angular/core`).
//
// The angular skills do NOT commit the Core UI component docs into this repo. Instead they
// pull the PUBLISHED docs at generation time — raw (never summarized), version-matched to the
// target project's installed package, and cached per version so repeated use is cheap/offline.
//
// Source of truth: https://sdcorejs.github.io/sdcorejs-angular/docs
//   - versions.json            → which versions are published (per Angular major 19/20/21)
//   - <version>/index.json     → the component inventory (what exists)
//   - <version>/<path>.md      → one component's full API doc
//
// Usage (run from inside the target Angular project so version auto-detects, or pass --version):
//   node core-docs-fetch.mjs --list                          # print the Core UI inventory
//   node core-docs-fetch.mjs sd-button                       # fetch one doc → print cached file path
//   node core-docs-fetch.mjs components/button/sd-button     # full id/path also works
//   node core-docs-fetch.mjs --print sd-select               # print the doc CONTENT to stdout
//   node core-docs-fetch.mjs --version 21.0.7 --list
//   node core-docs-fetch.mjs --cwd <target> --require-installed --list
//
// Cache (never committed): ~/.cache/sdcorejs/core-docs/<version>/...
// Offline: if the network is unavailable it falls back to cache; if neither, it exits non-zero
// with a clear message so the skill uses local Core UI evidence only. `--require-installed`
// fails before network/cache if the target project has no Core UI dependency.

import { get as httpsGet } from 'node:https';
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname, isAbsolute, normalize } from 'node:path';
import { pathToFileURL } from 'node:url';

const SITE = 'https://sdcorejs.github.io/sdcorejs-angular/docs';
const SITE_ORIGIN = new URL(SITE).origin;
const CACHE_ROOT = join(homedir(), '.cache', 'sdcorejs', 'core-docs');
const CORE_UI_PACKAGES = ['@sdcorejs/angular', '@sd-angular/core'];

// UTF-8-as-CP1252 mojibake signatures (never valid in clean VN/EN docs).
// Stored as escapes so this reusable script stays ASCII and locale-neutral.
const MOJIBAKE_PATTERNS = [
  '\u00e1\u00bb',
  '\u00e1\u00ba',
  '\u00c6\u00b0',
  '\u00c4\u2018',
  '\u00c3\u00a2',
  '\u00c3\u00a9',
  '\u00c3\u00ad',
  '\u00c3\u00b3',
  '\u00c3\u00ba',
  '\u00c3\u00ab',
  '\u00c3\u00a8',
  '\u00c3\u00b4',
  '\u00c3\u00a3',
  '\u00e2\u20ac\u201c',
  '\u00e2\u20ac\u0153',
  '\u00e2\u20ac\u2122',
  '\u00e2\u20ac\u00a6',
  '\u00ef\u00bf\u00bd',
];
const MOJIBAKE = new RegExp(MOJIBAKE_PATTERNS.join('|'));

// ── args ───────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
let version, cwd = process.cwd(), doList = false, doPrint = false, requireInstalled = false, comp;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--list') doList = true;
  else if (a === '--print') doPrint = true;
  else if (a === '--require-installed') requireInstalled = true;
  else if (a === '--version') version = args[++i];
  else if (a === '--cwd') cwd = args[++i];
  else if (!a.startsWith('--') && !comp) comp = a;
}

const cmpDesc = (a, b) => {
  const pa = a.split('-')[0].split('.').map(Number);
  const pb = b.split('-')[0].split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((pb[i] || 0) !== (pa[i] || 0)) return (pb[i] || 0) - (pa[i] || 0);
  return 0;
};

function httpText(url) {
  return new Promise((resolve, reject) => {
    httpsGet(url, res => {
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        res.resume();
        if (!res.headers.location) return reject(new Error(`HTTP ${res.statusCode} without Location for ${url}`));
        const nextUrl = new URL(res.headers.location, url);
        if (nextUrl.origin !== SITE_ORIGIN) {
          return reject(new Error(`Refusing redirect outside docs origin: ${nextUrl.href}`));
        }
        return resolve(httpText(nextUrl.href));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

function readJson(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return null; }
}

function versionFromRange(range) {
  if (!range || typeof range !== 'string') return null;
  const exact = range.match(/(\d+\.\d+\.\d+)/);
  if (exact) return exact[1];
  const major = range.match(/(\d+)/);
  return major ? `${major[1]}.0.0` : null;
}

function versionFromPackageJson(file) {
  return packageFromPackageJson(file)?.version ?? null;
}

function packageFromPackageJson(file) {
  const j = readJson(file);
  if (!j) return null;
  const deps = { ...j.dependencies, ...j.devDependencies, ...j.peerDependencies, ...j.optionalDependencies };
  for (const name of CORE_UI_PACKAGES) {
    if (deps[name]) return { name, version: versionFromRange(deps[name]) };
  }
  return null;
}

function walkPackageJsons(root, depth = 4, acc = []) {
  if (depth < 0) return acc;
  let entries;
  try { entries = readdirSync(root, { withFileTypes: true }); } catch { return acc; }
  for (const entry of entries) {
    const full = join(root, entry.name);
    if (entry.isFile() && entry.name === 'package.json') {
      acc.push(full);
      continue;
    }
    if (!entry.isDirectory()) continue;
    if (['node_modules', '.git', 'dist', 'coverage', '.angular', '.cache'].includes(entry.name)) continue;
    walkPackageJsons(full, depth - 1, acc);
  }
  return acc;
}

function versionFromPackageJsons(root) {
  return packageFromPackageJsons(root)?.version ?? null;
}

function packageFromPackageJsons(root) {
  const rootPkg = join(root, 'package.json');
  const direct = packageFromPackageJson(rootPkg);
  if (direct) return direct;
  for (const pkg of walkPackageJsons(root)) {
    const found = packageFromPackageJson(pkg);
    if (found) return found;
  }
  return null;
}

function versionFromPackageLock(root) {
  return packageFromPackageLock(root)?.version ?? null;
}

function packageFromPackageLock(root) {
  const lock = readJson(join(root, 'package-lock.json'));
  if (!lock) return null;
  for (const name of CORE_UI_PACKAGES) {
    const entry = lock.packages?.[`node_modules/${name}`] || lock.dependencies?.[name];
    if (entry?.version) return { name, version: entry.version };
  }
  return null;
}

function versionFromTextLock(root) {
  return packageFromTextLock(root)?.version ?? null;
}

function packageFromTextLock(root) {
  for (const file of ['pnpm-lock.yaml', 'yarn.lock']) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, 'utf8');
    const direct = text.match(/(@sdcorejs\/angular|@sd-angular\/core)[^\n\d]*(\d+\.\d+\.\d+)/);
    if (direct) return { name: direct[1], version: direct[2] };
    const quoted = text.match(/(@sdcorejs\/angular|@sd-angular\/core)[^@\n]*@(?:npm:)?(\d+\.\d+\.\d+)/);
    if (quoted) return { name: quoted[1], version: quoted[2] };
  }
  return null;
}

// Fetch `${SITE}/<rel>`; cache at `${CACHE_ROOT}/<rel>`; on network failure fall back to cache.
// `rel` is the full path under the docs site (e.g. `versions.json`, `21.0.7/index.json`).
async function getCached(rel) {
  const dest = safeCachePath(rel);
  try {
    const text = await httpText(`${SITE}/${rel}`);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, text, 'utf8');
    return text;
  } catch (err) {
    if (existsSync(dest)) {
      process.stderr.write(`[core-docs-fetch] offline; using cached ${rel}\n`);
      return readFileSync(dest, 'utf8');
    }
    throw err;
  }
}

function safeCachePath(rel) {
  if (!rel || typeof rel !== 'string') {
    throw new Error('Invalid empty docs cache path');
  }
  if (rel.includes('\\') || isAbsolute(rel) || /^[a-zA-Z]:/.test(rel)) {
    throw new Error(`Unsafe docs cache path: ${rel}`);
  }
  const normalized = normalize(rel).replaceAll('\\', '/');
  if (normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) {
    throw new Error(`Unsafe docs cache path: ${rel}`);
  }
  return join(CACHE_ROOT, normalized);
}

// Read the installed Core UI package from the target project (either package name).
export function detectInstalledPackage(dir) {
  for (const name of CORE_UI_PACKAGES) {
    const p = join(dir, 'node_modules', name, 'package.json');
    if (existsSync(p)) {
      try { return { name, version: JSON.parse(readFileSync(p, 'utf8')).version }; } catch { /* ignore */ }
    }
  }
  return packageFromPackageLock(dir) || packageFromTextLock(dir) || packageFromPackageJsons(dir);
}

// Read the installed Core UI version from the target project (either package name).
export function detectInstalledVersion(dir) {
  return detectInstalledPackage(dir)?.version ?? null;
}

// Version dirs already present in the cache (each with an index.json), newest first.
// The offline fallback when the registry itself can't be loaded (e.g. cache was seeded by an
// older script that never persisted versions.json).
function listCachedVersions() {
  try {
    return readdirSync(CACHE_ROOT, { withFileTypes: true })
      .filter(e => e.isDirectory() && /^\d+\.\d+\.\d+/.test(e.name))
      .map(e => e.name)
      .filter(v => existsSync(join(CACHE_ROOT, v, 'index.json')))
      .sort(cmpDesc);
  } catch { return []; }
}

// Order published versions best-first for a wanted version (the nearest-version policy):
// exact → newest patch of the SAME major → nearest OTHER major (by major distance, then newest
// patch). Falls back to newest-overall ordering when nothing is wanted. The caller tries each in
// turn and uses the first whose docs actually download, so an unfetchable version is skipped.
function orderCandidates(all, want) {
  const sorted = [...all].sort(cmpDesc); // newest first overall
  if (!want) return sorted;
  const wantMajor = Number(want.split('.')[0]);
  const exact = sorted.filter(v => v === want);
  const sameMajor = sorted.filter(v => v !== want && Number(v.split('.')[0]) === wantMajor); // newest patch first
  const otherMajor = sorted
    .filter(v => Number(v.split('.')[0]) !== wantMajor)
    .sort((a, b) => {
      const da = Math.abs(Number(a.split('.')[0]) - wantMajor);
      const db = Math.abs(Number(b.split('.')[0]) - wantMajor);
      return da - db || cmpDesc(a, b); // nearest major, then newest patch within it
    });
  return [...exact, ...sameMajor, ...otherMajor];
}

// Resolve an ORDERED list of candidate versions (best first) to try.
async function resolveVersionCandidates() {
  const installedPackage = detectInstalledPackage(cwd);
  if (requireInstalled && !installedPackage) {
    throw new Error(
      `Core UI package not installed in ${cwd}. Expected one of: ${CORE_UI_PACKAGES.join(', ')}. ` +
      'Classify this target as plain-angular or run an approved Core UI migration first.'
    );
  }
  const wantedVersion = version || installedPackage?.version;

  // Load the published registry — cached, so version resolution survives offline use.
  let registry;
  try {
    registry = JSON.parse(await getCached('versions.json'));
  } catch (err) {
    // No network AND no cached registry. Resolve against version dirs already in the cache
    // (e.g. seeded by an older script that never persisted versions.json) so --list still works.
    const cached = listCachedVersions();
    if (!cached.length) {
      if (version) return [version]; // trust the literal; getCached will fail clearly
      throw err;
    }
    process.stderr.write('[core-docs-fetch] no remote registry; using cached docs versions.\n');
    return orderCandidates(cached, wantedVersion);
  }
  const all = registry.versions.map(v => v.version);
  // Target the explicit --version if given, else the project's installed Core UI version.
  // Resolution: exact published patch → newest patch of SAME major → nearest OTHER major → latest.
  // (The docs registry publishes only some patches, so a literal pin like 20.0.1 may not exist as a
  // docs build even though it's a valid npm pin — the nearest-version policy bridges that.)
  const want = wantedVersion;
  const ordered = orderCandidates(all, want);
  if (registry.latest && !ordered.includes(registry.latest)) ordered.push(registry.latest);
  return ordered.length ? ordered : all.sort(cmpDesc);
}

// Match a user-supplied component token against the index entries.
function resolveDoc(index, token) {
  const t = token.replace(/\.md$/, '');
  const docs = index.docs;
  return (
    docs.find(d => d.id === t || d.path === token) ||
    docs.find(d => d.id.endsWith('/' + t)) ||
    docs.find(d => d.id.split('/').pop() === t) ||
    docs.find(d => d.title.replace(/[`<>]/g, '') === t) ||
    docs.find(d => d.id.includes(t))
  );
}

async function main() {
  // Try candidate versions best-first; use the first whose index.json actually downloads.
  // This is the nearest-version fallback: a pinned version with no published/fetchable docs
  // falls through to the nearest one that can be pulled.
  const candidates = await resolveVersionCandidates();
  let v, index;
  for (const cand of candidates) {
    try {
      index = JSON.parse(await getCached(`${cand}/index.json`));
      v = cand;
      break;
    } catch (err) {
      process.stderr.write(`[core-docs-fetch] skipping docs version ${cand}: ${err.message}\n`);
    }
  }
  if (!index) throw new Error(`no fetchable docs version among: ${candidates.join(', ')}`);

  if (doList || !comp) {
    process.stdout.write(`# Core UI docs version: ${v}\n`);
    process.stdout.write(`# Index: ${SITE}/${v}/index.json\n`);
    const byCat = {};
    for (const d of index.docs) (byCat[d.category] ||= []).push(d);
    for (const cat of Object.keys(byCat).sort()) {
      process.stdout.write(`\n## ${cat}\n`);
      for (const d of byCat[cat].sort((a, b) => a.id.localeCompare(b.id))) {
        process.stdout.write(`- ${d.title}  (${d.id})\n`);
      }
    }
    process.stdout.write(`\n# Fetch one: node core-docs-fetch.mjs <id>  (e.g. sd-button)\n`);
    return;
  }

  const doc = resolveDoc(index, comp);
  if (!doc) {
    process.stderr.write(`[core-docs-fetch] no Core UI doc matches "${comp}" in v${v}. Run --list.\n`);
    process.exit(2);
  }
  const md = await getCached(`${v}/${doc.path}`);
  if (MOJIBAKE.test(md)) {
    process.stderr.write(`[core-docs-fetch] MOJIBAKE in upstream ${doc.path} (v${v}); fix at source. Not using it.\n`);
    process.exit(3);
  }
  if (doPrint) {
    process.stdout.write(md);
  } else {
    process.stdout.write(join(CACHE_ROOT, v, doc.path) + '\n');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    process.stderr.write(`[core-docs-fetch] failed: ${err.message}\n`);
    process.stderr.write('Run from the target Angular project or pass --cwd <target-project>. If remote docs are unavailable, seed the cache or use local project evidence.\n');
    process.exit(1);
  });
}
