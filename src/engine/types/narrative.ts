/**
 * Minimal narrative choice effects applied to game state after selection.
 */
export interface NarrativeChoiceEffects {
  setFlags?: Record<string, boolean>;
  setVars?: Record<string, string | number | boolean>;
  setQuests?: Record<
    string,
    {
      status: "inactive" | "active" | "completed" | "failed";
      currentStepId?: string;
    }
  >;
  /** Quest IDs to advance to the next step (based on stepIds order in QuestDefinition). */
  advanceQuestStep?: string[];
  /** Quest IDs to mark as completed. */
  completeQuest?: string[];
  /** Quest IDs to mark as failed. */
  failQuest?: string[];
  /** Add numeric deltas to vars. Missing keys or non-number existing values are treated as 0. */
  addVars?: Record<string, number>;
  /** Add numeric deltas to player stats. Missing keys are treated as 0. */
  addStats?: Record<string, number>;
}

/**
 * Player-facing option from a narrative node.
 */
export interface ChoiceOption {
  id: string;
  text: string;
  nextNodeId: string;
  effects?: NarrativeChoiceEffects;
  /** Only show this choice when all conditions match. Omit to always show. */
  conditions?: import("./events").EventConditions;
}

/**
 * Narrative graph node consumed by script runner.
 */
export interface NarrativeNode {
  id: string;
  text: string;
  choices: ChoiceOption[];
  // TODO: Add command blocks and metadata fields.
}
