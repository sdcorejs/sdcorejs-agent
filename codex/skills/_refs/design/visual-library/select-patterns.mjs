import { pathToFileURL } from 'node:url';
import { catalog } from './library.mjs';

/** Metadata-only selection. The caller grounds the task and reads selected records. */
export function selectPatterns({surface,job,data_shape,existing_design=false,core_version,limit=3}={}) {
  if(typeof surface!=='string'||typeof job!=='string'||!Number.isInteger(limit)||limit<1||limit>3)throw new TypeError('Provide surface, job and a limit from 1 to 3');
  const patterns=catalog.patterns.filter(p=>p.surfaces.includes(surface)&&p.jobs.includes(job))
    .filter(p=>p.id!=='op-wizard'||job==='complete-steps'||data_shape==='dependent-steps')
    .map(p=>({p,score:(p.jobs[0]===job?4:1)+(data_shape&&p.data_shapes.includes(data_shape)?3:0)}))
    .sort((a,b)=>b.score-a.score||a.p.id.localeCompare(b.p.id)).slice(0,limit)
    .map(({p})=>({...p,reason:`Supports ${job} on ${surface}${data_shape&&p.data_shapes.includes(data_shape)?` with ${data_shape} data`:''}. Read applicability before choosing.`,component_compatibility:'unverified',installed_core_version:core_version??null}));
  return {status:patterns.length?'matched':'no-match',theme_policy:existing_design?'reuse-project-tokens':'candidate-themes-or-preview-default',patterns,limitation:'Catalog matches do not prove API compatibility or authorize new behavior. Inspect the installed version and current project conventions; no-match needs general guidance, not a marketing fallback.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{const [surface,job,data_shape]=process.argv.slice(2);console.log(JSON.stringify(selectPatterns({surface,job,data_shape}),null,2));}
  catch(error){console.error(error.message);process.exitCode=1;}
}
