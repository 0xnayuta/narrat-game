# Current Prototype Architecture

## Scope
This document describes the **current active prototype path** only.
It does not describe every skeleton file in `src/engine`; some files are intentionally retained as future placeholders and are not part of the running demo.

Related notes:
- `docs/black-sail-quest-current-goal-boundary.md` — current boundary for `quest_black_sail_trail` vs `vars.current_goal` in the Black Sail demo branch.
- `docs/narrative-quest-effect-model-stabilization-plan.md` — active next-phase plan for stabilizing narrative effects, quest-step semantics, and content authoring rules.

## Current runtime entry
Two runtime entries currently exist:

1. **Narrat template path**
   - `src/index.ts`
   - Default behavior when `VITE_DEMO_UI` is not enabled.

2. **Prototype demo UI path**
   - `src/index.ts`
   - Enabled when `VITE_DEMO_UI=true`
   - Mounts `src/app/DemoApp.vue`

The prototype work in this repository is centered on the **demo UI path**.

## Active main path
The current prototype main path is:

1. `src/app/DemoApp.vue`
2. `src/app/createDemoSession.ts`
3. `src/content/demo/loader.ts`
4. `src/content/demo/bundle.ts`
5. `src/engine/runtime/createSessionFromBundle.ts`
6. `src/engine/runtime/GameSession.ts`

From there, runtime behavior flows into:
- `src/engine/conditions/*` — shared condition matching primitives
- `src/engine/world/*` — NPC interaction systems
- `src/engine/time/*` — time advancement
- `src/engine/events/*` — event filtering, selection, history
- `src/engine/narrative/*` — runtime + effects
- `src/engine/save/*` — save/load
- `src/engine/quests/*` — quest state creation + step advancement
- `src/engine/state/*` — game state store
- `src/engine/content/*` — validation + bundle types
- `src/engine/rng/*` — injectable randomness

## Layer boundaries

### Content layer
Location: `src/content/demo/*`

Responsibility:
- Provide demo locations
- Provide demo events (with conditions: location, time, flags, vars, quests, questSteps)
- Provide demo narrative graph (with effects: setFlags, setVars, setQuests, advanceQuestStep, completeQuest, failQuest)
- Provide demo quests (with step definitions for advancement)
- Provide demo NPCs (with interaction rules gated by flags, quest status, quest steps, vars, time-of-day)
- Expose a unified `demoContentBundle`
- Expose a minimal loader/repository entry

Content layer should not contain engine orchestration logic.

### Engine layer
Location: `src/engine/*`

Responsibility:
- Define core runtime contracts and types
- Manage game state
- Advance time
- Handle travel/navigation
- Filter and trigger events
- Apply shared condition matching (events + NPCs use the same primitives)
- Run narrative nodes and apply choice effects
- Manage quest step advancement
- Save/load `GameState`
- Create `GameSession` from a validated content bundle

Current public engine facade:
- `src/engine/index.ts`

### App/UI layer
Location: `src/app/*`, `src/ui/text-rpg/*`

Responsibility:
- Select which content bundle to load
- Create a session from the bundle
- Render state and scene data
- Forward user input to `GameSession`
- Show debug/status info
- Trigger save/load actions

UI should not own core event, time, or quest rules.

## Core active runtime objects

### `ContentBundle`
File:
- `src/engine/content/bundle.ts`

Purpose:
- Defines the engine-facing content boundary
- Bundles locations, events, narrative, quests, NPCs, initial flags, and initial vars

Note:
- In the current prototype, location runtime state is intentionally represented by
  `GameState.currentLocationId` rather than a separate `LocationState` object.
- This is the current first-version boundary for active location state.

### `GameSession`
File:
- `src/engine/runtime/GameSession.ts`

Purpose:
- Main interaction orchestrator for the current prototype
- Tracks app mode (`free-roam` / `in-scene`)
- Handles:
  - `travelTo(...)`
  - `choose(...)`
  - `closeScene()`
  - `restoreState(...)`
  - `interactWithNpc(...)`

Constructor parameters:
- `store: GameStateStore`
- `locationService: LocationService`
- `events: EventDefinition[]`
- `narrativeRuntime: NarrativeRuntime`
- `npcs: NPCDefinition[]`
- `quests: QuestDefinition[]`
- `options: GameSessionOptions` (randomFloat, eventHistoryWriteStrategy)

Note:
- `GameSession` is the current top-level runtime boundary for the active prototype path.
- `src/engine/core/Engine.ts` is still retained as a future skeleton and is not the current live runtime entry.

