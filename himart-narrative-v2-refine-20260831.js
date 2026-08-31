(()=>{
'use strict';

const expectedTitles={
  brand:'구매 여정을 개선하기 전에,<br>왜 고객이 온라인에서 하이마트를<br>선택하지 않는지부터 정의했습니다.',
  data:'고객의 목소리에서 드러난 문제는<br>실제 이용 패턴에서도 반복됐습니다.',
  journey:'앞선 데이터를 바탕으로,<br>구매 여정의 흐름과 각 화면의 역할을<br>다시 정의했습니다.',
  direction:'앞서 정의한 UX 전략을 바탕으로<br>빠르게 프로토타입을 만들고, 내부 검증을 반복하고 있습니다.'
};

const productionRoles=[
  ['HOME','탐색을 시작시키는 허브','최근 행동과 유입 맥락을 기억하고 검색·카테고리·혜택·주요 서비스로 빠르게 이동시킵니다. 홈의 역할을 ‘많이 보여주기’보다 ‘다음 목적지 연결’에 둡니다.'],
  ['SUBHOME / CATEGORY','구매 목적을 구체화하는 화면','품목 분류만 나열하지 않고 사용 상황·공간·가구 형태·설치 조건처럼 실제 구매 기준을 중심으로 탐색 방향을 잡아줍니다.'],
  ['SEARCH','니즈를 상품 후보로 바꾸는 도구','추천검색, 가이드, 동적 필터와 AI 요약을 통해 모호한 요구를 실제 상품 후보로 구체화하고 고관여 가전의 학습 비용을 낮춥니다.'],
  ['SRP / PLP','후보를 빠르게 압축하는 비교 화면','대표 가격·혜택·리뷰·설치 조건과 핵심 스펙을 같은 기준으로 비교하고 검색에서 사용한 필터와 맥락을 목록까지 유지합니다.'],
  ['PDP','구매 확신을 완료하는 곳','가격과 혜택, 리뷰, 설치 조건, 매장 실물 확인, 전문 상담과 케어 정보를 하나의 판단 흐름으로 연결합니다.'],
  ['CART / PAY','최종 조건을 확인하고 확정하는 화면','총 결제금액, 적용 혜택, 배송·설치 조건을 명확히 고정해서 보여주고 구매에 필요한 입력만 남깁니다.'],
  ['INSTALL / CARE','관리 관계가 시작되는 화면','설치 일정, 폐가전 회수, 보증, A/S와 케어 상태를 하나의 흐름으로 연결해 구매 이후에도 관리가 이어지도록 합니다.']
];

function alignProofCopy(){
  document.querySelectorAll('#brand .narrative-reality .proof-item h4').forEach(h=>{
    h.style.setProperty('min-height','2.76em','important');
    h.style.setProperty('display','block','important');
  });
  document.querySelectorAll('#brand .narrative-reality .proof-item p').forEach(p=>{
    p.style.setProperty('margin','40px 0 0','important');
    p.style.setProperty('padding-top','0','important');
  });
}

function updateRealityTitle(){
  const title=document.querySelector('#brand .narrative-reality .narrative-title');
  if(title)title.innerHTML="'가전하면 하이마트'는 여전했습니다.<br>다만 이 상징성이 온라인 경험으로<br>이어지지 않는 것이 문제였습니다.";
}

function removeBodyEmphasis(){
  const selectors=[
    '#live-main p strong','#live-main p b',
    '#live-main .hm-section-desc strong','#live-main .hm-section-desc b',
    '#live-main .narrative-copy strong','#live-main .narrative-copy b',
    '#live-main .hm-subcopy strong','#live-main .hm-subcopy b',
    '#live-main .journey-block-copy strong','#live-main .journey-block-copy b'
  ].join(',');
  document.querySelectorAll(selectors).forEach(el=>el.replaceWith(document.createTextNode(el.textContent||'')));
}

function rebuildRoleDefinition(){
  const block=document.querySelector('#journey .journey-role-block');
  if(!block)return;
  const label=block.querySelector('.narrative-subno');
  if(label)label.textContent='03.2 / ROLE DEFINITION';
  const title=block.querySelector('.journey-block-title');
  if(title)title.innerHTML='그리고 각 화면의 역할을<br>다시 정의했습니다.';
  const copy=block.querySelector('.journey-block-copy');
  if(copy)copy.textContent='홈부터 결제까지 화면을 개별 산출물로 보지 않고, 앞 단계에서 받은 맥락을 다음 판단으로 넘기는 역할로 정의했습니다. 이 정의가 이후 프로토타입의 정보 우선순위와 인터랙션을 결정하는 기준이 됐습니다.';
  let grid=block.querySelector('.journey-role-grid');
  if(!grid){
    grid=document.createElement('div');
    grid.className='journey-role-grid';
    block.appendChild(grid);
  }
  const signature=productionRoles.map(x=>x.join('|')).join('||');
  if(grid.dataset.productionRoles===signature)return;
  grid.innerHTML=productionRoles.map(([k,t,p])=>`<article><small>${k}</small><h4>${t}</h4><p>${p}</p></article>`).join('');
  grid.dataset.productionRoles=signature;
}

const timers=new WeakMap();
function armTitleGuard(title,html){
  if(!title)return;
  title.dataset.numberedGroupScramblePlayed='1';
  title.dataset.wideLargeScramblePlayed='1';
  title.dataset.v2CanonicalTitle='1';

  const restore=()=>{
    if(title.innerHTML!==html)title.innerHTML=html;
  };
  const schedule=()=>{
    const old=timers.get(title); if(old)clearTimeout(old);
    timers.set(title,setTimeout(restore,320));
  };
  if(!title.dataset.v2GuardBound){
    title.dataset.v2GuardBound='1';
    if('MutationObserver' in window){
      const mo=new MutationObserver(schedule);
      mo.observe(title,{childList:true,subtree:true,characterData:true});
    }
  }
  [0,760,1600].forEach(ms=>setTimeout(restore,ms));
}

function guardChapterTitles(){
  Object.entries(expectedTitles).forEach(([id,html])=>{
    const title=document.querySelector(`#${id} > .hm-wrap > .hm-section-head .hm-section-title`);
    armTitleGuard(title,html);
  });
}

function run(){
  alignProofCopy();
  updateRealityTitle();
  rebuildRoleDefinition();
  removeBodyEmphasis();
  guardChapterTitles();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
else run();
[80,240,600,1200,2400,5000].forEach(ms=>setTimeout(run,ms));
})();
