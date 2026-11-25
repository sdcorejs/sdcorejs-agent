// Native OpenCode comparison on Linux. See README.md for the frozen setup.
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { appendFile, cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { automaticRule, candidateChanges, fileHash, git, inventory, installComparisonSkill, isTestFile, runAgent, sandbox, sha256, suiteRoot, unsafeEntries, validArmDelivery } from './comparison-runtime.mjs';
import { reportComparison } from './comparison-report.mjs';

const {values} = parseArgs({ options: {
  manifest: { type: 'string', default: path.join(suiteRoot,'comparison-cases.json') },
  arms: { type: 'string', default: 'baseline,simplify,ponytail' }, repetitions: { type: 'string', default: '3' },
  output: { type: 'string' }, cases: { type: 'string' },
}});
if (!values.output) throw new Error('Supply a new --output directory.');
const output = path.resolve(values.output);
const rawManifest = await readFile(values.manifest);
const manifest = JSON.parse(rawManifest);
const arms = values.arms.split(',');
const repetitions = Number(values.repetitions);
const selected = values.cases?.split(',') || manifest.cases.map(c => c.id);
const cases = selected.map(id => {
  const result = manifest.cases.find(c => c.id === id);
  if (!result) throw new Error('Unknown case: '+id);
  return result;
});
if (new Set(arms).size !== arms.length || arms.some(a => !['baseline','simplify','ponytail'].includes(a))
    || !Number.isSafeInteger(repetitions) || repetitions < 1 || new Set(selected).size !== selected.length) throw new Error('Invalid matrix selections.');

function setting(name) {
  if (!process.env[name]) throw new Error('Missing '+name+' (see authoring/evals/simplify/README.md)');
  return path.resolve(process.env[name]);
}
const opencode = setting('SIMPLIFY_OPENCODE_BIN');
const ponytail = setting('SIMPLIFY_PONYTAIL_ROOT');
const preview = setting('SIMPLIFY_PREVIEW');
const playwright = setting('SIMPLIFY_PLAYWRIGHT');
const endpoint = new URL(process.env.SIMPLIFY_MODEL_URL || 'http://127.0.0.1:19481');
if (endpoint.protocol !== 'http:' || endpoint.hostname !== '127.0.0.1' || endpoint.username || endpoint.password) throw new Error('Use a local HTTP model endpoint.');
if (git(ponytail,'rev-parse','HEAD') !== manifest.ponytailRevision || git(ponytail,'status','--porcelain')) throw new Error('Ponytail must be the clean pinned checkout.');
const release = JSON.parse(await readFile(path.join(preview,'release-manifest.json')));
const tarball = Object.keys(release.artifacts).find(name => name.endsWith('.tgz'));
if (!tarball || await fileHash(path.join(preview,tarball)) !== release.artifacts[tarball]) throw new Error('Preview package checksum differs.');
const modelList = await (await fetch(new URL('/v1/models',endpoint))).json();
if (!modelList.data.some(m => m.id === manifest.model)) throw new Error('Pinned local model alias is unavailable.');
if (process.env.SIMPLIFY_MODEL_SHA256 !== manifest.modelSha256) throw new Error('Verify the loaded weights against the manifest SHA-256.');
await mkdir(output, { mode: 0o700 });
const settings = { ...manifest, opencode, ponytail, endpoint: endpoint.origin };
const receipts = [];
const run = { host: os.platform()+' '+os.release(), architecture: os.arch(), cpu: os.cpus()[0]?.model,
  nodeVersion:process.version, bubblewrapVersion:execFileSync('bwrap',['--version'],{encoding:'utf8'}).trim(),
  chromiumVersion:execFileSync('/usr/bin/chromium',['--version'],{encoding:'utf8'}).trim(),
  playwrightVersion:JSON.parse(await readFile(path.join(playwright,'package.json'))).version,
  opencodeVersion: manifest.runtime, opencodeSha256: await fileHash(opencode), ponytailRevision: manifest.ponytailRevision,
  candidateCommit: release.sourceCommit, packageSha256: release.artifacts[tarball], manifestSha256: sha256(rawManifest),
  model: manifest.model, modelArtifact: process.env.SIMPLIFY_MODEL_SHA256 || null, modelServer: await (await fetch(new URL('/props',endpoint))).json(),
  started: new Date().toISOString(), arms, cases: selected, repetitions, timeoutSeconds: settings.timeoutSeconds, maxSteps: settings.maxSteps,
  expected: cases.length * arms.length * repetitions, fixtures: {}, runnerFiles: {},
};
for (const file of ['compare-agents.mjs','comparison-runtime.mjs','comparison-guest.mjs','comparison-oracle.mjs','comparison-report.mjs','consumer-acceptance.mjs','decision-acceptance.mjs']) run.runnerFiles[file] = await fileHash(path.join(suiteRoot,file));
for (const fixture of new Set(cases.map(c => c.fixture))) run.fixtures[fixture] = await inventory(path.join(suiteRoot, fixture));
const writeJSON = (filename,value) => writeFile(filename,JSON.stringify(value,null,2)+'\n');
await writeFile(path.join(output,'cases.json'),rawManifest);
const work = await mkdtemp(path.join(os.tmpdir(),'simp-matrix-'));
try {
  const installed = path.join(work,'install');
  const unpacked = path.join(work,'package');
  execFileSync('tar',['-xzf',path.join(preview,tarball),'-C',work]);
  await mkdir(installed);
  const skills = await installComparisonSkill(path.join(unpacked,'bin/skills.mjs'),installed,path.join(work,'selected'));
  if (!skills.description.includes(automaticRule)) throw new Error('Expected coding guidance is absent from the installed catalog.');
  await readFile(path.join(skills.bundled,'references/simplify/before-writing-code.md'));
  await import(pathToFileURL(path.join(skills.refs,'simplify/simplify-contract.mjs')));
  Object.assign(settings,{description:skills.description,catalogs:[skills.description],beforeCode:skills.beforeCode});
  run.installation = {mode:skills.mode,description:skills.description,configuredFullRule:Boolean(skills.config),beforeCodeSha256:sha256(skills.beforeCode)};
  await writeJSON(path.join(output,'run.json'),run);
  const hostDependencies = process.env.SIMPLIFY_HOST_DEPENDENCIES;
  const resources = hostDependencies ? {mounts:[[path.resolve(hostDependencies),'/home/runner/.config/opencode']]} : {};
  const version = execFileSync(opencode,['--version'],{encoding:'utf8',env:{PATH:process.env.PATH,XDG_DATA_HOME:work,XDG_CONFIG_HOME:work,XDG_STATE_HOME:work,XDG_CACHE_HOME:work,OPENCODE_DISABLE_MODELS_FETCH:'true'}}).trim();
  if (version !== manifest.runtime) throw new Error('OpenCode version mismatch: '+version);
  for (let rep=0; rep<repetitions; rep++) {
    for (const [index,scenario] of cases.entries()) {
      for (let j=0;j<arms.length;j++) {
        const arm = arms[(j+rep+index)%arms.length];
        const name = `${rep+1}-${scenario.id}-${arm}`;
        const seed = parseInt(sha256(`${scenario.id}/${rep+1}`).slice(0, 7), 16);
        const dir = path.join(output,name);
        const temp = await mkdtemp(path.join(os.tmpdir(),'simp-trial-'));
        const project = path.join(temp,'project');
        try {
          await mkdir(dir);
          await cp(path.join(suiteRoot,scenario.fixture),project,{recursive:true});
          git(project,'init','-q'); git(project,'add','--','.');
          git(project,'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-qm','Fixture');
          const before = run.fixtures[scenario.fixture];
          const result = await runAgent(project,temp,arm,scenario,{...settings,seed},skills,dir,resources);
          const after = await inventory(project);
          if (result.mountpoint) delete after[result.mountpoint];
          const changed = [...new Set([...Object.keys(before),...Object.keys(after)])].filter(f=>before[f]!==after[f]).sort();
          const changedFileCount = changed.filter(f => !(after[f] || before[f]).startsWith('directory:')).length;
          const { diff } = await candidateChanges(project);
          await writeFile(path.join(dir,'changes.diff'),diff+'\n');
          const events = result.events;
          const answer = events.filter(e=>e.type==='text').map(e=>e.part?.text||'').join('\n');
          await writeFile(path.join(dir,'answer.txt'),answer);
          const tools = events.filter(e=>e.type==='tool_use').map(({part})=>({
            tool:part.tool, input:part.state?.input, status:part.state?.status, time:part.state?.time,
            exit:part.state?.metadata?.exit, error:part.state?.error, output:(part.state?.output||'').slice(-2500),
          }));
          const tokens = {input:0,output:0,cachedRead:0,cachedWrite:0,reasoning:0};
          const steps = events.filter(e=>e.type==='step_finish' && e.part?.tokens);
          for (const {part:{tokens:t}} of steps) {
            tokens.input+=t.input||0; tokens.output+=t.output||0; tokens.reasoning+=t.reasoning||0;
            tokens.cachedRead+=t.cache?.read||0; tokens.cachedWrite+=t.cache?.write||0;
          }
          const receipt = { blindId:randomUUID(), case:scenario.id, repetition:rep+1, seed, arm, artifact:name,
            packageSha256:run.packageSha256, ponytailRevision:run.ponytailRevision, manifestSha256:run.manifestSha256,
            elapsedMs:result.elapsedMs, tokens:steps.length ? tokens : null, exitCode:result.exitCode,
            changed, changedFileCount, unsafeFiles:unsafeEntries(after).length > 0, status:'completed', checks:{} };
          const decisionRequests = result.requests.filter(r=>r.userTask && r.coding);
          const firstSourceWrite = result.writes.find(w=>/\.(?:[cm]?[jt]sx?|json|html|css)$/.test(w.file) && !isTestFile(w.file));
          const loaded = tools.find(t => t.status==='completed' &&
            ((t.tool==='skill' && t.input?.name==='sdcorejs-simplify') ||
             (t.tool==='read' && /sdcorejs-simplify\/SKILL\.md|before-writing-code\.md/.test(t.input?.filePath || ''))) &&
            (!firstSourceWrite || t.time?.end <= firstSourceWrite.at));
          if (arm==='simplify') receipt.guidance = decisionRequests[0]?.simplify ? 'preloaded' : loaded ? 'read-before-edit' : 'unobserved';
          receipt.expectedSkill = scenario.expectedSkill;
          if (scenario.id === 'H') receipt.originalPaths = Object.keys(before);
          receipt.writes = result.writes;
          receipt.delivery = {fullRuleConfigured:arm==='simplify' && Boolean(skills.config),fullRuleDelivered:decisionRequests[0]?.beforeCodeBody ?? false,requests:decisionRequests.length, first:decisionRequests[0]||null, firstSourceWrite:firstSourceWrite||null};
          if (result.timedOut) receipt.status='timeout';
          else if (result.exitCode !== 0 || events.some(e=>e.type==='error') || !steps.length ||
            !decisionRequests.some(r=>r.httpStatus===200 && r.completed)) receipt.status='host-error';
          else if (!validArmDelivery(arm,decisionRequests[0],arm==='simplify' && Boolean(skills.config)) ||
            arm==='baseline' && decisionRequests.some(r=>r.listed||r.simplify||r.beforeCodeBody||r.ponytail) ||
            arm==='simplify' && decisionRequests.some(r=>r.ponytail)) receipt.status='invalid-arm';
          if (receipt.status==='completed' && !receipt.unsafeFiles) {
            const mounts=[[path.join(suiteRoot,'consumer-acceptance.mjs'),'/runner/invoice.mjs'],[path.join(suiteRoot,'decision-acceptance.mjs'),'/runner/decisions.mjs'],[path.join(suiteRoot,'comparison-oracle.mjs'),'/runner/oracle.mjs']];
            if (scenario.id==='I') mounts.push([playwright,'/runner/playwright']);
            const checks = [['project-tests',['/tools/node','--test','--test-reporter=tap']]];
            if (scenario.id==='A') checks.push(['hidden',['/tools/node','/runner/invoice.mjs','/work']]);
            else if ('BCDEF'.includes(scenario.id)) checks.push(['hidden',['/tools/node','--test-name-pattern','^'+scenario.id+':','/runner/decisions.mjs','/work']]);
            else checks.push(['hidden',['/tools/node','/runner/oracle.mjs',scenario.id,'/work']]);
            for (const [label,command] of checks) {
              const projectTests = label === 'project-tests';
              const check=await sandbox(project,{mounts:projectTests?[]:mounts,command,disposable:projectTests,timeout:45});
              receipt.checks[label]=check.code===0 && !check.timedOut;
              if (projectTests && ['A','C','D','F'].includes(scenario.id)) {
                receipt.requestedTestEvidence = 'changed-test-file-and-nonempty-project-suite';
                receipt.checks['requested-tests'] = changed.some(f=>isTestFile(f) && after[f]?.startsWith('file:'))
                  && /^# tests [1-9]\d*$/m.test(check.stdout);
              }
              await writeFile(path.join(dir,label+'.log'),check.stdout+check.stderr);
            }
          }
          const relativeTime = stamp => Number.isFinite(stamp) ? stamp-result.started : null;
          const visibleTools = tools.filter(t=>t.tool!=='skill' && !/\.(?:agents|opencode)\/|\/vendor\/|SKILL\.md|references\/simplify\//i.test(JSON.stringify(t.input)))
            .map(t=>({...t,time:{start:relativeTime(t.time?.start),end:relativeTime(t.time?.end)}}));
          const blind = {blindId:receipt.blindId,case:scenario.id,prompt:scenario.prompt,assertions:scenario.assertions,answer,changed,diff,
            tools:visibleTools,writes:result.writes.map(w=>({...w,at:relativeTime(w.at)})),checks:receipt.checks,status:receipt.status};
          const redacted=JSON.stringify(blind).replace(/(?:(?:\/work\/)?\.(?:agents|opencode)|\/vendor|\/references)\/[^\s"\\]+|sdcorejs-[\w-]+|ponytail|simplify mode/gi,'[environment]');
          await writeFile(path.join(dir,'blind.json'),redacted+'\n');
          await writeJSON(path.join(dir,'receipt.json'),receipt);
          receipts.push(receipt);
          await appendFile(path.join(output,'progress.jsonl'),JSON.stringify({case:receipt.case,arm,repetition:rep+1,status:receipt.status,checks:receipt.checks,elapsedMs:receipt.elapsedMs})+'\n');
          console.log(name,receipt.status,JSON.stringify(receipt.checks));
        } catch (error) {
          const receipt = { blindId:randomUUID(), case:scenario.id, repetition:rep+1, seed, arm, artifact:name,
            packageSha256:run.packageSha256, ponytailRevision:run.ponytailRevision, manifestSha256:run.manifestSha256,
            status:'harness-error', error:error.message.slice(0,2000), checks:{}, changed:[], writes:[], elapsedMs:null, tokens:null };
          await writeJSON(path.join(dir,'receipt.json'),receipt);
          await writeJSON(path.join(dir,'blind.json'),{ blindId:receipt.blindId,case:scenario.id,status:receipt.status });
          receipts.push(receipt);
          await appendFile(path.join(output,'progress.jsonl'),JSON.stringify({case:scenario.id,arm,status:receipt.status,reason:receipt.error})+'\n');
          console.error(name,receipt.status,receipt.error);
        } finally { await rm(temp,{recursive:true,force:true}); }
      }
    }
  }
  const packets=await Promise.all(receipts.map(r=>readFile(path.join(output,r.artifact,'blind.json'),'utf8')));
  await writeFile(path.join(output,'blind-review.jsonl'),packets.sort().join(''));
  await reportComparison(output);
} finally { await rm(work,{recursive:true,force:true}); }
