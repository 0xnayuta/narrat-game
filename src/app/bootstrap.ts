/**
 * Responsibility: Compose and bootstrap the new text-RPG engine runtime.
 * TODO: Wire Engine + repos + UI bridge, then expose app start flow.
 */

import { Engine } from "@/engine/core/Engine";

export function createBootstrapEngine(): Engine {
  // TODO: Replace with full dependency wiring.
  return new Engine();
}

export function bootstrapNewEngine(): Engine {
  const engine = createBootstrapEngine();
  // TODO: Call engine.start() when new entry is integrated.
  return engine;
}
