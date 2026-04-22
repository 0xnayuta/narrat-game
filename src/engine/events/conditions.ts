/**
 * Responsibility: Pure condition evaluators for event triggering.
 * TODO: Add richer predicate operators when condition DSL is introduced.
 */

import { matchesBooleanRecord, matchesQuestStepRecord, matchesQuestStatusRecord, matchesScalarRecord } from "../conditions/shared";
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
  return matchesBooleanRecord(state.flags, conditions?.flags, { missingBooleanValue: false });
}

export function matchesVarCondition(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return matchesScalarRecord(state.vars, conditions?.vars);
}

export function matchesQuestCondition(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return matchesQuestStatusRecord(state.quests, conditions?.quests);
}

export function matchesQuestStepCondition(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return matchesQuestStepRecord(state.quests, conditions?.questSteps);
}

export function matchesAnyConditionGroup(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  if (!conditions?.any || conditions.any.length === 0) {
    return true;
  }

  return conditions.any.some((group) => matchesAllEventConditions(state, group));
}

export function matchesAllEventConditions(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return (
    matchesLocationCondition(state, conditions) &&
    matchesTimeCondition(state, conditions) &&
    matchesFlagCondition(state, conditions) &&
    matchesVarCondition(state, conditions) &&
    matchesQuestCondition(state, conditions) &&
    matchesQuestStepCondition(state, conditions) &&
    matchesAnyConditionGroup(state, conditions)
  );
}
