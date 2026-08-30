(()=>{
  'use strict';

  const principleMarkup=`
    <article class="principle-item"><small>01 / FAMILIARITY</small><h4>익숙한 경험이<br>먼저입니다.</h4><p>검색·필터·상품카드·결제처럼 이미 학습한 커머스 문법은 그대로 활용합니다.</p></article>
    <article class="principle-item"><small>02 / NEXT STEP</small><h4>이어지는 경험을<br>만듭니다.</h4><p>각 화면의 역할을 ‘머무르게 하는 것’이 아니라 다음 판단으로 자연스럽게 보내는 데 둡니다.</p></article>
    <article class="principle-item"><small>03 / OMNI</small><h4>매장과 사람을<br>연결합니다.</h4><p>실물 확인과 전문가 상담이 필요한 순간 온라인에서 자연스럽게 오프라인 강점으로 연결합니다.</p></article>
    <article class="principle-item"><small>04 / NARROW</small><h4>고민의 시간을<br>줄입니다.</h4><p>카테고리 안에서는 많이 찾는 상품과 선택 기준을 먼저 보여 후보를 빠르게 좁힙니다.</p></article>
    <article class="principle-item"><small>05 / CONFIDENCE</small><h4>불확실성을<br>확신으로 바꿉니다.</h4><p>검색과 비교 과정에서 모호한 니즈를 구체적인 상품 후보와 판단 기준으로 바꿉니다.</p></article>
    <article class="principle-item"><small>06 / DECISION</small><h4>결정을 끝낼 수<br>있게 합니다.</h4><p>상세페이지에서 가격·혜택·설치·상담·케어를 함께 판단해 구매 결정을 완료하도록 돕습니다.</p></article>`;

  const flowMarkup=`
    <div class="journey-flow-row row4">
      <article class="flow-node"><span class="hm-card-no">01</span><h4>유입</h4><p>광고·검색·CRM의 맥락을 이어받습니다.</p></article>
      <div class="flow-arrow" aria-hidden="true"></div>
      <article class="flow-node"><span class="hm-card-no">02</span><h4>탐색</h4><p>목적에 맞는 상품 탐색을 시작합니다.</p></article>
      <div class="flow-arrow" aria-hidden="true"></div>
      <article class="flow-node"><span class="hm-card-no">03</span><h4>후보 압축</h4><p>비교할 후보를 빠르게 줄입니다.</p></article>
      <div class="flow-arrow" aria-hidden="true"></div>
      <article class="flow-node"><span class="hm-card-no">04</span><h4>비교·판단</h4><p>가격·혜택·설치 조건으로 판단합니다.</p></article>
    </div>
    <div class="journey-flow-row row4">
      <article class="flow-node"><span class="hm-card-no">05</span><h4>장바구니</h4><p>선택 상품과 조건을 다시 확인합니다.</p></article>
      <div class="flow-arrow" aria-hidden="true"></div>
      <article class="flow-node"><span class="hm-card-no">06</span><h4>결제</h4><p>최종 비용과 혜택을 확정합니다.</p></article>
      <div class="flow-arrow" aria-hidden="true"></div>
      <article class="flow-node"><span class="hm-card-no">07</span><h4>설치</h4><p>일정·회수·설치를 끊김 없이 잇습니다.</p></article>
      <div class="flow-arrow" aria-hidden="true"></div>
      <article class="flow-node"><span class="hm-card-no">08</span><h4>관리</h4><p>A/S·케어·재구매로 관계를 이어갑니다.</p></article>
    </div>`;

  const forceVisible=(el)=>{
    if(!el)return;
    el.classList.remove('hm-reveal','wide-rise-target');
    el.classList.add('is-in','is-wide-rise-in');
    el.hidden=false;
    el.style.setProperty('opacity','1','important');
    el.style.setProperty('visibility','visible','important');
    el.style.setProperty('transform','none','important');
  };

  const applyHeading=(wrap)=>{
    const head=wrap?.querySelector(':scope > .hm-section-head')||wrap?.querySelector('.hm-section-head');
    if(!head)return;
    const title=head.querySelector('.hm-section-title');
    const desc=head.querySelector('.hm-section-desc');
    if(title)title.innerHTML='앞선 데이터를 바탕으로,<br>구매 여정의 흐름과 각 화면의 역할을<br>다시 정의했습니다.';
    if(desc)desc.textContent='먼저 고객의 판단 흐름을 만들고, 그 흐름 안에서 각 화면이 맡아야 할 역할과 공통 UX 원칙을 정의했습니다.';

    wrap.querySelectorAll('.hm-section-title,.hm-subtitle,.forced-redesign-title,.journey-block-title,h2,h3').forEach(el=>{
      if(el===title)return;
      const text=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(text.includes('그래서 끊어진 여정을')&&text.includes('다음 행동으로 이어지는 구조')){
        el.style.setProperty('display','none','important');
        const parent=el.closest('.hm-section-head,.hm-subhead,.hm-subsection');
        if(parent&&parent!==head&&!parent.querySelector('.journey-flow-block,.journey-role-block,.journey-principle-block')){
          parent.style.setProperty('display','none','important');
        }
      }
    });
  };

  const mount=()=>{
    const journey=document.querySelector('#journey');
    const wrap=journey?.querySelector(':scope > .hm-wrap')||journey?.querySelector('.hm-wrap');
    const head=wrap?.querySelector(':scope > .hm-section-head')||wrap?.querySelector('.hm-section-head');
    if(!journey||!wrap||!head){
      setTimeout(mount,80);
      return;
    }

    applyHeading(wrap);

    let flow=wrap.querySelector(':scope > .journey-flow-block');
    let roles=wrap.querySelector(':scope > .journey-role-block');
    let principlesBlock=wrap.querySelector(':scope > .journey-principle-block');

    if(!flow){
      flow=document.createElement('section');
      flow.className='journey-flow-block';
      flow.innerHTML=`
        <span class="narrative-subno">03.1 / JOURNEY FLOW</span>
        <h3 class="journey-block-title">화면 순서가 아니라,<br>고객 판단의 흐름으로 다시 연결했습니다.</h3>
        <p class="journey-block-copy">문제는 유입보다 다음 행동으로 이어지지 않는 것이었습니다. 그래서 고객 판단 흐름으로 다시 연결했습니다.</p>
        <div class="journey-stage-flow" aria-label="재설계한 구매 여정">${flowMarkup}</div>`;
    }else{
      const stage=flow.querySelector('.journey-stage-flow');
      if(stage)stage.innerHTML=flowMarkup;
    }

    if(!roles){
      roles=document.createElement('section');
      roles.className='journey-role-block';
      roles.innerHTML=`
        <span class="narrative-subno">03.2 / ROLE DEFINITION</span>
        <h3 class="journey-block-title">그리고 각 화면은,<br>다음 행동을 만드는 역할로 다시 정의했습니다.</h3>
        <p class="journey-block-copy">각 접점의 목적을 ‘무엇을 보여줄 것인가’가 아니라 ‘고객이 다음에 무엇을 할 수 있어야 하는가’로 정의했습니다.</p>
        <div class="journey-role-grid">
          <article><small>HOME</small><h4>원하는 곳으로<br>보내주는 허브</h4><p>최근 관심 상품·혜택·서비스를 기억하고 원하는 목적지로 바로 이어줍니다.</p></article>
          <article><small>CATEGORY</small><h4>고민의 시간을<br>줄이는 곳</h4><p>선택 기준을 먼저 보여 카테고리 안에서 후보를 빠르게 좁힙니다.</p></article>
          <article><small>SEARCH</small><h4>모호한 니즈를<br>후보로 바꾸는 곳</h4><p>정확한 모델명을 몰라도 목적을 상품 후보와 판단 기준으로 바꿉니다.</p></article>
          <article><small>SRP · PLP</small><h4>비교를<br>끝내는 곳</h4><p>가격·혜택·배송·설치·리뷰·스펙을 한눈에 비교해 후보를 압축합니다.</p></article>
          <article><small>PDP</small><h4>구매 결정을<br>끝내는 곳</h4><p>가격·설치·리뷰·혜택·상담·서비스를 함께 보여 구매 결정을 돕습니다.</p></article>
          <article><small>CART</small><h4>마지막 확신을<br>주는 곳</h4><p>가격·옵션·설치 조건과 최종 금액을 재확인해 결제 전 불확실성을 줄입니다.</p></article>
          <article><small>FULFILL</small><h4>불안을 일정 확정으로<br>바꾸는 곳</h4><p>설치 일정과 기존 제품 회수 정보를 명확히 안내합니다.</p></article>
          <article><small>MY · CARE</small><h4>구매 이후 관계를<br>이어가는 곳</h4><p>케어·수리·이전설치·점검을 상품 이력과 연결해 관리 경험을 이어갑니다.</p></article>
        </div>`;
    }

    let principles=wrap.querySelector(':scope > .principle-grid')||wrap.querySelector('.principle-grid');
    if(!principles){
      principles=document.createElement('div');
      principles.className='principle-grid';
      principles.innerHTML=principleMarkup;
    }
    if(!principlesBlock){
      principlesBlock=document.createElement('section');
      principlesBlock.className='journey-principle-block';
      principlesBlock.innerHTML=`
        <span class="narrative-subno">03.3 / UX PRINCIPLES</span>
        <h3 class="journey-block-title">마지막으로, 모든 화면에 공통으로 적용할<br>UX 원칙을 정했습니다.</h3>
        <p class="journey-block-copy">흐름과 역할이 달라도, 사용자가 익숙하게 이해하고 다음 행동으로 이어갈 수 있도록 공통 기준을 적용했습니다.</p>`;
      principlesBlock.appendChild(principles);
    }else if(!principlesBlock.querySelector('.principle-grid')){
      principlesBlock.appendChild(principles);
    }

    [...wrap.querySelectorAll('details.hm-more')].forEach(details=>{
      const text=details.querySelector('summary')?.textContent||'';
      if(text.includes('여정별 역할 정의')||text.includes('ROLE DEFINITION'))details.remove();
    });
    [...wrap.querySelectorAll(':scope > .hm-subsection')].forEach(section=>{
      const t=section.querySelector('.hm-subtitle')?.textContent||'';
      if(t.includes('각 여정의 역할')||t.includes('각 화면의 역할'))section.remove();
    });

    const anchor=head.nextElementSibling;
    if(flow.parentElement!==wrap)wrap.insertBefore(flow,anchor);
    if(roles.parentElement!==wrap)flow.insertAdjacentElement('afterend',roles);
    if(principlesBlock.parentElement!==wrap)roles.insertAdjacentElement('afterend',principlesBlock);

    forceVisible(flow);
    forceVisible(roles);
    forceVisible(principlesBlock);
    document.body.classList.add('narrative-journey-ready');

    [120,420,900,1600].forEach(delay=>setTimeout(()=>{
      applyHeading(wrap);
      const stage=flow.querySelector('.journey-stage-flow');
      if(stage&&stage.querySelectorAll('.flow-node').length!==8)stage.innerHTML=flowMarkup;
      forceVisible(flow);
      forceVisible(roles);
      forceVisible(principlesBlock);
    },delay));
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
