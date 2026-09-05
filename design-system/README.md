# HIMART Design System

## 적용 범위

- 기준 운영 페이지: `himart.html`
- 검증 페이지: `himart-system-test.html`
- 운영 페이지는 최종 승인 전 변경하지 않는다.
- 폰트 에셋은 `fonts/`의 Averta PE 3종과 Pretendard Variable을 로컬 로드한다.
- 애니메이션은 정적 CSS와 분리해 `animation.js`에서만 관리한다.

## 로딩 순서

1. `tokens.css`
2. `typography.css`
3. `spacing.css`
4. `layout.css`
5. `motion.css`
6. `components/*.css`
7. `compatibility.css`
8. `responsive.css`
9. 테스트 페이지의 마지막 canonical component link

## 컴포넌트 소유권

| 컴포넌트 | 파일 | 책임 |
|---|---|---|
| Hero | `components/hero.css` | 영상, 오버레이, Hero 타이포그래피, 메타 |
| Chapter | `components/chapter.css` | 본문 챕터 제목의 PC/모바일 크기·줄바꿈·헤더 구조 |
| Card | `components/cards.css` | Data/Narrative/Role 카드 foundation |
| Narrative | `components/narrative.css` | Synthesis, Journey narrative, Prototype intro |
| Media | `components/media.css` | Prototype media grid/card/frame/caption |
| Flow | `components/flow.css` | Journey flow group/node/label/responsive 구조 |
| Responsive | `responsive.css` | breakpoint 레이아웃만 담당 |
| Motion | `animation.js` | reveal, counter, hero scroll, video viewport |

## Transitional mapping 원칙

현재 HTML의 legacy 클래스는 한 번에 삭제하지 않는다. `hm-ds-*` 의미론적 클래스와 기존 DOM을 매핑한 뒤, 브라우저 computed style 대조가 끝난 selector부터 제거한다. 새 스타일을 inline 또는 별도 final override로 추가하지 않는다.

## 변경 규칙

- 토큰 변경은 해당 foundation 파일에서만 한다.
- 컴포넌트 변경은 해당 컴포넌트 파일에서만 한다.
- 반응형 타이포그래피는 Hero/Chapter 소유 파일에서 수정한다.
- 애니메이션 수정은 `animation.js`에서만 한다.
- 모든 변경은 테스트 페이지에서 먼저 검증하고 운영 페이지에는 전파하지 않는다.


## Font assets

`typography.css`가 `fonts/Averta-PE-*.otf`와 `fonts/PretendardVariable.woff2`를 로컬 `@font-face`로 연결한다. CDN 폰트 의존성은 사용하지 않는다.


## Runtime consolidation

- `test-content-final.js`는 단일 reconciliation pass만 수행한다.
- 콘텐츠 텍스트·역할 카드 보정은 한 레이어에서 처리하고, 레이아웃은 CSS, reveal·counter·hero/video 모션은 `animation.js`가 담당한다.
- 중복 observer와 동일 콘텐츠 재주입 루프를 새로 추가하지 않는다.
- 회귀 기준은 `design-system/qa-matrix.md`를 따른다.


## Final readiness gate

1. Legacy selector remnants are removed only after the matching component passes PC/mobile comparison.
2. The test page is validated with a fresh cache version after each runtime or CSS change.
3. Typography fine tuning is performed after local font loading and line wrapping are stable.
4. Production `himart.html` remains untouched until explicit approval after visual comparison.
