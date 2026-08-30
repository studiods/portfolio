(()=>{
  'use strict';
  const wait=()=>{
    const main=document.getElementById('live-main');
    const brand=main?.querySelector('#brand');
    const problem=brand?.querySelector('.narrative-problem');
    const reality=brand?.querySelector('.narrative-reality');
    const signals=main?.querySelector('#data .narrative-signals');
    if(!main||!brand||!problem||!reality||!signals){setTimeout(wait,60);return;}

    const brandHead=brand.querySelector(':scope > .hm-wrap > .hm-section-head');
    const title=brandHead?.querySelector('.hm-section-title');
    const desc=brandHead?.querySelector('.hm-section-desc');
    if(title)title.innerHTML='홈 개편 요청을 받았지만,<br>화면보다 먼저 문제가 어디에 있는지 확인했습니다.';
    if(desc)desc.innerHTML='고객 조사와 실제 이용 데이터를 따로 본 뒤, <strong>두 결과가 동시에 가리키는 단절</strong>만 문제로 남겼습니다.';

    const diagnosis=document.createElement('div');
    diagnosis.className='narrative-block hm-reveal narrative-diagnosis';
    diagnosis.innerHTML=`
      <span class="narrative-subno">01.1 / PROBLEM DEFINITION</span>
      <h3 class="narrative-title">인지가 약해서가 아니었습니다.<br>알고도 다음 행동으로 이어지지 않는 구간이 문제였습니다.</h3>
      <div class="diagnosis-grid">
        <article class="diagnosis-panel">
          <small>AWARENESS</small>
          <h4>‘가전 살 곳’ 하면<br>하이마트가 가장 먼저 떠올랐습니다.</h4>
          <div class="diagnosis-big"><b>32.6</b><span>%</span></div>
          <div class="compare-bars">
            <div class="compare-row"><span>하이마트</span><div class="compare-track"><i style="--w:100%"></i></div><b>32.6%</b></div>
            <div class="compare-row muted"><span>쿠팡</span><div class="compare-track"><i style="--w:40.2%"></i></div><b>13.1%</b></div>
          </div>
        </article>
        <article class="diagnosis-panel">
          <small>EXPERIENCE GAP</small>
          <h4>서비스는 알고 있었지만<br>실제 경험으로 이어지지 않았습니다.</h4>
          <div class="diagnosis-big"><b>54.7</b><span>%p GAP</span></div>
          <div class="compare-bars">
            <div class="compare-row"><span>Care 인지</span><div class="compare-track"><i style="--w:100%"></i></div><b>72.3%</b></div>
            <div class="compare-row muted"><span>Care 경험</span><div class="compare-track"><i style="--w:24.3%"></i></div><b>17.6%</b></div>
          </div>
        </article>
        <article class="diagnosis-panel">
          <small>CHOICE → RELATION</small>
          <h4>경험 전환과 반복 관계에서<br>다시 한 번 큰 폭으로 이탈했습니다.</h4>
          <div class="choice-stack">
            <div class="choice-metric"><strong>52.9<span>%</span> : 12.6<span>%</span></strong><p>서비스 미경험 고객의 선택 · 제조사 vs 하이마트</p></div>
            <div class="choice-metric"><strong>76.7<span>%</span></strong><p>지난 5개년 구매 고객 중 1회 구매 후 이탈</p></div>
          </div>
        </article>
      </div>
      <div class="asset-strip"><span>멀티 브랜드 비교·상담</span><span>전국 매장</span><span>직영 서비스 인력</span><span>설치·A/S 신뢰</span></div>
      <div class="diagnosis-conclusion"><p>즉 하이마트는 <strong>‘모르는 브랜드’가 아니라, 강한 자산이 온라인에서 경험·선택·관계로 전환되지 않는 브랜드</strong>였습니다.</p></div>
      <div class="hm-source">SOURCE · Deloitte Consulting Korea, 평생Care서비스 멤버십 설계 소비자 조사 · 2026.07 / CRM 770명, 일반 소비자 900명 + 정성 조사 · 구매데이터 분석</div>`;
    problem.parentElement.insertBefore(diagnosis,problem);
    problem.remove();
    reality.remove();
    requestAnimationFrame(()=>diagnosis.classList.add('is-in'));

    const dataHead=main.querySelector('#data .hm-section-head');
    const dataDesc=dataHead?.querySelector('.hm-section-desc');
    if(dataDesc)dataDesc.innerHTML='고객의 말만으로 문제를 단정하지 않았습니다. 실제 이용 행동에서도 <strong>다음 탐색과 구매 행동이 약해지는 구간</strong>이 반복되는지 확인했습니다.';
    signals.innerHTML=`
      <span class="narrative-subno">02.1 / BEHAVIOR SIGNALS</span>
      <h3 class="narrative-title">행동 데이터도 같은 방향을 가리켰습니다.<br>유입은 있었지만 다음 탐색과 구매 확신으로 이어지는 힘이 약했습니다.</h3>
      <div class="behavior-grid">
        <article class="behavior-card"><small>ENTRY</small><h4>홈부터 시작하지 않았습니다.</h4><div class="behavior-value">68<span>%</span></div><p class="behavior-note">2026 H1 · AD·CPS·CRM 기반 외부 맥락 유입</p></article>
        <article class="behavior-card"><small>CAMPAIGN → NEXT</small><h4>기획전에서 다음 행동이 크게 끊겼습니다.</h4><div class="behavior-value">52.2<span>%</span></div><div class="behavior-mini"><div><span>바로 종료</span><b>52.2%</b></div><div><span>상품 도달</span><b>9.3%</b></div><div><span>검색/카테고리 도달</span><b>6.6%</b></div></div></article>
        <article class="behavior-card"><small>SEARCH</small><h4>검색은 오히려 더 중요해졌습니다.</h4><div class="behavior-slope"><div><strong>3.26%</strong><span>2025 H1</span></div><i>→</i><div><strong style="color:var(--hm-blue)">9.34%</strong><span>2026 H1</span></div></div><p class="behavior-note">전체 세션 대비 검색 비중</p></article>
        <article class="behavior-card"><small>PDP → PURCHASE</small><h4>상품 관심은 유지됐지만 구매 행동은 약해졌습니다.</h4><div class="behavior-mini"><div><span>PDP 이용</span><b>10.09M → 10.87M</b></div><div><span>장바구니</span><b>227K → 182K</b></div><div><span>구매</span><b>334K → 277K</b></div></div></article>
      </div>
      <div class="behavior-end"><p>그래서 목표를 <strong>‘홈을 새로 만든다’가 아니라, 어디서 들어와도 탐색 → 비교 → 구매 → 설치·케어가 이어지는 여정을 만든다</strong>로 바꿨습니다.</p></div>
      <div class="hm-source">SOURCE · 하이마트 온라인 이용 패턴 분석 v31 / 하이마트 쇼핑몰 이용 현황 Mobile·PC 2026.01—06 / 온라인 백데이터 검색·PDP·장바구니·구매완료</div>`;

    const direction=main.querySelector('#direction');
    direction?.querySelectorAll('details.hm-more').forEach(details=>{
      if(!details.querySelector('.prototype-case,.production-v18-row,.production-prototype-row,.phone-card'))return;
      const body=details.querySelector('.hm-more-body');
      if(body){[...body.children].forEach(child=>details.parentElement.insertBefore(child,details));}
      details.remove();
    });

    document.body.classList.add('narrative-v2-ready');
    window.dispatchEvent(new Event('scroll'));
  };
  wait();
})();