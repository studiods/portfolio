/* bundled: himart-live-transform.js */
(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  main.querySelectorAll('.js-scramble').forEach(el=>el.classList.remove('js-scramble'));
  const setHTML=(el,v)=>{if(el)el.innerHTML=v};
  const setText=(el,v)=>{if(el)el.textContent=v};
  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')].find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));
  const subByNo=(root,no)=>[...(root||main).querySelectorAll('.hm-subsection')].find(s=>s.querySelector('.hm-subno')?.textContent.includes(no));
  const setList=(selector,values,root=main)=>{[...root.querySelectorAll(selector)].forEach((el,i)=>{if(values[i]!==undefined)el.textContent=values[i]});};

  const heroTitle=main.querySelector('.hm-title');
  if(heroTitle)heroTitle.innerHTML='하이마트 온라인 전체 구매 여정을<br>처음부터 재설계했습니다.';
  setText(main.querySelector('.hm-hero .hm-lead'),'화면 개선부터 시작하지 않았습니다. 고객 인식과 실제 유입·탐색·이탈을 확인한 뒤 전체 구매 여정의 역할을 다시 정의했습니다.');
  setText(main.querySelector('#brand .hm-section-desc'),'하이마트에 기대하는 전문성과 실제 온라인 경험의 간극을 먼저 확인했습니다.');
  setText(main.querySelector('#data .hm-section-desc'),'유입·탐색·이탈 지점을 실제 이용 데이터로 확인했습니다.');
  setText(main.querySelector('#direction .hm-section-desc'),'정의한 역할을 화면으로 옮기고 내부 검증으로 정보 위계와 연결 방식을 조정하고 있습니다.');

  const summary=subByNo(main.querySelector('#brand'),'01.3');
  if(summary)setText(summary.querySelector('.hm-subcopy'),'긍정은 전문성과 오프라인 자산에, 부정은 그 강점이 온라인에서 끊기는 순간에 집중됐습니다.');
  setList('#brand .conclusion-card p',[
    '설치·A/S·매장 체험·전문가 상담처럼 실패 가능성을 낮추는 경험이 선택의 핵심 이유였습니다.',
    '앱 속도·복잡한 혜택·배송·설치 불확실성과 정보 차이가 전문성에 대한 기대를 불신으로 바꿨습니다.'
  ]);
  const uxPoints=subByNo(main.querySelector('#brand'),'01.4');
  if(uxPoints){
    setText(uxPoints.querySelector('.hm-subcopy'),'고객이 반복해서 말한 기대와 불편을 이후 설계에서 놓치지 않도록 핵심 원칙으로 정리했습니다.');
    setList('.direction-card p',[
      '매장 상담의 신뢰를 온라인에서도 이어가고, 필요한 순간 AI Agent와 데이터 가이드가 개입하도록 확장합니다.',
      '설치·보증·A/S·관리·중고판매를 한 흐름으로 연결해 구매 이후 관계가 이어지도록 설계합니다.',
      '온라인의 관심·비교 맥락이 매장까지 이어지고, 매장 경험이 다시 온라인 구매로 돌아오게 합니다.',
      '추천검색·동적 필터·핵심 정보 위계와 AI 요약으로 탐색 비용을 줄이고 후보를 빠르게 압축합니다.',
      '총액·혜택·설치 가능일·진행 상태를 명확히 보여줘 다시 문의하지 않아도 현재 상태를 이해하게 합니다.'
    ],uxPoints);
  }

  const data=main.querySelector('#data');
  let asisFlow=null;
  if(data){
    setHTML(data.querySelector('.hm-section-title'),'정성적으로 보였던 간극이 실제 이용 행동에서는<br>어떻게 나타나는지 확인했습니다.');
    const c21=cardByNo('02.1');if(c21){setHTML(c21.querySelector('h3'),'고객의 구매 여정은 홈이 아니라,<br>서로 다른 유입 맥락에서 시작되고 있었습니다.');setHTML(c21.querySelector('.desc'),'AD 52%, Direct 31%, CPS 10%, CRM 6%. 시작점이 하나가 아니므로 <span class="data-emphasis">유입 맥락을 다음 탐색까지 이어주는 것</span>이 중요했습니다.');}
    const c22=cardByNo('02.2');if(c22){setHTML(c22.querySelector('h3'),'방문이 많다는 것만으로<br>구매 의도가 높다고 볼 수는 없었습니다.');setHTML(c22.querySelector('.desc'),'4~5월 방문 규모가 컸지만 전환 효율은 2월이 가장 높았습니다. <span class="data-emphasis">볼륨과 구매 의도는 함께 봐야 했습니다.</span>');}
    const c23=cardByNo('02.3');if(c23){setText(c23.querySelector('.desc'),'PC는 6개월 모두 상품이 시작 1위, Mobile은 6개월 중 5개월 메인이 1위였습니다. 기기마다 기대하는 시작 역할이 달랐습니다.');setList('.number-panel p',['6개월 중 5개월 메인이 가장 강한 시작점이었고, 1개월은 하트TV가 1위였습니다.','6개월 모두 상품 랜딩이 1위였습니다. PC에서는 비교·구매 의도가 더 직접적이었습니다.'],c23);}
    const c24=cardByNo('02.4');if(c24){setHTML(c24.querySelector('h3'),'검색은 보조 기능이 아니라,<br>구매 후보를 만들어가는 핵심 행동이었습니다.');setHTML(c24.querySelector('.desc'),'검색 비중은 3.26%에서 9.34%로 높아졌습니다. <span class="data-emphasis">검색은 후보를 구체화하는 핵심 행동</span>이었습니다.');}
    const c25=cardByNo('02.5');if(c25){setHTML(c25.querySelector('h3'),'홈에서도 고객은 콘텐츠를 소비하기보다<br>다음 목적지를 찾고 있었습니다.');setHTML(c25.querySelector('.desc'),'주요서비스 49.6%, 퀵메뉴 33.8%에 클릭이 집중됐습니다. 홈은 <span class="data-emphasis">다음 목적지 연결</span> 역할이 강했습니다.');}
    const c26=cardByNo('02.6');if(c26){setHTML(c26.querySelector('h3'),'문제는 들어오지 않는 것이 아니라,<br>들어온 이후의 맥락이 다음 행동까지 이어지지 않는 데 있었습니다.');setHTML(c26.querySelector('.desc'),'기획전 바로 종료 52.2%, PDP 이용은 늘었지만 장바구니·구매는 감소했습니다. <span class="data-emphasis">단절 구간의 신호</span>로 봤습니다.');c26.querySelector('.stackbar')?.classList.add('signal-stack');c26.querySelector('.stacklabels')?.classList.add('signal-stack-labels');}
    asisFlow=data.querySelector('.flow-area');
    if(asisFlow){
      const bridge=document.createElement('div');bridge.className='data-bridge hm-reveal';bridge.innerHTML=`<span class="hm-card-no">02.7 / CONNECT THE SIGNALS</span><h3 class="data-bridge-title">흩어진 신호를 하나의 여정으로 연결했습니다.</h3><div class="data-bridge-grid"><article><span>01 / NOT A SINGLE CAUSE</span><h4>각 데이터는 서로 다른 행동을 보여줬습니다.</h4><p>원인을 하나로 묶지 않고 행동 특성을 따로 읽었습니다.</p></article><article><span>02 / COMMON PATTERN</span><h4>하지만 반복되는 패턴은 있었습니다.</h4><p>다른 맥락으로 들어와 검색·비교를 반복하며 후보를 만들었습니다.</p></article><article><span>03 / CONTINUITY GAP</span><h4>화면이 바뀔 때마다 맥락이 약해졌습니다.</h4><p>앞 단계의 관심과 판단 기준이 다음 화면까지 이어지지 않았습니다.</p></article><article><span>04 / PROBLEM REFRAME</span><h4><strong class="journey-title-emphasis">유입 맥락 → 탐색 → 비교 → 구매 확신 → 설치·케어</strong>로 다시 정의했습니다.</h4><p>특정 화면보다 판단 기준이 이어지는 전체 구매 흐름을 설계 과제로 삼았습니다.</p></article></div>`;asisFlow.parentNode.insertBefore(bridge,asisFlow);asisFlow.remove();
    }
  }

  const journey=main.querySelector('#journey');
  if(journey){
    const wrap=journey.querySelector('.hm-wrap');
    const journeyHead=wrap?.querySelector('.hm-section-head');
    const tobeFlow=wrap?[...wrap.children].find(el=>el.classList?.contains('flow-area')):null;
    const roleSection=wrap?[...wrap.querySelectorAll('.hm-subsection')].find(s=>s.querySelector('.hm-subno')?.textContent.includes('ROLE DEFINITION')):null;
    if(journeyHead){setText(journeyHead.querySelector('.hm-section-no'),'03');setHTML(journeyHead.querySelector('.hm-section-title'),'그래서 끊어진 여정을, 어디서 시작해도<br>다음 행동으로 이어지는 구조로<br>다시 설계했습니다.');setText(journeyHead.querySelector('.hm-section-desc'),'데이터에서 확인한 단절을 구매 흐름에 놓고, 다음 행동이 약해지는 지점과 단계별 역할을 다시 연결했습니다.');}
    if(wrap&&journeyHead&&asisFlow){
      asisFlow.querySelector('.flow-head')?.remove();
      const signals=document.createElement('div');signals.className='hm-subsection hm-reveal journey-signal-subsection';signals.innerHTML=`<div class="hm-subhead"><span class="hm-subno">03.1 / JOURNEY SIGNALS</span><div><h3 class="hm-subtitle">데이터를 하나의 여정으로 연결해 보니,<br>다음 행동이 약해지는 위치가 더 명확해졌습니다.</h3><p class="hm-subcopy">신호를 구매 흐름에 놓고 다음 행동이 약해지는 위치를 표시했습니다.</p></div></div>`;signals.appendChild(asisFlow);journeyHead.insertAdjacentElement('afterend',signals);
      setList('.flow-node p',['AD·CRM·CPS·Direct로 각기 다른 맥락에서 진입','랜딩마다 출발점과 다음 행동의 맥락이 달라짐','검색·카테고리를 반복하며 구매 후보를 만듦','가격·혜택·설치 조건이 분산돼 후보 압축이 느려짐','관심은 유지되지만 구매 확신 정보가 분산됨','혜택·설치 조건을 재확인하며 구매 행동이 약해짐','결제 후 배송·설치 조건을 다시 확인하며 맥락이 끊김','보증·A/S·케어가 앞선 구매 맥락과 분리됨'],signals);
      if(tobeFlow){const redesign=document.createElement('div');redesign.className='hm-subsection hm-reveal journey-redesign-subsection';redesign.innerHTML=`<div class="hm-subhead"><span class="hm-subno">03.2 / JOURNEY REDESIGN</span><div><h3 class="forced-redesign-title"><span>끊어진 지점을 기준으로, 각 단계가</span><span>다음 행동을 이어주도록 다시 연결했습니다.</span></h3><p class="hm-subcopy">앞 단계의 맥락과 판단 기준이 다음 화면까지 이어지도록 역할을 연결했습니다.</p></div></div>`;redesign.appendChild(tobeFlow);signals.insertAdjacentElement('afterend',redesign);setList('.flow-node p',['유입된 관심과 혜택 맥락을 유지','최근 관심·혜택·다음 목적지를 바로 제시','검색·목적형 카테고리로 니즈를 빠르게 구체화','지속 필터와 비교 기준으로 후보를 빠르게 줄임','가격·혜택·설치·매장·케어를 한 번에 판단','총액·혜택·배송·설치 조건을 고정해 명확히 제시','설치 일정·조건·폐가전 회수를 주문 맥락에서 확인','진행 상태와 보증·A/S·케어를 하나의 관계로 연결'],redesign);}
    }
    if(roleSection){setText(roleSection.querySelector('.hm-subno'),'03.3 / ROLE DEFINITION');setText(roleSection.querySelector('.hm-subcopy'),'각 화면이 앞선 맥락을 받아 다음 판단으로 넘기도록 역할을 정리했습니다.');const roleGrid=roleSection.querySelector('.role-grid');if(roleGrid)roleGrid.innerHTML=`<article class="role-card"><span class="hm-role-name">HOME</span><h4>다음 목적지를 여는 허브</h4><p>유입과 최근 행동을 기억하고 검색·카테고리·혜택으로 연결합니다.</p><strong>최근 맥락 기억 · 빠른 목적지 연결 · 개인화 진입</strong></article><article class="role-card"><span class="hm-role-name">SUBHOME / CATEGORY</span><h4>구매 목적 구체화</h4><p>상황·공간·설치 조건 중심으로 탐색 방향을 잡아줍니다.</p><strong>상황·목적 중심 탐색</strong></article><article class="role-card"><span class="hm-role-name">SEARCH</span><h4>니즈를 후보로 전환</h4><p>추천검색과 필터로 모호한 요구를 상품 후보로 구체화합니다.</p><strong>추천검색 · 동적 필터 · 탐색 가이드</strong></article><article class="role-card"><span class="hm-role-name">SRP / PLP</span><h4>후보를 빠르게 압축</h4><p>가격·혜택·핵심 스펙을 같은 기준으로 비교합니다.</p><strong>지속 필터 · 핵심 비교 기준</strong></article><article class="role-card"><span class="hm-role-name">PDP</span><h4>구매 확신 완성</h4><p>가격·혜택·설치·리뷰를 한 흐름에서 판단하게 합니다.</p><strong>가격 · 설치 · 혜택 · 리뷰</strong></article><article class="role-card"><span class="hm-role-name">CART / PAY</span><h4>조건을 확인하고 확정</h4><p>총액·혜택·배송·설치 조건을 명확히 보여 최종 불확실성을 줄입니다.</p><strong>총액 · 혜택 · 설치 조건</strong></article><article class="role-card"><span class="hm-role-name">INSTALL</span><h4>설치까지 구매 맥락 유지</h4><p>설치 일정·조건·폐가전 회수를 주문 흐름 안에서 이어 확인합니다.</p><strong>설치 일정 · 회수 · 진행 상태</strong></article><article class="role-card"><span class="hm-role-name">CARE</span><h4>구매 이후 관계 연결</h4><p>보증·A/S·케어를 구매 이후에도 하나의 관계로 이어갑니다.</p><strong>보증 · A/S · 평생Care</strong></article>`;}
  }

  const direction=main.querySelector('#direction');
  if(direction){direction.querySelector('.prototype-intro')?.remove();const gallery=direction.querySelector('.phone-gallery');if(gallery){const list=document.createElement('div');list.className='prototype-case-list hm-reveal';const device='<div class="prototype-case-visual"><div class="galaxy-ultra-mockup" aria-label="Galaxy S26 Ultra line frame"><div class="galaxy-ultra-screen"></div></div></div>';list.innerHTML=`<article class="prototype-case">${device}<div class="prototype-case-copy"><span class="hm-card-no">01 / HOME</span><h3>시작점을 하나로 가정하지 않고,<br>다음 행동으로 빠르게 연결하는 허브로 재정의했습니다.</h3><p>검색·카테고리·혜택과 주요 서비스를 이어 유입 맥락을 다시 탐색하지 않게 했습니다.</p><strong><b>적용한 전략</b>유입 맥락 유지 · 목적지 연결 · 관심 기반 진입</strong></div></article><article class="prototype-case">${device}<div class="prototype-case-copy"><span class="hm-card-no">02 / SRP</span><h3>검색 결과는 더 많이 보여주기보다,<br>더 빨리 좁히는 화면으로 바꿨습니다.</h3><p>검색 조건을 유지하고 핵심 필터·상품 정보로 후보를 빠르게 압축했습니다.</p><strong><b>적용한 전략</b>지속 필터 · 핵심 비교 기준 · 후보 압축</strong></div></article><article class="prototype-case">${device}<div class="prototype-case-copy"><span class="hm-card-no">03 / PDP</span><h3>상품 정보는 나열이 아니라,<br>구매 확신을 만드는 흐름으로 재정리했습니다.</h3><p>가격·혜택·배송·설치를 우선순위로 연결해 구매 직전 재확인 부담을 줄였습니다.</p><strong><b>적용한 전략</b>가격·혜택 명확화 · 배송/설치 조건 · 판단 우선순위</strong></div></article><article class="prototype-case hicheck">${device}<div class="prototype-case-copy"><span class="hm-card-no">04 / HI CHECK</span><h3>전문 정보는 생활 기준으로 번역해,<br>이해 부담을 낮췄습니다.</h3><p>용량·전기료·설치 크기 같은 수치를 생활 기준으로 풀어 이해 부담을 낮췄습니다.</p><strong><b>적용한 전략</b>전문성의 디지털화 · 생활 기준 해석 · 선택 근거</strong></div></article>`;gallery.replaceWith(list);}}

  const kicker=main.querySelector('.hm-kicker');if(kicker)kicker.textContent='LOTTE HIMART / COMMERCE JOURNEY / 2024—NOW';
  document.querySelectorAll('.hm-section-head .hm-section-no,.data-card-head .hm-card-no,.hm-subhead .hm-subno,.data-bridge > .hm-card-no').forEach(el=>{el.dataset.numberedGroupScramblePlayed='1';});
})();
;
/* bundled: himart-wide-content-v4.js */
(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  const setText=(el,v)=>{if(el)el.textContent=v};
  const setHTML=(el,v)=>{if(el)el.innerHTML=v};
  const subByNo=(root,no)=>[...(root||main).querySelectorAll('.hm-subsection')].find(s=>s.querySelector('.hm-subno')?.textContent.includes(no));
  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')].find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));
  const prefix=(el,n)=>{
    if(!el)return;
    const html=el.innerHTML.replace(/^\s*\d+\.\s*/,'');
    el.innerHTML=`${n}. ${html}`;
  };

  /* The prior shared stylesheet renders this one title with ::before. Override that copy locally. */
  const localStyle=document.createElement('style');
  localStyle.textContent=`body.himart-wide-test-page #journey .journey-redesign-subsection .forced-redesign-title::before{content:"2. 끊어진 지점을 기준으로, 각 단계가\\A다음 행동을 이어주도록 다시 연결했습니다."!important;}`;
  document.head.appendChild(localStyle);

  /* 01 / qualitative synthesis */
  const brand=main.querySelector('#brand');
  const summary=subByNo(brand,'01.3');
  if(summary){
    setHTML(summary.querySelector('.hm-subtitle'),'1. 긍정과 부정의 비율도 함께 놓고 봤습니다.');
    const conclusion=summary.querySelector('.sentiment-conclusion');
    if(conclusion){
      setText(conclusion.querySelector(':scope > h4'),'사용자들의 피드백 종합');
      const cards=[...conclusion.querySelectorAll('.conclusion-card')];
      setHTML(cards[0]?.querySelector('h5'),'믿고 맡길 수 있는<br>검증된 가전 전문가');
      setHTML(cards[1]?.querySelector('h5'),'느리고 복잡한,<br>약속이 불확실한 쇼핑몰');
    }
  }

  const uxPoints=subByNo(brand,'01.4');
  if(uxPoints){
    setHTML(uxPoints.querySelector('.hm-subtitle'),'2. 사용자들의 목소리를 UX에<br>어떻게 반영할까를 고민했습니다.');
    const care=[...uxPoints.querySelectorAll('.direction-card h4')].find(el=>el.textContent.trim()==='구매를 케어의 시작으로');
    care?.classList.add('wide-care-light');
  }

  /* 02 / quantitative behavior */
  const data=main.querySelector('#data');
  if(data){
    setHTML(data.querySelector('.hm-section-title'),'정성적 데이터 분석과 더불어<br>정량적인 사용자 패턴 분석도 진행했습니다.');

    [...data.querySelectorAll('.data-card')].forEach((card,i)=>{
      prefix(card.querySelector('.data-card-head h3'),i+1);
    });

    const c26=cardByNo('02.6');
    if(c26){
      const landingCharts=[...c26.querySelectorAll('.landing-chart')];
      landingCharts.find(chart=>chart.querySelector('h4')?.textContent.includes('PDP 이후 행동'))?.remove();
    }

    const bridge=data.querySelector('.data-bridge');
    if(bridge){
      setHTML(bridge.querySelector('.data-bridge-title'),'7. 데이터를 분석해 보니<br>뚜렷한 패턴이 보였습니다.');
      const articles=[...bridge.querySelectorAll('.data-bridge-grid article')];
      const last=articles.at(-1);
      if(last){
        setHTML(last.querySelector('h4'),'그래서 <strong class="journey-title-emphasis">유입 맥락 → 탐색 → 비교 → 구매 확신 → 설치·케어</strong>로 다시 정의할 필요가 보였습니다.');
      }
    }
  }

  /* 03 / journey: report labels are hidden by CSS, readable titles carry simple numbers. */
  const journey=main.querySelector('#journey');
  if(journey){
    const signal=journey.querySelector('.journey-signal-subsection');
    if(signal)prefix(signal.querySelector('.hm-subtitle'),1);
    const role=[...journey.querySelectorAll('.hm-subsection')].find(s=>s.querySelector('.hm-subno')?.textContent.includes('ROLE DEFINITION'));
    if(role)prefix(role.querySelector('.hm-subtitle'),3);
  }

  /* 04 / screen application: keep the same title-number pattern where subsection labels exist. */
  const direction=main.querySelector('#direction');
  if(direction){
    [...direction.querySelectorAll('.hm-subsection')].forEach((section,i)=>{
      const title=section.querySelector('.hm-subtitle, .forced-redesign-title');
      if(title)prefix(title,i+1);
    });
  }
})();

