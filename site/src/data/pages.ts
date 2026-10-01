import type {Locale} from './i18n';
const vi=import.meta.glob('../content/docs/**/*.md',{eager:true});
const en=import.meta.glob('../content/en/docs/**/*.md',{eager:true});
export function getDocs(locale:Locale):any[]{return Object.values(locale==='vi'?vi:en);}
const viSlugs=getDocs('vi').map(p=>p.frontmatter.slug).sort();
const enSlugs=getDocs('en').map(p=>p.frontmatter.slug).sort();
if(JSON.stringify(viSlugs)!==JSON.stringify(enSlugs))throw new Error('VI/EN guide route parity mismatch');
