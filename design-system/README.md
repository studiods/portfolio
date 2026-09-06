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
| Hero | `components/hero.css` | 영상, 오버레이, Hero 타이포그래피, 하단 메타, scroll-cover 구조 |
| Chapter | `components/chapter.css` | 본문 챕터 제목의 PC/모바일 크기·줄바꿈·헤더 구조 |
| Card | `components/cards.css` | Data/Narrative/Role 카드 foundation, numbered editorial list |
| Narrative | `components/narrative.css` | Synthesis, Journey narrative, Prototype intro |
| Media | `components/media.css` | Prototype media grid/card/frame/caption |
| Flow | `components/flow.css` | Journey flow group/node/label/responsive 구조 |
| Data Viz | `components/data-viz.css` + `animation.js` | Ring, split ratio, segmented ratio, traffic SVG, horizontal bars와 단일 chart reveal |
| Works | `components/works.css` + `works.js` | WORKS 타이틀 상태, 8/20·12/20 프로젝트 레이아웃, 미디어 오버레이, focused video playback, centered title handoff, 프로젝트 메뉴 |
| Responsive | `responsive.css` | 공통 breakpoint 레이아웃만 담당 |
| Motion | `animation.js` | Himart reveal, counter, hero scroll variable, data-viz draw, viewport video control, single-video sequence |

## HIMART Hero component contract

- Himart/ReUse movie Hero의 canonical DOM은 `hm-ds-hero hm-ds-hero--scroll-cover` → `hm-ds-hero__inner` → `hm-ds-hero__copy` + `hm-ds-hero__bottom` → `hm-ds-hero__meta` 순서로 통일한다.
- `components/hero.css`가 Hero의 position/height/copy center/bottom rail/meta typography를 단독 소유하며, `final-tuning.css`나 case page에서 Hero selector를 다시 정의하지 않는다.
- Legacy `himart-narrative-v2-production.css`의 `.himart-wide-test-page`/`.hm-hero-bottom` 규칙은 이전 호환성용이며 canonical `hm-ds-*` Hero selector가 항상 우선한다.
- Himart와 ReUse는 동일한 `himart-system.css` cache version을 사용해 서로 다른 cached import tree가 적용되지 않게 한다.
- `hm-ds-hero__bottom`은 approved `himart.html`의 Hero 하단 위치를 기준으로 desktop `40px`, mobile `28px` bottom inset을 사용한다.
- Hero meta는 `hm-ds-hero__meta`가 단일 소유한다. 4열 비율은 `1.4fr / .95fr / .95fr / .9fr`, 기본 높이는 `74px`이다.
- Meta typography와 자간/행간은 `components/hero.css`의 공통 규칙만 사용하며 case page에서 별도 override하지 않는다.
- `hm-ds-hero--scroll-cover`를 가진 Hero는 viewport에 sticky로 고정되고 뒤따르는 `.hm-section`이 더 높은 z-index로 아래에서 올라와 Hero를 덮는다.
- `animation.js`는 `--hm-hero-overlay-opacity`와 `--hm-hero-copy-opacity`만 계산한다. 실제 black overlay와 copy opacity 표현은 `components/hero.css`가 소유한다.
- scroll 시작 시 overlay는 기본 black 50%에서 점차 진해지고 Hero copy는 함께 낮아지며, 다음 section은 물리적으로 아래에서 올라온다.
- 신규 Himart case에서 동일한 동작이 필요하면 page-local sticky/fade 코드를 추가하지 말고 `hm-ds-hero hm-ds-hero--scroll-cover`, `hm-ds-hero__bottom`, `hm-ds-hero__meta`를 조합한다.
- 두 개 이상의 Hero clip은 hidden `<video>`를 추가하는 double-buffer를 사용하지 않는다. 하나의 `<video>`에서 clip 종료 시 black transition → source 교체 → 첫 프레임 준비 후 노출 순서로 처리한다.
- sequence video의 기본 preload는 `metadata`이며 실제 viewport에 보일 때만 `auto`로 올리고 재생한다.


## Text integrity / wrapping contract

