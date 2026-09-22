# Gallery System

## Autoplay lifecycle

모든 자동 재생 갤러리·슬라이드쇼는 `design-system/gallery-runtime.js`의 `window.HMDSGalleryRuntime`을 공통 실행 기준으로 사용합니다.

- 갤러리가 뷰포트에서 의미 있게 보일 때만 자동 재생합니다.
- 뷰포트를 벗어나면 timer / interval / 자동 video 재생을 즉시 중지합니다.
- `position: sticky`로 뒤에 남는 히어로·배경 갤러리는 실제 DOM이 화면에 남아 있어도 원래 문서 흐름 영역이 지나가면 자동 재생을 중지합니다.
- 브라우저 탭이 비활성화되면 자동 재생을 중지합니다.
- 다시 보이기 시작하면 현재 프레임에서 이어서 재생합니다. 첫 프레임으로 reset하지 않습니다.
- 화면 재진입 때 이미지·영상을 다시 다운로드하거나 gallery DOM을 다시 만들지 않습니다.
- `prefers-reduced-motion: reduce`에서는 자동 재생을 사용하지 않고 수동 탐색만 유지합니다.
- 수동 좌우 이동, 키보드, swipe는 autoplay 중지 상태에서도 사용할 수 있어야 합니다.

## Loading policy

자동 이미지 갤러리는 모든 프레임을 페이지 진입 시 한 번에 preload하지 않습니다.

1. 최초 현재 프레임만 로드합니다.
2. 갤러리가 실제 보이면서 autoplay가 활성화되면 다음 프레임 하나만 미리 준비합니다.
3. 한 번 로드된 프레임은 DOM과 브라우저 캐시에 유지합니다.
4. 갤러리에 다시 진입할 때 이미 로드된 프레임을 재요청하지 않습니다.

이 방식은 매번 새로 고침하거나 다시 로딩하는 방식보다 네트워크 요청, 이미지 decode, paint, 메모리 churn을 줄이고 화면 깜빡임과 사용자의 현재 위치 초기화를 방지합니다.

## Visibility threshold

공통 Runtime은 일반 갤러리에 `IntersectionObserver` 하나를 공유하며 기본 visible 기준은 intersection ratio 12%입니다. 단순히 1px이 보이는 상태에서는 autoplay를 시작하지 않습니다. Sticky 갤러리는 IntersectionObserver만으로 가려짐을 판단할 수 없기 때문에, 같은 Runtime의 단일 passive scroll listener가 원래 document-flow 범위를 rAF 단위로 확인합니다.

## Current implementations

- HIMART Team workshop galleries — shared runtime + current/next lazy loading
- HIMART Team sticky hero slideshow — shared runtime + document-flow visibility check
- Works HIMART Team project slideshow — shared runtime, current frame resume
- AIMMO observation / improvement galleries — shared-runtime aware + current/next lazy loading
- AIMMO output rotator — shared-runtime aware
- REUSE production/image galleries — 기존부터 동일한 offscreen pause / resume 정책을 사용하며, 영상도 offscreen에서 pause합니다.

새 자동 갤러리를 추가할 때 페이지별 `IntersectionObserver`나 `visibilitychange`를 새로 만들지 말고 `HMDSGalleryRuntime.register(root, callback)`을 사용합니다.


## Fullscreen lightbox contract

모든 활성 case-study 페이지의 이미지 갤러리뷰는 `design-system/media-gallery.js`의 공통 fullscreen lightbox를 사용합니다.

- 갤러리 이미지 클릭 또는 키보드 Enter/Space로 fullscreen lightbox를 엽니다.
- Desktop 이미지는 최대 85vw, 세로는 viewport - 96px 안에서 원본 비율을 유지하며 `object-fit: contain`으로 표시합니다.
- Mobile은 최대 78vw, 세로는 viewport - 48px을 사용합니다.
- 동일 갤러리의 이미지가 여러 장이면 좌/우 10% hit area와 방향키로 순환 탐색합니다.
- ESC, 우측 상단 X, 이미지 바깥 backdrop 클릭으로 닫습니다.
- 확대된 이미지 자체를 클릭해서는 닫히지 않습니다.
- 닫으면 원래 클릭했던 이미지로 focus를 복원하고 body scroll lock을 해제합니다.
- 동적으로 생성되는 gallery image도 MutationObserver를 통해 동일 규칙을 적용합니다.
- 명시적 예외는 `data-gallery-no-expand="true"`로 선언합니다.
- 현재 예외: `aimmo-system.html`의 02.3 improvement gallery. 이 영역은 카드별 autoplay/수동 탐색만 유지하고 fullscreen lightbox를 사용하지 않습니다.
