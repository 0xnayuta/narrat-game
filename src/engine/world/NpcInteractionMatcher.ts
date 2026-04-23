/**
 * Responsibility: Evaluate whether one NPC interaction rule matches the current game state.
 */

import {
  evaluateStateConditions,
  matchesStateConditions,
  type StateConditionMatchResult,
  type StateConditionMismatchReason,
  type StateConditions,
} from "../conditions/state";
import type { GameState, NPCInteractionConditions } from "../types";
import type { ComparableValue, ScalarConditionValue } from "../types/conditions";

export interface NpcInteractionMismatchReason {
  code: "flag" | "quest" | "questStep" | "var" | "timeOfDay" | "group";
  key?: string;
  expected?: ScalarConditionValue | string;
  actual?: ComparableValue | "missing";
  message: string;
}

export interface NpcInteractionMatchResult {
  matched: boolean;
  reasons: NpcInteractionMismatchReason[];
}

function toStateConditions(conditions: NPCInteractionConditions): StateConditions {
  return {
    flags: conditions.requiredFlags,
    quests: conditions.requiredQuests,
    questSteps: conditions.requiredQuestSteps,
    vars: conditions.requiredVars,
    timeOfDay: conditions.requiredTimeOfDay,
    all: conditions.all?.map(toStateConditions),
    any: conditions.any?.map(toStateConditions),
    not: conditions.not ? toStateConditions(conditions.not) : undefined,
  };
}

function toNpcInteractionMismatchReason(
  reason: StateConditionMismatchReason,
): NpcInteractionMismatchReason {
  return {
    code: reason.code as NpcInteractionMismatchReason["code"],
    key: reason.key,
    expected: reason.expected as ScalarConditionValue | string | undefined,
    actual: reason.actual as ComparableValue | "missing" | undefined,
    message: reason.message,
  };
}

function toNpcInteractionMatchResult(
  result: StateConditionMatchResult,
): NpcInteractionMatchResult {
  return {
    matched: result.matched,
    reasons: result.reasons.map(toNpcInteractionMismatchReason),
  };
}

export function evaluateNpcInteractionConditions(
  state: GameState,
  conditions: NPCInteractionConditions,
): NpcInteractionMatchResult {
  return toNpcInteractionMatchResult(evaluateStateConditions(state, toStateConditions(conditions)));
}

export function matchesNpcInteractionRule(
  state: GameState,
  conditions: NPCInteractionConditions,
): boolean {
  return matchesStateConditions(state, toStateConditions(conditions));
}
