import { execFileSync } from 'node:child_process';

const PAGES=[
  'index.html','about.html','works.html','contact.html',
  'himart.html','himart-reuse.html','himart-ways.html','himart-team.html','himart-ax.html',
  'aimmo-system.html','aimmo-graphic.html','nbt_stepup.html','yanolja-system.html','trenbe-ut.html','work_archive.html'
];
const SPECIAL=[
  'himart-live-boot.js',
  'himart-narrative-v2-production-base.js',
  'himart-narrative-v2-production-runtime.js'
];
const SCRIPT_PATH_ALIASES=new Map([
  ['about-page.js','design-system/pages/about/about-page.js'],
  ['design-system/himart-ways-v4.js','design-system/pages/himart-ways/ways-runtime.js']
]);
const canonicalScriptPath=file=>SCRIPT_PATH_ALIASES.get(file)||file;

const git=(args,allowFail=false)=>{
  try{return execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe',allowFail?'ignore':'pipe']});}
  catch(error){if(allowFail)return'';throw error;}
};
const show=(ref,file)=>git(['show',ref+':'+file],true);
const clean=value=>String(value)
  .replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'")
  .replace(/\\r\\n|\\n|\\r/g,' ⏎ ').replace(/\r\n|\r|\n/g,' ').replace(/\s+/g,' ').trim();

function htmlText(source){
  if(!source)return[];
  const attrs=[];
  for(const m of source.matchAll(/\b(aria-label|alt|title|placeholder)=["']([^"']*)["']/gi)){
    const v=clean(m[2]);if(v)attrs.push('@'+m[1].toLowerCase()+':'+v);
  }
  const body=source.replace(/<!--[\s\S]*?-->/g,'').replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<style\b[\s\S]*?<\/style>/gi,'')
    .replace(/<br\s*\/?>/gi,' ⏎ ').replace(/<\/((?:p|h[1-6]|li|div|span|a|button|strong|b|small|td|th|figcaption|label|section|article))>/gi,'\n').replace(/<[^>]+>/g,'\n');
  return [...attrs,...body.split(/\n+/).map(clean).filter(Boolean)];
}
function jsText(source){
  if(!source)return[];
  const out=[];const re=/(["'\x60])((?:\\.|(?!\1)[\s\S])*?)\1/g;let m;
  while((m=re.exec(source))){
    const raw=m[2],v=clean(raw);if(!v)continue;
    const before=source.slice(Math.max(0,m.index-100),m.index);
    const keyed=/(?:title|desc|copy|label|caption|heading|headline|company|period|note|reflection|textContent|innerHTML|outerHTML|aria-label|placeholder)\s*[:=]\s*$/i.test(before);
    const hangul=/[가-힣]/.test(v);
    const markup=/<(?:h[1-6]|p|span|strong|b|small|article|div)\b/i.test(raw)&&/[가-힣A-Za-z]/.test(raw);
    if(hangul||keyed||markup)out.push(v);
  }
  return out;
}
function scriptRefs(ref){
  const set=new Set(SPECIAL);
  for(const page of PAGES){
    const html=show(ref,page);
    for(const m of html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)){
      const src=m[1].split('?')[0];
      if(src.startsWith('./'))set.add(src.replace(/^\.\//,''));
    }
  }
  return set;
}
function snapshot(ref){
  const result={};
  const scripts=scriptRefs(ref);
  for(const page of PAGES)result[page]=htmlText(show(ref,page));
  for(const file of [...scripts].sort()){
    const content=show(ref,file);
    if(!content)continue;
    const values=jsText(content);
    if(values.length)result[canonicalScriptPath(file)]=values;
  }
  return result;
}
function changedText(parent,commit){
  const a=snapshot(parent),b=snapshot(commit);
  const files=[...new Set([...Object.keys(a),...Object.keys(b)])].sort();
  return files.filter(file=>JSON.stringify(a[file]||[])!==JSON.stringify(b[file]||[]));
}

const args=process.argv.slice(2);
if(args[0]!=='--check'){
  console.error('Usage: node scripts/content-lock.mjs --check [base] [head]');
  process.exit(2);
}
let base=args[1]||git(['rev-parse','HEAD^']).trim();
const head=args[2]||git(['rev-parse','HEAD']).trim();
if(!base||/^0+$/.test(base))base=git(['rev-parse',head+'^']).trim();

const commits=git(['rev-list','--reverse',base+'..'+head]).split(/\r?\n/).filter(Boolean);
let failed=false;
for(const commit of commits){
  const parents=git(['rev-list','--parents','-n','1',commit]).trim().split(/\s+/).slice(1);
  if(!parents.length)continue;
  const parent=parents[0];
  const drift=changedText(parent,commit);
  if(!drift.length)continue;
  const message=git(['log','-1','--pretty=%B',commit]);
  if(message.includes('[copy-approved]')){
    console.log('CONTENT LOCK approved:',commit.slice(0,8),drift.join(', '));
    continue;
  }
  failed=true;
  console.error('CONTENT LOCK FAIL:',commit);
  console.error('Unapproved authored/visible text change in: '+drift.join(', '));
}
if(failed){
  console.error('Copy changes require an explicit user request and [copy-approved] on the exact commit.');
  process.exit(1);
}
console.log('CONTENT LOCK PASS: no unapproved production copy drift found.');
