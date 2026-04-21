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
  // TODO: Add inventory/stat deltas once effect model expands.
}

/**
 * Player-facing option from a narrative node.
 */
export interface ChoiceOption {
  id: string;
  text: string;
  nextNodeId: string;
  effects?: NarrativeChoiceEffects;
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
