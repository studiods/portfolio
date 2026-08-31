(()=>{
'use strict';

const flowNodes=[
  ['01','유입','광고·검색·CRM의 맥락을 이어받습니다.'],
  ['02','탐색','목적에 맞는 상품 탐색을 바로 시작합니다.'],
  ['03','후보 압축','비교할 후보를 빠르게 줄입니다.'],
  ['04','비교·판단','가격·혜택·설치 조건으로 판단합니다.'],
  ['05','장바구니','선택 상품과 조건을 다시 확인합니다.'],
  ['06','결제','최종 비용과 혜택을 명확히 확정합니다.'],
  ['07','설치','일정·회수·설치를 끊김 없이 잇습니다.'],
  ['08','관리','A/S·케어·재구매로 관계를 이어갑니다.']
];

const gapTitles={
  '01':'외부 유입',
  '02':'홈·서브홈<br>이벤트·PDP',
  '03':'검색·카테고리',
  '04':'SRP·PLP',
  '05':'PDP',
  '06':'장바구니·결제',
  '07':'배송·설치',
  '08':'보증·A/S·케어'
};
const reconnectTitles={
  '01':'외부·직접 유입',
  '02':'맥락을 이어주는 랜딩',
  '03':'빠른 탐색 시작',
  '04':'후보 압축·비교',
  '05':'구매 확신 형성',
  '06':'조건이 명확한 주문',
  '07':'설치·회수 확정',
  '08':'보증·A/S·케어'
};

const node=(n,t,p)=>`<article class="journey-diagram-node"><small>${n}</small><h5>${t}</h5><p>${p}</p></article>`;
const arrow=()=>'<div class="journey-diagram-arrow" aria-hidden="true"></div>';

function rebuildJourneyFlow(){
  const block=document.querySelector('#journey .journey-flow-block');
  const stage=block?.querySelector('.journey-stage-flow');
  if(!block||!stage)return false;
  if(stage.dataset.productionCircleCopy==='1')return true;

  const title=block.querySelector('.journey-block-title');
  const copy=block.querySelector('.journey-block-copy');
  if(title)title.innerHTML='화면 순서가 아니라,<br>고객 판단의 흐름으로 다시 연결했습니다.';
  if(copy)copy.textContent='유입 이후 다음 행동이 끊기지 않도록 고객 판단 흐름으로 다시 연결했습니다.';

  stage.innerHTML=`
    <div class="journey-diagram journey-diagram--blue journey-flow-copy">
      <div class="journey-diagram-row">
        <div class="journey-diagram-group first-two"><span class="journey-diagram-group-label">유입 맥락을 유지해 탐색 시작으로 연결</span></div>
        ${node(...flowNodes[0])}
        ${arrow()}
        ${node(...flowNodes[1])}
        ${arrow()}
        ${node(...flowNodes[2])}
        ${arrow()}
        ${node(...flowNodes[3])}
      </div>
      <div class="journey-diagram-row">
        <div class="journey-diagram-group middle-two"><span class="journey-diagram-group-label">결제 조건을 명확히 해 이탈을 줄이고 설치 확신까지 연결</span></div>
        ${node(...flowNodes[4])}
        ${arrow()}
        ${node(...flowNodes[5])}
        ${arrow()}
        ${node(...flowNodes[6])}
        ${arrow()}
        ${node(...flowNodes[7])}
      </div>
    </div>`;
  stage.dataset.productionCircleCopy='1';
  return true;
}

function numberFromNode(el){
  const small=el.querySelector('small,.hm-card-no');
  const m=(small?.textContent||'').match(/\b(0[1-8])\b/);
  return m?.[1]||null;
}

function ensureDiagramTitles(){
  const blocks=[...document.querySelectorAll('#journey .journey-more-wrap .journey-deep-block,#journey details.hm-more .journey-deep-block')];
  blocks.forEach((block,bi)=>{
    const isReconnect=/RECONNECTION|끊어진 지점/.test(block.textContent||'') || bi===1;
    const map=isReconnect?reconnectTitles:gapTitles;
    const nodes=[...block.querySelectorAll('.journey-diagram-node,.flow-node')];
    nodes.forEach(el=>{
      const n=numberFromNode(el);
      if(!n||!map[n])return;
      let h=el.querySelector('h5');
      if(!h){
        h=document.createElement('h5');
        const small=el.querySelector('small,.hm-card-no');
        if(small)small.insertAdjacentElement('afterend',h); else el.prepend(h);
      }
      h.innerHTML=map[n];
      h.style.setProperty('display','block','important');
      h.style.setProperty('visibility','visible','important');
      h.style.setProperty('opacity','1','important');
    });
  });
}

function alignProofCopy(){
  document.querySelectorAll('#brand .narrative-reality .proof-item h4').forEach(h=>{
    h.style.setProperty('min-height','52.5px','important');
  });
  document.querySelectorAll('#brand .narrative-reality .proof-item p').forEach(p=>{
    p.style.setProperty('margin','40px 0 0','important');
    p.style.setProperty('padding-top','0','important');
  });
}

function run(){
  rebuildJourneyFlow();
  ensureDiagramTitles();
  alignProofCopy();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
else run();
[80,240,600,1200,2400].forEach(ms=>setTimeout(run,ms));

document.addEventListener('toggle',e=>{
  if(e.target?.matches?.('#journey details.hm-more'))setTimeout(ensureDiagramTitles,20);
},true);
})();
