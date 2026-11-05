import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {loadSkillPack,dispatchPrompt} from './support/skill-pack-runner.mjs';
const root=new URL('../../',import.meta.url);
test('content positive and paired negative routing uses the existing pack runner',async()=>{
 const pack=await loadSkillPack(root);
 for(const prompt of ['Write a Facebook caption for my personal travel page.','Draft a TikTok product marketing video script.','Review the editorial voice of this Instagram post.','Repurpose this blog into a Facebook post and TikTok video.','Viết caption Facebook cho thương hiệu cá nhân về du lịch.']) assert.equal(dispatchPrompt(pack,prompt)?.name,'sdcorejs-content',prompt);
 for(const [prompt,expected] of [['Write API documentation for the orders service.','sdcorejs-documentation'],['Create a PRD and acceptance criteria for this product.','sdcorejs-product'],['Review this code for authorization defects.','sdcorejs-review'],['Implement a Facebook OAuth login endpoint from the approved plan.','sdcorejs-execute-plan']]) assert.equal(dispatchPrompt(pack,prompt)?.name,expected,prompt);
});

test('social tech topics stay editorial while software deliverables keep their owners',async()=>{
 const pack=await loadSkillPack(root);
 for(const prompt of [
  'Write a Facebook post about clean code.',
  'Write a Facebook post about clean design.',
  'Draft a TikTok video script explaining API versioning for my personal tech brand.',
  'Draft a TikTok video script explaining product pricing for my personal brand.',
  'Create a Facebook caption announcing our new API product.',
  'Review this LinkedIn post about how to debug an OAuth endpoint.',
  'Repurpose this API documentation into a Facebook post.',
  'Write a Facebook post about why we test login components.',
  'Fix the grammar in this Facebook caption about API testing.',
  'Create a Facebook post covering clean code.',
  'Create a Facebook caption for our Angular component launch.',
  'Write a Facebook post on testing components.',
 ]) assert.equal(dispatchPrompt(pack,prompt)?.name,'sdcorejs-content',prompt);
 for(const prompt of [
  'Implement a Facebook OAuth login endpoint from the approved plan.',
  'Write API documentation for the Facebook POST endpoint.',
  'Debug the Facebook post editor component.',
  'Implement a TikTok video script editor from the approved plan.',
  'Create a PRD and acceptance criteria for a social post scheduler.',
  'Write tests for the Facebook POST endpoint.',
  'Build an Angular component that previews a caption for Instagram.',
  'Create a Facebook caption generator component in Angular.',
  'In our existing Angular app, implement the caption preview component for Facebook.',
  'Please fix the Angular component that renders Facebook post previews.',
  'Build Facebook caption previews in an Angular component.',
  'Create a Facebook post editing UI component in Angular.',
 ]) assert.notEqual(dispatchPrompt(pack,prompt)?.name,'sdcorejs-content',prompt);
 assert.equal(dispatchPrompt(pack,'Use sdcorejs-review to review code for the Facebook post editor.')?.name,'sdcorejs-review');
});

