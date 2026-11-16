#!/usr/bin/env node
import { readdir, readFile, realpath } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { parse } from 'yaml';

export const REQUIRED_SKILLS=Object.freeze(['skill-installer','skill-creator','writing-skills','test-driven-development','skillevaluator']);
const INSTALL={
 'skill-installer':'Install skills/.system/skill-installer from https://github.com/openai/skills with the official installer.',
 'skill-creator':'Use skill-installer for openai/skills: skills/.system/skill-creator.',
 'writing-skills':'Install Superpowers from https://github.com/obra/superpowers using its current host installation instructions.',
 'test-driven-development':'Install Superpowers from https://github.com/obra/superpowers using its current host installation instructions.',
 'skillevaluator':'Use skill-installer for NVIDIA/SkillEvaluator: skills/skillevaluator; install its base CLI with uv tool install skillevaluator.'
};
const exec=promisify(execFile);
async function probeCLI(){
 try{const {stdout}=await exec('skillevaluator',['--version'],{timeout:15000,windowsHide:true,maxBuffer:8192});return {ok:true,version:stdout.trim()};}
 catch{return {ok:false,error:'skillevaluator --version could not complete'};}
}
/** Read only known installation roots; never install, execute skill content or inspect credentials. */
export async function checkPrerequisites({roots,probe=probeCLI}={}){
 const home=homedir();roots??=[path.join(process.env.CODEX_HOME||path.join(home,'.codex'),'skills'),path.join(process.env.CODEX_HOME||path.join(home,'.codex'),'plugins/cache'),path.join(home,'.agents/skills'),path.join(home,'.claude/skills'),path.join(home,'.claude/plugins/cache')];
 const found=new Map(),seen=new Set(),invalid=[];
 async function walk(dir,depth=0){
  if(depth>8)return;
  let actual;try{actual=await realpath(dir);}catch{return;}
  if(seen.has(actual))return;seen.add(actual);
  let entries;try{entries=await readdir(actual,{withFileTypes:true});}catch{return;}
  const file=path.join(actual,'SKILL.md');
  if(entries.some(e=>e.name==='SKILL.md')){
   try{const text=await readFile(file,'utf8');const match=text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u);if(!match)throw Error('missing frontmatter');const meta=parse(match[1]);if(typeof meta?.name!=='string'||typeof meta.description!=='string'||!meta.description.trim())throw Error('invalid metadata');if(REQUIRED_SKILLS.includes(meta.name)&&!found.has(meta.name))found.set(meta.name,file);}
   catch{invalid.push(file);}
   return;
  }
  for(const entry of entries.sort((a,b)=>a.name.localeCompare(b.name)))if(!['.git','node_modules','references','assets','scripts'].includes(entry.name)&&(entry.isDirectory()||entry.isSymbolicLink()))await walk(path.join(actual,entry.name),depth+1);
 }
 for(const root of roots)await walk(root);
 const skills=REQUIRED_SKILLS.map(name=>({name,status:found.has(name)?'present':'missing',path:found.get(name)||null,install:INSTALL[name]}));
 let result;try{result=await probe();}catch{result={ok:false};}
 const cli={status:result?.ok?(/^skillevaluator, version \d+\.\d+\.\d+/u.test(result.version||'')?'present':'invalid'):'missing',version:result?.ok?result.version:null};
 const missing=skills.filter(s=>s.status==='missing').map(s=>s.name);
 return {ready:missing.length===0&&cli.status==='present',skills,missing,invalid,cli,scope:'authoring-repository-only',runtime_requirement:'An independent fresh-context read-only auditor must be available at the audit gate.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const args=process.argv.slice(2),roots=[];
 for(let i=0;i<args.length;i++){if(args[i]!=='--skill-root'||!args[i+1])throw Error('Usage: node authoring/tools/check-prerequisites.mjs [--skill-root PATH]');roots.push(path.resolve(args[++i]));}
 const result=await checkPrerequisites(roots.length?{roots}:{});process.stdout.write(`${JSON.stringify(result,null,2)}\n`);process.exitCode=result.ready?0:1;
}
