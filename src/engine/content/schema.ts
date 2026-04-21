/**
 * Responsibility: Minimal scene-collection schema kept for future parser/repository work.
 * Status: Partially retained skeleton. Current demo runtime uses ContentBundle + NarrativeGraph
 * as the primary content path, so this schema is not on the active UI flow.
 * TODO: Unify with the main content pipeline when parser/repo integration resumes.
 */

import type { ChoiceOption, NarrativeNode } from "../types";

export type SceneChoice = ChoiceOption;
export type SceneNode = NarrativeNode;

export interface SceneCollection {
  start: string;
  nodes: SceneNode[];
}
