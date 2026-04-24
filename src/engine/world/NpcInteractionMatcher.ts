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

export interface NpcInteractionMismatchReason {
  code: "flag" | "quest" | "questStep" | "var" | "timeOfDay" | "eventHistory" | "group";
  key?: string;
  expected?: unknown;
  actual?: unknown;
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
    eventHistory: conditions.eventHistory,
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
    expected: reason.expected,
    actual: reason.actual,
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