;
/* bundled: himart-wide-refine-v5.js */
(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const stripPrefix=(html='')=>html
    .replace(/^\s*(?:0?\d+|[IVXLCDM]+)\.\s*/i,'')
    .replace(/^\s*<span[^>]*class=["'][^"']*(?:wide-title-index|wide-roman-index)[^"']*["'][^>]*>.*?<\/span>\s*/i,'');

  const numbered=(el,label,klass='wide-title-index')=>{
    if(!el)return;
    el.innerHTML=`<span class="${klass}">${label}.</span> ${stripPrefix(el.innerHTML)}`;
  };

  const subByNo=(root,no)=>[...(root||main).querySelectorAll('.hm-subsection')]
    .find(s=>s.querySelector('.hm-subno')?.textContent.includes(no));
  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')]
    .find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));

  /* 01 / qualitative: readable subsection numbering begins at 01. */
  const brand=main.querySelector('#brand');
  if(brand){
    const brandSubs=[...brand.querySelectorAll(':scope > .hm-subsection')];
    brandSubs.forEach((section,i)=>{
      const title=section.querySelector('.hm-subtitle');
      if(title)numbered(title,String(i+1).padStart(2,'0'));
    });

    /* UX principle titles get explicit blue 01—05 indices. */
    const uxPoints=subByNo(brand,'01.4');
    if(uxPoints){
      [...uxPoints.querySelectorAll('.direction-card h4')].forEach((title,i)=>{
        numbered(title,String(i+1).padStart(2,'0'));
      });
    }
  }

  /* 02 / quantitative: use Roman numerals for the six evidence headlines. */
  const romans=['I','II','III','IV','V','VI'];
  const data=main.querySelector('#data');
  if(data){
    [...data.querySelectorAll('.data-card')].forEach((card,i)=>{
      const title=card.querySelector('.data-card-head h3');
      if(title&&romans[i]){
        title.innerHTML=`${romans[i]}. ${stripPrefix(title.innerHTML)}`;
      }
    });

    /* Entry channel: replace donut/legend with a single 80px segmented bar. */
    const c21=cardByNo('02.1');
    if(c21){
      const viz=c21.querySelector('.data-viz');
      if(viz){
        viz.className='data-viz wide-segmented-chart';
        viz.innerHTML=`
          <div class="wide-segmented-bar wide-entry-bar" aria-label="2026년 상반기 유입 채널 비율">
            <div class="wide-segment" style="flex:52 1 0;background:var(--hm-blue)"><span>AD <small>52%</small></span></div>
            <div class="wide-segment" style="flex:31 1 0;background:var(--hm-newblue)"><span>Direct <small>31%</small></span></div>
            <div class="wide-segment" style="flex:10 1 0;background:var(--hm-green)"><span>CPS <small>10%</small></span></div>
            <div class="wide-segment is-small" style="flex:6 1 0;background:var(--hm-yellow)"><span>CRM <small>6%</small></span></div>
            <div class="wide-segment is-tiny" style="flex:1 1 0;background:rgba(255,255,255,.25)" title="기타 1%"><span>1%</span></div>
          </div>`;
      }
    }

    /* Landing next-action graph adopts the exact same segmented-bar grammar. */
    const c26=cardByNo('02.6');
    if(c26){
      const firstChart=c26.querySelector('.landing-chart');
      if(firstChart){
        const oldBar=firstChart.querySelector('.stackbar');
        const oldLabels=firstChart.querySelector('.stacklabels');
        if(oldBar){
          const bar=document.createElement('div');
          bar.className='wide-segmented-bar wide-action-bar';
          bar.setAttribute('aria-label','기획전 시작 후 첫 다음 행동');
          bar.innerHTML=`
            <div class="wide-segment" style="flex:52.2 1 0;background:var(--hm-red)"><span>종료 <small>52.2%</small></span></div>
            <div class="wide-segment" style="flex:27.6 1 0;background:var(--hm-blue)"><span>재탐색 <small>27.6%</small></span></div>
            <div class="wide-segment is-small" style="flex:9.3 1 0;background:var(--hm-newblue)"><span>상품 <small>9.3%</small></span></div>
            <div class="wide-segment is-small" style="flex:6.6 1 0;background:var(--hm-green)"><span>검색 <small>6.6%</small></span></div>
            <div class="wide-segment is-tiny" style="flex:4.3 1 0;background:var(--hm-yellow)" title="기타 4.3%"><span>4.3%</span></div>`;
          oldBar.replaceWith(bar);
        }
        oldLabels?.remove();
      }
    }
  }
})();

