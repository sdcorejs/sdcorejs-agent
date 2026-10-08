import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, realpath, rm, lstat, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scanCleanup, freezeCleanupPlan, applyCleanupPlan, restoreCleanup } from '../../_refs/cleanup/cleanup-engine.mjs';
import { approveCleanupPlan, approveCleanupRestore } from '../../_refs/cleanup/cleanup-contract.mjs';
import { inspectCleanupPosixCapabilities } from '../../_refs/cleanup/posix-file-operation.mjs';

const availableOS = ['linux','darwin'].includes(process.platform);
const nativeOnly = { skip: availableOS ? false : 'Required Linux/macOS native execution is NOT_RUN on this Windows host.' };
const task = { id: 'posix-native-fixture', status: 'completed', durable_finalized: true };
const owned = '.sdcorejs/tmp/task';

async function setup(t, contents = 'reproducible fixture') {
  // A real POSIX run requires an explicitly selected trusted local fixture parent.
  const base = process.env.SDCOREJS_CLEANUP_POSIX_FIXTURE_ROOT;
  const python = process.env.SDCOREJS_CLEANUP_PYTHON;
  assert.ok(base && path.isAbsolute(base), 'Select a trusted ext4/APFS fixture parent; do not use an untrusted /tmp ancestor.');
  assert.ok(python && path.isAbsolute(python), 'Select an already installed absolute CPython executable; no installation is performed.');
  const parent = await realpath(base); const root = await realpath(await mkdtemp(path.join(parent, 'sdcorejs-posix-fixture-')));
  t.after(async () => { assert.equal(path.dirname(root),parent); assert.match(path.basename(root),/^sdcorejs-posix-fixture-/u); assert.equal((await lstat(root)).isSymbolicLink(),false); await rm(root,{recursive:true,force:true}); });
  await mkdir(path.join(root,owned),{recursive:true});
  const relative = `${owned}/output.html`; await writeFile(path.join(root,relative),contents);
  const capabilities = await inspectCleanupPosixCapabilities({root,python});
  assert.equal(capabilities.supported,true,JSON.stringify(capabilities));
  const maintenance = { root_id: root, task_id: task.id, generation: 'native-fixture-epoch', source: 'conversation', owner: 'isolated-fixture-owner',
    attestation: 'All isolated fixture producers have finished; setup handles/children are closed and no external writer is admitted.',
    participants: [{ id: 'fixture-setup', state: 'quiescent', evidence: 'Awaited fixture writes before analysis.', writable_descriptors_closed: true, children_quiescent: true }],
    fence_path: '.sdcorejs/tmp/cleanup-runtime/posix-maintenance.lock' };
  const boundary = { version:'posix-maintenance-v1',root_id:root,python:capabilities.python,helper_sha256:capabilities.helper_sha256,profile:capabilities.profile,maintenance };
  const evidence = { [relative]: { owner:'fixture-producer',task_id:task.id,producer_status:'finished',reproducible:true,needed_for_evidence:false,evidence:['Exact fixture was written from declared contents and producer closed.'] } };
  const analysis = await scanCleanup({root,scope:[owned],task,evidence});
  return {root,relative,analysis,boundary,maintenance,evidence,task};
}
const approval = plan => approveCleanupPlan(plan,{source:'conversation',decision:'approve',authority:'mutation',action_ids:plan.actions.map(a=>a.id)});
const present = async absolute => { try { await access(absolute);return true; } catch(error){if(error.code==='ENOENT')return false;throw error;} };

