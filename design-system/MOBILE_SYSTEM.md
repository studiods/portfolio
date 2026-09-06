# HIMART Mobile Design System v1.0

적용 기준: `himart.html`, `himart-reuse.html`, `himart-ways.html`의 모바일(`max-width: 780px`). PC 규칙은 변경하지 않습니다.

## Typography hierarchy

모바일에서는 타이틀 계층이 반드시 아래 순서를 유지합니다.

- Hero: `--hm-type-hero-mobile: clamp(36px, 9.5vw, 46px)`
- Major section: `--hm-type-section-mobile: clamp(30px, 7.6vw, 36px)`
- Middle title: `--hm-type-subsection-mobile: clamp(26px, 6.4vw, 31px)`
- Group/Card title: `--hm-type-group-mobile: clamp(20px, 5.2vw, 24px)`
- Body: `--hm-type-body-mobile: 15px`
- Note/Label: `--hm-type-note-mobile: 11px`

Hero가 항상 가장 크고, 그 아래 계층의 타이틀은 Hero보다 작아야 합니다. 한글 타이틀은 Pretendard Thin 계층과 기존 tracking token을 그대로 사용합니다.

## Mobile canvas

- 좌우 inset: `18px`
- Major section spacing: 기존 공통 section token 유지
  - top `120px`
  - bottom `80px`
  - 마지막 Major section bottom `120px`
- Hero bottom metadata: 기존 2 x 2 모바일 구조 유지

## Circular journey / tablet rule

Journey에서 원형 노드와 이를 감싸는 tablet/capsule 구조는 모바일에서 가로로 압축하지 않습니다.

- 전체 흐름은 세로 방향으로 전환
- 원형 node는 `1:1`, `border-radius: 50%` 유지
- 원형 크기: `--hm-mobile-circle-size: clamp(136px, 42vw, 164px)`
- tablet/capsule: `--hm-mobile-tablet-width: min(100%, 320px)`
- tablet radius: `999px`로 감싸는 구조 유지
- 내부 arrow는 90도 회전해 세로 흐름으로 연결
- 원형 내부 텍스트는 container query unit(`cqi`)을 사용해 원형 크기에 맞춰 비례 축소
- font family / weight / tracking은 기존 디자인 시스템 token을 유지

## Ownership

- Foundation token: `tokens.css`
- Canonical mobile rules: `mobile-system.css`
- Legacy production specificity bridge: `mobile-locks.css`
- Entry point: `index.css`

페이지별 임시 `<style>`이나 모바일 override를 추가하지 않습니다. 모바일 규칙 수정은 위 공통 파일에서만 진행합니다.
