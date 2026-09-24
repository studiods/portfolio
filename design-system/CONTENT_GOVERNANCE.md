# CONTENT GOVERNANCE — HARD LOCK

## 목적
포트폴리오 문구는 사용자가 작성하고 승인하는 경력·역할·판단의 기록이다. 디자인 개선이나 코드 작업을 이유로 AI/자동화가 카피를 임의로 “개선”하는 것을 금지한다. 이 규칙은 production 페이지와 production runtime의 콘텐츠에 최우선으로 적용한다.

## 기본 상태
다음 텍스트는 별도 승인 전까지 모두 LOCKED다.

- Hero / chapter / subsection / card title
- 본문, 설명, 캡션, Project Reflection
- 버튼·링크·메뉴·라벨·상태 문구
- 회사명, 기간, 역할, 프로젝트명
- 숫자, %, 성과 수치, SOURCE 문구
- 의미를 전달하는 `alt`, `aria-label`, `title`, `placeholder`
- HTML뿐 아니라 JS runtime, registry, fallback, template literal이 화면에 주입하는 텍스트
- Work Archive의 `title`, `desc`, `company`, `period`, `note`
- `<br>`과 사용자가 의도한 문장 분리

## 명시적 승인으로 인정하는 요청
현재 사용자 메시지에 “문구 변경”, “텍스트 수정”, “카피 축약/확장”, “번역”, “문장을 정리”, “리서치해서 내용 보강”, “더미 카피 작성”, “내러티브 재작성”처럼 텍스트 작업이 직접 지시된 경우에만 해당 범위의 copy를 수정할 수 있다.

레이아웃·CSS·모바일·이미지·영상·갤러리·그래프·애니메이션·성능·접근성·캐시·파일 작업은 카피 수정 권한이 아니다.

## 범위 제한
사용자가 한 문장을 바꾸라고 했으면 한 문장만 바꾼다. 한 섹션을 지정했으면 그 섹션만 바꾼다.

금지:
- 인접 문장을 함께 매끄럽게 다듬기
- 같은 페이지의 어조를 임의 통일하기
- 맞춤법·띄어쓰기·문장부호를 자동 교정하기
- 더 Senior/Lead답게 보이도록 표현 강화하기
- 이미지 내용을 추론해 의도·성과·캡션을 추가하기
- 사실에 원인·효과를 임의 추가하기
- 수치를 반올림하거나 다른 표현으로 바꾸기

## 원문 우선
사용자가 정확한 문구를 제공하면 그것이 canonical copy다. 오탈자처럼 보여도 그대로 유지한다. 띄어쓰기·문장부호·따옴표·대소문자와 지정 줄바꿈을 유지한다. 개선안은 제안할 수 있지만 승인 없이 source를 변경하지 않는다.

## 디자인 문제는 디자인으로 해결
텍스트가 길어 깨질 경우 container/grid/gap → type scale/line-height/tracking → wrapping → breakpoint 순으로 해결한다. 그래도 copy 수정이 필요하면 먼저 사용자 승인을 받는다.

## Runtime single-source rule
page-authored text를 source of truth로 둔다. runtime은 이동·복원할 수 있지만 다른 문장으로 치환하지 않는다. fallback이 필요하면 canonical copy와 문자 단위로 동일하게 유지한다. 같은 책임의 후속 수정은 새 버전 파일을 만들지 않고 기존 기준 runtime을 수정한다. 텍스트를 포함한 runtime 파일을 이동할 때는 이동 자체가 copy 변경 승인이 되지 않으며, scripts/content-lock.mjs에 이전 경로와 새 경로를 같은 snapshot identity로 연결해 실제 문구가 유지되는지 검사한다.

## 승인 커밋
승인된 copy 변경 커밋에만 `[copy-approved]`를 사용한다. 사용자가 해당 요청에서 카피 변경을 명시적으로 허용하지 않았다면 에이전트가 이 마커를 붙이는 행위를 금지한다.

## 자동 검사
`scripts/content-lock.mjs`는 Git commit 단위로 production HTML과 실제 production runtime의 텍스트 snapshot을 비교한다.

- HTML visible text와 `alt / aria-label / title / placeholder`
- JS의 한국어 문자열
- JS의 `title / desc / copy / label / caption / heading / headline / company / period / note / reflection` 계열 콘텐츠 문자열
- `<br>` 및 문자열 줄바꿈

위 값이 바뀐 commit은 반드시 해당 commit message에 `[copy-approved]`가 있어야 한다. GitHub Actions `.github/workflows/content-lock.yml`이 push/PR마다 범위 내 모든 commit을 검사한다.

## 종료 체크리스트
1. 현재 요청에 텍스트 변경 권한이 있는가?
2. 변경 범위를 넘는 visible copy diff가 0인가?
3. runtime/fallback copy도 유지되는가?
4. Content Lock이 PASS인가?
5. 승인되지 않은 copy drift가 있으면 원문으로 복원했는가?

하나라도 만족하지 않으면 완료로 보고하지 않는다.
