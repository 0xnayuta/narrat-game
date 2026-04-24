# Narrative Quest Effects Audit

## Scope

This audit covers quest-related `NarrativeChoiceEffects` in:

- `src/content/demo/narrative.ts`

Quest-related effect keys scanned:

- `setQuests`
- `startQuest`
- `setQuestStep`
- `advanceQuestStep`
- `resetQuestStep`
- `completeQuest`
- `failQuest`

This is the first task of the **Narrative / Quest Effect Model Stabilization** phase.

## Summary counts

| Effect key | Count in `narrative.ts` | Notes |
|---|---:|---|
| `startQuest` | 4 | Intro and Black Sail trail starts |
| `setQuestStep` | 1 field | Used with `startQuest` for intro start |
| `advanceQuestStep` | 66 | Main progression mechanism, especially Brine Lark |
| `resetQuestStep` | 1 | Black Sail sting reset path |
| `setQuests` | 4 | Manual quest activation at chain handoffs |
| `completeQuest` | 5 | Intro, Black Sail trail, Black Sail sting, Drowned Lantern |
| `failQuest` | 0 | Not currently used |

## Classification definitions

### Semantic

The effect clearly expresses the author's intent with the current lightweight quest model.

Typical examples:

- `startQuest` to begin a quest
- `advanceQuestStep` to move to the next declared step
- `resetQuestStep` to intentionally return to the first declared step
- `completeQuest` to finish a quest

### Suspicious

The effect may work mechanically, but should be reviewed because it can hide intent or drift from quest-step semantics.

Typical examples:

- manual `setQuests` where `startQuest` + `setQuestStep` would be clearer
- `advanceQuestStep` from a node that may be reachable from multiple prior quest steps
- `current_goal` and `currentStepId` that tell different stories

### Legacy-compatible

The effect is acceptable for now because it preserves old/background content or compatibility, but it should not be copied into new content unless there is a clear reason.

Typical examples:

- retained Brine Lark background nodes still present in code but bypassed by the default main chain
- manual `setQuests` used as an older explicit state-write pattern

## Semantic usages

### Intro walk

| Choice | Effect | Classification | Notes |
|---|---|---|---|
| `node_street_arrival -> go_market` | `startQuest: ["quest_intro_walk"]` + `setQuestStep.quest_intro_walk = "step_go_market"` | Semantic | Starts the intro quest and explicitly places it on the market step. This is a good example of `startQuest` + `setQuestStep` for starting at a known non-first step. |
| `node_market_morning -> finish_walk` | `completeQuest: ["quest_intro_walk"]` | Semantic | Finishes the lightweight intro path after the player has seen the market. |
| `node_stall_discovery -> explore_stall` | `advanceQuestStep: ["quest_intro_walk"]` | Semantic | Moves from `step_go_market` to `step_examine_stall` when the player investigates the stall. |

### Black Sail trail

| Choice | Effect | Classification | Notes |
|---|---|---|---|
| `node_vendor_stall_tip -> show_compass` | `startQuest: ["quest_black_sail_trail"]` | Semantic | Starts the Black Sail trail from a compass-owned path. |
| `node_vendor_stall_tip -> press_for_harbor_watch` | `startQuest: ["quest_black_sail_trail"]` | Semantic | Starts the same trail from a stronger-lead path. |
| `node_vendor_stall_tip -> describe_examined_compass` | `startQuest: ["quest_black_sail_trail"]` | Semantic | Starts the same trail from the no-purchase fallback. |
| `node_harbor_watch_intro -> show_compass_to_mira` | `advanceQuestStep: ["quest_black_sail_trail"]` | Semantic | Moves from finding Mira toward the signal tower. |
| `node_harbor_watch_repeat -> report_signal_tower_clue` | `advanceQuestStep: ["quest_black_sail_trail"]` | Semantic | Moves toward the night harbor signal. |
| `node_harbor_watch_repeat -> show_pier_message_to_mira` | `advanceQuestStep: ["quest_black_sail_trail"]` | Semantic | Moves toward north channel investigation. |
| `node_harbor_watch_repeat -> report_north_channel_marker` | `advanceQuestStep: ["quest_black_sail_trail"]` | Semantic | Moves toward black sail berth investigation. |
| `node_harbor_watch_repeat -> report_coal_berth_ledger` | `completeQuest: ["quest_black_sail_trail"]` | Semantic | Completes the Black Sail trail once the berth network is confirmed. |
| `node_harbor_night_signal -> follow_pier_signal_by_shadow_route` | `advanceQuestStep: ["quest_black_sail_trail"]` | Semantic | Alternate branch advances into the same pier-signal step as the default path. |
| `node_harbor_night_signal -> follow_pier_signal` | `advanceQuestStep: ["quest_black_sail_trail"]` | Semantic | Default branch advances into pier investigation. |
| `node_pier_arrival -> open_tin_capsule` | `advanceQuestStep: ["quest_black_sail_trail"]` | Semantic | Moves from pier signal to decoding/reporting the pier message. |

