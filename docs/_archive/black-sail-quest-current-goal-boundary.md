# Black Sail Quest / `current_goal` Boundary Note

## Purpose
This note records the **current intended boundary** for the demo branch around:
- `quest_black_sail_trail`
- `vars.current_goal`

It is intentionally narrow and only describes the active Black Sail demo slice.

## Current authority split

### `quest_black_sail_trail` is the primary structure boundary
For the Black Sail branch, quest state is now the main authority for structural progression.

Use quest status / quest step for:
- main branch activation
- repeatable NPC entry gating
- major branch arrival / phase events
- branch progression choices

Examples already migrated:
- Mira intro → `step_find_mira`
- Mira repeat entry → `quest_black_sail_trail: active`
- `evt_compass_lead` → `step_find_mira`
- `evt_harbor_arrival` → `step_find_mira`
- `evt_signal_tower_arrival` → `step_search_signal_tower`
- `evt_harbor_night_signal` → `step_watch_harbor_at_night`
- `evt_pier_arrival` → `step_follow_pier_signal`
- `evt_north_channel_arrival` → `step_investigate_north_channel`
- `evt_coal_berth_arrival` → `step_investigate_black_sail_berth`
- Mira follow-up choices inside `node_harbor_watch_repeat` → quest-step + flag gating

### `current_goal` is now mainly a flow label
Within the Black Sail branch, `vars.current_goal` should now be treated mainly as:
- a lightweight player-facing / debug-facing flow label
- a convenience state for reading "what the player is currently doing"
- a temporary compatibility signal during gradual migration

It should **not** be preferred over quest state for new structural gating in this branch.

## Current classification of remaining Black Sail `current_goal` values

### Flow labels
These mostly describe the player's present investigative intent:
- `investigate_compass`
- `investigate_signal_tower`
- `wait_for_harbor_signal`
- `investigate_pier_signal`
- `investigate_north_channel`
- `investigate_black_sail_berth`

These are still fine to write for readability, but they are no longer the preferred source for main branch gating.

### Still useful as stage-result labels
These still have some value as clear result markers for completed investigations:
- `signal_tower_investigated`
- `pier_message_found`
- `north_channel_investigated`
- `coal_berth_investigated`

These are not the primary structure boundary anymore, but they still communicate meaningful stage results.

## Guidance for future edits
1. If adding new Black Sail branch gating, prefer:
   - `requiredQuests`
   - `requiredQuestSteps`
   - `conditions.quests`
   - `conditions.questSteps`
2. Keep concrete evidence/discovery facts in flags when appropriate.
3. Do not reintroduce large structural dependence on `current_goal` for this branch.
4. If a remaining `current_goal` write no longer improves readability or tests, it is a candidate for later removal.

## Practical rule of thumb
- Use **quest state** to answer: "Where is this branch structurally?"
- Use **flags** to answer: "What concrete evidence or discoveries exist?"
- Use **`current_goal`** to answer: "What is the player currently trying to do?"

## Status
This note reflects the current migration stage only.
It does not require immediate removal of the remaining `current_goal` writes.
