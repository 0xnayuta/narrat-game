/**
 * Responsibility: Create a reusable game session from a validated content bundle.
 */

import type { ContentBundle } from "../content/bundle";
import { validateContentBundle } from "../content/validation";
import { NarrativeRuntime } from "../narrative";
import { createQuestStateFromDefinitions } from "../quests";
import { GameStateStore, createInitialGameState } from "../state/GameState";
import type { GameState } from "../types";
import { LocationService } from "../world";
import { GameSession } from "./GameSession";

export function createGameSessionFromBundle(bundle: ContentBundle): GameSession {
  const validBundle = validateContentBundle(bundle);

  const initialState: GameState = {
    ...createInitialGameState(),
    quests: createQuestStateFromDefinitions(validBundle.quests),
    flags: {
      ...validBundle.initialFlags,
    },
  };

  const store = new GameStateStore(initialState);
  const locationService = new LocationService(validBundle.locations);
  const narrativeRuntime = new NarrativeRuntime(validBundle.narrative);

  return new GameSession(store, locationService, validBundle.events, narrativeRuntime);
}
