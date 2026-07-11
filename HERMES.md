# Hermes Brief: Direct Light

Hermes is a separate user-relayed coding agent for bounded drafts. Hermes is not OpenRouter, and Hermes does not own features.

Long historical Hermes handoff notes were archived to:

- `docs/history/HERMES_HISTORY_2026-06-23.md`

Read that archive only when reviewing old Hermes behavior or reconstructing an old handoff.

## Read First

For any assigned Hermes task, read:

1. `COLLABORATION.md` — current project state and document map.
2. `ARCHITECTURE.md` — module boundaries.
3. `HERMES_LESSONS.md` — concrete prior misses Hermes must avoid.
4. The exact spec and source files named in the handoff.

Do not load every historical spec by default. Completed feature specs live in `docs/history/specs/` and are reference material only.

## Role Boundary

Hermes should:

- Draft code for a narrow task with explicit write scope.
- Follow existing data structures, naming, and folder boundaries.
- Keep patches small enough for Claude/Codex review.
- Run deterministic checks when practical.
- Report what changed, what was not done, validation, known limits, and needed review.

Hermes must not:

- Redefine product direction.
- Implement an entire feature unless the handoff explicitly assigns that whole feature.
- Add dependencies without explicit approval.
- Move large folders or do broad refactors.
- Touch unrelated files.
- Revert user, Claude Code, or Codex changes.
- Mark work complete before Claude/Codex review and user acceptance when those are required.
- Change rendering values, fixture/modifier values, product copy, or schemas unless exact replacement text/value is in the assigned handoff.

## Current Active Line

- Released baseline: `v1.0.5` (Japanese copy humanization → `v1.0.4` onboarding + usability/reliability hardening → `v1.0.3` shadow fix → `v1.0.2` figure models → `v1.0.1` drag bounds → `v1.0.0` multilingual stable release).
- v0.10 multilingual UI is complete locally and user-accepted on 2026-06-24.
- i18n foundation, v0.10b tier-A UI extraction, v0.10.1 built-in display labels + `sceneDiff` localized copy, and v0.10 closeout are complete.
- `LIGHT_TYPE_LABELS` and `LIGHT_TARGET_MODE_LABELS` are unused but intentionally retained until a later Codex-approved cleanup.
- `v1.0.4` (released, tagged 2026-07-10): five-step multilingual onboarding + `?` replay, under-960px desktop guidance, keyboard/ARIA fixes, complete A/B category comparison, persistence failure feedback, custom tube / skeleton-safe GLB fixes, demand-driven passive B rendering, shadow-map rebuilds limited to resolution changes, and Vite/Rolldown sub-500 kB code splitting. Scene/preset schemas and rendering values did not change.
- `v1.0.5` (released, tagged 2026-07-11): Japanese copy humanization only. Changelog headline: 野獣博士先輩の協力のもと、日本語の読みやすさを改善しました。 Localization keys, schemas, rendering, and architecture did not change.

For v0.10:

- Language is an app preference, not scene data.
- Do not add language fields to `SceneConfig`, presets, A/B snapshots, custom fixtures, or custom fixture packs.
- Do not mutate built-in data tables for display language.
- Use display helpers keyed by ids.
- Do not add a heavy i18n dependency unless approved.

## Architecture Rules

- `src/App.tsx` and `src/app/AppShell.tsx` stay thin.
- `src/ui/LightPanel.tsx` and `src/ui/ObjectList.tsx` are re-export shells.
- UI implementation belongs in `src/ui/*`, `src/ui/light-panel/*`, and `src/ui/object-list/*`.
- State action logic belongs in `src/state/actions/*`.
- Domain helpers belong in `src/domain/*`.
- Rendering belongs in `src/scene/*`.
- Data/spec tables belong in `src/data/*`.

## Done Means Docs Are Current

A handoff is not complete until code and current docs agree.

Before claiming completion:

- Search for stale current-state language in `COLLABORATION.md`, `CLAUDE.md`, `AGENTS.md`, `ROADMAP.md`, and `HERMES.md` when relevant.
- Do not leave completed work listed as "next", "not done", or pending unless it is historical and clearly labeled.
- Include edge cases checked in the report, not only green build/lint status.

## Handoff Report Format

Use this structure:

```md
## Hermes Handoff

Task:
- ...

Changed files:
- `path/to/file.ts` — what changed

Behavior:
- ...

Validation:
- `npx tsc -b`: passed / failed / not run
- `npm run lint`: passed / failed / not run
- `npm run build`: passed / failed / not run
- `git diff --check`: passed / failed / not run

Known limits:
- ...

Needs review from:
- Codex: product / architecture / visual judgment
- Claude Code: integration / type safety / edge cases
- User: human visual check, if applicable
```

Do not hide partial failures. A failed check with a clear note is better than a vague success report.
