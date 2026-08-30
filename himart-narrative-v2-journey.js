(()=>{
  'use strict';

  const TITLE_HTML='앞선 데이터를 바탕으로,<br>구매 여정의 흐름과 각 화면의 역할을<br>다시 정의했습니다.';
  const DESC_TEXT='먼저 고객의 판단 흐름을 만들고, 그 흐름 안에서 각 화면이 맡아야 할 역할을 다시 정의했습니다.';
  const normalize=s=>(s||'').replace(/\s+/g,' ').trim();
  const remove=el=>{if(el?.isConnected)el.remove();};

  const ROLE_HTML=`
    <article><small>HOME</small><h4>원하는 곳으로<br>보내주는 허브</h4><p>최근 관심 상품·혜택·서비스를 기억하고 원하는 목적지로 바로 이어줍니다.</p></article>
    <article><small>CATEGORY</small><h4>고민의 시간을<br>줄이는 곳</h4><p>선택 기준을 먼저 보여 카테고리 안에서 후보를 빠르게 좁힙니다.</p></article>
    <article><small>SEARCH</small><h4>모호한 니즈를<br>후보로 바꾸는 곳</h4><p>정확한 모델명을 몰라도 목적을 상품 후보와 판단 기준으로 바꿉니다.</p></article>
    <article><small>SRP · PLP</small><h4>비교를<br>끝내는 곳</h4><p>가격·혜택·배송·설치·리뷰·스펙을 한눈에 비교해 후보를 압축합니다.</p></article>
    <article><small>PDP</small><h4>구매 확신을<br>형성하는 곳</h4><p>가격·설치·리뷰·혜택·상담·서비스를 함께 보여 구매 확신을 만듭니다.</p></article>
    <article><small>CART</small><h4>선택 조건을<br>정리하는 곳</h4><p>옵션·혜택·설치 조건과 최종 금액을 다시 확인해 이탈을 줄입니다.</p></article>
    <article><small>CHECKOUT</small><h4>결제를<br>완료하는 곳</h4><p>결제 수단·혜택·배송 조건을 한 번에 확인하고 이탈 없이 결제를 끝냅니다.</p></article>
    <article><small>FULFILL</small><h4>설치·회수를<br>확정하는 곳</h4><p>설치 일정과 기존 제품 회수 정보를 명확히 안내해 구매 이후 불안을 줄입니다.</p></article>
    <article><small>MY · CARE</small><h4>구매 이후 관계를<br>이어가는 곳</h4><p>케어·수리·이전설치·점검을 상품 이력과 연결해 관리 경험을 이어갑니다.</p></article>`;

  const node=(no,title,desc)=>`<article class="flow-node"><span class="hm-card-no">${no}</span><h4>${title}</h4><p>${desc}</p></article>`;
  const deepNode=(no,label,title,desc)=>`<article class="journey-diagram-node"><small>${no} / ${label}</small><h5>${title}</h5><p>${desc}</p></article>`;

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
    no.textContent='03';
    let title=head.querySelector(':scope > .hm-section-title');
    if(!title){title=document.createElement('h2');title.className='hm-section-title';}
    title.innerHTML=TITLE_HTML;
    let desc=head.querySelector(':scope > .hm-section-desc');
    if(!desc){desc=document.createElement('p');desc.className='hm-section-desc';}
    desc.textContent=DESC_TEXT;
    head.prepend(no);
    no.insertAdjacentElement('afterend',title);
    title.insertAdjacentElement('afterend',desc);
    [...head.querySelectorAll(':scope > .hm-section-no')].forEach(el=>{if(el!==no)remove(el);});
    [...head.querySelectorAll(':scope > .hm-section-title')].forEach(el=>{if(el!==title)remove(el);});
    [...head.querySelectorAll(':scope > .hm-section-desc')].forEach(el=>{if(el!==desc)remove(el);});
    document.body.classList.add('journey-title-canonical');
  };

  const cleanupLegacy=wrap=>{
    [...wrap.querySelectorAll(':scope > .journey-principle-block,:scope > .principle-grid')].forEach(remove);
    [...wrap.querySelectorAll(':scope > .hm-subsection')].forEach(remove);
    [...wrap.querySelectorAll('details.hm-more')].forEach(details=>{
      if(details.classList.contains('journey-more'))return;
      const t=normalize(details.textContent);
      if(t.includes('여정별 역할 정의')||t.includes('ROLE DEFINITION'))remove(details);
    });
    const head=wrap.querySelector(':scope > .hm-section-head');
    [...wrap.children].forEach(node=>{
      if(node===head||node.classList?.contains('journey-flow-block')||node.classList?.contains('journey-role-block')||node.classList?.contains('journey-more-wrap'))return;
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
      <div class="journey-stage-flow" aria-label="재설계한 구매 여정">
        <div class="journey-flow-row row-top">
          <div class="journey-row-group"><span class="group-label">유입 맥락을 유지해 탐색 시작과 후보 압축까지 빠르게 연결</span></div>
          ${node('01','유입','광고·검색·CRM의 맥락을 이어받습니다.')}
          ${node('02','탐색','목적에 맞는 상품 탐색을 바로 시작합니다.')}
          ${node('03','후보 압축','비교할 후보를 빠르게 줄입니다.')}
          ${node('04','비교·판단','가격·혜택·설치 조건으로 판단합니다.')}
        </div>
        <div class="journey-flow-row row-bottom">
          <div class="journey-row-group"><span class="group-label">결정 단계에서는 비용·혜택·설치 조건을 명확히 해 이탈을 줄이고 확신을 유지</span></div>
          ${node('05','장바구니','선택 상품과 조건을 다시 확인합니다.')}
          ${node('06','결제','최종 비용과 혜택을 명확히 확정합니다.')}
          ${node('07','설치','일정·회수·설치를 끊김 없이 잇습니다.')}
          ${node('08','관리','A/S·케어·재구매로 관계를 이어갑니다.')}
        </div>
      </div>`;
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

  const buildMore=()=>{
    const section=document.createElement('section');
    section.className='journey-more-wrap';
    section.innerHTML=`
      <details class="hm-more journey-more">
        <summary>
          <div class="journey-more-title"><span class="plus">+</span><span>여정 연결 구조 자세히 보기</span></div>
          <span class="journey-more-label">JOURNEY ANALYSIS</span>
        </summary>
        <div class="journey-more-inner">
          <div class="journey-deep-block">
            <span class="journey-deep-kicker">03.3 / GAP TRACE</span>
            <h3 class="journey-deep-title">1. 데이터를 하나의 여정으로 연결해 보니,<br>다음 행동이 약해지는 위치가 더 명확해졌습니다.</h3>
            <p class="journey-deep-copy">신호를 구매 흐름에 놓고 다음 행동이 약해지는 위치를 표시했습니다.</p>
            <div class="journey-diagram journey-diagram--red">
              <div class="journey-diagram-row">
                <div class="journey-diagram-group top"><span class="journey-diagram-group-label">외부 맥락 이후 다음 탐색이 약함 · 기획전 바로 종료 52.2%</span></div>
                ${deepNode('01','ENTRY','외부 유입','AD·CRM·검색 등 각기 다른 맥락에서 진입')}
                ${deepNode('02','LANDING','홈·서브홈<br>이벤트·PDP','랜딩마다 출발점과 다음 행동 맥락이 달라짐')}
                ${deepNode('03','EXPLORE','검색·카테고리','탐색을 반복하지만 구매 후보 전환이 느림')}
                ${deepNode('04','COMPARE','SRP·PLP','가격·혜택·설치 조건이 분산돼 후보 압축이 느려짐')}
              </div>
              <div class="journey-diagram-row">
                <div class="journey-diagram-group bottom"><span class="journey-diagram-group-label">PDP 관심은 유지되지만 장바구니·구매 행동은 약함</span></div>
                ${deepNode('05','DECIDE','PDP','관심은 유지되지만 구매 확신 정보가 분산됨')}
                ${deepNode('06','CONVERT','장바구니·결제','혜택·설치 조건을 재확인하며 구매 행동이 약해짐')}
                ${deepNode('07','INSTALL','배송·설치','결제 후 배송·설치 조건을 다시 확인하며 맥락이 끊김')}
                ${deepNode('08','RELATION','보증·A/S·케어','보증·A/S·케어가 앞선 구매 맥락과 분리됨')}
              </div>
            </div>
            <p class="journey-deep-endnote">결국 문제는 특정 한 화면이 아니라, <b>유입 맥락 → 탐색 → 비교 → 구매 확신 → 설치·케어</b>가 다음 단계로 자연스럽게 이어지지 않는 데 있었습니다.</p>
          </div>
          <div class="journey-deep-block">
            <span class="journey-deep-kicker">03.4 / RECONNECTION</span>
            <h3 class="journey-deep-title">2. 끊어진 지점을 기준으로, 각 단계가<br>다음 행동을 이어주도록 다시 연결했습니다.</h3>
            <p class="journey-deep-copy">앞 단계의 맥락과 판단 기준이 다음 화면까지 이어지도록 역할을 연결했습니다.</p>
            <div class="journey-diagram journey-diagram--blue">
              <div class="journey-diagram-row">
                <div class="journey-diagram-group top"><span class="journey-diagram-group-label">유입 맥락을 잃지 않고 탐색으로 연결</span></div>
                ${deepNode('01','ENTRY','외부·직접 유입','유입된 관심과 혜택 맥락을 유지')}
                ${deepNode('02','CONTEXT','맥락을 이어주는 랜딩','최근 관심·혜택·다음 목적지를 바로 제시')}
                ${deepNode('03','EXPLORE','빠른 탐색 시작','검색·목적형 카테고리로 니즈를 빠르게 구체화')}
                ${deepNode('04','NARROW','후보 압축·비교','지속 필터와 비교 기준으로 후보를 빠르게 좁힘')}
              </div>
              <div class="journey-diagram-row">
                <div class="journey-diagram-group bottom"><span class="journey-diagram-group-label">비교 기준을 유지해 구매 확신과 설치까지 연결</span></div>
                ${deepNode('05','CONFIDENCE','구매 확신 형성','가격·혜택·설치·케어를 한 번에 판단')}
                ${deepNode('06','CONFIRM','조건이 명확한 주문','총액·혜택·배송·설치 조건을 고정해 명확히 제시')}
                ${deepNode('07','INSTALL','설치·회수 확정','설치 일정·조건·폐가전 회수를 주문 맥락에서 확인')}
                ${deepNode('08','CARE','보증·A/S·케어','진행 상태와 보증·A/S·케어를 하나의 관계로 연결')}
              </div>
            </div>
            <p class="journey-deep-endnote">이후 설계에서는 <b>유입 맥락과 판단 기준을 다음 화면까지 유지</b>하고, <b>구매 확신과 설치·케어가 끊기지 않도록</b> 각 화면의 역할과 정보 구조에 반영했습니다.</p>
          </div>
        </div>
      </details>`;
    return section;
  };

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

  const repair=()=>{
    const {journey,wrap,head}=getParts();
    if(!journey||!wrap||!head)return false;
    normalizeHead(head);
    cleanupLegacy(wrap);

    let flow=wrap.querySelector(':scope > .journey-flow-block');
    if(!flow||flow.querySelectorAll('.flow-node').length!==8||flow.querySelectorAll('.journey-row-group').length!==2){
      remove(flow);flow=buildFlow();head.insertAdjacentElement('afterend',flow);
    }else if(head.nextElementSibling!==flow){head.insertAdjacentElement('afterend',flow);}

    let roles=wrap.querySelector(':scope > .journey-role-block');
    if(!roles||roles.querySelectorAll('.journey-role-grid > article').length!==9){
      remove(roles);roles=buildRoles();flow.insertAdjacentElement('afterend',roles);
    }else if(flow.nextElementSibling!==roles){flow.insertAdjacentElement('afterend',roles);}

    let more=wrap.querySelector(':scope > .journey-more-wrap');
    if(!more||more.querySelectorAll('.journey-deep-block').length!==2){
      remove(more);more=buildMore();roles.insertAdjacentElement('afterend',more);
    }else if(roles.nextElementSibling!==more){roles.insertAdjacentElement('afterend',more);}

    [...wrap.querySelectorAll(':scope > .journey-flow-block')].forEach(el=>{if(el!==flow)remove(el);});
    [...wrap.querySelectorAll(':scope > .journey-role-block')].forEach(el=>{if(el!==roles)remove(el);});
    [...wrap.querySelectorAll(':scope > .journey-more-wrap')].forEach(el=>{if(el!==more)remove(el);});
    forceVisible(flow);forceVisible(roles);forceVisible(more);
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
    const more=wrap.querySelector(':scope > .journey-more-wrap');
    return !no||head.firstElementChild!==no||no.textContent!=='03'||!title||title.innerHTML!==TITLE_HTML||normalize(journey.textContent).includes('그래서 끊어진 여정을')||!flow||flow.querySelectorAll('.flow-node').length!==8||flow.querySelectorAll('.journey-row-group').length!==2||!roles||roles.querySelectorAll('.journey-role-grid > article').length!==9||!more||more.querySelectorAll('.journey-deep-block').length!==2||wrap.querySelector('.journey-principle-block,.principle-grid');
  };

  let raf=0;
  const scheduleRepair=()=>{
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;if(needsRepair())repair();});
  };

  const start=()=>{
    if(!repair()){setTimeout(start,80);return;}
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
