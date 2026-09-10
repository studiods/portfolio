(() => {
  'use strict';

  const CONTENT = [
    {
      title: '제품마다 반드시 보여줘야 할 부위를 촬영 기준으로 만들었습니다.',
      copy: '제품마다 확인해야 할 부위가 달라 상품본부와 협의해 카테고리별 필수 촬영 부위와 중점 확인 사항을 정리했습니다.'
    },
    {
      title: '흠집과 사용 흔적은 가까이 확인할 수 있게 했습니다.',
      copy: '스크래치·찍힘·변색처럼 구매 판단에 영향을 주는 흔적은 위치와 정도가 드러나도록 상세 이미지로 확인하게 했습니다.'
    },
    {
      title: '전체 형태와 보이지 않는 면까지 여러 각도로 확인하게 했습니다.',
      copy: '한 장으로 판단하기 어려운 제품은 여러 방향과 360도 촬영을 활용해 전체 상태를 빠르게 살펴볼 수 있게 했습니다.'
    }
  ];

  const applyFinalState = () => {
    const grid = document.querySelector('#journey .reuse-image-display-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(':scope > .reuse-image-display-card'));

    // 03.2 is intentionally a three-gallery story. Remove any stale fourth card.
    cards.slice(CONTENT.length).forEach((card) => card.remove());

    Array.from(grid.querySelectorAll(':scope > .reuse-image-display-card')).forEach((card, index) => {
      const item = CONTENT[index];
      if (!item) return;

      const number = card.querySelector('.reuse-image-display-card__number');
      const title = card.querySelector('.reuse-image-display-card__copy h4');
      const copy = card.querySelector('.reuse-image-display-card__copy p');

      if (number) number.textContent = String(index + 1).padStart(2, '0');
      if (title) title.textContent = item.title;
      if (copy) copy.textContent = item.copy;
      card.setAttribute('aria-label', item.title);
    });
  };

  applyFinalState();
  requestAnimationFrame(applyFinalState);
  window.setTimeout(applyFinalState, 250);
  window.setTimeout(applyFinalState, 1000);
  document.addEventListener('DOMContentLoaded', applyFinalState, { once: true });
})();
