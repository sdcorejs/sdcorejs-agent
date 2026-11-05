import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const root=process.argv[2];
if (!root) throw new Error('Pass an absolute workspace with snapshots/pack-amber and snapshots/pack-cobalt');
const routes=[
 ['regression','Write a Facebook post about clean code.','sdcorejs-content'],
 ['control','Write a Facebook post about clean design.','sdcorejs-content'],
 ['regression','Draft a TikTok video script explaining API versioning for my personal tech brand.','sdcorejs-content'],
 ['control','Draft a TikTok video script explaining product pricing for my personal brand.','sdcorejs-content'],
 ['regression','Create a Facebook caption announcing our new API product.','sdcorejs-content'],
 ['regression','Repurpose this API documentation into a Facebook post.','sdcorejs-content'],
 ['control','Create a Facebook caption for our Angular component launch.','sdcorejs-content'],
 ['control','Review this LinkedIn post about how to debug an OAuth endpoint.','sdcorejs-content'],
 ['control','Write API documentation for the orders service.','sdcorejs-documentation'],
 ['control','Create a PRD and acceptance criteria for this product.','sdcorejs-product'],
 ['control','Review this code for authorization defects.','sdcorejs-review'],
 ['control','Implement a Facebook OAuth login endpoint from the approved plan.','sdcorejs-execute-plan'],
 ['review-control','Build an Angular component that previews a caption for Instagram.','sdcorejs-angular'],
 ['review-control','Create a Facebook caption generator component in Angular.','sdcorejs-angular'],
 ['review-control','Build Facebook caption previews in an Angular component.','sdcorejs-angular'],
 ['review-control','Create a Facebook post editing UI component in Angular.','sdcorejs-angular'],
 ['new-case','Draft a LinkedIn post explaining how our API examples help support teams.','sdcorejs-content'],
 ['new-case','Create API documentation for the Instagram POST endpoint.','sdcorejs-documentation'],
];
const dirty=[
 ['equal-root','src','src/**',false],['reverse-root','src/**','src',false],
 ['slash-control','src/','src/**',false],['child-control','src/a.ts','src/**',false],
 ['exact-control','src/a.ts','src/a.ts',false],['root-scope','src/a.ts','**',false],
 ['partial-glob','src/order.ts','src/ord*.ts',false],['disjoint-file','notes.md','src/a.ts',true],
 ['disjoint-directory','docs','src/**',true],['unknown-scope','notes.md',null,false],
 ['case-insensitive','src/Foo.ts','src/foo.ts',false,{caseInsensitive:true}],
 ['case-sensitive','src/Foo.ts','src/foo.ts',true,{caseInsensitive:false}],
];
const results=[];
for(const [variant,packName,revision] of [['candidate','pack-cobalt','be1c4963fa2e0f5b32d9523d9601b3dc634db289'],['baseline','pack-amber','97cc700ef7201a3074c57aedff89cbe131f9ee6f']]) {
 const p=`${root}/snapshots/${packName}`;
 const {loadSkillPack,dispatchPrompt}=await import(pathToFileURL(`${p}/test/e2e/support/skill-pack-runner.mjs`));
 const {evaluateWorkingTree}=await import(pathToFileURL(`${p}/_refs/orchestration/execution-contract.mjs`));
 const pack=await loadSkillPack(p);
 const cases=[];
 for(const [basis,prompt,expected] of routes){const actual=dispatchPrompt(pack,prompt)?.name??null;cases.push({kind:'routing',basis,prompt,expected,actual,passed:actual===expected});}
 for(const [id,entry,scope,expected,options] of dirty){const input={unrelated_dirty_paths:[entry],intended_output_paths:scope===null?[]:[scope]};const actual=evaluateWorkingTree(input,options);cases.push({kind:'dirty-contract',id,input,options:options??{},expected_write_authorized:expected,actual,passed:actual.write_authorized===expected});}
 results.push({variant,revision,cases,passed:cases.filter(x=>x.passed).length,total:cases.length});
}
const report={measurement:'deterministic contract and test-harness behavior; not model routing or timing',provider_calls:0,known_regression_and_review_controls:true,new_cases:2,variants:results};
await writeFile(`${root}/deterministic-results.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(results.map(({variant,passed,total,cases})=>({variant,passed,total,failed:cases.filter(x=>!x.passed).map(x=>x.prompt??x.id)})),null,2));
