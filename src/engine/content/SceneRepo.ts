/**
 * Responsibility: Skeleton repository for scene-collection style content access.
 * Status: Not part of the current demo main path. The active prototype loads a ContentBundle
 * directly through the demo loader/repository entry.
 * TODO: Reuse or replace when a broader content repository layer is introduced.
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
