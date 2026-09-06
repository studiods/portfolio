# HIMART Mobile Design System v1.2

적용 기준: `himart.html`, `himart-reuse.html`, `himart-ways.html`의 모바일(`max-width: 780px`). PC 규칙은 변경하지 않습니다.

## Typography hierarchy

모바일에서는 타이틀 계층이 반드시 아래 순서를 유지합니다.

- Hero: `--hm-type-hero-mobile: clamp(36px, 9.2vw, 44px)`
- Major section: `--hm-type-section-mobile: clamp(28px, 7.4vw, 34px)`
- Middle title: `--hm-type-subsection-mobile: clamp(24px, 6.2vw, 29px)`
- Group/Card title: `--hm-type-group-mobile: clamp(19px, 5vw, 23px)`
- Body: `--hm-type-body-mobile: 15px`
- Note/Label: `--hm-type-note-mobile: 11px`

Hero가 항상 가장 크고, 그 아래 계층의 타이틀은 Hero보다 작아야 합니다. `himart-system.css`의 마지막 mobile authority block이 legacy wide-page 규칙보다 높은 specificity로 이 계층을 최종 고정합니다.

## Mobile canvas

- 좌우 inset: `18px`
- Major section spacing: 기존 공통 section token 유지
  - top `120px`
  - bottom `80px`
  - 마지막 Major section bottom `120px`

## Hero metadata rail

Hero 하단의 ROLE / FOCUS / SCOPE / TEAM(또는 TOOLS)은 모든 Case에서 동일한 2 × 2 grid를 사용합니다.

- `grid-template-columns: minmax(0,1fr) minmax(0,1fr)`
- 각 cell 최소 높이 `88px`
- cell 내부는 세로 중앙정렬이 아니라 `justify-content:flex-start`
- 모든 label/value는 각 row의 동일한 top line에서 시작
- 2번째 row에만 공통 horizontal divider 적용
- label/value는 모두 mobile note token `11px` 사용
- 오른쪽 column은 `12px` inset을 사용하고 왼쪽 column은 canvas line에 맞춤

## Circular journey / tablet rule

Journey에서 원형 노드와 이를 감싸는 tablet/capsule 구조는 모바일에서 가로로 압축하지 않습니다.

- 전체 흐름은 세로 방향으로 전환
- 원형 node는 `1:1`, `border-radius: 50%` 유지
- 원형 크기: `--hm-mobile-circle-size: clamp(168px, 50vw, 200px)`
- tablet/capsule: `--hm-mobile-tablet-width: min(100%, 320px)`
- tablet radius: `999px`로 감싸는 구조 유지
- 내부 arrow는 90도 회전해 세로 흐름으로 연결
- 원형 내부 제목·본문·label은 container query unit(`cqi`)을 사용해 원형 크기에 맞춰 비례 축소
- 원형 자체 padding은 viewport 기반 `clamp()`로 제한해 작은 화면에서도 텍스트 공간을 확보
- font family / weight / tracking은 기존 디자인 시스템 token을 유지

## Ownership / cascade

- Foundation token: `tokens.css`
- Hero component: `components/hero.css`
- Canonical mobile component rules: `mobile-system.css`
- Legacy journey specificity bridge: `mobile-locks.css`
- Final mobile authority: `himart-system.css`의 마지막 `@media(max-width:780px)` block
- Static entry point: `index.css`

페이지별 임시 `<style>`이나 개별 모바일 override는 추가하지 않습니다. 모바일 수정은 공통 디자인 시스템에서만 진행합니다.
