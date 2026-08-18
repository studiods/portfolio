(() => {
  'use strict';
  const hero=document.querySelector('.about-ascii-hero');
  const stage=document.querySelector('.about-ascii-stage');
  const canvas=document.querySelector('.about-ascii-canvas');
  const ctx=canvas?.getContext('2d',{alpha:false});
  const meta=window.ABOUT_ASCII_PHOTO_META;
  const encoded=window.ABOUT_ASCII_FRAME_B64;
  if(!hero||!stage||!canvas||!ctx||!meta||!Array.isArray(encoded))return;

  const COLS=Number(meta.width)||240;
  const ROWS=Number(meta.height)||135;
  const COUNT=Number(meta.count)||7;
  const PACKED=Math.ceil(COLS*ROWS/2);
  const PALETTE=' .,:;-=+*#%@';
  const SCENE_MS=1500,HOLD_MS=960,MORPH_MS=540,GLITCH_MS=48;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp=v=>Math.max(0,Math.min(1,v));
  const smooth=v=>{const t=clamp(v);return t*t*(3-2*t)};
  const ease=v=>1-Math.pow(1-clamp(v),3);
  const hash=v=>{let x=v|0;x=Math.imul(x^(x>>>16),0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);x^=x>>>16;return(x>>>0)/4294967295};
  const shuffle=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
  const b64=v=>{const s=atob(v),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a};
  const inflate=async v=>{if(typeof DecompressionStream!=='function')throw new Error('DecompressionStream unavailable');const s=new Blob([b64(v)]).stream().pipeThrough(new DecompressionStream('deflate'));return new Uint8Array(await new Response(s).arrayBuffer())};
  const unpack=p=>{const f=new Uint8Array(COLS*ROWS);let t=0;for(let i=0;i<p.length&&t<f.length;i++){const x=p[i];f[t]=((x>>>4)&15)*17;if(t+1<f.length)f[t+1]=(x&15)*17;t+=2}return f};

  const status=text=>{const r=hero.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(r.width*d));canvas.height=Math.max(1,Math.round(r.height*d));ctx.setTransform(d,0,0,d,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,r.width,r.height);ctx.fillStyle='rgba(244,242,237,.72)';ctx.font='12px ui-monospace,monospace';ctx.fillText(text,18,18)};

  (async()=>{
    status('ASCII LOADING');
    if(encoded.length!==COUNT)throw new Error(`frame count ${encoded.length}/${COUNT}`);
    const packed=await Promise.all(encoded.map(inflate));
    packed.forEach((p,i)=>{if(p.length!==PACKED)throw new Error(`frame ${i+1} size ${p.length}/${PACKED}`)});
    const frames=packed.map(unpack),cells=COLS*ROWS;
    const starts=new Float32Array(cells),ends=new Float32Array(cells);
    const lines=Array.from({length:ROWS},()=>new Array(COLS).fill(' '));
    let deck=shuffle([...Array(COUNT).keys()]),cursor=0,current=deck[0],next=deck[1],began=performance.now(),serial=0,raf=0,last=-1;
    let w=1,h=1,cw=1,ch=1,dpr=1,sx=1;

    const following=now=>{cursor++;if(cursor>=deck.length-1){let d=shuffle([...Array(COUNT).keys()]);if(d[0]===now&&d.length>1)[d[0],d[1]]=[d[1],d[0]];deck=d;cursor=-1}return deck[cursor+1]};
    const prep=()=>{serial++;const seed=(current+1)*733+(next+1)*1597+serial*409;for(let i=0;i<cells;i++){const s=hash(seed+i*19)*.48,d=.28+hash(seed+i*41)*.32;starts[i]=s;ends[i]=Math.min(1,s+d)}};
    const resize=()=>{const r=hero.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);cw=w/COLS;ch=h/ROWS;const fs=Math.max(1.8,ch*1.02);ctx.font=`${fs}px ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace`;ctx.textAlign='left';ctx.textBaseline='middle';sx=cw/Math.max(.01,ctx.measureText('M').width);last=-1};
    const draw=(now,m=0)=>{ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,w,h);const a=frames[current],b=frames[next],chaos=m>0?Math.sin(Math.PI*m):0,tick=Math.floor(now/GLITCH_MS),seed=(current+1)*1063+(next+1)*2207+serial*131;for(let i=0;i<cells;i++){let v=a[i];if(m>0){const s=starts[i],e=ends[i],l=m<=s?0:m>=e?1:smooth((m-s)/Math.max(.001,e-s));v=a[i]+(b[i]-a[i])*l}let pi=Math.round(v/255*(PALETTE.length-1));if(m>0&&hash(seed+i*47+tick*131)<.08+chaos*.4){pi=Math.max(0,Math.min(PALETTE.length-1,pi+Math.round((hash(seed+i*71+tick*197)*2-1)*(1+chaos*3))))}lines[Math.floor(i/COLS)][i%COLS]=PALETTE[pi]}ctx.setTransform(dpr*sx,0,0,dpr,0,0);ctx.fillStyle='rgba(244,242,237,.88)';for(let r=0;r<ROWS;r++)ctx.fillText(lines[r].join(''),0,r*ch+ch*.54)};
    const advance=()=>{current=next;next=following(current);prep();last=-1};
    const loop=now=>{let elapsed=now-began;while(elapsed>=SCENE_MS){began+=SCENE_MS;advance();elapsed=now-began}const m=elapsed<=HOLD_MS?0:clamp((elapsed-HOLD_MS)/MORPH_MS);if(m===0){if(last!==current){draw(now,0);last=current}}else{draw(now,m);last=-1}raf=requestAnimationFrame(loop)};
    const scrollState=()=>{const sr=stage.getBoundingClientRect(),hr=hero.getBoundingClientRect(),travel=Math.max(1,stage.offsetHeight-hr.height),passed=clamp(-sr.top/travel);hero.style.setProperty('--ascii-blackout',(ease(passed)*.92).toFixed(3))};

    prep();resize();draw(performance.now(),0);scrollState();hero.dataset.asciiState='photo-ready';if(!reduced)raf=requestAnimationFrame(loop);
    let ticking=false;addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{scrollState();ticking=false})},{passive:true});
    addEventListener('resize',()=>{resize();draw(performance.now(),0);scrollState()},{passive:true});
    addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf)},{once:true});
  })().catch(err=>{status('ASCII DATA ERROR');console.error('About photo ASCII failed.',err)});
})();
