/**
 * Responsibility: Create a reusable game session from a validated content bundle.
 */

import type { ContentBundle } from "../content/bundle";
import { validateContentBundle } from "../content/validation";
import { NarrativeRuntime } from "../narrative";
import { createQuestStateFromDefinitions } from "../quests";
import { RngService } from "../rng/RngService";
import { GameStateStore, createInitialGameState } from "../state/GameState";
import type { GameState } from "../types";
import { LocationService } from "../world";
import { GameSession, type GameSessionOptions } from "./GameSession";

export interface CreateGameSessionOptions {
  randomFloat?: GameSessionOptions["randomFloat"];
  eventHistoryWriteStrategy?: GameSessionOptions["eventHistoryWriteStrategy"];
}

export function createGameSessionFromBundle(
  bundle: ContentBundle,
  options: CreateGameSessionOptions = {},
): GameSession {
  const validBundle = validateContentBundle(bundle);

  const initialState: GameState = {
    ...createInitialGameState(),
    quests: createQuestStateFromDefinitions(validBundle.quests),
    flags: {
      ...validBundle.initialFlags,
    },
    vars: {
      ...validBundle.initialVars,
    },
  };

  const store = new GameStateStore(initialState);
  const locationService = new LocationService(validBundle.locations);
  const narrativeRuntime = new NarrativeRuntime(validBundle.narrative);
  const rngService = new RngService();

  return new GameSession(store, locationService, validBundle.events, narrativeRuntime, validBundle.npcs, validBundle.quests, {
    randomFloat: options.randomFloat ?? (() => rngService.nextFloat()),
    eventHistoryWriteStrategy: options.eventHistoryWriteStrategy,
  });
}
