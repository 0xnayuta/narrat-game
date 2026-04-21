/**
 * Responsibility: Evaluate whether one NPC interaction rule matches the current game state.
 */

import { getTimeOfDay } from "../time";
import type { GameState, NPCInteractionConditions } from "../types";

type ComparableValue = string | number | boolean;

export interface NpcInteractionMismatchReason {
  code: "flag" | "quest" | "var" | "timeOfDay";
  key?: string;
  expected?: ComparableValue;
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

  if (conditions.requiredFlags) {
    for (const [flagId, expected] of Object.entries(conditions.requiredFlags)) {
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

  if (conditions.requiredQuests) {
    for (const [questId, expected] of Object.entries(conditions.requiredQuests)) {
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

  if (conditions.requiredVars) {
    for (const [varId, expected] of Object.entries(conditions.requiredVars)) {
      const actual = state.vars[varId];
      if (actual !== expected) {
        reasons.push({
          code: "var",
          key: varId,
          expected,
          actual: (actual as ComparableValue | undefined) ?? "missing",
          message: `var.${varId}: expected ${String(expected)}, got ${String(actual)}`,
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
