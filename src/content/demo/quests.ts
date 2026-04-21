/**
 * Demo content: minimal quest definition (1 quest).
 */

import type { QuestDefinition } from "../../engine/types";

export const demoQuests: QuestDefinition[] = [
  {
    id: "quest_intro_walk",
    title: "Take a walk",
    status: "inactive",
    stepIds: ["step_go_street", "step_go_market"],
  },
];
