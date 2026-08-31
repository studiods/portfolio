(()=>{
'use strict';
const q=(r,s)=>r?.querySelector(s)||null;
const qa=(r,s)=>r?[...r.querySelectorAll(s)]:[];

const bridgeHTML=`사용자 의견에서는 <span class="bridge-quote bridge-quote-1">'온라인몰이 잘 떠오르지 않는다'</span>는 이야기가 반복됐고, 실제 이용 데이터에서는 <span class="bridge-quote bridge-quote-2">'들어와도 다음 단계로 이어지지 않는다'</span>는 행동이 확인됐습니다. 두 결과가 같은 방향을 가리켜 목표를 <span class="bridge-quote bridge-quote-excluded">‘화면을 새로 만든다’</span>가 아니라 <span class="bridge-quote bridge-quote-4">‘고객의 구매 여정 안에 자리를 만든다’</span>로 다시 정의했습니다.`;
const bridgeText=`사용자 의견에서는 '온라인몰이 잘 떠오르지 않는다'는 이야기가 반복됐고, 실제 이용 데이터에서는 '들어와도 다음 단계로 이어지지 않는다'는 행동이 확인됐습니다. 두 결과가 같은 방향을 가리켜 목표를 ‘화면을 새로 만든다’가 아니라 ‘고객의 구매 여정 안에 자리를 만든다’로 다시 정의했습니다.`;

function normalizeTitle(title){
  if(!title)return;
  title.style.setProperty('font-size','52px','important');
  title.style.setProperty('font-family','var(--hm-ko)','important');
  title.style.setProperty('font-weight','100','important');
  title.style.setProperty('line-height','1.12','important');
  title.style.setProperty('position','static','important');
  title.style.setProperty('display','block','important');
  title.style.setProperty('visibility','visible','important');
  title.style.setProperty('opacity','1','important');
  title.style.setProperty('color','#fff','important');
  title.style.setProperty('-webkit-text-fill-color','#fff','important');
  title.style.removeProperty('text-indent');
  title.removeAttribute('aria-label');
  title.removeAttribute('data-text');
}

function bridgeMarkupIsCorrect(bridge){
  if(!bridge)return false;
  const spans=qa(bridge,':scope > .bridge-quote');
  if(spans.length!==4)return false;
  if((bridge.textContent||'').replace(/\s+/g,' ').trim()!==bridgeText.replace(/\s+/g,' ').trim())return false;
  return !!q(bridge,'.bridge-quote-1') && !!q(bridge,'.bridge-quote-2') && !!q(bridge,'.bridge-quote-excluded') && !!q(bridge,'.bridge-quote-4');
}

function lockBridgeStyles(bridge){
  if(!bridge)return;
  bridge.style.setProperty('opacity','1','important');
  bridge.style.setProperty('color','rgba(255,255,255,.50)','important');
  bridge.style.setProperty('-webkit-text-fill-color','rgba(255,255,255,.50)','important');
  bridge.style.setProperty('font-family','Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif','important');
  bridge.style.setProperty('font-weight','100','important');

  qa(bridge,'.bridge-quote:not(.bridge-quote-excluded)').forEach(span=>{
    span.style.setProperty('display','inline','important');
    span.style.setProperty('color','#fff','important');
    span.style.setProperty('-webkit-text-fill-color','#fff','important');
    span.style.setProperty('opacity','1','important');
    span.style.setProperty('font-family','Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif','important');
    span.style.setProperty('font-weight','300','important');
    span.style.setProperty('font-style','normal','important');
  });

  const excluded=q(bridge,'.bridge-quote-excluded');
  if(excluded){
    excluded.style.setProperty('display','inline','important');
    excluded.style.setProperty('color','rgba(255,255,255,.50)','important');
    excluded.style.setProperty('-webkit-text-fill-color','rgba(255,255,255,.50)','important');
    excluded.style.setProperty('opacity','1','important');
    excluded.style.setProperty('font-family','Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif','important');
    excluded.style.setProperty('font-weight','100','important');
    excluded.style.setProperty('font-style','normal','important');
  }
}

function applyBridge(main){
  const bridge=q(main,'#data .narrative-signals .narrative-bridge p');
  if(!bridge)return;

  /* final.js can rewrite this block later with <strong>. Do not use a one-time dataset guard.
     Rebuild only when the requested span structure has been replaced. */
  if(!bridgeMarkupIsCorrect(bridge))bridge.innerHTML=bridgeHTML;
  lockBridgeStyles(bridge);
}

function apply(){
  const main=document.querySelector('#live-main');
  if(!main)return;

  ['brand','data','journey','direction'].forEach(id=>{
    normalizeTitle(q(main,`#${id} > .hm-wrap > .hm-section-head .hm-section-title`));
  });
  applyBridge(main);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
else apply();
[40,100,180,320,600,1000,1600,2400,3600,5200,7600,11000,16000].forEach(ms=>setTimeout(apply,ms));

/* Keep this lock active because the legacy narrative script also has delayed DOM rewrites.
   The observer only reacts to child/text mutations, so the inline style lock does not recurse. */
if('MutationObserver' in window){
  const mo=new MutationObserver(()=>apply());
  mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
}
})();
