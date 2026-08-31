(()=>{
'use strict';
const q=(r,s)=>r?.querySelector(s)||null;

const bridgeHTML=`사용자 의견에서는 <span class="bridge-quote">'온라인몰이 잘 떠오르지 않는다'</span>는 이야기가 반복됐고, 실제 이용 데이터에서는 <span class="bridge-quote">'들어와도 다음 단계로 이어지지 않는다'</span>는 행동이 확인됐습니다. 두 결과가 같은 방향을 가리켜 목표를 <span class="bridge-quote bridge-quote-excluded">‘화면을 새로 만든다’</span>가 아니라 <span class="bridge-quote">‘고객의 구매 여정 안에 자리를 만든다’</span>로 다시 정의했습니다.`;

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

function apply(){
  const main=document.querySelector('#live-main');
  if(!main)return;

  ['brand','data','journey','direction'].forEach(id=>{
    normalizeTitle(q(main,`#${id} > .hm-wrap > .hm-section-head .hm-section-title`));
  });

  const bridge=q(main,'#data .narrative-signals .narrative-bridge p');
  if(bridge && bridge.dataset.bridgeQuoteFix!=='1'){
    bridge.innerHTML=bridgeHTML;
    bridge.dataset.bridgeQuoteFix='1';
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
else apply();
[80,240,600,1200,2400,4200].forEach(ms=>setTimeout(apply,ms));

if('MutationObserver' in window){
  const mo=new MutationObserver(()=>apply());
  mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  setTimeout(()=>mo.disconnect(),7000);
}
})();