;
/* bundled: himart-wide-refine-v6.js */
(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const strip=(html='')=>html
    .replace(/^\s*(?:0?\d+|[IVXLCDM]+)\.\s*/i,'')
    .replace(/^\s*<span[^>]*class=["'][^"']*(?:wide-title-index|wide-roman-index)[^"']*["'][^>]*>.*?<\/span>\s*/i,'');

  const setIndexedTitle=(el,label,klass='wide-title-index',space=false)=>{
    if(!el)return;
    el.innerHTML=`<span class="${klass}">${label}.</span>${space?' ':''}${strip(el.innerHTML)}`;
  };

  /* 01 / qualitative: 01., 02., 03... becomes part of the title with no gap. */
  const brand=main.querySelector('#brand');
  if(brand){
    const brandSubs=[...brand.querySelectorAll(':scope > .hm-subsection')];
    brandSubs.forEach((section,i)=>{
      setIndexedTitle(section.querySelector('.hm-subtitle'),String(i+1).padStart(2,'0'));
    });

    const sentimentTitle=brand.querySelector('.sentiment-title');
    if(sentimentTitle)sentimentTitle.textContent='긍정과 부정의 키워드의 비율';

    /* UX principles use the same 01—05 numbering and the full title is blue via CSS. */
    const uxSection=brandSubs.find(section=>section.querySelector('.direction-list'));
    if(uxSection){
      [...uxSection.querySelectorAll('.direction-card h4')].forEach((title,i)=>{
        setIndexedTitle(title,String(i+1).padStart(2,'0'));
      });
    }
  }

  /* 02 / quantitative: keep Roman numbering and refresh chart color grammar. */
  const data=main.querySelector('#data');
  if(data){
    const romans=['I','II','III','IV','V','VI'];
    [...data.querySelectorAll('.data-card')].forEach((card,i)=>{
      const title=card.querySelector('.data-card-head h3');
      if(title&&romans[i])setIndexedTitle(title,romans[i],'wide-roman-index',true);
    });

    const entry=data.querySelector('.wide-entry-bar');
    if(entry){
      const segs=[...entry.querySelectorAll('.wide-segment')];
      const colors=['#0572CB','var(--hm-blue)','var(--hm-newblue)','var(--hm-green)','var(--hm-yellow)'];
      segs.forEach((seg,i)=>{if(colors[i])seg.style.background=colors[i]});
      const labels=[['AD','52%'],['Direct','31%'],['CPS','10%'],['CRM','6%']];
      labels.forEach((parts,i)=>{
        if(segs[i])segs[i].innerHTML=`<span>${parts[0]} <small>${parts[1]}</small></span>`;
      });
    }

    /* Action chart keeps its semantic colors but adopts the exact same text layout. */
    const action=data.querySelector('.wide-action-bar');
    if(action){
      const segs=[...action.querySelectorAll('.wide-segment')];
      const labels=[['종료','52.2%'],['재탐색','27.6%'],['상품','9.3%'],['검색','6.6%']];
      labels.forEach((parts,i)=>{
        if(segs[i])segs[i].innerHTML=`<span>${parts[0]} <small>${parts[1]}</small></span>`;
      });
    }
  }
})();

;
/* bundled: himart-wide-refine-v7.js */
(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const strip=(html='')=>html
    .replace(/^\s*(?:0?\d+|[IVXLCDM]+)\.\s*/i,'')
    .replace(/^\s*<span[^>]*class=["'][^"']*(?:wide-title-index|wide-roman-index)[^"']*["'][^>]*>.*?<\/span>\s*/i,'');
  const setIndex=(el,label,klass='wide-title-index',space=false)=>{
    if(!el)return;
    el.innerHTML=`<span class="${klass}">${label}.</span>${space?' ':''}${strip(el.innerHTML)}`;
  };
  const subByNo=(root,no)=>[...(root||main).querySelectorAll('.hm-subsection')]
    .find(s=>s.querySelector('.hm-subno')?.textContent.includes(no));
  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')]
    .find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));

  /* ---------- 01 / QUALITATIVE ---------- */
  const brand=main.querySelector('#brand');
  if(brand){
    [['01.1','01'],['01.2','02'],['01.3','03'],['01.4','04']].forEach(([no,label])=>{
      const section=subByNo(brand,no);
      setIndex(section?.querySelector('.hm-subtitle'),label,'wide-title-index',false);
    });

    /* Voice-group titles remain descriptive, without their old rules. */
    const voiceGroups=[...brand.querySelectorAll('.voice-group')];
    voiceGroups.forEach(group=>group.classList.add('wide-no-title-rule'));

    const summary=subByNo(brand,'01.3');
    if(summary){
      const sentimentTitle=summary.querySelector('.sentiment-title');
      if(sentimentTitle)sentimentTitle.textContent='I.긍정과 부정의 키워드의 비율';
      const conclusionTitle=summary.querySelector('.sentiment-conclusion>h4');
      if(conclusionTitle)conclusionTitle.textContent='II.사용자들의 피드백 종합';

      const positive=summary.querySelector('.sentiment-block:not(.negative) .sentiment-keywords');
      if(positive){
        positive.innerHTML='<b>핵심 키워드</b><br>오프라인 체험 · 전문가 상담 · 제품 다양성 · 설치/A/S 신뢰 · 통합 쇼핑가격/혜택<br>즉시수령 · 토탈 케어 · 접근성 · 가전 전문성';
      }
    }

    /* Make the design-principle area six items and number every title. */
    const uxSection=subByNo(brand,'01.4');
    const directionList=uxSection?.querySelector('.direction-list');
    if(directionList){
      const cards=[...directionList.querySelectorAll('.direction-card')];
      if(cards.length<6){
        const extra=document.createElement('article');
        extra.className='direction-card';
        extra.innerHTML='<span class="hm-card-no">06</span><h4>판단 기준을 다음 화면까지 연결</h4><p>앞 단계의 관심·혜택·비교 기준을 다음 화면에서도 유지해 다시 찾지 않게 합니다.</p>';
        directionList.appendChild(extra);
      }
      [...directionList.querySelectorAll('.direction-card h4')].forEach((title,i)=>{
        setIndex(title,String(i+1).padStart(2,'0'),'wide-title-index',true);
      });
    }
  }

  /* ---------- 02 / QUANTITATIVE ---------- */
  const data=main.querySelector('#data');
  if(data){
    /* Skip the hidden 02.3 card: visible evidence is I, II, III, IV, V, then bridge VI. */
    const order=[['02.1','I'],['02.2','II'],['02.4','III'],['02.5','IV'],['02.6','V']];
    order.forEach(([no,roman])=>{
      const card=cardByNo(no);
      setIndex(card?.querySelector('.data-card-head h3'),roman,'wide-roman-index',true);
    });

    const bridge=data.querySelector('.data-bridge');
    if(bridge){
      const title=bridge.querySelector('.data-bridge-title');
      if(title){
        title.innerHTML=`<span class="wide-roman-index">VI.</span> ${strip(title.innerHTML)}`;
      }
    }

    /* Entry chart: same data, refreshed palette and 28px label/value grammar. */
    const entry=data.querySelector('.wide-entry-bar');
    if(entry){
      const segs=[...entry.querySelectorAll('.wide-segment')];
      const colors=['#0572CB','var(--hm-blue)','var(--hm-newblue)','var(--hm-green)','var(--hm-yellow)'];
      const labels=[['AD','52%'],['Direct','31%'],['CPS','10%'],['CRM','6%'],['기타','1%']];
      segs.forEach((seg,i)=>{
        if(colors[i])seg.style.background=colors[i];
        if(labels[i])seg.innerHTML=`<span>${labels[i][0]} <small>${labels[i][1]}</small></span>`;
        seg.classList.remove('is-tiny');
      });
    }

    /* Landing next-action chart: same palette/style as entry, keep the original data. */
    const action=data.querySelector('.wide-action-bar');
    if(action){
      const segs=[...action.querySelectorAll('.wide-segment')];
      const colors=['#0572CB','var(--hm-blue)','var(--hm-newblue)','var(--hm-green)','var(--hm-yellow)'];
      const labels=[['종료','52.2%'],['재탐색','27.6%'],['상품','9.3%'],['검색','6.6%'],['기타','4.3%']];
      segs.forEach((seg,i)=>{
        if(colors[i])seg.style.background=colors[i];
        if(labels[i])seg.innerHTML=`<span>${labels[i][0]} <small>${labels[i][1]}</small></span>`;
        seg.classList.remove('is-tiny');
      });
    }
  }

  /* ---------- 03 / JOURNEY ---------- */
  const journey=main.querySelector('#journey');
  if(journey){
    const signal=journey.querySelector('.journey-signal-subsection');
    if(signal){
      const title=signal.querySelector('.hm-subtitle');
      if(title){
        title.innerHTML='01. 데이터를 하나의 여정으로 연결해 보니,<br>다음 행동이 약해지는 위치가 더 명확해졌습니다.';
      }

      const groups=[...signal.querySelectorAll('.flow-group')];
      const buildCluster=(group,nodeCount,label,klass)=>{
        if(!group||group.querySelector('.wide-flow-cluster'))return;
        const row=group.querySelector('.flow-row');
        if(!row)return;
        const children=[...row.children];
        const moveCount=nodeCount*2-1;
        const moving=children.slice(0,moveCount);
        if(!moving.length)return;
        const cluster=document.createElement('div');
        cluster.className=`wide-flow-cluster ${klass}`;
        cluster.innerHTML=`<div class="wide-flow-cluster-label">${label}</div><div class="wide-flow-cluster-inner"></div>`;
        const inner=cluster.querySelector('.wide-flow-cluster-inner');
        moving.forEach(el=>inner.appendChild(el));
        row.insertBefore(cluster,row.firstChild);
      };

      buildCluster(groups[0],3,'외부 랜딩 이후 다음 탐색이 끊김 · 기획전 바로 종료 52.2%','wide-flow-cluster--alert');
      buildCluster(groups[1],2,'PDP 관심은 유지됐지만 장바구니·구매 행동은 약화','wide-flow-cluster--focus');
    }

    const redesign=journey.querySelector('.journey-redesign-subsection');
    if(redesign){
      const title=redesign.querySelector('.forced-redesign-title');
      if(title&&!/^\s*02\./.test(title.textContent)){
        title.innerHTML='<span>02. 끊어진 지점을 기준으로, 각 단계가</span><span>다음 행동을 이어주도록 다시 연결했습니다.</span>';
      }
    }

    /* Role labels such as HOME use Averta Regular. */
    journey.querySelectorAll('.role-card .hm-role-name').forEach(el=>{el.style.fontWeight='400'});
  }
})();

