/* Himart test content loader.
   Loads the validated base content and applies test-only structural content.
   Animation is owned by design-system/animation.js. */

(async()=>{
'use strict';
const main=document.getElementById('live-main');
const pool='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const loadScript=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)});
const textNodesFor=(el)=>{const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode(node){return node.nodeValue&&node.nodeValue.trim().length?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});const nodes=[];let node;while((node=walker.nextNode()))nodes.push(node);return nodes};
const scrambleLargeTitle=()=>{};
const prepareWideMotion=()=>{};
const elFromHTML=(html)=>{const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild};
const wrapMore=(parent,nodes,label,meta='DETAILS')=>{const valid=nodes.filter(Boolean).filter(node=>node.parentElement===parent);if(!valid.length)return null;const details=document.createElement('details');details.className='hm-more';details.innerHTML=`<summary>${label}<span>${meta}</span></summary><div class="hm-more-body"></div>`;const body=details.querySelector('.hm-more-body');parent.insertBefore(details,valid[0]);valid.forEach(node=>body.appendChild(node));details.addEventListener('toggle',()=>{});return details};
const applyNarrativeTest=()=>{
document.body.classList.add('himart-narrative-test');
const brand=main.querySelector('#brand');const brandWrap=brand?.querySelector(':scope > .hm-wrap');const brandHead=brandWrap?.querySelector(':scope > .hm-section-head');
if(brandHead){const title=brandHead.querySelector('.hm-section-title'),desc=brandHead.querySelector('.hm-section-desc');if(title)title.innerHTML='왜 고객들이 하이마트를 선택하지 않는지부터 확인했습니다.';if(desc)desc.innerHTML='“온라인몰 개편”은 결과의 이름일 뿐 문제의 이름은 아니었습니다. <strong>고객이 하이마트를 어떻게 인식하는지</strong>와 <strong>실제로 어떻게 사용하는지</strong>를 따로 확인한 뒤, 두 결과가 같은 방향을 가리키는 지점만 설계의 근거로 삼았습니다.';
const problem=elFromHTML(`<div class="narrative-block hm-reveal narrative-problem"><span class="narrative-subno">01.1</span><h3 class="narrative-title">표면적 분석만으로 알 수 없습니다.<br>그래서 처음부터 다시 봤습니다.</h3><p class="narrative-copy">그래서 먼저 두 가지를 분리해 봤습니다. 하나는 <strong>고객의 머릿속</strong>, 다른 하나는 <strong>고객의 손</strong>입니다. 말과 행동을 각각 끝까지 본 뒤, 겹치는 부분만 남겼습니다.</p><div class="problem-grid"><article class="problem-item hm-ds-card"><small>01</small><h4><span>고객은 하이마트를</span><span>어떤 브랜드로 기억할까?</span></h4><p>가전 구매 때 하이마트를 떠올리는지, 매장과 온라인에 어떤 기대를 갖는지 확인했습니다.</p></article><article class="problem-item hm-ds-card"><small>02</small><h4><span>온라인에서는 실제로</span><span>어떻게 행동하고 있을까?</span></h4><p>유입부터 탐색·이탈까지 행동 데이터를 따라 다음 단계가 끊기는 지점을 확인했습니다.</p></article><article class="problem-item hm-ds-card"><small>03</small><h4><span>말과 행동이 겹치는</span><span>문제는 무엇일까?</span></h4><p>고객 조사와 이용 데이터가 동시에 가리키는 문제만 개선 우선순위로 남겼습니다.</p></article></div></div>`);brandHead.insertAdjacentElement('afterend',problem);
const reality=elFromHTML(`<div class="narrative-block hm-reveal narrative-reality"><span class="narrative-subno">01.2</span><h3 class="narrative-title brand-reality-title"><span class="brand-reality-title__line">데이터를 보니 <span class="brand-memory-light">'가전하면 하이마트'</span> 는 여전했습니다.</span><span class="brand-reality-title__line">다만 구매 경험으로 이어지지는 않았습니다.</span></h3><p class="narrative-copy">브랜드를 떠올리는 힘은 여전히 컸지만, 인지가 실제 서비스 경험과 최종 선택, 반복 관계로 이어지는 과정에서는 단계마다 큰 공백이 확인됐습니다.</p><div class="himart-brand-metric-grid hm-ds-subtitle-to-content" aria-label="하이마트 브랜드 인지와 구매 경험 주요 수치">
  <article class="himart-brand-metric-card"><span class="himart-brand-metric-card__index">01</span><h4>가전 구매처로 가장 먼저 떠오르는 곳은<br>여전히 하이마트였습니다.</h4><div class="himart-brand-metric-card__value"><p>가전 구매처 최초 상기도</p><strong>32.6%</strong></div></article>
  <article class="himart-brand-metric-card"><span class="himart-brand-metric-card__index">02</span><h4>하지만 높은 인지도가<br>실제 경험으로 이어지지 않았습니다.</h4><div class="himart-brand-metric-card__value"><p>인지와 경험의 격차</p><strong>54.7%p</strong></div></article>
  <article class="himart-brand-metric-card"><span class="himart-brand-metric-card__index">03</span><h4>정작 서비스를 선택하는 순간에는<br>제조사가 훨씬 먼저 선택됐습니다.</h4><div class="himart-brand-metric-card__value"><p>자사 대비 제조사 선호도</p><strong>52.9%</strong></div></article>
  <article class="himart-brand-metric-card"><span class="himart-brand-metric-card__index">04</span><h4>구매 이후 관계가 이어지지 못해<br>대부분 한 번의 거래에서 끝났습니다.</h4><div class="himart-brand-metric-card__value"><p>2회 구매로 이어지지 않은 비율</p><strong>76.7%</strong></div></article>
</div>
<div class="hm-source hm-ds-source-note himart-brand-metric-source">SOURCE · Deloitte Consulting Korea · 일반 소비자 N=900 / 서비스 인지·경험·선호 채널 조사 / 지난 5개년 구매 고객 구매 회차 분석 · 2026.07</div>
<div class="himart-appliance-flow hm-reveal" data-himart-appliance-flow>
  <span class="himart-appliance-flow__eyebrow">01.3</span>
  <h4 class="himart-appliance-flow__title">가전은 달랐습니다. 직선 퍼널보다,<br><span class="himart-appliance-flow__title-line">비교/검증을 반복하는 상당히 긴 여정이었습니다.</span></h4>
  <p class="himart-appliance-flow__lead">고가 가전 구매 흐름에서 선택이 흔들리는 지점을 확인했습니다.</p>
  <div class="himart-appliance-flow__viewport" tabindex="0" aria-label="온라인 가전 구매 Reference Flow">
    <div class="himart-appliance-flow__path">

      <div class="himart-appliance-flow__annotation-lane is-top">
        <aside class="himart-appliance-flow__risk is-pause himart-appliance-flow__risk--a">
          <b>고민 장기화</b>
          <h6>바로 사기보다, 조사하고 기다렸습니다.</h6>
          <p><strong>39%</strong>는 구매까지 2주 이상 걸렸고, 3명 중 1명 이상은 4개 이상의 사이트를 확인했습니다.</p>
        </aside>
        <aside class="himart-appliance-flow__risk is-pause himart-appliance-flow__risk--b">
          <b>외부 비교 이탈</b>
          <h6>비교 과정에서 경쟁몰과 외부 콘텐츠로 빠졌습니다.</h6>
          <p>전자·가전 구매자의 <strong>66%</strong>가 온라인 가격을 비교했고, <strong>57%</strong>가 리뷰를 확인했습니다.</p>
        </aside>
        <aside class="himart-appliance-flow__risk is-shift himart-appliance-flow__risk--c">
          <b>매장으로 채널 이동</b>
          <h6>고가·복잡한 제품은 실물 확인이 검증 과정이 됐습니다.</h6>
          <p>전자제품 쇼핑객의 <strong>44%</strong>가 구매 전 직접 제품을 만져보는 경험을 선호했습니다.</p>
        </aside>
      </div>

      <div class="himart-appliance-flow__row is-forward">
        <article class="himart-appliance-flow__stage"><span class="himart-appliance-flow__stage-no">01</span><h5>구매 필요 발생</h5><p>고장 · 교체 · 이사 · 업그레이드</p></article>
        <article class="himart-appliance-flow__stage"><span class="himart-appliance-flow__stage-no">02</span><h5>검색·탐색</h5><p>검색 · 콘텐츠 · 리뷰로 후보 발견</p></article>
        <article class="himart-appliance-flow__stage"><span class="himart-appliance-flow__stage-no">03</span><h5>후보 비교</h5><p>가격 · 스펙 · 브랜드 · 혜택 압축</p></article>
        <article class="himart-appliance-flow__stage"><span class="himart-appliance-flow__stage-no">04</span><h5>상세 검증</h5><p>성능 · 후기 · 신뢰 · 사용성 확인</p></article>
        <i class="himart-appliance-flow__connector himart-appliance-flow__connector--1" aria-hidden="true"></i>
        <i class="himart-appliance-flow__connector himart-appliance-flow__connector--2" aria-hidden="true"></i>
        <i class="himart-appliance-flow__connector himart-appliance-flow__connector--3" aria-hidden="true"></i>
      </div>

      <div class="himart-appliance-flow__turn" aria-hidden="true">
        <i class="himart-appliance-flow__connector himart-appliance-flow__connector--down"></i>
      </div>

      <div class="himart-appliance-flow__row is-reverse">
        <article class="himart-appliance-flow__stage"><span class="himart-appliance-flow__stage-no">08</span><h5>보증·A/S·케어</h5><p>사후관리 · 재구매 · 관계 유지</p></article>
        <article class="himart-appliance-flow__stage"><span class="himart-appliance-flow__stage-no">07</span><h5>설치·수령</h5><p>주문 확정 · 설치 · 회수 진행</p></article>
        <article class="himart-appliance-flow__stage"><span class="himart-appliance-flow__stage-no">06</span><h5>장바구니·결제</h5><p>총액 · 혜택 · 결제수단 최종 확정</p></article>
        <article class="himart-appliance-flow__stage"><span class="himart-appliance-flow__stage-no">05</span><h5>배송·설치 확인</h5><p>지역 · 일정 · 설치비 · 회수 조건</p></article>
        <i class="himart-appliance-flow__connector himart-appliance-flow__connector--1" aria-hidden="true"></i>
        <i class="himart-appliance-flow__connector himart-appliance-flow__connector--2" aria-hidden="true"></i>
        <i class="himart-appliance-flow__connector himart-appliance-flow__connector--3" aria-hidden="true"></i>
      </div>

      <div class="himart-appliance-flow__annotation-lane is-bottom">
        <aside class="himart-appliance-flow__risk is-relation himart-appliance-flow__risk--f">
          <b>구매 뒤 관계 단절</b>
          <h6>설치 이후 상태와 케어가 다시 분리됐습니다.</h6>
          <p>보증·A/S·케어 정보가 주문 맥락과 분리돼 다음 구매의 신뢰 자산으로 축적되기 어려웠습니다.</p>
        </aside>
        <aside class="himart-appliance-flow__risk is-risk himart-appliance-flow__risk--e">
          <b>결제 마찰로 이탈</b>
          <h6>구매 의도가 높아도 마지막 단계에서 멈췄습니다.</h6>
          <p>강제 회원가입은 <strong>18%</strong>, 길고 복잡한 결제는 <strong>17%</strong>의 포기 이유로 확인됐습니다.</p>
        </aside>
        <aside class="himart-appliance-flow__risk is-risk himart-appliance-flow__risk--d">
          <b>조건 불확실로 이탈</b>
          <h6>상품 가격보다 ‘최종 조건’에서 다시 망설였습니다.</h6>
          <p>일반 이커머스에서 <strong>40%</strong>는 추가 비용, <strong>20%</strong>는 느린 배송 때문에 구매를 포기한 것으로 확인됐습니다.</p>
        </aside>
      </div>

    </div>
  </div>

  <p class="himart-appliance-flow__note"><span class="himart-appliance-flow__source">SOURCE · 하이마트 내부 리서치 자료 종합</span></p>
</div>
<div class="brand-synthesis"><h4>정리해보면, 하이마트는 충분히 인지되고 있었습니다.<br>하지만 긴 구매 여정에서 그 강점은 판단의 순간까지 이어지지 않았습니다.</h4><div class="synthesis-list"><div class="synthesis-col"><b>이미 가지고 있던 강점</b><p>높은 브랜드 인지도와 멀티 브랜드 비교·상담, 전국 매장, 전문 인력, 설치·A/S 신뢰처럼 경쟁사가 쉽게 복제하기 어려운 자산이 있었습니다.</p></div><div class="synthesis-col"><b>판단 순간에 연결되지 않던 강점</b><p>비교·상담·설치·케어의 강점이 온라인 탐색과 결제 과정에서 고객의 다음 판단으로 자연스럽게 이어지지 않았습니다.</p></div></div></div><div class="hm-source hm-ds-source-note">SOURCE · Deloitte Consulting Korea, 평생Care서비스 멤버십 설계 소비자 조사 · 2026.07</div></div>`);problem.insertAdjacentElement('afterend',reality);const brandBars=[...reality.querySelectorAll('.himart-brand-evidence .aimmo-reference-bars')];const reducedBars=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;if(reducedBars){brandBars.forEach(chart=>chart.classList.add('is-bars-focused'))}else if('IntersectionObserver' in window){const brandBarObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting&&entry.target.offsetParent!==null)entry.target.classList.add('is-bars-focused')})},{threshold:.20,rootMargin:'0px 0px -5% 0px'});brandBars.forEach(chart=>brandBarObserver.observe(chart))}else{brandBars.forEach(chart=>chart.classList.add('is-bars-focused'))}const originals=[...brandWrap.children].filter(node=>node.classList?.contains('hm-subsection')&&!node.classList.contains('narrative-block'));wrapMore(brandWrap,originals,'고객 의견과 기존 정성 분석 더 보기','QUALITATIVE RESEARCH')}

