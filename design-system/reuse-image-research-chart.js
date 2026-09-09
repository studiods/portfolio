(() => {
  'use strict';

  /*
    REUSE 03.1 — research-backed image importance chart.
    These figures are independent research signals, not parts of a 100% composition.
    Therefore they are rendered as proportional comparison bars rather than a stacked total.
  */
  const source = document.querySelector('.reuse-image-evidence');
  if (!source) return;

  source.className = 'data-viz reuse-image-research-chart';
  source.setAttribute('aria-label', '중고 제품 구매에서 이미지가 중요한 판단 수단임을 보여주는 리서치');
  source.innerHTML = `
    <div class="research-chart">
      <h4>중고 제품의 상태를 확인하는 과정에서,<br>이미지는 핵심 판단 수단이었습니다.</h4>
      <div class="research-bars" role="list">
        <div class="research-bar" role="listitem">
          <div class="research-bar__head"><b>제품 상태를 중요하게 고려</b><strong>68.9%</strong></div>
          <div class="research-bar__track"><i style="width:68.9%"></i></div>
        </div>
        <div class="research-bar" role="listitem">
          <div class="research-bar__head"><b>PDP 도착 후 이미지부터 탐색</b><strong>56%</strong></div>
          <div class="research-bar__track"><i style="width:56%"></i></div>
        </div>
        <div class="research-bar" role="listitem">
          <div class="research-bar__head"><b>이미지로 제품 크기를 파악</b><strong>42%</strong></div>
          <div class="research-bar__track"><i style="width:42%"></i></div>
        </div>
        <div class="research-bar" role="listitem">
          <div class="research-bar__head"><b>판매자 신용도를 고려</b><strong>37.6%</strong></div>
          <div class="research-bar__track"><i style="width:37.6%"></i></div>
        </div>
      </div>
      <p class="research-chart__note">중고거래에서 제품 상태가 핵심 판단 기준이었다면, 온라인에서는 그 상태를 확인하기 위한 이미지 탐색이 먼저 일어났습니다.</p>
      <div class="reuse-proof-source">SOURCE - 엠브레인 트렌드모니터 ‘중고거래 경험 및 플랫폼 인식 조사’ 2020 · n=1,000 (제품 상태 68.9% / 판매자 신용도 37.6%) · Baymard Institute Product Page UX Research (PDP 도착 후 이미지 탐색 56% / 이미지로 제품 크기 파악 42%)</div>
    </div>`;
})();
