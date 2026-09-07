# Quantitative SOURCE System v1.2

적용 범위: Himart Design System을 사용하는 현재/신규 모든 Case Study 페이지.

## 필수 규칙

- 그래프, 차트, 비율, 수치 카드, 정량 리서치, 성과 숫자 등 **근거가 필요한 모든 정량 시각화에는 반드시 출처를 표시**한다.
- 출처는 해당 데이터/그래프 영역의 **바로 다음 요소**에 배치한다.
- 데이터 영역과 SOURCE 사이의 상단 간격은 PC/Mobile 모두 **32px 고정**이다.
- SOURCE 영역 상단에는 공통 faint divider를 두고 divider와 텍스트 사이에는 14px을 둔다.
- SOURCE 전체 텍스트는 PC/Mobile 모두 **10px**로 고정한다.
- SOURCE 전체 텍스트 색상은 **White 30% (`rgba(255,255,255,.30)`)**로 고정한다.
- 출처 문구는 반드시 리터럴 **`SOURCE -`** 로 시작한다. `SOURCE ·`, `출처 ·`, `SOURCE:` 등 다른 표기는 사용하지 않는다.
- `SOURCE -` 뒤에는 실제 보고서·조사·백데이터·공개 기사·내부 문서명과 시점/버전을 가능한 한 구체적으로 명시한다.
- 정확한 원 출처가 있는데 `내부 데이터`, `리서치 자료`처럼 뭉뚱그린 표현을 사용하지 않는다.
- 서로 다른 출처의 숫자를 한 시각화에 함께 사용하면 `/`로 구분해 각 출처를 모두 적는다.
- 성과 데이터가 아닌 프로세스 단계 시각화는 성과처럼 오인되지 않도록 `내부 업무 흐름 분석`, `프로세스 정의` 등 실제 근거 문서를 SOURCE에 명시한다.

## SOURCE가 필요하지 않은 숫자

다음은 정량 근거가 아니라 구조/문맥 표기이므로 SOURCE 필수 대상에서 제외한다.

- Section / Chapter 번호
- Step 번호 자체
- 단순 연도·기간 표기
- 페이지 순번, 화면 번호

단, 위 숫자가 성과·비율·시장 규모·리서치 결과처럼 **근거로 제시되는 순간에는 SOURCE가 필수**다.

## 마크업

신규 페이지에서는 데이터 시각화 노드에 실제 출처를 직접 선언하는 방식을 우선한다.

```html
<div class="data-viz" data-source="실제 보고서명 · 조사 시점 · 표본/버전">...</div>
```

공통 runtime이 바로 아래에 다음 구조를 생성한다.

```html
<div class="hm-ds-source-note">SOURCE - 실제 보고서명 · 조사 시점 · 표본/버전</div>
```

직접 작성할 경우에도 클래스와 prefix는 동일하게 유지한다.

```html
<div class="hm-ds-source-note">SOURCE - 실제 출처</div>
```

## 기존 페이지 마이그레이션

- 기존 `.hm-source`, `.reuse-proof-source`, `.hm-ds-source-note`는 공통 runtime이 자동으로 `SOURCE -` 형식으로 정규화한다.
- 기존 `SOURCE ·`, `출처 ·`, `SOURCE:` prefix는 화면에 노출되기 전에 `SOURCE -`로 변환한다.
- 현재 페이지 중 출처 노트가 누락된 정량 시각화는 migration registry에서 실제 출처를 연결한다.
- 신규 페이지에서는 migration registry를 추가하지 말고 `data-source`를 직접 작성한다.

## 소유권

- Visual contract: `design-system/components/editorial.css`
- Runtime normalization / migration: `design-system/navigation.js`
- Data visualization structure: `design-system/components/data-viz.css`