;
/* bundled: himart-wide-refine-v8.js */
(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')]
    .find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));

  /* ---------- NUMBERING ----------
     Decimal titles use 1. / 2. / 3. rather than 01. / 02. / 03. */
  const normalizeLeadingZero=(root)=>{
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];
    let node;
    while((node=walker.nextNode()))nodes.push(node);
    nodes.forEach(textNode=>{
      textNode.nodeValue=textNode.nodeValue.replace(/(^|\s)0([1-9])\./g,'$1$2.');
    });
  };
  main.querySelectorAll(
    '#brand .hm-subtitle, #brand .direction-card h4, #journey .hm-subtitle, #journey .forced-redesign-title, .wide-title-index'
  ).forEach(normalizeLeadingZero);

  /* ---------- 02.2 / TRAFFIC ----------
     IMPORTANT: do not keep a static image here. himart-flow-line-sync-v1.js mounts the inline
     traffic-v5 SVG after this script and that inline SVG is the element that receives stroke drawing.
     Keeping the v8 <img> as well caused the same graph to render twice. */
  const traffic=cardByNo('02.2');
  const trafficWrap=traffic?.querySelector('.chart-wrap');
  if(trafficWrap){
    trafficWrap.className='data-viz chart-wrap wide-unified-traffic';
    trafficWrap.innerHTML=`
      <div class="wide-traffic-legend" aria-hidden="true">
        <span><i style="--c:var(--hm-yellow)"></i>세션</span>
        <span><i style="--c:var(--hm-newblue)"></i>구매건수</span>
        <span><i style="--c:var(--hm-green)"></i>구매전환율</span>
      </div>`;
  }

  /* ---------- 02.5 / HOME ----------
     Rebuild from source values, but preserve the legacy hbars / hbar / track / fill class names.
     The shared motion engine keys off those class names; v8 previously removed them, which made
     the HOME drawing animation disappear. */
  const home=cardByNo('02.5');
  const hbars=home?.querySelector('.data-viz.hbars');
  if(hbars){
    const rows=[...hbars.querySelectorAll('.hbar')].map((row,i)=>({
      label:row.querySelector('span')?.textContent?.trim()||'',
      value:row.querySelector('b')?.textContent?.trim()||'',
      width:row.querySelector('.fill')?.style?.width||'0%',
      color:[
        'var(--hm-blue)',
        'var(--hm-newblue)',
        'var(--hm-green)',
        'var(--hm-yellow)',
        'rgba(255,255,255,.34)',
        'rgba(255,255,255,.18)'
      ][i]||'var(--hm-blue)'
    }));
    hbars.className='data-viz hbars wide-home-bars';
    hbars.innerHTML=rows.map(row=>`
      <div class="hbar wide-home-bar">
        <span class="wide-home-bar-label">${row.label}</span>
        <div class="track wide-home-bar-track"><i class="fill wide-home-bar-fill" style="width:${row.width};--wide-bar-color:${row.color}"></i></div>
        <b class="wide-home-bar-value">${row.value}</b>
      </div>`).join('');
  }

  /* ---------- 03 / JOURNEY ROLLBACK ----------
     v7 physically moved AS-IS nodes into tablet clusters. Restore the pre-v7 DOM order so the
     first 03 visualization can return to the rectangular wide-layout version. The redesign area
     is intentionally left alone; only its circles are recolored by CSS. */
  const journey=main.querySelector('#journey');
  const signal=journey?.querySelector('.journey-signal-subsection');
  if(signal){
    [...signal.querySelectorAll('.wide-flow-cluster')].forEach(cluster=>{
      const row=cluster.parentElement;
      const inner=cluster.querySelector('.wide-flow-cluster-inner');
      if(!row||!inner)return;
      [...inner.children].forEach(child=>row.insertBefore(child,cluster));
      cluster.remove();
    });
  }

  /* ---------- WIDE-SPECIFIC DRAW MOTION ----------
     The original shared motion selector predates the v5 segmented bars and v8 rebuilt HOME bars.
     It only knows .pie / .chart-wrap / .search-slope / .hbars / .landing-chart. Add a small,
     page-local observer for the new graph structures instead of changing production/shared pages. */
  const mountWideDrawMotion=()=>{
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets=[];

    main.querySelectorAll('#data .wide-segmented-bar').forEach(el=>{
      el.classList.add('wide-draw-motion');
      targets.push(el);
    });
    main.querySelectorAll('#data .wide-home-bars').forEach(el=>{
      el.classList.add('wide-draw-motion');
      targets.push(el);
    });
    main.querySelectorAll('#brand .ring-card').forEach(el=>targets.push(el));
    main.querySelectorAll('#brand .sentiment-graph, #brand .conclusion-grid').forEach(el=>targets.push(el));

    const activate=el=>{
      if(!el||el.classList.contains('is-wide-chart-active'))return;
      el.classList.add('is-wide-chart-active');
    };

    if(reduced){
      targets.forEach(activate);
      return;
    }

    const visible=el=>{
      const rect=el.getBoundingClientRect();
      return rect.top<innerHeight*.94&&rect.bottom>innerHeight*.06;
    };
    targets.filter(visible).forEach((el,i)=>setTimeout(()=>activate(el),80+i*55));

    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting)return;
          activate(entry.target);
          observer.unobserve(entry.target);
        });
      },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
      targets.forEach(el=>observer.observe(el));
    }else{
      targets.forEach(activate);
    }

    /* Dynamic source insertion and mobile desktop-view can move the initial geometry after mount. */
    setTimeout(()=>targets.filter(visible).forEach(activate),700);
  };

  mountWideDrawMotion();

  /* Re-run numbering normalization once more after all v8 DOM replacements. */
  main.querySelectorAll('.wide-title-index, #journey .hm-subtitle, #journey .forced-redesign-title')
    .forEach(normalizeLeadingZero);
})();