- Hero description은 고정 2줄/3줄 clamp를 사용하지 않는다. `word-break:keep-all` + `text-wrap:pretty`로 문맥에 가까운 자연 줄바꿈을 사용한다.
- Mobile Hero description은 `--hm-hero-description-width-mobile`을 사용하고 화면 내부 container의 최대 88%까지만 사용해 좌우 여백을 남긴다.
- Hero/section/subsection/card/flow 등 모든 prose는 authored text 전체를 표시한다. `text-overflow:ellipsis`, 숫자형 `line-clamp`, JS substring/slice 기반 말줄임을 금지한다.
- `scramble-final.js`는 타이틀 scramble만 담당하며 본문 텍스트를 변경하거나 자르지 않는다.
- media/chart/frame의 `overflow:hidden`과 navigation label의 `white-space:nowrap`은 시각 구조용이며 prose truncation으로 사용하지 않는다.
- 신규 case에서 텍스트 길이를 맞추기 위해 DOM text를 자르지 않고, design-system width/wrap token과 authored copy를 조정한다.

## Numbered editorial list contract

- `hm-ds-numbered-list`는 로마 숫자 + 본문 타이틀 + 설명 구조의 공통 컴포넌트다.
- 로마 숫자와 타이틀은 같은 첫 행에 배치하고 동일한 `30px / 1.22` 크기·행간을 사용한다.
- 설명은 타이틀의 오른쪽이 아니라 항상 타이틀 바로 아래에 배치한다.
- title → description 간격은 공통 token `--hm-title-description-gap`(`20px`)을 사용한다.
- 설명 최대 폭은 `--hm-title-description-max`(`40ch`)를 따르며 기본 contrast는 secondary text를 사용한다.
- mobile에서는 번호/타이틀 크기를 `26px`로 낮추고 구조는 동일하게 유지한다.


## HIMART Data Visualization component contract

- `components/data-viz.css`가 Himart 계열의 수치·비율 시각화를 단독 소유하며 case page에 그래프용 `<style>` 또는 별도 page CSS를 만들지 않는다.
- 원형 비율(`hm-ds-ring-row` / `hm-ds-ring-card`), 65:35 분할(`hm-ds-split-ratio`), 분할 막대(`hm-ds-segmented-bar`), Traffic SVG(`hm-ds-traffic`), 가로 막대(`hm-ds-home-bars`)를 공통 컴포넌트로 사용한다.
- 컴포넌트의 구조·좌표·색상 문법은 승인된 Himart 그래프 소스에서 이관한다. Deep Blue `#0572CB`, Blue `#00A6ED`, New Blue `#00B8DE`, Green `#00EDBD`, Yellow `#F3EB01`, Red `#FA481B`를 유지한다.
- 그래프 안의 폰트·행간·자간·본문 대비는 새 규칙을 만들지 않고 기존 `tokens.css`와 `typography.css` 값만 사용한다. SVG 내부에도 별도 font-family를 선언하지 않는다.
- ENTRY CHANNEL 원본 비율 `52 / 31 / 10 / 6 / 1`, HOME 원본 값 `49.6 / 33.8 / 8.3 / 3.4 / 1.2 / 0.3`, Traffic SVG의 `1160×330` viewBox와 series 좌표는 원본 구조를 보존한다.
- `animation.js`가 `[data-hm-chart]`를 한 번만 관찰해 `is-hm-chart-active`를 부여한다. Traffic chart의 line/bar stroke drawing도 이 단일 runtime이 담당하며 별도 page observer를 추가하지 않는다.
- 실제 근거가 없는 백분율이나 성과 수치는 만들지 않는다. Ways의 AS-IS 분할 막대와 TO-BE 진행 막대는 각각 4단계/7단계라는 페이지에 이미 존재하는 구조만 시각화하며 성과 비율로 표현하지 않는다.
- 신규 페이지에서 수치가 존재하면 위 컴포넌트 중 정보 의미에 맞는 것을 재사용하고, 그래프의 구조나 palette를 page에서 변형하지 않는다.

## WORKS component contract

