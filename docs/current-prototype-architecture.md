# Current Prototype Architecture

## Scope
This document describes the **current active prototype path** only.
It does not describe every skeleton file in `src/engine`; some files are intentionally retained as future placeholders and are not part of the running demo.

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
- `src/engine/world/*`
- `src/engine/time/*`
- `src/engine/events/*`
- `src/engine/narrative/*`
- `src/engine/save/*`
- `src/engine/quests/*`
- `src/engine/state/*`

## Layer boundaries

### Content layer
Location: `src/content/demo/*`

Responsibility:
- Provide demo locations
- Provide demo events
- Provide demo narrative graph
- Provide demo quests and NPC placeholders
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
- Run narrative nodes and apply choice effects
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
- Bundles locations, events, narrative, quests, NPCs, and initial flags

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

## Current interaction flow

### Travel flow
1. UI calls `session.travelTo(locationId)`
2. `GameSession` verifies mode allows travel
3. `runTravelEventFlow(...)`:
   - updates location
   - advances time
   - checks location/time events
   - starts narrative if an event hits
4. UI receives updated state + current scene

### Event selection rule (current)
- Event candidates are filtered by trigger/conditions/once history.
- Selection is priority-first:
  - higher `priority` wins
  - `priority` defaults to `0` when omitted.
- When multiple candidates share the same highest `priority`, selector applies `weight`.
  - invalid `weight` (negative/NaN) is treated as `0`
  - if all effective weights are `0`, it falls back to original content order
  - runtime can inject RNG for deterministic tests; default session path uses `RngService.nextFloat()`
- `cooldown` is not implemented yet in the active path.

Content author notes:
- `priority` decides which candidate group is considered first; `weight` never overrides a lower-priority event.
- `weight` is evaluated only after trigger/conditions/once filtering is complete.
- If multiple highest-priority events all have effective `weight = 0`, content order is used as deterministic fallback.

### Choice flow
1. UI calls `session.choose(choiceId)`
2. `NarrativeRuntime` advances to the next node
3. Choice effects update:
   - flags
   - vars
   - quests
4. Post-choice event check runs with trigger `after-choice`
5. If a follow-up event hits, it replaces the current scene

### Scene close flow
1. Scene reaches a node with no choices
2. UI shows `Continue`
3. UI calls `session.closeScene()`
4. Session returns to `free-roam`

### Save/load flow
1. UI calls `SaveService.save(slotId, session.getState())`
2. UI calls `SaveService.load(slotId)`
3. Loaded `GameState` is restored through `session.restoreState(...)`
4. Scene is cleared and app returns to `free-roam`

## Current demo guarantees
The current prototype demonstrates:
- location movement
- time advancement
- event triggering
- once-only events
- post-choice follow-up events
- narrative node rendering
- choice-driven state updates
- quest progression
- explicit scene lifecycle
- save/load of stable runtime state
- debug/status visibility in UI

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

If future work adds more systems, these three boundaries should remain stable unless there is a clear reason to change them.
