/**
 * Responsibility: Define global game state shape and basic container.
 * TODO: Split into sub-domains (player, world, time, quest, flags).
 */

import type { Store } from "./Store";

export interface GameState {
  day: number;
  hour: number;
  flags: Record<string, boolean>;
  vars: Record<string, number | string | boolean>;
}

export const initialGameState: GameState = {
  day: 1,
  hour: 8,
  flags: {},
  vars: {},
};

export class GameStateStore implements Store<GameState> {
  private state: GameState = { ...initialGameState };

  getState(): GameState {
    return this.state;
  }

  setState(next: GameState): void {
    this.state = next;
  }
}
