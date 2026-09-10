(() => {
  'use strict';

  const VIEWERS = [
    {
      goodsNo: '0069891388',
      viewerId: 'sirv-viewer-1346340621468',
      url: 'https://www.e-himart.co.kr/app/goods/goodsDetail?goodsNo=0069891388&gtmPos=%ED%95%98%EC%9D%B4%EB%A7%88%ED%8A%B8%20%EC%9D%B8%EC%A6%9D%EC%A4%91%EA%B3%A0&jsClck=Y#sirv-viewer-1346340621468'
    },
    {
      goodsNo: '0070377977',
      viewerId: 'sirv-viewer-384296630126',
      url: 'https://www.e-himart.co.kr/app/goods/goodsDetail?goodsNo=0070377977&gtmPos=%ED%95%98%EC%9D%B4%EB%A7%88%ED%8A%B8%20%EC%9D%B8%EC%A6%9D%EC%A4%91%EA%B3%A0&jsClck=Y#sirv-viewer-384296630126'
    },
    {
      goodsNo: '0070540451',
      viewerId: 'sirv-viewer-1339090322750',
      url: 'https://www.e-himart.co.kr/app/goods/goodsDetail?goodsNo=0070540451&gtmPos=%ED%95%98%EC%9D%B4%EB%A7%88%ED%8A%B8%20%EC%9D%B8%EC%A6%9D%EC%A4%91%EA%B3%A0&jsClck=Y#sirv-viewer-1339090322750'
    }
  ];

  const mount = () => {
    const cards = Array.from(document.querySelectorAll('#journey .reuse-image-display-card'));
    const card = cards[2];
    if (!card || card.dataset.sirvMounted === 'true') return Boolean(card);

    const slides = Array.from(card.querySelectorAll('.reuse-image-display-card__slide'));
    if (slides.length < VIEWERS.length) return false;

    card.classList.add('is-sirv-gallery');
    card.dataset.sirvMounted = 'true';
    card.setAttribute('aria-label', '360도 상품 상태 확인 갤러리');

    VIEWERS.forEach((item, index) => {
      const slide = slides[index];
      const media = slide?.querySelector('.reuse-image-display-card__media');
      if (!media) return;

      const shell = document.createElement('div');
      shell.className = 'reuse-sirv-embed';
      shell.dataset.goodsNo = item.goodsNo;
      shell.dataset.viewerId = item.viewerId;

      const frame = document.createElement('iframe');
      frame.className = 'reuse-sirv-embed__frame';
      frame.src = item.url;
      frame.title = `하이마트 인증중고 360도 상품 보기 ${index + 1}`;
      frame.loading = index === 0 ? 'eager' : 'lazy';
      frame.setAttribute('scrolling', 'no');
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

      shell.appendChild(frame);
      media.replaceChildren(shell);
    });

    return true;
  };

  if (mount()) return;

  let attempts = 0;
  const retry = () => {
    attempts += 1;
    if (mount() || attempts >= 20) return;
    window.setTimeout(retry, 100);
  };
  retry();
})();
