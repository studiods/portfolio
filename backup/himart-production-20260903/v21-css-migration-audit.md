# HIMART v21 CSS Migration Audit

## Source
- himart-narrative-v2-production.css

## Migration status

Extracting production CSS into a simplified runtime-independent structure.

## Preserve layers
- typography
- global layout
- section structure
- journey flow
- direction components
- motion related rules
- responsive rules

## Remove candidates
- legacy refine overrides
- wide test page compatibility selectors
- rollback compatibility patches
- duplicated !important overrides

## Current finding
The production bundle contains accumulated CSS layers from previous iterations. The migration will extract only selectors required by the final himart.html structure.
