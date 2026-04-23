/**
 * Responsibility: Shared runtime-state condition evaluation boundary.
 *
 * This file defines a normalized condition shape used internally by
 * event, narrative-choice, and NPC condition adapters.
 */

import { readEventHistoryState } from "../events/history";
import { getTimeOfDay, isInTimeRange, type TimeOfDay, type TimeRange } from "../time";
import type { GameState } from "../types";
import type { ScalarConditionValue } from "../types/conditions";
import type { EventHistoryConditions } from "../types/events";
import {
  matchesBooleanRecord,
  matchesQuestStepRecord,
  matchesQuestStatusRecord,
  matchesScalarCondition,
  matchesScalarRecord,
  type ComparableValue,
  type QuestStatus,
} from "./shared";

export interface StateConditions {
  locationIds?: string[];
  timeRange?: TimeRange;
  timeOfDay?: TimeOfDay;
  flags?: Record<string, boolean>;
  vars?: Record<string, ScalarConditionValue>;
  quests?: Record<string, QuestStatus>;
  questSteps?: Record<string, string>;
  eventHistory?: EventHistoryConditions;
  all?: StateConditions[];
  any?: StateConditions[];
  not?: StateConditions;
}

export interface StateConditionMismatchReason {
  code:
    | "location"
    | "timeRange"
    | "timeOfDay"
    | "flag"
    | "quest"
    | "questStep"
    | "var"
    | "eventHistory"
    | "group";
  key?: string;
  expected?: unknown;
  actual?: unknown;
  message: string;
}

export interface StateConditionMatchResult {
  matched: boolean;
  reasons: StateConditionMismatchReason[];
}

const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;

function toAbsoluteMinutes(time: GameState["time"]): number {
  return (time.day - 1) * MINUTES_PER_DAY + time.hour * MINUTES_PER_HOUR + time.minute;
}

function collectDirectStateConditionMismatchReasons(
  state: GameState,
  conditions: StateConditions,
): StateConditionMismatchReason[] {
  const reasons: StateConditionMismatchReason[] = [];

  if (conditions.locationIds && conditions.locationIds.length > 0) {
    if (!conditions.locationIds.includes(state.currentLocationId)) {
      reasons.push({
        code: "location",
        expected: conditions.locationIds,
        actual: state.currentLocationId,
        message: `location: expected one of ${conditions.locationIds.join(", ")}, got ${state.currentLocationId}`,
      });
    }
  }

  if (conditions.timeRange && !isInTimeRange(state.time, conditions.timeRange)) {
    reasons.push({
      code: "timeRange",
      expected: conditions.timeRange,
      actual: state.time.hour,
      message: `timeRange: expected ${conditions.timeRange.startHour}-${conditions.timeRange.endHour}, got hour ${state.time.hour}`,
    });
  }

  if (!matchesBooleanRecord(state.flags, conditions.flags, { missingBooleanValue: false })) {
    for (const [flagId, expected] of Object.entries(conditions.flags ?? {})) {
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

  if (!matchesQuestStatusRecord(state.quests, conditions.quests)) {
    for (const [questId, expected] of Object.entries(conditions.quests ?? {})) {
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

  if (!matchesQuestStepRecord(state.quests, conditions.questSteps)) {
    for (const [questId, expected] of Object.entries(conditions.questSteps ?? {})) {
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

  if (!matchesScalarRecord(state.vars, conditions.vars)) {
    for (const [varId, expected] of Object.entries(conditions.vars ?? {})) {
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

  if (conditions.timeOfDay) {
    const actualTimeOfDay = getTimeOfDay(state.time);
    if (actualTimeOfDay !== conditions.timeOfDay) {
      reasons.push({
        code: "timeOfDay",
        expected: conditions.timeOfDay,
        actual: actualTimeOfDay,
        message: `timeOfDay: expected ${conditions.timeOfDay}, got ${actualTimeOfDay}`,
      });
    }
  }

  if (conditions.eventHistory) {
    const history = readEventHistoryState(state);

    for (const [eventId, expected] of Object.entries(conditions.eventHistory.onceTriggered ?? {})) {
      const actual = history.onceTriggeredByEventId[eventId] === true;
      if (actual !== expected) {
        reasons.push({
          code: "eventHistory",
          key: eventId,
          expected,
          actual,
          message: `eventHistory.onceTriggered.${eventId}: expected ${expected}, got ${actual}`,
        });
      }
    }

    const nowMinutes = toAbsoluteMinutes(state.time);
    for (const [eventId, windowMinutes] of Object.entries(
      conditions.eventHistory.lastTriggeredWithinMinutes ?? {},
    )) {
      const lastTriggered = history.cooldownLastTriggeredMinuteByEventId[eventId];
      const window = Number.isFinite(windowMinutes) ? Math.trunc(windowMinutes) : 0;
      const actualMinutesAgo =
        typeof lastTriggered === "number" && Number.isFinite(lastTriggered)
          ? nowMinutes - lastTriggered
          : "missing";
      const matched =
        typeof lastTriggered === "number" && Number.isFinite(lastTriggered) && window > 0
          ? nowMinutes - lastTriggered < window
          : false;

      if (!matched) {
        reasons.push({
          code: "eventHistory",
          key: eventId,
          expected: { lastTriggeredWithinMinutes: window },
          actual: actualMinutesAgo,
          message: `eventHistory.lastTriggeredWithinMinutes.${eventId}: expected within ${window} minutes, got ${String(actualMinutesAgo)}`,
        });
      }
    }
  }

  return reasons;
}

export function evaluateStateConditions(
  state: GameState,
  conditions?: StateConditions,
): StateConditionMatchResult {
  if (!conditions) {
    return {
      matched: true,
      reasons: [],
    };
  }

  const reasons = collectDirectStateConditionMismatchReasons(state, conditions);

  if (conditions.all && conditions.all.length > 0) {
    for (const group of conditions.all) {
      const result = evaluateStateConditions(state, group);
      if (!result.matched) {
        reasons.push(...result.reasons);
      }
    }
  }

  if (conditions.any && conditions.any.length > 0) {
    const groupResults = conditions.any.map((group) => evaluateStateConditions(state, group));
    if (!groupResults.some((result) => result.matched)) {
      reasons.push({
        code: "group",
        expected: "any",
        message: "any-group: no nested condition block matched",
      });
    }
  }

  if (conditions.not) {
    const notResult = evaluateStateConditions(state, conditions.not);
    if (notResult.matched) {
      reasons.push({
        code: "group",
        expected: "not",
        message: "not-group: nested condition block matched unexpectedly",
      });
    }
  }

  return {
    matched: reasons.length === 0,
    reasons,
  };
}

export function matchesStateConditions(
  state: GameState,
  conditions?: StateConditions,
): boolean {
  return evaluateStateConditions(state, conditions).matched;
}
