(() => {
  const charts = [...document.querySelectorAll('.reuse-image-trust-chart')];
  if (!charts.length) return;

  const data = [
    {label:'판매자 신뢰', value:67.7},
    {label:'거래 편리성', value:58.6},
    {label:'상품 상태 확인', value:49.8, primary:true},
    {label:'가격', value:48.3},
    {label:'안전결제', value:29.0},
    {label:'플랫폼 대응', value:10.9}
  ];

  charts.forEach(chart => {
    const bar = chart.querySelector('.reuse-image-trust-chart__bar');
    if (!bar) return;

    bar.innerHTML = data.map(item => `
      <div class="reuse-image-trust-chart__segment${item.primary ? ' is-primary' : ''}">
        <div class="reuse-image-trust-chart__track" aria-hidden="true" style="--bar-width:${item.value}%">
          <div class="reuse-image-trust-chart__fill"></div>
        </div>
        <span>${item.label}</span>
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
  });
})();
