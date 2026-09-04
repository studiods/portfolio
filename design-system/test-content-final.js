/* Himart test content finalization layer.
   This file owns content reconciliation only; animation lives in animation.js. */

(function(){
  const roleTitles=[
    '홈은 보여주는 곳이 아닌<br>원하는 곳으로 보내주는 곳이어야 한다.',
    '선택한 카테고리 안에서는<br>고민의 시간을 줄여야 한다.',
    '검색은 불확실성을<br>확신으로 바꿔줘야 한다.',
    '검색 결과는 단순 상품 목록이 아니라<br>비교를 끝내는 화면이어야 한다.',
    '상세페이지는 설명하는 화면이 아니라<br>결정을 끝내는 화면이어야 한다.',
    '장바구니는 결제 직전의<br>마지막 확신을 줘야 한다.',
    '배송/설치에서는 결제 이후의 불안을<br>일정 확정으로 바꿔야 한다.',
    '마이페이지에서는 구매 이후에도<br>관리받고 있다는 느낌을 줘야 한다.',
    '구매 이후의 경험은 다시 찾게 되는<br>관계로 이어져야 한다.'
  ];
  const shorten=()=>{
    document.querySelectorAll('#brand .problem-item p').forEach((el,i)=>{
      const a=['하이마트를 떠올리는 방식과 매장·온라인에 기대하는 역할을 확인했습니다.','유입부터 다음 행동이 끊기는 지점까지 이용 데이터를 따라갔습니다.','고객 의견과 행동 데이터가 함께 가리킨 문제만 남겼습니다.'][i];
      if(a)el.textContent=['하이마트를 떠올리는 방식과 온·오프라인 기대를 확인했습니다.','유입부터 행동이 끊기는 지점까지 데이터를 따라갔습니다.','고객 의견과 행동이 함께 가리킨 문제만 남겼습니다.'][i];
    });
    const signalCopy=['AD·CPS·CRM 유입이 68%. 하나의 홈 시작만으로 설계하기 어려웠습니다.','유입은 만들었지만 다음 탐색으로 넘어가기 전에 흐름이 끊겼습니다.','장바구니보다 결제 진입이 3배 이상 많아 행동 기준을 다시 봐야 했습니다.','검색 비중이 커지며 구매 후보를 만드는 핵심 행동이 되었습니다.'];
    document.querySelectorAll('#data .signal-item p').forEach((el,i)=>{if(signalCopy[i])el.textContent=signalCopy[i]});
    const proofTitles=['가전 살 곳’ 하면 최초로<br>떠오르는 곳 1위','알지만 써보지 않은<br>서비스','품질 신뢰가 최종 선택으로<br>이어지지 않음','한 번 구매하고<br>관계가 끝남'];
    document.querySelectorAll('#brand .proof-item h4').forEach((el,i)=>{if(proofTitles[i])el.innerHTML=proofTitles[i]});
    const proofCopy=['브랜드 인지는 강했지만, 온라인 경험으로 이어지는 연결은 약했습니다.','서비스를 아는 고객이 실제 이용으로 넘어가는 과정에서 큰 병목이 있었습니다.','품질 평가는 긍정적이지만 최종 선택에서는 제조사 선호가 더 강했습니다.','구매 후 접점이 부족해 한 번의 구매가 지속 관계로 이어지지 않았습니다.'];
    document.querySelectorAll('#brand .proof-item p').forEach((el,i)=>{if(proofCopy[i])el.textContent=proofCopy[i]});
  };
  const roles=()=>{
    const cards=[...document.querySelectorAll('#journey .role-grid .role-card')];
    if(cards.length<8)return false;
    cards.slice(0,8).forEach((card,i)=>{const h=card.querySelector('h4');if(h)h.innerHTML=roleTitles[i]});
    if(cards.length<9){
      const clone=cards[7].cloneNode(true);
      const label=clone.querySelector('.hm-role-name');if(label)label.textContent='POST-PURCHASE';
      const h=clone.querySelector('h4');if(h)h.innerHTML=roleTitles[8];
      const p=clone.querySelector('p');if(p)p.textContent='구매 이후의 관심과 상태를 기억하고 다음 관리 행동으로 이어줍니다.';
      const strong=clone.querySelector('strong');if(strong)strong.textContent='관심 기억 · 관리 연결 · 재방문';
      cards[7].parentElement.appendChild(clone);
    }
    document.querySelectorAll('#journey .role-card .hm-role-name').forEach(el=>{el.style.fontFamily="'Averta PE',sans-serif";el.style.fontWeight='400'});
    return true;
  };
  const run=()=>{shorten();roles();};
  window.addEventListener('load',()=>{run();setTimeout(run,700);setTimeout(run,1600);});
  setTimeout(run,1200);
})();


