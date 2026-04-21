/**
 * Responsibility: Provide scene content loading access for engine runtime.
 * TODO: Support multiple packs, lazy loading and localization variants.
 */

import type { SceneCollection } from "./schema";

export class SceneRepo {
  private scenes: SceneCollection | null = null;

  setScenes(data: SceneCollection): void {
    this.scenes = data;
  }

  getScenes(): SceneCollection | null {
    return this.scenes;
  }
}
