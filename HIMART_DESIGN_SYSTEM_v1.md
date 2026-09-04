# HIMART DESIGN SYSTEM REBUILD PLAN v1.0 — 실행 기준

## 기준과 불변 조건

- 원본 기준 파일: `himart.html`
- 원본 파일은 이 리팩토링에서 수정하지 않음
- 검증용 페이지: `himart-system-test.html`
- 신규 스타일시트: `himart-design-system.css`
- 기존 자산: `assets/himart_01.mp4`, Averta PE, Pretendard

## 실제 소스 분석

| 항목 | 확인값 |
|---|---|
| HTML 인라인 style | 46개 |
| HTML style 블록 | 8개 |
| HTML script 블록 | 6개 |
| 외부 CSS | `himart-narrative-v2-production.css` 약 320KB |
| 외부 runtime | `himart-narrative-v2-production-runtime.js` 약 26KB |
| 반복 컴포넌트 | hm-section, hm-subsection, hm-meta, data-card, proof-item, role-card, phone-card, flow-node |
| 충돌 원인 | final-overrides, verification-lock, hero-center 계열 선언이 동일 속성을 반복 선언 |

## 페이지 구조

```
PAGE
├─ Hero / hm-movie-hero
├─ Brand Problem / #brand
├─ Data Insight / #data
├─ UX Strategy / #journey
├─ Journey / flow-area, flow-node
├─ Prototype / #direction, media blocks
└─ Footer / hm-footer
```

## Token v1

Typography: Display 128, Heading XL 72, Heading L 48, Heading M 32, Body Large 20, Body 16, Caption 12. English는 Averta PE, Korean은 Pretendard.

Color: bg-primary #050505, bg-secondary #000, text opacity 100/80/60/40, Himart Blue #00A6ED, Himart Red #FA481B.

Spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px. Container max 1360px, desktop padding 40px. Line 0.5px/1px, opacity 10/20/40%.

## Component API

Hero(Video + Overlay + Copy + Meta), Section Header(Number + Title + Description), Narrative Block, Data Card, Role Card, Media Block.

## Motion

Fade, Rise(Y 40px/900ms), Stagger(100ms), Counter(1200ms), Scroll Transform(hero opacity/overlay).

## 검증 기준

- 작업 전후 원본 `himart.html` blob SHA 비교
- 테스트 페이지에서 인라인 style 및 legacy override 제거
- 토큰 기반 반응형(900px/600px)
- 신규 CSS는 원본 production CSS보다 현저히 작게 유지
