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
