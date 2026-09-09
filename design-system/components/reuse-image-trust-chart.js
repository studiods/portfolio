(() => {
  const charts = [...document.querySelectorAll('.reuse-image-trust-chart')];
  if (!charts.length) return;

  /* Runtime authority: the page contains legacy inline data-viz rules.
     Keep this component self-contained so those rules cannot collapse the
     six-row chart back into the old 160px stacked graphic. */
  const styleId = 'reuse-image-trust-chart-runtime';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .reuse-image-trust-chart .reuse-image-trust-chart__bar{
        display:flex!important;flex-direction:column!important;align-items:stretch!important;
        justify-content:flex-start!important;gap:8px!important;width:100%!important;
        height:auto!important;min-height:304px!important;max-height:none!important;
        overflow:visible!important;margin:0!important;padding:0!important;
      }
      .reuse-image-trust-chart .reuse-image-trust-chart__segment{
        position:relative!important;display:block!important;flex:0 0 44px!important;
        width:100%!important;height:44px!important;min-height:44px!important;max-height:44px!important;
        margin:0!important;padding:0!important;overflow:hidden!important;
        box-sizing:border-box!important;background:rgba(255,255,255,.06)!important;
      }
      .reuse-image-trust-chart .reuse-image-trust-chart__track{
        position:absolute!important;left:0!important;top:0!important;z-index:1!important;
        width:var(--bar-width)!important;height:44px!important;min-height:44px!important;
        max-height:44px!important;overflow:hidden!important;background:var(--bar-color)!important;
      }
      .reuse-image-trust-chart .reuse-image-trust-chart__fill{
        display:block!important;width:100%!important;height:44px!important;min-height:44px!important;
        transform:scaleX(0);transform-origin:left center;background:var(--bar-color)!important;
      }
      .reuse-image-trust-chart.is-chart-active .reuse-image-trust-chart__fill{transform:scaleX(1)}
      .reuse-image-trust-chart .reuse-image-trust-chart__segment span,
      .reuse-image-trust-chart .reuse-image-trust-chart__segment strong{
        position:absolute!important;z-index:2!important;display:block!important;
        margin:0!important;padding:0!important;white-space:nowrap!important;pointer-events:none!important;
      }
      .reuse-image-trust-chart .reuse-image-trust-chart__segment span{
        left:20px!important;bottom:10px!important;color:#fff!important;
        font-family:var(--hm-font-ko)!important;font-size:16px!important;font-weight:300!important;
        line-height:1!important;
      }
      .reuse-image-trust-chart .reuse-image-trust-chart__segment strong{
        right:20px!important;bottom:9px!important;color:#fff!important;
        font-family:var(--hm-font-en-thin,var(--hm-font-en))!important;font-size:20px!important;
        font-weight:300!important;line-height:1!important;text-align:right!important;
      }
      .reuse-image-trust-chart .reuse-image-trust-chart__source{
        display:block!important;margin-top:28px!important;padding-top:14px!important;
        border-top:1px solid rgba(255,255,255,.2)!important;color:rgba(255,255,255,.34)!important;
        font-family:var(--hm-font-ko)!important;font-size:10px!important;font-weight:300!important;
        line-height:1.5!important;
      }
    `;
    document.head.appendChild(style);
  }

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
    if (caption) caption.textContent = '중고거래에서 중요하게 보는 요소';

    const bar = chart.querySelector('.reuse-image-trust-chart__bar');
    if (!bar) return;

    bar.innerHTML = data.map((item, index) => `
      <div class="reuse-image-trust-chart__segment" data-index="${index}">
        <span>${item.label}</span>
        <div class="reuse-image-trust-chart__track" aria-hidden="true" style="--bar-width:${(item.value / max * 100).toFixed(3)}%;--bar-color:${item.color}">
          <div class="reuse-image-trust-chart__fill" style="--bar-color:${item.color}"></div>
        </div>
        <strong>${item.value.toFixed(1)}%</strong>
      </div>
    `).join('');

    /* Remove any legacy source row rendered by page-level/template code. */
    chart.querySelectorAll(':scope > *:not(figcaption):not(.reuse-image-trust-chart__bar):not(.reuse-image-trust-chart__source)').forEach(node => node.remove());
    chart.querySelectorAll('.reuse-image-trust-chart__source').forEach((node, i) => { if (i > 0) node.remove(); });

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
