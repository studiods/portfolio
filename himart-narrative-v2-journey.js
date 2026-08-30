(()=>{
  'use strict';

  const TITLE_HTML='앞선 데이터를 바탕으로,<br>구매 여정의 흐름과 각 화면의 역할을<br>다시 정의했습니다.';
  const DESC_TEXT='먼저 고객의 판단 흐름을 만들고, 그 흐름 안에서 각 화면이 맡아야 할 역할을 다시 정의했습니다.';

  const FLOW_HTML=`
    <div class="journey-flow-row">
      <article class="flow-node"><span class="hm-card-no">01</span><h4>유입</h4><p>광고·검색·CRM의 맥락을 이어받습니다.</p></article>
      <article class="flow-node"><span class="hm-card-no">02</span><h4>탐색</h4><p>목적에 맞는 상품 탐색을 시작합니다.</p></article>
      <article class="flow-node"><span class="hm-card-no">03</span><h4>후보 압축</h4><p>비교할 후보를 빠르게 줄입니다.</p></article>
      <article class="flow-node"><span class="hm-card-no">04</span><h4>비교·판단</h4><p>가격·혜택·설치 조건으로 판단합니다.</p></article>
    </div>
    <div class="journey-flow-row">
      <article class="flow-node"><span class="hm-card-no">05</span><h4>장바구니</h4><p>선택 상품과 조건을 다시 확인합니다.</p></article>
      <article class="flow-node"><span class="hm-card-no">06</span><h4>결제</h4><p>최종 비용과 혜택을 확정합니다.</p></article>
      <article class="flow-node"><span class="hm-card-no">07</span><h4>설치</h4><p>일정·회수·설치를 끊김 없이 잇습니다.</p></article>
      <article class="flow-node"><span class="hm-card-no">08</span><h4>관리</h4><p>A/S·케어·재구매로 관계를 이어갑니다.</p></article>
    </div>`;

  const ROLE_HTML=`
    <article><small>HOME</small><h4>원하는 곳으로<br>보내주는 허브</h4><p>최근 관심 상품·혜택·서비스를 기억하고 원하는 목적지로 바로 이어줍니다.</p></article>
    <article><small>CATEGORY</small><h4>고민의 시간을<br>줄이는 곳</h4><p>선택 기준을 먼저 보여 카테고리 안에서 후보를 빠르게 좁힙니다.</p></article>
    <article><small>SEARCH</small><h4>모호한 니즈를<br>후보로 바꾸는 곳</h4><p>정확한 모델명을 몰라도 목적을 상품 후보와 판단 기준으로 바꿉니다.</p></article>
    <article><small>SRP · PLP</small><h4>비교를<br>끝내는 곳</h4><p>가격·혜택·배송·설치·리뷰·스펙을 한눈에 비교해 후보를 압축합니다.</p></article>
    <article><small>PDP</small><h4>구매 결정을<br>끝내는 곳</h4><p>가격·설치·리뷰·혜택·상담·서비스를 함께 보여 구매 결정을 돕습니다.</p></article>
    <article><small>CART</small><h4>마지막 확신을<br>주는 곳</h4><p>가격·옵션·설치 조건과 최종 금액을 다시 확인해 결제 전 불확실성을 줄입니다.</p></article>
    <article><small>CHECKOUT</small><h4>결제를<br>완료하는 곳</h4><p>배송·설치 일정과 결제 수단, 최종 혜택을 한 번에 확인하고 이탈 없이 결제를 끝냅니다.</p></article>
    <article><small>FULFILL</small><h4>불안을 일정 확정으로<br>바꾸는 곳</h4><p>설치 일정과 기존 제품 회수 정보를 명확히 안내해 구매 이후 불안을 줄입니다.</p></article>
    <article><small>MY · CARE</small><h4>구매 이후 관계를<br>이어가는 곳</h4><p>케어·수리·이전설치·점검을 상품 이력과 연결해 관리 경험을 이어갑니다.</p></article>`;

  const normalize=s=>(s||'').replace(/\s+/g,' ').trim();
  const remove=el=>{if(el?.isConnected)el.remove();};

  const forceVisible=el=>{
    if(!el)return;
    el.classList.remove('hm-reveal','wide-rise-target');
    el.classList.add('is-in','is-wide-rise-in');
    el.hidden=false;
    el.style.setProperty('display','block','important');
    el.style.setProperty('opacity','1','important');
    el.style.setProperty('visibility','visible','important');
    el.style.setProperty('transform','none','important');
  };

  const getParts=()=>{
    const journey=document.querySelector('#journey');
    const wrap=journey?.querySelector(':scope > .hm-wrap')||journey?.querySelector('.hm-wrap');
    const head=wrap?.querySelector(':scope > .hm-section-head')||wrap?.querySelector('.hm-section-head');
    return {journey,wrap,head};
  };

  const normalizeHead=head=>{
    if(!head)return;
    let no=head.querySelector(':scope > .hm-section-no');
    if(!no){no=document.createElement('span');no.className='hm-section-no';}
    if(no.textContent!=='03')no.textContent='03';

    let title=head.querySelector(':scope > .hm-section-title');
    if(!title){title=document.createElement('h2');title.className='hm-section-title';}
    if(title.innerHTML!==TITLE_HTML)title.innerHTML=TITLE_HTML;

    let desc=head.querySelector(':scope > .hm-section-desc');
    if(!desc){desc=document.createElement('p');desc.className='hm-section-desc';}
    if(desc.textContent!==DESC_TEXT)desc.textContent=DESC_TEXT;

    if(head.firstElementChild!==no)head.prepend(no);
    if(no.nextElementSibling!==title)no.insertAdjacentElement('afterend',title);
    if(title.nextElementSibling!==desc)title.insertAdjacentElement('afterend',desc);

    [...head.querySelectorAll(':scope > .hm-section-no')].forEach(el=>{if(el!==no)remove(el);});
    [...head.querySelectorAll(':scope > .hm-section-title')].forEach(el=>{if(el!==title)remove(el);});
    [...head.querySelectorAll(':scope > .hm-section-desc')].forEach(el=>{if(el!==desc)remove(el);});
    document.body.classList.add('journey-title-canonical');
  };

  const cleanupLegacy=wrap=>{
    [...wrap.querySelectorAll(':scope > .journey-principle-block,:scope > .principle-grid')].forEach(remove);
    [...wrap.querySelectorAll('details.hm-more')].forEach(details=>{
      const t=normalize(details.textContent);
      if(t.includes('여정별 역할 정의')||t.includes('ROLE DEFINITION'))remove(details);
    });
    [...wrap.querySelectorAll(':scope > .hm-subsection')].forEach(remove);
    const head=wrap.querySelector(':scope > .hm-section-head');
    [...wrap.children].forEach(node=>{
      if(node===head||node.classList?.contains('journey-flow-block')||node.classList?.contains('journey-role-block'))return;
      const t=normalize(node.textContent);
      if(t.includes('그래서 끊어진 여정을')||/FAMILIARITY|NEXT STEP|OMNI|NARROW|CONFIDENCE|DECISION/.test(t))remove(node);
    });
  };

  const buildFlow=()=>{
    const section=document.createElement('section');
    section.className='journey-flow-block';
    section.innerHTML=`
      <span class="narrative-subno">03.1 / JOURNEY FLOW</span>
      <h3 class="journey-block-title">화면 순서가 아니라,<br>고객 판단의 흐름으로 다시 연결했습니다.</h3>
      <p class="journey-block-copy">문제는 유입보다 다음 행동으로 이어지지 않는 것이었습니다. 그래서 고객 판단 흐름으로 다시 연결했습니다.</p>
      <div class="journey-stage-flow" aria-label="재설계한 구매 여정">${FLOW_HTML}</div>`;
    return section;
  };

  const buildRoles=()=>{
    const section=document.createElement('section');
    section.className='journey-role-block';
    section.innerHTML=`
      <span class="narrative-subno">03.2 / ROLE DEFINITION</span>
      <h3 class="journey-block-title">그리고 각 화면은,<br>다음 행동을 만드는 역할로 다시 정의했습니다.</h3>
      <p class="journey-block-copy">각 접점의 목적을 ‘무엇을 보여줄 것인가’가 아니라 ‘고객이 다음에 무엇을 할 수 있어야 하는가’로 정의했습니다.</p>
      <div class="journey-role-grid">${ROLE_HTML}</div>`;
    return section;
  };

  const repair=()=>{
    const {journey,wrap,head}=getParts();
    if(!journey||!wrap||!head)return false;
    normalizeHead(head);
    cleanupLegacy(wrap);

    let flow=wrap.querySelector(':scope > .journey-flow-block');
    if(!flow||flow.querySelectorAll('.flow-node').length!==8){
      remove(flow);
      flow=buildFlow();
      head.insertAdjacentElement('afterend',flow);
    }else if(head.nextElementSibling!==flow){
      head.insertAdjacentElement('afterend',flow);
    }

    let roles=wrap.querySelector(':scope > .journey-role-block');
    if(!roles||roles.querySelectorAll('.journey-role-grid > article').length!==9){
      remove(roles);
      roles=buildRoles();
      flow.insertAdjacentElement('afterend',roles);
    }else if(flow.nextElementSibling!==roles){
      flow.insertAdjacentElement('afterend',roles);
    }

    [...wrap.querySelectorAll(':scope > .journey-flow-block')].forEach(el=>{if(el!==flow)remove(el);});
    [...wrap.querySelectorAll(':scope > .journey-role-block')].forEach(el=>{if(el!==roles)remove(el);});
    forceVisible(flow);
    forceVisible(roles);
    document.body.classList.add('narrative-journey-ready');
    return true;
  };

  const needsRepair=()=>{
    const {journey,wrap,head}=getParts();
    if(!journey||!wrap||!head)return true;
    const no=head.querySelector(':scope > .hm-section-no');
    const title=head.querySelector(':scope > .hm-section-title');
    const flow=wrap.querySelector(':scope > .journey-flow-block');
    const roles=wrap.querySelector(':scope > .journey-role-block');
    return !no||head.firstElementChild!==no||no.textContent!=='03'||!title||no.nextElementSibling!==title||title.innerHTML!==TITLE_HTML||normalize(journey.textContent).includes('그래서 끊어진 여정을')||!flow||flow.querySelectorAll('.flow-node').length!==8||!roles||roles.querySelectorAll('.journey-role-grid > article').length!==9||wrap.querySelector('.journey-principle-block,.principle-grid');
  };

  let raf=0;
  const scheduleRepair=()=>{
    if(raf)return;
    raf=requestAnimationFrame(()=>{
      raf=0;
      if(needsRepair())repair();
    });
  };

  const start=()=>{
    if(!repair()){
      setTimeout(start,80);
      return;
    }
    [120,420,900,1600,3000,5200].forEach(ms=>setTimeout(()=>{if(needsRepair())repair();},ms));
    if('MutationObserver' in window){
      const observer=new MutationObserver(scheduleRepair);
      observer.observe(document.querySelector('#journey')||document.body,{childList:true,subtree:true,characterData:true});
      setTimeout(()=>observer.disconnect(),12000);
    }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
