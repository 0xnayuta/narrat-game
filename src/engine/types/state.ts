import type { EventHistoryState } from "./events";

/**
 * Player runtime state used by systems, narrative checks and UI.
 */
export interface PlayerState {
  id: string;
  name: string;
  stats: Record<string, number>;
  flags: Record<string, boolean>;
  // TODO: Split stats into typed attributes once baseline stat model is fixed.
}

/**
 * In-game time snapshot used for progression and time-gated events.
 */
export interface TimeState {
  day: number;
  hour: number;
  minute: number;
  // TODO: Add calendar/season fields if world simulation requires it.
}

/**
 * Runtime quest progress snapshot keyed by quest id.
 */
export interface QuestProgress {
  status: "inactive" | "active" | "completed" | "failed";
  currentStepId?: string;
  // TODO: Add objective counters and per-step flags when quest runner is implemented.
}

/**
 * Runtime inventory state keyed by item id.
 */
export type InventoryState = Record<string, number>;

/**
 * Top-level game state aggregate persisted in saves and consumed by modules.
 */
export interface GameState {
  player: PlayerState;
  time: TimeState;
  currentLocationId: string;
  flags: Record<string, boolean>;
  quests: Record<string, QuestProgress>;
  inventory: InventoryState;
  vars: Record<string, number | string | boolean>;
  /**
   * Optional event history slice used as the primary event-history boundary.
   * Legacy event flags/vars are compatibility inputs and must be accessed through
   * the event history adapter rather than new runtime/UI logic.
   */
  eventHistory?: EventHistoryState;
}
