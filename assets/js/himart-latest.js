(()=>{'use strict';
const main=document.getElementById('live-main');
const fixed=document.getElementById('hmVideoFixed');
const video=document.getElementById('hmHeroVideo');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const pool='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
const textNodes=el=>{const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeValue&&n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});const nodes=[];let node;while((node=walker.nextNode()))nodes.push(node);return nodes;};
const isCharacter=ch=>/[\p{L}\p{N}]/u.test(ch);

function scramble(el){
  if(!el||el.dataset.latestScramblePlayed==='1')return;
  el.dataset.latestScramblePlayed='1';
  el.classList.add('is-latest-in');
  if(reduce)return;
  const parts=textNodes(el).map(node=>({node,original:node.nodeValue}));
  const total=parts.reduce((sum,part)=>sum+[...part.original].filter(isCharacter).length,0);
  if(!total)return;
  const started=performance.now(),duration=Math.min(1500,720+total*20);
  const draw=now=>{
    const progress=Math.min(1,(now-started)/duration);
    const resolved=Math.floor(total*Math.pow(progress,.82));
    let cursor=0;
    parts.forEach((part,partIndex)=>{
      part.node.nodeValue=[...part.original].map((ch,charIndex)=>{
        if(!isCharacter(ch))return ch;
        const index=cursor++;
        return index<resolved||progress===1?ch:pool[(partIndex*31+charIndex*17+Math.floor(now/56))%pool.length];
      }).join('');
    });
    if(progress<1)requestAnimationFrame(draw);
    else parts.forEach(part=>part.node.nodeValue=part.original);
  };
  requestAnimationFrame(draw);
}

const makeObserver=(callback,options)=>!reduce&&'IntersectionObserver'in window?new IntersectionObserver(callback,options):null;
const titleObserver=makeObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    scramble(entry.target);
    titleObserver.unobserve(entry.target);
  });
},{threshold:.2});
const riseObserver=makeObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add('is-latest-in');
    riseObserver.unobserve(entry.target);
  });
},{threshold:.01,rootMargin:'0px 0px -45% 0px'});

function observe(el,kind){
  if(!el||el.dataset.latestMotionReady==='1')return;
  el.dataset.latestMotionReady='1';
  el.classList.add(kind);
  const observer=kind==='latest-scramble'?titleObserver:riseObserver;
  if(reduce||!observer){
    if(kind==='latest-scramble')scramble(el);
    else el.classList.add('is-latest-in');
    return;
  }
  observer.observe(el);
}

function rewriteFirstTitle(){
  const title=main?.querySelector('#brand .hm-section-title');
  if(!title||title.dataset.latestTitleRewritten==='1')return;
  title.dataset.latestTitleRewritten='1';
  title.innerHTML='홈 개편 요청을 받았지만,<br>먼저 고객이 왜 온라인에서<br>하이마트를 선택하지 않는지부터 살펴봤습니다.';
}

function rewriteHeroLead(){
  const lead=document.querySelector('.hm-video-copy .hm-lead');
  if(!lead||lead.dataset.latestLeadRewritten==='1')return;
  lead.dataset.latestLeadRewritten='1';
  lead.innerHTML='화면 개선부터 시작하지 않았습니다. 고객 인식과 실제 유입·탐색·이탈을 확인한 뒤<br>전체 구매 여정의 역할을 다시 정의했습니다.';
}

