(() => {
  'use strict';

  if (!document.body.classList.contains('ways-page')) return;

  /*
    Ways chapter titles are authored in HTML. The legacy Himart production stylesheet
    still contains a hard-coded #journey .hm-section-title::before title, so CSS owns
    that compatibility reset. Page-specific refinements load as the final layer.

    Cold-load rule: page-specific DOM must not be rewritten until the final Ways CSS
    stack has finished loading. This prevents newly injected SVGs from briefly rendering
    at the browser's default replaced-element size before their component CSS arrives.
  */
  let finalCssPromise = null;
  const mountFinalCss = () => {
    if (finalCssPromise) return finalCssPromise;

    const sheets = [
      ['./design-system/components/himart-ways-title-owner.css?v=20260913-1', 'ways-title-owner'],
      ['./design-system/components/himart-ways-v7.css?v=20260913-2340', 'ways-v7'],
      ['./design-system/components/himart-ways-v8.css?v=20260914-1', 'ways-v8'],
      ['./design-system/components/himart-ways-v9.css?v=20260914-2', 'ways-v9'],
      ['./design-system/components/himart-ways-v10.css?v=20260914-3', 'ways-v10'],
      ['./design-system/components/himart-ways-v11.css?v=20260914-4', 'ways-v11'],
      ['./design-system/components/himart-ways-v12.css?v=20260914-5', 'ways-v12'],
      ['./design-system/components/himart-ways-v13.css?v=20260914-6', 'ways-v13'],
      ['./design-system/components/himart-ways-v14.css?v=20260914-7', 'ways-v14'],
      ['./design-system/components/himart-ways-v15.css?v=20260914-8', 'ways-v15']
    ];

    finalCssPromise = Promise.all(sheets.map(([href, key]) => new Promise(resolve => {
      const selector = `link[data-${key}]`;
      const existing = document.querySelector(selector);
      if (existing) {
        if (existing.sheet) {
          resolve();
          return;
        }
        existing.addEventListener('load', resolve, {once:true});
        existing.addEventListener('error', resolve, {once:true});
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(`data-${key}`, '1');
      link.addEventListener('load', resolve, {once:true});
      link.addEventListener('error', resolve, {once:true});
      document.head.appendChild(link);
    })));

    return finalCssPromise;
  };

  const subsectionByNo = no => [...document.querySelectorAll('#data .hm-subsection')]
    .find(section => section.querySelector('.hm-subno')?.textContent.trim().startsWith(no));

  const revealDecisionSummary = section => {
    if (!section) return;
    section.classList.remove('hm-reveal', 'hm-ds-reveal', 'wide-rise-target');
    section.classList.add('is-visible', 'is-wide-rise-in');
    section.style.setProperty('display', 'block', 'important');
    section.style.setProperty('visibility', 'visible', 'important');
    section.style.setProperty('opacity', '1', 'important');
    section.style.setProperty('transform', 'none', 'important');
    section.style.setProperty('animation', 'none', 'important');
  };

  const rebuildRoleSections = () => {
    const s22 = subsectionByNo('02.2');
    const s23 = subsectionByNo('02.3');
    if (!s22 || !s23) return;

    /* 02.2: remove the former START TOGETHER intro copy and its top rule completely. */
    const model22 = s22.querySelector('.ways-parallel-model');
    if (model22) {
      model22.querySelector('.ways-parallel-model__intro')?.remove();
      model22.classList.add('ways-no-intro-model');
    }

    /* 02.3: revised wording and no standalone conclusion block. */
    const title23 = s23.querySelector('.hm-subtitle');
    if (title23) title23.innerHTML = '그리고 R&amp;R을 산출물이 아니라<br>판단의 책임으로 다시 정의했습니다.';
    s23.querySelector('.ways-ownership-conclusion')?.remove();

    /* 02.4: summarize the two changes with the same card grammar used in 01 / MEMO. */
    let s24 = document.querySelector('#data .ways-decision-summary-subsection');
    if (!s24) {
      s24 = document.createElement('div');
      s24.className = 'hm-subsection hm-ds-subsection ways-decision-summary-subsection is-visible is-wide-rise-in';
      s24.innerHTML = `
        <div class="hm-subhead">
          <span class="hm-subno">02.4</span>
          <div>
            <h3 class="hm-subtitle hm-ds-subsection__title">같이 시작하고 책임과 권한을 나눴습니다.</h3>
            <p class="hm-subcopy hm-ds-subsection__description">함께 시작하는 구조와 역할별 판단 책임을 하나의 운영 원칙으로 정리했습니다.</p>
          </div>
        </div>
        <div class="ways-signal-grid ways-decision-summary-grid hm-ds-subtitle-to-content">
          <article>
            <span class="ways-kicker">01</span>
            <strong>TOGETHER</strong>
            <h4>완성된 기획을 넘기지 않고 처음부터 같이 시작했습니다.</h4>
            <p>PO·UX·개발이 문제 정의부터 초안과 기술 검토까지 짧은 주기로 함께 맞췄습니다.</p>
          </article>
          <article>
            <span class="ways-kicker">02</span>
            <strong>OWNERSHIP</strong>
            <h4>산출물이 아니라 판단의 책임과 권한을 나눴습니다.</h4>
            <p>PO는 문제를 정의하고, UX는 빠르게 경험을 만들며, 개발은 처음부터 함께 해결합니다.</p>
          </article>
        </div>`;
      s23.insertAdjacentElement('afterend', s24);
    }
    revealDecisionSummary(s24);
  };

  /*
    03.2 icon system: every icon shares a 48×48 canvas and a consistent 1.5px
    square/miter stroke. Internal geometry is optically balanced inside that grid,
    while explicit intrinsic dimensions prevent unstyled SVG flashes on cold load.
  */
  const operatingIcons = [
    `<svg class="ways-operating-icon" width="46.66" height="46.66" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter"><path d="M6 8H42V34H12L6 40V34H6Z"/><path d="M12 17H36M12 24H30"/></svg>`,
    `<svg class="ways-operating-icon" width="46.66" height="46.66" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter"><rect x="6" y="6" width="36" height="36"/><rect x="12" y="12.5" width="3" height="3"/><path d="M20 14H36"/><rect x="12" y="22.5" width="3" height="3"/><path d="M20 24H36"/><rect x="12" y="32.5" width="3" height="3"/><path d="M20 34H36"/></svg>`,
    `<svg class="ways-operating-icon" width="46.66" height="46.66" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter"><rect x="6" y="7" width="36" height="9"/><rect x="6" y="19.5" width="36" height="9"/><rect x="6" y="32" width="36" height="9"/><rect x="10" y="10" width="3" height="3"/><path d="M18 11.5H37"/><rect x="10" y="22.5" width="3" height="3"/><path d="M18 24H37"/><rect x="10" y="35" width="3" height="3"/><path d="M18 36.5H37"/></svg>`,
    `<svg class="ways-operating-icon" width="46.66" height="46.66" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter"><rect x="6" y="8" width="36" height="34"/><path d="M15 6V12M33 6V12M9 18H39M12 25H36M12 31H36M12 37H36"/></svg>`,
    `<svg class="ways-operating-icon" width="46.66" height="46.66" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter"><rect x="6" y="6" width="36" height="36"/><path d="M12 18H36M12 24H30M12 30H24"/></svg>`,
    `<svg class="ways-operating-icon" width="46.66" height="46.66" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter"><path d="M14 10H34L30 6M34 10L30 14M38 14V34L42 30M38 34L34 30M34 38H14L18 42M14 38L18 34M10 34V14L6 18M10 14L14 18"/></svg>`
  ];

  const refineJourney = () => {
    const journey = document.querySelector('#journey');
    if (!journey) return;

    /* Major chapter description: short and tightly tied to the authored title. */
    const head = journey.querySelector(':scope > .hm-wrap > .hm-section-head');
    if (head) {
      let desc = head.querySelector('.hm-section-desc');
      if (!desc) {
        desc = document.createElement('p');
        desc.className = 'hm-section-desc hm-ds-section__description';
        head.appendChild(desc);
      }
      desc.textContent = '팀의 의견을 실제 기능·프로세스·운영 규칙으로 연결했습니다.';
    }

    const subsections = [...journey.querySelectorAll('.hm-subsection')];
    const s31 = subsections.find(section => section.querySelector('.hm-subno')?.textContent.trim().startsWith('03.1'));
    const s32 = subsections.find(section => section.querySelector('.hm-subno')?.textContent.trim().startsWith('03.2'));
    const s33 = subsections.find(section => section.querySelector('.hm-subno')?.textContent.trim().startsWith('03.3'));

    if (s31) {
      const desc31 = s31.querySelector('.hm-subcopy');
      if (desc31) desc31.textContent = '확인한 소통 방식을 실제 업무 기능과 프로세스로 구체화했습니다.';

      const path = s31.querySelector('.ways-research-path');
      if (path) {
        path.classList.add('ways-research-path--image-grid');
        const cards = [
          { no:'01', title:'필요 기능 정리', copy:'상태·기록·파일·일정 등 반복 업무를 기능 단위로 정리했습니다.', image:'./assets/image/himart-rnr/himart_rnr_01.png' },
          { no:'02', title:'업무 흐름 설계', copy:'요청부터 완료까지 무엇을 어디에 남길지 정의했습니다.', image:'./assets/image/himart-rnr/himart_rnr_02.png' },
          { no:'03', title:'기존 시스템 검토', copy:'Teams·Planner·Lists·Calendar의 연결 방식을 검토했습니다.', image:'./assets/image/himart-rnr/himart_rnr_03.png' },
          { no:'04', title:'소규모 적용', copy:'실제 과제에 적용해 예외와 운영 규칙을 확인했습니다.', image:'./assets/image/himart-rnr/himart_rnr_04.png' },
          { no:'05', title:'가이드 제작', copy:'소통·프로젝트·회의·일정 규칙을 문서화했습니다.', image:'./assets/image/himart-rnr/himart_rnr_05.png' },
          { no:'06', title:'부서별 배포', copy:'가이드를 배포하고 팀별 정착을 시작했습니다.', image:'./assets/image/himart-rnr/himart_rnr_06.png' }
        ];
        path.innerHTML = cards.map(card => `
          <article class="ways-research-card">
            <img class="ways-research-card__image" src="${card.image}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none';this.removeAttribute('src');">
            <span class="ways-research-card__matte" aria-hidden="true"></span>
            <div class="ways-research-card__content">
              <span>${card.no}</span>
              <h4>${card.title}</h4>
              <p>${card.copy}</p>
            </div>
          </article>`).join('');
      }
    }

    /* 03.2: six square, sharp line-icon cards aligned to their top rule. */
    if (s32) {
      const desc32 = s32.querySelector('.hm-subcopy');
      if (desc32) desc32.textContent = '공식 소통·프로젝트·요청·일정·결정을 하나의 운영 흐름으로 연결했습니다.';

      const stack = s32.querySelector('.ways-operating-stack');
      if (stack) {
        const cards = [
          ['01','공식 소통을 Teams로 모았습니다.','개인 쪽지 대신 채널과 스레드에 요청·논의를 남겨 프로젝트 맥락을 함께 봤습니다.'],
          ['02','프로젝트 목표와 과정을 함께 보이게 했습니다.','Teams에서 프로젝트와 서브 태스크를 등록해 목표·담당·진행 과정을 함께 확인했습니다.'],
          ['03','요청 양식을 만들고 DB로 축적했습니다.','반복 요청은 표준 양식으로 받고 요청 자체를 데이터로 남겨 검색·재활용할 수 있게 했습니다.'],
          ['04','일정을 한곳에서 확인하고 바로 초대했습니다.','공용 일정을 바로 확인·초대해 별도의 일정 확인 대화를 줄였습니다.'],
          ['05','회의와 결정 사항을 바로 기록했습니다.','결정·담당·다음 액션을 같은 공간에 남겨 회의 이후 재확인을 줄였습니다.'],
          ['06','정착 이후에는 채널을 줄이고 자동화합니다.','중복 채널을 정리하고 Jira·Power Automate 연계로 반복 업무를 줄여가고 있습니다.']
        ];
        stack.innerHTML = cards.map((card, index) => `
          <article>
            <span>${card[0]}</span>
            <h4>${card[1]}</h4>
            <p>${card[2]}</p>
            ${operatingIcons[index]}
          </article>`).join('');
      }
    }

    if (s33) {
      const title33 = s33.querySelector('.hm-subtitle');
      if (title33) title33.innerHTML = '관리하지 않으면 다시 이전으로 돌아갑니다.<br>규칙과 가이드도 같이 만들어 배포했습니다.';
    }
  };

  const refineDirection = () => {
    const direction = document.querySelector('#direction');
    if (!direction) return;

    const subsections = [...direction.querySelectorAll('.hm-subsection')];
    subsections.find(section => section.querySelector('.hm-subno')?.textContent.trim().startsWith('04.1'))?.remove();
    subsections.find(section => section.querySelector('.hm-subno')?.textContent.trim().startsWith('04.2'))?.remove();

    const s43 = [...direction.querySelectorAll('.hm-subsection')]
      .find(section => section.querySelector('.hm-subno')?.textContent.trim().startsWith('04.3'));
    if (!s43) return;

    const grid = s43.querySelector('.ways-feedback-grid');
    if (grid) {
      const feedback = [
        ['“관리되고 있으니 진행 상황을 매번 물어보지 않아도 돼서 좋습니다.”','PO팀'],
        ['“자료가 한 공간에 같이 있으니 찾고 다시 보내는 소통이 확실히 줄었습니다.”','UX디자인팀'],
        ['“목표와 방향을 같이 보고 시작하니 결과물도 이전보다 더 잘 맞는 것 같습니다.”','UX디자인팀'],
        ['“프로젝트 히스토리가 남으니 누가 무엇을 왜 바꿨는지 다시 확인하기 쉬워졌습니다.”','개발팀'],
        ['“요청 양식이 정리되니 필요한 정보를 다시 물어보는 일이 줄었습니다.”','사업팀'],
        ['“서로 일정을 확인할 수 있어 가능한 시간을 다시 묻고 맞추는 일이 훨씬 줄었습니다.”','사업팀'],
        ['“초안부터 같이 보니 마지막에 처음 듣는 요구사항이 생기는 일이 줄었습니다.”','개발팀'],
        ['“개인 쪽지가 아니라 같은 공간에 남으니 담당자가 없어도 맥락을 이어가기 편해졌습니다.”','PO팀']
      ];
      grid.innerHTML = feedback.map(item => `<article><strong>${item[0]}</strong><span>${item[1]}</span></article>`).join('');
    }

    let synthesis = s43.querySelector('.ways-feedback-synthesis');
    if (!synthesis) {
      synthesis = document.createElement('div');
      synthesis.className = 'ways-synthesis ways-feedback-synthesis';
      synthesis.innerHTML = '<span>SYNTHESIS</span><h4>툴을 바꾼 것보다, 다시 묻고 찾고 맞추는 일이 줄었다는 반응이 먼저 나타났습니다.</h4>';
      grid?.insertAdjacentElement('afterend', synthesis);
    }
  };

  const mountWaysReflection = () => {
    const copy = document.querySelector('.hm-project-reflection__copy');
    if (!copy) return;
    copy.innerHTML = '입사 직후 시작한 이 작업은 <strong>1년 넘게 이어졌습니다.</strong> 가장 어려웠던 것은 시스템보다 익숙한 방식을 유지하려는 사람들을 설득해 실제 행동을 바꾸는 일이었습니다. 좋은 도구가 있어도 더 나은 방식을 경험하지 못하면 익숙한 불편을 선택했습니다. 소모적인 순간도 있었지만, <strong>제대로 일할 환경과 기준을 만드는 것도 리드의 역할</strong>이라 판단했고 지금도 개선을 이어가고 있습니다.';
  };

  const mount = async () => {
    await mountFinalCss();

    rebuildRoleSections();
    refineJourney();
    refineDirection();
    window.__hmAnimationScan?.();

    /* navigation.js mounts the project reflection slightly later. */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      rebuildRoleSections();
      refineJourney();
      refineDirection();
      mountWaysReflection();
    }));
    window.setTimeout(() => {
      rebuildRoleSections();
      refineJourney();
      refineDirection();
      mountWaysReflection();
    }, 180);
    window.setTimeout(() => {
      rebuildRoleSections();
      refineJourney();
      refineDirection();
      mountWaysReflection();
    }, 700);
  };

  /* Start fetching final CSS immediately, but postpone DOM rewrites until it is ready. */
  mountFinalCss();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();