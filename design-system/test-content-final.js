/* Himart test content finalization layer.
   Single reconciliation pass; layout and animation remain in CSS/animation.js. */
(() => {
  const main = document.getElementById('live-main');
  const fallbackMarkup = main?.innerHTML || '';
  let restoredFallback = false;
  
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

