# Himart architecture audit — 2026-09-22

## Scope and method

- Baseline commit: `141294699ff3cbe157c41c4e893c6e6e2f835030`
- Recovery branch: `backup/pre-cleanup-20260922`
- Working branch: `refactor/himart-consolidation-20260922`
- Production entry pages checked: 15
- Static pass: HTML resource references plus CSS imports and JavaScript resource strings.
- Independent pass: production-entry dependency closure. HTML paths were resolved per document; dynamic JavaScript resources were resolved conservatively from the page base and script directory.

## Result

| classification | count | interpretation |
|---|---:|---|
| CSS/JS in repository | 322 | all stylesheet and script files |
| reachable from production entries | 162 | keep until the replacement page is validated |
| not reachable in either scan | 160 | archive candidates; not deletion-ready yet |
| Himart-family files not reachable | 112 | likely historical iterations or test artifacts |
| live Himart runtime files with `test` in the name | 2 | **keep now**: they are loaded directly by `himart.html` |

The two scans agree on the conclusion that a large inactive archive exists. The exact raw count differs from earlier name-only inventory because this audit follows dynamic loaders and counts every current CSS/JS path. The conservative count above is the deletion gate.

## Current Himart execution chain

```
himart.html
  ├─ 20 direct stylesheets
  ├─ 11 direct scripts
  ├─ test-content-loader.js
  │   ├─ himart-narrative-v2-production-base.js
  │   │   ├─ himart-wide-refine-v10.css
  │   │   └─ himart-wide-refine-v10.js
  │   └─ himart-live-boot.js
  ├─ test-content-final.js
  └─ himart-wide-editorial-adapter.js
      └─ later removes the v10 CSS/JS injected above
```

## Findings

1. **One DOM has several owners.** `content-runtime.js`, `test-content-loader.js`, `himart-narrative-v2-production-base.js`, `test-content-final.js`, and `himart-wide-editorial-adapter.js` all write, move, wrap, or remove Himart content.
2. **Load timing changes presentation.** The production-base file injects the v10 journey assets; the later adapter removes those exact assets to mitigate a cold-load race. It is evidence of competing final states, not a stable module boundary.
3. **“Test” does not mean unused.** `design-system/test-content-loader.js` and `design-system/test-content-final.js` are direct production dependencies today. Removing them before the static replacement would break the page.
4. **Historical variants are intermixed with current code.** Examples include root-level `himart-wide-refine-v5` through `v15`, `himart-simple-*`, `himart-production-*`, `himart_backup_01`, and `himart_backup_02`. Most are unreachable from production but should move to an archive only after final verification.
5. **The current CSS model is an override chain.** The page loads 20 stylesheets in a specific order, including files named `*-test`, `*-guard`, `*-polish`, and `*-contract`. The effective design is distributed across files rather than owned by the page.

## Safe target structure

- `himart.html`: authored semantic content only; no asynchronous content injection.
- `design-system/pages/himart.css`: one page-owned final stylesheet. Shared navigation, font tokens, and global footer remain shared only when genuinely common.
- `design-system/pages/himart.js`: interaction only (navigation state, reveal/counter effects, video fallback). It must not author, move, or reconcile content.
- Existing assets remain in place through validation; no binary assets are copied or removed.

## Execution order

1. Freeze the current state and retain the recovery branch.
2. Build the page-owned static HTML/CSS/JS replacement on the working branch.
3. Run cold-load, normal reload, console-error, resource-404, desktop, and mobile checks.
4. Make `himart.html` use only the new page-owned files.
5. Re-run the dependency closure and inspect the deployed GitHub Pages result.
6. Archive confirmed-unreachable legacy files in a separate commit; delete only after a final Pages check.

## Deletion gate

A file may be removed only when all conditions are true:

- It is unreachable in both dependency scans.
- It has no dynamic reference from a retained runtime.
- The replacement page has passed the deployed-page check.
- It is not the only recoverable copy of a source asset.
- The removal is committed separately from the visual refactor.
