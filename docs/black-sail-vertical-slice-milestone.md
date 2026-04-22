# Black Sail Vertical Slice Milestone

## Purpose
This note records the current **stable milestone state** of the Black Sail demo branch.

It is intended as a short checkpoint after the recent quest-step migration, test cleanup, and minimal branch completion pass.

## Current playable slice
The current Black Sail demo slice now forms a continuous path:

1. Vendor stall clue
2. Compass / harbor lead
3. Mira intro at harbor watch
4. Signal tower investigation
5. Night harbor signal
6. Pier investigation
7. North channel investigation
8. Coal berth investigation
9. Return to Mira with the ledger scrap
10. Mira confirms the Black Sail smuggling line and `quest_black_sail_trail` completes

## Current structure boundary
For this branch, the intended runtime split is now:
- **Quest state** = main structural progression boundary
- **Flags** = concrete evidence / discoveries
- **`current_goal`** = lightweight flow label / readability signal

Related note:
- `docs/black-sail-quest-current-goal-boundary.md`

## What is now proven
The current slice now demonstrates that the prototype can support:

1. **Quest-driven branch activation**
   - `quest_black_sail_trail` activates from content choices

2. **Quest-step-driven gating across multiple surfaces**
   - NPC interaction entry
   - repeat NPC interaction availability
   - choice visibility
   - arrival / phase events

3. **Flag-backed evidence progression**
   - discoveries remain concrete world-state facts
   - quest step does not replace evidence flags

4. **After-choice event continuation**
   - NPC dialogue choices can trigger follow-up events through the normal runtime path

5. **Minimal branch completion**
   - the branch no longer stops at "found another clue"
   - it now reaches a small but explicit completion beat

## Current Black Sail quest shape
`quest_black_sail_trail` currently progresses through:
- `step_find_mira`
- `step_search_signal_tower`
- `step_watch_harbor_at_night`
- `step_follow_pier_signal`
- `step_decode_pier_message`
- `step_investigate_north_channel`
- `step_investigate_black_sail_berth`

Current completion beat:
- report the coal berth ledger to Mira
- set `black_sail_network_confirmed = true`
- complete `quest_black_sail_trail`

## Regression status at this milestone
Verified in this round:
- `npm run test:npc-event-loop`
- `npm run test:demo-session`
- `npm run test:quest-effects`
- `npm run test:choice-visibility`

Observed result:
- all tests passed

## What this milestone is not
This milestone does **not** mean:
- the Black Sail line is content-complete
- the world reacts broadly to quest completion yet
- the branch has downstream arrest / confrontation / faction consequences
- all remaining `current_goal` writes have been removed

It means the current demo branch is now a **stable, test-backed, end-to-end vertical slice**.

## Recommended next-step posture
After this checkpoint, prefer:
1. small content extensions from the completed branch endpoint, or
2. small cleanup/documentation steps that preserve the quest-first boundary

Avoid reintroducing new structural dependence on `current_goal` for this branch.
