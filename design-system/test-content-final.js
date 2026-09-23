/* Himart test content finalization layer.
   Single reconciliation pass; layout and animation remain in CSS/animation.js. */
(() => {
  const main = document.getElementById('live-main');
  
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

    /* Chapter 01 final authority.
       Legacy writers also touch these nodes, so reconcile them to one approved
       state instead of letting async content layers overwrite each other. */
    const brandTitle = document.querySelector('#brand > .hm-wrap > .hm-section-head .hm-section-title');
    html(brandTitle, '왜 고객들이 하이마트를 선택하지 않는지부터 확인했습니다.');

    const realityTitle = document.querySelector('#brand .narrative-reality .brand-reality-title, #brand .narrative-reality .narrative-title');
    html(realityTitle, '<span class="brand-reality-title__line">데이터를 보니 <span class="brand-memory-light">\'가전하면 하이마트\'</span> 는 여전했습니다.</span><span class="brand-reality-title__line">다만 구매 경험으로 이어지지는 않았습니다.</span>');

    const brandMetricTitles = [
      '가전 구매처로 가장 먼저 떠오르는 곳은<br>여전히 하이마트였습니다.',
      '하지만 높은 인지도가<br>실제 경험으로 이어지지 않았습니다.',
      '정작 서비스를 선택하는 순간에는<br>제조사가 훨씬 먼저 선택됐습니다.',
      '구매 이후 관계가 이어지지 못해<br>대부분 한 번의 거래에서 끝났습니다.'
    ];
    document.querySelectorAll('#brand .himart-brand-metric-card h4').forEach((el, i) => {
      if (brandMetricTitles[i]) html(el, brandMetricTitles[i]);
    });

    const applianceLead = document.querySelector('#brand .himart-appliance-flow__lead');
    text(applianceLead, '고가 가전 구매 흐름에서 선택이 흔들리는 지점을 확인했습니다.');


    /* Chapter 02 final authority. */
    const dataTitle = document.querySelector('#data > .hm-wrap > .hm-section-head .hm-section-title');
    html(dataTitle, '그리고 실제로 고객들이 서비스를 어떻게 이용하고 있는지도 살펴봤습니다.');

    const data021Title = document.querySelector('#data .hm-data-metrics-021 .hm-data-021-title');
    html(data021Title, '<span>숫자를 보면 더 단순했습니다.</span><span>유입보다 다음 행동으로 이어지는 연결고리가 약했습니다.</span>');

    const dataMetricTitles = [
      '유입의 상당수가 홈이 아닌,<br>다른 곳에서 시작됐습니다.',
      '기획전 유입의 절반 이상이<br>상품 탐색으로 이어지지 못했습니다.',
      '장바구니보다 주문·결제 진입이<br>약 3.1배 더 많이 발생했습니다.',
      '특이하게도 검색 비중은 1년 새 약 2.9배 늘어,<br>후보 탐색의 핵심 행동이 됐습니다.'
    ];
    const dataMetricLabels = [
      '2026 H1 · AD · CPS · CRM 유입 비중',
      '기획전 시작 후 즉시 종료',
      '주문·결제/장바구니',
      '2025 H1 3.26% → 2026 H1 9.34%'
    ];
    document.querySelectorAll('#data .himart-data-metric-card').forEach((card, i) => {
      if (dataMetricTitles[i]) html(card.querySelector('h4'), dataMetricTitles[i]);
      if (dataMetricLabels[i]) text(card.querySelector('.himart-brand-metric-card__value p'), dataMetricLabels[i]);
    });

    const pattern022 = document.querySelector('#data .hm-data-pattern-022');
    html(pattern022?.querySelector('.narrative-title'), '데이터와 이탈 요인을 다 같이 놓고 보니<br>문제는 유입이 아니라 다음 행동으로의 연결에 있었습니다.');
    const patternTitles = [
      '<span>시작점은 하나가</span><span>아니였습니다.</span>',
      '<span>고객은 적극적으로 후보를</span><span>찾고 있었습니다.</span>',
      '<span>하지만 다음 화면에서</span><span>맥락이 약해졌습니다.</span>'
    ];
    pattern022?.querySelectorAll('.behavior-pattern-card h4').forEach((el, i) => {
      if (patternTitles[i]) html(el, patternTitles[i]);
      el.classList.add('behavior-pattern-card__title--two-lines');
    });

    const bridge023 = document.querySelector('#data .hm-data-bridge-023__copy');
    html(bridge023, '<span class="hm-data-bridge-quote">온라인몰이 떠오르지 않는다</span>는 인식과 <span class="hm-data-bridge-quote">들어와도 다음 단계로 이어지지 않는다</span>는 행동이 겹쳤습니다. 그래서 목표를 화면 개편이 아니라, <span class="hm-data-bridge-quote">구매 여정 안에 하이마트의 명확한 포지션을 만드는 것</span>으로 다시 정의했습니다.');

    /* Chapter 03 final authority. */
    const roleTitle = document.querySelector('#journey .journey-role-block .journey-block-title, #journey [data-index="03.2"] + div .hm-subtitle, #journey .hm-subno[data-index="03.2"] ~ div .hm-subtitle');
    html(roleTitle, '그리고 각 화면의 역할을<br>명확하게 다시 정의했습니다.');

    /* Chapter 04 final authority. */
    const directionTitle = document.querySelector('#direction > .hm-wrap > .hm-section-head .hm-section-title');
    html(directionTitle, '정의한 흐름과 여정별 정의를 바탕으로<br>빠르게 프로토타입을 만들고, 검증을 반복하고 있습니다.');

    const direction041 = document.querySelector('#direction .himart-direction-041');
    const direction042 = document.querySelector('#direction .himart-direction-042');
    const title041 = direction041?.querySelector('.hm-subtitle');
    const title042 = direction042?.querySelector('.hm-subtitle');
    title041?.querySelector('.wide-title-index')?.remove();
    title042?.querySelector('.wide-title-index')?.remove();
    if (title041) html(title041, '전략 분석에서만 끝내지 않고,<br>실제 검증과 테스트를 반복하고 있습니다.');
    if (title042) {
      title042.innerHTML = title042.innerHTML.replace(/^\s*2\.\s*/,'');
    }

    const cards041 = direction041?.querySelectorAll('.ax-friction-card');
    if (cards041?.[0]) {
      html(cards041[0].querySelector('h4'), '<span>검증된 UX패턴은 적극 차용하여</span><span>익숙함을 느낄 수 있도록 했습니다.</span>');
    }

    if (direction042) {
      let grid042 = direction042.querySelector('.ax-friction-grid');
      if (!grid042) {
        grid042 = document.createElement('div');
        grid042.className = 'ax-friction-grid hm-ds-subtitle-to-content himart-direction-rule';
        direction042.querySelector('.hm-subhead')?.insertAdjacentElement('afterend', grid042);
      }
      grid042.innerHTML = '<article class="ax-friction-card"><span>01</span><h4><span>스마트 비교로 원하는 조건의 상품을</span><span>빠르게 찾을 수 있도록 했습니다.</span></h4><p><span>가격·스펙·설치 조건을 한 화면에서 비교해,</span><span>원하는 상품을 빠르게 좁히도록 설계했습니다.</span></p></article><article class="ax-friction-card"><span>02</span><h4><span>어렵고 긴 상세 정보는</span><span>빠르게 이해되는 문법으로 다시 풀었습니다.</span></h4><p><span>복잡한 스펙과 설명을 생활 기준으로 정리해,</span><span>빠르게 이해하고 구매 확신을 만들도록 했습니다.</span></p></article>';
    }


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
      if (el.classList.contains('himart-data-metric-source')) return;
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
      const transitionHTML = '<span class="narrative-subno synthesis-subno">01.4</span><h4>정리해보면, 하이마트는 충분히 인지되고 있었습니다.<br>하지만 긴 구매 여정에서 그 강점은 판단의 순간까지 이어지지 않았습니다.</h4><div class="synthesis-list"><article class="synthesis-card positive"><b>이미 가지고 있던 강점</b><p>높은 브랜드 인지도와 멀티 브랜드 비교·상담, 전국 매장, 전문 인력, 설치·A/S 신뢰처럼 복제하기 어려운 자산은 충분했습니다.</p></article><article class="synthesis-card negative"><b>판단 순간에 연결되지 않던 강점</b><p>비교·상담·설치·케어의 강점이 온라인 탐색과 결제 과정에서 고객의 다음 판단으로 자연스럽게 이어지지 않았습니다.</p></article></div>';
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

  const finalize = () => {
    apply();
    updateHeroFade();
    document.documentElement.dataset.hmContentFinalized = '1';
    document.dispatchEvent(new CustomEvent('himart:content-finalized'));
  };

  /* The candidate runs after the loader signals completion, so no page-wide
     observer or delayed reconciliation loop is required. */
  finalize();
  window.addEventListener('load', finalize, { once:true });
})();
