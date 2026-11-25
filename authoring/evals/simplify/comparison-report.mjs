import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const csvField = value => '"' + String(value ?? '').replaceAll('"','""') + '"';
const median = values => {
  const v = [...values].sort((a,b)=>a-b);
  return v.length ? (v[Math.floor((v.length-1)/2)]+v[Math.floor(v.length/2)])/2 : null;
};

export function scopeAllowed(row) {
  if (row.unsafeFiles) return false;
  const touched = [...row.changed, ...(row.writes || []).map(w => w.file)];
  if (['B','E','Q'].includes(row.case)) return touched.length === 0;
  if (row.case === 'H') {
    const outside = row.writes?.some(w => w.file !== 'README.md' && (row.originalPaths || []).includes(w.file));
    return row.changed.length === 1 && row.changed[0] === 'README.md' && !outside;
  }
  return true;
}

export async function reportComparison(output, reviewFile) {
  const run = JSON.parse(await readFile(path.join(output,'run.json')));
  const rows = [];
  for (const folder of await readdir(output,{withFileTypes:true})) {
    if (!folder.isDirectory()) continue;
    const raw = await readFile(path.join(output,folder.name,'receipt.json'),'utf8').catch(e => {
      if(e.code==='ENOENT') return null;
      throw e;
    });
    if (raw) rows.push(JSON.parse(raw));
  }
  const outcomes = new Map();
  if (reviewFile) {
    const validIds = new Set(rows.filter(r=>r.status==='completed').map(r=>r.blindId));
    for (const review of JSON.parse(await readFile(reviewFile,'utf8'))) {
      if (!validIds.has(review.blindId) || outcomes.has(review.blindId) || typeof review.pass !== 'boolean' || !review.reason?.trim())
        throw new Error('Unexpected, duplicate or incomplete blind review: '+review.blindId);
      outcomes.set(review.blindId,review);
    }
  }
  const keys = new Set();
  for (const row of rows) {
    const key=[row.case,row.repetition,row.arm].join('/');
    if (keys.has(key) || !run.cases.includes(row.case) || !run.arms.includes(row.arm) || !Number.isInteger(row.repetition)
        || row.repetition<1 || row.repetition>run.repetitions || row.packageSha256!==run.packageSha256
        || row.manifestSha256!==run.manifestSha256 || row.ponytailRevision!==run.ponytailRevision) throw new Error('Inconsistent receipt: '+key);
    keys.add(key);
    const review=outcomes.get(row.blindId);
    row.verdict=row.status;
    row.inScope = scopeAllowed(row);
    if (row.status==='completed') {
      const required = ['project-tests','hidden'];
      if (['A','C','D','F'].includes(row.case)) required.push('requested-tests');
      if (!row.inScope) row.verdict='fail';
      else if (required.some(k=>typeof row.checks?.[k]!=='boolean')) row.verdict='incomplete-checks';
      else if (required.some(k=>!row.checks[k]) || review?.pass===false) row.verdict='fail';
      else row.verdict=review ? 'pass' : 'awaiting-review';
    }
    row.reason=review?.reason || '';
  }
  const summaries = run.arms.map(arm=>{
    const all=rows.filter(r=>r.arm===arm);
    const measured=all.filter(r=>r.tokens);
    return { arm, attempted:all.length, expected:run.expected/run.arms.length,
      passed:all.filter(r=>r.verdict==='pass').length, failed:all.filter(r=>r.verdict==='fail').length,
      pendingReview:all.filter(r=>r.verdict==='awaiting-review').length, incompleteChecks:all.filter(r=>r.verdict==='incomplete-checks').length,
      infrastructure:all.filter(r=>r.status!=='completed').length,
      expectedDelivery:all.filter(r=>r.status==='completed' && r.expectedSkill && arm==='simplify').length,
      observedDelivery:all.filter(r=>r.status==='completed' && r.expectedSkill && ['preloaded','read-before-edit'].includes(r.guidance)).length,
      tokenCoverage:measured.length, tokens:Object.fromEntries(['input','output','reasoning','cachedRead','cachedWrite'].map(k=>[k,measured.reduce((a,r)=>a+r.tokens[k],0)])),
      medianInput:median(measured.map(r=>r.tokens.input)), medianOutput:median(measured.map(r=>r.tokens.output)),
      medianSeconds:median(all.filter(r=>r.elapsedMs!=null).map(r=>r.elapsedMs/1000)),
      medianChangedFiles:median(all.filter(r=>r.status==='completed').map(r=>r.changedFileCount ?? r.changed.length)) };
  });
  const pairs = [];
  for(const other of run.arms.filter(a=>a!=='simplify')) {
    const counts={against:other,win:0,tie:0,tiePass:0,tieFail:0,loss:0,missing:0};
    for(const id of run.cases) for(let n=1;n<=run.repetitions;n++) {
      const a=rows.find(r=>r.arm==='simplify' && r.case===id && r.repetition===n);
      const b=rows.find(r=>r.arm===other && r.case===id && r.repetition===n);
      if (![a,b].every(r=>['pass','fail'].includes(r?.verdict))) counts.missing++;
      else if(a.verdict===b.verdict) {
        counts.tie++;
        if (a.verdict==='pass') counts.tiePass++;
        else counts.tieFail++;
      }
      else if(a.verdict==='pass') counts.win++;
      else counts.loss++;
    }
    pairs.push(counts);
  }
  rows.sort((a,b)=>a.case.localeCompare(b.case)||a.repetition-b.repetition||a.arm.localeCompare(b.arm));
  const header=['case','repetition','arm','seed','status','verdict','guidance','scope_ok','reason','duration_ms','changed_files','input','output','reasoning','cached_read','cached_write','evidence'];
  const lines=rows.map(r=>[r.case,r.repetition,r.arm,r.seed,r.status,r.verdict,r.guidance,r.inScope,r.reason,r.elapsedMs,r.changed.join(' '),r.tokens?.input,r.tokens?.output,r.tokens?.reasoning,r.tokens?.cachedRead,r.tokens?.cachedWrite,r.artifact]);
  await writeFile(path.join(output,'cases.csv'),[header,...lines].map(r=>r.map(csvField).join(',')).join('\n')+'\n');
  const summary={expected:run.expected,reported:rows.length,reviewCount:outcomes.size,summaries,pairs};
  await writeFile(path.join(output,'summary.json'),JSON.stringify(summary,null,2)+'\n');
  return summary;
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await reportComparison(path.resolve(process.argv[2]),process.argv[3]),null,2));
}