(function(){
  const roleTitles=[
    '홈은 보여주는 곳이 아닌<br>원하는 곳으로 보내주는 곳이어야 한다.',
    '선택한 카테고리 안에서는<br>고민의 시간을 줄여야 한다.',
    '검색은 불확실성을<br>확신으로 바꿔줘야 한다.',
    '검색 결과는 단순 상품 목록이 아니라<br>비교를 끝내는 화면이어야 한다.',
    '상세페이지는 설명하는 화면이 아니라<br>결정을 끝내는 화면이어야 한다.',
    '장바구니는 결제 직전의<br>마지막 확신을 줘야 한다.',
    '배송/설치에서는 결제 이후의 불안을<br>일정 확정으로 바꿔야 한다.',
    '마이페이지에서는 구매 이후에도<br>관리받고 있다는 느낌을 줘야 한다.',
    '구매 이후의 경험은 다시 찾게 되는<br>관계로 이어져야 한다.'
  ];
  const setContent=()=>{
    const root=document.querySelector('#journey');
    const cards=root?[...root.querySelectorAll('.role-grid .role-card')]:[];
    if(cards.length<8)return false;
    cards.slice(0,8).forEach((card,i)=>{const h=card.querySelector('h4');if(h)h.innerHTML=roleTitles[i]});
    if(cards.length<9){
      const clone=cards[7].cloneNode(true);
      clone.querySelector('.hm-role-name')?.replaceChildren(document.createTextNode('POST-PURCHASE'));
      const h=clone.querySelector('h4');if(h)h.innerHTML=roleTitles[8];
      const p=clone.querySelector('p');if(p)p.textContent='구매 이후의 관심과 상태를 기억하고 다음 관리 행동으로 이어줍니다.';
      const strong=clone.querySelector('strong');if(strong)strong.textContent='관심 기억 · 관리 연결 · 재방문';
      cards[7].parentElement.appendChild(clone);
    }
    return true;
  };
  const shorten=()=>{
    const problem=['하이마트를 떠올리는 방식과 온·오프라인 기대를 확인했습니다.','유입부터 행동이 끊기는 지점까지 데이터를 따라갔습니다.','고객 의견과 행동이 함께 가리킨 문제만 남겼습니다.'];
    document.querySelectorAll('#brand .problem-item p').forEach((el,i)=>{if(problem[i])el.textContent=problem[i]});
    const signal=['AD·CPS·CRM 유입이 68%. 하나의 홈만으로 설계하기 어려웠습니다.','유입은 만들었지만 다음 탐색으로 넘어가기 전에 흐름이 끊겼습니다.','장바구니보다 결제 진입이 3배 이상 많아 행동 기준을 다시 봐야 했습니다.','검색 비중이 커지며 구매 후보를 만드는 핵심 행동이 되었습니다.'];
    document.querySelectorAll('#data .signal-item p').forEach((el,i)=>{if(signal[i])el.textContent=signal[i]});
    const proof=['브랜드 인지는 강했지만 온라인 경험으로 이어지는 연결은 약했습니다.','서비스를 아는 고객이 실제 이용으로 넘어가는 과정에서 병목이 있었습니다.','품질 평가는 긍정적이지만 최종 선택에서는 제조사 선호가 더 강했습니다.','구매 후 접점이 부족해 지속 관계로 이어지지 않았습니다.'];
    document.querySelectorAll('#brand .proof-item p').forEach((el,i)=>{if(proof[i])el.textContent=proof[i]});
  };
  let observer;
  const run=()=>{
    shorten();
    const done=setContent();
    if(done&&observer){observer.disconnect();observer=null}
  };
  observer=new MutationObserver(run);
  observer.observe(document.body,{childList:true,subtree:true});
  run();
  setTimeout(()=>{run();if(observer)observer.disconnect()},10000);
})();


