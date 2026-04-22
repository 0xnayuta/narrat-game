/**
 * Responsibility: Wire demo content into a reusable interactive session.
 */

import { createDemoContentRepository } from "../content/demo";
import { createGameSessionFromBundle } from "../engine";
import type { CreateGameSessionOptions } from "../engine";

export function createDemoSession(options: CreateGameSessionOptions = {}) {
  const repository = createDemoContentRepository();
  return createGameSessionFromBundle(repository.getBundle(), options);
}