;
/* bundled: himart-wide-refine-v9.js */
(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')]
    .find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));

  /* ---------- 03 / RESTORE TABLET-CLUSTER JOURNEY ----------
     v8 unwrapped the v7 clusters. Rebuild the exact v7 grouping after v8 has finished. */
  const journey=main.querySelector('#journey');
  const signal=journey?.querySelector('.journey-signal-subsection');
  if(signal){
    const groups=[...signal.querySelectorAll('.flow-group')];
    const buildCluster=(group,nodeCount,label,klass)=>{
      if(!group)return;
      const row=group.querySelector('.flow-row');
      if(!row)return;
      /* Remove a stale/partial cluster first so rebuild is deterministic. */
      [...row.querySelectorAll(':scope > .wide-flow-cluster')].forEach(cluster=>{
        const inner=cluster.querySelector('.wide-flow-cluster-inner');
        if(inner)[...inner.children].forEach(child=>row.insertBefore(child,cluster));
        cluster.remove();
      });
      const children=[...row.children];
      const moveCount=nodeCount*2-1;
      const moving=children.slice(0,moveCount);
      if(!moving.length)return;
      const cluster=document.createElement('div');
      cluster.className=`wide-flow-cluster ${klass}`;
      cluster.innerHTML=`<div class="wide-flow-cluster-label">${label}</div><div class="wide-flow-cluster-inner"></div>`;
      const inner=cluster.querySelector('.wide-flow-cluster-inner');
      moving.forEach(el=>inner.appendChild(el));
      row.insertBefore(cluster,row.firstChild);
    };
    buildCluster(groups[0],3,'외부 랜딩 이후 다음 탐색이 끊김 · 기획전 바로 종료 52.2%','wide-flow-cluster--alert');
    buildCluster(groups[1],2,'PDP 관심은 유지됐지만 장바구니·구매 행동은 약화','wide-flow-cluster--focus');
  }

  /* ---------- 02.2 / GUARANTEE ONE TRAFFIC SVG ----------
     Earlier layers alternated between source SVG, static image and asynchronously mounted live SVG.
     Keep exactly one inline SVG. The class traffic-v5-live also prevents the shared engine from mounting a second copy. */
  const traffic=cardByNo('02.2');
  const trafficWrap=traffic?.querySelector('.chart-wrap');
  const trafficMarkup=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1160 330" class="chart-svg traffic-v5-live v9-traffic-svg" role="img" aria-label="2026년 1월부터 6월까지 세션, 구매건수, 구매전환율"><style>text{font-family:Arial,sans-serif;fill:rgba(255,255,255,.46);font-size:12px}.grid{stroke:rgba(255,255,255,.12);stroke-width:1}.session{stroke:#F3EB01;stroke-width:2}.purchase{fill:none;stroke:#00A6ED;stroke-width:.75;stroke-linecap:round;stroke-linejoin:round}.cvr{fill:none;stroke:#00EDBD;stroke-width:.75;stroke-linecap:round;stroke-linejoin:round}.p-dot{fill:#00B8DE}.c-dot{fill:#00EDBD}.right-blue{fill:#00A6ED}.right-green{fill:#00EDBD}</style><text x="0" y="22">SESSIONS</text><text x="0" y="58">6M</text><text x="0" y="158">3M</text><text x="0" y="258">0</text><line class="grid" x1="90" y1="50" x2="1070" y2="50"/><line class="grid" x1="90" y1="150" x2="1070" y2="150"/><line class="grid" x1="90" y1="250" x2="1070" y2="250"/><text class="right-blue" x="1088" y="64">42K</text><text class="right-blue" x="1088" y="158">39K</text><text class="right-blue" x="1088" y="252">36K</text><text class="right-green" x="1088" y="88">1.2%</text><text class="right-green" x="1088" y="180">0.9%</text><text class="right-green" x="1088" y="272">0.6%</text><line class="session" x1="145" y1="95" x2="145" y2="250"/><line class="session" x1="325" y1="132" x2="325" y2="250"/><line class="session" x1="505" y1="102" x2="505" y2="250"/><line class="session" x1="685" y1="61" x2="685" y2="250"/><line class="session" x1="865" y1="64" x2="865" y2="250"/><line class="session" x1="1045" y1="97" x2="1045" y2="250"/><polyline class="purchase" points="145,78 325,182 505,184 685,183 865,132 1045,117"/><circle class="p-dot" cx="145" cy="78" r="3"/><circle class="p-dot" cx="325" cy="182" r="3"/><circle class="p-dot" cx="505" cy="184" r="3"/><circle class="p-dot" cx="685" cy="183" r="3"/><circle class="p-dot" cx="865" cy="132" r="3"/><circle class="p-dot" cx="1045" cy="117" r="3"/><polyline class="cvr" points="145,170 325,85 505,185 685,240 865,226 1045,174"/><circle class="c-dot" cx="145" cy="170" r="2.5"/><circle class="c-dot" cx="325" cy="85" r="2.5"/><circle class="c-dot" cx="505" cy="185" r="2.5"/><circle class="c-dot" cx="685" cy="240" r="2.5"/><circle class="c-dot" cx="865" cy="226" r="2.5"/><circle class="c-dot" cx="1045" cy="174" r="2.5"/><text x="133" y="300">1월</text><text x="313" y="300">2월</text><text x="493" y="300">3월</text><text x="673" y="300">4월</text><text x="853" y="300">5월</text><text x="1033" y="300">6월</text></svg>`;

  const ensureSingleTraffic=()=>{
    if(!trafficWrap)return null;
    trafficWrap.querySelectorAll('.wide-traffic-image').forEach(el=>el.remove());
    trafficWrap.querySelectorAll('.chart-svg:not(.traffic-v5-live)').forEach(el=>el.remove());
    let svgs=[...trafficWrap.querySelectorAll('.traffic-v5-live')];
    if(!svgs.length){
      const holder=document.createElement('div');
      holder.innerHTML=trafficMarkup;
      const svg=holder.firstElementChild;
      const legend=trafficWrap.querySelector('.wide-traffic-legend,.chart-legend');
      trafficWrap.insertBefore(svg,legend||trafficWrap.firstChild);
      svgs=[svg];
    }
    svgs.slice(1).forEach(el=>el.remove());
    return svgs[0];
  };

  const prepTrafficSvg=svg=>{
    if(!svg)return;
    [...svg.querySelectorAll('.session')].forEach((shape,index)=>{
      const length=Math.max(1,shape.getTotalLength());
      shape.style.strokeDasharray=String(length);
      shape.style.strokeDashoffset=String(length);
      shape.style.transition=`stroke-dashoffset 460ms cubic-bezier(.2,.8,.2,1) ${index*70}ms`;
    });
    const purchase=svg.querySelector('.purchase');
    if(purchase){
      const length=Math.max(1,purchase.getTotalLength());
      purchase.style.strokeDasharray=String(length);
      purchase.style.strokeDashoffset=String(length);
      purchase.style.transition='stroke-dashoffset 820ms cubic-bezier(.2,.8,.2,1) 620ms';
    }
    [...svg.querySelectorAll('.p-dot')].forEach((dot,index)=>{
      dot.style.opacity='0';
      dot.style.transition=`opacity 180ms ease ${1320+index*45}ms`;
    });
    const cvr=svg.querySelector('.cvr');
    if(cvr){
      const length=Math.max(1,cvr.getTotalLength());
      cvr.style.strokeDasharray=String(length);
      cvr.style.strokeDashoffset=String(length);
      cvr.style.transition='stroke-dashoffset 820ms cubic-bezier(.2,.8,.2,1) 1500ms';
    }
    [...svg.querySelectorAll('.c-dot')].forEach((dot,index)=>{
      dot.style.opacity='0';
      dot.style.transition=`opacity 180ms ease ${2200+index*45}ms`;
    });
  };

  const activateTraffic=()=>{
    const svg=ensureSingleTraffic();
    if(!svg)return;
    [...svg.querySelectorAll('.session')].forEach(shape=>shape.style.strokeDashoffset='0');
    const purchase=svg.querySelector('.purchase');if(purchase)purchase.style.strokeDashoffset='0';
    [...svg.querySelectorAll('.p-dot')].forEach(dot=>dot.style.opacity='1');
    const cvr=svg.querySelector('.cvr');if(cvr)cvr.style.strokeDashoffset='0';
    [...svg.querySelectorAll('.c-dot')].forEach(dot=>dot.style.opacity='1');
  };

  const trafficSvg=ensureSingleTraffic();
  prepTrafficSvg(trafficSvg);

  /* ---------- ONE MOTION OWNER FOR EVERY CURRENT GRAPH TYPE ----------
     v5-v8 changed chart DOM class names several times. Reset all current graph types into one v9
     state, then activate only when they enter the viewport. This makes old shared is-chart-active /
     is-wide-chart-active classes harmless. */
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets=[];
  const add=(el,type)=>{
    if(!el||targets.some(item=>item.el===el))return;
    el.classList.add('v9-chart-motion');
    el.classList.remove('is-v9-chart-active');
    targets.push({el,type});
  };

  main.querySelectorAll('#brand .ring-card').forEach(el=>add(el,'ring'));
  add(main.querySelector('#brand .sentiment-graph'),'sentiment');
  add(main.querySelector('#brand .conclusion-grid'),'sentiment');
  main.querySelectorAll('#data .wide-segmented-bar').forEach(el=>add(el,'segmented'));
  add(main.querySelector('#data .search-slope'),'search');
  add(main.querySelector('#data .wide-home-bars'),'home');
  if(trafficWrap)add(trafficWrap,'traffic');

  const activate=item=>{
    if(!item||item.el.classList.contains('is-v9-chart-active'))return;
    item.el.classList.add('is-v9-chart-active');
    if(item.type==='traffic')activateTraffic();
  };

  const visible=item=>{
    const rect=item.el.getBoundingClientRect();
    return rect.top<innerHeight*.92&&rect.bottom>innerHeight*.08;
  };

  if(reduced){
    targets.forEach(activate);
  }else{
    /* One frame reset is required even when an old observer has already marked a chart active. */
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        targets.filter(visible).forEach((item,index)=>setTimeout(()=>activate(item),120+index*50));
      });
    });
    if('IntersectionObserver' in window){
      const map=new Map(targets.map(item=>[item.el,item]));
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting)return;
          const item=map.get(entry.target);
          if(item)activate(item);
          observer.unobserve(entry.target);
        });
      },{threshold:.14,rootMargin:'0px 0px -7% 0px'});
      targets.forEach(item=>observer.observe(item.el));
    }else{
      targets.forEach((item,index)=>setTimeout(()=>activate(item),100+index*55));
    }
  }

  /* The shared traffic script can arrive after v9. If it touches the wrapper, dedupe again without
     replacing our prepared SVG. */
  if(trafficWrap&&'MutationObserver' in window){
    const mo=new MutationObserver(()=>{
      const svg=ensureSingleTraffic();
      if(svg&&!svg.dataset.v9Prepared){
        svg.dataset.v9Prepared='1';
        prepTrafficSvg(svg);
        if(trafficWrap.classList.contains('is-v9-chart-active'))requestAnimationFrame(activateTraffic);
      }
    });
    mo.observe(trafficWrap,{childList:true,subtree:false});
    if(trafficSvg)trafficSvg.dataset.v9Prepared='1';
  }
})();