### Black Sail sting

| Choice | Effect | Classification | Notes |
|---|---|---|---|
| `node_black_sail_stakeout -> take_stakeout_position` | `advanceQuestStep: ["quest_black_sail_sting"]` | Semantic | Moves from preparing stakeout to holding it. |
| `node_black_sail_stakeout -> reset_stakeout_plan` | `resetQuestStep: ["quest_black_sail_sting"]` | Semantic | Intentionally returns the sting quest to its first step without changing status. Good reference usage for `resetQuestStep`. |
| `node_black_sail_contact -> signal_mira_to_close_net` | `advanceQuestStep: ["quest_black_sail_sting"]` | Semantic | Moves from holding the stakeout to closing the net. |
| `node_black_sail_net_closing -> help_secure_the_berth` | `completeQuest: ["quest_black_sail_sting"]` | Semantic | Completes the sting after the berth is secured. |

### Drowned Lantern

| Choice | Effect | Classification | Notes |
|---|---|---|---|
| `node_drowned_lantern_start_point -> search_customs_sheds_for_drowned_lantern_trace` | `advanceQuestStep: ["quest_drowned_lantern"]` | Semantic | Moves from shed search to tracing the dawn exchange. |
| `node_drowned_lantern_shed_trace -> ask_mira_to_decode_dawn_exchange` | `advanceQuestStep: ["quest_drowned_lantern"]` | Semantic | Moves from dawn exchange to identifying the Drowned Lantern contact. |
| `node_harbor_watch_customs_stairs_recap -> ask_mira_to_fold_the_stairs_into_the_dawn_exchange` | `advanceQuestStep: ["quest_drowned_lantern"]` | Semantic, with a narrow window | Valid because the NPC interaction gates it to `step_trace_dawn_exchange`. Tests now protect that it does not steal Mira repeat outside the exact window. |
| `node_drowned_lantern_exchange_window_confirmed -> confirm_brine_lark_direct_from_stairs_insight` | `completeQuest: ["quest_drowned_lantern"]` | Semantic | Insight path completes Drowned Lantern after identifying Brine Lark directly. |
| `node_drowned_lantern_contact_suspect -> mark_brine_lark_as_the_next_target` | `completeQuest: ["quest_drowned_lantern"]` | Semantic | Default path completes Drowned Lantern after identifying Brine Lark as next target. |

### Brine Lark retained main chain

Most retained Brine Lark main-chain choices use:

```ts
advanceQuestStep: ["quest_brine_lark"]
```

Classification: **Semantic** for the current lightweight model.

Representative retained-chain examples:

