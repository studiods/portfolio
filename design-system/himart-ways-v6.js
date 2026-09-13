(() => {
  'use strict';

  if (!document.body.classList.contains('ways-page')) return;

  const canonicalJourneyHTML = '각 팀의 의견을 모아,<br>우리 조직에 맞는 방식으로 실제 운영을 바꿨습니다.';
  const canonicalJourneyText = '각 팀의 의견을 모아, 우리 조직에 맞는 방식으로 실제 운영을 바꿨습니다.';
  const normalize = value => (value || '').replace(/\s+/g, ' ').trim();

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

    /* Legacy Himart narrative runtimes target the generic #journey selector and can
       rewrite this Ways title after load. Keep the authored Ways title as the page-local
       source of truth instead of allowing two competing canonical titles to coexist. */
    if (normalize(title.textContent) !== canonicalJourneyText || title.querySelectorAll('.hm-scramble-char').length === 0) {
      title.className = 'hm-section-title hm-ds-section__title js-scramble';
      title.innerHTML = canonicalJourneyHTML;
      title.removeAttribute('data-hm-scramble-active');
      title.removeAttribute('data-hm-scramble-complete');
    }

    /* A historical runtime can also leave raw text or an extra heading beside the H2. */
    [...host.childNodes].forEach(node => {
      if (node === title) return;
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) node.remove();
      if (node.nodeType === Node.ELEMENT_NODE && !node.matches('.hm-section-no')) node.remove();
    });
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

  const mount = () => {
    tightenResearchCopy();
    enforceJourneyTitle();

    const head = document.querySelector('#live-main > #journey > .hm-wrap > .hm-section-head');
    if (head && 'MutationObserver' in window) {
      let raf = 0;
      const observer = new MutationObserver(() => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          enforceJourneyTitle();
        });
      });
      observer.observe(head, {childList:true, subtree:true, characterData:true});
    }

    /* Cross the delayed legacy rewrite window as well as the first paint. */
    [80, 320, 1000, 2400, 5200, 11000, 17000].forEach(ms => {
      window.setTimeout(() => {
        tightenResearchCopy();
        enforceJourneyTitle();
      }, ms);
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();