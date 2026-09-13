(() => {
  'use strict';

  if (!document.body.classList.contains('ways-page')) return;

  const canonicalJourneyHTML = '각 팀의 의견을 모아,<br>우리 조직에 맞는 방식으로 실제 운영을 바꿨습니다.';
  const canonicalJourneyText = '각 팀의 의견을 모아, 우리 조직에 맞는 방식으로 실제 운영을 바꿨습니다.';
  const normalize = value => (value || '').replace(/\s+/g, ' ').trim();

  const mountWaysReflection = () => {
    const copy = document.querySelector('.hm-project-reflection__copy');
    if (!copy) return;
    copy.innerHTML = '입사 직후 시작한 이 작업은 <strong>1년이 넘는 시간 동안 계속됐습니다.</strong> 가장 어려웠던 것은 새로운 시스템을 만드는 일이 아니라, 불편함을 알고도 익숙한 방식을 유지하려는 사람들을 설득하고 실제 행동을 바꾸는 일이었습니다. Teams·Planner·Lists처럼 이미 충분히 좋은 시스템은 있었지만, 더 나은 방식으로 일해 본 경험이 없으면 기존 방식이 비효율적이어도 익숙함을 선택한다는 것을 확인했습니다. 진행하면서 “내가 왜 이런 것까지 해야 하나”라는 생각이 들 만큼 소모적인 순간도 있었습니다. 그래도 <strong>제대로 일하기 위한 환경과 기준을 만드는 것은 리드가 피할 수 없는 일</strong>이라고 판단했고, 지금도 정착과 개선을 계속하고 있습니다.';
  };

  const tightenResearchCopy = () => {
    const subsection = document.querySelector('#journey .hm-subsection');
    if (!subsection) return;

    const intro = subsection.querySelector('.hm-subcopy');
    if (intro) intro.textContent = '필요한 소통 방식은 확인했습니다. 이제 실제 업무에 필요한 기능과 프로세스를 구체화했습니다.';

    const copies = [
      '상태·기록·파일·일정 등 반복 업무를 기능 단위로 정리했습니다.',
      '요청부터 완료까지 무엇을 어디에 남길지 정의했습니다.',
      'Teams·Planner·Lists·Calendar의 연결 방식을 검토했습니다.',
      '실제 과제에 적용해 예외와 운영 규칙을 확인했습니다.',
      '소통·프로젝트·회의·일정 규칙을 문서화했습니다.',
      '가이드를 배포하고 팀별 정착을 시작했습니다.'
    ];
    subsection.querySelectorAll('.ways-research-path article p').forEach((node, index) => {
      if (copies[index]) node.textContent = copies[index];
    });
  };

  const enforceJourneyTitle = () => {
    const head = document.querySelector('#live-main > #journey > .hm-wrap > .hm-section-head');
    const host = head?.querySelector(':scope > div');
    if (!head || !host) return;

    const titles = [...host.querySelectorAll(':scope > .hm-section-title')];
    if (titles.some(title => title.dataset.hmScrambleActive === 'true')) return;

    let title = titles.find(node => normalize(node.textContent) === canonicalJourneyText) || titles[titles.length - 1] || null;
    if (!title) {
      title = document.createElement('h2');
      title.className = 'hm-section-title hm-ds-section__title js-scramble';
      host.appendChild(title);
    }

    titles.forEach(node => { if (node !== title) node.remove(); });

    if (normalize(title.textContent) !== canonicalJourneyText) {
      title.className = 'hm-section-title hm-ds-section__title js-scramble';
      title.innerHTML = canonicalJourneyHTML;
      title.removeAttribute('data-hm-scramble-active');
      title.removeAttribute('data-hm-scramble-complete');
    }

    /* The legacy Himart narrative runtime targets the generic #journey contract and can
       leave an old title or raw title text beside the Ways heading. The Ways page owns
       this chapter copy, so keep only the section number + one canonical H2. */
    [...host.childNodes].forEach(node => {
      if (node === title) return;
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) node.remove();
      if (node.nodeType === Node.ELEMENT_NODE && !node.matches('.hm-section-no')) node.remove();
    });
  };

  const mountTitleGuard = () => {
    const head = document.querySelector('#live-main > #journey > .hm-wrap > .hm-section-head');
    if (!head || !('MutationObserver' in window) || window.__waysJourneyTitleGuard) return;
    window.__waysJourneyTitleGuard = true;

    let raf = 0;
    const observer = new MutationObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        enforceJourneyTitle();
      });
    });
    observer.observe(head, {childList:true, subtree:true, characterData:true});
  };

  const apply = () => {
    mountWaysReflection();
    tightenResearchCopy();
    enforceJourneyTitle();
    mountTitleGuard();
  };

  const run = () => {
    requestAnimationFrame(() => requestAnimationFrame(apply));
    /* Cross-check all delayed legacy rewrite windows that used to restore the old Himart 03 title. */
    [80, 320, 1000, 2400, 5200, 11000, 17000].forEach(ms => window.setTimeout(apply, ms));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true});
  else run();
})();