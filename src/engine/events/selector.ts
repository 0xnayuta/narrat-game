/**
 * Responsibility: Event candidate filtering and minimal selection strategy.
 */

import type { EventDefinition, EventTrigger } from "../types/events";
import type { GameState } from "../types";
import { matchesAllEventConditions } from "./conditions";
import { hasTriggeredOnceEvent, isEventInCooldownWindow } from "./history";

export type RandomFloat = () => number;

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
    if (isEventInCooldownWindow(state, event)) {
      return false;
    }
    return matchesAllEventConditions(state, event.conditions);
  });
}

function getEventPriority(event: EventDefinition): number {
  return Number.isFinite(event.priority) ? (event.priority as number) : 0;
}

function getEventWeight(event: EventDefinition): number {
  if (!Number.isFinite(event.weight)) {
    return 0;
  }
  const weight = event.weight as number;
  return weight > 0 ? weight : 0;
}

function normalizeRandomFloat(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return ((value % 1) + 1) % 1;
}

/**
 * Resolves one event from candidate list with priority-first + optional weighted tie-break.
 *
 * Runtime convention:
 * - Production/default session path injects RNG via GameSession (backed by RngService).
 * - Math.random here is only a low-level fallback when no RNG is injected.
 */
export function selectResolvedEvent(
  candidates: EventDefinition[],
  randomFloat: RandomFloat = Math.random,
): EventDefinition | null {
  if (candidates.length === 0) {
    return null;
  }

  let bestPriority = getEventPriority(candidates[0]);
  for (let index = 1; index < candidates.length; index += 1) {
    const candidatePriority = getEventPriority(candidates[index]);
    if (candidatePriority > bestPriority) {
      bestPriority = candidatePriority;
    }
  }

  const highestPriorityCandidates = candidates.filter(
    (candidate) => getEventPriority(candidate) === bestPriority,
  );

  if (highestPriorityCandidates.length <= 1) {
    return highestPriorityCandidates[0] ?? null;
  }

  const totalWeight = highestPriorityCandidates.reduce(
    (sum, candidate) => sum + getEventWeight(candidate),
    0,
  );

  if (totalWeight <= 0) {
    return highestPriorityCandidates[0];
  }

  const randomPoint = normalizeRandomFloat(randomFloat()) * totalWeight;
  let cumulativeWeight = 0;

  for (const candidate of highestPriorityCandidates) {
    const weight = getEventWeight(candidate);
    if (weight <= 0) {
      continue;
    }

    cumulativeWeight += weight;
    if (randomPoint < cumulativeWeight) {
      return candidate;
    }
  }

  return highestPriorityCandidates[0];
}

/**
 * @deprecated Use selectResolvedEvent instead.
 */
export function selectFirstEvent(
  candidates: EventDefinition[],
  randomFloat: RandomFloat = Math.random,
): EventDefinition | null {
  return selectResolvedEvent(candidates, randomFloat);
}

export function selectEvent(
  events: EventDefinition[],
  state: GameState,
  trigger?: EventTrigger,
  randomFloat?: RandomFloat,
): EventDefinition | null {
  const candidates = getCandidateEvents(events, state, trigger);
  return selectResolvedEvent(candidates, randomFloat);
}
