import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validateWorkingTree } from '../../_refs/orchestration/parallel-protocol.mjs';
import { classifyTask } from '../../_refs/harness/runtime-policy.mjs';
import { evaluateWorkingTree } from '../../_refs/orchestration/execution-contract.mjs';
import { evaluateGitArtifactDisposition as disposition } from '../../_refs/shared/ship-readiness-contract.mjs';

const task={request:'Fix the confirmed null guard',owned_paths:['component.ts'],behavior_confirmed:true,acceptance_criteria_confirmed:true,verification_confirmed:true};
test('F-005/009: bounded same-change flow preserves dirty baseline and unrelated edits; risk growth escalates', async()=>{
  assert.equal(classifyTask(task).action,'fast-fix');
  assert.equal(classifyTask({...task,changed_surfaces:['permissions']}).action,'full-workflow');
  assert.equal(classifyTask({...task,ambiguous:true}).action,'full-workflow');
  const root=await mkdtemp(path.join(tmpdir(),'audit-flow-'));
  try {
    const source=path.join(root,'component.ts'), unrelated=path.join(root,'notes.md');
    const baseline='// same-change comment\nexport const label = value => value?.name;\n';
    await writeFile(source,baseline);await writeFile(unrelated,'user draft\n');
    const preflight=evaluateWorkingTree({unrelated_dirty_paths:['notes.md'],intended_output_paths:['component.ts']});
    assert.equal(preflight.write_authorized,true);
    const next=baseline.replace('value?.name','value?.name ?? ""');
    if(preflight.write_authorized) await writeFile(source,next);
    const module=await import('data:text/javascript,'+encodeURIComponent(next));
    assert.equal(module.label(null),'');assert.equal(module.label({name:'A'}),'A');
    // Operation rollback retains the captured dirty baseline, never HEAD/reset.
    await writeFile(source,baseline);
    assert.equal(await readFile(source,'utf8'),baseline);
    assert.equal(await readFile(unrelated,'utf8'),'user draft\n');
    assert.equal(evaluateWorkingTree({unrelated_dirty_paths:['component.ts'],intended_output_paths:['component.ts']}).write_authorized,false);
  } finally {await rm(root,{recursive:true,force:true});}
});
const ready={authorized_actions:['local-commit','manual-notes','push','draft-pr','ready-pr'],current_identity:'head+diff',
 hygiene:{status:'READY',associated_identity:'head+diff',blockers:[],artifact_closure:'complete',writes_after_check:false},
 acceptance:{status:'PASS',associated_identity:'head+diff'},commit_created:true,remote_branch_exists:true};
test('F-010: one Git/Ship table distinguishes local, notes, remote draft and ready PR',()=>{
 for(const action of ready.authorized_actions) assert.equal(disposition({...ready,action}).allowed,true,action);
 const deferred={status:'DEFERRED',associated_identity:'head+diff',deferral:{source:'explicit-user-request',reason:'Target service unavailable; user requested draft delivery'}};
 for(const action of ['local-commit','push','draft-pr']) {
   const result=disposition({...ready,action,acceptance:deferred});assert.equal(result.allowed,true);assert.equal(result.completion_claim_allowed,false);assert.equal(result.caveat_required,true);
 }
 assert.equal(disposition({...ready,action:'ready-pr',acceptance:deferred}).allowed,false);
 assert.equal(disposition({...ready,action:'draft-pr',remote_branch_exists:false}).allowed,false);
 assert.equal(disposition({...ready,action:'manual-notes',hygiene:null,acceptance:null}).allowed,true);
});
test('F-010 negative controls: missing consent, stale/dirty evidence and non-waivable hygiene block all Git mutations',()=>{
 for(const action of ['local-commit','push','draft-pr','ready-pr']) for(const patch of [
  {authorized_actions:[]},{authorized_actions:'do-not-push'},{current_identity:'new-diff'},
  {hygiene:{...ready.hygiene,blockers:['secret']}},
  {hygiene:{...ready.hygiene,blockers:['conflict']}},
  {hygiene:{...ready.hygiene,artifact_closure:'incomplete'}},
  {hygiene:{...ready.hygiene,writes_after_check:true}},
  {acceptance:{status:'DEFERRED',associated_identity:'head+diff'}},
  {governed:true,convergence:{status:'PASS',associated_identity:'old-diff',receipt_verified:true}},
 ]) assert.equal(disposition({...ready,...patch,action}).allowed,false,`${action}: ${JSON.stringify(patch)}`);
});

