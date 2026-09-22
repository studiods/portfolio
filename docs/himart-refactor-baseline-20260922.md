# Himart refactor baseline — 2026-09-22

## Frozen source
- Production repository: `studiods/portfolio`
- Baseline commit: `141294699ff3cbe157c41c4e893c6e6e2f835030`
- Recovery branch: `backup/pre-cleanup-20260922`
- Working branch: `refactor/himart-consolidation-20260922`

## Scope
This branch refactors `himart.html` only. Other production pages and public URLs must remain unchanged.

## Current structural risks to remove
1. Multiple runtime layers rewrite the same Himart DOM.
2. `test-content-loader.js` dynamically loads legacy content.
3. `test-content-final.js` performs delayed reconciliation after other writers.
4. A legacy runtime can load the obsolete `himart-wide-refine-v10` assets and a later adapter removes them.
5. CSS is applied through a long override chain rather than a page-owned final stylesheet.

## Refactor target
- One authored HTML document: `himart.html`
- One page-owned final stylesheet
- One page-owned runtime for interaction only
- Shared navigation, font, token, and generic animation code remain shared only when used across pages.
- No content should depend on asynchronous DOM injection.

## Acceptance checks
- Cold load after cache clear and normal reload render the same structure.
- Hero video, journey flow, graphs, counters, scramble animation, GNB, and linked assets work.
- No JavaScript console errors or local resource 404s.
- Desktop widths 1920, 1440, and 1280 plus mobile width are checked.
- GitHub Pages output is checked before any change is merged to `main`.

## Deletion policy
No legacy file is deleted while the new page still relies on it. Deletion happens only after a reference scan and deployed-page check confirm it is unused.
