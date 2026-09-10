(() => {
  'use strict';

  const FRAME_MS = 300;
  const ENTER_RATIO = 0.35;
  const EXIT_RATIO = 0.15;
  const STYLE_ID = 'reuse-360-focus-demo-style';
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const installStyles = () => {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      html body.reuse-current .reuse-image-display-card.is-360-viewer.reuse-360-focus-demo .reuse-360-viewer__hint{
        gap:18px!important;
        color:rgba(255,255,255,.82)!important;
        font-family:var(--hm-font-ko),Pretendard,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important;
        font-size:14px!important;
        font-weight:300!important;
        font-variation-settings:'wght' 300!important;
        line-height:1.4!important;
        letter-spacing:-.02em!important;
        opacity:1!important;
      }

      html body.reuse-current .reuse-image-display-card.is-360-viewer.reuse-360-focus-demo .reuse-360-viewer__hint::before,
      html body.reuse-current .reuse-image-display-card.is-360-viewer.reuse-360-focus-demo .reuse-360-viewer__hint::after{
        content:''!important;
        display:block!important;
        flex:0 0 auto!important;
        width:11px!important;
        height:11px!important;
        background:none!important;
        border-top:1px solid rgba(255,255,255,.68)!important;
        border-right:1px solid rgba(255,255,255,.68)!important;
        box-sizing:border-box!important;
        transform-origin:50% 50%!important;
      }

      html body.reuse-current .reuse-image-display-card.is-360-viewer.reuse-360-focus-demo .reuse-360-viewer__hint::before{
        transform:rotate(-135deg)!important;
      }

      html body.reuse-current .reuse-image-display-card.is-360-viewer.reuse-360-focus-demo .reuse-360-viewer__hint::after{
        transform:rotate(45deg)!important;
      }

      html body.reuse-current .reuse-image-display-card.is-360-viewer.reuse-360-focus-demo.reuse-360-hint-hidden .reuse-360-viewer__hint{
        opacity:0!important;
      }

      @media(max-width:780px){
        html body.reuse-current .reuse-image-display-card.is-360-viewer.reuse-360-focus-demo .reuse-360-viewer__hint{
          gap:14px!important;
          font-size:12px!important;
        }
        html body.reuse-current .reuse-image-display-card.is-360-viewer.reuse-360-focus-demo .reuse-360-viewer__hint::before,
        html body.reuse-current .reuse-image-display-card.is-360-viewer.reuse-360-focus-demo .reuse-360-viewer__hint::after{
          width:9px!important;
          height:9px!important;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const enhance = (card) => {
    if (!card || card.dataset.focusDemoMounted === 'true') return;

    const hint = card.querySelector('.reuse-360-viewer__hint');
    const frames = Array.from(card.querySelectorAll('.reuse-360-viewer__frame'));
    if (!hint || frames.length < 2) return;

    card.dataset.focusDemoMounted = 'true';
    card.classList.add('reuse-360-focus-demo');
    hint.textContent = '마우스로 돌려보세요';

    let inFocus = false;
    let demoTimer = 0;
    let demoRunning = false;
    let demoStartIndex = 0;
    let demoStep = 0;
    let focusSession = 0;

    const activeFrameIndex = () => {
      const found = frames.findIndex((frame) => frame.classList.contains('is-active'));
      return found >= 0 ? found : 0;
    };

    const displayFrame = (index) => {
      const normalized = ((index % frames.length) + frames.length) % frames.length;
      frames.forEach((frame, frameIndex) => {
        frame.classList.toggle('is-active', frameIndex === normalized);
      });
    };

    const clearDemoTimer = () => {
      if (demoTimer) window.clearTimeout(demoTimer);
      demoTimer = 0;
    };

    const stopDemo = ({ restore = false } = {}) => {
      clearDemoTimer();
      if (restore && demoRunning) displayFrame(demoStartIndex);
      demoRunning = false;
      demoStep = 0;
    };

    const playDemo = () => {
      stopDemo();
      if (!inFocus || document.hidden || reducedMotion) return;

      demoStartIndex = activeFrameIndex();
      demoStep = 0;
      demoRunning = true;

      const tick = () => {
        if (!demoRunning || !inFocus || document.hidden) return;

        demoStep += 1;
        displayFrame(demoStartIndex + demoStep);

        if (demoStep >= frames.length) {
          demoRunning = false;
          demoTimer = 0;
          return;
        }

        demoTimer = window.setTimeout(tick, FRAME_MS);
      };

      demoTimer = window.setTimeout(tick, FRAME_MS);
    };

    const showHint = () => {
      card.classList.remove('reuse-360-hint-hidden', 'has-rotated');
    };

    const hideHintForInteraction = () => {
      if (demoRunning) stopDemo({ restore: true });
      card.classList.add('reuse-360-hint-hidden');
    };

    /* Capture phase runs before the existing drag controller. If the user clicks while
       the focus demo is mid-cycle, the preview is restored to the controller's original
       frame first, then the native drag logic starts from a matching frame index. */
    card.addEventListener('pointerdown', hideHintForInteraction, { capture: true });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') hideHintForInteraction();
    }, { capture: true });

    const enterFocus = () => {
      if (inFocus) return;
      inFocus = true;
      focusSession += 1;
      const session = focusSession;
      showHint();

      /* Let eager 360 frames settle for one frame before the one-cycle demonstration. */
      window.requestAnimationFrame(() => {
        if (inFocus && session === focusSession) playDemo();
      });
    };

    const leaveFocus = () => {
      if (!inFocus) return;
      inFocus = false;
      focusSession += 1;
      stopDemo({ restore: true });
      showHint();
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target !== card) return;

          if (!inFocus && entry.isIntersecting && entry.intersectionRatio >= ENTER_RATIO) {
            enterFocus();
            return;
          }

          if (inFocus && (!entry.isIntersecting || entry.intersectionRatio <= EXIT_RATIO)) {
            leaveFocus();
          }
        });
      }, {
        threshold: [0, EXIT_RATIO, ENTER_RATIO, 0.6, 1],
        rootMargin: '0px 0px -6% 0px'
      });
      observer.observe(card);
    } else {
      enterFocus();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopDemo({ restore: true });
        return;
      }
      if (inFocus && !card.classList.contains('reuse-360-hint-hidden')) playDemo();
    });
  };

  const mount = () => {
    installStyles();
    const card = document.querySelector('#journey .reuse-image-display-grid .reuse-image-display-card.is-360-viewer');
    if (card) enhance(card);
  };

  mount();
  requestAnimationFrame(mount);
  [120, 420, 900, 1600].forEach((ms) => window.setTimeout(mount, ms));
})();
