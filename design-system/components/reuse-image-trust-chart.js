(() => {
  const charts = [...document.querySelectorAll('.reuse-image-trust-chart')];
  if (!charts.length) return;

  const data = [
    {label:'판매자 신뢰', value:67.7, color:'#0572CB'},
    {label:'거래 편리성', value:58.6, color:'#1383D0'},
    {label:'상품 상태 확인', value:49.8, color:'#2294D6'},
    {label:'가격', value:48.3, color:'#31A5DC'},
    {label:'안전결제', value:29.0, color:'#40B6E2'},
    {label:'플랫폼 대응', value:10.9, color:'#5BC7E8'}
  ];
  const max = Math.max(...data.map(item => item.value));

  charts.forEach(chart => {
    const caption = chart.querySelector('figcaption');
    if (caption) caption.innerHTML = '중고거래에서 중요하게 보는 요소';

    const bar = chart.querySelector('.reuse-image-trust-chart__bar');
    if (!bar) return;

    bar.innerHTML = data.map((item, index) => `
      <div class="reuse-image-trust-chart__segment" data-index="${index}">
        <span>${item.label}</span>
        <div class="reuse-image-trust-chart__track" aria-hidden="true">
          <div class="reuse-image-trust-chart__fill" style="--bar-width:${(item.value / max * 100).toFixed(3)}%;--bar-color:${item.color}"></div>
        </div>
        <strong>${item.value.toFixed(1)}%</strong>
      </div>
    `).join('');

    let source = chart.querySelector('.reuse-image-trust-chart__source');
    if (!source) {
      source = document.createElement('div');
      source.className = 'reuse-image-trust-chart__source';
      chart.appendChild(source);
    }
    source.textContent = 'SOURCE · 전자신문 × 오픈서베이, 중고거래 플랫폼 이용 행태 조사, 2025 / 전국 20–59세 1,002명';

    const activate = () => {
      window.requestAnimationFrame(() => chart.classList.add('is-chart-active'));
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      activate();
    } else if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          activate();
          observer.unobserve(entry.target);
        }
      }), {threshold:.35});
      observer.observe(chart);
    } else {
      activate();
    }
  });
})();
