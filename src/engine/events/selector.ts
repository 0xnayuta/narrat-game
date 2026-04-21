/**
 * Responsibility: Event candidate filtering and minimal selection strategy.
 * TODO: Extend priority selection with weight/cooldown model.
 */

import type { EventDefinition, EventTrigger } from "../types/events";
import type { GameState } from "../types";
import { matchesAllEventConditions } from "./conditions";
import { hasTriggeredOnceEvent } from "./history";

export function getCandidateEvents(
  events: EventDefinition[],
  state: GameState,
  trigger?: EventTrigger,
): EventDefinition[] {
  return events.filter((event) => {
    if (trigger && event.trigger !== trigger) {
      return false;
    }
    if (hasTriggeredOnceEvent(state, event)) {
      return false;
    }
    return matchesAllEventConditions(state, event.conditions);
  });
}

function getEventPriority(event: EventDefinition): number {
  return Number.isFinite(event.priority) ? (event.priority as number) : 0;
}

export function selectFirstEvent(candidates: EventDefinition[]): EventDefinition | null {
  if (candidates.length === 0) {
    return null;
  }

  let best = candidates[0];
  let bestPriority = getEventPriority(best);

  for (let index = 1; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const candidatePriority = getEventPriority(candidate);
    if (candidatePriority > bestPriority) {
      best = candidate;
      bestPriority = candidatePriority;
    }
  }

  return best;
}

export function selectEvent(
  events: EventDefinition[],
  state: GameState,
  trigger?: EventTrigger,
): EventDefinition | null {
  const candidates = getCandidateEvents(events, state, trigger);
  return selectFirstEvent(candidates);
}
