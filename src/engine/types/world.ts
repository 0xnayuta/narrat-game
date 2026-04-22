import type { ScalarConditionValue } from "./conditions";

/**
 * Directed connection between two locations in the world graph.
 */
export interface LocationConnection {
  to: string;
  travelMinutes: number;
  // TODO: Add travel requirements (costs, conditions) when gating is implemented.
}

/**
 * Static location definition for navigation and scene placement.
 */
export interface LocationDefinition {
  id: string;
  name: string;
  description: string;
  connections: LocationConnection[];
  tags?: string[];
}

/**
 * Reusable condition set for content that gates NPC interactions by runtime state.
 */
export interface NPCInteractionConditions {
  requiredFlags?: Record<string, boolean>;
  requiredQuests?: Record<string, "inactive" | "active" | "completed" | "failed">;
  /** Match quests by current step id (requires quest to exist and have matching currentStepId). */
  requiredQuestSteps?: Record<string, string>;
  requiredVars?: Record<string, ScalarConditionValue>;
  requiredTimeOfDay?: "morning" | "afternoon" | "evening" | "night";
}

/**
 * Minimal NPC interaction rule resolved from current game state.
 */
export interface NPCInteractionRule extends NPCInteractionConditions {
  id: string;
  label: string;
  nodeId: string;
}

/**
 * Static NPC definition used by world and narrative modules.
 */
export interface NPCDefinition {
  id: string;
  name: string;
  homeLocationId?: string;
  interactions?: NPCInteractionRule[];
  tags?: string[];
  // TODO: Add schedule/relationship schema after time + social systems are defined.
}
