# HIMART Design System v1.0 — Observed Baseline

기준 화면: `himart-system-test.html`  
기준 조합: `himart.html` + `himart-narrative-v2-production.css` + `himart-narrative-v2-production-runtime.js`  
작성 원칙: 현재 화면을 먼저 보존하고, 통합은 관측값 검증 후 진행한다. 원본 `himart.html`에는 적용하지 않는다.

## 1. Source of Truth

현재 화면은 정적 HTML만으로 완성되지 않는다.

1. HTML: 초기 구조와 레거시 텍스트
2. CSS: 여러 시기의 스타일이 하나의 번들로 결합됨
3. Runtime JS: 제목·본문·역할 카드 교체, observer, counter, reveal, scroll fade 실행
4. Assets: 로컬 Averta OTF, Pretendard CDN, Himart 영상·SVG

따라서 정적 HTML과 실행 후 DOM을 구분해 관리한다. 새 구조에서는 콘텐츠는 HTML, 스타일은 CSS, 동작은 JS가 소유한다.

## 2. Current Complexity Baseline

| 항목 | 관측값 |
|---|---:|
| CSS 규칙 | 약 1,921 |
| CSS `!important` | 약 3,802 |
| CSS 미디어쿼리 | 67 |
| CSS 색상 표현 | 113종 |
| HTML inline style | 43 |
| HTML style block | 6 |
| Runtime 함수 | 약 29 |
| Observer | 7 |
| Timer | 8 |
| innerHTML 교체 | 28 |

현재 CSS는 `style.css`, `typography.css`, `global-gnb.css`, `himart-case-v4.css`, 날짜별 patch, wide/final/verification 규칙이 결합된 historical bundle이다. 통합 전 원본별 역할 분리가 필요하다.

## 3. Observed Typography Tokens

### Font

- English: `Averta PE`
- Korean: `Pretendard`
- Averta local faces: Thin 300 / Regular 400 / Bold 700
- Pretendard: CDN import
- 100/200/500/600은 실제 face가 아니라 합성 굵기 가능성이 있으므로 정리 대상

### Desktop

| Token | Observed value | 사용 |
|---|---:|---|
| `type.hero` | 82px | Hero title |
| `type.section` | 42px | 장 제목 |
| `type.subsection` | 28px | 데이터·여정 제목 |
| `type.group` | 22px | 카드 그룹 제목 |
| `type.body` | 16px | 본문 |
| `type.note` | 12px | 출처·메타 |

### Mobile

- Display: `clamp(30px, 8.6vw, 35px)`
- Section: `clamp(29px, 8vw, 33px)`
- Subsection: `clamp(23px, 6.5vw, 26px)`
- Group: `clamp(20px, 5.6vw, 22px)`
- Body: `clamp(14px, 3.9vw, 16px)`
- Small: `clamp(12px, 3.35vw, 14px)`

## 4. Observed Color Tokens

### Background

- `bg.page`: #000
- `bg.section`: #050505
- Legacy light background: #f4f2ed (최신 검은 화면 기준에서는 사용 금지 후보)

### Accent

- `accent.blue`: #00A6ED
- `accent.blue-new`: #00B8DE
- `accent.green`: #00EDBD
- `accent.yellow`: #F3EB01
- `accent.red`: #FA481B

### Text and line opacity

- Primary: #fff / 1.0
- Emphasis: rgba(255,255,255,.80)
- Secondary: rgba(255,255,255,.60)
- Body: rgba(255,255,255,.50)
- Tertiary: rgba(255,255,255,.38)
- Line strong: rgba(255,255,255,.40)
- Line default: rgba(255,255,255,.24)
- Line weak: rgba(255,255,255,.14)
- Line faint: rgba(255,255,255,.10)

기존의 100/80/60/40/20/10 체계는 문서상 표현으로만 사용하고, 실제 화면 보존 단계에서는 .80/.60/.50/.38/.40/.24/.14/.10을 유지한다.

## 5. Observed Layout and Spacing

### Layout

- Hero canvas: `calc(100% - 80px)`, 최대 약 1360~1440px
- Editorial content: 약 1100~1280px
- Mobile horizontal inset: 약 18px
- Metadata bar height: 약 74px

### Spacing

| 역할 | Observed values |
|---|---|
| Micro | 14 / 18 / 20px |
| Component | 24 / 26 / 28 / 34 / 40px |
| Subsection | 50 / 74 / 100px |
| Section / Hero | 142 / 200px |

