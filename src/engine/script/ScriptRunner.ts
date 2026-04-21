/**
 * Responsibility: Legacy skeleton for script-driven scene progression.
 * Status: Not used by the current demo main path. The active prototype uses NarrativeRuntime
 * for node progression and GameSession for orchestration.
 * TODO: Either evolve this into a real content pipeline adapter or remove/merge later.
 */

import type { SceneCollection } from "../content/schema";

export class ScriptRunner {
  private scenes: SceneCollection | null = null;

  loadScenes(scenes: SceneCollection): void {
    this.scenes = scenes;
  }

  getLoadedScenes(): SceneCollection | null {
    return this.scenes;
  }
}
