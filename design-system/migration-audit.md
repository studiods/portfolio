# Himart Design System Migration Audit

기준 페이지: `himart.html`
과거 테스트 페이지: `himart-system-test.html` (현재 검증 기준은 `himart.html`)

## 현재 연결 구조

- 운영 스타일: `himart-narrative-v2-production.css`
- 토큰 진입점: `design-system/index.css`
- 콘텐츠 레이어: `design-system/content-runtime.js`, `test-content-loader.js`, `test-content-final.js`
- 애니메이션 레이어: `design-system/animation.js`

## 우선순위 충돌

| 영역 | legacy 규칙 | 시스템 규칙 | 처리 방향 |
|---|---|---|---|
| Chapter title | 52px 고정, 고특이도 선택자 | 반응형 clamp | 정적 HTML 승격 후 legacy 제거 |
| Section header | 다수의 grid/width override | 1열·2열 토큰 레이아웃 | 컴포넌트 CSS로 통합 |
| Card | section별 개별 카드 규칙 | 공통 card foundation | 시각 차이 확인 후 공통화 |
| Hero | movie/production lock 혼재 | hero component | 운영 페이지와 분리 검증 |
| Font | legacy 규칙과 신규 local font 혼재 | `typography.css`의 local font token | 브라우저 computed font 확인 후 legacy fallback 정리 |

## 제거 후보

- `final-overrides`, `final-v2`, `verification-lock`, `hero-center-final` 계열 중복 선언
- 테스트 페이지의 콘텐츠 보정 스크립트 3종
- 동일 선택자에 반복되는 `!important` 타이포그래피 잠금
- 사용되지 않는 pseudo-title 생성 규칙

## 다음 안전한 순서

1. 에셋 업로드 후 폰트 경로 검증
2. 렌더링 기준으로 Chapter title과 Section header의 computed 값 기록
3. 중복 규칙을 한 번에 삭제하지 않고 selector 단위로 대체
4. 데스크톱/모바일 비교 후 각 단계 커밋
5. 운영 `himart.html`에는 최종 승인 전 적용하지 않음


## 정량 감사 결과

- production CSS 크기: 약 320KB
- CSS 블록: 1,853개
- `!important`: 3,802개
- `@media`: 67개
- `@keyframes`: 1개
- 고유 HEX 색상: 22개
- 중복 선택자 상위: `.hm-title` 6회, `.hm-section-title` 5회, `.role-grid` 4회, `.direction-card` 4회

이 수치는 현재 화면이 깨지는 원인을 단순한 모바일 규칙 하나가 아니라, 동일 컴포넌트에 누적된 우선순위 잠금으로 봐야 한다는 근거다. 따라서 다음 정리에서는 선택자 삭제보다 먼저 컴포넌트별 최종 규칙을 지정하고, 그 규칙으로 대체한 뒤 legacy 블록을 제거한다.

## 현재 적용 단계

- `design-system/components/chapter.css`를 챕터 타이틀의 단일 정적 규칙으로 등록했다.
- `himart-system-test.html`에서는 이 파일을 기존 inline/legacy 스타일 뒤에 마지막으로 로드해 PC 2열, 모바일 1열 및 타이틀 clamp를 소유하도록 했다.
- 운영 `himart.html`은 변경하지 않았다. 다음 검증 지점은 실제 PC·모바일 브라우저에서 computed style과 줄바꿈을 대조하는 것이다.

## 소유권 정리

- `components/hero.css`: Hero 타이포그래피와 메타 레이아웃
- `components/chapter.css`: 본문 Chapter 타이틀의 크기·줄바꿈·PC/모바일 구조
- `components/media.css`: Prototype/Media grid·card·frame·caption
- `components/flow.css`: Journey flow의 그룹·노드·라벨·반응형 구조
- `responsive.css`: 타이포그래피를 재정의하지 않고 breakpoint 레이아웃만 담당
- `animation.js`: reveal·counter·hero scroll·video viewport만 담당

따라서 이후 반응형 조정은 컴포넌트 소유권을 먼저 확인한 뒤 해당 파일 하나에서만 수정한다.

- `components/cards.css`: Data/Narrative/Role 카드의 공통 border·padding·text foundation을 transitional mapping으로 등록

상세 컴포넌트 계약과 변경 규칙은 `design-system/README.md`에 고정했다.


## Legacy 정리 매트릭스

