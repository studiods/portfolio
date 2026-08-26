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
