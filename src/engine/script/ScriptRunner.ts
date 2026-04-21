/**
 * Responsibility: Drive narrative progression (show text, select choice, jump nodes).
 * TODO: Execute conditions, effects and command hooks.
 */

import type { SceneCollection } from "@/engine/content/schema";

export class ScriptRunner {
  private scenes: SceneCollection | null = null;

  loadScenes(scenes: SceneCollection): void {
    this.scenes = scenes;
  }

  getLoadedScenes(): SceneCollection | null {
    return this.scenes;
  }
}
