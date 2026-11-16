import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { checkPrerequisites, REQUIRED_SKILLS } from '../../authoring/tools/check-prerequisites.mjs';
async function fixture(t) {
 const root=await mkdtemp(path.join(tmpdir(),'authoring-prereq-'));t.after(()=>rm(root,{recursive:true,force:true}));return root;
}
async function seed(root, names=REQUIRED_SKILLS) {
 for(const name of names){const d=path.join(root,name);await mkdir(d,{recursive:true});await writeFile(path.join(d,'SKILL.md'),`---\nname: ${name}\ndescription: A usable test skill.\n---\n# ${name}\n`);}
}
test('missing prerequisites block with source-specific install guidance',async t=>{
 const root=await fixture(t);const result=await checkPrerequisites({roots:[root],probe:async()=>({ok:false})});
 assert.equal(result.ready,false);assert.equal(result.missing.length,5);assert.match(result.skills[0].install,/openai\/skills/);assert.equal(result.cli.status,'missing');
});
test('nested plugin discovery and CLI work without provider calls',async t=>{
 const root=await fixture(t);await seed(path.join(root,'plugin','7.0.2','skills'));let calls=0;
 const result=await checkPrerequisites({roots:[root],probe:async()=>{calls++;return {ok:true,version:'skillevaluator, version 0.9.0'};}});
 assert.equal(result.ready,true);assert.equal(calls,1);assert.equal(result.skills.length,5);assert.match(result.cli.version,/0.9.0/);
});
test('directory name cannot impersonate a missing skill; CLI failure blocks',async t=>{
 const root=await fixture(t);await seed(root);await writeFile(path.join(root,'skill-creator','SKILL.md'),'---\nname: wrong\ndescription: Wrong skill.\n---\n');
 const result=await checkPrerequisites({roots:[root],probe:async()=>({ok:false,error:'unavailable'})});
 assert.equal(result.ready,false);assert.deepEqual(result.missing,['skill-creator']);
});
test('unreadable roots and malformed frontmatter remain incomplete',async t=>{
 const root=await fixture(t);await mkdir(path.join(root,'broken'));await writeFile(path.join(root,'broken','SKILL.md'),'---\nname: [broken\n---');
 const result=await checkPrerequisites({roots:[root,path.join(root,'absent')],probe:async()=>({ok:true,version:'unexpected executable'})});
 assert.equal(result.ready,false);assert.equal(result.cli.status,'invalid');assert.ok(result.invalid.length);
});
