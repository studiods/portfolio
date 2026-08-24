(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const q=(s,r=main)=>r.querySelector(s);
  const setText=(el,text)=>{if(el)el.textContent=text};
  const setHTML=(el,html)=>{if(el)el.innerHTML=html};

  /* Make the project scope explicit before the reader enters the case-study story. */
  setText(q('.hm-kicker'),'LOTTE HIMART · END-TO-END ONLINE PURCHASE JOURNEY REDESIGN');
  setHTML(q('.hm-title'),'하이마트 온라인 구매여정 전체를<br>처음부터 다시 설계했습니다.');
  setText(q('.hm-hero .hm-lead'),'UX Design Team Lead로 고객이 어디서 들어오고, 무엇을 탐색·비교하고, 어디에서 망설이는지 데이터를 통해 좁힌 뒤 HOME·SEARCH·PDP·INSTALL·CARE까지 하나의 판단 흐름으로 재정의했습니다.');

  const heroBottom=q('.hm-hero-bottom');
  const meta=q('.hm-meta',heroBottom||main);
  q('.simple-project-overview',heroBottom||main)?.remove();
  if(heroBottom){
    const overview=document.createElement('section');
    overview.className='simple-project-overview hm-reveal';
    overview.innerHTML=`
      <div class="simple-overview-head">
        <span>PROJECT AT A GLANCE</span>
        <h2>화면 개편이 아니라,<br>유입부터 설치·케어까지 전체 구매 흐름을 다시 연결한 프로젝트입니다.</h2>
      </div>
      <div class="simple-journey-scope" aria-label="End-to-end purchase journey scope">
        <div><b>ENTRY</b><span>유입</span></div>
        <i></i>
        <div><b>EXPLORE</b><span>탐색</span></div>
        <i></i>
        <div><b>SEARCH</b><span>검색</span></div>
        <i></i>
        <div><b>COMPARE</b><span>비교</span></div>
        <i></i>
        <div><b>DECIDE</b><span>구매 결정</span></div>
        <i></i>
        <div><b>INSTALL</b><span>설치</span></div>
        <i></i>
        <div><b>CARE</b><span>케어</span></div>
      </div>
      <div class="simple-overview-meta">
        <article><span>SCOPE</span><strong>온라인 구매여정 전체</strong><p>유입부터 탐색·비교·구매·설치·케어까지</p></article>
        <article><span>MY ROLE</span><strong>UX Design Team Lead</strong><p>Problem framing · UX direction · Design alignment</p></article>
        <article><span>WHAT CHANGED</span><strong>화면별 역할과 판단 흐름</strong><p>핵심 화면의 정보 위계와 다음 행동 연결 기준 재정의</p></article>
      </div>`;
    if(meta)heroBottom.insertBefore(overview,meta);
    else heroBottom.appendChild(overview);
  }

  /* Re-title each chapter so the reader can follow one continuous decision story. */
  const brand=q('#brand');
  if(brand){
    const head=q(':scope > .hm-wrap > .hm-section-head',brand);
    setText(q('.hm-section-no',head),'01 / WHY REFRAME');
    setHTML(q('.hm-section-title',head),'처음부터 화면 문제로 보지 않았습니다.<br>하이마트가 선택되는 이유부터 다시 확인했습니다.');
    setText(q('.hm-section-desc',head),'고객이 기대한 전문성과 실제 온라인 경험 사이의 간극을 확인해, 무엇을 먼저 풀어야 하는지 문제의 범위를 다시 잡았습니다.');
  }

  const data=q('#data');
  if(data){
    const head=q(':scope > .hm-wrap > .hm-section-head',data);
    setText(q('.hm-section-no',head),'02 / FIND THE SIGNALS');
    setHTML(q('.hm-section-title',head),'많은 데이터 중,<br>설계 결정을 바꾸는 세 신호만 남겼습니다.');
    setText(q('.hm-section-desc',head),'유입 맥락, 검색 행동, 구매 직전 단절을 함께 보며 서로 다른 데이터가 같은 문제를 가리키는지 확인했습니다.');
  }

  const journey=q('#journey');
  if(journey){
    const head=q(':scope > .hm-wrap > .hm-section-head',journey);
    setText(q('.hm-section-no',head),'03 / DEFINE THE JOURNEY');
    setHTML(q('.hm-section-title',head),'세 신호를 하나로 연결하자,<br>고쳐야 할 것은 화면이 아니라 구매 흐름이었습니다.');
    setText(q('.hm-section-desc',head),'앞선 맥락이 다음 판단까지 이어지도록 전체 구매여정의 역할을 다시 정의하고, 팀이 공통으로 사용할 설계 원칙으로 만들었습니다.');
  }

  const direction=q('#direction');
  if(direction){
    const head=q(':scope > .hm-wrap > .hm-section-head',direction);
    setText(q('.hm-section-no',head),'04 / APPLY TO SCREENS');
    setHTML(q('.hm-section-title',head),'정의한 구매 흐름을<br>핵심 화면의 역할과 정보 순서로 옮겼습니다.');
    setText(q('.hm-section-desc',head),'HOME·SEARCH/SRP·PDP·HI CHECK에서 앞선 맥락을 유지하고 다음 판단으로 이어지도록 정보 위계와 행동 연결을 맞췄습니다.');
  }

  const leadership=q('#leadership');
  if(leadership){
    const head=q(':scope > .hm-wrap > .hm-section-head',leadership);
    setText(q('.hm-section-no',head),'05 / LEADERSHIP');
    setHTML(q('.hm-section-title',head),'리드로서 만든 것은 화면뿐 아니라,<br>팀이 같은 기준으로 판단하는 방식이었습니다.');
    setText(q('.hm-section-desc',head),'문제를 좁히고 우선순위를 정한 뒤, 화면별 역할과 정보 위계를 하나의 구매여정 기준으로 정렬했습니다.');
  }
})();