### `NarrativeRuntime`
File:
- `src/engine/narrative/NarrativeRuntime.ts`

Purpose:
- Reads current node
- Exposes text and choices
- Applies node jumps after choice selection

### `SaveService`
File:
- `src/engine/save/SaveService.ts`

Purpose:
- Saves and loads versioned `GameState`
- Current demo UI uses it directly for minimal save/load buttons

## Key types

### `EventDefinition`
File: `src/engine/types/events.ts`

Fields:
- `id`, `type`, `trigger` (required)
- `once?: boolean`
- `priority?: number` (default `0`)
- `weight?: number` (invalid → treated as `0`)
- `cooldownMinutes?: number` (invalid → disabled)
- `conditions?: EventConditions`
- `payload?: Record<string, unknown>`

### `EventConditions`
File: `src/engine/types/events.ts`

Fields:
- `locationIds?: string[]`
- `timeRange?: { startHour: number; endHour: number }`
- `flags?: Record<string, boolean>`
- `vars?: Record<string, ScalarConditionValue>`
  - direct equality (`string | number | boolean`)
  - numeric comparisons (`{ ">=": n }`, `{ ">": n }`, `{ "<=": n }`, `{ "<": n }`, and combinable ranges)
- `quests?: Record<string, "inactive" | "active" | "completed" | "failed">` (status match)
- `questSteps?: Record<string, string>` (currentStepId match; quest must exist)

### `NarrativeChoiceEffects`
File: `src/engine/types/narrative.ts`

Fields:
- `setFlags?: Record<string, boolean>`
- `setVars?: Record<string, string | number | boolean>`
- `setQuests?: Record<string, { status; currentStepId? }>` (low-level override; prefer `startQuest`)
- `startQuest?: string[]` (activates inactive or missing quest at its first step; preserves active/completed/failed status)
- `advanceQuestStep?: string[]` (advances to next step in QuestDefinition.stepIds order)
- `resetQuestStep?: string[]` (returns quest to its first step without changing status)
- `setQuestStep?: Record<string, string>` (jumps to a known step without changing status)
- `completeQuest?: string[]` (sets status to "completed")
- `failQuest?: string[]` (sets status to "failed")
- `addVars?: Record<string, number>` (numeric deltas; missing/non-number keys treated as 0; applied after setVars)
- `addStats?: Record<string, number>` (numeric deltas to player stats; missing keys treated as 0)

### `ChoiceOption`
File: `src/engine/types/narrative.ts`

Fields:
- `id: string`
- `text: string`
- `nextNodeId: string`
- `effects?: NarrativeChoiceEffects`
- `conditions?: EventConditions` (only show when all conditions match; omit to always show)

### `NPCInteractionConditions`
File: `src/engine/types/world.ts`

Fields:
- `requiredFlags?: Record<string, boolean>`
- `requiredQuests?: Record<string, "inactive" | "active" | "completed" | "failed">`
- `requiredQuestSteps?: Record<string, string>` (currentStepId match)
- `requiredVars?: Record<string, string | number | boolean>`
- `requiredTimeOfDay?: "morning" | "afternoon" | "evening" | "night"`

### `GameState`
File: `src/engine/types/state.ts`

Fields:
- `player: PlayerState`
- `time: TimeState`
- `currentLocationId: string`
- `flags: Record<string, boolean>`
- `quests: Record<string, QuestProgress>`
- `inventory: Record<string, number>`
- `vars: Record<string, string | number | boolean>`
- `eventHistory?: EventHistoryState` (primary event history boundary)

### `EventHistoryState`
File: `src/engine/types/events.ts`

Fields:
- `onceTriggeredByEventId: Record<string, boolean>`
- `cooldownLastTriggeredMinuteByEventId: Record<string, number>`

## Current interaction flow

### Travel flow
1. UI calls `session.travelTo(locationId)`
2. `GameSession` verifies mode allows travel
3. `runTravelEventFlow(...)`:
   - updates location
   - advances time
   - checks location/time events (filtered by trigger → once → cooldown → conditions)
   - resolves by priority → weight
   - starts narrative if an event hits
4. UI receives updated state + current scene

### Event selection rule
Candidate filtering order:
1. **trigger** — only events matching the current trigger phase
2. **once** — exclude already-triggered once-only events
3. **cooldown** — exclude events with active cooldown
4. **conditions** — location, time, flags, vars, quests, questSteps

