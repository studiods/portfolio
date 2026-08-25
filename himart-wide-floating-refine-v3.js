(() => {
  'use strict';
  const main=document.querySelector('main');
  if(!main)return;

  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const subByNo=(root,no)=>[...(root||main).querySelectorAll('.hm-subsection')]
    .find(section=>section.querySelector('.hm-subno')?.textContent.includes(no));
  const cardByNo=no=>[...main.querySelectorAll('#data .data-card')]
    .find(card=>card.querySelector('.hm-card-no')?.textContent.includes(no));

  /* ---------- 01 / QUALITATIVE ---------- */
  const brand=main.querySelector('#brand');
  if(brand){
    const ux=subByNo(brand,'01.4');
    if(ux){
      ux.classList.add('wide-ux-role-heading');
      const title=ux.querySelector('.hm-subtitle');
      if(title)title.innerHTML='<span class="wide-title-index">04.</span>사용자들의 목소리를 UX에 어떻게 반영할까를 고민했습니다.';
    }

    const summary=subByNo(brand,'01.3');
    const positive=summary?.querySelector('.sentiment-block:not(.negative) .sentiment-keywords');
    if(positive){
      positive.innerHTML='<b>핵심 키워드</b><br>오프라인 체험 · 전문가 상담 · 제품 다양성 · 설치/A/S 신뢰 · 통합 쇼핑가격/혜택즉시수령<br>토탈 케어 · 접근성 · 가전 전문성';
    }
  }

  /* ---------- 02 / QUANTITATIVE ---------- */
  const trafficCard=cardByNo('02.2');
  const trafficWrap=trafficCard?.querySelector('.chart-wrap');
  const trafficSvg=trafficWrap?.querySelector('.chart-svg');

  /* Remove any real duplicate fallback image/node if an older layer inserted one. */
  if(trafficWrap){
    [...trafficWrap.children].forEach(child=>{
      if(child===trafficSvg||child.classList?.contains('chart-legend'))return;
      if(child.matches?.('img,picture,.traffic-chart-image,.chart-generated,.chart-fallback'))child.remove();
    });
  }

  const graphTargets=[
    ...main.querySelectorAll('#data .wide-segmented-bar'),
    ...main.querySelectorAll('#data .hbars'),
    ...(trafficWrap?[trafficWrap]:[])
  ];
  graphTargets.forEach(el=>el.classList.add('hm-graph-animate'));

  const resetTraffic=()=>{
    if(!trafficSvg)return;
    trafficSvg.getAnimations({subtree:true}).forEach(a=>a.cancel());
    trafficSvg.querySelectorAll('.bar,.line-newblue,.line-green,.line-blue,.point-yellow').forEach(el=>{
      el.style.removeProperty('stroke-dasharray');
      el.style.removeProperty('stroke-dashoffset');
      el.style.removeProperty('opacity');
      el.style.removeProperty('transform');
      el.style.removeProperty('transform-origin');
      el.style.removeProperty('transform-box');
    });
  };

  const drawPolyline=(el,delay,duration=620)=>{
    if(!el||typeof el.getTotalLength!=='function')return;
    const length=el.getTotalLength();
    el.style.strokeDasharray=`${length}`;
    el.style.strokeDashoffset=`${length}`;
    el.animate([
      {strokeDashoffset:length,opacity:.2},
      {strokeDashoffset:0,opacity:1}
    ],{duration,delay,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
  };

  const animateTraffic=()=>{
    if(!trafficSvg||reduced)return;
    resetTraffic();

    /* 1) Sessions */
    [...trafficSvg.querySelectorAll('.bar')].forEach((bar,i)=>{
      bar.style.transformBox='fill-box';
      bar.style.transformOrigin='center bottom';
      bar.animate([
        {transform:'scaleY(0)',opacity:.15},
        {transform:'scaleY(1)',opacity:1}
      ],{duration:420,delay:i*38,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
    });

    /* 2) Purchases */
    drawPolyline(trafficSvg.querySelector('.line-newblue'),430,620);
    [...trafficSvg.querySelectorAll('.point-yellow')].forEach((point,i)=>{
      point.animate([{opacity:0},{opacity:1}],{duration:220,delay:820+i*35,fill:'forwards'});
    });

    /* 3) CVR */
    drawPolyline(trafficSvg.querySelector('.line-green'),1010,620);
    const baseline=trafficSvg.querySelector('.line-blue');
    baseline?.animate([{opacity:0},{opacity:.5}],{duration:260,delay:1420,fill:'forwards'});
  };

  if(reduced){
    graphTargets.forEach(el=>el.classList.add('is-graph-focus'));
  }else if('IntersectionObserver' in window){
    const graphObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        const el=entry.target;
        if(entry.isIntersecting){
          el.classList.remove('is-graph-focus');
          void el.offsetWidth;
          el.classList.add('is-graph-focus');
          if(el===trafficWrap)animateTraffic();
        }else{
          el.classList.remove('is-graph-focus');
          if(el===trafficWrap)resetTraffic();
        }
      });
    },{threshold:.38,rootMargin:'-8% 0px -16% 0px'});
    graphTargets.forEach(el=>graphObserver.observe(el));
  }else{
    graphTargets.forEach(el=>el.classList.add('is-graph-focus'));
    animateTraffic();
  }

  /* ---------- FAST NUMBER COUNTING ---------- */
  const numberRegex=/[-+]?\d[\d,]*(?:\.\d+)?/g;
  const countElements=new Set([
    ...main.querySelectorAll('#brand .sentiment-number,#brand .ring-card .pct'),
    ...main.querySelectorAll('#data .wide-segment small,#data .legend-row b,#data .number-panel strong,#data .search-slope strong,#data .hbar b,#data .stacklabels b')
  ]);

  const wrapInlineNumbers=root=>{
    if(!root||root.dataset.countWrapped==='1')return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
      if(!node.nodeValue||!numberRegex.test(node.nodeValue)){numberRegex.lastIndex=0;return NodeFilter.FILTER_REJECT}
      numberRegex.lastIndex=0;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes=[];let node;while((node=walker.nextNode()))nodes.push(node);
    nodes.forEach(textNode=>{
      const text=textNode.nodeValue;
      const frag=document.createDocumentFragment();
      let last=0;
      text.replace(numberRegex,(match,offset)=>{
        frag.append(text.slice(last,offset));
        const span=document.createElement('span');
        span.className='hm-count-inline';
        span.textContent=match;
        span.dataset.countOriginal=match;
        frag.append(span);
        last=offset+match.length;
        return match;
      });
      frag.append(text.slice(last));
      textNode.replaceWith(frag);
    });
    root.dataset.countWrapped='1';
  };

  const inlineRoots=[...main.querySelectorAll('#data .data-card .desc')];
  inlineRoots.forEach(wrapInlineNumbers);
  inlineRoots.forEach(root=>root.querySelectorAll('.hm-count-inline').forEach(el=>countElements.add(el)));

  const formatValue=(value,original)=>{
    const decimals=(original.split('.')[1]||'').replace(/\D/g,'').length;
    const useCommas=original.includes(',');
    let out=decimals?value.toFixed(decimals):String(Math.round(value));
    if(useCommas){
      const [a,b]=out.split('.');
      out=Number(a).toLocaleString('en-US')+(b!==undefined?`.${b}`:'');
    }
    return out;
  };

  const animateCount=el=>{
    const original=el.dataset.countOriginal||el.textContent;
    if(!original.match(numberRegex))return;
    el.dataset.countOriginal=original;
    if(reduced){el.textContent=original;return}
    const tokens=[...original.matchAll(numberRegex)];
    const values=tokens.map(m=>Number(m[0].replace(/,/g,'')));
    const started=performance.now();
    const duration=560;
    const tick=now=>{
      const p=Math.min(1,(now-started)/duration);
      const eased=1-Math.pow(1-p,3);
      let idx=0;
      el.textContent=original.replace(numberRegex,token=>formatValue(values[idx++]*eased,token));
      if(p<1)requestAnimationFrame(tick);else el.textContent=original;
    };
    requestAnimationFrame(tick);
  };

  if('IntersectionObserver' in window&&!reduced){
    const numberObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          if(entry.target.dataset.countPlayed!=='1'){
            entry.target.dataset.countPlayed='1';
            animateCount(entry.target);
          }
        }else{
          delete entry.target.dataset.countPlayed;
          if(entry.target.dataset.countOriginal)entry.target.textContent=entry.target.dataset.countOriginal;
        }
      });
    },{threshold:.62,rootMargin:'-6% 0px -12% 0px'});
    countElements.forEach(el=>numberObserver.observe(el));
  }else countElements.forEach(animateCount);
})();
