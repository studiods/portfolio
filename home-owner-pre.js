(() => {
  'use strict';

  const state = window.__PORTFOLIO_HOME_OWNERS__ = window.__PORTFOLIO_HOME_OWNERS__ || {};
  const principles = document.getElementById('principles');

  /*
    home-interactions.js owns Hero / Philosophy / Works.
    Keep the real Principles section untouched and put a hidden first-match
    decoy before it only while the base script captures its section references.
  */
  if (principles?.parentNode) {
    const decoy = document.createElement('div');
    decoy.id = 'principles';
    decoy.hidden = true;
    decoy.setAttribute('aria-hidden', 'true');
    decoy.dataset.runtimeDecoy = 'home-interactions';
    principles.parentNode.insertBefore(decoy, principles);

    state.principles = principles;
    state.principlesDecoy = decoy;
    principles.dataset.runtimeOwner = 'patch-pending';
  }

  document.documentElement.dataset.homeOwnerPhase = 'base';
})();