test('real POSIX native operations require a supported target; Windows supplies no Linux/macOS acceptance evidence', {skip:availableOS ? false : 'Required Linux/macOS native execution is NOT_RUN on this Windows host.'}, async t => {
  for (const operation of ['delete','quarantine','archive']) {
    await t.test(operation,async t => {
      const context = await setup(t); const destination = operation==='archive' ? 'archive/output.html' : undefined;
      const plan = freezeCleanupPlan(context.analysis,{actions:[{path:context.relative,action:operation,destination}],posix_boundary:context.boundary});
      const receipt = await applyCleanupPlan({...context,plan,approval:approval(plan)});
      assert.equal(receipt.status,'applied',JSON.stringify(receipt)); assert.equal(await present(path.join(context.root,context.relative)),false);
      assert.equal(receipt.actions[0].native_transaction.phase,'VERIFIED');
      if(operation!=='delete') {
        assert.equal(await readFile(path.join(context.root,receipt.actions[0].destination),'utf8'),'reproducible fixture');
        const restored = await restoreCleanup({root:context.root,receipt,approval:approveCleanupRestore(receipt,{source:'conversation',decision:'approve',authority:'restore',posix_boundary:context.boundary}),maintenance:context.maintenance});
        assert.equal(restored.status,'restored',JSON.stringify(restored)); assert.equal(await readFile(path.join(context.root,context.relative),'utf8'),'reproducible fixture');
      }
    });
  }
});

test('native POSIX admission and drift fixtures preserve approved source and unrelated files', {skip:availableOS ? false : 'Required Linux/macOS native execution is NOT_RUN on this Windows host.'}, async t => {
  const context = await setup(t); const plan = freezeCleanupPlan(context.analysis,{actions:[{path:context.relative,action:'delete'}],posix_boundary:context.boundary});
  const changed = structuredClone(context.maintenance); changed.generation='changed';
  const blocked = await applyCleanupPlan({...context,maintenance:changed,plan,approval:approval(plan)});
  assert.equal(blocked.status,'blocked'); assert.equal(await present(path.join(context.root,context.relative)),true);
  await writeFile(path.join(context.root,context.relative),'changed source');
  const stale = await applyCleanupPlan({...context,plan,approval:approval(plan)});
  assert.equal(stale.status,'blocked'); assert.equal(await readFile(path.join(context.root,context.relative),'utf8'),'changed source');
});

const helper = fileURLToPath(new URL('../../_refs/cleanup/safe-file-operation.py', import.meta.url));
const barrierProgram = String.raw`
import json,os,runpy,sys
module=runpy.run_path(sys.argv[1])
payload=json.loads(sys.stdin.read())
request=payload['request']
action=request['operations'][0]
root=request['root']
source=os.path.join(root,action['source'])
capture=os.path.join(root,action['transaction']['capture'])
destination=os.path.join(root,action['destination']) if action['destination'] else None
fired=[]
def barrier(phase,session,approved):
    case=payload['case']
    if case=='copy-order' and phase=='RECOVERY_VERIFIED':
        assert os.path.isfile(source) and open(source,'rb').read()==open(destination,'rb').read()
        fired.append(phase)
    if case in ('same-hash-replacement','unexpected-capture') and phase==('BEFORE_CAPTURE' if case=='same-hash-replacement' else 'BEFORE_RENAME'):
        data=open(source,'rb').read()
        os.rename(source,source+'.parked')
        with open(source,'xb') as handle:handle.write(data)
        fired.append(phase)
    if case=='late-hardlink' and phase=='BEFORE_CAPTURE':
        os.link(source,source+'.alias')
        fired.append(phase)
    if case=='parent-moved' and phase=='PREPARED':
        parent=os.path.dirname(source)
        os.rename(parent,parent+'.parked')
        fired.append(phase)
    if case=='parent-symlink' and phase=='PREPARED':
        parent=os.path.dirname(source)
        os.rename(parent,parent+'.parked')
        os.symlink(parent+'.parked',parent)
        fired.append(phase)
    if case=='nested-git' and phase=='PREPARED':
        with open(os.path.join(os.path.dirname(source),'.git'),'xb') as handle:handle.write(b'fixture nested boundary')
        fired.append(phase)
    if case=='destination-occupied' and phase=='PREPARED':
        with open(destination,'xb') as handle:handle.write(b'occupied recovery slot')
        fired.append(phase)
    if case=='nanosecond-drift' and phase=='BEFORE_CAPTURE':
        observed=os.stat(source)
        os.utime(source,ns=(observed.st_atime_ns,observed.st_mtime_ns+1))
        fired.append(phase)
    if case=='private-replacement' and phase=='CAPTURED':
        data=open(capture,'rb').read()
        os.rename(capture,capture+'.parked')
        with open(capture,'xb') as handle:handle.write(data)
        fired.append(phase)
    if case=='recovery-corrupt' and phase=='RECOVERY_VERIFIED':
        with open(destination,'wb') as handle:handle.write(b'changed recovery')
        fired.append(phase)
    if case.startswith('crash-') and phase==case[len('crash-'):]:os._exit(23)
session=module['Session'](request)
try:
    if payload['case']=='parallel-writer':
        try:
            other=module['Session'](request)
        except module['Refusal'] as error:
            assert str(error)=='WRITER_ALREADY_ACTIVE'
            fired.append(str(error))
        else:
            other.close()
            raise AssertionError('A second cleanup writer acquired the same stable inode')
    result=session.operation({'action':action,'maintenance':request['maintenance']},barrier)
finally:session.close()
def held(file):
    return open(file,'rb').read().decode() if os.path.isfile(file) else None
print(json.dumps({'result':result,'fired':fired,'source':held(source),'capture':held(capture),
                  'parked_source':held(source+'.parked'),'parked_capture':held(capture+'.parked'),
                  'recovery':held(destination) if destination else None,'lock_retained':os.path.isfile(os.path.join(root,module['FENCE']))}))
`;

