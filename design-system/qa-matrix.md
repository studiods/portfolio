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
