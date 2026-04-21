/**
 * Responsibility: Minimal content repository contracts and static implementation.
 * TODO: Add async/file-backed repositories when content loading expands.
 */

import type { ContentBundle } from "./bundle";

export interface ContentRepository {
  getBundle(): ContentBundle;
}

export class StaticContentRepository implements ContentRepository {
  constructor(private readonly bundle: ContentBundle) {}

  getBundle(): ContentBundle {
    return this.bundle;
  }
}
