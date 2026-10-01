import {getSkills} from '../../data/catalog';
import {getDocs} from '../../data/pages';
import {home} from '../../data/home';
import {locales,messages,localeUrl,type Locale} from '../../data/i18n';
export const prerender=true;
export function getStaticPaths(){return locales.map(locale=>({params:{locale}}));}
export function GET({params}:{params:{locale:string}}){
  const locale=params.locale as Locale,ui=messages[locale],url=(path:string)=>localeUrl(locale,path);
  const vi=import.meta.glob('../../content/docs/**/*.md',{eager:true,query:'?raw',import:'default'});
  const en=import.meta.glob('../../content/en/docs/**/*.md',{eager:true,query:'?raw',import:'default'});
  const angularVi=import.meta.glob('../../content/angular.md',{eager:true,query:'?raw',import:'default'});
  const angularEn=import.meta.glob('../../content/en/angular.md',{eager:true,query:'?raw',import:'default'});
  const raw=Object.values(locale==='vi'?vi:en).map(String);
  const docs=getDocs(locale).map(page=>({title:page.frontmatter.title,url:url(`/docs/${page.frontmatter.slug}/`),section:page.frontmatter.section??ui.guideSection,body:raw.find(body=>body.match(/^slug: (.+)$/m)?.[1].trim()===page.frontmatter.slug)!.replace(/^---[\s\S]*?---/,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1')}));
  return new Response(JSON.stringify([
    {title:home[locale].title,url:url('/'),section:ui.overview,body:home[locale].description},
    {title:ui.catalogTitle,url:url('/skills/'),section:'Skill reference',body:ui.catalogDescription},
    {title:'Angular Core UI',url:url('/angular/'),section:'Implementation',body:String(Object.values(locale==='vi'?angularVi:angularEn)[0])},
    ...docs,...getSkills(locale).map(s=>({title:s.id,url:url(`/skills/${s.id}/`),section:s.group,body:`${s.summary} ${s.input} ${s.output} ${s.boundary} ${s.prompt}`})),
  ]),{headers:{'Content-Type':'application/json; charset=utf-8'}});
}
