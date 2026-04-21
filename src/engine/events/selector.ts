/**
 * Responsibility: Event candidate filtering and minimal selection strategy.
 * TODO: Replace first-hit strategy with priority/weight model.
 */

import type { EventDefinition, EventTrigger } from "../types/events";
import type { GameState } from "../types";
import { matchesAllEventConditions } from "./conditions";

export function getCandidateEvents(
  events: EventDefinition[],
  state: GameState,
  trigger?: EventTrigger,
): EventDefinition[] {
  return events.filter((event) => {
    if (trigger && event.trigger !== trigger) {
      return false;
    }
    return matchesAllEventConditions(state, event.conditions);
  });
}

export function selectFirstEvent(candidates: EventDefinition[]): EventDefinition | null {
  return candidates.length > 0 ? candidates[0] : null;
}

export function selectEvent(
  events: EventDefinition[],
  state: GameState,
  trigger?: EventTrigger,
): EventDefinition | null {
  const candidates = getCandidateEvents(events, state, trigger);
  return selectFirstEvent(candidates);
}
