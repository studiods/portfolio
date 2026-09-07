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
| Progress | `components/progress.css` + `navigation.js` | WORKS/상세 페이지 우측 주요 영역 번호, focus 상태, HOME/ABOUT/CONTACT 제외 |

## HIMART Hero component contract

- Desktop Hero title은 `--hm-type-hero:64px`을 단일 기준으로 사용하며 page-local 크기 override를 만들지 않는다.
- Himart/ReUse movie Hero의 canonical DOM은 `hm-ds-hero hm-ds-hero--scroll-cover` → `hm-ds-hero__inner` → `hm-ds-hero__copy` + `hm-ds-hero__bottom` → `hm-ds-hero__meta` 순서로 통일한다.
- `components/hero.css`가 Hero의 position/height/copy center/bottom rail/meta typography를 단독 소유하며, `final-tuning.css`나 case page에서 Hero selector를 다시 정의하지 않는다.
- Legacy `himart-narrative-v2-production.css`의 `.himart-wide-test-page`/`.hm-hero-bottom` 규칙은 이전 호환성용이며 canonical `hm-ds-*` Hero selector가 항상 우선한다.
- Himart와 ReUse는 동일한 `himart-system.css` cache version을 사용해 서로 다른 cached import tree가 적용되지 않게 한다.
- `hm-ds-hero__bottom`은 approved `himart.html`의 Hero 하단 위치를 기준으로 desktop `40px`, mobile `28px` bottom inset을 사용한다.
- Hero meta는 `hm-ds-hero__meta`가 단일 소유한다. Desktop은 각 항목의 실제 텍스트 폭(`max-content`)을 우선하고 남은 공간을 `space-between`으로 가변 배분해 ROLE/FOCUS/SCOPE/TEAM 값이 한 줄을 유지한다. 최소 column gap은 `--hm-meta-column-gap:24px`, 기본 높이는 `74px`이다. Mobile 2×2에서는 가독성을 위해 줄바꿈을 허용한다.
- Meta typography와 자간/행간은 `components/hero.css`의 공통 규칙만 사용하며 case page에서 별도 override하지 않는다.
- `hm-ds-hero--scroll-cover`를 가진 Hero는 viewport에 sticky로 고정되고 뒤따르는 `.hm-section`이 더 높은 z-index로 아래에서 올라와 Hero를 덮는다.
- `animation.js`는 `--hm-hero-overlay-opacity`와 `--hm-hero-copy-opacity`만 계산한다. 실제 black overlay와 copy opacity 표현은 `components/hero.css`가 소유한다.
- scroll 시작 시 overlay는 기본 black 50%에서 점차 진해지고 Hero copy는 함께 낮아지며, 다음 section은 물리적으로 아래에서 올라온다.
- 신규 Himart case에서 동일한 동작이 필요하면 page-local sticky/fade 코드를 추가하지 말고 `hm-ds-hero hm-ds-hero--scroll-cover`, `hm-ds-hero__bottom`, `hm-ds-hero__meta`를 조합한다.
- 두 개 이상의 Hero clip은 hidden `<video>`를 추가하는 double-buffer를 사용하지 않는다. 하나의 `<video>`에서 clip 종료 시 black transition → source 교체 → 첫 프레임 준비 후 노출 순서로 처리한다.
- sequence video의 기본 preload는 `metadata`이며 실제 viewport에 보일 때만 `auto`로 올리고 재생한다.


## Text integrity / wrapping contract

- Hero description은 Desktop/Mobile 모두 **최대 2줄**이다. 3줄 이상으로 보이면 CSS로 숨기지 않고 원문 copy 자체를 축약한다.
- Hero description의 2줄 제한을 위해 `line-clamp`, `text-overflow:ellipsis`, 고정 높이, `overflow:hidden`을 사용하지 않는다. 두 줄 안에서 `word-break:keep-all` + `text-wrap:pretty`를 사용하며, 의미 단위가 분명할 때 한 개의 `<br>`만 허용한다.
- HTML의 초기 Hero description과 content runtime이 교체하는 Hero description은 동일한 문장을 사용해 로딩 전후 줄 수와 위치가 바뀌지 않게 한다.
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

## Scramble animation contract

