/**
 * Responsibility: Future engine root/lifecycle coordinator.
 * Status: Skeleton only. The current demo prototype is driven by GameSession and app-level Vue
 * wiring rather than a central Engine instance.
 * TODO: Reintroduce as the top-level orchestrator once multiple subsystems need one runtime shell.
 */

import type { EngineContext, EngineLifecycle, EngineStatus } from "./types";

export class Engine implements EngineLifecycle {
  private status: EngineStatus = "idle";

  private readonly context: EngineContext = {
    now: Date.now(),
  };

  start(): void {
    // TODO: Start loop and initialize systems.
    this.status = "running";
  }

  stop(): void {
    // TODO: Dispose systems and stop loop.
    this.status = "stopped";
  }

  tick(deltaMs: number): void {
    // TODO: Dispatch tick to registered systems.
    this.context.now += deltaMs;
  }

  getStatus(): EngineStatus {
    return this.status;
  }

  getContext(): EngineContext {
    return this.context;
  }
}
