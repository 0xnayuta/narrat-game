/**
 * Responsibility: Pure condition evaluators for event triggering.
 * TODO: Add richer predicate operators when condition DSL is introduced.
 */

import { matchesStateConditions, type StateConditions } from "../conditions/state";
import type { GameState } from "../types";
import type { EventConditions } from "../types/events";

function toStateConditions(conditions?: EventConditions): StateConditions | undefined {
  return conditions as StateConditions | undefined;
}

export function matchesLocationCondition(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return matchesStateConditions(state, {
    locationIds: conditions?.locationIds,
  });
}

export function matchesTimeCondition(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return matchesStateConditions(state, {
    timeRange: conditions?.timeRange,
  });
}

export function matchesFlagCondition(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return matchesStateConditions(state, {
    flags: conditions?.flags,
  });
}

export function matchesVarCondition(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return matchesStateConditions(state, {
    vars: conditions?.vars,
  });
}

export function matchesQuestCondition(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return matchesStateConditions(state, {
    quests: conditions?.quests,
  });
}

export function matchesQuestStepCondition(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return matchesStateConditions(state, {
    questSteps: conditions?.questSteps,
  });
}

export function matchesEventHistoryCondition(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return matchesStateConditions(state, {
    eventHistory: conditions?.eventHistory,
  });
}

export function matchesAllConditionGroup(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return matchesStateConditions(state, {
    all: conditions?.all?.map((group) => toStateConditions(group)!).filter(Boolean),
  });
}

export function matchesAnyConditionGroup(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return matchesStateConditions(state, {
    any: conditions?.any?.map((group) => toStateConditions(group)!).filter(Boolean),
  });
}

export function matchesNotConditionGroup(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return matchesStateConditions(state, {
    not: toStateConditions(conditions?.not),
  });
}

export function matchesAllEventConditions(
  state: GameState,
  conditions?: EventConditions,
): boolean {
  return matchesStateConditions(state, toStateConditions(conditions));
}