/* Isolated rollback loader: affects only the 03 journey treatment. */
(() => {
  'use strict';
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='./himart-wide-refine-v10.css?v=9013c72';
  document.head.appendChild(css);
  const script=document.createElement('script');
  script.src='./himart-wide-refine-v10.js?v=8850f1d';
  document.body.appendChild(script);
})();

;
/* bundled: himart-wide-refine-v12.js */
(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  document.body.classList.add('himart-v12');

  const stripPrefix=(html='')=>html
    .replace(/^\s*(?:0?\d+|[IVXLCDM]+)\.\s*/i,'')
    .replace(/^\s*<span[^>]*class=["'][^"']*(?:wide-title-index|wide-roman-index)[^"']*["'][^>]*>.*?<\/span>\s*/i,'');
  const subByNo=(root,no)=>[...(root||main).querySelectorAll('.hm-subsection')]
    .find(s=>s.querySelector('.hm-subno')?.textContent.includes(no));
  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')]
    .find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));
  const setDecimal=(el,n)=>{
    if(!el)return;
    el.innerHTML=`<span class="wide-title-index">${n}.</span>${stripPrefix(el.innerHTML)}`;
  };
  const setRoman=(el,n)=>{
    if(!el)return;
    el.innerHTML=`<span class="wide-roman-index">${n}.</span> ${stripPrefix(el.innerHTML)}`;
  };

  /* ---------- 01 / QUALITATIVE ---------- */
  const brand=main.querySelector('#brand');
  if(brand){
    const chapterTitle=brand.querySelector(':scope > .hm-wrap > .hm-section-head .hm-section-title');
    if(chapterTitle)chapterTitle.innerHTML='개편보다 하이마트가 어떤 브랜드로<br>인식되는지 부터 확인했습니다.';

    [['01.1',1],['01.2',2],['01.3',3],['01.4',4]].forEach(([no,n])=>{
      setDecimal(subByNo(brand,no)?.querySelector('.hm-subtitle'),n);
    });

    /* Keyword clouds -> plain 16px comma-separated lists; keep section colors. */
    brand.querySelectorAll('.keyword-group').forEach(group=>{
      const cloud=group.querySelector('.keyword-cloud');
      if(!cloud||cloud.querySelector('.wide-keyword-list'))return;
      const labels=[...cloud.querySelectorAll('.keyword-pill b')]
        .map(el=>el.textContent.trim()).filter(Boolean);
      cloud.innerHTML=`<p class="wide-keyword-list">${labels.join(', ')}</p>`;
    });

    const meaning=subByNo(brand,'01.2');
    if(meaning){
      const groups=[...meaning.querySelectorAll('.voice-group')];
      const positive=groups[0]?.querySelector('.voice-group-title');
      const negative=groups[1]?.querySelector('.voice-group-title');
      if(positive)positive.innerHTML='<span class="v12-voice-accent is-positive">I.신뢰, 매장 경험, 옴니 채널 강점</span><br><span class="v12-voice-rest">으로 정리되는 긍정 키워드</span>';
      if(negative)negative.innerHTML='<span class="v12-voice-accent is-negative">II.UX불편, 지연, 경험 불일치</span><br><span class="v12-voice-rest">로 정리되는 부정 키워드</span>';
    }

    const summary=subByNo(brand,'01.3');
    if(summary){
      const sentimentTitle=summary.querySelector('.sentiment-title');
      if(sentimentTitle)sentimentTitle.textContent='I.긍정과 부정의 키워드의 비율';
      const conclusionTitle=summary.querySelector('.sentiment-conclusion>h4');
      if(conclusionTitle)conclusionTitle.textContent='II.사용자들의 피드백 종합';

      const blocks=[...summary.querySelectorAll('.sentiment-block')];
      const keyCopy=[
        ['오프라인 체험 · 전문가 상담 · 제품 다양성 · 설치/A/S 신뢰 · 통합 쇼핑가격/혜택','즉시수령 · 토탈 케어 · 접근성 · 가전 전문성'],
        ['앱/UI/UX 불편 · 배송/설치 지연 · 가격/혜택 복잡성 · 환불/교환 불편','문의/A/S 지연 · 재고 문제 · 직원 부담 · 온/오프라인 불일치']
      ];
      blocks.forEach((block,i)=>{
        const keywords=block.querySelector('.sentiment-keywords');
        if(keywords&&keyCopy[i])keywords.innerHTML=`<b>핵심 키워드</b><span class="v12-keyline">${keyCopy[i][0]}</span><span class="v12-keyline">${keyCopy[i][1]}</span>`;
      });
    }

    const ux=subByNo(brand,'01.4');
    const directionList=ux?.querySelector('.direction-list');
    if(directionList){
      const titles=[
        '1.매장의 전문성을 온라인 경험으로 전환',
        '2.흐름이 이어지는 구매경험',
        '3.매장과 온라인, 끊기지 않는 경험',
        '4.검색·탐색 등 쇼핑의 기본기를 먼저 강화',
        '5.모든 진행상황은 투명하고 쉽게 확인',
        '6.흐름이 끊기지 않는 UX'
      ];
      const cards=[...directionList.querySelectorAll('.direction-card')];
      if(cards.length<6){
        const extra=document.createElement('article');
        extra.className='direction-card';
        extra.innerHTML='<span class="hm-card-no">06</span><h4>6.흐름이 끊기지 않는 UX</h4><p>앞 단계의 관심·혜택·비교 기준을 다음 화면에서도 유지해 다시 찾지 않게 합니다.</p>';
        directionList.appendChild(extra);
      }
      [...directionList.querySelectorAll('.direction-card')].forEach((card,i)=>{
        const title=card.querySelector('h4');
        if(title&&titles[i])title.textContent=titles[i];
      });
    }
  }

  /* Ring reveal owned by v12. */
  const rings=[...main.querySelectorAll('#brand .ring-card')];
  rings.forEach(r=>r.classList.remove('is-v12-ring-active'));
  const activateRing=ring=>ring?.classList.add('is-v12-ring-active');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    rings.forEach(activateRing);
  }else if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){activateRing(entry.target);io.unobserve(entry.target)}
    }),{threshold:.28,rootMargin:'0px 0px -7% 0px'});
    rings.forEach(r=>io.observe(r));
  }else rings.forEach(activateRing);

  /* ---------- 02 / DATA ---------- */
  const data=main.querySelector('#data');
  if(data){
    const search=cardByNo('02.4');
    if(search){
      search.classList.add('v12-removed-search');
      search.remove();
    }
    const order=[['02.1','I'],['02.2','II'],['02.5','III'],['02.6','IV']];
    order.forEach(([no,roman])=>setRoman(cardByNo(no)?.querySelector('.data-card-head h3'),roman));

    const bridge=data.querySelector('.data-bridge');
    const bridgeTitle=bridge?.querySelector('.data-bridge-title');
    if(bridgeTitle)bridgeTitle.innerHTML='<span class="wide-roman-index">V.</span> 결과적으로 데이터를 분석해 보니 뚜렷한 패턴이 보였습니다.';
  }

  /* ---------- 03 / JOURNEY ---------- */
  const journey=main.querySelector('#journey');
  const ensureCluster=(group,nodeCount,label,mode)=>{
    if(!group)return;
    const row=group.querySelector('.flow-row');
    if(!row)return;
    let cluster=row.querySelector(':scope > .wide-flow-cluster');
    if(!cluster){
      const children=[...row.children];
      const moving=children.slice(0,nodeCount*2-1);
      if(!moving.length)return;
      cluster=document.createElement('div');
      cluster.className='wide-flow-cluster v12-journey-tablet';
      cluster.innerHTML='<div class="wide-flow-cluster-label"></div><div class="wide-flow-cluster-inner"></div>';
      const inner=cluster.querySelector('.wide-flow-cluster-inner');
      moving.forEach(el=>inner.appendChild(el));
      row.insertBefore(cluster,row.firstChild);
    }
    cluster.classList.add('v12-journey-tablet');
    cluster.classList.toggle('v12-tablet-red',mode==='red');
    cluster.classList.toggle('v12-tablet-blue',mode==='blue');
    const labelEl=cluster.querySelector('.wide-flow-cluster-label');
    if(labelEl)labelEl.textContent=label;
  };

  const enforceJourney=()=>{
    if(!journey)return;
    const signal=journey.querySelector('.journey-signal-subsection');
    if(signal){
      const groups=[...signal.querySelectorAll('.flow-group')];
      ensureCluster(groups[0],3,'외부 랜딩 이후 다음 탐색이 끊김 · 기획전 바로 종료 52.2%','red');
      ensureCluster(groups[1],2,'PDP 관심은 유지됐지만 장바구니·구매 행동은 약화','red');
    }
    const redesign=journey.querySelector('.journey-redesign-subsection');
    if(redesign){
      const groups=[...redesign.querySelectorAll('.flow-group')];
      ensureCluster(groups[0],3,'유입 맥락을 잃지 않고 탐색으로 연결','blue');
      ensureCluster(groups[1],2,'비교 기준을 유지해 구매 확신과 설치·케어까지 연결','blue');
    }
  };

  enforceJourney();
  /* v9 can load v10 asynchronously after this script. Reassert only the journey grammar afterwards. */
  setTimeout(enforceJourney,120);
  setTimeout(enforceJourney,650);
  if(journey&&'MutationObserver' in window){
    let queued=false;
    const mo=new MutationObserver(()=>{
      if(queued)return;
      queued=true;
      requestAnimationFrame(()=>{queued=false;enforceJourney()});
    });
    mo.observe(journey,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),2200);
  }
})();

