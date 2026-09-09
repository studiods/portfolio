(() => {
  const charts = [...document.querySelectorAll('.reuse-image-trust-chart')];
  if (!charts.length) return;

  // 03.1 FINAL — product-condition emphasis only.
  const data = [
    {label:'판매자 신뢰', value:67.7, color:'rgba(255,255,255,.18)'},
    {label:'거래 편리성', value:58.6, color:'rgba(255,255,255,.18)'},
    {label:'상품 상태 확인', value:49.8, color:'#00A6ED'},
    {label:'가격', value:48.3, color:'rgba(255,255,255,.18)'},
    {label:'안전결제', value:29.0, color:'rgba(255,255,255,.18)'},
    {label:'플랫폼 대응', value:10.9, color:'rgba(255,255,255,.18)'}
  ];
  const max = Math.max(...data.map(item => item.value));

  charts.forEach(chart => {
    const caption = chart.querySelector('figcaption');
    if (caption) caption.innerHTML = '중고 제품을 판단할 때,<br>고객은 상품 상태 확인을 중요하게 확인했습니다.';

    const bar = chart.querySelector('.reuse-image-trust-chart__bar');
    if (!bar) return;

    bar.innerHTML = data.map((item, index) => `
      <div class="reuse-image-trust-chart__segment" data-index="${index}" style="--bar-color:${item.color}">
        <div class="reuse-image-trust-chart__track" aria-hidden="true" style="--bar-width:${(item.value / max * 100).toFixed(3)}%;--bar-color:${item.color}">
          <div class="reuse-image-trust-chart__fill" style="--bar-color:${item.color}"></div>
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
