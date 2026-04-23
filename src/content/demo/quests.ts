/**
 * Demo content: minimal quest definition (1 quest).
 */

import type { QuestDefinition } from "../../engine/types";

export const demoQuests: QuestDefinition[] = [
  {
    id: "quest_intro_walk",
    title: "Take a walk",
    status: "inactive",
    stepIds: ["step_go_street", "step_go_market", "step_examine_stall"],
  },
  {
    id: "quest_black_sail_trail",
    title: "Follow the Black Sail Trail",
    status: "inactive",
    stepIds: [
      "step_find_mira",
      "step_search_signal_tower",
      "step_watch_harbor_at_night",
      "step_follow_pier_signal",
      "step_decode_pier_message",
      "step_investigate_north_channel",
      "step_investigate_black_sail_berth",
    ],
  },
  {
    id: "quest_black_sail_sting",
    title: "Set the Black Sail Sting",
    status: "inactive",
    stepIds: [
      "step_prepare_stakeout",
      "step_hold_stakeout",
      "step_close_the_net",
    ],
  },
  {
    id: "quest_drowned_lantern",
    title: "Trace the Drowned Lantern",
    status: "inactive",
    stepIds: [
      "step_search_customs_sheds",
      "step_trace_dawn_exchange",
      "step_identify_drowned_lantern_contact",
    ],
  },
  {
    id: "quest_brine_lark",
    title: "Track Brine Lark",
    status: "inactive",
    stepIds: [
      "step_search_tide_warehouse",
      "step_watch_shift_change",
      "step_identify_exchange_contact",
      "step_pressure_receiving_clerk",
      "step_read_clerk_reaction",
      "step_follow_ledger_alcove_lead",
      "step_recover_ledger_alcove_trace",
      "step_identify_repeated_tag_pattern",
      "step_identify_partial_destination_mark",
      "step_verify_outer_mooring_line_node",
      "step_determine_outer_mooring_line_role",
      "step_identify_outer_mooring_transfer_window",
      "step_confirm_outer_mooring_transfer_activity",
      "step_identify_identity_swap_pattern",
      "step_identify_outer_marker_set",
      "step_identify_outer_marker_reaction",
    ],
  },
];
