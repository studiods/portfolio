(() => {
  'use strict';
  const clean=()=>{
    document.querySelectorAll('.case-section-kicker').forEach(el=>{
      el.textContent=(el.textContent||'').replace(/^\s*\d+\s*\/\s*/,'').trim();
    });
    document.querySelectorAll('.case-stage-index').forEach(el=>el.remove());
    document.querySelectorAll('.process-step > span').forEach(el=>el.remove());
    document.querySelectorAll('.evidence-card[data-ui-index]').forEach(el=>el.removeAttribute('data-ui-index'));
    document.querySelectorAll('.case-chapter-progress button').forEach(button=>{
      button.textContent='';
      button.setAttribute('data-marker','');
    });
  };
  clean();
  requestAnimationFrame(clean);
})();