Resolution order:
1. **priority** — highest `priority` wins (default `0`)
2. **weight** — within same-priority group, weighted random selection
   - invalid weight (negative/NaN) → treated as `0`
   - if all effective weights are `0`, fall back to content order
3. **RNG** — injectable `randomFloat` for deterministic tests; default uses `RngService.nextFloat()`

Content author notes:
- `priority` decides which candidate group is considered first; `weight` never overrides a lower-priority event.
- `weight` is evaluated only after trigger/once/cooldown/conditions filtering is complete.
- If multiple highest-priority events all have effective `weight = 0`, content order is used as deterministic fallback.
- `cooldownMinutes` only affects candidate availability; it does not change priority/weight semantics.

### Choice flow
1. UI renders only visible choices (filtered by `buildSceneView()`)
2. UI calls `session.choose(choiceId)`
3. `GameSession` validates the choice is visible (conditions match current state)
4. `NarrativeRuntime` advances to the next node
5. Choice effects are applied in deterministic order:
   1. `setFlags` / `setVars` / `setQuests` — direct state writes
   2. `addVars` / `addStats` — numeric deltas (applied after setVars so base values are set first)
   3. `startQuest` / `resetQuestStep` / `setQuestStep` / `advanceQuestStep` — quest progression actions (Phase 3 runs before Phase 4, so `completeQuest` takes final precedence)
   4. `completeQuest` / `failQuest` — status overrides (final precedence)

   `startQuest` is idempotent: it activates inactive or missing quests at their first step, but leaves active, completed, or failed quests untouched.
6. Post-choice event check runs with trigger `after-choice`
7. If a follow-up event hits, it replaces the current scene

Choices with `conditions` that don't match the current state are hidden from the player.
If all choices are hidden, `canCloseScene()` returns `true`.

### NPC interaction flow
1. UI queries `session.getAvailableNpcs()` — returns interactions matching current state
2. UI calls `session.interactWithNpc(npcId)`
3. `GameSession` resolves the matching interaction rule
4. `NarrativeRuntime` jumps to the interaction's `nodeId`
5. Player makes choices through the normal choice flow (which triggers after-choice events)

NPC interaction matching uses a different condition schema from events but shares the same underlying matching primitives:
- `src/engine/conditions/shared.ts` provides `matchesBooleanRecord`, `matchesScalarRecord`, `matchesQuestStatusRecord`, `matchesQuestStepRecord`
- Both event conditions and NPC conditions use these primitives

### Scene close flow
1. Scene reaches a node with no choices
2. UI shows `Continue`
3. UI calls `session.closeScene()`
4. Session returns to `free-roam`

### Save/load flow
1. UI calls `SaveService.save(slotId, session.getState())`
2. UI calls `SaveService.load(slotId)`
3. Loaded `GameState` is restored through `session.restoreState(...))`
4. Save deserialization auto-migrates legacy event history keys into `eventHistory`
5. Scene is cleared and app returns to `free-roam`

## Event history

### Storage
- **Primary**: `GameState.eventHistory` (`EventHistoryState`)
- **Legacy compatibility read**: `GameState.flags["event.once.*"]` and `GameState.vars["event.cooldown.*"]`
- **Default write strategy**: `slice-only` (writes only to `eventHistory`)
- **Alternative**: `dual-write` (writes to both `eventHistory` and legacy keys)

### Migration
- `migrateLegacyEventHistoryToSlice(state)` — projects legacy keys into `eventHistory`
- Called automatically during save deserialization
- Adapter read layer (`readEventHistoryState`) prefers `eventHistory`, falls back to legacy

## Shared condition matching

File: `src/engine/conditions/shared.ts`

Primitive functions shared by event and NPC condition systems:
- `matchesBooleanRecord(actual, expected?, { missingBooleanValue? })` — flag matching
- `matchesScalarRecord(actual, expected?)` — var matching (equality + numeric comparison predicates)
- `matchesQuestStatusRecord(quests, expected?)` — quest status matching
- `matchesQuestStepRecord(quests, expected?)` — quest currentStepId matching

These are used by:
- `src/engine/events/conditions.ts` — event condition evaluation
- `src/engine/world/NpcInteractionMatcher.ts` — NPC condition evaluation (+ debug reasons)

## Quest step advancement

File: `src/engine/quests/QuestService.ts`