| Legacy 영역 | 현재 중복 신호 | 대체 소유자 | 제거 조건 |
|---|---|---|---|
| Chapter title lock | `.hm-section-title` 반복 선언·고특이도 `!important` | `components/chapter.css` | PC/모바일 computed 값 대조 완료 |
| Section header grid | `.hm-section-head`의 폭·grid 반복 | `components/chapter.css` + `section.css` | 줄바꿈·간격 대조 완료 |
| Data/Role cards | `.data-card`, `.role-card`, `.signal-item` 개별 선언 | `components/cards.css` | 카드 높이·라인·본문 명도 대조 완료 |
| Prototype media | `.phone-gallery`, `.phone-card` 개별 선언 | `components/media.css` | 이미지/영상 asset 연결 후 대조 |
| Journey flow | `.flow-row`, `.flow-node` 반복 선언 | `components/flow.css` | 단계 순서·모바일 스택 대조 |
| Runtime locks | 콘텐츠 재주입·observer·style lock | `content-runtime.js` + `animation.js` | 콘텐츠/모션 독립 실행 확인 |

삭제는 위 조건 충족 후 legacy 파일의 블록 단위가 아니라 selector 단위로 진행한다.


## 폰트 자산 연결 상태

- `fonts/Averta-PE-Thin.otf`, `Averta-PE-Regular.otf`, `Averta-PE-Bold.otf` 확인
- `fonts/PretendardVariable.woff2` 확인
- `typography.css`는 CDN 대신 로컬 폰트 파일을 우선 로드
- 정적 QA 체크리스트: `design-system/qa-matrix.md`
- PC computed 확인: chapter header가 시스템 grid 규칙으로 연결됨
- 현재 남은 확인 게이트: 모바일 브라우저 computed style 및 전체 시각 비교


## 런타임 정리 결과

- `test-content-final.js`의 중복 텍스트 보정 IIFE 2개를 제거하고 단일 reconciliation 레이어로 통합했다.
- 레이아웃 보정은 CSS 소유권으로 유지하고, 애니메이션은 `animation.js`에 남겼다.
- 다음 검증 게이트는 일반 모션과 reduced-motion에서 동일 콘텐츠가 중복 생성되지 않는지 확인하는 것이다.


## 1~3번 진행 기록

- 레거시 런타임 style lock을 `compatibility.css`로 이동해 스타일 소유권을 CSS로 통합했다.
- `test-content-final.js`는 단일 콘텐츠 reconciliation 레이어로 유지하고 동적 style 삽입을 제거했다.
- 소스 기준 애니메이션 회귀 항목(reveal/counter/hero/video/reduced-motion)을 점검했다.
- GitHub Pages CDN 반영 시점 차이로 브라우저에서 이전 캐시가 보일 수 있어, 최종 배포 후 동일 항목을 재확인한다.


- 애니메이션 레이어가 `.hm-reveal`·`.wide-rise-target` 클래스 기반 콘텐츠도 초기화 대상으로 포함하도록 보완했다.
- 콘텐츠가 런타임에 삽입되는 경우에도 해당 클래스가 boot 조건으로 인식되도록 수정했다.


- 좁은 모바일 폭(≤780px)에서 Chapter title을 `clamp(30px, 6.8vw, 38px)`로 제한해 Hero title과의 위계를 유지하도록 조정했다.
- 해당 수치는 로컬 폰트 로드 후 최종 PC·모바일 비교에서 재확정한다.


## 최종 PC·모바일 비교 및 운영 적용 판단 (2026-09-05)

- 새 캐시로 테스트 페이지를 재확인했다: `animation.js?v=20260906-3`, `test-content-final.js?v=20260905-2`, `index.css?v=20260906-1`.
- PC 기본 뷰포트(1363×936)에서 로컬 폰트 상태는 `loaded`, Hero title은 82px/1.04, Chapter title은 52px/1.12 수준으로 확인됐다.
- Chapter 헤더는 PC에서 시스템 CSS의 2열 규칙으로 연결됐고, 스크롤 후 reveal 대상 2개가 정상적으로 `is-visible` 상태가 됐다. 콘솔에는 페이지 코드 오류가 없었다.
- 모바일용 `≤780px` 규칙은 Chapter title을 `clamp(30px, 6.8vw, 38px)`로 제한하고 1열 헤더로 전환한다. 다만 현재 브라우저 세션에서 실제 모바일 뷰포트 렌더링을 직접 캡처할 수 없어, 모바일은 소스·반응형 규칙 기준으로만 확인했다.
- 운영 `himart.html` blob SHA는 `2e911968b521662e3a4493891b570cceaca8715a`로 유지됐다. 테스트 결과와 모바일 직접 시각 확인이 모두 충족되기 전까지 운영 파일에는 적용하지 않는다.
- 현재 판단: **운영 적용 보류**. 테스트 페이지를 기준본으로 유지하고, 실제 모바일 디바이스/에뮬레이터에서 Chapter title 위계와 hero 하단 잘림을 한 번 더 확인한 뒤 운영 반영 여부를 결정한다.