- 난수 타이틀 애니메이션의 원본은 렌더링 시작 전 `originalHTML`로 고정하며, 애니메이션 도중 작성된 원문을 substring/slice로 재구성하지 않는다.
- scramble frame은 `requestAnimationFrame` 기반으로만 갱신하고 각 실행에 generation token을 부여한다. 취소된 이전 frame은 DOM에 다시 쓸 수 없다.
- scroll 이탈, visibility change, pagehide, 예외 종료 시 마지막 write는 반드시 원본 `innerHTML` 복원이다. `<br>`을 포함한 authored markup 전체를 복원해 난수 glyph가 잔존하지 않게 한다.
- 외부 runtime이 animation 중 title DOM 자체를 교체한 경우 기존 scramble은 즉시 무효화하고 새 DOM을 덮어쓰지 않는다.
- Hero는 한 번만 실행하고, section title은 viewport 재진입 시 재실행할 수 있으나 같은 element에 두 animation이 동시에 존재할 수 없다.

## Global right-side navigator contract

- 우측 navigator는 `navigation.js`가 DOM에서 자동 생성하고 `components/progress.css`가 표현을 단독 소유한다. page-local progress JS/CSS를 추가하지 않는다.
- 적용 범위는 WORKS와 project detail page다. HOME(`index.html`), ABOUT, CONTACT 영역에는 생성하지 않는다.
- 상세 페이지는 `#live-main > section.hm-section` 중 `.hm-section-title`을 가진 큰 챕터 수만큼 `01, 02…`를 생성한다. WORKS는 `.works-grid .works-card` 수만큼 생성한다.
- 기본 번호는 white `20%`, viewport 중앙 focus line이 해당 큰 영역 안에 들어오면 해당 번호만 white `100%`가 된다. active 상태에 blue/accent color를 사용하지 않는다.
- 기존 `.hm-progress`와 `.works-progress`는 legacy markup으로 간주하고 shared runtime이 제거한다.
- GNB의 3-column grid에서 중앙 배치는 `.portfolio-progress-page` 범위에만 `grid-column:2`를 적용한다. generic `.top-center`에는 grid-column을 주지 않아 HOME의 기존 absolute centering과 충돌하지 않게 한다.

## Subsection tracking contract

- 32px 중타이틀(`.hm-subtitle`, `.hm-ds-subsection__title`)은 항상 `--hm-track-subsection`을 사용한다. `letter-spacing:0` page/compatibility override를 금지한다.
- 12px subsection label(`.hm-subno`, `.hm-card-no`)은 Averta PE + `--hm-track-note`를 사용한다. Reuse의 `01.1 / RESEARCH SIGNALS`, `01.2 / SUMMARY`도 예외를 두지 않는다.


## Scramble motion contract

- `scramble-final.js`가 Himart 계열 Hero/major section title의 난수 애니메이션을 단독 소유한다. 페이지별 난수 runtime을 추가하지 않는다.
- 원본 HTML(`br`, inline span 포함)을 animation 시작 전에 immutable source로 캡처한다.
- 애니메이션 중 각 글자는 독립된 `hm-scramble-char` 단위로 난수를 표시하며 왼쪽에서 오른쪽 순서로 원래 글자로 resolve된다.
- 한 번 원래 글자로 resolve된 문자는 다시 난수로 돌아가지 않는다.
- 마지막 글자가 resolve된 다음 frame에 원본 HTML을 복원한다. 따라서 종료 순간 전체 문장이 갑자기 교체되어 보이면 안 된다.
- title animation은 page lifecycle당 1회만 실행한다. 스크롤로 화면을 벗어났다가 재진입해도 다시 난수화하지 않는다.
- visibilitychange/pagehide/error/중단 상황에서는 현재 난수 문자를 모두 원래 문자로 settle한 뒤 원본 HTML을 복원한다. 랜덤 glyph가 정지 화면으로 남는 상태를 허용하지 않는다.
- 다른 runtime이 animation 중 title DOM을 교체하면 detached scramble span은 더 이상 DOM을 쓰지 않으며, 새 authored DOM을 우선한다.


## Line / spacing contract

