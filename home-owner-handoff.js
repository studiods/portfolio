(() => {
  'use strict';

  const state = window.__PORTFOLIO_HOME_OWNERS__ = window.__PORTFOLIO_HOME_OWNERS__ || {};
  const principles = state.principles || document.querySelector('.principles-section');

  const splitChars = el => {
    if (!el || el.dataset.split === '1') return;
    el.dataset.split = '1';
    [...el.childNodes].forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        [...node.textContent].forEach(character => {
          const span = document.createElement('span');
          span.className = 'fill-char';
          span.textContent = character;
          fragment.appendChild(span);
        });
        node.replaceWith(fragment);
      } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('fill-char')) {
        splitChars(node);
      }
    });
  };

  state.principlesDecoy?.remove();
  state.principlesDecoy = null;

  /* Prepare the real Principles section for home-test-patch.js. */
  if (principles) {
    principles.dataset.runtimeOwner = 'home-test-patch';
    principles.querySelectorAll('.principles-intro-ko, .principle-ko').forEach(splitChars);
    principles.querySelectorAll('.principles-intro-ko .fill-char, .principle-ko .fill-char')
      .forEach(char => {
        if (!char.dataset.finalChar) char.dataset.finalChar = char.textContent;
      });
  }

  /* home-test-patch.js must not capture Hero or Philosophy. Use hidden decoys
     without changing the real sections' ids, layout or anchor behavior. */
  const installDecoy = (real, id, key) => {
    if (!real?.parentNode) return;
    const decoy = document.createElement('div');
    decoy.id = id;
    decoy.hidden = true;
    decoy.setAttribute('aria-hidden', 'true');
    decoy.dataset.runtimeDecoy = 'home-test-patch';
    real.parentNode.insertBefore(decoy, real);
    state[key] = decoy;
  };

  const hero = document.getElementById('heroSequence');
  const philosophy = document.getElementById('philosophy');
  state.hero = hero;
  state.philosophy = philosophy;

  hero?.setAttribute('data-runtime-owner', 'home-interactions');
  philosophy?.setAttribute('data-runtime-owner', 'home-interactions');

  installDecoy(hero, 'heroSequence', 'heroDecoy');
  installDecoy(philosophy, 'philosophy', 'philosophyDecoy');

  document.documentElement.dataset.homeOwnerPhase = 'patch';
})();
