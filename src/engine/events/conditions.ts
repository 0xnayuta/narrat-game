/**
 * Responsibility: Pure condition evaluators for event triggering.
 * TODO: Add richer predicate operators when condition DSL is introduced.
 */

import { isInTimeRange } from "../time";
import type { EventConditions } from "../types/events";
import type { GameState } from "../types";

export function matchesLocationCondition(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  if (!conditions?.locationIds || conditions.locationIds.length === 0) {
    return true;
  }
  return conditions.locationIds.includes(state.currentLocationId);
}

export function matchesTimeCondition(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  if (!conditions?.timeRange) {
    return true;
  }
  return isInTimeRange(state.time, conditions.timeRange);
}

export function matchesFlagCondition(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  if (!conditions?.flags) {
    return true;
  }

  return Object.entries(conditions.flags).every(([flagId, expected]) => {
    const actual = state.flags[flagId] ?? false;
    return actual === expected;
  });
}

export function matchesAllEventConditions(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return (
    matchesLocationCondition(state, conditions) &&
    matchesTimeCondition(state, conditions) &&
    matchesFlagCondition(state, conditions)
  );
}
