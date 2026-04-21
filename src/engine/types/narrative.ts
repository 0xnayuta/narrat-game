/**
 * Player-facing option from a narrative node.
 */
export interface ChoiceOption {
  id: string;
  text: string;
  nextNodeId: string;
  // TODO: Add condition/effect fields once expression/effect system is defined.
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
