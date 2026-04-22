/**
 * Central exports for cross-module shared engine types.
 */

export type {
  GameState,
  PlayerState,
  TimeState,
  QuestProgress,
  InventoryState,
} from "./state";
export type {
  LocationDefinition,
  LocationConnection,
  NPCDefinition,
  NPCInteractionConditions,
  NPCInteractionRule,
} from "./world";
export type {
  EventDefinition,
  EventTrigger,
  EventConditions,
  EventTimeRange,
  EventHistoryState,
} from "./events";
export type { QuestDefinition } from "./quests";
export type { NarrativeNode, ChoiceOption, NarrativeChoiceEffects } from "./narrative";
export type { SaveFile } from "./save";
