# Narrative / Quest Effect Model Stabilization Plan

## Purpose

This document defines the next active work phase after the `eventHistory` / shared condition system phase.

The previous phase established `eventHistory` as a content-rule input across:

- event selection
- narrative choice visibility
- NPC interaction availability
- NPC debug mismatch reporting

It also validated the horizontal content pattern:

```text
small observation -> light record -> later recap / small branch -> return to or alter existing downstream flow
```

Validated examples include:

- Market return glance
- Black Sail harbor / signal tower observations
- Drowned Lantern customs stairs insight path
- Brine Lark Breaker Culvert horizontal recap

The next phase should now focus on stabilizing what happens **after** a visible choice, event payload, or NPC interaction route is selected: the effect model, quest-step semantics, and content authoring rules around them.

## Phase name

**Narrative / Quest Effect Model Stabilization**

## Current starting point

The current effect model is intentionally lightweight.

`NarrativeChoiceEffects` currently supports state writes and quest effects such as:

- `setFlags`
- `setVars`
- `addVars`
- `addStats`
- `setQuests`
- `startQuest`
- `advanceQuestStep`
- `resetQuestStep`
- `setQuestStep`
- `completeQuest`
- `failQuest`

The current quest model remains:

- `QuestDefinition.stepIds: string[]`
- runtime quest state with `status` and optional `currentStepId`
- no per-step objective objects
- no counters or objective completion tracking yet

This phase should stabilize this lightweight model before introducing larger quest abstractions.

## Goals

### 1. Make effect semantics explicit and test-backed

The deterministic effect application order should be documented, reviewed, and covered by tests where needed.

Key questions to keep clear:

- What runs before quest advancement?
- What runs after `setVars` / `setFlags`?
- Which effects have final precedence?
- How should `completeQuest` interact with `advanceQuestStep`?
- How should `startQuest` behave for inactive, missing, active, completed, or failed runtime entries?

Expected result:

- effect order is easy to explain
- tests model real content usage, not only isolated API calls
- content authors can predict the result of combining multiple effects

### 2. Stabilize quest-step semantics in demo content

Review demo content for quest effects that are technically valid but semantically unclear.

Examples of patterns to check:

- choices that call `advanceQuestStep` even though the quest step has already advanced before reaching the node
- choices that manually use `setQuests` when `startQuest`, `setQuestStep`, or `resetQuestStep` would express intent better
- choices that complete a quest without clearly setting the final player-facing goal
- choices that mutate `vars.current_goal` in ways that no longer match the quest step

Expected result:

- quest step state and `vars.current_goal` tell the same story
- tests use realistic playable states
- content does not rely on impossible or contradictory hand-authored states

### 3. Define authoring rules for effect usage

Create a short set of content authoring rules for when to use each quest-related effect.

Initial proposed rules:

| Intent | Preferred effect |
|---|---|
| Start a quest from its first step | `startQuest` |
| Start a quest at a known non-first step | `startQuest` + `setQuestStep` |
| Move to the next declared step | `advanceQuestStep` |
| Jump to a known step without changing status | `setQuestStep` |
| Return to first declared step without changing status | `resetQuestStep` |
| Mark quest finished | `completeQuest` |
| Mark quest failed | `failQuest` |
| Full compatibility/manual override | `setQuests` |

`setQuests` should remain available, but this phase should reduce unnecessary use of it in new content when a more semantic effect exists.

### 4. Improve validation where it catches real mistakes

Do not build a large DSL or plugin validation framework.

But consider small validation improvements if they catch real current risks, such as:

- `advanceQuestStep` references an unknown quest id
- `setQuestStep` references a step id not in the quest definition
- `resetQuestStep` references a quest with no steps
- content starts/completes/fails unknown quests

Validation improvements should remain content-bundle-level and should not move rule logic into UI.

### 5. Keep horizontal content from becoming quest model sprawl

Recent content work added horizontal observation and recap points. This phase should ensure those points do not create quest-step noise.

A good horizontal point should usually:

- set a focused flag
- optionally set `vars.current_goal`
- optionally unlock a later choice or NPC interaction
- avoid adding a quest step unless it changes the main task sequence

The Brine Lark Breaker Culvert recap is the current reference pattern:

```text
evt_brine_lark_breaker_culvert_return_ripple
-> brine_lark_culvert_rhythm_noted
-> harbor-watch-brine-lark-culvert-recap
-> node_brine_lark_breaker_culvert_activity
```

It deliberately does not add or advance a new Brine Lark main-chain step.

## Non-goals

This phase should **not** introduce:

1. object-based quest steps
2. objective counters
3. generic scripting plugins
4. a large quest DSL
5. UI-owned quest logic
6. broad rewrite of `GameSession`
7. another vertical expansion of Brine Lark governance layers

Those may become future phases, but this phase is about stabilizing the current lightweight model.

## Recommended iteration order

### Iteration 1 — Inventory current effect usage

Produce a small audit of demo content effects:

- where `setQuests` is used
- where `advanceQuestStep` is used
- where `startQuest`, `setQuestStep`, `resetQuestStep` are used
- where quests are completed or failed
- where `vars.current_goal` is updated alongside quest steps

Output should identify:

- correct patterns
- suspicious patterns
- candidates for semantic cleanup

### Iteration 2 — Add or adjust focused tests

Before changing content broadly, add focused tests for the most important semantics:

- `startQuest` from missing runtime quest entry
- `startQuest` on inactive quest
- `startQuest` should not unexpectedly rewind active/completed quests unless explicitly intended
- `setQuestStep` preserves status
- `resetQuestStep` preserves status
- `completeQuest` / `failQuest` final precedence
- combined effects that mirror real demo content