async function nativeBarrier(context, caseId, operation = 'delete') {
  const plan = freezeCleanupPlan(context.analysis,{actions:[{path:context.relative,action:operation}],posix_boundary:context.boundary});
  const frozen = plan.actions[0];
  const action = {source:context.relative,destination:operation==='quarantine'?frozen.posix_transaction.recovery:null,
    fingerprint:frozen.fingerprint,state:plan.state.inventory.find(file=>file.path===context.relative).state,remove_source:true,transaction:frozen.posix_transaction};
  const request={root:context.root,root_state:plan.state.root_state,identity:plan.plan_id,posix_boundary:context.boundary,maintenance:context.maintenance,operations:[action]};
  const command=[context.boundary.python.executable,'-I','-S','-B','-c',barrierProgram,helper];
  const output=await new Promise((resolve,reject)=>{
    const child=spawn(command[0],command.slice(1),{shell:false,windowsHide:true,stdio:['pipe','pipe','pipe']});
    let stdout='',stderr='';
    const timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('Native fixture timed out'));},45_000);
    child.on('error',error=>{clearTimeout(timer);reject(error);});
    child.stdout.on('data',data=>{stdout+=data;});child.stderr.on('data',data=>{stderr+=data;});
    child.on('close',code=>{clearTimeout(timer);resolve({code,stdout,stderr});});
    child.stdin.end(JSON.stringify({request,case:caseId}));
  });
  return { ...output, evidence:output.stdout.trim()?JSON.parse(output.stdout):null,action,actual_command:command };
}

test('native copy is verified while the active source still exists and the stable lock inode remains after release',nativeOnly,async t=>{
  const context=await setup(t);const output=await nativeBarrier(context,'copy-order','quarantine');
  assert.equal(output.code,0,output.stderr);assert.deepEqual(output.evidence.fired,['RECOVERY_VERIFIED']);
  assert.equal(output.evidence.result.source_removed,true);assert.equal(output.evidence.result.copy_verified,true);
  assert.equal(output.evidence.result.transaction.recovery_verified_before_capture,true);assert.equal(output.evidence.lock_retained,true);
});

for (const caseId of ['same-hash-replacement','late-hardlink','parent-moved','parent-symlink','nested-git','nanosecond-drift','recovery-corrupt','destination-occupied']) {
  test(`native final revalidation blocks ${caseId} before capture`,nativeOnly,async t=>{
    const context=await setup(t);const output=await nativeBarrier(context,caseId,['recovery-corrupt','destination-occupied'].includes(caseId)?'quarantine':'delete');
    assert.equal(output.code,0,output.stderr);assert.equal(output.evidence.fired.length,1);
    assert.equal(output.evidence.result.source_removed,false);assert.equal(output.evidence.result.transaction.source_captured,false);
    assert.ok(output.evidence.result.errors.length);
    if(caseId==='same-hash-replacement') assert.equal(output.evidence.source,output.evidence.parked_source);
    else if(caseId!=='parent-moved')assert.equal(output.evidence.source,'reproducible fixture');
    if(caseId==='recovery-corrupt')assert.equal(output.evidence.result.copy_verified,false);
    if(caseId==='destination-occupied')assert.equal(output.evidence.recovery,'occupied recovery slot');
  });
}

