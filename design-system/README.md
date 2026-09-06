# Portfolio Design System

## 적용 범위

- Himart 기준 운영 페이지: `himart.html`
- Himart 검증 페이지: `himart-system-test.html`
- Portfolio Works 페이지: `works.html`
- 폰트 에셋은 `fonts/`의 Averta PE 3종과 Pretendard Variable을 로컬 로드한다.
- 새 스타일을 page-local inline CSS나 임시 override 파일로 추가하지 않는다.
- 페이지 전용 규칙이 필요한 경우에도 반드시 `design-system/components/`의 해당 컴포넌트가 소유한다.

## 로딩 순서

1. `tokens.css`
2. `typography.css`
3. `spacing.css`
4. `layout.css`
5. `motion.css`
6. `components/*.css`
7. `compatibility.css`
8. `responsive.css`
9. 필요한 design-system runtime

## 컴포넌트 소유권

| 컴포넌트 | 파일 | 책임 |
|---|---|---|
| Hero | `components/hero.css` | 영상, 오버레이, Hero 타이포그래피, 메타 |
| Chapter | `components/chapter.css` | 본문 챕터 제목의 PC/모바일 크기·줄바꿈·헤더 구조 |
| Card | `components/cards.css` | Data/Narrative/Role 카드 foundation |
| Narrative | `components/narrative.css` | Synthesis, Journey narrative, Prototype intro |
| Media | `components/media.css` | Prototype media grid/card/frame/caption |
| Flow | `components/flow.css` | Journey flow group/node/label/responsive 구조 |
| Works | `components/works.css` + `works.js` | WORKS 타이틀 상태, 1/3·2/3 프로젝트 레이아웃, 미디어 오버레이, centered title handoff, 프로젝트 메뉴 |
| Responsive | `responsive.css` | 공통 breakpoint 레이아웃만 담당 |
| Motion | `animation.js` | Himart reveal, counter, hero scroll, video viewport |

## WORKS component contract

- PC 프로젝트 구조는 화면 폭을 `1/3 copy : 2/3 media`로 고정한다.
- 우측 media는 `16:9`, 프로젝트 간 vertical gap은 `0`이다.
- 각 프로젝트 copy 상단 rule은 화면 전체 폭의 `1/12`이며 `rgba(255,255,255,.30)`을 사용한다.
- rule과 프로젝트 title 사이 간격은 `44px`이다.
- 프로젝트 전체 row는 링크가 아니다. 실제 이동 링크는 `works-card-title-link`와 `works-card-media-link` 두 영역만 가진다.
- 실제 영상/이미지 위에는 black `40%` overlay를 두고 direct hover/focus 시 black `20%`로 밝아진다.
- WORKS가 compact 상태가 되면 현재 project copy는 viewport 상하 기준 중앙에 고정된다.
- 다음 project copy는 아래에서 자연스럽게 올라와 중앙에 ease-out으로 붙고, 기존 copy는 최대 `96px` 위로 이동하며 opacity가 감소한다.
- title handoff opacity 곡선은 기존 cubic falloff(`3`)보다 50% 완만한 `1.5` exponent를 사용한다.
- 마지막 project와 footer 사이에는 `400px`의 black spacing을 유지한다.
- WORKS 프로젝트 메뉴는 compact 상태에서만 노출되며, 화살표는 WORKS 우측 `24px`, 메뉴는 WORKS 하단 `24px`에 배치한다.
- compact WORKS 화살표는 white `60%`다.
- 메뉴 폭은 PC `500px`, 각 항목은 `12px / 28px height`이고 항목 사이에만 white `16%` rule을 둔다.
- 확대 WORKS는 Averta Thin, compact WORKS는 `Averta PE ExtraLight` semantic을 사용한다. 현재 저장소에는 native ExtraLight 파일이 없어 `typography.css`에서 가장 얇은 로컬 Thin 에셋을 ExtraLight semantic alias로 연결한다.

## Transitional mapping 원칙

현재 HTML의 legacy 클래스는 한 번에 삭제하지 않는다. `hm-ds-*` 의미론적 클래스와 기존 DOM을 매핑한 뒤, 브라우저 computed style 대조가 끝난 selector부터 제거한다. 새 스타일을 inline 또는 별도 final override로 추가하지 않는다.

## 변경 규칙

- 토큰 변경은 해당 foundation 파일에서만 한다.
- 컴포넌트 변경은 해당 컴포넌트 파일에서만 한다.
- 반응형 타이포그래피는 Hero/Chapter 소유 파일에서 수정한다.
- Himart 애니메이션 수정은 `animation.js`에서만 한다.
- Works 페이지의 인터랙션은 `design-system/works.js`에서만 관리하며 `works.html` 내부 script/style override는 허용하지 않는다.
- 모든 변경은 실제 대상 페이지와 연관 페이지에서 회귀 확인한다.

## Font assets

`typography.css`가 `fonts/Averta-PE-*.otf`와 `fonts/PretendardVariable.woff2`를 로컬 `@font-face`로 연결한다. CDN 폰트 의존성은 사용하지 않는다.

## Runtime consolidation

- `test-content-final.js`는 단일 reconciliation pass만 수행한다.
- 콘텐츠 텍스트·역할 카드 보정은 한 레이어에서 처리하고, 레이아웃은 CSS, reveal·counter·hero/video 모션은 `animation.js`가 담당한다.
- Works는 page-local JS를 두지 않고 `design-system/works.js` 한 곳에서 title/menu/centered handoff 상태를 관리한다.
- 중복 observer와 동일 콘텐츠 재주입 루프를 새로 추가하지 않는다.
- 회귀 기준은 `design-system/qa-matrix.md`를 따른다.

## Final readiness gate

1. Legacy selector remnants are removed only after the matching component passes PC/mobile comparison.
2. 대상 페이지는 fresh cache version으로 검증한다.
3. Typography fine tuning is performed after local font loading and line wrapping are stable.
4. 공통 navigation 변경 시 Home / Works / detail page의 viewport center를 함께 검증한다.
