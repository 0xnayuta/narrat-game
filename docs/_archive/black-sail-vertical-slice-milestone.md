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
11. Player offers to help with the harbor sting
12. Night stakeout begins
13. Black Sail contact appears
14. Mira closes the net
15. The berth is secured and `quest_black_sail_sting` completes
16. Mira identifies the Drowned Lantern lead from the seized material
17. The lead is clarified as a contact alias
18. The customs-side sheds become the next search point
19. The first Drowned Lantern trace is recovered
20. The dawn exchange window is decoded
21. Brine Lark is marked as the next target and `quest_drowned_lantern` completes

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

6. **Three-phase quest chaining**
   - the demo now supports one quest phase completing and additional follow-up quest phases activating, advancing, and completing in sequence

## Current Black Sail quest shape
The Black Sail demo slice is now split into three small quest phases.

### `quest_black_sail_trail`
Responsibility:
- investigate the line
- gather proof
- confirm that Black Sail is real and active

Current steps:
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

### `quest_black_sail_sting`
Responsibility:
- prepare the harbor sting
- hold the stakeout
- begin and resolve the first net-closing beat

Current steps:
- `step_prepare_stakeout`
- `step_hold_stakeout`
- `step_close_the_net`

Current completion beat:
- offer help with the sting
- begin the stakeout
- close the net
- help secure the berth
- set `black_sail_sting_resolved = true`
- complete `quest_black_sail_sting`

Current status:
- `quest_black_sail_sting` now forms a minimal closed loop of its own:
  - activate
  - advance by step
  - complete

### `quest_drowned_lantern`
Responsibility:
- carry the post-sting follow-up lead
- move from alias → location trace → exchange window → concrete suspect target

Current steps:
- `step_search_customs_sheds`
- `step_trace_dawn_exchange`
- `step_identify_drowned_lantern_contact`

Current completion beat:
- begin tracing the Drowned Lantern contact
- search the customs-side sheds
- decode the dawn exchange timing
- narrow the line to Brine Lark as the next target
- set `brine_lark_identified_as_target = true`
- complete `quest_drowned_lantern`

Current status:
- `quest_drowned_lantern` now forms a minimal closed loop of its own:
  - activate
  - advance by step
  - complete

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

It means the current demo branch is now a **stable, test-backed, end-to-end vertical slice** with a minimal three-phase quest structure, where each quest phase now reaches its own explicit completion beat.

## Recommended next-step posture
After this checkpoint, prefer:
1. small content extensions from the completed branch endpoint, or
2. small cleanup/documentation steps that preserve the quest-first boundary

Avoid reintroducing new structural dependence on `current_goal` for this branch.