for (const caseId of ['unexpected-capture','private-replacement']) {
  test(`out-of-contract ${caseId} is a retained partial breach and supplies no invariant-success evidence`,nativeOnly,async t=>{
    const context=await setup(t);const output=await nativeBarrier(context,caseId);
    assert.equal(output.code,0,output.stderr);assert.equal(output.evidence.fired.length,1);
    const result=output.evidence.result;
    assert.equal(result.source_removed,false);assert.equal(result.partial,true);assert.equal(result.transaction.contract_breach,true);
    assert.equal(result.transaction.capture_retained,true);assert.equal(result.transaction.source_captured,true);
    assert.equal(output.evidence.capture,'reproducible fixture');assert.equal(output.evidence.source,null);
    assert.equal(caseId==='unexpected-capture'?output.evidence.parked_source:output.evidence.parked_capture,'reproducible fixture');
  });
}

test('actual native parallel writers use the same retained fence inode',nativeOnly,async t=>{
  const context=await setup(t);const output=await nativeBarrier(context,'parallel-writer');
  assert.equal(output.code,0,output.stderr);assert.deepEqual(output.evidence.fired,['WRITER_ALREADY_ACTIVE']);
  assert.equal(output.evidence.result.source_removed,true);assert.equal(output.evidence.lock_retained,true);
});

for (const phase of ['PREPARED','RECOVERY_VERIFIED','CAPTURED','VALIDATED','COMMITTED','VERIFIED']) {
  test(`actual process interruption at ${phase} retains exact journal/object states without automatic restart`,nativeOnly,async t=>{
    const context=await setup(t);const output=await nativeBarrier(context,`crash-${phase}`,'quarantine');
    assert.equal(output.code,23,output.stderr);assert.equal(output.evidence,null);
    const rows=(await readFile(path.join(context.root,output.action.transaction.journal),'utf8')).trim().split('\n').map(JSON.parse);
    assert.equal(rows.at(-1).phase,phase);
    const captured=['CAPTURED','VALIDATED'].includes(phase);const committed=['COMMITTED','VERIFIED'].includes(phase);
    assert.equal(await present(path.join(context.root,context.relative)),!captured&&!committed);
    assert.equal(await present(path.join(context.root,output.action.transaction.capture)),captured);
    assert.equal(await present(path.join(context.root,output.action.destination)),phase!=='PREPARED');
    if(captured||committed)assert.ok(rows.some(row=>row.phase==='RECOVERY_VERIFIED'));
    assert.equal(await present(path.join(context.root,context.maintenance.fence_path)),true);
  });
}

test('occupied restore preserves both occupant and verified recovery bytes',nativeOnly,async t=>{
  const context=await setup(t);const plan=freezeCleanupPlan(context.analysis,{actions:[{path:context.relative,action:'quarantine'}],posix_boundary:context.boundary});
  const receipt=await applyCleanupPlan({...context,plan,approval:approval(plan)});assert.equal(receipt.status,'applied');
  await writeFile(path.join(context.root,context.relative),'occupied destination');
  await assert.rejects(restoreCleanup({root:context.root,receipt,approval:approveCleanupRestore(receipt,{source:'conversation',decision:'approve',authority:'restore',posix_boundary:context.boundary}),maintenance:context.maintenance}),/RESTORE_DESTINATION_OCCUPIED/u);
  assert.equal(await readFile(path.join(context.root,context.relative),'utf8'),'occupied destination');
  assert.equal(await readFile(path.join(context.root,receipt.actions[0].destination),'utf8'),'reproducible fixture');
});
