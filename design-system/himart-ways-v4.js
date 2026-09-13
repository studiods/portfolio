(() => {
  'use strict';

  if (!document.body.classList.contains('ways-page')) return;

  /*
    Ways chapter titles are authored in HTML. The legacy Himart production stylesheet
    still contains a hard-coded #journey .hm-section-title::before title, so the correct
    fix is CSS ownership, not another DOM MutationObserver.
  */
  const mountFinalCss = () => {
    const sheets = [
      ['./design-system/components/himart-ways-title-owner.css?v=20260913-1', 'ways-title-owner'],
      ['./design-system/components/himart-ways-v7.css?v=20260913-2340', 'ways-v7']
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

    /* 02.2: keep the explanatory sentence, remove only the START TOGETHER rail label. */
    const introLabel = s22.querySelector('.ways-parallel-model__intro > span');
    if (introLabel) introLabel.remove();

    /* 02.3: copy change and remove the former closing conclusion from this block. */
    const title23 = s23.querySelector('.hm-subtitle');
    if (title23) title23.innerHTML = '그리고 R&amp;R을 산출물이 아니라<br>판단의 책임으로 다시 정의했습니다.';
    s23.querySelector('.ways-ownership-conclusion')?.remove();

    /* 02.4: summarize the two changes with the exact 01 / MEMO card grammar. */
    let s24 = document.querySelector('#data .ways-decision-summary-subsection');
    if (!s24) {
      s24 = document.createElement('div');
      s24.className = 'hm-subsection hm-ds-subsection hm-reveal ways-decision-summary-subsection';
      s24.innerHTML = `
        <div class="hm-subhead">
          <span class="hm-subno">02.4</span>
          <div><h3 class="hm-subtitle hm-ds-subsection__title">같이 시작하고 책임과 권한을 나눴습니다.</h3></div>
        </div>
        <div class="ways-signal-grid ways-decision-summary-grid hm-ds-subtitle-to-content">
          <article>
            <span class="ways-kicker">01 / START TOGETHER</span>
            <strong>TOGETHER</strong>
            <h4>완성된 기획을 넘기지 않고 처음부터 같이 시작했습니다.</h4>
            <p>PO·UX·개발이 문제 정의부터 초안과 기술 검토까지 짧은 주기로 함께 맞췄습니다.</p>
          </article>
          <article>
            <span class="ways-kicker">02 / R&amp;R</span>
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

    const s31 = [...journey.querySelectorAll('.hm-subsection')]
      .find(section => section.querySelector('.hm-subno')?.textContent.trim().startsWith('03.1'));
    if (!s31) return;

    const desc31 = s31.querySelector('.hm-subcopy');
    if (desc31) desc31.textContent = '확인한 소통 방식을 실제 업무 기능과 프로세스로 구체화했습니다.';

    /* Numeric labels only: 01 → 02 → 03 / 04 → 05 → 06. */
    s31.querySelectorAll('.ways-research-path > article > span').forEach((node, index) => {
      node.textContent = String(index + 1).padStart(2, '0');
    });
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
