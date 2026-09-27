# Portfolio Mobile Design System v2.4

적용 기준: 포트폴리오 전체의 모바일(`max-width: 780px`). PC 규칙과 Desktop DOM/타입/레이아웃은 변경하지 않습니다.

## Typography hierarchy

모바일에서는 타이틀 계층이 반드시 아래 순서를 유지합니다.

- Hero: `--hm-type-hero-mobile: clamp(36px, 9.2vw, 44px)`
- Major section: `--hm-type-section-mobile: clamp(29px, 7.6vw, 34px)`
- Middle title: `--hm-type-subsection-mobile: clamp(24px, 6.2vw, 29px)`
- Group/Card title: `--hm-type-group-mobile: clamp(19px, 5vw, 22px)`
- Body: `--hm-type-body-mobile: 15px`
- Note/Label: `--hm-type-note-mobile: 11px`

모바일 본문·타이틀·캡션·푸터는 `word-break: keep-all`, `overflow-wrap: normal`, `line-break: strict`을 기준으로 사용합니다. 쉼표 자체를 임의의 줄바꿈 기준으로 사용하지 않고 가능한 한 단어 단위로 줄을 구성합니다.

## Mobile-only separator rendering

- 저장소의 authored copy는 변경하지 않습니다.
- `design-system/mobile-copy-runtime.js`가 모바일에서 보이는 `·`, `•`, `∙`, `ㆍ` separator만 `, `로 렌더링합니다.
- Desktop으로 복귀하면 원문을 정확히 복원합니다.
- gallery/counter처럼 runtime이 동적으로 교체한 텍스트도 MutationObserver로 다시 동기화합니다.
- scramble owner(`.js-scramble`, `.hm-scramble-char`)는 원문 복원 규칙과 충돌하지 않도록 변환 대상에서 제외합니다.
- 이 동작은 presentation layer이며 source HTML의 승인된 copy를 직접 수정하지 않습니다.

## Mobile canvas

- 기본 좌우 inset: `18px`
- Major section spacing은 공통 section token을 유지합니다.
- 긴 데이터 그래프는 원본 비율을 유지하고 필요한 경우에만 내부 horizontal pan을 허용합니다.

## Circular flow / tablet / capsule rule

원형 노드와 이를 감싸는 tablet/capsule 계열은 모바일에서 가로 압축하지 않습니다.

- 전체 흐름은 세로 방향으로 전환합니다.
- 원형 node는 `1:1`, `border-radius: 50%`를 유지합니다.
- 원형 기준 크기는 `--hm-mobile-circle-size`를 사용합니다.
- 원형 내부 number/title/body는 viewport가 아니라 원형 자체의 container width(`cqi`)를 기준으로 비례 축소합니다.
- 공통 대상에는 Himart Journey, Reuse confidence/proof circles, AIMMO ownership/repeat flow, StepUp reframe/habit flow가 포함됩니다.
- 좌우 화살표는 모바일에서 아래 방향을 향하도록 세로 방향으로 전환합니다.
- tablet/capsule 내부 node도 세로로 쌓습니다.
- tablet/capsule의 설명 label은 border 중앙이나 좌우가 아니라 항상 capsule의 맨 위 중앙에 배치합니다.
- Desktop의 원형 크기, 타입 크기, 화살표 방향, capsule 구조는 변경하지 않습니다.

## Gallery mobile composition

### Work Archive

모든 Work Archive gallery는 모바일에서 예외 없이 아래 순서를 사용합니다.

1. Project title
2. Gallery media
3. Gallery/source copy

- custom-image gallery도 예외를 두지 않습니다.
- Desktop에서는 기존 overlay composition을 그대로 유지합니다.
- 모바일 media 높이는 각 source image의 실제 비율을 유지합니다.
- gallery navigation arrow와 status는 media 영역 안에서만 렌더링합니다.
- source raster에 포함된 텍스트를 보완하기 위해 project description이 존재하면 모바일 하단 copy 영역에서 사용할 수 있습니다. PC overlay 정책은 유지합니다.

### Reuse / shared galleries

- 모바일 gallery copy는 기존 design-system의 below-media 규칙을 유지합니다.
- Reuse 4:3 gallery arrow hit area는 media 높이(`75cqw`) 안에서만 동작합니다.
- Reuse 16:9 gallery arrow hit area는 media 높이(`56.25cqw`) 안에서만 동작합니다.
- arrow glyph는 항상 해당 image/media plane의 상하 중앙에 위치합니다.
- gallery 아래 copy 영역의 높이가 커져도 arrow가 copy 영역으로 내려가지 않습니다.

## Mobile footer rule

모바일에서 모든 footer 텍스트는 좌측 정렬을 기준으로 합니다.

- Home / About / Works / Contact의 `.portfolio-footer`는 단일 column으로 전환하고 좌측 정렬합니다.
- Project detail의 `.hm-project-footer`는 PREVIOUS / NEXT를 세로 stack으로 전환합니다.
- NEXT도 오른쪽 정렬이나 reverse row를 사용하지 않고 왼쪽 arrow + 왼쪽 text 구조를 사용합니다.
- footer title/name은 좁은 `vw/ch` max-width로 강제하지 않고 전체 available width에서 단어 단위로 자연스럽게 줄바꿈합니다.
- legacy/simple `.hm-footer`, StepUp footer도 동일한 좌측 정렬 규칙을 따릅니다.

## Ownership / cascade

- Foundation token: `tokens.css`
- Canonical mobile CSS authority: `mobile-system.css`
- Mobile-only separator runtime: `mobile-copy-runtime.js`
- Global runtime bootstrap: `navigation.js`
- Work Archive DOM relocation: `work-archive-mobile-stack.js`
- Work Archive source/caption state: `work-archive.js`
- Legacy page specificity bridge는 기존 파일을 유지하되 최종 mobile authority와 충돌해서는 안 됩니다.

페이지별 임시 모바일 `<style>`을 새로 추가하지 않습니다. 공통 circle/gallery/footer/wrapping 규칙은 `mobile-system.css`에서 관리하고, DOM 이동이나 문자 렌더링처럼 CSS로 처리할 수 없는 책임만 공통 runtime으로 분리합니다.

## Regression gate

모바일 시스템 변경 시 아래를 함께 확인합니다.

1. Desktop(>780px) computed layout과 copy가 변경되지 않았는지
2. Work Archive의 title → media → copy 순서
3. Reuse 4:3 / 16:9 gallery arrow가 copy 영역이 아니라 image 안에 있는지
4. Himart / Reuse / AIMMO / StepUp 원형 흐름이 세로이고 화살표가 아래 방향인지
5. capsule/tablet label이 최상단에 있는지
6. circle text가 작은 화면에서 cqi 기준으로 함께 축소되는지
7. top-level / detail footer가 모두 좌측 정렬과 단어 단위 wrapping을 사용하는지
8. Desktop 복귀 시 mobile separator가 authored `·` 원문으로 복원되는지
