import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../../../',import.meta.url));
// Structural contract tests follow declared JIT references. Entrypoint/context
// budget tests continue to measure the literal entrypoint, never this expansion.
const refs={
 'sdcorejs-angular':['_refs/angular/orchestrator-workflow.md','_refs/angular/orchestrator-generation.md'],
 'sdcorejs-plan':['_refs/sdlc/plan-template.md'],
 'sdcorejs-review':['_refs/shared/review-output.md'],
 'sdcorejs-test':['_refs/shared/test-downstream-context.md'],
 'sdcorejs-explore':['_refs/shared/explore-code-map-readonly.md','_refs/shared/explore-documentation-harvest-readonly.md','_refs/shared/explore-trace-flow-readonly.md','_refs/shared/explore-env-setup-actions.md','_refs/shared/explore-recovery-readonly.md','_refs/shared/explore-persona-actions.md','_refs/shared/explore-convention-actions.md','_refs/shared/explore-memory-actions.md'],
};
export async function publishedContract(text) {
 const name=text.match(/^name:\s*(\S+)/m)?.[1];
 const selected=refs[name]??[];
 let result=text;
 for(const ref of selected){if(!text.includes(ref))throw Error(`missing JIT hook: ${name} ${ref}`);result+='\n'+await readFile(path.join(root,ref),'utf8');}
 return result;
}
export async function readPublishedContract(file,encoding='utf8') {
 const text=await readFile(file,encoding);
 return typeof text==='string'?publishedContract(text):text;
}