- 중립적인 카드·콘텐츠 구분선은 `--hm-line-weak`(white 14%)을 기본으로 사용한다. 정보 위계가 아니라 구조만 구분하는 라인에 `--hm-line-strong`을 사용하지 않는다.
- 보조 source/divider는 `--hm-line-faint`를 사용한다.
- 데이터 의미를 직접 표현하는 positive/negative/accent line은 Data Viz/Case component의 semantic color를 유지할 수 있으며 neutral divider 규칙으로 덮어쓰지 않는다.
- 카드 상단 line → label 간격은 `--hm-space-20`, subsection title → content는 `--hm-subtitle-to-content`, major title → first subsection은 `--hm-title-to-subsection-gap`, sibling subsection/card 간격은 `--hm-subsection-gap`을 사용한다.
- case page에서 neutral line opacity나 주요 vertical rhythm을 raw px/rgba 값으로 새로 정의하지 않는다. 공통 component와 token을 사용한다.


## Evidence stat card contract

- `hm-ds-evidence-stat`는 4열/2열 등의 수치 근거 카드 묶음에 사용한다.
- 숫자 아래 카드 타이틀은 `--hm-type-card-title`을 사용하며 desktop 기준 `22px`이다.
- 카드 타이틀은 authored `<br>`로 줄을 고정하지 않고 `word-break:keep-all` + `text-wrap:pretty`로 문맥에 맞게 자연스럽게 줄바꿈한다.
- evidence card는 `min-height`나 grid stretch로 빈 하단 영역을 만들지 않는다. 컨텐츠 실제 높이(`min-height:0`, `height:auto`, `align-self:start`)만 사용한다.
- 동일한 `hm-ds-evidence-stat`를 사용하는 다른 case/영역도 위 규칙을 그대로 상속한다.


## Evidence stat copy contract

- `hm-ds-evidence-stat`의 설명 문구는 4-column desktop 카드 기준 최대 2줄 안에 들어오도록 짧게 작성한다.
- 두 줄을 맞추기 위해 `line-clamp`, ellipsis, JS substring을 사용하지 않는다. 길어지면 authored copy 자체를 축약한다.
- 설명은 `word-break:keep-all` + `text-wrap:pretty`를 사용해 문맥 단위로 자연스럽게 줄바꿈한다.
- 현재 Reuse의 `voice-group-title` → evidence grid 간격은 기존 `--hm-subtitle-to-content` 규칙(Desktop 80px / Mobile 56px)을 그대로 유지한다. 40px 변경은 별도 승인 전까지 적용하지 않는다.


## Subtitle → content spacing contract

- 소타이틀/중간 타이틀 바로 아래의 실제 콘텐츠 시작 간격은 desktop/mobile 모두 `40px`로 통일한다.
- semantic token은 `--hm-subtitle-to-content:40px`이며 utility는 `hm-ds-subtitle-to-content`를 사용한다.
- 페이지별 `80px`, mobile `56px` 예외를 만들지 않는다. Reuse evidence grid, media grid 등 동일 의미의 간격은 이 token을 재사용한다.
- 타이틀 자체의 설명문(`title → description`) 간격 `20px`, 큰 section title → subsection 간격 `160px`, subsection 간 간격 `100px`은 별개의 계층이므로 변경하지 않는다.


## Semantic title spacing contract

- 중타이틀(`--hm-type-subsection:32px`) → 소타이틀/그룹 타이틀(`--hm-type-group:22px`) 간격은 `--hm-subtitle-to-smalltitle:80px`을 사용한다.
- 소타이틀/그룹 타이틀(`22px`) → 바로 아래 실제 콘텐츠/그래프/카드 간격은 `--hm-subtitle-to-content:40px`을 사용한다.
- 두 간격은 서로 다른 semantic token이다. `40px` content gap을 중타이틀 → 소타이틀 관계에 재사용하지 않는다.
- `hm-ds-subtitle-to-smalltitle`은 중타이틀 다음에 작은 타이틀 그룹 wrapper가 오는 경우 사용한다. 표준 direct sibling인 `hm-group-title`, `hm-ds-group-title`, `voice-group-title`, `sentiment-title`은 spacing foundation이 자동으로 80px을 적용한다.
- Desktop/Mobile 모두 이 의미 관계는 동일하게 유지한다. 화면 폭 때문에 임의로 56px/40px 등으로 축소하지 않는다.


### Multi-line display leading

- Multi-line group/display copy uses `--hm-leading-group: 1.3`.
- Comparison keyword stacks and narrative synthesis cards must use this same leading instead of page-specific values.
- Do not add flex/grid row gaps between lines that are semantically one sentence/block; line-height alone owns the vertical rhythm.

- Comparison display text uses `--hm-type-comparison: 32px` with `--hm-leading-group` for Reuse trust/anxiety keywords and the matching Himart synthesis copy.
