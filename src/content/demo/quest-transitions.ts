/**
 * Demo content: minimal location-based quest progression rules.
 */

import type { LocationQuestTransition } from "../../engine/quests";

export const demoQuestTransitions: LocationQuestTransition[] = [
  {
    questId: "quest_intro_walk",
    locationId: "street",
    status: "active",
    currentStepId: "step_go_market",
  },
  {
    questId: "quest_intro_walk",
    locationId: "market",
    status: "completed",
    currentStepId: "step_go_market",
  },
];
