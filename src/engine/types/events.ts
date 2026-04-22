import type { ScalarConditionValue } from "./conditions";

/**
 * Supported event trigger phases for the minimal event framework.
 */
export type EventTrigger = "manual" | "on-location-enter" | "on-time-check" | "after-choice";

/**
 * Time range condition used by events (hour-based, end exclusive).
 */
export interface EventTimeRange {
  startHour: number;
  endHour: number;
}

/**
 * Minimal event conditions (location, time range, flags, vars, quests).
 */
export interface EventConditions {
  locationIds?: string[];
  timeRange?: EventTimeRange;
  flags?: Record<string, boolean>;
  vars?: Record<string, ScalarConditionValue>;
  quests?: Record<string, "inactive" | "active" | "completed" | "failed">;
  /** Match quests by current step id (requires quest to exist and have matching currentStepId). */
  questSteps?: Record<string, string>;
  /** At least one nested condition block must match (OR semantics). */
  any?: EventConditions[];
  // TODO: Add richer predicate operators when condition DSL is introduced.
}

/**
 * Event history aggregate for future dedicated runtime state migration.
 *
 * Current implementation still stores once/cooldown history in GameState flags/vars,
 * while this type defines the intended logical boundary.
 */
export interface EventHistoryState {
  onceTriggeredByEventId: Record<string, boolean>;
  cooldownLastTriggeredMinuteByEventId: Record<string, number>;
}

/**
 * Domain event definition for candidate filtering and trigger selection.
 */
export interface EventDefinition {
  id: string;
  type: string;
  trigger: EventTrigger;
  once?: boolean;
  priority?: number;
  /**
   * Only used when multiple candidates share the same highest priority.
   * Invalid values (NaN/negative) are treated as 0 by the selector.
   */
  weight?: number;
  /**
   * Cooldown in minutes since last trigger of the same event id.
   * Invalid values (NaN/negative) are treated as 0 (disabled).
   */
  cooldownMinutes?: number;
  conditions?: EventConditions;
  payload?: Record<string, unknown>;
  // TODO: Move cooldown history out of generic vars into a dedicated event history slice.
}
