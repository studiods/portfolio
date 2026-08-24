(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;
  const q=(s,r=main)=>r.querySelector(s);

  /* 02.1 — replace donut with a single 100% segmented entry-context bar. */
  const entryCard=[...main.querySelectorAll('#data .data-card')].find(card=>q('.hm-card-no',card)?.textContent.includes('02.1'));
  if(entryCard){
    const viz=q('.data-viz',entryCard);
    if(viz){
      viz.className='data-viz simple-entry-bar-wrap';
      viz.innerHTML=`
        <div class="simple-entry-bar" role="img" aria-label="유입 시작점 비중: AD 52%, Direct 31%, CPS 10%, CRM 6%, 기타 1%">
          <div class="simple-entry-segment seg-ad" style="--share:52"><span>AD</span><strong>52%</strong></div>
          <div class="simple-entry-segment seg-direct" style="--share:31"><span>Direct</span><strong>31%</strong></div>
          <div class="simple-entry-segment seg-cps" style="--share:10"><span>CPS</span><strong>10%</strong></div>
          <div class="simple-entry-segment seg-crm" style="--share:6"><span>CRM</span><strong>6%</strong></div>
          <div class="simple-entry-segment seg-etc" style="--share:1"><span>ETC</span><strong>1%</strong></div>
        </div>
        <div class="simple-entry-note"><span>ENTRY CONTEXT</span><p>시작점이 하나가 아니었기 때문에, <strong>유입 맥락을 다음 탐색까지 이어주는 구조</strong>가 필요했습니다.</p></div>`;
    }
  }

  /* 03 — one continuous TO-BE journey. Circles sit on a single line ending in one arrow. */
  const journey=q('#journey');
  if(journey){
    const wrap=q(':scope > .hm-wrap',journey);
    const principles=q('.simple-principles',journey);
    q('.simple-tobe-journey',journey)?.remove();
    if(wrap){
      const flow=document.createElement('div');
      flow.className='simple-tobe-journey hm-reveal';
      flow.innerHTML=`
        <div class="simple-tobe-head">
          <span>TO-BE / END-TO-END JOURNEY</span>
          <h3>앞선 맥락이 다음 판단으로 이어지도록,<br>구매 전후를 하나의 흐름으로 연결했습니다.</h3>
        </div>
        <div class="simple-tobe-track" aria-label="개선된 전체 구매여정">
          <div class="simple-tobe-line" aria-hidden="true"></div>
          <article class="simple-tobe-node"><div class="simple-tobe-circle"><b>ENTRY</b><span>유입</span></div><p>유입된 관심과 혜택 맥락 유지</p></article>
          <article class="simple-tobe-node"><div class="simple-tobe-circle"><b>HOME</b><span>탐색</span></div><p>최근 행동과 다음 목적지 연결</p></article>
          <article class="simple-tobe-node"><div class="simple-tobe-circle"><b>SEARCH</b><span>검색</span></div><p>요구를 조건과 후보로 구체화</p></article>
          <article class="simple-tobe-node"><div class="simple-tobe-circle"><b>COMPARE</b><span>비교</span></div><p>같은 기준으로 후보 압축</p></article>
          <article class="simple-tobe-node"><div class="simple-tobe-circle"><b>PDP</b><span>결정</span></div><p>가격·혜택·설치로 구매 확신</p></article>
          <article class="simple-tobe-node"><div class="simple-tobe-circle"><b>INSTALL</b><span>설치</span></div><p>일정·조건·회수를 주문 맥락에서 확인</p></article>
          <article class="simple-tobe-node"><div class="simple-tobe-circle"><b>CARE</b><span>케어</span></div><p>보증·A/S·케어까지 관계 지속</p></article>
        </div>`;
      if(principles)wrap.insertBefore(flow,principles);
      else wrap.appendChild(flow);
    }
  }
})();
