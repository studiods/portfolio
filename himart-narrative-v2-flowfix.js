(()=>{
'use strict';

const node=(n,t,p)=>`<article class="flow-node"><span class="hm-card-no">${n}</span><h4>${t}</h4><p>${p}</p></article>`;
const arrow=()=>'<div class="flow-arrow" aria-hidden="true">›</div>';

/* Copied from production himart-wide-refine-v10.js.
   Only the wrapped node range and label text are changed for this Narrative flow. */
const unwrap=(row)=>{
  [...row.querySelectorAll(':scope > .wide-flow-cluster')].forEach(cluster=>{
    const inner=cluster.querySelector('.wide-flow-cluster-inner');
    if(inner)[...inner.children].forEach(child=>row.insertBefore(child,cluster));
    cluster.remove();
  });
};
const build=(group,nodeCount,label,klass,startIndex=0)=>{
  if(!group)return;
  const row=group.querySelector('.flow-row');
  if(!row)return;
  const children=[...row.children];
  const moveCount=nodeCount*2-1;
  const moving=children.slice(startIndex,startIndex+moveCount);
  if(!moving.length)return;
  const anchor=moving[0];
  const cluster=document.createElement('div');
  cluster.className=`wide-flow-cluster v12-journey-tablet ${klass||''}`.trim();
  cluster.innerHTML=`<div class="wide-flow-cluster-label">${label||''}</div><div class="wide-flow-cluster-inner"></div>`;
  const inner=cluster.querySelector('.wide-flow-cluster-inner');
  row.insertBefore(cluster,anchor);
  moving.forEach(el=>inner.appendChild(el));
};

function rebuild(block){
  block.className='hm-subsection journey-redesign-subsection journey-flow-block narrative-block hm-reveal';
  block.innerHTML=`
    <span class="narrative-subno">03.1 / JOURNEY FLOW</span>
    <h3 class="journey-block-title">화면 순서가 아니라,<br>고객 판단의 흐름으로 다시 연결했습니다.</h3>
    <p class="journey-block-copy">유입 이후 다음 행동이 끊기지 않도록 고객 판단 흐름으로 다시 연결했습니다.</p>
    <div class="journey-stage-flow flow-groups">
      <div class="flow-group">
        <div class="flow-row">
          ${node('01','유입','광고·검색·CRM의 맥락을 이어받습니다.')}
          ${arrow()}
          ${node('02','탐색','목적에 맞는 상품 탐색을 바로 시작합니다.')}
          ${arrow()}
          ${node('03','후보 압축','비교할 후보를 빠르게 줄입니다.')}
          ${arrow()}
          ${node('04','비교·판단','가격·혜택·설치 조건으로 판단합니다.')}
        </div>
      </div>
      <div class="flow-group">
        <div class="flow-row">
          ${node('05','장바구니','선택 상품과 조건을 다시 확인합니다.')}
          ${arrow()}
          ${node('06','결제','최종 비용과 혜택을 명확히 확정합니다.')}
          ${arrow()}
          ${node('07','설치','일정·회수·설치를 끊김 없이 잇습니다.')}
          ${arrow()}
          ${node('08','관리','A/S·케어·재구매로 관계를 이어갑니다.')}
        </div>
      </div>
    </div>`;

  const groups=[...block.querySelectorAll('.flow-group')];
  /* Narrative-only grouping change: 01-02 and 06-07. */
  build(groups[0],2,'유입 맥락을 유지해 탐색 시작으로 연결','wide-flow-cluster--focus',0);
  build(groups[1],2,'결제 조건을 명확히 해 이탈을 줄이고 설치 확신까지 연결','wide-flow-cluster--focus',2);
  block.dataset.v2ProductionExact='1';
}

function mount(){
  const block=document.querySelector('#journey .journey-flow-block');
  if(!block){setTimeout(mount,60);return}
  if(block.dataset.v2ProductionExact==='1')return;
  rebuild(block);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
[120,420,900,1600,2800].forEach(ms=>setTimeout(mount,ms));

if('MutationObserver' in window){
  const mo=new MutationObserver(()=>{
    const block=document.querySelector('#journey .journey-flow-block');
    if(block&&block.dataset.v2ProductionExact!=='1')mount();
  });
  mo.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>mo.disconnect(),6000);
}
})();