const data=main.querySelector('#data');const dataWrap=data?.querySelector(':scope > .hm-wrap');const dataHead=dataWrap?.querySelector(':scope > .hm-section-head');if(dataHead){const title=dataHead.querySelector('.hm-section-title'),desc=dataHead.querySelector('.hm-section-desc');if(title)title.innerHTML='문제들은 실제 이용 패턴에서도 반복됐습니다.';if(desc)desc.innerHTML='고객의 말만으로 문제를 단정하지 않았습니다. 유입, 랜딩, 검색, 상품 상세, 장바구니, 결제까지 실제 행동을 따라가며 <strong>어디에서 다음 행동이 약해지는지</strong>를 확인했습니다.';
const signal=elFromHTML(`<div class="narrative-block hm-reveal narrative-signals hm-data-metrics-021"><span class="narrative-subno">02.1</span><h3 class="narrative-title hm-data-021-title"><span>숫자를 보면 더 단순했습니다.</span><span>유입보다 다음 행동으로 이어지는 연결고리가 약했습니다.</span></h3><div class="himart-brand-metric-grid himart-data-metric-grid hm-ds-subtitle-to-content" aria-label="하이마트 실제 이용 행동 주요 수치">
  <article class="himart-brand-metric-card himart-data-metric-card"><span class="himart-brand-metric-card__index">01</span><h4>유입의 상당수가 홈이 아닌,<br>다른 곳에서 시작됐습니다.</h4><div class="himart-brand-metric-card__value"><p>2026 H1 · AD · CPS · CRM 유입 비중</p><strong>68%</strong></div></article>
  <article class="himart-brand-metric-card himart-data-metric-card"><span class="himart-brand-metric-card__index">02</span><h4>기획전 유입의 절반 이상이<br>상품 탐색으로 이어지지 못했습니다.</h4><div class="himart-brand-metric-card__value"><p>기획전 시작 후 즉시 종료</p><strong>52.2%</strong></div></article>
  <article class="himart-brand-metric-card himart-data-metric-card"><span class="himart-brand-metric-card__index">03</span><h4>장바구니보다 주문·결제 진입이<br>약 3.1배 더 많이 발생했습니다.</h4><div class="himart-brand-metric-card__value"><p>주문·결제/장바구니</p><strong>3.1×</strong></div></article>
  <article class="himart-brand-metric-card himart-data-metric-card"><span class="himart-brand-metric-card__index">04</span><h4>특이하게도 검색 비중은 1년 새 약 2.9배 늘어,<br>후보 탐색의 핵심 행동이 됐습니다.</h4><div class="himart-brand-metric-card__value"><p>2025 H1 3.26% → 2026 H1 9.34%</p><strong>9.34%</strong></div></article>
</div><div class="hm-source hm-ds-source-note himart-brand-metric-source himart-data-metric-source">SOURCE · 하이마트 온라인 이용 패턴 분석 v31 / 쇼핑몰 이용 현황 Mobile·PC 2026.01—06 / 온라인 백데이터 퍼널·검색</div></div>`);
dataHead.insertAdjacentElement('afterend',signal);

const pattern=elFromHTML(`<div class="narrative-block hm-reveal behavior-pattern hm-data-pattern-022"><span class="narrative-subno">02.2</span><h3 class="narrative-title">데이터와 이탈 요인을 다 같이 놓고 보니<br>문제는 유입이 아니라 ‘다음 행동으로의 연결’에 있었습니다.</h3><div class="behavior-pattern-grid hm-ds-subtitle-to-content"><article class="behavior-pattern-card"><span>01</span><h4>시작점은 하나가 아니였습니다.</h4><p>광고·직접 유입·가격비교·CRM처럼 서로 다른 목적과 맥락을 가진 상태로 쇼핑을 시작했습니다.</p></article><article class="behavior-pattern-card"><span>02</span><h4>고객은 적극적으로 후보를 찾고 있었습니다.</h4><p>검색과 목적지형 기능을 활용해 필요한 상품과 조건을 스스로 좁히며 구매 후보를 만들고 있었습니다.</p></article><article class="behavior-pattern-card"><span>03</span><h4 class="behavior-pattern-card__title--two-lines"><span>하지만 다음 화면에서</span><span>맥락이 약해졌습니다.</span></h4><p>기획전 이후 이탈과 PDP 이후 행동 약화처럼, 관심과 판단 기준이 다음 행동까지 이어지지 않는 구간이 반복됐습니다.</p></article></div></div>`);
signal.insertAdjacentElement('afterend',pattern);

const bridge=elFromHTML(`<div class="narrative-block hm-reveal hm-data-bridge-023"><span class="narrative-subno">02.3</span><p class="hm-data-bridge-023__copy"><span class="hm-data-bridge-quote">‘온라인몰이 떠오르지 않는다’</span>는 인식과 <span class="hm-data-bridge-quote">‘들어와도 다음 단계로 이어지지 않는다’</span>는 행동이 겹쳤습니다. 그래서 목표를 화면 개편이 아니라, <span class="hm-data-bridge-quote">‘구매 여정 안에 하이마트의 명확한 포지션을 만드는 것’</span>으로 다시 정의했습니다.</p></div>`);
pattern.insertAdjacentElement('afterend',bridge);

const dataNodes=[...dataWrap.children].filter(node=>node!==dataHead&&node!==signal&&node!==pattern&&node!==bridge&&!node.classList.contains('narrative-block')&&!node.classList.contains('hm-section-head'));wrapMore(dataWrap,dataNodes,'이용 데이터와 경로 분석 자세히 보기','QUANTITATIVE ANALYSIS')}
const journey=main.querySelector('#journey');const journeyWrap=journey?.querySelector(':scope > .hm-wrap');const journeyHead=journeyWrap?.querySelector(':scope > .hm-section-head');if(journeyHead){const title=journeyHead.querySelector('.hm-section-title'),desc=journeyHead.querySelector('.hm-section-desc');if(title)title.innerHTML='그래서 화면보다 먼저,<br>여정을 설계하는 세 가지 원칙을 정했습니다.';if(desc)desc.innerHTML='자주 방문하지 않는 가전 쇼핑의 특성과 하이마트의 오프라인 자산을 함께 놓고, 이후 모든 화면 설계가 따라야 할 기준을 먼저 만들었습니다.';const principles=elFromHTML(`<div class="principle-grid hm-reveal"><article class="principle-item"><small>01</small><h4>익숙함이<br>먼저입니다.</h4><p>검색·필터·상품카드·결제처럼 시장 표준이 있는 곳은 새 문법을 만들지 않습니다. 몇 년 만에 다시 온 고객도 바로 쓸 수 있어야 합니다.</p></article><article class="principle-item"><small>02</small><h4>두 번째 걸음을<br>만듭니다.</h4><p>머문 시간보다 다음 화면으로 넘어갔는지를 봅니다. 모든 화면이 다음 판단을 자연스럽게 이어주는 역할을 가져야 합니다.</p></article><article class="principle-item"><small>03</small><h4>매장과 사람을<br>잇습니다.</h4><p>실물을 보고 전문가에게 물어볼 수 있다는 강점을 온라인이 대체하지 않고, 필요할 때 자연스럽게 연결합니다.</p></article></div>`);journeyHead.insertAdjacentElement('afterend',principles);const roleSections=[...journeyWrap.querySelectorAll(':scope > .hm-subsection')];if(roleSections.length)wrapMore(journeyWrap,roleSections,'여정별 역할 정의 자세히 보기','ROLE DEFINITION')}
const direction=main.querySelector('#direction');const directionWrap=direction?.querySelector(':scope > .hm-wrap');const directionHead=directionWrap?.querySelector(':scope > .hm-section-head');if(directionHead){const desc=directionHead.querySelector('.hm-section-desc');if(desc)desc.innerHTML='정의한 원칙을 실제 화면과 인터랙션으로 빠르게 옮기고 내부 검증을 반복했습니다. <strong>새로움은 탐색·결제의 기본 문법이 아니라 하이마트만의 강점을 보여주는 지점에 사용했습니다.</strong>';const authoredRule=directionWrap.querySelector('.himart-direction-041 .ax-friction-grid, .himart-direction-041 .design-rule');if(!authoredRule){const rule=elFromHTML(`<div class="design-rule hm-reveal"><article><small>01</small><h4>익숙함은 만들지 않고<br>빌려옵니다.</h4><p>검색·필터·상품카드·결제처럼 학습된 패턴은 네이버·쿠팡 등 시장 표준을 따릅니다.</p></article><article><small>02</small><h4>새로움은 하이마트만<br>할 수 있는 곳에 씁니다.</h4><p>매장 재고·실물 확인, 전문가 상담, 설치일, 회수·보증·A/S·Care를 판단 순간에 연결합니다.</p></article></div>`);directionHead.insertAdjacentElement('afterend',rule)}const preserveReuseGalleryView=directionWrap.querySelector('.himart-direction-041 .phone-gallery.hm-ds-media-grid');const caseList=directionWrap.querySelector('.himart-direction-041 .prototype-case-list');if(caseList){const cases=[...caseList.querySelectorAll(':scope > .prototype-case')];if(cases.length>1&&!caseList.dataset.reusePrototypeGallery){const more=wrapMore(caseList,cases.slice(1),'나머지 프로토타입 적용 사례 더 보기',`${cases.length-1} MORE CASES`);if(more)more.style.marginTop='54px'}}else if(!preserveReuseGalleryView){const gallery=directionWrap.querySelector('.himart-direction-041 .phone-gallery');const rows=gallery?[...gallery.children]:[];if(gallery&&rows.length>1){const more=wrapMore(gallery,rows.slice(1),'나머지 프로토타입 적용 사례 더 보기',`${rows.length-1} MORE CASES`);if(more)more.style.marginTop='54px'}}}
document.querySelectorAll('details.hm-more').forEach(d=>d.open=false)};
try{await loadScript('./himart-narrative-v2-production-base.js?v=20260920-3');applyNarrativeTest();prepareWideMotion();document.body.classList.remove('himart-narrative-loading');document.body.classList.add('himart-narrative-ready');await loadScript('./himart-live-boot.js?v=20260920-13')}catch(err){document.body.classList.remove('himart-v18-loading','himart-narrative-loading');document.body.classList.add('himart-v18-ready','himart-narrative-ready');main.innerHTML='<div class="hm-wrap" style="padding-top:180px;min-height:70vh"><h1 style="font-size:42px;font-weight:100">페이지를 불러오지 못했습니다.</h1><p style="color:rgba(255,255,255,.6)">잠시 후 다시 시도해 주세요.</p></div>';console.error(err)}})();
