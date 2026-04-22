# Conditions & Effects System Summary

## Scope
This document summarizes the condition system enhancement and narrative/quest effect model enhancement, completed after the event selection phases (A/B/C).

## Condition system

### What changed
Event conditions and NPC interaction conditions were previously asymmetric:
- NPC conditions supported `requiredFlags`, `requiredQuests`, `requiredVars`, `requiredTimeOfDay`
- Event conditions only supported `locationIds`, `timeRange`, `flags`

After enhancement, both systems have near-parity:

| Condition type | Event field | NPC field | Matching primitive |
|---|---|---|---|
| Flags | `flags` | `requiredFlags` | `matchesBooleanRecord` |
| Vars | `vars` | `requiredVars` | `matchesScalarRecord` |
| Quest status | `quests` | `requiredQuests` | `matchesQuestStatusRecord` |
| Quest step | `questSteps` | `requiredQuestSteps` | `matchesQuestStepRecord` |
| Location | `locationIds` | — (NPC uses homeLocationId) | direct includes check |
| Time range | `timeRange` | — | `isInTimeRange` |
| Time of day | — | `requiredTimeOfDay` | `getTimeOfDay` |

### Shared primitives
File: `src/engine/conditions/shared.ts`

All equality-matching primitives are extracted into a shared module:
- `matchesBooleanRecord(actual, expected?, { missingBooleanValue? })`
- `matchesScalarRecord(actual, expected?)`
- `matchesQuestStatusRecord(quests, expected?)`
- `matchesQuestStepRecord(quests, expected?)`

Both systems consume these primitives:
- `src/engine/events/conditions.ts` — `matchesAllEventConditions` delegates to shared primitives
- `src/engine/world/NpcInteractionMatcher.ts` — uses shared primitives for fast-path check, then iterates for debug reasons

### Matching semantics
- **Flags**: boolean equality; missing keys default to `false`
- **Vars**: supports
  - strict equality (`string | number | boolean`)
  - numeric comparison predicates (`>=`, `>`, `<=`, `<`) with AND semantics when combined
  - missing keys always mismatch
- **Quest status**: matches `QuestProgress.status`; missing quest always mismatches
- **Quest steps**: matches `QuestProgress.currentStepId`; missing quest always mismatches
- Quest status and quest steps are independent conditions (both can be used on the same quest)

### Content validation
`src/engine/content/validation.ts` validates both event conditions and NPC conditions:
- `hasValidEventConditions` — checks locationIds, timeRange, flags, vars, quests, questSteps
- NPC interaction validation — checks requiredFlags, requiredQuests, requiredQuestSteps, requiredVars, requiredTimeOfDay

### Testing
- Event selector tests: vars filter, quest status filter, quest step filter
- NPC matcher tests: quest step match, quest step mismatch reasons
- Demo content: `evt_market_stall_discovery` uses `vars` + `quests` + `questSteps` simultaneously
- NPC content: `vendor-stall-tip` uses `requiredQuestSteps` + `requiredFlags`

## Effect model

### What changed
`NarrativeChoiceEffects` previously only supported direct state writes (`setFlags`, `setVars`, `setQuests`).

After enhancement, three convenience effects were added:
- `advanceQuestStep?: string[]` — advance quest to next step in QuestDefinition.stepIds order
- `completeQuest?: string[]` — set quest status to "completed"
- `failQuest?: string[]` — set quest status to "failed"

### Effect application order
Effects are applied in a deterministic order (defined in `src/engine/narrative/effects.ts`):

1. **setFlags / setVars / setQuests** — direct state writes
2. **addVars / addStats** — numeric deltas (run after setVars so base values are set first)
3. **advanceQuestStep** — step progression (operates on the result of phase 1)
4. **completeQuest / failQuest** — status overrides (take final precedence)

This order means:
- You can combine `setQuests` (e.g. activate a quest) with `advanceQuestStep` in the same choice
- `completeQuest` always wins over previous status changes in the same effect set

### Quest step advancement
File: `src/engine/quests/QuestService.ts`

`advanceQuestStep(questId, quests, stepIndex)`:
- Pure function, does not mutate input
- Returns `{ status, currentStepId, wasAtLastStep }` or `null` if quest not found
- At last step: stays at current step, `wasAtLastStep = true`
- Does NOT auto-complete: content authors must explicitly include `completeQuest` for completion
- Requires `QuestDefinition[]` (passed through from GameSession)