- `advanceQuestStep(questId, quests, stepIndex)` — pure function, returns `{ status, currentStepId, wasAtLastStep }`
- `getFirstQuestStepId(questId, stepIndex)` — returns the first step of a quest definition
- `setQuestStep(questId, stepId, quests, stepIndex)` — jumps to a known step, preserves status
- `resetQuestStep(questId, quests, stepIndex)` — returns to first step, preserves status
- `buildQuestStepIndex(definitions)` — builds questId → stepIds lookup
- At last step: stays at current step, sets `wasAtLastStep = true` (does NOT auto-complete)
- Content authors must explicitly use `completeQuest` effect for quest completion

## Content validation

File: `src/engine/content/validation.ts`

Validates the full content bundle structure including:
- Event conditions: locationIds, timeRange, flags, vars, quests, questSteps
- NPC interactions: requiredFlags, requiredQuests, requiredQuestSteps, requiredVars, requiredTimeOfDay
- Quest definitions: id, title, status, stepIds

## Current demo guarantees
The current prototype demonstrates:
- location movement and travel time
- time advancement
- event triggering with full condition filtering (location, time, flags, vars, quest status, quest step)
- priority-first + weight-based event selection
- injectable RNG for deterministic testing
- once-only events and per-event cooldown
- post-choice follow-up events
- narrative node rendering with multiple choice effects
- quest progression (startQuest, advanceQuestStep, resetQuestStep, setQuestStep, completeQuest, failQuest)
- `startQuest` is idempotent and preserves active/completed/failed quests
- NPC interactions gated by flags, quest status, quest steps, vars, time-of-day, eventHistory
- NPC → choice → after-choice event closed loop
- conditional choice visibility (choices gated by flags, vars, quest status, quest step, eventHistory)
- explicit scene lifecycle
- save/load with event history migration
- slice-only event history as default
- debug/status visibility in UI

## Demo content closed loops
Two complete content loops exist in the demo:

### Main loop
1. Travel to street → arrival event
2. Choose "Head to market" → `startQuest` + `setQuestStep` (activates quest at non-first step)
3. Travel to market → market event
4. Choose "Look around the stalls" → `advanceQuestStep`
5. Choose "Finish the walk" → `completeQuest`
6. NPC "Talk to Vendor" unlocks (quest completed + correct vars + morning)
7. Choose "Ask how business is going" → sets vendor_met flag + vars
8. After-choice event `evt_vendor_aftermath` triggers

### Side loop
1. At market with active quest at step_go_market → stall discovery event
2. Choose "Step closer" → advances quest step to step_examine_stall
3. NPC "Ask about the oddities stall" unlocks (quest step + flag)
4. Choose "Thank the vendor" → sets new goal

## Test suite

| Suite | File | Count | Scope |
|---|---|---|---|
| test:events | events-selector + events-history | 33 | Event filtering, selection, history, cooldown |
| test:save | save-roundtrip | 3 | Save/load, event history migration |
| test:npc-matcher | npc-interaction-matcher | 18 | NPC condition matching + debug reasons + eventHistory |
| test:narrative | narrative-runtime | 3 | Narrative graph navigation |
| test:demo-session | demo-session | 7 | Session integration (RNG, cooldown, slice-only, flow) |
| test:demo-flow | demo-flow | 1 | Full demo content chain |
| test:quest-effects | quest-effects | 23 | Quest step advancement + effect application order + startQuest semantics |
| test:npc-event-loop | npc-event-loop | 33 | NPC → choice → event closed loop + horizontal content paths |
| test:choice-visibility | choice-visibility | 17 | Conditional choice filtering + session integration |
| test:add-vars | add-vars-stats | 10 | addVars / addStats numeric deltas |
| test:initial-vars | initial-vars | 3 | ContentBundle initialVars + demo gold |
| test:npc | npc-service | 4 | NPC service + debug info |
| test:content | content-bundle | 1 | Content bundle validation |
| test:demo-branch | demo-content-branch | 8 | Branch visibility + gameplay paths |

**Total: 145 tests**

## Files currently kept as skeletons
Some files are intentionally retained but are **not part of the active main path**.
Examples include:
- `src/engine/script/*`
- `src/engine/content/SceneRepo.ts`
- `src/engine/core/Engine.ts`
- `src/engine/modules/*`

Their comments have been updated to mark them as skeleton-only.

## Recommended mental model
For the current repository state, the safest mental model is:

- **ContentBundle is the content boundary**
- **GameSession is the current runtime boundary**
- **DemoApp is the current UI boundary**
- **shared.ts condition primitives keep Event and NPC systems consistent**
- **eventHistory is the primary event history boundary** (legacy keys are compatibility reads only)

If future work adds more systems, these boundaries should remain stable unless there is a clear reason to change them.