## 캐시·운영 보호 재확인

- 테스트 페이지 blob SHA: `c594a1f07afd97e1658479463bf9baf2fee3a8b2`
- 애니메이션 모듈 blob SHA: `206ef03eb7c5fd747f338cb7974042c129b84696` (동적 reveal 등록 포함)
- 테스트 HTML에는 기존 `himart-movie-lead-lock` 및 `himart-movie-request-lock` 잔여 스크립트가 없다.
- 운영 `himart.html` blob SHA: `2e911968b521662e3a4493891b570cceaca8715a` (변경 없음)


## 난수 애니메이션 전체 코드 리뷰 및 회귀 검증 (2026-09-06)

- 원인: animation.js와 별도 난수 모듈이 동시에 타이틀 텍스트를 감시해 DOM 교체 시점에 observer가 끊기거나 실행 상태가 서로 덮어쓰일 수 있었다.
- 조치: 난수 애니메이션 소유권을 design-system/scramble-final.js 단일 모듈로 고정하고, animation.js에서는 관련 observer·WeakSet·스크롤 스캔을 제거했다.
- 실행 기준: 히어로 타이틀은 콘텐츠가 주입되는 즉시/재시도 구간에서 1회 실행하고, 01~04 챕터 타이틀은 실제 viewport 진입 전환을 직접 계산해 실행한다. 콘텐츠가 같은 요소에서 바뀌어도 텍스트 signature를 비교해 다시 실행한다.
- 검증 마커: 실행 중 data-hm-scramble-active="true", 누적 횟수 data-hm-scramble-runs를 기록하고 종료 후 원문을 복원한다.
- 브라우저 검증: 새 캐시 URL himart-system-test.html?cache=full-review-20260906-5에서 히어로 실행 횟수 1회, 실행 중 active=true, 종료 후 원문 복원 확인. 01~04를 순차 스크롤해 각 타이틀의 실행 횟수 1회 이상 확인.
- 정적 검증: 배포된 animation.js, scramble-final.js 모두 node --check 통과. 애플리케이션 콘솔 오류 없음(브라우저 확장 메타데이터 오류는 페이지 코드와 무관).
- 운영 himart.html은 SHA 2e911968b521662e3a4493891b570cceaca8715a로 유지되며 변경하지 않았다.


## 디자인 시스템 소스 소유권 및 파일 구조 정리 (2026-09-24)

- 최신 main 기준 200개 HTML/CSS/JS 소스를 조사하고 19개 HTML의 직접 참조, CSS @import 및 transitive consumer를 추적했다.
- 한 페이지만 사용하는 40여 개 stylesheet를 design-system/pages/<slug>/로 이동했다. 공통으로 소비되는 스타일은 design-system/components/에 남기고 HTML link 순서와 query/cache suffix를 보존했다.
- Himart Ways의 components/himart-ways.css는 이미 v2~v16 레이어를 통합한 canonical stylesheet였다. 미참조 중복 v2, v3, v5, v7~v15 및 himart-ways-title-owner.css를 제거했다.
- components/himart-ways-v4.css는 Ways 페이지가 아니라 Yanolja System에서만 참조되어 pages/yanolja-system/operating-model.css로 옮겼다.
- components/himart-ax.css 공유 기반은 유지했다. Himart AX HTML에서 연속으로 로드되던 페이지 전용 v2~v7 CSS 6개는 원래 순서 그대로 이어붙여 pages/himart-ax/himart-ax.css 한 파일로 통합하고 기존 6개 참조를 하나로 대체했다.
- About/Ways의 텍스트 포함 런타임을 페이지 폴더로 이동하고 Content Lock에 명시적 경로 별칭을 추가했다.
- AIMMO System/Graphic 등 여러 활성 레이어가 쌓인 페이지는 각 페이지 폴더로 이동하되 HTML 선언 순서를 보존했다. computed/시각 회귀를 검증할 수 없는 레이어는 이번에 합치거나 재배치하지 않았다.
- HTML의 사용자 노출 문구, 이미지, 영상은 변경하지 않았다. 상대 @import가 있는 Himart CSS는 새 디렉터리 깊이에 맞춰 import 경로만 보정했다.

### 이동 경로 기록