| Choice | Next intended quest meaning | Classification |
|---|---|---|
| `search_tide_warehouse_for_brine_lark_trace` | start warehouse trace after entering Brine Lark chain | Semantic |
| `ask_mira_what_the_warehouse_mark_implies` | move toward shift-change watch | Semantic |
| `ask_mira_what_the_handoff_changes` | move toward receiver/contact identification | Semantic |
| `watch_what_happens_where_the_waterline_skiff_disappears` | move to Breaker Culvert activity | Semantic |
| `watch_what_kind_of_carrier_leaves_the_culvert` | move to culvert carrier identification | Semantic |
| `watch_what_stably_triggers_the_hidden_punt_to_move_again` | move to release trigger identification | Semantic |
| `watch_what_larger_control_node_the_sluice_blind_answers_to` | move to sluice control node identification | Semantic |
| `watch_who_stably_controls_the_sluice_house_operations` | move to sluice house controller | Semantic |
| `watch_who_the_marsh_controller_answers_to` | move to marsh control node | Semantic |
| `watch_who_the_marsh_warden_answers_to` | move to harbor signal point | Semantic |
| `watch_who_stably_coordinates_harbor_signal_point_operations` | move to harbor coordinator | Semantic |
| `watch_who_grants_the_harbor_coordinator_authority_over_windows` | move to harbor authority node | Semantic |
| `watch_which_higher_command_receives_the_harbor_windows` | move to harbor command | Semantic |
| `watch_who_stably_sits_in_harbor_command_and_decides_routable_routes` | move to schedule master | Semantic |
| `watch_who_authorizes_the_schedule_master_to_make_routes_routable` | move to port authority | Semantic |
| upper governance retained choices through `watch_who_stably_sits_in_the_executive_office_and_decides_routable_routes` | continue the current retained upper chain | Semantic for current retained chain, but do not extend further by default |

### Brine Lark horizontal recap

| Choice | Effect | Classification | Notes |
|---|---|---|---|
| `node_brine_lark_breaker_culvert_return_ripple -> note_the_culvert_rhythm_for_mira` | flag/goal only, no quest effect | Semantic | Correct horizontal pattern: records observation without advancing the main chain. |
| `node_harbor_watch_brine_lark_culvert_recap -> ask_mira_to_apply_the_culvert_rhythm_to_the_watch` | flag/goal only, no quest effect | Semantic | Correct recap pattern: returns to `node_brine_lark_breaker_culvert_activity` without adding or advancing a Brine Lark step. |

## Suspicious usages / cleanup candidates

These are not necessarily bugs. They are candidates for semantic cleanup or stronger tests.

### 1. Manual quest activation with `setQuests`

| Choice | Current effect | Classification | Suggested cleanup |
|---|---|---|---|
| `node_harbor_watch_smuggling_confirmed -> offer_help_with_sting` | `setQuests.quest_black_sail_sting = { status: "active", currentStepId: "step_prepare_stakeout" }` | Suspicious / legacy-compatible | Prefer `startQuest: ["quest_black_sail_sting"]`. Because this starts at the first declared step, no `setQuestStep` is needed if `startQuest` semantics are confirmed. |
| `node_black_sail_next_lead_clarified -> ask_where_to_start_tracking_drowned_lantern` | `setQuests.quest_drowned_lantern = { status: "active", currentStepId: "step_search_customs_sheds" }` | Suspicious / legacy-compatible | Prefer `startQuest: ["quest_drowned_lantern"]` if the first declared step remains `step_search_customs_sheds`. |
| `node_drowned_lantern_contact_confirmed_from_insight -> ask_where_brine_lark_runs_goods_from_insight` | `setQuests.quest_brine_lark = { status: "active", currentStepId: "step_search_tide_warehouse" }` | Suspicious / legacy-compatible | Prefer `startQuest: ["quest_brine_lark"]` if the first declared step remains `step_search_tide_warehouse`. |
| `node_drowned_lantern_contact_confirmed -> ask_where_brine_lark_runs_goods` | `setQuests.quest_brine_lark = { status: "active", currentStepId: "step_search_tide_warehouse" }` | Suspicious / legacy-compatible | Same as above. |

Reason for classification:

- These are clear handoff points and currently work.
- However, `setQuests` is a low-level override and hides the more semantic intent: "start this quest".
- Replacing them should be a later small cleanup after confirming `startQuest` behavior for missing/inactive/active/completed runtime quest entries.

### 2. Brine Lark bypassed/background nodes with `advanceQuestStep`

Several Brine Lark nodes still exist in code but are documented as bypassed or de-emphasized in the current default main chain. Some of those nodes still contain `advanceQuestStep: ["quest_brine_lark"]`.

Examples:

| Node / choice area | Classification | Notes |
|---|---|---|
| `node_brine_lark_skiff_downstream_node` -> Breaker Culvert | Legacy-compatible | Bypassed by the current default path but still present as background/old route content. |
| `node_brine_lark_punt_waterway_node` -> Reedway Cut | Legacy-compatible | Bypassed by the current default path. |
| `node_brine_lark_sluice_blind_operator` -> Sluice Control | Legacy-compatible | Bypassed/de-emphasized layer still in code. |
| `node_brine_lark_window_clerk` / `node_brine_lark_harbor_master` path | Legacy-compatible | Older harbor authority bridge still present but not the compressed default path. |
| Coastal command / navigation / harbor authority council / harbor clerk / harbor authority / registrar path | Legacy-compatible | Old vertical layers remain in code and should not be expanded further by default. |

Reason for classification:

- These effects may be mechanically consistent if those old routes are intentionally entered.
- They should not guide new content authoring.
- Any future cleanup should either leave them as background routes or explicitly de-emphasize/hide them rather than deleting them casually.

### 3. Repeated `advanceQuestStep` as a dense Brine Lark ladder

The active retained Brine Lark chain still uses many consecutive `advanceQuestStep` effects.

Classification: **Semantic but watch-list**.

Reason:

- This matches the current compressed-chain model.
- But adding more vertical `advanceQuestStep` beats to Brine Lark should be avoided unless they introduce distinct gameplay, NPC logic, event logic, or a necessary retained node.
- New Brine Lark additions should prefer the Breaker Culvert horizontal recap pattern unless the main chain truly needs a new step.

## Legacy-compatible usages

### `setQuests` as low-level compatibility override

`setQuests` remains useful as an escape hatch, especially for old content or migration-like states. Current uses are safe but should be considered legacy-compatible rather than the preferred pattern for new quest starts.

Current locations:

- `offer_help_with_sting`
- `ask_where_to_start_tracking_drowned_lantern`
- `ask_where_brine_lark_runs_goods_from_insight`
- `ask_where_brine_lark_runs_goods`

### Bypassed Brine Lark route content

The Brine Lark bypassed route nodes still present in `narrative.ts` are legacy-compatible. Their `advanceQuestStep` effects should be treated as part of retained background code, not as a template for new vertical expansion.

## No current `failQuest` usage

`failQuest` is defined by the effect model but unused in current demo narrative content.

Classification: **No current content usage**.

Recommendation:

- Do not add failure branches just to exercise the API.
- Add tests for `failQuest` precedence/semantics at the engine level if coverage is missing.
- Add real content usage only when a meaningful failure or retreat path exists.

## Immediate recommendations

### Recommended cleanup target 1

Replace one manual quest activation with semantic `startQuest` after confirming tests:

```text
node_harbor_watch_smuggling_confirmed -> offer_help_with_sting
```

Why this is the safest first cleanup:

- `quest_black_sail_sting` starts at its first declared step: `step_prepare_stakeout`
- no non-first step jump is required
- the content intent is simple: start the sting quest
- existing tests already cover the Black Sail sting path

### Recommended cleanup target 2

After that, convert Drowned Lantern and Brine Lark handoff starts:

- `ask_where_to_start_tracking_drowned_lantern`
- `ask_where_brine_lark_runs_goods_from_insight`
- `ask_where_brine_lark_runs_goods`

These are also likely safe because each starts at the first declared step, but they touch larger chain handoffs and should be done after the first cleanup proves the pattern.

### Recommended test focus before cleanup

Before replacing `setQuests` broadly, confirm or add focused tests for:

1. `startQuest` creates a missing runtime quest entry from definitions.
2. `startQuest` starts an inactive quest at its first step.
3. `startQuest` does not unexpectedly rewind an already active quest.
4. `startQuest` does not unexpectedly reopen completed or failed quests unless explicitly intended.
5. `completeQuest` and `failQuest` remain final status overrides when combined with other quest effects.

## Current conclusion

The current narrative effect usage is mostly stable.

The biggest stabilization opportunity is not a new model; it is replacing a few manual `setQuests` handoff activations with semantic `startQuest` once tests pin down idempotency and status-preservation behavior.

The Brine Lark dense ladder should remain under watch: current retained-chain uses are acceptable, but new Brine Lark work should continue preferring horizontal `eventHistory` recap points over additional vertical quest steps.
