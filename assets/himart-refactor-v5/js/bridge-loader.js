(async function himartRefactorBridge(){
  'use strict';
  const SOURCE = './himart.html';
  const boot = document.getElementById('refactor-bootstrap');

  function setError(message, error){
    console.error('[HIMART refactor v5]', error || message);
    document.body.className = 'himart-page-body himart-refactor-v5-error';
    document.body.innerHTML = `
      <main style="min-height:100vh;background:#000;color:#fff;padding:160px 6vw;font-family:Pretendard,-apple-system,BlinkMacSystemFont,sans-serif">
        <p style="font-size:12px;opacity:.45;letter-spacing:.08em">REFACTOR TEST V5</p>
        <h1 style="font-size:clamp(32px,5vw,64px);font-weight:200;line-height:1.1;margin:20px 0">원본 콘텐츠를 불러오지 못했습니다.</h1>
        <p style="max-width:760px;font-size:16px;line-height:1.8;opacity:.65">${message}</p>
      </main>`;
  }

  function normalizeSrc(src){
    if(!src) return '';
    const url = new URL(src, new URL(SOURCE, location.href));
    return url.href;
  }

  async function executeScript(script){
    if(script.src){
      const src = normalizeSrc(script.getAttribute('src'));
      await new Promise((resolve,reject)=>{
        const el=document.createElement('script');
        el.src=src;
        if(script.type) el.type=script.type;
        el.onload=resolve;
        el.onerror=()=>reject(new Error(`Script load failed: ${src}`));
        document.body.appendChild(el);
      });
      return;
    }
    const code=script.textContent || '';
    if(!code.trim()) return;
    const el=document.createElement('script');
    if(script.type) el.type=script.type;
    el.textContent=code + '\n//# sourceURL=himart-refactor-v5-inline.js';
    document.body.appendChild(el);
  }

  try{
    const response = await fetch(SOURCE, {cache:'no-store'});
    if(!response.ok) throw new Error(`HTTP ${response.status} while fetching ${SOURCE}`);
    const sourceText = await response.text();
    const parsed = new DOMParser().parseFromString(sourceText,'text/html');
    if(!parsed.body || !parsed.querySelector('#live-main')){
      throw new Error('Source does not contain #live-main.');
    }

    const scripts=[...parsed.body.querySelectorAll('script')];
    scripts.forEach(s=>s.remove());

    document.body.className = `${parsed.body.className} himart-refactor-v5`.trim();
    document.body.innerHTML = parsed.body.innerHTML;

    for(const script of scripts){
      await executeScript(script);
    }

    document.body.classList.remove('himart-refactor-v5-loading');
    document.body.classList.add('himart-refactor-v5-ready');
    console.info('[HIMART refactor v5] bridge boot complete', {
      sections: document.querySelectorAll('#live-main > .hm-section').length,
      source: SOURCE
    });
  }catch(error){
    if(boot) boot.textContent='Failed to load HIMART case.';
    setError('himart.html을 읽어 현재 콘텐츠를 그대로 복제하는 브리지 단계에서 오류가 발생했습니다. 콘솔의 [HIMART refactor v5] 오류를 확인해 주세요.', error);
  }
})();
