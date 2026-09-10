(() => {
  'use strict';

  const journey = document.querySelector('#journey');
  if (!journey) return;

  const subsection = [...journey.querySelectorAll('.hm-subsection')].find((item) =>
    item.querySelector('.hm-subno')?.textContent.trim() === '03.2'
  );
  if (!subsection) return;

  const title = subsection.querySelector('.hm-subtitle');
  const description = subsection.querySelector('.hm-subcopy');
  const oldFlow = subsection.querySelector('.reuse-image-order-flow');
  if (!oldFlow) return;

  if (title) title.innerHTML = '실제 사진을 어떻게 보여줘야<br>제품 상태를 빠르게 판단할 수 있을지 고민했습니다.';
  if (description) description.textContent = '전체 모습부터 사용 흔적과 세부 상태까지, 사진마다 확인해야 할 정보를 나눠 보여줬습니다.';

  const items = [
    {
      number: '01',
      title: '전체 상태를 한눈에 확인하게 했습니다.',
      copy: '제품의 크기와 형태, 외관 상태가 먼저 보이도록 전체 이미지를 우선 배치했습니다.'
    },
    {
      number: '02',
      title: '사용 흔적은 가까이 보여줬습니다.',
      copy: '스크래치·찍힘·변색처럼 구매 판단에 영향을 주는 흔적은 확대해 확인하게 했습니다.'
    },
    {
      number: '03',
      title: '놓치기 쉬운 부분도 따로 보여줬습니다.',
      copy: '내부·조작부·모서리 등 중요한 세부 상태를 부위별 이미지로 나눠 확인하게 했습니다.'
    },
    {
      number: '04',
      title: '사진만으로 부족한 정보는 검수와 연결했습니다.',
      copy: '이미지로 판단하기 어려운 기능 상태는 등급·점검 결과와 함께 확인하도록 구성했습니다.'
    }
  ];

  const grid = document.createElement('div');
  grid.className = 'reuse-image-display-grid hm-ds-subtitle-to-content';
  grid.setAttribute('aria-label', '중고가전 실제 사진 정보 설계 예시');

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'reuse-image-display-card';

    const media = document.createElement('div');
    media.className = 'reuse-image-display-card__media';
    media.setAttribute('aria-hidden', 'true');

    const copy = document.createElement('div');
    copy.className = 'reuse-image-display-card__copy';

    const number = document.createElement('span');
    number.className = 'reuse-image-display-card__number';
    number.textContent = item.number;

    const heading = document.createElement('h4');
    heading.textContent = item.title;

    const paragraph = document.createElement('p');
    paragraph.textContent = item.copy;

    copy.append(number, heading, paragraph);
    card.append(media, copy);
    grid.appendChild(card);
  });

  oldFlow.replaceWith(grid);
})();