4px spacing scale는 최종 통합 후보이지 현재 화면의 원본 규칙이 아니다. 먼저 위 관측값으로 시각적 동등성을 검증한다.

## 6. Component Inventory

기존 계획에 다음 모듈을 추가한다.

- Hero Movie + Overlay + Copy + Meta
- Section Header
- Problem Definition Card
- Keyword Matrix
- Positive/Negative Keyword Split
- Brand Reality Stat Card
- Transition Touchpoint Synthesis
- Behavior Signal Card
- Chart / Data Visualization
- Journey Flow Node + Connector
- Role Definition Card
- Prototype Gallery
- Device Mockup
- Source Note
- Expandable Research Row
- Progress Navigator
- Footer Metadata

## 7. Motion Inventory

### CSS / visual

- Hero video autoplay
- Hero sticky and scroll fade
- Reveal / rise
- Hover transition
- Ring and chart drawing
- Sequential opacity changes

### Runtime

- Random glyph scramble
- Content replacement
- Counter
- IntersectionObserver reveal
- MutationObserver re-application
- Scroll progress
- Fallback restoration
- Delayed retry timers

통합 순서는 콘텐츠 교체 제거 → observer 통합 → animation-only JS 분리 → CSS transition 정리이다. 현재 단계에서 runtime lock을 단순 삭제하면 화면이 깨질 수 있으므로, 기능별 검증 후 제거한다.

## 8. Migration Rules

1. `himart.html`은 원본 기준으로 보존한다.
2. `himart-system-test.html`에서만 새 시스템을 검증한다.
3. 정적 콘텐츠와 런타임 교체 콘텐츠를 먼저 하나로 확정한다.
4. 관측 토큰과 통합 토큰을 별도 표기로 유지한다.
5. `!important`를 새로 추가하지 않는다.
6. 기존 `!important`는 selector 충돌 원인을 제거한 뒤 단계적으로 삭제한다.
7. CSS bundle을 foundation / components / page / motion으로 분리한다.
8. 폰트는 로컬 Averta와 Pretendard 로드 성공 여부를 별도로 검증한다.
9. 데스크톱·모바일 최종 적용값을 각각 검증한다.
10. 시각 비교 전에는 `himart.html`에 직접 반영하지 않는다.

## 9. Next Implementation Order

1. 최종 실행 DOM에서 desktop/mobile computed value 추출
2. 레거시 CSS와 최신 규칙 분리
3. 콘텐츠를 HTML로 이동할 목록 확정
4. foundation token 파일 적용
5. component CSS 적용
6. runtime을 animation-only 구조로 축소
7. 기존 화면과 pixel/section 비교
8. 승인 후 원본 적용 여부 결정

## 10. Separated File Map

정적 스타일은 `design-system/index.css`를 진입점으로 관리한다.

- `tokens.css`: 색상·타입·간격·레이아웃 변수
- `typography.css`: 폰트 로드와 타입 클래스
- `spacing.css`: 컨테이너·간격·라인
- `layout.css`: 페이지 공통 레이아웃
- `components/hero.css`: 영상 Hero와 메타
- `components/section.css`: 장·서브섹션 헤더
- `components/cards.css`: 통계·시그널·역할 카드
- `components/narrative.css`: 합성 블록·여정·프로토타입
- `motion.css`: 정적 transition과 reduced-motion
- `animation.js`: reveal·counter·scroll·video만 담당하며 콘텐츠와 CSS를 교체하지 않음

운영 페이지 연결 전, 각 컴포넌트를 기존 DOM에 매핑하고 시각 비교를 진행한다.


## 2026-09-04 분리 작업 상태

- 테스트 페이지는 `design-system/content-runtime.js`와 `design-system/animation.js`를 별도 로드한다.
- `content-runtime.js`는 기존 콘텐츠 치환·구조 보정만 담당하며 `IntersectionObserver`, `requestAnimationFrame`, 카운터/스크롤 애니메이션을 포함하지 않는다.
- `animation.js`는 reveal, counter, hero scroll, video viewport 재생만 담당한다. 기존 `data-count`도 호환한다.
- 운영 기준 파일 `himart.html` 및 기존 production CSS/runtime은 변경하지 않았다.
- 테스트 페이지에 남아 있는 인라인 legacy compatibility script는 콘텐츠 보정과 과거 잠금 규칙이 혼재되어 있으므로, 다음 단계에서 콘텐츠 HTML로 승격하거나 제거한다. 새 애니메이션 로직은 이 인라인 블록에 추가하지 않는다.