function applyLatestCopy(){
  const lead=document.querySelector('.hm-video-copy .hm-lead');if(lead){lead.style.color='rgba(255,255,255,.80)';lead.innerHTML='화면 개선부터 시작하지 않았습니다. 고객 인식과 실제 유입·탐색·이탈을 확인한 뒤<br>전체 구매 여정의 역할을 다시 정의했습니다.';}
  const t=document.querySelector('#brand .hm-section-title');if(t)t.innerHTML='홈 개편 요청을 받았지만,<br>먼저 고객이 왜 온라인에서<br>하이마트를 선택하지 않는지부터 살펴봤습니다.';
  const h=[...document.querySelectorAll('#direction h3,#direction h4')].find(x=>x.textContent.includes('각 화면'));
  if(h)h.textContent='그리고 각 화면은, 다음 행동을 만드는 역할로 다시 정의했습니다.';
  const roles=['홈은 보여주는 곳이 아닌\\n원하는 곳으로 보내주는 곳이어야 한다.','선택한 카테고리 안에서는\\n고민의 시간을 줄여야 한다.','검색은 불확실성을\\n확신으로 바꿔줘야 한다.','검색 결과는 단순 상품 목록이 아니라\\n비교를 끝내는 화면이어야 한다.','상세페이지는 설명하는 화면이 아니라\\n결정을 끝내는 화면이어야 한다.','장바구니는 결제 직전의\\n마지막 확신을 줘야 한다.','설치 조율에서는 결제 이후의\\n불안을 일정 확정으로 바꿔야 한다.','마이페이지에서는 구매 이후에도\\n관리받고 있다는 느낌을 줘야 한다.','매장과 온라인은 같은 맥락으로\\n상담과 구매를 이어줘야 한다.'];
  const cards=[...document.querySelectorAll('#direction .role-card,#direction .journey-role-card,#direction article')];roles.forEach((v,i)=>{if(cards[i]){const x=cards[i].querySelector('h4,h3');if(x)x.innerHTML=v.replace('\\n','<br>');const p=cards[i].querySelector('p');if(p)p.textContent=p.textContent.slice(0,Math.ceil(p.textContent.length*.7));}});
}
function prepareMotion(){
  if(!main)return;
  rewriteHeroLead();
  rewriteFirstTitle();
  // Keep numbering static. Random reveal belongs to the title text beneath it.
  const titles=[
    '.hm-section-title','.narrative-title','.hm-subtitle','.data-card-head h3',
    '.forced-redesign-title','.data-bridge-title','.principle-item h4',
    '.design-rule h4','.problem-item h4','.proof-item h4','.signal-item h4',
    '.direction-card h4','.conclusion-card h5','.voice-group-title'
  ];
  main.querySelectorAll(titles.join(',')).forEach(el=>observe(el,'latest-scramble'));
  const content=[
    '.hm-section-desc','.hm-subcopy','.narrative-copy','.hm-source',
    '.problem-item','.proof-item','.signal-item','.principle-item',
    '.design-rule article','.data-card','.keyword-group','.voice-group',
    '.direction-card','.conclusion-card','.brand-synthesis','.narrative-bridge',
    '.sentiment-conclusion','.number-panel','.journey-note','.role-card'
  ];
  main.querySelectorAll(content.join(',')).forEach(el=>observe(el,'latest-rise'));
}

function updateHero(){
  if(!fixed)return;
  const progress=clamp(scrollY/Math.max(1,innerHeight));
  // 10% slower than the prior early phase: 0–38.5% scroll is quick,
  // the final 28% of darkness eases through the rest of the viewport.
  const early=clamp(progress/.385);
  const late=clamp((progress-.385)/.615);
  const fast=t=>1-Math.pow(1-t,3);
  const smooth=t=>t*t*(3-2*t);
  const blackout=clamp(.72*fast(early)+.28*smooth(late));
  fixed.style.setProperty('--hm-video-blackout',blackout.toFixed(4));
  fixed.style.setProperty('--hm-frame-opacity',(1-blackout).toFixed(4));
}

let raf=0;
const requestUpdate=()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;applyLatestCopy();updateHero();prepareMotion();});};
addEventListener('scroll',requestUpdate,{passive:true});
addEventListener('resize',requestUpdate,{passive:true});
if(main&&'MutationObserver'in window)new MutationObserver(()=>{applyLatestCopy();requestUpdate();}).observe(main,{childList:true,subtree:true});
if(video){video.muted=true;video.loop=true;video.playsInline=true;video.play().catch(()=>{});}
applyLatestCopy();prepareMotion();updateHero();
})();