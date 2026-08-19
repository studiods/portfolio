(() => {
  'use strict';

  const state = window.__PORTFOLIO_HOME_OWNERS__ = window.__PORTFOLIO_HOME_OWNERS__ || {};
  const principles = document.getElementById('principles');

  /*
    home-interactions.js owns Hero / Philosophy / Works.
    Hide only the Principles id while that script boots so it cannot retain
    live references to a section that home-test-patch.js owns later.
  */
  if (principles) {
    state.principles = principles;
    state.principlesOriginalId = principles.id;
    principles.id = 'principles--patch-owned';
    principles.dataset.runtimeOwner = 'patch-pending';
  }

  document.documentElement.dataset.homeOwnerPhase = 'base';
})();