(() => {
  const main = document.getElementById('live-main');
  const fallbackMarkup = main?.innerHTML || '';
  let restoredFallback = false;
  const runtimeLockStyle = document.createElement('style');
  runtimeLockStyle.id = 'himart-movie-runtime-lock';
  runtimeLockStyle.textContent = `
    html body.himart-movie-page #live-main .hm-movie-copy{top:20vh!important}
    html body.himart-movie-page #live-main .hm-movie-copy .hm-lead{margin-top:20px!important;color:rgba(255,255,255,.6)!important;opacity:1!important}
    html body.himart-movie-page #live-main .hm-movie-hero .hm-meta{padding-top:0!important;box-sizing:border-box!important;align-items:center!important}
    html body.himart-movie-page #live-main .hm-movie-hero .hm-meta>div:last-child{border-bottom:0!important;padding-bottom:0!important}
    html body.himart-movie-page #live-main .narrative-touchpoint-synthesis .synthesis-card b{font-family:Pretendard,var(--hm-ko),sans-serif!important;font-size:16px!important;line-height:1.3!important;font-weight:300!important;margin:0!important}
    html body.himart-movie-page #live-main .narrative-touchpoint-synthesis .synthesis-card p{font-family:Pretendard,var(--hm-ko),sans-serif!important;font-size:24px!important;line-height:1.45!important;font-weight:300!important;color:#fff!important}
    html body.himart-movie-page #live-main #data .behavior-card h4{font-size:28px!important;line-height:1.2!important}
    html body.himart-movie-page #live-main #data .signal-item h4{font-size:28px!important;line-height:1.2!important;min-height:2.4em!important}
    html body.himart-movie-page #live-main #data .behavior-card p{font-size:16px!important;line-height:1.5!important;margin-top:40px!important}
    html body.himart-movie-page #live-main #journey .journey-role-grid h4,
    html body.himart-movie-page #live-main #journey .role-grid h4{font-family:Pretendard,var(--hm-ko),sans-serif!important;font-size:28px!important;line-height:1.25!important;font-weight:100!important;letter-spacing:-.045em!important}
    html body.himart-movie-page #live-main #journey .journey-role-grid p,
    html body.himart-movie-page #live-main #journey .role-grid p{font-family:Pretendard,var(--hm-ko),sans-serif!important;font-size:16px!important;line-height:1.55!important;font-weight:300!important;color:rgba(255,255,255,.5)!important}
    html body.himart-movie-page #live-main #journey .journey-role-grid small,
    html body.himart-movie-page #live-main #journey .role-grid .hm-role-name{font-family:'Averta PE',sans-serif!important;font-weight:400!important}
    html body.himart-movie-page #live-main .hm-movie-hero .hm-meta span{color:rgba(255,255,255,.5)!important}
    html body.himart-movie-page #live-main .narrative-touchpoint-synthesis .synthesis-card.positive p{font-size:28px!important;color:var(--hm-blue)!important}
    html body.himart-movie-page #live-main .narrative-touchpoint-synthesis .synthesis-card.negative p{font-size:28px!important;color:var(--hm-red)!important}
    html body.himart-movie-page #live-main #direction .design-rule article p{font-size:16px!important;line-height:1.5!important}
  `;
  document.head.appendChild(runtimeLockStyle);
  const roleCards = [
    ['HOME', '홈은 보여주는 곳이 아닌<br>원하는 곳으로 보내주는 곳이어야 한다.', '최근 맥락과 관심을 기억해 원하는 목적지로 바로 이어줍니다.', '맥락 기억 · 목적지 연결 · 개인화 진입'],
    ['SUBHOME / CATEGORY', '선택한 카테고리 안에서는<br>고민의 시간을 줄여야 한다.', '상황과 설치 조건을 기준으로 탐색 방향을 빠르게 좁혀줍니다.', '상황 중심 탐색 · 조건 정리'],
    ['SEARCH', '검색은 불확실성을<br>확신으로 바꿔줘야 한다.', '모호한 요구를 추천검색과 필터로 실제 후보까지 구체화합니다.', '추천검색 · 동적 필터 · 탐색 가이드'],
    ['SRP / PLP', '검색 결과는 단순 상품 목록이 아니라<br>비교를 끝내는 화면이어야 한다.', '가격·혜택·설치 조건과 핵심 스펙을 같은 기준으로 비교하게 합니다.', '지속 필터 · 핵심 비교 · 조건 명확화'],
    ['PDP', '상세페이지는 설명하는 화면이 아니라<br>결정을 끝내는 화면이어야 한다.', '가격·설치·매장·상담·케어를 한 흐름 안에서 판단하게 합니다.', '가격 · 설치 · 매장 · 상담 · 케어'],
    ['CART / PAY', '장바구니는 결제 직전의<br>마지막 확신을 줘야 한다.', '총액과 혜택, 배송·설치 조건을 고정해 마지막 불확실성을 줄입니다.', '총액 고정 · 혜택 확인 · 조건 확정'],
    ['INSTALL / CARE', '배송/설치에서는 결제 이후의 불안을<br>일정 확정으로 바꿔야 한다.', '설치 일정과 회수·보증 정보를 주문 맥락 안에서 분명하게 보여줍니다.', '일정 확정 · 회수 · 보증 · A/S'],
    ['MYPAGE', '마이페이지에서는 구매 이후에도<br>관리받고 있다는 느낌을 줘야 한다.', '주문 상태와 보증·A/S·케어 정보를 한곳에서 이어서 관리합니다.', '주문 상태 · 보증 · 케어 관리'],
    ['POST-PURCHASE', '구매 이후의 경험은 다시 찾게 되는<br>관계로 이어져야 한다.', '관심과 관리 이력을 다음 방문과 재구매로 자연스럽게 연결합니다.', '관심 기억 · 관리 연결 · 재방문']
  ];

  const html = (el, value) => { if (el && el.innerHTML !== value) el.innerHTML = value; };
  const text = (el, value) => { if (el && el.textContent !== value) el.textContent = value; };
  const apply = () => {
    /* Runtime CSS is injected asynchronously; keep this lock last in the cascade. */
    document.head.appendChild(runtimeLockStyle);
    const lead = document.querySelector('.hm-movie-copy .hm-lead');
    html(lead, '화면 개선부터 시작하지 않았습니다. 고객 인식과 실제 유입·탐색·이탈을 확인한 뒤<br>전체 구매 여정의 역할을 다시 정의했습니다.');

    const directionTitle = document.querySelector('#direction .hm-section-title');
    html(directionTitle, '앞서 정의한 UX 전략을 바탕으로<br>빠르게 프로토타입을 만들고,<br>내부 검증을 반복하고 있습니다.');

    const behaviorTitles = [
      '외부 맥락을<br>가진 유입',
      '기획전 시작 후<br>바로 종료',
      '결제 진입이<br>장바구니보다 많음',
      '세션 대비<br>검색 비중'
    ];
    document.querySelectorAll('#data .signal-item h4, #data .behavior-card h4').forEach((el, i) => {
      if (behaviorTitles[i]) html(el, behaviorTitles[i]);
    });
    const journeyCopy = document.querySelector('#journey .journey-role-block .hm-subcopy, #journey .hm-subsection .hm-subcopy');
    text(journeyCopy, '홈부터 결제까지 화면을 개별 산출물이 아닌, 앞 단계 맥락을 다음 판단으로 넘기는 역할로 정의했습니다. 이 기준이 프로토타입의 정보 우선순위와 인터랙션을 결정했습니다.');
    const designRuleCopy = [
      '검색·필터·상품카드·결제처럼 학습된 패턴은 네이버·쿠팡 등 시장 표준을 따릅니다.',
      '매장 재고·실물 확인, 전문가 상담, 설치일, 회수·보증·A/S·Care를 판단 순간에 연결합니다.'
    ];
    document.querySelectorAll('#direction .design-rule article p').forEach((el, i) => {
      if (designRuleCopy[i]) text(el, designRuleCopy[i]);
    });

    const transition = document.querySelector('#brand .narrative-touchpoint-synthesis, #brand .brand-synthesis');
    if (transition) {
      transition.className = 'brand-synthesis narrative-touchpoint-synthesis';
      const transitionHTML = '<span class="narrative-subno synthesis-subno">01.3 / TRANSITION TOUCHPOINT</span><h4>결국 문제는 인지가 아니라<br>구매 전환 과정에 있었습니다.</h4><div class="synthesis-list"><article class="synthesis-card hm-ds-card positive"><b>이미 가지고 있던 강점</b><p>멀티 브랜드 비교·상담, 전국 매장, 전문 인력,<br>설치·A/S 신뢰처럼 복제하기 어려운 오프라인 자산이 있었습니다.</p></article><article class="synthesis-card hm-ds-card negative"><b>온라인에서 끊기던 지점</b><p>인지 → 경험 → 구매·예약 → 설치·케어 → 반복 구매로 갈수록<br>편의성과 연결성이 약해졌습니다.</p></article></div>';
      html(transition, transitionHTML);
    }

    const grid = document.querySelector('#journey .journey-role-grid, #journey .role-grid');
    const section = grid?.closest('.journey-role-block, .hm-subsection');
    if (section && grid) {
      text(section.querySelector('.hm-subno'), '03.2 / ROLE DEFINITION');
      let cards = [...grid.querySelectorAll(':scope > .role-card, :scope > article')];
      while (cards.length < roleCards.length) {
        const clone = cards[cards.length - 1]?.cloneNode(true);
        if (!clone) break;
        grid.appendChild(clone);
        cards = [...grid.querySelectorAll(':scope > .role-card, :scope > article')];
      }
      cards.slice(0, roleCards.length).forEach((card, i) => {
        const [label, title, copy, keywords] = roleCards[i];
        text(card.querySelector('.hm-role-name, small'), label);
        html(card.querySelector('h4'), title);
        text(card.querySelector('p'), copy);
        text(card.querySelector('strong'), keywords);
      });
    }
  };

  const updateHeroFade = () => {};

  let queued = false;
  const schedule = () => apply();
  const observer = new MutationObserver(() => {
    if (!restoredFallback && main?.textContent?.includes('페이지를 불러오지 못했습니다.') && fallbackMarkup) {
      restoredFallback = true;
      main.innerHTML = fallbackMarkup;
    }
    schedule();
  });
  observer.observe(main, { childList:true, subtree:true });
  apply();
  updateHeroFade();
  window.addEventListener('load', schedule, { once:true });
  const lateApply = window.setInterval(apply, 600);
  setTimeout(() => { apply(); observer.disconnect(); clearInterval(lateApply); }, 30000);
})();

