# CONTENT AUDIT — 2026-09-22

## Scope
Production portfolio copy was re-audited against Git history and explicit user requests. This pass changes text only; layout, CSS, media, animation, component structure and interaction behavior are intentionally untouched.

## Restored because the change was not explicitly requested

1. **Home / index.html**
   - Restored: `시스템은 결과로 이어져야 합니다.`
   - Removed assistant rewrite: `시스템은 결과로 이어지도록 일해왔습니다.`
   - Basis: the first phrase was explicitly supplied by the user; no later request for the rewrite was found.

2. **NBT StepUp / nbt_stepup.html / screens 07–12**
   - Restored neutral labels: `SCREEN 07` … `SCREEN 12`
   - Removed assistant-created labels and interpretations: `MATE BONUS`, `RATING MOMENT`, `MISSION BOARD`, `MISSION COIN`, `MISSION PROGRESS`, `MISSION COMPLETE` plus their explanatory copy.
   - Basis: no explicit user request for these labels/descriptions was found.

3. **Himart / chapter 02 title**
   - Restored: `그리고 실제로 고객들이 서비스를 어떻게 이용하고 있는지도 살펴봤습니다.`
   - Removed assistant rewrite: `문제들은 실제 이용 패턴에서도 반복됐습니다.`
   - Synced the same canonical title across `himart.html`, `test-content-loader.js`, `test-content-final.js`, and `content-runtime.js` so runtime cannot reintroduce the drift.

## Already restored in the immediately preceding audit commit

4. **AIMMO Graphic / PROJECT REFLECTION**
   - Restored the exact user-authored reflection beginning `매번 새로 만들 순 없습니다...` and ending `의미있는 작업이였습니다.`

5. **Work Archive / AI AGENT HAVI CHARACTER**
   - Removed assistant-created descriptive copy while keeping the requested menu/gallery/images.

6. **Top-level footer copy**
   - Restored the pre-unification footer copy after an assistant-initiated cross-page footer rewrite.

## Verified as user-requested — left unchanged

- Contact: removal of LET'S TALK / intro title and English INQUIRY wording.
- Himart Reuse: 01.1 source-based metric wording and 03.1 image-importance title.
- Himart Team: 04.1 copy and hero wording.
- Himart AX: 03.5 AI Banner Script Generator and merged closing message.
- About: leadership shortening, question removal, career summaries, spacing-related copy scope.
- StepUp: core `만보계 → 재방문 이유 → 습관 형성 서비스` narrative direction.
- Yanolja and Trenbe narrative edits that were explicitly requested in their respective page work.

## Rule
When evidence is ambiguous, do not rewrite. Preserve the current/user-authored text and report the ambiguity for review. Future copy changes require an explicit current user instruction and a `[copy-approved]` commit.
