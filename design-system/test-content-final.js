/* Himart test content finalization layer.
   Single reconciliation pass; layout and animation remain in CSS/animation.js. */
(() => {
  const main = document.getElementById('live-main');
  const fallbackMarkup = main?.innerHTML || '';
  let restoredFallback = false;
  
  /* ROLE DEFINITION titles intentionally remain content-specific here.
     No shared design-system wrapping rule is introduced yet. */
  const roleCards = [
    ['HOME', '홈은 보여주는 곳이 아닌<br>원하는 곳으로 보내주는 곳이어야 한다'],
    ['CATEGORY', '선택한 카테고리 안에서는<br>고민의 시간을 줄여야 한다'],
    ['SEARCH', '검색은 불확실성을<br>확신으로 바꿔줘야 한다'],
    ['SRP / PLP', '검색 결과는 단순 상품 목록이 아니라<br>비교를 끝내는 화면이어야 한다'],
    ['PDP', '상세페이지는 설명하는 화면이 아니라<br>결정을 끝내는 화면이어야 한다'],
    ['CART / PAY', '장바구니는 결제 직전의<br>마지막 확신을 줘야 한다'],
    ['INSTALL / CARE', '설치 조율은 결제 이후의 불안을<br>일정 확정으로 바꿔야 한다'],
    ['MYPAGE', '구매 이후에도 관리받고 있다는<br>느낌을 줘야 한다'],
    ['POST-PURCHASE', '구매 이후 경험은 다시 찾게 되는<br>관계로 이어져야 한다']
  ];

  const html = (el, value) => { if (el && el.innerHTML !== value) el.innerHTML = value; };
  const text = (el, value) => { if (el && el.textContent !== value) el.textContent = value; };
  const apply = () => {
    /* Runtime CSS is injected asynchronously; keep this lock last in the cascade. */
    const lead = document.querySelector('.hm-movie-copy .hm-lead');
    text(lead, '고객 인식과 실제 이용 흐름을 확인해, 구매 여정을 다시 정의했습니다.');

    /* Major chapter titles are owned by content-runtime.js and scramble-final.js.
       Do not rewrite them here: a late reconciliation write can look like a second
       scramble/title change after the animation has already completed. */

    const behaviorTitles = [
      '<span>외부 맥락을</span><span>가진 유입</span>',
      '<span>기획전 시작 후</span><span>바로 종료</span>',
      '<span>결제 진입이</span><span>장바구니보다 많음</span>',
      '<span>세션 대비</span><span>검색 비중</span>'
    ];
    document.querySelectorAll('#data .signal-item h4, #data .behavior-card h4').forEach((el, i) => {
      if (behaviorTitles[i]) html(el, behaviorTitles[i]);
    });

    /* 02 data provenance cleanup: remove the retired H1 funnel source block itself,
       including the divider owned by that source element. */
    document.querySelectorAll('#data .hm-source, #data .hm-ds-source-note, #data [data-hm-source-note]').forEach((el) => {
      const value = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (
        value.includes('하이마트 온라인 이용 패턴 분석 v31') ||
        value.includes('온라인 백데이터 퍼널_3')
      ) el.remove();
    });

    /* 02.7 problem reframe: keep the journey path as the message, without the
       tentative '필요가 보였습니다' framing. */
    const reframeTitle = document.querySelector('#data .data-bridge-grid article:last-child h4');
    if (reframeTitle) {
      html(reframeTitle, '<strong class="journey-title-emphasis">유입 맥락 → 탐색 → 비교 → 구매 확신 → 설치·케어</strong>로 재정의');
    }

    const direction041Title = document.querySelector('#direction .himart-direction-041 .hm-subtitle');
    if (direction041Title) {
      direction041Title.querySelector('.wide-title-index')?.remove();
      direction041Title.innerHTML = direction041Title.innerHTML.replace(/^\s*(?:01?|1)\.\s*/,'');
    }

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
      text(section.querySelector('.hm-subno'), '03.2');
      let cards = [...grid.querySelectorAll(':scope > .role-card, :scope > article')];
      while (cards.length < roleCards.length) {
        const clone = cards[cards.length - 1]?.cloneNode(true);
        if (!clone) break;
        grid.appendChild(clone);
        cards = [...grid.querySelectorAll(':scope > .role-card, :scope > article')];
      }
      cards.slice(0, roleCards.length).forEach((card, i) => {
        const [label, title] = roleCards[i];
        card.querySelectorAll('.hm-ds-icon,p,strong').forEach(el => el.remove());
        let index = card.querySelector('.hm-role-index');
        if (!index) {
          index = document.createElement('span');
          index.className = 'hm-role-index';
          card.prepend(index);
        }
        text(index, String(i + 1).padStart(2, '0'));
        text(card.querySelector('.hm-role-name, small'), label);
        html(card.querySelector('h4'), title);
      });
      cards.slice(roleCards.length).forEach(card => card.remove());
    }
  };

  const updateHeroFade = () => {};

  let reconcileRaf = 0;
  const schedule = () => {
    if (reconcileRaf) return;
    reconcileRaf = requestAnimationFrame(() => {
      reconcileRaf = 0;
      apply();
    });
  };
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

  /* Legacy content writers finish within the existing 16s reconciliation window.
     Use sparse checkpoints instead of scanning the whole page every 600ms for 30s. */
  [600,1600,3600,7600,12000,16000].forEach(ms => setTimeout(schedule, ms));
  setTimeout(() => {
    schedule();
    observer.disconnect();
    if (reconcileRaf) cancelAnimationFrame(reconcileRaf);
    reconcileRaf = 0;
  }, 18000);
})();
