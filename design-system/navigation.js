/*
  Portfolio global navigation + global right-side chapter navigator.
  Also owns the migration/runtime layer for the canonical quantitative SOURCE note.
  HOME / ABOUT / CONTACT never receive the right-side navigator.
*/

/* Global Design System motion bootstrap.
   All portfolio pages that load navigation.js inherit the same restrained inertial scroll. */
(() => {
  'use strict';
  if (window.__portfolioInertiaLoaderMounted) return;
  window.__portfolioInertiaLoaderMounted = true;
  const script = document.createElement('script');
  script.src = './design-system/inertia-scroll.js?v=20260913-2';
  script.async = false;
  script.dataset.portfolioInertia = 'true';
  (document.head || document.documentElement).appendChild(script);
})();

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

  const mountYanoljaHeroVideo = () => {
    if (!document.body.classList.contains('yanolja-system-page')) return;
    const current = document.querySelector('#top > .hm-ds-hero__video');
    if (!current || current.tagName === 'VIDEO') return;

    const video = document.createElement('video');
    video.className = current.className;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');

    const source = document.createElement('source');
    source.src = './assets/movies/yanolja_system_01.mp4';
    source.type = 'video/mp4';
    video.appendChild(source);
    current.replaceWith(video);

    const attempt = video.play?.();
    if (attempt && attempt.catch) attempt.catch(() => {});
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

    document.querySelectorAll(sourceSelector).forEach(normalizeSourceNote);

    document.querySelectorAll('#live-main [data-source]').forEach(anchor => {
      insertSourceNote(anchor, anchor.getAttribute('data-source'));
    });

    const file = (location.pathname.split('/').pop() || '').toLowerCase();
    (pageSourceRegistry[file] || []).forEach(([selector, source]) => {
      document.querySelectorAll(selector).forEach(anchor => insertSourceNote(anchor, source));
    });

    document.querySelectorAll(sourceSelector).forEach(normalizeSourceNote);
  };

  const mount = () => {
    const active = currentPage();
    mountYanoljaHeroVideo();
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
      if (raf) return;
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

/* Shared project reflection + previous/next project navigation. */
(() => {
  'use strict';

  /* Only published case-study pages belong in this sequence. Draft/absent Works entries
     are intentionally skipped so PREVIOUS/NEXT never points to a 404. */
  const projects = [
    {
      file:'himart.html', href:'./himart.html', name:'하이마트 온라인 전체 구매 여정을 처음부터 재설계했습니다.', en:false,
      reflection:'복잡한 커머스 개편을 리드하면서 다시 확인한 것은, 화면을 많이 바꾸는 것보다 <strong>어떤 문제를 먼저 풀고 어떤 근거로 우선순위를 정할지</strong>가 더 중요하다는 점이었습니다. 리드의 역할은 여러 기능을 직접 소유하는 것이 아니라 팀이 같은 판단 기준으로 움직이게 만드는 데 있다고 봤습니다.'
    },
    {
      file:'himart-reuse.html', href:'./himart-reuse.html', name:'중고 가전의 신뢰 기준 만들기', en:false,
      reflection:'신뢰는 UI 한 화면에서 만들어지지 않았습니다. <strong>상품 상태·촬영·검수·보증처럼 고객이 확인할 수 있는 근거를 운영 기준까지 연결해야</strong> 실제 경험이 바뀐다는 점을 확인했습니다.'
    },
    {
      file:'himart-ways.html', href:'./himart-ways.html', name:'일이 남는 협업 방식 만들기', en:false,
      reflection:'협업 문제는 새 도구만으로 해결되지 않았습니다. <strong>문제·결정·책임과 그 근거가 남는 구조</strong>를 만들 때 팀이 같은 논의를 반복하지 않고 다음 단계로 갈 수 있었습니다.'
    },
    {
      file:'aimmo-system.html', href:'./aimmo-system.html', name:'AIMMO DESIGN SYSTEM DEVELOPMENT', en:true,
      reflection:'디자인 시스템은 컴포넌트 묶음보다 <strong>팀이 더 적은 반복으로 더 좋은 판단을 하게 만드는 업무 시스템</strong>에 가까웠습니다. 리드로서 기준을 직접 정하는 것보다 재사용 가능한 판단 구조와 운영 방식을 남기는 것이 더 오래 가는 성과라고 느꼈습니다.'
    },
    {
      file:'aimmo-graphic.html', href:'./aimmo-graphic.html', name:'AIMMO GRAPHIC MOTIF DEVELOPMENT', en:true,
      reflection:'브랜드 리뉴얼보다 중요한 것은 기존 자산이 실제 접점에서 계속 작동하게 만드는 것이었습니다. <strong>형태의 원리를 정리하고 변주 가능한 규칙으로 바꾸면</strong> 제품·웹·전시가 하나의 언어로 연결될 수 있었습니다.'
    },
    {
      file:'trenbe-ut.html', href:'./trenbe-ut.html', name:'TRENBE USABILITY TEST', en:true,
      reflection:'UT의 가치는 문제를 많이 발견하는 데 있지 않았습니다. <strong>관찰과 정성 데이터가 팀의 우선순위와 정책 결정을 바꾸는 근거가 될 때</strong> 리서치가 실제 제품 변화로 이어진다는 점을 다시 확인했습니다.'
    },
    {
      file:'yanolja-system.html', href:'./yanolja-system.html', name:'YANOLJA B2B DESIGN SYSTEM DEVELOPMENT', en:true,
      reflection:'B2B 시스템은 보기 좋은 일관성보다 실제 업무 환경에서 빠르게 판단하고 실수 없이 실행하게 하는 것이 우선이었습니다. <strong>현장의 제약을 시스템 규칙으로 번역하는 일</strong>이 디자인 리드가 해야 할 중요한 연결 역할이었습니다.'
    },
    {
      file:'nbt_stepup.html', href:'./nbt_stepup.html', name:'만보기보다 습관을 만드는 경험', en:false,
      reflection:'습관을 만드는 경험은 기능을 추가하는 것보다 행동이 반복될 이유를 설계하는 일이었습니다. <strong>서비스 목표와 사용자 동기를 같은 루프로 연결할 때</strong> 단기 참여가 아니라 지속 가능한 사용 경험을 만들 수 있었습니다.'
    }
  ];

  const legacyPrevious = {href:'./index.html#project-vinyl',name:'초기 디지털 프로젝트 모음',en:false};
  const legacyNext = {href:'./index.html#project-coupang',name:'늘어나는 상품을 더 쉽게 찾게 만들기',en:false};

  const mountProjectEndMatter = () => {
    if (!document.body.classList.contains('himart-page-body')) return;
    const file = (location.pathname.split('/').pop() || '').toLowerCase();
    const index = projects.findIndex(project => project.file === file);
    if (index < 0) return;
    const project = projects[index];
    const main = document.querySelector('#live-main');
    if (!main) return;

    document.querySelectorAll('.hm-project-reflection,.hm-project-footer,footer.hm-footer').forEach(node => node.remove());

    const previous = index > 0 ? projects[index - 1] : legacyPrevious;
    const next = index < projects.length - 1 ? projects[index + 1] : legacyNext;

    const reflection = document.createElement('section');
    reflection.className = 'hm-project-reflection';
    reflection.setAttribute('aria-label', 'Project reflection');
    reflection.innerHTML = `
      <div class="hm-project-reflection__inner">
        <h2 class="hm-project-reflection__title">PROJECT REFLECTION</h2>
        <p class="hm-project-reflection__copy">${project.reflection}</p>
      </div>`;

    const footer = document.createElement('footer');
    footer.className = 'hm-project-footer';
    footer.innerHTML = `
      <div class="hm-project-footer__inner">
        <div class="hm-project-footer__rail">
          <a class="hm-project-footer__link hm-project-footer__link--prev" href="${previous.href}">
            <i class="hm-project-footer__arrow" aria-hidden="true"></i>
            <span class="hm-project-footer__meta"><span class="hm-project-footer__label">PREVIOUS</span><strong class="hm-project-footer__name${previous.en ? ' is-en' : ''}">${previous.name}</strong></span>
          </a>
          <a class="hm-project-footer__link hm-project-footer__link--next" href="${next.href}">
            <i class="hm-project-footer__arrow" aria-hidden="true"></i>
            <span class="hm-project-footer__meta"><span class="hm-project-footer__label">NEXT</span><strong class="hm-project-footer__name${next.en ? ' is-en' : ''}">${next.name}</strong></span>
          </a>
        </div>
      </div>
      <div class="hm-project-footer__bottom-space" aria-hidden="true"></div>`;

    main.insertAdjacentElement('afterend', reflection);
    reflection.insertAdjacentElement('afterend', footer);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountProjectEndMatter, {once:true});
  else mountProjectEndMatter();
})();
