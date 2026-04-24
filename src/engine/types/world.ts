import type { ScalarConditionValue } from "./conditions";
import type { EventHistoryConditions } from "./events";

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
 *
 * Top-level fields are combined with AND semantics.
 * Nested groups provide explicit composition:
 * - `all`: every nested block must match
 * - `any`: at least one nested block must match
 * - `not`: nested block must not match
 */
export interface NPCInteractionConditions {
  requiredFlags?: Record<string, boolean>;
  requiredQuests?: Record<string, "inactive" | "active" | "completed" | "failed">;
  /** Match quests by current step id (requires quest to exist and have matching currentStepId). */
  requiredQuestSteps?: Record<string, string>;
  requiredVars?: Record<string, ScalarConditionValue>;
  requiredTimeOfDay?: "morning" | "afternoon" | "evening" | "night";
  /** Match against logical eventHistory through the adapter layer. */
  eventHistory?: EventHistoryConditions;
  /** Every nested condition block must match (AND semantics). */
  all?: NPCInteractionConditions[];
  /** At least one nested condition block must match (OR semantics). */
  any?: NPCInteractionConditions[];
  /** Nested condition block must not match (NOT semantics). */
  not?: NPCInteractionConditions;
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
