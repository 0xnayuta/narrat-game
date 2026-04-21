/**
 * Responsibility: Define minimal content schema for text-RPG scenes.
 * TODO: Add conditions, effects, tags and metadata fields.
 */

export interface SceneChoice {
  id: string;
  text: string;
  to: string;
}

export interface SceneNode {
  id: string;
  text: string;
  choices: SceneChoice[];
}

export interface SceneCollection {
  start: string;
  nodes: SceneNode[];
}
