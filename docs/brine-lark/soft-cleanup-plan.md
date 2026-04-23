# Brine Lark — Soft Cleanup Plan (Applied State)

This document records the current applied cleanup state for Brine Lark.

It is no longer just a proposal.
The following distinctions now reflect the current project state:
- some layers are still present in `narrative.ts`
- some layers are bypassed by the default main-chain choices
- `quest_brine_lark.stepIds` now reflects a shorter ladder than the original expanded chain

## 1. Narrative-level status

### A. Retained as active main-chain anchors

#### Field / transfer path
- `node_brine_lark_outer_marker_set`
- `node_brine_lark_outer_marker_reaction`
- `node_brine_lark_outer_marker_first_reader`
- `node_brine_lark_outer_marker_downstream_node`
- `node_brine_lark_customs_tide_stairs_activity`
- `node_brine_lark_waterline_receiver`
- `node_brine_lark_breaker_culvert_activity`
- `node_brine_lark_culvert_carrier`
- `node_brine_lark_reedway_cut_activity`
- `node_brine_lark_reedway_cut_release_trigger`
- `node_brine_lark_inland_release_signal_node`

#### Marsh / harbor control path
- `node_brine_lark_sluice_control_node`
- `node_brine_lark_sluice_house_controller`
- `node_brine_lark_marsh_control_node`
- `node_brine_lark_marsh_warden`
- `node_brine_lark_harbor_signal_point`
- `node_brine_lark_harbor_coordinator`
- `node_brine_lark_harbor_authority_node`
- `node_brine_lark_harbor_command`
- `node_brine_lark_schedule_master`

#### Upper governance path
- `node_brine_lark_port_authority`
- `node_brine_lark_maritime_inspector`
- `node_brine_lark_maritime_oversight_board`
- `node_brine_lark_oversight_secretary`
- `node_brine_lark_maritime_minister`
- `node_brine_lark_transport_cabinet`
- `node_brine_lark_executive_office`
- `node_brine_lark_prime_minister`

### B. Present in code, but bypassed by default main-chain progression
- `node_brine_lark_skiff_downstream_node`
- `node_brine_lark_punt_waterway_node`
- `node_brine_lark_sluice_blind_operator`
- `node_brine_lark_window_clerk`
- `node_brine_lark_harbor_master`
- `node_brine_lark_coastal_command`
- `node_brine_lark_coastal_commander`
- `node_brine_lark_navigation_master`
- `node_brine_lark_harbor_authority_council`
- `node_brine_lark_harbor_clerk`
- `node_brine_lark_harbor_authority`
- `node_brine_lark_harbor_authority_registrar`

### C. Guidance
- keep bypassed nodes for now
- do not write future default vertical links through them
- only reactivate them if they gain unique gameplay value or become side-branch anchors

## 2. Quest-step status

### A. Current active `quest_brine_lark.stepIds`
- `step_search_tide_warehouse`
- `step_watch_shift_change`
- `step_identify_exchange_contact`
- `step_pressure_receiving_clerk`
- `step_read_clerk_reaction`
- `step_follow_ledger_alcove_lead`
- `step_recover_ledger_alcove_trace`
- `step_identify_repeated_tag_pattern`
- `step_identify_partial_destination_mark`
- `step_verify_outer_mooring_line_node`
- `step_determine_outer_mooring_line_role`
- `step_identify_outer_mooring_transfer_window`
- `step_confirm_outer_mooring_transfer_activity`
- `step_identify_identity_swap_pattern`
- `step_identify_outer_marker_set`
- `step_identify_outer_marker_reaction`
- `step_identify_outer_marker_downstream_node`
- `step_observe_customs_tide_stairs_activity`
- `step_identify_waterline_receiver`
- `step_observe_breaker_culvert_activity`
- `step_identify_culvert_carrier`
- `step_observe_reedway_cut_activity`
- `step_identify_reedway_cut_release_trigger`
- `step_identify_inland_release_signal_node`
- `step_identify_sluice_control_node`
- `step_identify_sluice_house_controller`
- `step_identify_marsh_control_node`
- `step_identify_marsh_warden`
- `step_identify_harbor_signal_point`
- `step_identify_harbor_coordinator`
- `step_identify_harbor_authority_node`
- `step_identify_harbor_command`
- `step_identify_schedule_master`
- `step_identify_port_authority`
- `step_identify_maritime_inspector`
- `step_identify_maritime_oversight_board`
- `step_identify_oversight_secretary`
- `step_identify_maritime_minister`
- `step_identify_transport_cabinet`
- `step_identify_executive_office`
- `step_identify_prime_minister`

### B. Removed from the active main-chain step list, but still meaningful as legacy/background references
- `step_identify_skiff_downstream_node`
- `step_identify_punt_waterway_node`
- `step_identify_sluice_blind_operator`
- `step_identify_window_clerk`
- `step_identify_harbor_master`
- `step_identify_coastal_command`
- `step_identify_coastal_commander`
- `step_identify_navigation_master`
- `step_identify_harbor_authority_council`
- `step_identify_harbor_clerk`
- `step_identify_harbor_authority`
- `step_identify_harbor_authority_registrar`

## 3. Current maintenance rule

1. Keep documentation aligned with the applied main-chain state, not the pre-cleanup full ladder.
2. Treat bypassed nodes and removed quest steps as background material unless intentionally reactivated.
3. Any future horizontal expansion should branch from retained middle nodes, not from compressed governance ladders.