When `advanceQuestStep` is used in effects but `questDefinitions` is not provided:
- `applyNarrativeChoiceEffects` throws an error

### GameSession integration
- `GameSession` constructor now takes `quests: QuestDefinition[]`
- `applyNarrativeChoiceEffects(state, effects, questDefinitions?)` — third parameter required for advanceQuestStep
- `createGameSessionFromBundle` passes `validBundle.quests` automatically

### Demo content usage
- `finish_walk` choice: `completeQuest: ["quest_intro_walk"]` (instead of manual `setQuests`)
- `explore_stall` choice: `advanceQuestStep: ["quest_intro_walk"]` (instead of manual `setQuests`)
- `go_market` choice: still uses `setQuests` (changes both status and step simultaneously)

### Testing
- Pure `advanceQuestStep` tests: next step, last step, single step, unknown quest, empty steps, unknown currentStepId
- Effect application order tests: setQuests + advanceQuestStep + completeQuest combination
- Error handling: advanceQuestStep without questDefinitions throws
- Multiple quest advancement in one effect
- completeQuest precedence over advanceQuestStep for same quest

## Conditional choice visibility

### What changed
`ChoiceOption` now supports an optional `conditions?: EventConditions` field.
When present, the choice is only shown to the player when all conditions match the current game state.
When omitted, the choice is always visible.

This reuses the same `EventConditions` type and `matchesAllEventConditions` evaluation used by events.

### Implementation
File: `src/engine/narrative/visibility.ts`

- `filterVisibleChoices(choices, state)` — filters choices whose conditions match
- `getVisibleChoiceViewModels(choices, state)` — filters and converts to view model

`GameSession` integration:
- All scene-building paths use `buildSceneView()`, which calls `filterVisibleChoices`
- `choose()` validates the selected choice is visible before executing
- Choosing a hidden choice throws `Choice not available`

### Behavior when all choices are hidden
When every choice in a node has conditions that don't match:
- The player sees the node text with no choices
- `canCloseScene()` returns `true` (same as a node with no choices by design)
- This is useful for "locked door" patterns where the player sees the description but can't interact

### Content validation
`hasValidNarrative` in `src/engine/content/validation.ts` now validates:
- Each choice's `id`, `text`, `nextNodeId`
- Each choice's optional `conditions` (reuses `hasValidEventConditions`)

### Demo content
`node_vendor_intro` includes a conditional choice:
```ts
{
  id: "ask_vendor_about_stall",
  text: "Ask about the oddities stall",
  nextNodeId: "node_vendor_stall_tip",
  conditions: { flags: { stall_discovered: true } },
  effects: { setFlags: { vendor_met: true }, setVars: { last_npc_spoken: "npc_vendor_01" } },
}
```
This choice only appears if the player has already discovered the oddities stall.

### Testing
File: `tests/choice-visibility.test.cjs` (9 tests)
- Pure function tests: unconditional, matching conditions, non-matching, vars, questSteps
- Session integration: hidden choices, visible choices, choosing hidden choice throws
- Edge case: all choices hidden → canCloseScene returns true

## Current limitations
1. **Predicate set is minimal** — vars currently support only equality + numeric comparisons (`>=`, `>`, `<=`, `<`)
2. **No OR/NOT composition** — predicates are simple AND constraints
3. **addVars only supports numeric deltas** — no string concatenation or set operations
4. **advanceQuestStep doesn't auto-complete** — intentional; requires explicit `completeQuest`
5. **Hidden choices are fully invisible** — no "shown but disabled" (grayed out) option
6. **Debug reasons only for NPC** — event conditions return boolean only; no mismatch reason reporting

## Possible future directions
- Richer predicate operators for vars (e.g. not-equals, in-list, regex)
- OR/NOT composition for complex conditions
- "Shown but disabled" choice display mode
- Event condition debug reasons (similar to NPC mismatch reasons)
- `autoCompleteOnLastStep` option for `advanceQuestStep`
- `addVars` for string concatenation or set operations
- ContentBundle `initialVars` for setting starting var values