test('reference selection is orthogonal, no-match is explicit, and every selected ref has provenance',async()=>{
 const {selectContentReferences}=await import('../../_refs/content/content-contract.mjs');
 const result=selectContentReferences({action:'draft',channels:['tiktok'],formats:['short-video'],domains:['travel-lifestyle'],voice:true,claims:true});
 assert.ok(result.references.includes('_refs/content/domains/travel-lifestyle.md'));
 assert.ok(result.references.includes('_refs/content/channels/tiktok.md'));
 assert.ok(!result.references.some(p=>p.includes('marketing-business')||p.includes('/tech.md')||p.includes('facebook')));
 assert.equal(result.engineering_artifacts_required,false);
 for(const ref of result.references){const text=await readFile(new URL(ref,root),'utf8');for(const field of ['applies_to','excludes','provenance','reviewed_on','refresh_when'])assert.match(text,new RegExp('^'+field+':','m'));}
 const fallback=selectContentReferences({channels:['new-network'],domains:['unknown']});
 assert.deepEqual(fallback.no_match,['channel:new-network','domains:unknown']);
 assert.ok(fallback.references.includes('_refs/content/channels/general.md'));
 for(const channel of ['__proto__','constructor','toString']) {const unknown=selectContentReferences({channels:[channel]});assert.ok(unknown.references.includes('_refs/content/channels/general.md'));assert.deepEqual(unknown.no_match,[`channel:${channel}`]);}
 assert.throws(()=>selectContentReferences({action:'publish'}),/editorial action/);
 assert.throws(()=>selectContentReferences({channels:'tiktok'}),/arrays/);
});
test('claim review distinguishes supplied experience, supported proof and unsupported marketing',async()=>{
 const {assessContentClaim}=await import('../../_refs/content/content-contract.mjs');
 assert.equal(assessContentClaim({kind:'personal-experience',author_supplied:false}).decision,'rewrite-without-first-person');
 assert.equal(assessContentClaim({kind:'personal-experience',author_supplied:true}).decision,'retain-with-scope');
 const evidence={review_status:'verified',source:'provided benchmark report',supporting_excerpt:'CSV export median 20ms vs 200ms on the supplied 1,000-row fixture',checked_on:'2026-11-05',scope_matches:true,method:'20 repeated local runs',baseline:'previous version on same fixture',conditions:'local 1,000-row CSV fixture'};
 assert.equal(assessContentClaim({kind:'benchmark',evidence}).decision,'retain-with-scope');
 for(const partial of [undefined,{source:'https://example.com'}, {...evidence,stale:true},{...evidence,scope_matches:false},{...evidence,method:null},{...evidence,method:{},baseline:[],conditions:true},{...evidence,method:' ',baseline:' ',conditions:' '}])assert.equal(assessContentClaim({kind:'benchmark',evidence:partial}).decision,'rewrite-or-omit');
 assert.equal(assessContentClaim({kind:'testimonial',evidence}).decision,'rewrite-or-omit');
 assert.equal(assessContentClaim({kind:'testimonial',evidence:{...evidence,use_authorized:true}}).decision,'retain-with-scope');
 assert.equal(assessContentClaim({kind:'causal-performance',evidence}).decision,'hypothesis-only');
});

test('Content registry is editorial and cannot enable engineering gates or publication implicitly',async()=>{
 const {systemRegistry,validateSystemRegistry}=await import('../../_refs/shared/system-registry.mjs');
 const capability=systemRegistry.editorial_capabilities.find(x=>x.id==='content');
 assert.equal(capability.engineering_finish_required,false);
 assert.equal(validateSystemRegistry().length,0);
 for(const patch of [{engineering_finish_required:true},{publication_authority:'draft-implies-publish'},{lifecycle:['draft']}]) {const candidate=structuredClone(systemRegistry);Object.assign(candidate.editorial_capabilities[0],patch);assert.ok(validateSystemRegistry(candidate).length>0);}
});


test('Content inventory increase binds the actual 24-to-25 decision and user authority',async()=>{
 const {verifyApprovedArtifact}=await import('../../_refs/shared/approved-artifact.mjs');
 const policy=JSON.parse(await readFile(new URL('authoring/evals/inventory-policy.json',root),'utf8'));
 const decision=JSON.parse(await readFile(new URL(policy.decision_record,root),'utf8'));
 assert.equal(policy.public_skill_ceiling,25);assert.equal(policy.previous_ceiling,24);
 assert.equal(decision.decision.current_public_count,24);assert.equal(decision.decision.post_change_count,25);
 assert.equal(decision.decision.valid,true);assert.deepEqual(decision.decision.errors,[]);
 for(const ref of Object.values(decision.approvals)) {
  const artifact=JSON.parse(await readFile(new URL(ref.artifact_ref,root),'utf8'));
  assert.equal(verifyApprovedArtifact(artifact).valid,true);
  assert.equal(artifact.metadata.approval_hash,ref.approval_hash);
  const body=JSON.parse(artifact.body);assert.equal(body.document_review_performed,false);
  assert.equal(body.public_inventory_hash,decision.decision.public_inventory_hash);
  assert.match(body.authority_source,/Current user task/);
  const altered=structuredClone(artifact);altered.body=artifact.body.replace('sdcorejs-content','other-skill');
  assert.throws(()=>verifyApprovedArtifact(altered),/hash mismatch/);
 }
});
