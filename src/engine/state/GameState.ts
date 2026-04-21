/**
 * Responsibility: Provide a minimal, framework-agnostic GameState container.
 * TODO: Add subscriptions once UI/event integration starts.
 */

import { advanceGameStateHours, advanceGameStateMinutes } from "../time";
import type { GameState } from "../types";
import type { ResettableStore, StateUpdater } from "./Store";

const DEFAULT_GAME_STATE: GameState = {
  player: {
    id: "player",
    name: "Player",
    stats: {
      health: 100,
      willpower: 100,
      stamina: 100,
    },
    flags: {},
  },
  time: {
    day: 1,
    hour: 8,
    minute: 0,
  },
  currentLocationId: "home",
  flags: {},
  quests: {},
  inventory: {},
  vars: {},
};

function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      stats: { ...state.player.stats },
      flags: { ...state.player.flags },
    },
    time: { ...state.time },
    flags: { ...state.flags },
    quests: Object.fromEntries(
      Object.entries(state.quests).map(([questId, progress]) => [
        questId,
        { ...progress },
      ]),
    ),
    inventory: { ...state.inventory },
    vars: { ...state.vars },
  };
}

export function createInitialGameState(): GameState {
  return cloneGameState(DEFAULT_GAME_STATE);
}

export class GameStateStore implements ResettableStore<GameState> {
  private readonly initialState: GameState;
  private state: GameState;

  constructor(initialState: GameState = createInitialGameState()) {
    this.initialState = cloneGameState(initialState);
    this.state = cloneGameState(initialState);
  }

  getState(): GameState {
    return this.state;
  }

  setState(next: GameState): void {
    this.state = cloneGameState(next);
  }

  update(updater: StateUpdater<GameState>): GameState {
    const next = updater(this.state);
    this.state = cloneGameState(next);
    return this.state;
  }

  reset(): GameState {
    this.state = cloneGameState(this.initialState);
    return this.state;
  }

  getInitialState(): GameState {
    return cloneGameState(this.initialState);
  }

  advanceMinutes(minutes: number): GameState {
    this.state = advanceGameStateMinutes(this.state, minutes);
    return this.state;
  }

  advanceHours(hours: number): GameState {
    this.state = advanceGameStateHours(this.state, hours);
    return this.state;
  }
}
