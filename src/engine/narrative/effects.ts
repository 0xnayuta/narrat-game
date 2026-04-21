/**
 * Responsibility: Apply minimal narrative choice effects to GameState.
 * TODO: Extend to inventory/stat deltas once effect schema grows.
 */

import type { GameState, NarrativeChoiceEffects } from "../types";

export function applyNarrativeChoiceEffects(
  state: GameState,
  effects?: NarrativeChoiceEffects,
): GameState {
  if (!effects) {
    return state;
  }

  return {
    ...state,
    flags: {
      ...state.flags,
      ...(effects.setFlags ?? {}),
    },
    vars: {
      ...state.vars,
      ...(effects.setVars ?? {}),
    },
    quests: {
      ...state.quests,
      ...(effects.setQuests ?? {}),
    },
  };
}
