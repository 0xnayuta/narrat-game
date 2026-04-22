/**
 * Responsibility: Evaluate whether one NPC interaction rule matches the current game state.
 */

import {
  matchesBooleanRecord,
  matchesQuestStepRecord,
  matchesQuestStatusRecord,
  matchesScalarCondition,
  matchesScalarRecord,
} from "../conditions/shared";
import { getTimeOfDay } from "../time";
import type { GameState, NPCInteractionConditions } from "../types";
import type { ComparableValue, ScalarConditionValue } from "../types/conditions";

export interface NpcInteractionMismatchReason {
  code: "flag" | "quest" | "questStep" | "var" | "timeOfDay";
  key?: string;
  expected?: ScalarConditionValue;
  actual?: ComparableValue | "missing";
  message: string;
}

export interface NpcInteractionMatchResult {
  matched: boolean;
  reasons: NpcInteractionMismatchReason[];
}

export function evaluateNpcInteractionConditions(
  state: GameState,
  conditions: NPCInteractionConditions,
): NpcInteractionMatchResult {
  const reasons: NpcInteractionMismatchReason[] = [];

  if (!matchesBooleanRecord(state.flags, conditions.requiredFlags, { missingBooleanValue: false })) {
    for (const [flagId, expected] of Object.entries(conditions.requiredFlags ?? {})) {
      const actual = state.flags[flagId] ?? false;
      if (actual !== expected) {
        reasons.push({
          code: "flag",
          key: flagId,
          expected,
          actual,
          message: `flag.${flagId}: expected ${expected}, got ${actual}`,
        });
      }
    }
  }

  if (!matchesQuestStatusRecord(state.quests, conditions.requiredQuests)) {
    for (const [questId, expected] of Object.entries(conditions.requiredQuests ?? {})) {
      const actual = state.quests[questId]?.status;
      if (actual !== expected) {
        reasons.push({
          code: "quest",
          key: questId,
          expected,
          actual: actual ?? "missing",
          message: `quest.${questId}: expected ${expected}, got ${actual ?? "missing"}`,
        });
      }
    }
  }

  if (!matchesQuestStepRecord(state.quests, conditions.requiredQuestSteps)) {
    for (const [questId, expected] of Object.entries(conditions.requiredQuestSteps ?? {})) {
      const actual = state.quests[questId]?.currentStepId;
      if (actual !== expected) {
        reasons.push({
          code: "questStep",
          key: questId,
          expected,
          actual: actual ?? "missing",
          message: `questStep.${questId}: expected ${expected}, got ${actual ?? "missing"}`,
        });
      }
    }
  }

  if (!matchesScalarRecord(state.vars, conditions.requiredVars)) {
    for (const [varId, expected] of Object.entries(conditions.requiredVars ?? {})) {
      const actual = state.vars[varId] as ComparableValue | undefined;
      if (!matchesScalarCondition(actual, expected)) {
        reasons.push({
          code: "var",
          key: varId,
          expected,
          actual: actual ?? "missing",
          message: `var.${varId}: expected ${JSON.stringify(expected)}, got ${String(actual)}`,
        });
      }
    }
  }

  if (conditions.requiredTimeOfDay) {
    const actualTimeOfDay = getTimeOfDay(state.time);
    if (actualTimeOfDay !== conditions.requiredTimeOfDay) {
      reasons.push({
        code: "timeOfDay",
        expected: conditions.requiredTimeOfDay,
        actual: actualTimeOfDay,
        message: `timeOfDay: expected ${conditions.requiredTimeOfDay}, got ${actualTimeOfDay}`,
      });
    }
  }

  return {
    matched: reasons.length === 0,
    reasons,
  };
}

export function matchesNpcInteractionRule(
  state: GameState,
  conditions: NPCInteractionConditions,
): boolean {
  return evaluateNpcInteractionConditions(state, conditions).matched;
}
