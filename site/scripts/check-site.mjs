import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const dist=resolve('dist');
const base=(process.env.SITE_BASE??'/sdcorejs-agent/').replace(/\/$/,'');
const siteHost=new URL(process.env.SITE_URL??'https://sdcorejs.github.io').hostname;
if(!existsSync(dist))throw new Error('Build site before checking links');
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(dir,e.name)):[resolve(dir,e.name)]);
const skillPaths=walk(resolve('..','skills')).filter(path=>path.endsWith('.md') && /^name:\s*sdcorejs-/m.test(readFileSync(path,'utf8')));
const guideCount=walk(resolve('src/content/docs')).filter(path=>path.endsWith('.md')).length;
// Match the canonical catalog and search-index producer: skills + guides plus
// the home, skill-library and Angular pages, without a stale hardcoded count.
const expectedSearchEntries=skillPaths.length+guideCount+3;
const files=walk(dist).filter(p=>p.endsWith('.html'));
const pages=new Map(files.map(path=>{
  const local=relative(dist,path).replace(/\\/g,'/');
  return [`${base}/${local.replace(/index\.html$/,'')}`,readFileSync(path,'utf8')];
}));
const problems=[],sourcePaths=new Set();let links=0;
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
function check(raw,from){
  if(!raw||/^(mailto:|tel:|data:)/.test(raw))return;
  const url=new URL(decode(raw),`https://local.invalid${from}`);
  if(url.hostname!=='local.invalid'&&url.hostname!==siteHost){
    const match=url.pathname.match(/^\/sdcorejs\/sdcorejs-agent\/blob\/([a-f0-9]{40})\/(.+)$/);
    if(url.hostname==='github.com'&&match)sourcePaths.add(`${match[1]}:${decodeURIComponent(match[2])}`);
    return;
  }
  links++;
  const pathname=decodeURIComponent(url.pathname);
  if(base&&!pathname.startsWith(`${base}/`)){problems.push(`${from}: missing base in ${raw}`);return;}
  const local=pathname.slice(base.length).replace(/^\//,'');
  const target=resolve(dist,local);
  const html=pages.get(pathname)??pages.get(`${pathname.replace(/\/$/,'')}/`);
  if(!html&&!existsSync(target)&&!existsSync(resolve(target,'index.html'))){problems.push(`${from}: missing ${raw}`);return;}
  if(url.hash&&html){
    const id=decodeURIComponent(url.hash.slice(1));
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>decode(m[1]));
    if(!ids.includes(id))problems.push(`${from}: missing anchor ${raw}`);
  }
}
for(const [url,html]of pages){
  const locale=url.slice(base.length).match(/^\/(vi|en)\//)?.[1]??'vi';
  if(!html.includes(`lang="${locale}"`))problems.push(`${url}: missing ${locale} language`);
  if(!html.includes('id="main"'))problems.push(`${url}: missing main landmark target`);
  if(html.includes('\ufffd'))problems.push(`${url}: replacement character`);
  for(const match of html.matchAll(/<(?:a|link|img|script)\b[^>]*?\b(?:href|src)="([^"]+)"/g))check(match[1],url);
}
const indexes={};
for(const locale of ['vi','en']){
  const search=JSON.parse(readFileSync(resolve(dist,locale,'search-index.json'),'utf8'));
  indexes[locale]=search;
  if(search.length!==expectedSearchEntries)problems.push(`${locale}: expected ${expectedSearchEntries} search entries`);
  for(const entry of search){
    check(entry.url,`${base}/${locale}/`);
    if(!entry.url.startsWith(`${base}/${locale}/`))problems.push(`${locale}: search result changes locale: ${entry.url}`);
    if(!entry.title||!entry.body)problems.push(`Empty search entry ${entry.url}`);
  }
}
const routes=locale=>indexes[locale].map(e=>e.url.slice(`${base}/${locale}`.length)).sort();
if(JSON.stringify(routes('vi'))!==JSON.stringify(routes('en')))problems.push('VI/EN content route parity mismatch');
for(const locale of ['vi','en']){
  for(const path of [...routes(locale),'/404/']){
    const url=`${base}/${locale}${path}`,html=pages.get(url);
    if(!html){problems.push(`Missing localized page ${url}`);continue;}
    for(const language of ['vi','en']){
      const href=`${base}/${language}${path}`;
      if(!html.includes(`hreflang="${language}"`))problems.push(`${url}: missing language alternate ${language}`);
      if(!html.includes(`href="${href}" lang="${language}"`))problems.push(`${url}: switch does not preserve page for ${language}`);
      check(href,url);
    }
    if(!html.includes(`https://${siteHost}${url}`))problems.push(`${url}: missing corresponding canonical URL`);
  }
}
for(const path of routes('vi')){
  const html=pages.get(`${base}${path}`);
  if(!html||!html.includes(`0;url=${base}/vi${path}`))problems.push(`Missing legacy VI alias ${path}`);
}
// Translation structure protects instructions and source claims from accidental omission.
const viDocs=walk(resolve('src/content/docs')).filter(p=>p.endsWith('.md'));
const guides=[...viDocs.map(p=>[p,p.replace(/([\\/])content([\\/])docs/,'$1content$2en$2docs')]),[resolve('src/content/angular.md'),resolve('src/content/en/angular.md')]];
const linksIn=text=>[...new Set([...text.matchAll(/\]\(([^)]+)\)/g)].map(m=>m[1]))].sort();
const commandsIn=text=>[...text.matchAll(/```(bash|powershell)\r?\n([\s\S]*?)```/g)].map(m=>m[2].replace(/\r\n/g,'\n'));
for(const [viPath,enPath]of guides){
  if(!existsSync(enPath)){problems.push(`Missing English source ${enPath}`);continue;}
  const vi=readFileSync(viPath,'utf8'),en=readFileSync(enPath,'utf8');
  if((vi.match(/^## /gm)??[]).length!==(en.match(/^## /gm)??[]).length)problems.push(`Heading parity: ${relative(resolve('src'),viPath)}`);
  if(JSON.stringify(linksIn(vi))!==JSON.stringify(linksIn(en)))problems.push(`Source/link parity: ${relative(resolve('src'),viPath)}`);
  if(JSON.stringify(commandsIn(vi))!==JSON.stringify(commandsIn(en)))problems.push(`Executable command parity: ${relative(resolve('src'),viPath)}`);
  if(en.includes('\\u2019')||en.includes('\ufffd'))problems.push(`English encoding artifact: ${enPath}`);
}
for(const path of sourcePaths){try{execFileSync('git',['cat-file','-e',path],{cwd:resolve('..'),stdio:'pipe'});}catch{problems.push(`Source link does not resolve at pinned revision: ${path}`);}}
const documentedRevision=readFileSync(resolve('src/data/navigation.ts'),'utf8').match(/export const revision = '([a-f0-9]{40})'/)?.[1];
if(!documentedRevision)problems.push('Missing documented source revision');
for(const path of skillPaths){
  const local=relative(resolve('..'),path).replace(/\\/g,'/');
  const id=readFileSync(path,'utf8').match(/^name:\s*([^\r\n]+)$/m)?.[1].trim();
  let published=false;
  try{execFileSync('git',['cat-file','-e',`${documentedRevision}:${local}`],{cwd:resolve('..'),stdio:'ignore',windowsHide:true});published=true;}catch{}
  for(const locale of ['vi','en']){
    const url=`${base}/${locale}/skills/${id}/`,html=pages.get(url)??'';
    if(!html.includes(`data-source-status="${published?'published':'candidate'}"`))problems.push(`${url}: inaccurate source provenance`);
    if(published && !html.includes(`href="https://github.com/sdcorejs/sdcorejs-agent/blob/${documentedRevision}/${local}"`))problems.push(`${url}: missing pinned canonical source`);
    if(!published && /href="https:\/\/github\.com\/sdcorejs\/sdcorejs-agent\/blob\//.test(html))problems.push(`${url}: unpublished candidate links to a Git blob`);
  }
}
if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}
else console.log(JSON.stringify({status:'PASS',htmlPages:pages.size,contentPagesPerLocale:{vi:indexes.vi.length,en:indexes.en.length},localized404Pages:2,legacyAliases:routes('vi').length,translatedMarkdownPairs:guides.length,localLinksAndAssets:links,searchEntries:indexes.vi.length+indexes.en.length,pinnedSourcePaths:sourcePaths.size,base:base||'/'},null,2));
