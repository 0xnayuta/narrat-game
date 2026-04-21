/**
 * Responsibility: Engine root object, lifecycle orchestration and future event hub mounting.
 * TODO: Inject subsystems and coordinate update loop.
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
