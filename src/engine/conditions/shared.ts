/**
 * Responsibility: Small shared condition-matching primitives reused by event/NPC systems.
 */

import type {
  BaseScalarOperatorPredicate,
  ComparableValue,
  ScalarConditionValue,
  ScalarOperatorPredicate,
} from "../types/conditions";
import type { GameState } from "../types";

export type {
  BaseScalarOperatorPredicate,
  ComparableValue,
  ScalarOperatorPredicate,
  ScalarConditionValue,
};
export type QuestStatus = "inactive" | "active" | "completed" | "failed";

const BASE_SCALAR_OPERATOR_KEYS: Array<keyof BaseScalarOperatorPredicate> = [">=", ">", "<=", "<", "!=", "in"];
const SCALAR_OPERATOR_KEYS: Array<keyof ScalarOperatorPredicate> = [
  ...BASE_SCALAR_OPERATOR_KEYS,
  "not",
];

function isComparableValue(value: unknown): value is ComparableValue {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function isBaseScalarOperatorPredicate(value: unknown): value is BaseScalarOperatorPredicate {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const entries = Object.entries(value);
  if (entries.length === 0) {
    return false;
  }

  return entries.every(([key, operand]) => {
    if (!BASE_SCALAR_OPERATOR_KEYS.includes(key as keyof BaseScalarOperatorPredicate)) {
      return false;
    }

    if (key === "!=") {
      return isComparableValue(operand);
    }

    if (key === "in") {
      return Array.isArray(operand) && operand.every(isComparableValue);
    }

    return typeof operand === "number";
  });
}

function isScalarOperatorPredicate(value: unknown): value is ScalarOperatorPredicate {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const entries = Object.entries(value);
  if (entries.length === 0) {
    return false;
  }

  return entries.every(([key, operand]) => {
    if (!SCALAR_OPERATOR_KEYS.includes(key as keyof ScalarOperatorPredicate)) {
      return false;
    }

    if (key === "not") {
      return isComparableValue(operand) || isBaseScalarOperatorPredicate(operand);
    }

    if (key === "!=") {
      return isComparableValue(operand);
    }

    if (key === "in") {
      return Array.isArray(operand) && operand.every(isComparableValue);
    }

    return typeof operand === "number";
  });
}

function matchesBaseScalarOperatorPredicate(
  actual: ComparableValue,
  predicate: BaseScalarOperatorPredicate,
): boolean {
  return Object.entries(predicate).every(([operator, operand]) => {
    switch (operator) {
      case ">=":
        return typeof actual === "number" && typeof operand === "number" && actual >= operand;
      case ">":
        return typeof actual === "number" && typeof operand === "number" && actual > operand;
      case "<=":
        return typeof actual === "number" && typeof operand === "number" && actual <= operand;
      case "<":
        return typeof actual === "number" && typeof operand === "number" && actual < operand;
      case "!=":
        return actual !== operand;
      case "in":
        return Array.isArray(operand) && operand.includes(actual);
      default:
        return false;
    }
  });
}

function matchesScalarOperatorPredicate(actual: ComparableValue, predicate: ScalarOperatorPredicate): boolean {
  return Object.entries(predicate).every(([operator, operand]) => {
    if (operator === "not") {
      if (isComparableValue(operand)) {
        return actual !== operand;
      }
      if (isBaseScalarOperatorPredicate(operand)) {
        return !matchesBaseScalarOperatorPredicate(actual, operand);
      }
      return false;
    }

    return matchesBaseScalarOperatorPredicate(actual, {
      [operator]: operand,
    } as BaseScalarOperatorPredicate);
  });
}

export function matchesScalarCondition(
  actual: ComparableValue | undefined,
  expected: ScalarConditionValue,
): boolean {
  if (isScalarOperatorPredicate(expected)) {
    if (actual === undefined) {
      return false;
    }
    return matchesScalarOperatorPredicate(actual, expected);
  }

  return actual === expected;
}

export function matchesBooleanRecord(
  actualRecord: Record<string, boolean>,
  expectedRecord?: Record<string, boolean>,
  options?: { missingBooleanValue?: boolean },
): boolean {
  if (!expectedRecord) {
    return true;
  }

  const missingBooleanValue = options?.missingBooleanValue ?? false;
  return Object.entries(expectedRecord).every(([key, expected]) => {
    const actual = actualRecord[key] ?? missingBooleanValue;
    return actual === expected;
  });
}

export function matchesScalarRecord(
  actualRecord: Record<string, ComparableValue>,
  expectedRecord?: Record<string, ScalarConditionValue>,
): boolean {
  if (!expectedRecord) {
    return true;
  }

  return Object.entries(expectedRecord).every(([key, expected]) =>
    matchesScalarCondition(actualRecord[key], expected),
  );
}

export function matchesQuestStatusRecord(
  actualQuests: GameState["quests"],
  expectedRecord?: Record<string, QuestStatus>,
): boolean {
  if (!expectedRecord) {
    return true;
  }

  return Object.entries(expectedRecord).every(
    ([questId, expected]) => actualQuests[questId]?.status === expected,
  );
}

export function matchesQuestStepRecord(
  actualQuests: GameState["quests"],
  expectedRecord?: Record<string, string>,
): boolean {
  if (!expectedRecord) {
    return true;
  }

  return Object.entries(expectedRecord).every(
    ([questId, expected]) => actualQuests[questId]?.currentStepId === expected,
  );
}
