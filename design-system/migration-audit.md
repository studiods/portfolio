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
| Font | 존재하지 않는 Averta local URL | font token | 에셋 업로드 후 경로 확정 |

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
- `responsive.css`: 타이포그래피를 재정의하지 않고 breakpoint 레이아웃만 담당
- `animation.js`: reveal·counter·hero scroll·video viewport만 담당

따라서 이후 반응형 조정은 컴포넌트 소유권을 먼저 확인한 뒤 해당 파일 하나에서만 수정한다.