- PC 프로젝트 구조는 화면 폭을 `8/20 copy : 12/20 media`로 고정한다.
- 좌측 copy 영역의 시작 inset은 기존 공통 desktop inset인 `40px`을 사용한다.
- 좌측 copy 영역과 우측 media 사이에는 좌측 전체 영역의 `2/10`인 `8vw`를 비워 둔다. 따라서 실제 title/meta content 폭은 `40vw - 8vw - 40px`이다.
- 우측 media는 `16:9`, 프로젝트 간 vertical gap은 `0`이다.
- 각 프로젝트 copy 상단 rule은 8/20 title column의 1/4인 `10vw`이며 `rgba(255,255,255,.30)`을 사용한다.
- rule과 프로젝트 title 사이 간격은 `44px`이다.
- 프로젝트 전체 row는 링크가 아니다. 실제 이동 링크는 `works-card-title-link`와 `works-card-media-link` 두 영역만 가진다.
- 실제 영상/이미지 위에는 기본 black `40%` overlay를 둔다. direct hover/focus 또는 현재 video playback focus 상태(`is-video-focused`)에서는 black overlay를 `0%`로 제거한다.
- WORKS video는 페이지 진입 시 autoplay하지 않는다. media 중심이 viewport 세로 `35%–65%` 구간, 즉 화면 중앙 기준 `±15vh` 안에 들어오면 재생 후보가 된다.
- focus band 안에 video가 둘 이상 걸릴 가능성이 있으면 viewport center에 가장 가까운 단 하나의 video만 재생해 decoder 부하를 제한한다.
- media 중심이 `35%–65%` 구간을 벗어나는 순간 즉시 `pause()`하고 현재 프레임/재생 위치를 유지한다. 역스크롤로 같은 media가 다시 focus band에 들어오면 해당 위치에서 재생을 재개한다.
- WORKS video는 기본 `preload="metadata"`를 사용한다. viewport 근처 약 `75%` root margin 안으로 접근한 video만 `preload="auto"`로 승격해 초기 재생 지연과 불필요한 전체 다운로드를 함께 줄인다.
- Ways처럼 두 clip을 순차 재생하는 WORKS media도 double-buffer를 금지한다. 하나의 video element에서 source를 교체하며 교체 중에는 `is-sequence-switching`으로 짧은 black transition을 노출한다.
- PC에서 project copy는 별도의 incoming animation/fade를 사용하지 않는다.
- project copy는 해당 media의 top과 같은 line에서 동일한 scroll 속도로 올라오며, copy의 중심이 viewport center에 도달하면 그 위치에서 정지한다.
- 가운데에 정착한 project copy는 다음 타이틀이 충분히 가까워지기 전까지 scroll 여부와 관계없이 `opacity 1 / shift 0`을 유지한다.
- 다음 project copy는 자신의 media와 top line을 맞춰 그대로 올라오며, 현재 copy 하단과 다음 copy 상단 사이 gap이 약 `8vh`(`72–120px` clamp) 이내로 가까워지는 시점부터 handoff가 시작된다.
- handoff가 시작된 뒤에만 기존 copy가 최대 `120px` 위로 이동한다.
- opacity는 handoff 초반 약 `28%` 구간에서 `100% → 50%`로 비교적 빠르게 낮아지고, 나머지 약 `72%` 구간에서 `50% → 0%`로 더 천천히 사라진다.
- 마지막 project는 다음 타이틀이 없으므로 project grid가 viewport center 위로 빠져나갈 때만 footer overlap 방지를 위한 종료 fade를 적용한다.
- 마지막 project와 footer 사이에는 `400px`의 black spacing을 유지한다.
- WORKS 프로젝트 메뉴는 compact 상태에서만 노출되며, 화살표는 WORKS 우측 `24px`, 메뉴는 WORKS 하단 `24px`에 배치한다.
- compact WORKS 화살표는 white `60%`다.
- 화살표의 실제 아이콘 크기는 유지하되 클릭 hit area는 `18px → 24px`로 약 30% 확대한다.
- compact 상태의 좌측 상단 WORKS 텍스트는 직접 선택 가능하며 선택 시 페이지 맨 위로 이동한다. 키보드 Enter/Space도 동일하게 동작한다.
- 메뉴 폭은 PC `400px`, 각 항목은 `14px / 40px height`이고 항목 사이에만 white `16%` rule을 둔다.
- 메뉴 기본 텍스트는 white `60%`, 이미 방문한 항목은 그보다 30% 어두운 white `42%`를 사용한다.
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
- Works는 page-local JS를 두지 않고 `design-system/works.js` 한 곳에서 title/menu/centered handoff/media focus 상태를 관리한다.
- 중복 observer와 동일 콘텐츠 재주입 루프를 새로 추가하지 않는다.
- 동일한 clip transition을 위해 두 개의 `<video>` decoder를 동시에 유지하지 않는다. 검은 전환을 허용하고 single-video source swap을 우선한다.
- 회귀 기준은 `design-system/qa-matrix.md`를 따른다.

## Final readiness gate

1. Legacy selector remnants are removed only after the matching component passes PC/mobile comparison.
2. 대상 페이지는 fresh cache version으로 검증한다.
3. Typography fine tuning is performed after local font loading and line wrapping are stable.
4. 공통 navigation 변경 시 Home / Works / detail page의 viewport center를 함께 검증한다.