test('review regression: dirty parent/glob overlap and malformed Git flags fail closed',()=>{
 for(const intended of ['.','./','**','src/orders','src/orders/**','src/orders/*.ts','src/orders/./service.ts','src//orders/service.ts']) assert.equal(evaluateWorkingTree({unrelated_dirty_paths:['src/orders/service.ts'],intended_output_paths:[intended]}).write_authorized,false);
 for(const [dirty,intended] of [['order.ts','ord*.ts'],['src/order.ts','src/ord*.ts'],['src/orders/service.ts','src/ord*']]) {assert.equal(evaluateWorkingTree({unrelated_dirty_paths:[dirty],intended_output_paths:[intended]}).write_authorized,false);assert.ok(validateWorkingTree({unrelated_dirty_paths:[dirty],unstaged_paths:[dirty],intended_output_paths:[intended]}).length>0);}
 for(const patch of [{commit_created:'false'},{remote_branch_exists:'false'}]) assert.equal(disposition({...ready,...patch,action:'ready-pr'}).allowed,false);
});

test('parallel preflight shares disjoint dirty policy and preserves overlap denial',()=>{
 assert.deepEqual(validateWorkingTree({unrelated_dirty_paths:['notes.md'],unstaged_paths:['notes.md'],intended_output_paths:['src/orders/service.ts']}),[]);
 for(const scope of ['.','./','**','src/ord*/service.ts','src/orders/**','src/orders/*.ts']) assert.ok(validateWorkingTree({unrelated_dirty_paths:['src/orders/service.ts'],unstaged_paths:['src/orders/service.ts'],intended_output_paths:[scope]}).length>0,scope);
 assert.equal(evaluateWorkingTree({unrelated_dirty_paths:['notes.md'],intended_output_paths:[]}).write_authorized,false);
 assert.ok(validateWorkingTree({unrelated_dirty_paths:['src/orders/service.ts'],unstaged_paths:['src/orders/service.ts'],intended_output_paths:['src/orders/service.ts']}).length>0);
});

test('skill-creator review: directory/glob roots and host case policy agree across execution modes',()=>{
 for (const [dirty,intended,overlap] of [
  ['src','src/**',true], ['src/**','src',true], ['src/','src/**',true],
  ['src/fix.ts','src/**',true], ['src','src/fix.ts',true],
  ['src/fix.ts','src/fix.ts',true], ['docs','src/**',false],
  ['src-old','src/**',false],
 ]) {
  const tree={unrelated_dirty_paths:[dirty],intended_output_paths:[intended]};
  assert.equal(evaluateWorkingTree(tree).write_authorized,!overlap,`${dirty} vs ${intended}`);
  assert.equal(validateWorkingTree(tree).length>0,overlap,`${dirty} vs ${intended}`);
 }
 const tree={unrelated_dirty_paths:['src/Foo.ts'],intended_output_paths:['src/foo.ts']};
 for (const caseInsensitive of [true,false]) {
  assert.equal(evaluateWorkingTree(tree,{caseInsensitive}).write_authorized,!caseInsensitive);
  assert.equal(validateWorkingTree(tree,{caseInsensitive}).length>0,caseInsensitive);
 }
});

test('F-011: identical ticket IDs preserve summarize, comments and requirement output intent',async()=>{
 const {resolveDocumentationAction}=await import('../../_refs/documentation/intent.mjs');
 for(const [action,mode,writes] of [['summarize','summarize',false],['comments','code-documentation',true],['record-requirement','write-requirement',true]])assert.deepEqual(resolveDocumentationAction({requested_action:action,ticket_id:'TASK-123'}),{mode,writes,ticket_id:'TASK-123'});
 assert.deepEqual(resolveDocumentationAction({ticket_id:'TASK-123'}),{mode:'clarify-intent',writes:false,ticket_id:'TASK-123'});
});
