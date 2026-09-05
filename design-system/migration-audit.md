# Himart Design System Migration Audit

기준 페이지: `himart.html`
테스트 페이지: `himart-system-test.html`

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
