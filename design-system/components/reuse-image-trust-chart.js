(() => {
  'use strict';

  /*
    REUSE 03.1 — authoritative data renderer.
    Presentation is owned only by design-system/components/reuse-chart.css.
    This renderer also recovers from the previously injected .reuse-trust-home-bars
    DOM so an older cached motion script cannot keep the legacy graph alive.
  */
  const data = [
    {label:'판매자 신뢰', value:67.7},
    {label:'거래 편리성', value:58.6},
    {label:'상품 상태 확인', value:49.8, primary:true},
    {label:'가격', value:48.3},
    {label:'안전결제', value:29.0},
    {label:'플랫폼 대응', value:10.9}
  ];

  const ensureChartRoot = () => {
    let chart = document.querySelector('#journey .reuse-image-trust-chart');
    if (chart) return chart;

    const legacy = document.querySelector('#journey .reuse-trust-home-bars');
    if (!legacy) return null;

    chart = document.createElement('figure');
    chart.className = 'reuse-image-trust-chart hm-ds-subtitle-to-content';
    chart.setAttribute('aria-label','중고 제품 구매 판단 요소');
    chart.innerHTML = '<div class="reuse-image-trust-chart__bar"></div>';
    legacy.replaceWith(chart);
    return chart;
  };

  const chart = ensureChartRoot();
  if (!chart) return;

  chart.querySelectorAll('figcaption,.reuse-trust-chart-title').forEach(node => node.remove());

  let bar = chart.querySelector('.reuse-image-trust-chart__bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'reuse-image-trust-chart__bar';
    chart.appendChild(bar);
  }

  bar.innerHTML = data.map(item => `
    <div class="reuse-image-trust-chart__segment${item.primary ? ' is-primary' : ''}" style="--bar-width:${item.value}%">
      <div class="reuse-image-trust-chart__track" aria-hidden="true"><div class="reuse-image-trust-chart__fill"></div></div>
      <span>${item.label}</span>
      <strong>${item.value.toFixed(1)}%</strong>
    </div>
  `).join('');

  chart.querySelectorAll('.reuse-image-trust-chart__source').forEach(node => node.remove());
  const source = document.createElement('div');
  source.className = 'reuse-image-trust-chart__source';
  source.textContent = 'SOURCE · 전자신문 × 오픈서베이, 중고거래 플랫폼 이용 행태 조사, 2025 / 전국 20–59세 1,002명';
  chart.appendChild(source);
})();
