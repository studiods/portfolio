/*
  Portfolio global navigation + global right-side chapter navigator.
  Also owns the migration/runtime layer for the canonical quantitative SOURCE note.
  HOME / ABOUT / CONTACT never receive the right-side navigator.
*/
(() => {
  'use strict';

  const links = [
    { label: 'Home', href: './index.html', page: 'home' },
    { label: 'About', href: './about.html', page: 'about' },
    { label: 'Works', href: './works.html', page: 'works' },
    { label: 'Contact', href: './index.html#contact', page: 'contact' }
  ];

  const currentPage = () => {
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (file === 'about.html') return 'about';
    if (file === 'index.html' || file === '') return 'home';
    return 'works';
  };

  const mountNavigation = active => {
    document.querySelectorAll('body > .top').forEach(node => node.remove());
    document.body.classList.toggle('portfolio-progress-page', active === 'works');
    const items = links.map(({label,href,page}) =>
      '<a href="' + href + '"' + (page === active ? ' aria-current="page"' : '') + '>' + label + '</a>'
    ).join('');
    document.body.insertAdjacentHTML('afterbegin',
      '<nav class="top" aria-label="Global navigation"><div class="top-center">' + items + '</div></nav>'
    );
  };

  const progressTargets = () => {
    if (!document.body.classList.contains('portfolio-progress-page')) return [];
    if (document.body.classList.contains('works-page-body')) {
      return [...document.querySelectorAll('.works-grid .works-card')];
    }
    return [...document.querySelectorAll('#live-main > section.hm-section')]
      .filter(section => section.querySelector('.hm-section-title'));
  };

  const mountProgress = () => {
    document.querySelectorAll('.hm-progress,.works-progress,.hm-global-progress').forEach(node => node.remove());
    const targets = progressTargets();
    if (!targets.length) return;

    const nav = document.createElement('nav');
    nav.className = 'hm-global-progress';
    nav.setAttribute('aria-label', 'Page sections');

    const progressLinks = targets.map((target, index) => {
      if (!target.id) target.id = `portfolio-section-${index + 1}`;
      const link = document.createElement('a');
      link.href = `#${target.id}`;
      link.textContent = String(index + 1).padStart(2, '0');
      link.setAttribute('aria-label', `${index + 1}번째 주요 영역`);
      nav.appendChild(link);
      return link;
    });
    document.body.appendChild(nav);

    let raf = 0;
    const update = () => {
      raf = 0;
      const focusY = window.innerHeight * .5;
      let activeIndex = -1;
      targets.forEach((target, index) => {
        const rect = target.getBoundingClientRect();
        if (rect.top <= focusY && rect.bottom >= focusY) activeIndex = index;
      });
      progressLinks.forEach((link, index) => {
        const active = index === activeIndex;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    };
    const requestUpdate = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, {passive:true});
    window.addEventListener('resize', requestUpdate);
    update();
  };

  /* ---------- Canonical quantitative SOURCE system ---------- */
  const sourceSelector = '.hm-source,.hm-ds-source-note,.reuse-proof-source,[data-hm-source-note]';

  const cleanSourceText = value => (value || '')
    .replace(/^\s*(?:SOURCE|출처)\s*(?:[·•\-–—:]\s*)?/i, '')
    .trim();

  const normalizeSourceNote = node => {
    if (!node) return;
    const clean = cleanSourceText(node.textContent);
    if (!clean) return;
    node.classList.add('hm-ds-source-note');
    node.setAttribute('data-hm-source-note', 'true');
    node.textContent = `SOURCE - ${clean}`;
  };

  const closestEvidenceScope = anchor => anchor && anchor.closest(
    '.data-card,.hm-subsection,.reuse-proof-group,.voice-group,.narrative-signals'
  );

  const sourceScopeHasNote = anchor => {
    if (!anchor) return true;
    const next = anchor.nextElementSibling;
    if (next && next.matches(sourceSelector)) return true;
    const scope = closestEvidenceScope(anchor);
    if (!scope) return false;
    const notes = [...scope.querySelectorAll(sourceSelector)];
    return notes.some(note => note.compareDocumentPosition(anchor) & Node.DOCUMENT_POSITION_PRECEDING);
  };

  const insertSourceNote = (anchor, source) => {
    const clean = cleanSourceText(source);
    if (!anchor || !clean || sourceScopeHasNote(anchor)) return;
    const note = document.createElement('div');
    note.className = 'hm-ds-source-note';
    note.setAttribute('data-hm-source-note', 'true');
    note.textContent = `SOURCE - ${clean}`;
    anchor.insertAdjacentElement('afterend', note);
  };

  const pageSourceRegistry = {
    'himart.html': [
      ['#data .flow-area', '하이마트 온라인 이용 패턴 분석 v31 / 온라인 백데이터 퍼널_3 PDP·장바구니·구매완료 · 2026 H1']
    ],
    'himart-ways.html': [
      ['#brand .hm-ds-segmented-chart', '하이마트 UX디자인팀 협업 프로세스 AS-IS 정리 · 내부 업무 흐름 분석'],
      ['#journey .hm-ds-home-bars', '하이마트 UX디자인팀 TO-BE 협업 프로세스 정의 · 7단계 운영 구조']
    ],
    'nbt_stepup.html': [
      ['#strategy .behavior-grid', 'NBT 스텝업 공개 서비스 정책 및 2018년 보도자료 · 50보당 1캐시 / 목표 달성 최대 1,000캐시 / 월 약 6,000캐시 / 60여 제휴처'],
      ['#outcome .behavior-grid', '전자신문 2018.05 / ZDNet Korea 2018.05 / NBT 공식 아카이브 / 기존 포트폴리오 내부 기록 2019.08']
    ]
  };

  const mountReuseCondensedCopy = () => {
    const file = (location.pathname.split('/').pop() || '').toLowerCase();
    if (file !== 'himart-reuse.html') return;

    const replacements = new Map([
      ['거짓된 상품 정보와 실제 상품 상태의 차이가 가장 큰 비금전적 불안 요인이었습니다.', '상품 정보와 실제 상태의 차이가 가장 큰 불안이었습니다.'],
      ['판매자가 설명한 내용과 실제 제품 사이의 차이를 거래 위험으로 인식했습니다.', '설명과 실제 제품의 차이를 거래 위험으로 봤습니다.'],
      ['계좌·주소·실명 등 개인정보 노출도 거래 장벽이었습니다.', '개인정보 노출도 거래 장벽이었습니다.'],
      ['배송 지연과 누락도 거래가 끝날 때까지 불안을 남겼습니다.', '배송 지연·누락도 거래 불안 요인이었습니다.'],
      ['중고 제품을 구매할 때 실제 제품 상태가 핵심 판단 근거였습니다.', '실제 제품 상태가 구매의 핵심 기준이었습니다.'],
      ['상품 정보만큼 누가 판매하는지 역시 구매 판단에 영향을 줬습니다.', '판매자 신용도 구매 판단에 영향을 줬습니다.'],
      ['안전결제 만족 이유 중 가장 높은 응답은 ‘사기 걱정 없이 안전하다’였습니다.', '안전결제는 ‘사기 걱정 없음’이 가장 큰 만족 이유였습니다.'],
      ['리퍼비시 제품을 전문적으로 판매하는 매장을 방문해보고 싶다는 요구가 높았습니다.', '리퍼비시 전문 매장 방문 의향이 높았습니다.']
    ]);

    document.querySelectorAll('.reuse-proof-stack .proof-item p').forEach(node => {
      const next = replacements.get(node.textContent.trim());
      if (next) node.textContent = next;
    });

    const titleBreaks = new Map([
      ['실제 상태가 다를까 걱정했습니다.', '실제 상태가 다를까<br>걱정했습니다.'],
      ['설명과 실물이 다를 수 있다고 봤습니다.', '설명과 실물이<br>다를 수 있다고 봤습니다.'],
      ['개인정보 제공도 부담이었습니다.', '개인정보 제공도<br>부담이었습니다.'],
      ['결제 후 배송까지 불안했습니다.', '결제 후 배송까지<br>불안했습니다.'],
      ['제품 상태를 가장 중요하게 봤습니다.', '제품 상태를 가장<br>중요하게 봤습니다.'],
      ['판매자의 신용도도 확인했습니다.', '판매자의 신용도도<br>확인했습니다.'],
      ['안전하다고 느낄 때 안심했습니다.', '안전하다고 느낄 때<br>안심했습니다.'],
      ['전문 판매처를 확인하고 싶었습니다.', '전문 판매처를<br>확인하고 싶었습니다.']
    ]);

    document.querySelectorAll('.reuse-proof-stack .proof-item h4').forEach(node => {
      const next = titleBreaks.get(node.textContent.trim());
      if (next) node.innerHTML = next;
    });
  };

  const mountSourceNotes = () => {
    if (!document.body.classList.contains('himart-page-body')) return;

    /* Migrate every legacy SOURCE · / 출처 · note to the single literal prefix. */
    document.querySelectorAll(sourceSelector).forEach(normalizeSourceNote);

    /* Future authoring contract: put the exact provenance on the evidence node. */
    document.querySelectorAll('#live-main [data-source]').forEach(anchor => {
      insertSourceNote(anchor, anchor.getAttribute('data-source'));
    });

    /* Current-page migration for quantitative visuals that predate the contract. */
    const file = (location.pathname.split('/').pop() || '').toLowerCase();
    (pageSourceRegistry[file] || []).forEach(([selector, source]) => {
      document.querySelectorAll(selector).forEach(anchor => insertSourceNote(anchor, source));
    });

    document.querySelectorAll(sourceSelector).forEach(normalizeSourceNote);
  };

  const mount = () => {
    const active = currentPage();
    mountNavigation(active);
    if (active === 'works') mountProgress();
    mountReuseCondensedCopy();
    mountSourceNotes();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();

/*
  TEST-ONLY wide editorial sticky-title exit treatment.
  Guarded by .hm-wide-editorial-test so production Himart / Reuse pages are untouched.
  CSS sticky owns all movement; this runtime only derives opacity from the amount
  the browser has already pushed the current title above its 14vh sticky anchor.
*/
(() => {
  'use strict';

  const mountWideEditorialExit = () => {
    if (!document.body.classList.contains('hm-wide-editorial-test')) return;
    if (window.__hmWideEditorialExitMounted) return;
    window.__hmWideEditorialExitMounted = true;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const wideQuery = window.matchMedia('(min-width:1600px)');
    const sections = [...document.querySelectorAll('#live-main > :is(#brand,#data,#journey,#direction).hm-section')];
    const heads = sections.map(section => section.querySelector('.hm-section-head')).filter(Boolean);
    if (!heads.length) return;

    /* Ensure the canonical reveal observer sees any newly authored test targets. */
    window.__hmAnimationScan?.();

    let raf = 0;
    const reset = () => heads.forEach(head => head.style.removeProperty('--hm-wide-title-exit-opacity'));

    const update = () => {
      raf = 0;
      if (!wideQuery.matches || reduce) {
        reset();
        return;
      }

      const stickyTop = window.innerHeight * 0.14;
      heads.forEach((head, index) => {
        if (index === heads.length - 1 || !head.classList.contains('is-visible')) {
          head.style.setProperty('--hm-wide-title-exit-opacity', '1');
          return;
        }

        const rect = head.getBoundingClientRect();
        const pushed = Math.max(0, stickyTop - rect.top);
        const fadeDistance = Math.max(120, Math.min(220, rect.height * 0.9));
        const progress = Math.min(1, pushed / fadeDistance);
        const opacity = Math.max(0.08, 1 - progress * 0.92);
        head.style.setProperty('--hm-wide-title-exit-opacity', opacity.toFixed(3));
      });
    };
    const requestUpdate = () => {
      if (!raf) return;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, {passive:true});
    window.addEventListener('resize', requestUpdate);
    wideQuery.addEventListener?.('change', requestUpdate);
    update();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWideEditorialExit, {once:true});
  } else {
    mountWideEditorialExit();
  }
})();
