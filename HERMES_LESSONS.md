# Hermes Lessons: Direct Light

This file is the Direct Light "mistake memory" for Hermes. Read it before each new task, especially when returning after a quota break or switching agents.

## 2026-06-19: v0.4.5 attach-to-support Review

Hermes completed the main attach-to-support implementation, but the handoff was not complete enough for a multi-agent project.

What was missed:

- Documentation was only partially updated. `COLLABORATION.md` mentioned v0.4.5, but `CLAUDE.md` and `ROADMAP.md` still said attach-to-support was the next unfinished task. That would make Claude, Codex, or Hermes repeat already completed work.
- `HERMES.md` still described attach-to-support as the current next task after it had been implemented.
- Some comments still used an older internal label (`v0.4d`) instead of the app-facing version (`v0.4.5`).
- Code treated any `updatePerson` patch containing `position` as a manual move. Pose preset changes can pass the same position through unchanged, so this accidentally detached a person from a chair/stage when only changing pose.
- Bound-person manual rotation did not update `supportRotationOffset`, so later support rotation could restore an old facing offset.

Rules to follow next time:

1. A feature is not done until docs and code agree about current state.
2. After finishing a task, search the project for the completed task name and the previous version number.
3. Update `CLAUDE.md`, `ROADMAP.md`, `COLLABORATION.md`, and `HERMES.md` when next-task status changes.
4. If a stale sentence is historical, mark it as historical/resolved so it cannot be mistaken for current guidance.
5. In state logic, distinguish "field present in patch" from "meaningful value changed."
6. For relative bindings, update all relative offsets when users edit the bound entity, or clearly detach.
7. Handoff reports must name known edge cases, not just list green checks.

Regression checks added to Hermes expectations:

- Changing pose while a person is on a support must not detach if X/Y/Z are unchanged.
- Changing facing while a person is on a support must preserve the new relative facing when the support rotates later.
- Handoff docs must not leave the completed task listed as "next" or "not done."

## 2026-06-19: v0.4.6 A/B Guidance Overreach

Hermes drafted the A/B compare guidance without waiting for the exact UI copy and write scope requested by Codex/Claude. The code was useful as a draft, but Hermes also advanced the documents as if v0.4.6 were complete.

What was missed:

- Tasks explicitly marked "needs exact UI copy / write scope" must not be self-accepted by Hermes.
- A candidate build can be handed back as a draft, but docs should say "candidate / pending acceptance", not "done".
- Hermes added an empty-B guidance card but left the store's auto-freeze-on-enter behavior in place, so the empty state was normally unreachable.
- Historical v0.4.6 lesson: before v0.4.7 was accepted, docs must not imply v0.4c can start until v0.4.6 is accepted. Current state is now v0.4.7 accepted; do not reuse this as current task guidance.

Rules to follow next time:

1. If a task says it needs Codex/Claude product spec, Hermes must either wait for that spec or label the work as an implementation draft.
2. Before claiming a UI flow works, trace the state path that makes that UI visible.
3. Do not bump roadmap/current-state language from "candidate" to "done" before user acceptance.
4. Do not move to the next version in docs while the current version is still pending review.
