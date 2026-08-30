(()=>{
  'use strict';

  const wait=()=>{
    const journey=document.querySelector('#journey');
    const wrap=journey?.querySelector(':scope > .hm-wrap');
    const head=wrap?.querySelector(':scope > .hm-section-head');
    const principles=wrap?.querySelector(':scope > .principle-grid');
    if(!journey||!wrap||!head||!principles){
      setTimeout(wait,80);
      return;
    }
    if(wrap.querySelector('.journey-flow-block'))return;

    const title=head.querySelector('.hm-section-title');
    const desc=head.querySelector('.hm-section-desc');
    if(title)title.innerHTML='앞선 데이터를 바탕으로,<br>구매 여정의 흐름과 각 화면의 역할을<br>다시 정의했습니다.';
    if(desc)desc.textContent='어디에서 시작해도 다음 행동으로 이어지도록, 먼저 고객의 판단 흐름을 만들고 그 흐름 안에서 각 화면이 맡아야 할 역할을 정했습니다.';

    const flow=document.createElement('section');
    flow.className='journey-flow-block hm-reveal';
    flow.innerHTML=`
      <span class="narrative-subno">03.1 / JOURNEY FLOW</span>
      <h3 class="journey-block-title">화면 순서가 아니라,<br>고객의 판단이 깊어지는 순서로 재구성했습니다.</h3>
      <p class="journey-block-copy">앞선 분석에서 반복된 문제는 ‘어디서 들어오는가’보다 <span>‘다음 행동으로 이어지는가’</span>였습니다. 그래서 화면 단위가 아니라 고객의 목적과 판단 단계가 자연스럽게 깊어지는 흐름으로 다시 연결했습니다.</p>
      <div class="journey-stage-flow">
        <article class="journey-stage"><i></i><small>01 / ENTRY</small><h4>유입</h4><p>광고·검색·CRM 등 어느 곳에서 들어와도 앞선 맥락을 이어받습니다.</p></article>
        <article class="journey-stage"><i></i><small>02 / DISCOVER</small><h4>탐색</h4><p>목적을 빠르게 찾고 필요한 상품과 서비스 탐색을 시작합니다.</p></article>
        <article class="journey-stage"><i></i><small>03 / NARROW</small><h4>후보 압축</h4><p>카테고리와 검색에서 비교해야 할 대상을 빠르게 줄입니다.</p></article>
        <article class="journey-stage"><i></i><small>04 / EVALUATE</small><h4>비교·판단</h4><p>가격·혜택·스펙·설치 조건을 함께 보며 구매 가능성을 판단합니다.</p></article>
        <article class="journey-stage"><i></i><small>05 / BUY</small><h4>구매</h4><p>결제까지 불필요한 우회를 줄이고 결정한 상품을 바로 구매합니다.</p></article>
        <article class="journey-stage"><i></i><small>06 / FULFILL</small><h4>설치</h4><p>일정·회수·설치 정보를 구매 경험 안에서 끊기지 않게 이어갑니다.</p></article>
        <article class="journey-stage"><i></i><small>07 / CARE</small><h4>관리</h4><p>A/S·케어·재구매를 제품 이력과 연결해 구매 이후 관계를 이어갑니다.</p></article>
      </div>`;

    const roles=document.createElement('section');
    roles.className='journey-role-block hm-reveal';
    roles.innerHTML=`
      <span class="narrative-subno">03.2 / ROLE DEFINITION</span>
      <h3 class="journey-block-title">그리고 각 화면은,<br>다음 행동을 만드는 역할로 다시 정의했습니다.</h3>
      <p class="journey-block-copy">같은 기능을 유지하더라도 화면이 맡아야 할 역할은 달라졌습니다. 각 접점의 목적을 ‘무엇을 보여줄 것인가’가 아니라 <span>‘고객이 다음에 무엇을 할 수 있어야 하는가’</span>로 정의했습니다.</p>
      <div class="journey-role-grid">
        <article><small>HOME</small><h4>원하는 곳으로<br>보내주는 허브</h4><p>최근 관심 상품·혜택·서비스를 기억하고 사용자가 원하는 목적지로 바로 이어줍니다.</p></article>
        <article><small>CATEGORY</small><h4>고민의 시간을<br>줄이는 곳</h4><p>많이 찾는 상품과 선택 기준을 먼저 보여 카테고리 안에서 후보를 빠르게 좁힙니다.</p></article>
        <article><small>SEARCH</small><h4>모호한 니즈를<br>후보로 바꾸는 곳</h4><p>정확한 모델명을 몰라도 사용자의 목적을 구체적인 상품 후보와 판단 기준으로 바꿉니다.</p></article>
        <article><small>SRP · PLP</small><h4>비교를<br>끝내는 곳</h4><p>가격·혜택·브랜드·배송·설치·리뷰·스펙을 한눈에 비교해 후보를 빠르게 압축합니다.</p></article>
        <article><small>PDP</small><h4>구매 결정을<br>끝내는 곳</h4><p>가격과 설치 가능성, 리뷰, 혜택, 상담과 서비스 정보를 함께 보여 구매 결정을 돕습니다.</p></article>
        <article><small>CART</small><h4>마지막 확신을<br>주는 곳</h4><p>가격·혜택·옵션·설치 조건과 최종 금액을 한 번에 재확인해 결제 직전의 불확실성을 줄입니다.</p></article>
        <article><small>FULFILL</small><h4>구매 이후의 불안을<br>일정 확정으로 바꾸는 곳</h4><p>설치 일정과 가능 여부, 기존 제품 회수 정보를 명확히 안내해 결제 이후의 불안을 줄입니다.</p></article>
        <article><small>MY · CARE</small><h4>구매 이후 관계를<br>이어가는 곳</h4><p>안심케어·수리·이전설치·정기점검을 상품 이력과 연결해 관리받고 있다는 경험을 이어갑니다.</p></article>
      </div>`;

    principles.replaceWith(flow);
    flow.insertAdjacentElement('afterend',roles);

    /* 기존 역할 정의 상세는 중복 노출하지 않습니다. */
    wrap.querySelectorAll('details.hm-more').forEach(details=>{
      const text=details.querySelector('summary')?.textContent||'';
      if(text.includes('여정별 역할 정의'))details.remove();
    });
    wrap.querySelectorAll(':scope > .hm-subsection').forEach(section=>{
      const t=section.querySelector('.hm-subtitle')?.textContent||'';
      if(t.includes('각 여정의 역할')||t.includes('각 화면의 역할'))section.remove();
    });

    window.dispatchEvent(new Event('scroll'));
  };

  wait();
})();