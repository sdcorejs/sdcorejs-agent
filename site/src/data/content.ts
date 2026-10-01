// Only repo-authored Markdown is rendered here. Preserve root-relative URLs under
// any SITE_BASE without adding a Markdown processor/plugin dependency.
export function withBase(html:string,base:string):string {
  return html.replace(/\b(href|src)="(\/(?!\/)[^"]*)"/g,(_match,attribute,path)=>`${attribute}="${base}${path}"`);
}
// Docs links stay in the reading locale; static assets stay at the site base.
export function withLocale(html:string,base:string,locale:'vi'|'en'):string {
  return html.replace(/\b(href|src)="(\/(?!\/)[^"]*)"/g,(_match,attribute,path)=>{
    const isPage=attribute==='href' && !/\.[a-z0-9]+(?:[?#]|$)/i.test(path);
    return `${attribute}="${base}${isPage?`/${locale}`:''}${path}"`;
  });
}
