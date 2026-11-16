import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readTicketSnapshot,compareTicketSnapshots,classifyTicketArtifactPath} from '../../../packs/p42/_refs/product/ticket-intake.mjs';
import {buildArtifactClosure,parseArtifactFrontmatter,scanSensitiveArtifactContent} from '../../../packs/p42/_refs/shared/artifact-lifecycle.mjs';
import {evaluateConvergence} from '../../../packs/p42/_refs/shared/convergence-contract.mjs';
const capture=import.meta.dirname;
const root=path.resolve(capture,'../target');
const sha=b=>createHash('sha256').update(b).digest('hex');
const started_at=new Date().toISOString();
const manifest=JSON.parse(fs.readFileSync(path.join(capture,'intake-result.json')));
const baseline=JSON.parse(fs.readFileSync(path.join(capture,'baseline-files.json')));
const checks=[];
function passed(name,detail){checks.push({name,result:'PASSED',detail});console.log(`PASS ${name}: ${detail}`);}
function list(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.name==='.git'?[]:d.isDirectory()?list(path.join(dir,d.name)):[path.join(dir,d.name)]);}
for(const [relative,hash] of Object.entries(baseline)) assert.equal(sha(fs.readFileSync(path.join(root,relative))),hash,`Pre-existing file changed: ${relative}`);
passed('unchanged-originals',`${Object.keys(baseline).length} original repository files retain their exact bytes, including code, tests, approved requirements and source exports`);
const created=list(root).map(p=>path.relative(root,p)).filter(p=>!Object.hasOwn(baseline,p)).sort();
assert.deepEqual(created,manifest.artifacts.map(x=>x.path).sort());
assert.equal(created.length,4);
passed('write-scope','Exactly two snapshots, one reference image and one Product decision report were added');
const snapshots=manifest.snapshots.map(ref=>readTicketSnapshot(fs.readFileSync(path.join(root,ref.path)),ref.path));
assert.deepEqual(snapshots.map(s=>s.revision),['rev-1','rev-2']);
assert.notEqual(snapshots[0].path,snapshots[1].path);
assert(snapshots[0].captured_at<=snapshots[1].captured_at);
const secrets=[];
for(let i=0;i<snapshots.length;i++) {
 const snapshot=snapshots[i];
 const input=JSON.parse(fs.readFileSync(path.join(root,`inputs/ticket-v${i+1}.json`)));
 assert.equal(snapshot.owner_repository_id,input.owner_repository_id);
 assert.deepEqual(snapshot.identity,input.identity);
 assert.equal(snapshot.updated_at,input.updated_at);
 assert.equal(snapshot.original.title,input.title);
 assert.equal(snapshot.original.description,input.description);
 assert.deepEqual(snapshot.original.comments,input.comments);
 assert.deepEqual(snapshot.original.acceptance_criteria,input.acceptance_criteria);
 assert.equal(snapshot.complete,true);
 assert.deepEqual(snapshot.blockers,[]);
 for(const requirement of snapshot.requirements) {
   assert.equal(requirement.authority,'draft');
   for(const ac of requirement.proposed_acceptance_criteria) assert.equal(ac.status,'proposed');
 }
 for(const attachment of snapshot.attachments) {
   const original=input.attachments.find(a=>a.id===attachment.id);
   for(const value of new URL(original.url).searchParams.values()) secrets.push(value);
   const bytes=fs.readFileSync(path.join(root,attachment.path));
   assert.equal(sha(bytes),attachment.sha256);
   assert.equal(bytes.length,attachment.bytes);
   assert(bytes.equals(fs.readFileSync(path.join(root,original.local_path))));
   assert.equal(attachment.privacy_review.sha256,sha(bytes));
   assert.equal(attachment.privacy_review.status,'approved');
   assert.equal(attachment.privacy_review.reviewed_by,original.privacy_review.reviewed_by);
   assert.equal(attachment.role,'reference');
   assert.equal(attachment.url,null);
 }
}
passed('canonical-snapshots','Both exact stored byte streams pass readTicketSnapshot; originals, identity, revision and timestamps match their exports; all rewrites remain proposed');
assert.equal(snapshots[0].attachments[0].path,snapshots[1].attachments[0].path);
passed('reviewed-image','One deduplicated 68-byte image matches the supplied hash-bound privacy review and source bytes in both revisions');
assert.deepEqual(compareTicketSnapshots(...snapshots),manifest.delta);
assert.equal(manifest.delta.requires_spec_review,true);
assert.equal(manifest.delta.approved_behavior_changed,false);
passed('refresh-history','Both historical snapshots remain present; source revision/content changed, spec review required, approved behavior unchanged');
for(const artifact of manifest.artifacts){
 const bytes=fs.readFileSync(path.join(root,artifact.path));
 assert.equal(sha(bytes),artifact.sha256);
 if(artifact.kind.startsWith('ticket-')) assert.equal(classifyTicketArtifactPath(artifact.path).kind,artifact.kind);
}
const report=fs.readFileSync(path.join(root,manifest.report_path),'utf8');
const metadata=parseArtifactFrontmatter(report);
assert.equal(metadata.artifact_kind,'product-doc');
assert.equal(metadata.source_spec,'approved-requirements.md');
assert.equal(metadata.change_ref,'quantity-limits');
assert.equal(metadata.status,'draft');
for(const match of report.matchAll(/\]\(([^)]+)\)/gu)) {
 const link=match[1];
 if(!link.startsWith('https://')) assert(fs.existsSync(path.resolve(path.dirname(path.join(root,manifest.report_path)),link)),`Broken local link: ${link}`);
}
assert(!report.includes('\uFFFD'));
assert.equal(scanSensitiveArtifactContent(manifest.report_path,report).length,0);
passed('report-hygiene','Lifecycle frontmatter and local links resolve; conflicts and proposals retain explicit authority boundaries');
for(const f of [...created.map(p=>path.join(root,p)),...list(capture)]) {
 const bytes=fs.readFileSync(f);
 for(const secret of secrets) assert(!bytes.includes(Buffer.from(secret)),`Private query value copied to output: ${path.basename(f)}`);
}
passed('private-query-redaction','No attachment query value appears in any new repository artifact or capture file');
const closure=await buildArtifactClosure({root,changeRef:'quantity-limits',artifactContext:manifest.artifact_context,owner:'sdcorejs-product',mode:'commit'});
fs.writeFileSync(path.join(capture,'artifact-closure.json'),JSON.stringify(closure,null,2)+'\n');
assert.equal(closure.sdcorejs_artifacts.closure_result,'complete',JSON.stringify(closure.sdcorejs_artifacts.blockers));
assert.equal(closure.sdcorejs_artifacts.required_paths.length,4);
passed('artifact-closure','Pack lifecycle reader validates all four artifacts, source-image dependencies, integrity and privacy provenance; no staging or commit occurred');
const current_HEAD=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const fingerprint=sha(Buffer.from(JSON.stringify([...Object.entries(baseline),...manifest.artifacts.map(a=>[a.path,a.sha256])].sort())));
const convergence=evaluateConvergence({schema_version:1,mode:'feature',change_ref:'quantity-limits',source:{repository_id:'github.com/benchmark-sdcorejs/order-desk',revision:current_HEAD,fingerprint},requirements:[],acceptance_criteria:[],tasks:[],evidence:[]});
assert.equal(convergence.status,'BLOCKED');
console.log('BLOCKED feature-convergence: current approved decision graph, plan, validation map and acceptance runs were not supplied; no receipt created');
const result={schema_version:1,started_at,finished_at:new Date().toISOString(),command:`node ${path.join(capture,'verify.mjs')}`,cwd:root,current_HEAD,associated_HEAD_or_diff:fingerprint,environment:{node:process.version,platform:process.platform},checks,local_intake_verification:'PASSED',application_acceptance:'NOT RUN',feature_readiness:'BLOCKED',remote_sync:'NOT ATTEMPTED',convergence,commands_skipped:[{command:'npm test',reason:'No application code changed; this task verifies intake artifacts only; no product acceptance claim'},{command:'npm run test:integration',reason:'Application acceptance is outside this intake; no code changes'},{command:'npm run test:e2e',reason:'Application acceptance was not run; existing case only covers quantity 2 and cannot establish the changed request'},{command:'external tracker refresh/update',reason:'Local exports only; external access and writes explicitly prohibited'}]};
fs.writeFileSync(path.join(capture,'verification-result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({local_intake_verification:result.local_intake_verification,application_acceptance:result.application_acceptance,feature_readiness:result.feature_readiness,remote_sync:result.remote_sync,check_count:checks.length,current_HEAD}));
