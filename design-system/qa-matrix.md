# HIMART 시스템 테스트 QA 매트릭스

기준: `himart-system-test.html`  
운영 보호: `himart.html`은 최종 승인 전 수정하지 않음

## 정적 연결 점검

| 항목 | 기대값 | 현재 상태 |
|---|---|---|
| 운영 기준 스타일 | `himart-narrative-v2-production.css` 로드 | PASS |
| 시스템 진입점 | `design-system/index.css` 로드 | PASS |
| 로컬 Pretendard | `fonts/PretendardVariable.woff2` 선언 | PASS |
| 로컬 Averta PE | Thin/Regular/Bold OTF 선언 | PASS |
| 애니메이션 분리 | `design-system/animation.js` 외부 로드 | PASS |
| 콘텐츠 런타임 분리 | `content-runtime.js`, test loader/final 외부 로드 | PASS |
| 인라인 스크립트 | 실행 코드 없음 | PASS |
| 테스트 페이지 식별 | `himart-movie-page`, Movie Test title | PASS |
| 운영 파일 보호 | `himart.html` 변경 금지 | 유지 |

## 브라우저 확인이 필요한 항목

### PC

- Hero title이 가로 우선으로 유지되는지
- Chapter title이 2열 헤더 구조로 표시되는지
- 카드·미디어·Journey flow의 열 수와 높이가 기존 기준과 일치하는지
- 로컬 폰트 로드 후 줄바꿈이 안정적인지

### 모바일

- Hero title보다 본문 Chapter title이 과도하게 크지 않은지
- Chapter title이 1열로 스택되는지
- 카드와 미디어가 가로 스크롤 없이 단일 열로 내려오는지
- 하단 브라우저 UI를 제외하고 hero copy/meta가 잘리지 않는지

## 모션 확인

- `prefers-reduced-motion: reduce`에서 reveal/counter/hero scroll이 즉시 정적 상태로 전환되는지
- 일반 모드에서 reveal이 한 번만 실행되는지
- 동영상이 viewport 진입 시 재생되고 이탈 시 일시정지되는지

## 진행 규칙

1. 브라우저 시각 확인 전에는 레거시 블록을 대량 삭제하지 않는다.
2. 문제가 재현되면 해당 컴포넌트 소유 CSS 한 파일에서만 수정한다.
3. PC·모바일 기준이 확인된 뒤 selector 단위로 legacy 규칙을 제거한다.
4. 자간·행간·모션 속도는 구조와 폰트가 안정된 마지막 단계에서 조정한다.
5. 최종 승인 전 운영 페이지에는 적용하지 않는다.


## 최신 회귀 보완

- 동적 콘텐츠 삽입 이후에도 `animation.js`가 `.hm-reveal`·`.wide-rise-target`을 재검색하고 observer에 등록한다.
- reveal 대상은 최초 렌더 시점에 존재하지 않아도 최대 30초 동안 등록된다.
- 카운터는 동일 요소를 WeakSet으로 한 번만 실행한다.
- 페이지 캐시가 이전 버전을 제공하는 동안에는 브라우저 결과를 소스 기준 결과와 분리해 기록한다.


- 테스트 페이지 중복 inline lock 중 `himart-movie-lead-lock`을 제거했다. Hero·Chapter의 핵심 lock은 시각 기준 확인 전까지 유지한다.


## 최종 확인 기록 (2026-09-05)

- 새 캐시 로드 확인: `index.css?v=20260906-1`, `animation.js?v=20260906-3`, `test-content-final.js?v=20260905-2`.
- PC 1363×936: 로컬 폰트 로드 완료, Hero 82px, Chapter 52px, Chapter 헤더 2열.
- 스크롤 회귀: reveal 대상 24개 중 현재 viewport 진입 대상이 `is-visible`로 전환됨.
- 페이지 코드 오류/경고: 애플리케이션 오류 없음(브라우저 확장 메타데이터 오류 1건은 외부 확장).
- 모바일: ≤780px에서 1열 스택 및 Chapter 30–38px clamp 규칙을 소스에서 확인. 실제 모바일 viewport 캡처는 별도 디바이스 확인 필요.
- 운영 `himart.html`: 변경하지 않음. 현재 적용 판단은 **보류**이며, 모바일 직접 시각 확인 후 승인한다.


## 난수 애니메이션 회귀 확인 (2026-09-06)

- 히어로 타이틀: 새 페이지 진입 후 data-hm-scramble-runs=1, 재생 중 data-hm-scramble-active=true 확인
- 챕터 타이틀: 01 → 02 → 03 → 04 순서로 스크롤하며 각 요소에 data-hm-scramble-runs가 기록되는지 확인
- 종료 상태: active 속성 제거 및 원문 텍스트 복원 확인
- 중복 실행 방지: animation.js에서 난수 observer를 제거하고 scramble-final.js만 실행 주체로 유지
- 정적 구문: 두 모듈 node --check 통과
- 운영 보호: himart.html SHA 2e911968b521662e3a4493891b570cceaca8715a 유지


## Ways 디자인 시스템 회귀 확인 (2026-09-06)

- `himart-ways.html` 내부 `<style>` / `style=` / page-specific stylesheet가 없어야 한다.
- Hero는 Himart/ReUse와 동일한 `hm-ds-hero hm-ds-hero--scroll-cover` → `hm-ds-hero__inner` → `hm-ds-hero__copy` + `hm-ds-hero__bottom` → `hm-ds-hero__meta` 구조여야 한다.
- 01~04 모든 major section은 `hm-section hm-ds-section`, 모든 container는 `hm-wrap hm-ds-wrap`을 사용한다.
- 원칙/역할의 Roman list는 `hm-ds-numbered-list`만 사용하며 번호·타이틀 동일 라인, 설명 하단 규칙을 유지한다.
- AS-IS 4단계는 canonical segmented-bar 구조를 재사용하며 퍼센트 수치를 만들지 않는다.
- TO-BE 7단계는 canonical HOME horizontal-bar 구조를 process progression으로 재사용하며 `01/07~07/07`만 표시한다.
- `components/data-viz.css`는 `design-system/index.css`에서 한 번만 import되어야 한다.
- `animation.js`의 `[data-hm-chart]` observer는 graph reveal의 단일 owner여야 한다.
- Traffic SVG는 `viewBox=0 0 1160 330`, 기존 session/purchase/CVR 좌표를 유지하고 SVG 내부 새 font-family를 만들지 않는다.
- 모바일 780px 이하에서 numbered list·split ratio·ring row·flow가 단일 열로 내려가며 가로 overflow가 없어야 한다.
- GitHub Pages build 성공과 정적 구조 PASS를 확인한 뒤 브라우저 픽셀 검증을 별도 기록한다.


## Text integrity 회귀 확인 (2026-09-07)

- 모든 HTML/CSS/JS를 정적 스캔해 `text-overflow:ellipsis`가 없어야 한다.
- 숫자형 `line-clamp`가 없어야 하며 `unset/none`은 truncation 방지용으로만 허용한다.
- `scramble-final.js`에 description 길이 제한 또는 `slice(...)+…` 로직이 없어야 한다.
- Hero description은 desktop width token과 mobile width token을 사용하며 mobile은 container의 88%를 넘지 않는다.
- Hero와 모든 prose role은 `height:auto`, `max-height:none`, `overflow:visible`, `white-space:normal` 계약을 갖는다.
- 실제 media/chart의 clipping용 `overflow:hidden`은 허용하며 prose selector에는 사용하지 않는다.
- GitHub Pages build/deploy 성공을 확인한다.
