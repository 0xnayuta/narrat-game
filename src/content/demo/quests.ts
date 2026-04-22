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
];
