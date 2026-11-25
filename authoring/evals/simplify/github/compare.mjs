import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { appendFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { automaticRule, candidateChanges, fileHash, git, inventory, installComparisonSkill, runAgent, sha256, suiteRoot, unsafeEntries, validArmDelivery } from '../comparison-runtime.mjs';
import { baselineTests, verifyGithubProject } from './verification.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(here, 'cases.json')));
const { values } = parseArgs({options: {
  repos:{type:'string'}, before:{type:'string'}, after:{type:'string'}, output:{type:'string'},
  cases:{type:'string'}, arms:{type:'string',default:'baseline,before,after,ponytail'}, repetitions:{type:'string',default:'2'},
}});
for (const key of ['repos','before','after','output']) if (!values[key]) throw Error('Missing --' + key);
const cases = values.cases ? values.cases.split(',').map(id=>manifest.cases.find(c=>c.id===id)) : manifest.cases;
const arms = values.arms.split(',');
const repetitions = Number(values.repetitions);
if (cases.some(c=>!c) || new Set(cases).size!==cases.length || new Set(arms).size!==arms.length ||
    arms.some(a=>!['baseline','before','after','ponytail'].includes(a)) || !Number.isInteger(repetitions) || repetitions<1) {
  throw Error('Unknown or duplicate case/arm, or invalid repetition count.');
}
const {SIMPLIFY_OPENCODE_BIN:opencode, SIMPLIFY_PONYTAIL_ROOT:ponytail, SIMPLIFY_MODEL_URL:modelUrl,
  SIMPLIFY_NPM_LIB:npmLibrary, SIMPLIFY_HOST_DEPENDENCIES:hostDependencies} = process.env;
const endpoint = new URL(modelUrl);
if (endpoint.origin !== 'http://127.0.0.1:' + endpoint.port || endpoint.username || endpoint.password || endpoint.pathname!=='/') {
  throw Error('Use an explicit loopback HTTP port for the experiment provider.');
}
const output = path.resolve(values.output);
await mkdir(output,{mode:0o700});
const work = await mkdtemp(path.join(os.tmpdir(),'simp-github-'));
const json = (file,data) => writeFile(file,JSON.stringify(data,null,2)+'\n');
const releases = {};
const repositories = {};
const baselines = {};
const logIn = dir => (name, result) => writeFile(path.join(dir, name + '.log'), result.stdout + '\n' + result.stderr);

async function unpack(key, project) {
  await mkdir(project);
  execFileSync('tar', ['-xf', path.join(work,key+'.tar'), '-C', project]);
}

function projectResources(repo, commonMounts, scenario) {
  const mounts = [...commonMounts,[path.join(repo,'node_modules'),'/work/node_modules']];
  if (scenario.repo === 'link-insight') mounts.push([path.join(repo,'.wxt'),'/work/.wxt']);
  if (scenario.readOnly) mounts.push([path.join(repo,'dist'),'/work/dist']);
  return {mounts, scratchDirs:['/work/node_modules/.vite-temp','/work/node_modules/.vite']};
}

async function install(label) {
  const dir = path.resolve(values[label]);
  const release = JSON.parse(await readFile(path.join(dir,'release-manifest.json')));
  const name = Object.keys(release.artifacts).find(f=>f.endsWith('.tgz'));
  const artifact = path.join(dir,name);
  if (await fileHash(artifact)!==release.artifacts[name]) throw Error('Bad package checksum for '+label);
  const root = path.join(work,label);
  await mkdir(root);
  execFileSync('tar',['-xzf',artifact,'-C',root]);
  const skills = await installComparisonSkill(path.join(root,'package/bin/skills.mjs'),root,path.join(root,'experiment-skills'));
  releases[label] = {commit:release.sourceCommit,packageSha256:release.artifacts[name],installation:skills.mode,
    entrySha256:await fileHash(path.join(skills.bundled,'SKILL.md')),description:skills.description,
    beforeCodeSha256:skills.beforeCode && sha256(skills.beforeCode),fullRuleConfigured:Boolean(skills.config),
    automaticRuleInCatalog:skills.description.includes(automaticRule)};
  return skills;
}

async function trial(scenario, arm, repetition, skills, commonMounts) {
  const dir = path.join(output,`${scenario.id}-${repetition}-${arm}`);
  await mkdir(dir);
  const temp = await mkdtemp(path.join(os.tmpdir(),'simp-gh-trial-'));
  const project = path.join(temp,'project');
  const id = randomUUID();
  const seed = 1009*repetition + manifest.cases.indexOf(scenario);
  const row = {id,case:scenario.id,arm,repetition,seed,status:'harness-error',checks:{}};
  try {
    const repo = path.resolve(values.repos,scenario.repo);
    const {snapshot, baseline} = baselines[scenario.repo];
    await unpack(scenario.repo, project);
    git(project,'init','-q');
    git(project,'add','--','.');
    git(project,'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-qm','Pinned GitHub snapshot');
    await mkdir(path.join(project,'node_modules'));
    for (const dependency of [scenario.repo === 'link-insight' && '.wxt', scenario.readOnly && 'dist'].filter(Boolean)) {
      await mkdir(path.join(project,dependency),{recursive:true});
    }
    const resources = projectResources(repo,commonMounts,scenario);
    const settings = {...manifest,opencode,ponytail,endpoint:endpoint.origin,seed,description:releases[arm]?.description,
      beforeCode:skills[arm]?.beforeCode ?? skills.after.beforeCode,catalogs:Object.values(releases).map(release => release.description)};
    const nativeArm = ['before','after'].includes(arm) ? 'simplify' : arm;
    const run = await runAgent(project,temp,nativeArm,scenario,settings,skills[arm],dir,resources);
    const events = run.events;
    const requests = run.requests.filter(r=>r.userTask && r.coding);
    const delivered = requests[0];
    const expected = validArmDelivery(nativeArm,delivered,Boolean(skills[arm]?.config));
    row.status = run.timedOut ? 'timeout' : run.exitCode!==0 || events.some(e=>e.type==='error') ||
      !requests.some(r=>r.completed && r.httpStatus===200) ? 'host-error' : expected ? 'completed' : 'invalid-delivery';
    row.delivery = {expected,installation:releases[arm]?.installation ?? null,fullRuleConfigured:releases[arm]?.fullRuleConfigured ?? false,automaticRuleInCatalog:releases[arm]?.automaticRuleInCatalog ?? false,
      automaticRuleDelivered:delivered?.simplify ?? false,beforeCodeBodyDelivered:delivered?.beforeCodeBody ?? false,codingRequests:requests.length,first:delivered ?? null};
    row.elapsedMs = run.elapsedMs;
    const steps = events.filter(e=>e.type==='step_finish' && e.part?.tokens).map(e=>e.part.tokens);
    row.tokens = steps.length ? steps.reduce((sum,t)=>({
      input:sum.input+(t.input||0),output:sum.output+(t.output||0),cachedRead:sum.cachedRead+(t.cache?.read||0),
    }),{input:0,output:0,cachedRead:0}) : null;
    const files = await inventory(project);
    if (run.mountpoint) delete files[run.mountpoint];
    row.unsafeFiles = unsafeEntries(files);
    const {changed,diff} = await candidateChanges(project);
    row.changed = changed;
    const writes = run.writes.filter(w=>!['node_modules','dist','.wxt'].some(dir=>w.file===dir||w.file.startsWith(dir+'/')));
    row.writes = writes.map(w=>({...w,at:w.at-run.started}));
    const answer = events.filter(e=>e.type==='text').map(e=>e.part.text).join('\n');
    await writeFile(path.join(dir,'changes.diff'),diff+'\n');
    await writeFile(path.join(dir,'answer.txt'),answer+'\n');
    if (row.status==='completed') {
      row.checks = await verifyGithubProject({project,snapshot,baseline,resources,scenario,changed:row.changed,files}, logIn(dir));
      if (scenario.readOnly) row.checks.scope = row.changed.length === 0 && writes.length === 0;
    }
    const tools = events.filter(e=>e.type==='tool_use' && e.part.tool!=='skill').map(({part})=>({
      tool:part.tool,input:part.state?.input,output:(part.state?.output||part.state?.error||'').slice(-1700),
      status:part.state?.status,exit:part.state?.metadata?.exit,
    })).filter(t=>!/(?:\.(?:agents|opencode)\/|\/vendor\/|SKILL\.md)/i.test(JSON.stringify(t.input)));
    const card = {id,case:scenario.id,prompt:scenario.prompt,assertions:scenario.assertions,answer,diff,tools,checks:row.checks,writes:row.writes};
    const redacted = JSON.stringify(card).replace(/(?:(?:\/work\/)?\.(?:agents|opencode)|\/vendor|\/references)\/[^\s"\\]+|sdcorejs-simplify|ponytail/gi,'[environment]');
    if (row.status==='completed') await writeFile(path.join(dir,'blind.jsonl'),redacted+'\n');
  } catch (error) {
    row.error = String(error.message).slice(0,1500);
    row.status = 'harness-error';
  } finally {
    await json(path.join(dir,'receipt.json'),row);
    await rm(temp,{recursive:true,force:true});
  }
  console.log(scenario.id,repetition,arm,row.status,JSON.stringify(row.checks));
  await appendFile(path.join(output,'progress.jsonl'),JSON.stringify({case:row.case,repetition,arm,status:row.status,checks:row.checks})+'\n');
}

try {
  const version = execFileSync(opencode,['--version'],{encoding:'utf8',env:{HOME:work,PATH:process.env.PATH,OPENCODE_DISABLE_MODELS_FETCH:'true'}}).trim();
  if (version!==manifest.opencode || git(ponytail,'rev-parse','HEAD')!==manifest.ponytail || git(ponytail,'status','--porcelain')) throw Error('Incorrect runtime or plugin revision.');
  const skills = {before:await install('before'),after:await install('after')};
  const commonMounts = [[npmLibrary,'/runner/npm'],[hostDependencies,'/home/runner/.config/opencode']];
  for (const name of ['npm','npx']) {
    const shim = path.join(work,name);
    await writeFile(shim,'#!/bin/sh\nexec /tools/node /runner/npm/bin/'+name+'-cli.js "$@"\n',{mode:0o700});
    commonMounts.push([shim,'/tools/'+name]);
  }
  for (const key of new Set(cases.map(c=>c.repo))) {
    const repo = path.resolve(values.repos,key);
    const spec = manifest.repositories[key];
    if (git(repo,'rev-parse','HEAD')!==spec.revision || git(repo,'status','--porcelain','--untracked-files=no')) throw Error('Dirty or unpinned '+spec.slug);
    git(repo,'archive','--format=tar','--output',path.join(work,key+'.tar'),spec.revision);
    const snapshot = path.join(work,key);
    await unpack(key,snapshot);
    if (unsafeEntries(await inventory(snapshot)).length) throw Error('Pinned snapshot contains non-regular files');
    const baseline = await baselineTests(snapshot,projectResources(repo,commonMounts,{repo:key}),async (_name,res) => {
      await logIn(output)('baseline-'+key,res);
    });
    const baselineBytes = JSON.stringify(baseline,null,2)+'\n';
    await writeFile(path.join(output,'baseline-'+key+'.json'),baselineBytes);
    repositories[key] = {...spec,lockSha256:await fileHash(path.join(snapshot,'package-lock.json')),
      baselineSha256:sha256(baselineBytes),passingAssertions:baseline.passed.length};
    baselines[key] = {snapshot,baseline};
  }
  const runnerFiles = {};
  for (const file of ['comparison-runtime.mjs','comparison-guest.mjs','github/compare.mjs','github/verification.mjs','github/finite-package.mjs','github/finite.spec.ts','github/cache.test.ts']) {
    runnerFiles[file] = await fileHash(path.join(suiteRoot,file));
  }
  await json(path.join(output,'run.json'),{opencode:version,opencodeSha256:await fileHash(opencode),node:process.version,
    ponytail:manifest.ponytail,model:manifest.model,releases,repositories,runnerFiles,arms,repetitions,cases:cases.map(c=>c.id),
    manifestSha256:await fileHash(path.join(here,'cases.json')),expected:arms.length*cases.length*repetitions,
    maxSteps:manifest.maxSteps,timeoutSeconds:manifest.timeoutSeconds,started:new Date().toISOString()});
  for (let rep=1;rep<=repetitions;rep++) for (const [i,scenario] of cases.entries()) {
    for (let j=0;j<arms.length;j++) await trial(scenario,arms[(rep-1+i+j)%arms.length],rep,skills,commonMounts);
  }
} finally {
  await rm(work,{recursive:true,force:true});
}