;
/* bundled: himart-wide-refine-v13.js */
(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  document.body.classList.add('himart-v13');

  const brand=main.querySelector('#brand');
  if(brand){
    /* Restore the original tablet/pill keyword grammar after v12 flattened the lists. */
    const keywordSets=[
      {
        labels:['설치 서비스','매장 체험','A/S 접근성','결제·픽업','통합 앱·온라인 연동','전시특가','포인트·쿠폰','전문 상담','제품 다양성','디지털 체험','빠른 설치','즉시 수령','전국 매장 접근성','홈서비스','토탈 솔루션','평생케어','고객 케어','즉시 할인','이벤트·프로모션','가전 전문성'],
        major:new Set(['설치 서비스','매장 체험','A/S 접근성','결제·픽업','전문 상담','가전 전문성'])
      },
      {
        labels:['앱/UX 불편','설치·배송','A/S','반품·환불','직원 응대','재고관리','가격·혜택','온·오프라인','고객센터','프로모션·할인','회원가입 오류','UI 혼잡','온라인 정보 부족','배송 문제','오배송','매장 구조 불편','접근성 한계','끼워팔기','긴 대기','홍보와 실제의 차이'],
        major:new Set(['앱/UX 불편','설치·배송','A/S','반품·환불','온·오프라인'])
      }
    ];
    [...brand.querySelectorAll('.keyword-group')].forEach((group,i)=>{
      const cloud=group.querySelector('.keyword-cloud');
      const set=keywordSets[i];
      if(!cloud||!set)return;
      cloud.innerHTML=set.labels.map(label=>`<span class="keyword-pill${set.major.has(label)?' major':''}"><b>${label}</b></span>`).join('');
    });

    /* Keep the requested 22px voice-summary wording. */
    const meaning=[...brand.querySelectorAll('.hm-subsection')]
      .find(s=>s.querySelector('.hm-subno')?.textContent.includes('01.2'));
    if(meaning){
      const groups=[...meaning.querySelectorAll('.voice-group')];
      const positive=groups[0]?.querySelector('.voice-group-title');
      const negative=groups[1]?.querySelector('.voice-group-title');
      if(positive)positive.innerHTML='<span class="v12-voice-accent is-positive">I.신뢰, 매장 경험, 옴니 채널 강점</span><br><span class="v12-voice-rest">으로 정리되는 긍정 키워드</span>';
      if(negative)negative.innerHTML='<span class="v12-voice-accent is-negative">II.UX불편, 지연, 경험 불일치</span><br><span class="v12-voice-rest">로 정리되는 부정 키워드</span>';
    }

    /* Final UX-principle labels: no numbering; explicit line breaks. */
    const ux=[...brand.querySelectorAll('.hm-subsection')]
      .find(s=>s.querySelector('.hm-subno')?.textContent.includes('01.4'));
    const titles=[
      '매장의 전문성을<br>온라인 경험으로 전환',
      '흐름이 이어지는<br>구매경험',
      '매장과 온라인,<br>끊기지 않는 경험',
      '검색·탐색 등<br>쇼핑의 기본기를 먼저 강화',
      '모든 진행상황은<br>투명하고 쉽게 확인',
      '흐름이 끊기지 않는 UX'
    ];
    [...(ux?.querySelectorAll('.direction-card')||[])].forEach((card,i)=>{
      const title=card.querySelector('h4');
      if(title&&titles[i])title.innerHTML=titles[i];
    });
  }

  /* v13 owns the visible ring drawing so it is not affected by older motion states. */
  const rings=[...main.querySelectorAll('#brand .ring-card')];
  rings.forEach(r=>r.classList.remove('is-v13-ring-active'));
  const activate=ring=>ring?.classList.add('is-v13-ring-active');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    rings.forEach(activate);
  }else if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      activate(entry.target);
      io.unobserve(entry.target);
    }),{threshold:.24,rootMargin:'0px 0px -8% 0px'});
    rings.forEach(r=>io.observe(r));
  }else rings.forEach(activate);

  /* Reassert the requested tablet colors/labels after any delayed v10/v12 journey rebuild. */
  const journey=main.querySelector('#journey');
  const enforceJourney=()=>{
    if(!journey)return;
    const signal=journey.querySelector('.journey-signal-subsection');
    const redesign=journey.querySelector('.journey-redesign-subsection');
    [...(signal?.querySelectorAll('.wide-flow-cluster')||[])].forEach(cluster=>{
      cluster.classList.add('v12-journey-tablet');
      cluster.style.setProperty('--v12-tablet-color','var(--hm-red)');
    });
    [...(redesign?.querySelectorAll('.wide-flow-cluster')||[])].forEach(cluster=>{
      cluster.classList.add('v12-journey-tablet');
      cluster.style.setProperty('--v12-tablet-color','var(--hm-blue)');
    });
  };
  enforceJourney();
  setTimeout(enforceJourney,180);
  setTimeout(enforceJourney,760);
})();

;
/* bundled: himart-wide-refine-v14.js */
(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  document.body.classList.add('himart-v14');

  /* ---------- 01 / RING DRAWING ----------
     Use an explicit SVG overlay so the 5px 12-o'clock drawing is not affected by older pseudo-element motion code. */
  const rings=[...main.querySelectorAll('#brand .ring-card')];
  rings.forEach(ring=>{
    ring.querySelector('.v14-ring-svg')?.remove();
    const raw=ring.style.getPropertyValue('--pct').trim();
    const pct=Math.max(0,Math.min(100,parseFloat(raw)||0));
    ring.style.setProperty('--v14-ring-offset',String(100-pct));
    ring.classList.remove('is-v14-ring-active');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','v14-ring-svg');
    svg.setAttribute('viewBox','0 0 100 100');
    svg.setAttribute('aria-hidden','true');
    const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');
    circle.setAttribute('class','v14-ring-progress');
    circle.setAttribute('cx','50');
    circle.setAttribute('cy','50');
    circle.setAttribute('r','49');
    circle.setAttribute('pathLength','100');
    svg.appendChild(circle);
    ring.appendChild(svg);
  });

  const activateRing=ring=>ring?.classList.add('is-v14-ring-active');
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    rings.forEach(activateRing);
  }else if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      requestAnimationFrame(()=>activateRing(entry.target));
      io.unobserve(entry.target);
    }),{threshold:.22,rootMargin:'0px 0px -8% 0px'});
    rings.forEach(r=>io.observe(r));
  }else{
    rings.forEach(activateRing);
  }

  /* ---------- 02 / ENTRY ---------- */
  const entry=main.querySelector('#data .wide-entry-bar');
  const entryTail=entry?.querySelector('.wide-segment:last-child');
  entryTail?.querySelector('span')?.remove();

  /* ---------- 03 / JOURNEY COPY BALANCE ---------- */
  const splitBalanced=(text)=>{
    const clean=(text||'').replace(/\s+/g,' ').trim();
    if(!clean)return ['', ''];
    const words=clean.split(' ');
    if(words.length<2)return [clean,''];
    let best=1,bestDiff=Infinity;
    for(let i=1;i<words.length;i++){
      const a=words.slice(0,i).join(' ');
      const b=words.slice(i).join(' ');
      const diff=Math.abs(a.replace(/\s/g,'').length-b.replace(/\s/g,'').length);
      if(diff<bestDiff){best=i;bestDiff=diff;}
    }
    return [words.slice(0,best).join(' '),words.slice(best).join(' ')];
  };

  const balanceJourneyCopy=()=>{
    main.querySelectorAll('#journey .flow-node p').forEach(p=>{
      if(p.dataset.v14Balanced==='1')return;
      const [a,b]=splitBalanced(p.textContent);
      if(!b)return;
      p.dataset.v14Balanced='1';
      p.classList.add('v14-balanced-flow-copy');
      p.innerHTML=`<span class="v14-flow-line">${a}</span><span class="v14-flow-line">${b}</span>`;
    });
  };

  const centerTabletLabels=()=>{
    main.querySelectorAll('#journey .wide-flow-cluster .wide-flow-cluster-label').forEach(label=>{
      label.style.left='50%';
      label.style.right='auto';
      label.style.transform='translate(-50%,-50%)';
      label.style.textAlign='center';
    });
  };

  balanceJourneyCopy();
  centerTabletLabels();

  /* Older journey rebuilds can land a little later. Re-apply only the harmless copy/label alignment. */
  setTimeout(()=>{balanceJourneyCopy();centerTabletLabels();},180);
  setTimeout(()=>{balanceJourneyCopy();centerTabletLabels();},780);
})();

;
/* bundled: himart-wide-refine-v15.js */
(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  document.body.classList.add('himart-v15');

  /* ---------- 01 / RING DRAWING ----------
     SVG dash patterns can fragment at the path seam on mobile Chromium.
     Draw a single conic sector instead: 0deg is 12 o'clock, angles increase clockwise,
     and a radial mask leaves an exact 5px continuous ring. */
  const rings=[...main.querySelectorAll('#brand .ring-card')];
  rings.forEach(ring=>{
    ring.querySelectorAll('.v14-ring-svg,.v15-ring-svg,.v15-ring-arc').forEach(el=>el.remove());

    const pct=Math.max(0,Math.min(100,parseFloat(ring.style.getPropertyValue('--pct'))||0));
    ring.dataset.v15Pct=String(pct);
    ring.dataset.v15RingPlayed='0';

    const arc=document.createElement('span');
    arc.className='v15-ring-arc';
    arc.setAttribute('aria-hidden','true');
    arc.style.setProperty('--v15-ring-angle','0deg');
    ring.appendChild(arc);
  });

  const playRing=ring=>{
    if(!ring||ring.dataset.v15RingPlayed==='1')return;
    ring.dataset.v15RingPlayed='1';
    const arc=ring.querySelector('.v15-ring-arc');
    if(!arc)return;

    const pct=Math.max(0,Math.min(100,parseFloat(ring.dataset.v15Pct)||0));
    const finalAngle=pct*3.6;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){
      arc.style.setProperty('--v15-ring-angle',`${finalAngle}deg`);
      return;
    }

    const start=performance.now();
    const duration=1200;
    const frame=now=>{
      const t=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-t,3);
      arc.style.setProperty('--v15-ring-angle',`${finalAngle*eased}deg`);
      if(t<1)requestAnimationFrame(frame);
      else arc.style.setProperty('--v15-ring-angle',`${finalAngle}deg`);
    };
    requestAnimationFrame(frame);
  };

  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    rings.forEach(playRing);
  }else if('IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      playRing(entry.target);
      io.unobserve(entry.target);
    }),{threshold:.24,rootMargin:'0px 0px -8% 0px'});
    rings.forEach(ring=>io.observe(ring));
  }else{
    rings.forEach(playRing);
  }

  /* ---------- 02 / ACTION LABEL ---------- */
  const action=main.querySelector('#data .wide-action-bar');
  const endSegment=action?.querySelector('.wide-segment:first-child');
  const endSpan=endSegment?.querySelector(':scope > span');
  if(endSpan){
    const small=endSpan.querySelector('small');
    const value=small?.textContent?.trim()||'52.2%';
    endSpan.innerHTML=`<span class="v15-action-label">종료</span><small>${value}</small>`;
  }

  /* ---------- V / DATA SYNTHESIS ---------- */
  const bridge=main.querySelector('#data .data-bridge');
  const bridgeTitle=bridge?.querySelector('.data-bridge-title');
  if(bridgeTitle){
    bridgeTitle.innerHTML='<span class="wide-roman-index">V.</span> 결과적으로 데이터를 분석해 보니 뚜렷한 패턴이 보였습니다.';
  }
})();