### Iteration 3 — Clean one content chain at a time

Do not clean all content at once.

Suggested order:

1. Drowned Lantern, because it recently exposed quest-step semantic issues
2. Black Sail, because it has many NPC-to-quest transitions
3. Brine Lark, only for consistency around current retained main-chain steps and horizontal recap points

Each cleanup should be small and paired with tests.

### Iteration 4 — Add minimal validation improvements

After the content audit reveals actual failure modes, add only the validation rules that catch those failures.

Avoid speculative validation that has no current content or test case.

### Iteration 5 — Update docs and declare phase completion

Update:

- this plan with completion notes
- `docs/conditions-effects-summary.md` if effect semantics changed
- relevant content docs if a quest chain was cleaned

## Acceptance criteria for this phase

This phase can be considered complete when:

1. quest effect application order is documented and covered by tests
2. demo content no longer contains known contradictory quest-step states
3. `startQuest`, `advanceQuestStep`, `setQuestStep`, `resetQuestStep`, `completeQuest`, and `failQuest` each have clear usage rules
4. at least one real content chain has been audited and cleaned where needed
5. validation catches the most likely authoring mistakes found during the audit
6. all focused and integration tests pass
7. no new Brine Lark vertical governance extension was introduced as part of this phase

## Signs that this phase should stop

Stop this phase and move on when additional work starts requiring one of the non-goals, especially:

- objective counters
- per-step objective objects
- quest dependency graphs
- complex task tracking UI
- content-authoring DSLs

At that point, create a separate phase for quest objective modeling instead of stretching this stabilization phase.

## Recommended first task

Start with a focused audit of current demo narrative effects.

Recommended first deliverable:

```text
A short report listing all quest-related effects in src/content/demo/narrative.ts,
classified as semantic / suspicious / legacy-compatible.
```

Output:

- `docs/narrative-quest-effects-audit.md`

Then pick one small cleanup target from that report.

---

## Completion notes (2026-04-24)

This phase is **complete**.

### What was done

#### Iteration 1 — Inventory

- Produced `docs/narrative-quest-effects-audit.md` classifying all quest-related effects in `src/content/demo/narrative.ts`.
- Counted: `startQuest=4`, `advanceQuestStep=66`, `resetQuestStep=1`, `setQuestStep=1 field`, `setQuests=4`, `completeQuest=5`, `failQuest=0`.
- Classified 4 manual `setQuests` activations as suspicious/legacy-compatible.

#### Iteration 2 — Focused tests

- Added 3 semantic protection tests to `tests/quest-effects.test.cjs`:
  - `startQuest should not rewind already active quest`
  - `startQuest should not reopen completed quest`
  - `startQuest should not reopen failed quest`
- Tests initially revealed a gap: `startQuest` was unconditionally setting `active` + `firstStep`, ignoring current status.
- Fixed `src/engine/narrative/effects.ts` to guard with `if (current?.status === "inactive" || !current)`.
- All 23 quest-effects tests pass.

#### Iteration 3 — Content cleanup

Replaced all 4 manual `setQuests` quest activations with semantic `startQuest`:

| Choice | Quest | Replaced |
|---|---|---|
| `offer_help_with_sting` | `quest_black_sail_sting` | ✅ |
| `ask_where_to_start_tracking_drowned_lantern` | `quest_drowned_lantern` | ✅ |
| `ask_where_brine_lark_runs_goods_from_insight` | `quest_brine_lark` | ✅ |
| `ask_where_brine_lark_runs_goods` | `quest_brine_lark` | ✅ |

`setQuests` is no longer used for quest activation in `src/content/demo/narrative.ts`.

#### Iteration 4 — Validation

No new validation rules were added. The audit did not reveal real authoring mistakes — the 4 replaced `setQuests` were intentional manual activations that happened to work correctly. The cleanup replaced them with semantically clearer `startQuest` without changing runtime behavior.

#### Iteration 5 — Docs

- Updated `docs/conditions-effects-summary.md`:
  - Expanded "What changed" from 3 to 6 effects (added `startQuest`, `resetQuestStep`, `setQuestStep`)
  - Fixed effect application order to show full Phase 3 (`startQuest / resetQuestStep / setQuestStep / advanceQuestStep`)
  - Added `startQuest semantics` section with status-preservation table
  - Updated demo content examples (`go_market`, `offer_help_with_sting`)
  - Added 2 new limitations (first-step-only, no per-step objective tracking)
  - Added 2 new test entries (idempotency, missing-entry creation)

### Acceptance criteria

| Criterion | Status |
|---|---|
| Effect application order documented and test-backed | ✅ |
| No known contradictory quest-step states in demo content | ✅ |
| `startQuest`, `advanceQuestStep`, `setQuestStep`, `resetQuestStep`, `completeQuest`, `failQuest` have clear usage rules | ✅ documented in `conditions-effects-summary.md` |
| At least one real content chain audited and cleaned | ✅ all 4 `setQuests` activations replaced |
| Validation catches likely authoring mistakes | ✅ no regressions found; no speculative validation added |
| All focused and integration tests pass | ✅ 145 tests, all pass |
| No Brine Lark vertical governance extension introduced | ✅ |

### Key engine decision made this phase

`startQuest` now only activates quests that are `inactive` or missing. This makes it idempotent and safe to call repeatedly — active, completed, and failed quests are left untouched. The authoring intent ("start this quest") is preserved while accidental state corruption is prevented.

### Related documentation updated

- `docs/narrative-quest-effects-audit.md` — all 4 cleanup targets marked ✅ Done
- `docs/conditions-effects-summary.md` — effect model section fully updated
- `docs/narrative-quest-effect-model-stabilization-plan.md` — this file
