# Himart production backup

- `himart.html`: original production HTML before promotion
- `himart-narrative-v2-production.css`: original stylesheet
- `himart-narrative-v2-production-runtime.js`: original runtime

Shared static assets were not duplicated because the promoted page continues to reference the existing repository assets in place:
- `assets/himart_01.mp4`
- `fonts/Averta-PE-Thin.otf`
- `fonts/Averta-PE-Regular.otf`
- `favicon.svg`

Promotion source: `himart-system-test.html` (content SHA `ca453b73eedcbc9ba0de2960d39c97da923526aa`).