;
/* bundled: himart-production-refine-v16.js */
(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  document.body.classList.add('himart-prod-v16');

  const subByNo=(root,no)=>[...(root||main).querySelectorAll('.hm-subsection')]
    .find(s=>s.querySelector('.hm-subno')?.textContent.includes(no));

  /* ---------- 01 / QUALITATIVE ---------- */
  const brand=main.querySelector('#brand');
  if(brand){
    const meaning=subByNo(brand,'01.2');
    if(meaning){
      let source=meaning.querySelector('.production-meaning-source');
      if(!source){
        source=document.createElement('p');
        source.className='production-meaning-source';
        source.textContent='25~26년 초까지의 리뷰, SNS, 커뮤니티 자료와 내부 VOC 자료 취합본';
        const stack=meaning.querySelector('.voice-stack');
        if(stack)stack.insertAdjacentElement('afterend',source);
        else meaning.appendChild(source);
      }
    }
    const summary=subByNo(brand,'01.3');
    summary?.classList.add('production-summary-after-source');
  }

  /* ---------- 03 / JOURNEY CONCLUSION ---------- */
  const journey=main.querySelector('#journey');
  if(journey){
    const redesign=journey.querySelector('.journey-redesign-subsection');
    if(redesign&&!redesign.querySelector('.production-tobe-conclusion')){
      const conclusion=document.createElement('p');
      conclusion.className='production-tobe-conclusion';
      conclusion.innerHTML='이후 설계에서는 <strong>유입 맥락과 판단 기준을 다음 화면까지 유지하고, 구매 확신과 설치·케어가 끊기지 않도록</strong> 각 화면의 역할과 정보 구조에 반영했습니다.';
      const flow=redesign.querySelector('.flow-area');
      if(flow)flow.insertAdjacentElement('afterend',conclusion);
      else redesign.appendChild(conclusion);
    }
  }

  /* ---------- 04 / PROTOTYPE: 3 wireframes + text per row, 4 rows ---------- */
  const direction=main.querySelector('#direction');
  const caseList=direction?.querySelector('.prototype-case-list');
  if(caseList){
    caseList.classList.add('production-prototype-case-list');
    [...caseList.querySelectorAll(':scope > .prototype-case')].forEach((item,rowIndex)=>{
      const visual=item.querySelector('.prototype-case-visual');
      const original=visual?.querySelector('.galaxy-ultra-mockup');
      if(!visual||!original||visual.dataset.productionTripleMounted==='1')return;
      visual.dataset.productionTripleMounted='1';
      original.setAttribute('aria-label',`Prototype row ${rowIndex+1}, screen 1`);
      for(let screenIndex=2;screenIndex<=3;screenIndex+=1){
        const clone=original.cloneNode(true);
        clone.setAttribute('aria-label',`Prototype row ${rowIndex+1}, screen ${screenIndex}`);
        visual.appendChild(clone);
      }
    });
  }
  const gallery=direction?.querySelector('.phone-gallery');
  if(gallery&&!gallery.classList.contains('production-prototype-gallery')){
    const cards=[...gallery.querySelectorAll(':scope > .phone-card')];
    if(cards.length){
      gallery.classList.add('production-prototype-gallery');
      gallery.innerHTML='';
      for(let i=0;i<cards.length;i+=3){
        const row=document.createElement('div');
        row.className='production-prototype-row';
        const phones=document.createElement('div');
        phones.className='production-prototype-phones';
        const copy=document.createElement('div');
        copy.className='production-prototype-copy';
        cards.slice(i,i+3).forEach(card=>{
          const meta=card.querySelector('.phone-meta');
          if(meta)copy.appendChild(meta);
          phones.appendChild(card);
        });
        row.append(phones,copy);
        gallery.appendChild(row);
      }
    }
  }
})();

;
/* bundled: himart-production-refine-v18.js */
(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main){
    document.body.classList.remove('himart-v18-loading');
    document.body.classList.add('himart-v18-ready');
    return;
  }
  document.body.classList.add('himart-prod-v18');

  try{
    /* ---------- V / DATA SYNTHESIS ---------- */
    const bridgeCards=[...main.querySelectorAll('#data .data-bridge-grid article')];
    const bridgeTitles=[
      '각 데이터는 서로 다른<br>행동을 보여줬습니다.',
      '하지만 반복되는<br>패턴은 있었습니다.',
      '화면이 바뀔 때마다<br>맥락이 약해졌습니다.'
    ];
    bridgeTitles.forEach((copy,i)=>{
      const title=bridgeCards[i]?.querySelector('h4');
      if(title)title.innerHTML=copy;
    });

    /* ---------- 03 / ROLE DEFINITION ---------- */
    const journey=main.querySelector('#journey');
    const roleSection=[...(journey?.querySelectorAll('.hm-subsection')||[])]
      .find(section=>section.querySelector('.hm-subtitle')?.textContent.includes('각 화면의 역할'));
    const roleGrid=roleSection?.querySelector('.role-grid') || journey?.querySelector('.role-grid');
    if(roleSection){
      const title=roleSection.querySelector('.hm-subtitle');
      if(title){
        const prefix=/^\s*(?:0?3|3)\.\s*/.test(title.textContent||'')?'3. ':'';
        title.textContent=`${prefix}그리고 각 여정의 역할을 다시 정의했습니다.`;
      }
      const subcopy=roleSection.querySelector('.hm-subcopy');
      if(subcopy)subcopy.textContent='앞서 정리한 내용을 바탕으로 여정별, 화면별 역할을 정의했습니다.';
    }
    if(roleGrid){
      const roles=[
        {
          title:'홈은 보여주는 곳이 아닌 원하는 곳으로 보내주는 곳이어야 한다',
          copy:'최근 관심 상품·혜택·서비스를 기억하고 사용자가 원하는 목적지로 바로 이어줍니다.'
        },
        {
          title:'선택한 카테고리 안에서는 고민의 시간을 줄여야 한다.',
          copy:'많이 찾는 상품과 선택 기준을 먼저 보여줘 카테고리 안에서 비교와 선택을 빠르게 만듭니다.'
        },
        {
          title:'검색은 불확실성을 확신으로 바꿔줘야 한다',
          copy:'정확한 모델명을 몰라도 모호한 니즈를 구체적인 상품 후보로 바꾸는 탐색을 지원합니다.'
        },
        {
          title:'검색 결과는 단순 상품 목록이 아니라 비교를 끝내는 화면이어야 한다',
          copy:'가격·혜택·브랜드·배송·설치·리뷰·스펙을 한눈에 비교해 구매 후보를 빠르게 압축합니다.'
        },
        {
          title:'상세페이지는 설명하는 화면이 아니라 결정을 끝내는 화면이어야 한다',
          copy:'가격과 설치 가능성, 리뷰, 혜택, 서비스 정보를 함께 보여 구매 결정을 완료하도록 돕습니다.'
        },
        {
          title:'장바구니는 결제 직전의 마지막 확신을 줘야 한다',
          copy:'가격·혜택·옵션·설치 조건과 최종 금액을 한 번에 재확인해 결제 직전의 불확실성을 줄입니다.'
        },
        {
          title:'설치 조율에서는 결제 이후의 불안을 일정 확정으로 바꿔야 한다',
          copy:'설치 일정과 가능 여부, 기존 제품 처리 정보를 명확히 안내해 결제 이후의 불안을 줄입니다.'
        },
        {
          title:'마이페이지에서는 구매 이후에도 관리받고 있다는 느낌을 줘야 한다',
          copy:'안심케어·수리·이전설치·정기점검을 상품 이력과 연결해 구매 이후의 관리 경험을 이어갑니다.'
        }
      ];
      roleGrid.innerHTML=roles.map(role=>`<article class="role-card"><span class="hm-role-name">${role.title}</span><p>${role.copy}</p></article>`).join('');
    }

    /* ---------- 04 / PROTOTYPE ---------- */
    const direction=main.querySelector('#direction');
    const caseList=direction?.querySelector('.prototype-case-list');
    if(caseList){
      [...caseList.querySelectorAll(':scope > .prototype-case')].forEach((item,rowIndex)=>{
        const visual=item.querySelector('.prototype-case-visual');
        if(!visual)return;
        let screens=[...visual.querySelectorAll(':scope > .galaxy-ultra-mockup')];
        if(screens.length===1){
          const clone=screens[0].cloneNode(true);
          clone.setAttribute('aria-label',`Prototype row ${rowIndex+1}, screen 2`);
          visual.appendChild(clone);
          screens=[...visual.querySelectorAll(':scope > .galaxy-ultra-mockup')];
        }
        screens.slice(2).forEach(node=>node.remove());
        [...visual.querySelectorAll(':scope > .galaxy-ultra-mockup')].forEach((screen,i)=>{
          screen.setAttribute('aria-label',`Prototype row ${rowIndex+1}, screen ${i+1}`);
        });
      });
    }

    /* Legacy gallery fallback: rebuild any v16 3-up rows as 2-up rows while preserving metadata order. */
    const gallery=direction?.querySelector('.phone-gallery.production-prototype-gallery');
    if(gallery){
      const pairs=[];
      [...gallery.querySelectorAll(':scope > .production-prototype-row')].forEach(row=>{
        const cards=[...row.querySelectorAll('.production-prototype-phones > .phone-card')];
        const metas=[...row.querySelectorAll('.production-prototype-copy > .phone-meta')];
        cards.forEach((card,i)=>pairs.push({card,meta:metas[i]||null}));
      });
      if(pairs.length){
        gallery.innerHTML='';
        for(let i=0;i<pairs.length;i+=2){
          const row=document.createElement('div');
          row.className='production-v18-row';
          const phones=document.createElement('div');
          phones.className='production-v18-phones';
          const copy=document.createElement('div');
          copy.className='production-v18-copy';
          pairs.slice(i,i+2).forEach(({card,meta})=>{
            phones.appendChild(card);
            if(meta)copy.appendChild(meta);
          });
          row.append(phones,copy);
          gallery.appendChild(row);
        }
      }
    }
  } finally {
    /* Reveal only the final Korean/transformed DOM. */
    requestAnimationFrame(()=>{
      document.body.classList.remove('himart-v18-loading');
      document.body.classList.add('himart-v18-ready');
    });
  }
})();

