(() => {
  'use strict';

  if (!document.body.classList.contains('ways-page')) return;

  /* Ways-specific runtime is intentionally limited to reflection copy only.
     Chapter titles are authored in HTML and owned by CSS. Do not rewrite, clone,
     observe or repair #journey titles here: the previous JS guard could only see
     real DOM nodes and therefore could never remove the legacy CSS ::before title. */
  const mountWaysReflection = () => {
    const copy = document.querySelector('.hm-project-reflection__copy');
    if (!copy) return;
    copy.innerHTML = '입사 직후 시작한 이 작업은 <strong>1년이 넘는 시간 동안 계속됐습니다.</strong> 가장 어려웠던 것은 새로운 시스템을 만드는 일이 아니라, 불편함을 알고도 익숙한 방식을 유지하려는 사람들을 설득하고 실제 행동을 바꾸는 일이었습니다. Teams·Planner·Lists처럼 이미 충분히 좋은 시스템은 있었지만, 더 나은 방식으로 일해 본 경험이 없으면 기존 방식이 비효율적이어도 익숙함을 선택한다는 것을 확인했습니다. 진행하면서 “내가 왜 이런 것까지 해야 하나”라는 생각이 들 만큼 소모적인 순간도 있었습니다. 그래도 <strong>제대로 일하기 위한 환경과 기준을 만드는 것은 리드가 피할 수 없는 일</strong>이라고 판단했고, 지금도 정착과 개선을 계속하고 있습니다.';
  };

  const run = () => requestAnimationFrame(() => requestAnimationFrame(mountWaysReflection));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true});
  else run();
})();
