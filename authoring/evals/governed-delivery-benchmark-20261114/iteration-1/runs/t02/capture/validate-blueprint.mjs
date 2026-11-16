import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { validateProjectBlueprint, selectBehavioralE2E } from '/workspace/work/sdcorejs-benchmark-20261114/experiment/packs/p42/_refs/shared/project-blueprint.mjs';
import { resolveExploreWriteAuthority, validateExploreClassification } from '/workspace/work/sdcorejs-benchmark-20261114/experiment/packs/p42/_refs/shared/explore-contract.mjs';

const root = '/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t02/target';
const capture = root + '/../capture';
const path = '.sdcorejs/blueprints/order-desk.json';
const candidate = process.argv[2] === 'candidate';
const bytes = readFileSync(candidate ? capture + '/blueprint-candidate.json' : root + '/' + path);
const doc = JSON.parse(bytes);
const originalAgents = readFileSync(capture + '/agents-before.md');
const currentAgents = readFileSync(candidate ? capture + '/agents-candidate.md' : root + '/AGENTS.md');
const hash = data => createHash('sha256').update(data).digest('hex');
const authority = resolveExploreWriteAuthority({action:'project-blueprint-write-approved',explicit_authority:true,approved_initialization:true,worker_role:'sequential-owner'});
assert.equal(authority.write_allowed,true);
assert.deepEqual(validateExploreClassification({tracks:['node'],stack_profiles:['node-general']}),[]);
const validation = validateProjectBlueprint(doc,{path});
assert.equal(validation.ok,true,JSON.stringify(validation.errors));
assert.equal(validation.status,'incomplete');
assert(validation.gaps.includes('permissions'));
assert(currentAgents.subarray(0,originalAgents.length).equals(originalAgents),'Original manual guidance must be preserved byte-for-byte');
assert(currentAgents.toString().includes(']('+path+')'),'AGENTS blueprint link must be present');
assert.equal(doc.source_revision,execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim());
let references = 0;
for(const area of Object.values(doc.areas)) {
  for(const ref of area.evidence ?? []) {
    const source = ref.path === 'AGENTS.md' ? currentAgents : readFileSync(root+'/'+ref.path);
    assert.equal(hash(source),ref.sha256,'Stale evidence: '+ref.path);
    references++;
  }
}
const baseline = JSON.parse(readFileSync(capture + '/baseline-hashes.json','utf8'));
for(const [relative,expected] of Object.entries(baseline)) {
  if(relative === 'AGENTS.md') continue;
  assert.equal(hash(readFileSync(root+'/'+relative)),expected,'Out-of-scope mutation: '+relative);
}
const selection = selectBehavioralE2E([
  {id:'post-orders',kind:'public-api'},
  {id:'blueprint-initialization',kind:'documentation',exception_reason:'Only project guidance and its link changed; source and public boundaries are unchanged. Validate blueprint schema, evidence hashes, link, manual-policy preservation and the bounded diff.'}
]);
assert(selection.ok);
assert.deepEqual(selection.required,[{behavior_id:'post-orders',layer:'api-e2e'}]);
if(!candidate) assert(existsSync(root+'/'+path));
assert(!bytes.includes(Buffer.from([0xef,0xbf,0xbd])),'Unexpected replacement character');
console.log(JSON.stringify({mode:candidate?'candidate':'persisted',authority,validation,classification:'node/node-general',verified_evidence_references:references,manual_policy:'preserved byte-for-byte',application_tests_and_dependencies:'unchanged',source_revision:doc.source_revision,behavior_selection:selection},null,2));

