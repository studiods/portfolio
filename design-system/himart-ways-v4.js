(() => {
  'use strict';

  if (!document.body.classList.contains('ways-page')) return;

  /*
    Ways chapter titles are authored in HTML. The legacy Himart production stylesheet
    still contains a hard-coded #journey .hm-section-title::before title, so CSS owns
    that compatibility reset. Page-specific refinements load as the final layer.
  */
  const mountFinalCss = () => {
    const sheets = [
      ['./design-system/components/himart-ways-title-owner.css?v=20260913-1', 'ways-title-owner'],
      ['./design-system/components/himart-ways-v7.css?v=20260913-2340', 'ways-v7'],
      ['./design-system/components/himart-ways-v8.css?v=20260914-1', 'ways-v8'],
      ['./design-system/components/himart-ways-v9.css?v=20260914-2', 'ways-v9']
    ];
    sheets.forEach(([href, key]) => {
      if (document.querySelector(`link[data-${key}]`)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(`data-${key}`, '1');
      document.head.appendChild(link);
    });
  };

  const subsectionByNo = no => [...document.querySelectorAll('#data .hm-subsection')]
    .find(section => section.querySelector('.hm-subno')?.textContent.trim().startsWith(no));

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
      s24.className = 'hm-subsection hm-ds-subsection hm-reveal ways-decision-summary-subsection';
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
  };

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
          { no:'04', title:'소규모 적용', copy:'실제 과제에 적용해 예외와 운영 규칙을 확인했습니다.', image:'./assets/image/himart-rnr/himart_rnr_01.png' },
          { no:'05', title:'가이드 제작', copy:'소통·프로젝트·회의·일정 규칙을 문서화했습니다.', image:'./assets/image/himart-rnr/himart_rnr_02.png' },
          { no:'06', title:'부서별 배포', copy:'가이드를 배포하고 팀별 정착을 시작했습니다.', image:'./assets/image/himart-rnr/himart_rnr_03.png' }
        ];
        path.innerHTML = cards.map(card => `
          <article class="ways-research-card">
            <img class="ways-research-card__image" src="${card.image}" alt="" loading="lazy" decoding="async">
            <span class="ways-research-card__matte" aria-hidden="true"></span>
            <div class="ways-research-card__content">
              <span>${card.no}</span>
              <h4>${card.title}</h4>
              <p>${card.copy}</p>
            </div>
          </article>`).join('');
      }
    }

    /* 03.2: six equal cards; labels are numeric only and supporting copy is tightened. */
    if (s32) {
      const desc32 = s32.querySelector('.hm-subcopy');
      if (desc32) desc32.textContent = '공식 소통·프로젝트·요청·일정·결정을 하나의 운영 흐름으로 연결했습니다.';

      const stack = s32.querySelector('.ways-operating-stack');
      if (stack) {
        stack.innerHTML = `
          <article><span>01</span><h4>공식 소통을 Teams로 모았습니다.</h4><p>개인 쪽지 대신 채널과 스레드에 요청·논의를 남겨 프로젝트 맥락을 함께 봤습니다.</p></article>
          <article><span>02</span><h4>프로젝트 목표와 과정을 함께 보이게 했습니다.</h4><p>Teams에서 프로젝트와 서브 태스크를 등록해 목표·담당·진행 과정을 함께 확인했습니다.</p></article>
          <article><span>03</span><h4>요청 양식을 만들고 DB로 축적했습니다.</h4><p>반복 요청은 표준 양식으로 받고, 요청 자체를 데이터로 남겨 검색·재활용할 수 있게 했습니다.</p></article>
          <article><span>04</span><h4>일정을 한곳에서 확인하고 바로 초대했습니다.</h4><p>공용 일정을 공유해 가능한 시간을 바로 확인·초대하고 별도 일정 확인 대화를 줄였습니다.</p></article>
          <article><span>05</span><h4>회의와 결정 사항을 바로 기록했습니다.</h4><p>결정·담당·다음 액션을 같은 공간에 남겨 회의 이후 다시 묻는 일을 줄였습니다.</p></article>
          <article><span>06</span><h4>정착 이후에는 채널을 줄이고 자동화합니다.</h4><p>중복 채널을 정리하고 Jira·Power Automate 연계로 상태 알림과 반복 업무를 줄여가고 있습니다.</p></article>`;
      }
    }
  };

  const mountWaysReflection = () => {
    const copy = document.querySelector('.hm-project-reflection__copy');
    if (!copy) return;
    copy.innerHTML = '입사 직후 시작한 이 작업은 <strong>1년이 넘는 시간 동안 계속됐습니다.</strong> 가장 어려웠던 것은 새로운 시스템을 만드는 일이 아니라, 불편함을 알고도 익숙한 방식을 유지하려는 사람들을 설득하고 실제 행동을 바꾸는 일이었습니다. Teams·Planner·Lists처럼 이미 충분히 좋은 시스템은 있었지만, 더 나은 방식으로 일해 본 경험이 없으면 기존 방식이 비효율적이어도 익숙함을 선택한다는 것을 확인했습니다. 진행하면서 “내가 왜 이런 것까지 해야 하나”라는 생각이 들 만큼 소모적인 순간도 있었습니다. 그래도 <strong>제대로 일하기 위한 환경과 기준을 만드는 것은 리드가 피할 수 없는 일</strong>이라고 판단했고, 지금도 정착과 개선을 계속하고 있습니다.';
  };

  const mount = () => {
    mountFinalCss();
    rebuildRoleSections();
    refineJourney();
    window.__hmAnimationScan?.();

    /* navigation.js mounts the project reflection slightly later. */
    requestAnimationFrame(() => requestAnimationFrame(mountWaysReflection));
    window.setTimeout(mountWaysReflection, 180);
    window.setTimeout(mountWaysReflection, 700);
  };

  mountFinalCss();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();