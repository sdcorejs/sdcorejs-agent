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
//
// Cache (never committed): ~/.cache/sdcorejs/core-docs/<version>/...
// Offline: if the network is unavailable it falls back to cache; if neither, it exits non-zero
// with a clear message so the skill degrades (generic Material fallback + alert('TODO')).

import { get as httpsGet } from 'node:https';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';

const SITE = 'https://sdcorejs.github.io/sdcorejs-angular/docs';
const CACHE_ROOT = join(homedir(), '.cache', 'sdcorejs', 'core-docs');

// UTF-8-as-CP1252 mojibake signatures (never valid in clean VN/EN docs).
const MOJIBAKE = /á»|áº|Æ°|Ä‘|Ã¢|Ã©|Ã­|Ã³|Ãº|Ã«|Ã¨|Ã´|Ã£|â€“|â€œ|â€™|â€¦|ï¿½/;

// ── args ───────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
let version, cwd = process.cwd(), doList = false, doPrint = false, comp;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--list') doList = true;
  else if (a === '--print') doPrint = true;
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
        return resolve(httpText(res.headers.location));
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

// Fetch a versioned resource; cache it; on network failure fall back to cache.
async function getCached(version, rel) {
  const dest = join(CACHE_ROOT, version, rel);
  try {
    const text = await httpText(`${SITE}/${version}/${rel}`);
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

// Read the installed Core UI version from the target project (either package name).
function detectInstalledVersion(dir) {
  for (const pkg of ['@sdcorejs/angular', '@sd-angular/core']) {
    const p = join(dir, 'node_modules', pkg, 'package.json');
    if (existsSync(p)) {
      try { return JSON.parse(readFileSync(p, 'utf8')).version; } catch { /* ignore */ }
    }
  }
  // fall back to a declared dependency range (strip ^ ~ etc.)
  const root = join(dir, 'package.json');
  if (existsSync(root)) {
    try {
      const j = JSON.parse(readFileSync(root, 'utf8'));
      const deps = { ...j.dependencies, ...j.devDependencies };
      const range = deps['@sdcorejs/angular'] || deps['@sd-angular/core'];
      const m = range && range.match(/(\d+\.\d+\.\d+)/);
      if (m) return m[1];
      const major = range && range.match(/(\d+)/);
      if (major) return `${major[1]}.0.0`;
    } catch { /* ignore */ }
  }
  return null;
}

async function resolveVersion() {
  if (version) return version;
  const registry = JSON.parse(await httpText(`${SITE}/versions.json`));
  const all = registry.versions.map(v => v.version);
  const installed = detectInstalledVersion(cwd);
  if (installed) {
    const major = installed.split('.')[0];
    const exact = all.find(v => v === installed);
    if (exact) return exact;
    const sameMajor = all.filter(v => v.split('.')[0] === major).sort(cmpDesc);
    if (sameMajor.length) return sameMajor[0];
  }
  return registry.latest || all.sort(cmpDesc)[0];
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
  const v = await resolveVersion();
  const index = JSON.parse(await getCached(v, 'index.json'));

  if (doList || !comp) {
    process.stdout.write(`# @sdcorejs/angular Core UI — ${index.count} docs (v${v})\n`);
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
  const md = await getCached(v, doc.path);
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

main().catch(err => {
  process.stderr.write(`[core-docs-fetch] failed: ${err.message}\n`);
  process.stderr.write('[core-docs-fetch] offline + no cache → skill should fall back to generic Material + alert("TODO").\n');
  process.exit(1);
});