| 기존 경로 | 기준 경로 |
|---|---|
| `design-system/components/aimmo-graphic-v2.css` | `design-system/pages/aimmo-graphic/aimmo-graphic-v2.css` |
| `design-system/components/aimmo-graphic-blue.css` | `design-system/pages/aimmo-graphic/aimmo-graphic-blue.css` |
| `design-system/components/aimmo-graphic.css` | `design-system/pages/aimmo-graphic/aimmo-graphic.css` |
| `design-system/components/aimmo-system-v8.css` | `design-system/pages/aimmo-system/aimmo-system-v8.css` |
| `design-system/components/aimmo-reference-bars-exact.css` | `design-system/pages/aimmo-system/aimmo-reference-bars-exact.css` |
| `design-system/components/aimmo-system-final.css` | `design-system/pages/aimmo-system/aimmo-system-final.css` |
| `design-system/components/aimmo-system-v7.css` | `design-system/pages/aimmo-system/aimmo-system-v7.css` |
| `design-system/components/aimmo-ownership-journey.css` | `design-system/pages/aimmo-system/aimmo-ownership-journey.css` |
| `design-system/components/aimmo-system-v6.css` | `design-system/pages/aimmo-system/aimmo-system-v6.css` |
| `design-system/components/aimmo-system-v5.css` | `design-system/pages/aimmo-system/aimmo-system-v5.css` |
| `design-system/components/aimmo-system-v4.css` | `design-system/pages/aimmo-system/aimmo-system-v4.css` |
| `design-system/components/aimmo-system-v2.css` | `design-system/pages/aimmo-system/aimmo-system-v2.css` |
| `design-system/components/aimmo-system.css` | `design-system/pages/aimmo-system/aimmo-system.css` |
| `design-system/components/contact.css` | `design-system/pages/contact/contact.css` |
| `design-system/components/reuse-gallery-interaction.css` | `design-system/pages/himart-reuse/reuse-gallery-interaction.css` |
| `design-system/components/reuse-image-display-grid.css` | `design-system/pages/himart-reuse/reuse-image-display-grid.css` |
| `design-system/components/reuse-reference-bars.css` | `design-system/pages/himart-reuse/reuse-reference-bars.css` |
| `design-system/components/reuse-proof-motion.css` | `design-system/pages/himart-reuse/reuse-proof-motion.css` |
| `design-system/components/himart-team-gallery.css` | `design-system/pages/himart-team/himart-team-gallery.css` |
| `design-system/components/himart-production-state.css` | `design-system/pages/himart/himart-production-state.css` |
| `design-system/components/reuse-prototype-cases.css` | `design-system/pages/himart/reuse-prototype-cases.css` |
| `design-system/components/himart-appliance-purchase-flow.css` | `design-system/pages/himart/himart-appliance-purchase-flow.css` |
| `design-system/components/himart-direction-implementation.css` | `design-system/pages/himart/himart-direction-implementation.css` |
| `design-system/components/himart-fluid-responsive-guard.css` | `design-system/pages/himart/himart-fluid-responsive-guard.css` |
| `design-system/components/himart-fluid-content.css` | `design-system/pages/himart/himart-fluid-content.css` |
| `design-system/components/himart-commerce.css` | `design-system/pages/himart/himart-commerce.css` |
| `design-system/components/home-layout-system.css` | `design-system/pages/home/home-layout-system.css` |
| `design-system/components/nbt-stepup.css` | `design-system/pages/nbt-stepup/nbt-stepup.css` |
| `design-system/components/stepup-editorial-layout.css` | `design-system/pages/nbt-stepup/stepup-editorial-layout.css` |
| `design-system/components/trenbe-ut.css` | `design-system/pages/trenbe-ut/trenbe-ut.css` |
| `design-system/components/work-archive-mobile-stack.css` | `design-system/pages/work-archive/work-archive-mobile-stack.css` |
| `design-system/components/work-archive-trenbe.css` | `design-system/pages/work-archive/work-archive-trenbe.css` |
| `design-system/components/work-archive-menu-adaptive.css` | `design-system/pages/work-archive/work-archive-menu-adaptive.css` |
| `design-system/components/work-archive.css` | `design-system/pages/work-archive/work-archive.css` |
| `design-system/components/works-archive.css` | `design-system/pages/works/works-archive.css` |
| `design-system/components/works-aimmo.css` | `design-system/pages/works/works-aimmo.css` |
| `design-system/components/yanolja-system.css` | `design-system/pages/yanolja-system/yanolja-system.css` |
| `design-system/components/yanolja-system-base.css` | `design-system/pages/yanolja-system/yanolja-system-base.css` |
| `design-system/pages/case-framework-guide.css` | `design-system/pages/himart-case-framework-guide/case-framework-guide.css` |
| `design-system/components/himart-ways-v4.css` | `design-system/pages/yanolja-system/operating-model.css` |
| `design-system/components/himart-ways.css` | `design-system/pages/himart-ways/himart-ways.css` |
