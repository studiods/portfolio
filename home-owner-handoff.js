(() => {
  'use strict';

  const state = window.__PORTFOLIO_HOME_OWNERS__ = window.__PORTFOLIO_HOME_OWNERS__ || {};
  const principles = state.principles || document.getElementById('principles--patch-owned');

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

  /* Restore Principles for the patch renderer and recreate only the structural
     splitting that the base renderer used to provide. */
  if (principles) {
    principles.id = state.principlesOriginalId || 'principles';
    principles.dataset.runtimeOwner = 'home-test-patch';

    principles.querySelectorAll('.principles-intro-ko, .principle-ko').forEach(splitChars);
    principles.querySelectorAll('.principles-intro-ko .fill-char, .principle-ko .fill-char')
      .forEach(char => {
        if (!char.dataset.finalChar) char.dataset.finalChar = char.textContent;
      });
  }

  /* Keep Hero and Philosophy invisible to home-test-patch.js while it boots.
     Their already-running base renderer keeps the real element references. */
  const hero = document.getElementById('heroSequence');
  const philosophy = document.getElementById('philosophy');

  if (hero) {
    state.hero = hero;
    state.heroOriginalId = hero.id;
    hero.id = 'heroSequence--base-owned';
    hero.dataset.runtimeOwner = 'home-interactions';
  }
  if (philosophy) {
    state.philosophy = philosophy;
    state.philosophyOriginalId = philosophy.id;
    philosophy.id = 'philosophy--base-owned';
    philosophy.dataset.runtimeOwner = 'home-interactions';
  }

  document.documentElement.dataset.homeOwnerPhase = 'patch';
})();
