/**
 * Responsibility: Shared core contracts for engine lifecycle and context.
 * TODO: Expand this with tick payloads, runtime services and plugin hooks.
 */

export type EngineStatus = "idle" | "running" | "stopped";

export interface EngineContext {
  // TODO: Add state, script, save, rng and platform services.
  now: number;
}

export interface EngineLifecycle {
  start(): void;
  stop(): void;
  tick(deltaMs: number): void;
}
