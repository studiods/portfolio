# Numbered Subsection Description Visibility

## Scope
Numbered middle-title blocks such as `01.1`, `02.3`, `03.2` and `04.2`. Hero descriptions, major chapter titles/descriptions, card body copy, gallery captions and source notes are not part of this rule.

## Current state
The explanatory paragraph immediately below a numbered middle title remains in the HTML source but is visually hidden. `display:none` removes both the text and its layout space, so the following content moves upward.

## Activation
Pages use the body class:

```html
<body class="... hm-ds-subsection-copy-hidden">
```

and load:

```html
<link rel="stylesheet" href="./design-system/components/subsection-copy-visibility.css?v=20260918-1">
```

## Restore later
Remove only `hm-ds-subsection-copy-hidden` from the body. Do not delete or rewrite the paragraph markup. The original copy, typography and spacing then return from the existing page/design-system styles.

## Content rule
This is a visibility state, not a content deletion rule. Numbered subsection descriptions must remain editable and recoverable in source.
