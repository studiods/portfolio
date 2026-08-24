(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const q=(s,r=main)=>r.querySelector(s);
  const qa=(s,r=main)=>[...r.querySelectorAll(s)];
  const setText=(el,text)=>{if(el)el.textContent=text};
  const setHTML=(el,html)=>{if(el)el.innerHTML=html};
  const sectionHead=(section)=>q(':scope > .hm-wrap > .hm-section-head',section);

  /* HERO — state the leadership problem, not the screen output. */
  setText(q('.hm-kicker'),'LOTTE HIMART · ONLINE UX REFRAMING');
  setHTML(q('.hm-title'),'화면을 바꾸기 전에,<br>구매 여정의 문제부터 다시 정의했습니다.');
  setText(q('.hm-hero .hm-lead'),'UX Design Team Lead로 고객 인식과 이용 데이터를 연결해 문제를 좁히고, 홈·검색·PDP·설치·케어가 하나의 판단 흐름으로 이어지도록 설계 기준을 만들었습니다.');

  /* 01 — keep only the customer expectation vs. online gap. */
  const brand=q('#brand');
  if(brand){
    const wrap=q(':scope > .hm-wrap',brand);
    const head=sectionHead(brand);
    setText(q('.hm-section-no',head),'01 / PROBLEM REFRAME');
    setHTML(q('.hm-section-title',head),'하이마트의 강점은 전문성이었지만,<br>온라인에서는 구매 확신으로 이어지지 않았습니다.');
    setText(q('.hm-section-desc',head),'고객이 기대한 것은 설치·A/S·상담의 신뢰였습니다. 실제 온라인에서는 혜택·배송·설치 정보가 분산되고 화면이 바뀔 때마다 판단 맥락이 약해졌습니다.');
    qa(':scope > *',wrap).forEach(el=>{if(el!==head)el.remove()});
    const evidence=document.createElement('div');
    evidence.className='simple-evidence hm-reveal';
    evidence.innerHTML=`
      <article><span>EXPECTATION</span><h3>실패 가능성을 낮춰주는 전문성</h3><p>설치·A/S·매장 체험·전문가 상담이 하이마트를 선택하는 핵심 이유였습니다.</p></article>
      <article><span>GAP</span><h3>온라인에서 끊기는 신뢰</h3><p>복잡한 혜택, 배송·설치 불확실성, 정보 차이가 전문성에 대한 기대를 불신으로 바꿨습니다.</p></article>`;
    wrap.appendChild(evidence);
  }

  /* 02 — three decision-making signals only. */
  const data=q('#data');
  if(data){
    const wrap=q(':scope > .hm-wrap',data);
    const head=sectionHead(data);
    const allCards=qa('.data-card',data);
    const byNo=(no)=>allCards.find(card=>q('.hm-card-no',card)?.textContent.includes(no));
    const entry=byNo('02.1');
    const search=byNo('02.4');
    const gap=byNo('02.6');
    const list=q('.data-list',data);

    setText(q('.hm-section-no',head),'02 / READ THE SIGNALS');
    setHTML(q('.hm-section-title',head),'데이터를 많이 보여주는 대신,<br>의사결정에 필요한 신호만 남겼습니다.');
    setText(q('.hm-section-desc',head),'유입 맥락, 검색 행동, 구매 직전 단절. 세 신호가 같은 문제를 가리키는지 확인했습니다.');

    if(list){
      list.innerHTML='';
      [entry,search,gap].filter(Boolean).forEach(card=>list.appendChild(card));
    }
    qa(':scope > *',wrap).forEach(el=>{if(el!==head&&el!==list)el.remove()});

    if(entry){
      setText(q('.hm-card-no',entry),'02.1 / ENTRY CONTEXT');
      setHTML(q('h3',entry),'고객은 홈에서만<br>시작하지 않았습니다.');
      setHTML(q('.desc',entry),'AD 52%, Direct 31%, CPS 10%, CRM 6%. <span class="data-emphasis">시작 맥락을 다음 탐색까지 이어주는 구조</span>가 필요했습니다.');
    }
    if(search){
      setText(q('.hm-card-no',search),'02.2 / SEARCH INTENT');
      setHTML(q('h3',search),'검색은 보조 기능이 아니라,<br>후보를 만드는 핵심 행동이었습니다.');
      setHTML(q('.desc',search),'검색 비중은 3.26%에서 9.34%로 높아졌습니다. <span class="data-emphasis">고객은 검색에서 구매 조건을 구체화</span>하고 있었습니다.');
    }
    if(gap){
      setText(q('.hm-card-no',gap),'02.3 / CONTINUITY GAP');
      setHTML(q('h3',gap),'유입보다 더 큰 문제는,<br>다음 행동으로 이어지지 않는 것이었습니다.');
      setHTML(q('.desc',gap),'기획전 바로 종료 52.2%, PDP 이용은 늘었지만 장바구니·구매는 감소했습니다. <span class="data-emphasis">화면 사이 판단 맥락의 단절</span>로 읽었습니다.');
    }

    const conclusion=document.createElement('div');
    conclusion.className='simple-conclusion hm-reveal';
    conclusion.innerHTML=`<span>MY READ</span><p>문제는 특정 화면의 완성도가 아니라, <strong>유입 맥락 → 탐색 → 비교 → 구매 확신 → 설치·케어</strong>가 서로 이어지지 않는 구조였습니다.</p>`;
    wrap.appendChild(conclusion);
  }

  /* 03 — show the decisions the team could design against. */
  const journey=q('#journey');
  if(journey){
    const wrap=q(':scope > .hm-wrap',journey);
    const head=sectionHead(journey);
    setText(q('.hm-section-no',head),'03 / MAKE THE DECISION');
    setHTML(q('.hm-section-title',head),'그래서 화면을 더 만드는 대신,<br>각 화면의 역할부터 다시 정의했습니다.');
    setText(q('.hm-section-desc',head),'팀이 같은 기준으로 판단할 수 있도록 전체 구매 여정을 세 가지 설계 원칙으로 압축했습니다.');
    qa(':scope > *',wrap).forEach(el=>{if(el!==head)el.remove()});

    const principles=document.createElement('div');
    principles.className='simple-principles hm-reveal';
    principles.innerHTML=`
      <article><span>01 / CONTEXT FIRST</span><h3>앞선 맥락을 기억합니다.</h3><p>관심 상품·혜택·검색 조건을 다음 화면까지 유지합니다.</p></article>
      <article><span>02 / DECISION FIRST</span><h3>판단 기준을 먼저 보여줍니다.</h3><p>가격·혜택·설치·리뷰를 같은 순서로 비교하게 합니다.</p></article>
      <article><span>03 / AFTER PURCHASE</span><h3>구매 이후도 한 여정으로 봅니다.</h3><p>설치·보증·A/S·케어를 구매 이후 관계로 연결합니다.</p></article>`;

    const roles=document.createElement('div');
    roles.className='simple-role-block hm-reveal';
    roles.innerHTML=`<div class="simple-block-head"><span>KEY SURFACES</span><h3>핵심 네 화면의 역할만 먼저 고정했습니다.</h3></div><div class="simple-role-grid">
      <article><span>HOME</span><p>유입과 최근 행동을 기억하고 다음 목적지로 연결합니다.</p></article>
      <article><span>SEARCH</span><p>추천검색과 필터로 모호한 요구를 상품 후보로 구체화합니다.</p></article>
      <article><span>PDP</span><p>가격·혜택·설치·리뷰를 한 흐름에서 판단하게 합니다.</p></article>
      <article><span>CARE</span><p>보증·A/S·케어를 구매 이후에도 하나의 관계로 이어갑니다.</p></article>
    </div>`;
    wrap.append(principles,roles);
  }

  /* 04 — proof in four representative screens. */
  const direction=q('#direction');
  if(direction){
    const wrap=q(':scope > .hm-wrap',direction);
    const head=sectionHead(direction);
    const proto=q('.prototype-case-list',direction);
    setText(q('.hm-section-no',head),'04 / PROOF IN SCREENS');
    setHTML(q('.hm-section-title',head),'설계 원칙은 네 개의 핵심 화면에서<br>같은 방식으로 검증했습니다.');
    setText(q('.hm-section-desc',head),'HOME, SRP, PDP, HI CHECK에서 정보 위계와 다음 행동의 연결 방식을 맞췄습니다.');
    qa(':scope > *',wrap).forEach(el=>{if(el!==head&&el!==proto)el.remove()});
    if(proto&&!proto.parentElement?.isSameNode(wrap))wrap.appendChild(proto);
    if(proto){
      const cases=qa('.prototype-case',proto);
      const labels=['HOME','SEARCH / SRP','PDP','HI CHECK'];
      const titles=['다음 목적지를 여는 허브','후보를 더 빨리 좁히는 검색','구매 확신을 만드는 정보 순서','전문 정보를 생활 기준으로 번역'];
      const descs=[
        '검색·카테고리·혜택과 주요 서비스를 이어 유입 맥락을 다시 탐색하지 않게 했습니다.',
        '검색 조건을 유지하고 핵심 필터와 상품 정보로 후보를 빠르게 압축했습니다.',
        '가격·혜택·배송·설치를 우선순위로 연결해 구매 직전 재확인 부담을 줄였습니다.',
        '용량·전기료·설치 크기 같은 수치를 생활 기준으로 풀어 이해 부담을 낮췄습니다.'
      ];
      cases.forEach((card,i)=>{
        setText(q('.hm-card-no',card),labels[i]||'');
        setText(q('h3',card),titles[i]||'');
        setText(q('p',card),descs[i]||'');
        q('strong',card)?.remove();
      });
    }
  }

  /* 05 — make lead-level ownership explicit without inventing outcomes. */
  if(direction){
    const lead=document.createElement('section');
    lead.id='leadership';
    lead.className='hm-section simple-leadership';
    lead.innerHTML=`<div class="hm-wrap"><div class="hm-section-head hm-reveal"><span class="hm-section-no">05 / MY ROLE AS UX LEAD</span><h2 class="hm-section-title">제가 만든 것은 화면보다,<br>팀이 판단할 수 있는 기준이었습니다.</h2><p class="hm-section-desc">문제를 좁히고 우선순위를 정한 뒤, 화면별 역할과 정보 위계를 하나의 구매 여정 기준으로 맞췄습니다.</p></div><div class="simple-lead-grid hm-reveal">
      <article><span>FRAME</span><h3>문제 범위 재정의</h3><p>정성 인식과 이용 데이터를 연결해 화면 문제가 아닌 구매 여정 문제로 다시 정의했습니다.</p></article>
      <article><span>PRIORITIZE</span><h3>신호 선택과 우선순위</h3><p>모든 데이터를 나열하지 않고 실제 설계 의사결정을 바꾸는 신호를 중심으로 판단했습니다.</p></article>
      <article><span>ALIGN</span><h3>팀 설계 기준 통일</h3><p>HOME·SEARCH·PDP·CARE가 앞선 맥락을 받아 다음 판단으로 넘기도록 역할을 정리했습니다.</p></article>
      <article><span>VALIDATE</span><h3>검증과 조정</h3><p>내부 검증을 통해 정보 위계와 화면 간 연결 방식을 반복해서 조정했습니다.</p></article>
    </div></div>`;
    direction.insertAdjacentElement('afterend',lead);
  }

  /* Keep only large-title motion; small labels should remain instantly legible. */
  qa('.hm-section-no,.hm-card-no,.hm-subno,.hm-role-name').forEach(el=>el.dataset.numberedGroupScramblePlayed='1');
  qa('.flow-label').forEach(el=>el.dataset.flowLabelScramblePlayed='1');
})();
