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


## 최신 라이브 기준 보정 (2026-09-04)

초기 분석에서 `himart.html`의 정적 DOM만 복제하면 과거 내러티브가 노출되는 문제가 확인되었습니다. 최신 화면은 다음 런타임 조합으로 생성됩니다.

- 기준 콘텐츠 Blob: `6824a76b15854f4608498951bd3f909373cc407b`
- 기준 변환: `himart-live-transform.js`
- 후속 refine: `himart-wide-content-v4.js`, `himart-wide-refine-v5/v6/v7/v8/v9/v12/v13/v14/v15.js`, `himart-production-refine-v16/v18.js`
- 최신 제목·섹션·카드·여정 모듈은 위 런타임에서 삽입 또는 교체됨

따라서 `himart-system-test.html`은 최신 런타임 기준 페이지를 먼저 고정한 뒤, 시각 회귀 검증을 거쳐 컴포넌트별로 신규 토큰 CSS에 단계적으로 이관합니다.

### 폰트 로딩 원인

기존 테스트는 Averta만 신규 CSS에 선언하고 Pretendard를 `local()`에만 의존해 환경에 따라 대체 글꼴이 사용될 수 있었습니다. 최신 기준 페이지는 저장소의 `typography.css`를 통해 Averta PE Thin/Regular/Bold를 직접 로드하며, 본문은 Pretendard 시스템 폴백을 사용합니다. 테스트 기준은 이 실제 경로를 유지합니다.
