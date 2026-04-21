/**
 * Responsibility: Wire demo content into a reusable interactive session.
 */

import { createDemoContentRepository } from "../content/demo";
import { createGameSessionFromBundle } from "../engine";

export function createDemoSession() {
  const repository = createDemoContentRepository();
  return createGameSessionFromBundle(repository.getBundle());
}
