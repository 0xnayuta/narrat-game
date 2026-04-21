/**
 * Responsibility: Define minimal content schema for text-RPG scenes.
 * TODO: Add conditions, effects, tags and metadata fields.
 */

import type { ChoiceOption, NarrativeNode } from "../types";

export type SceneChoice = ChoiceOption;
export type SceneNode = NarrativeNode;

export interface SceneCollection {
  start: string;
  nodes: SceneNode[];
}
