/**
 * Responsibility: Minimal once-event history helpers backed by GameState flags.
 * TODO: Move to a dedicated event history slice if save/runtime complexity grows.
 */

import type { EventDefinition, GameState } from "../types";

export function getEventTriggeredFlagId(eventId: string): string {
  return `event.once.${eventId}`;
}

export function hasTriggeredOnceEvent(state: GameState, event: EventDefinition): boolean {
  if (!event.once) {
    return false;
  }
  return state.flags[getEventTriggeredFlagId(event.id)] === true;
}

export function markEventTriggered(state: GameState, event: EventDefinition): GameState {
  if (!event.once) {
    return state;
  }

  return {
    ...state,
    flags: {
      ...state.flags,
      [getEventTriggeredFlagId(event.id)]: true,
    },
  };
}
