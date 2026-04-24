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

export interface EventHistoryConditions {
  /** Match whether a specific event id has ever been recorded as triggered. */
  onceTriggered?: Record<string, boolean>;
  /** Match whether an event id was last triggered within the provided minute window. */
  lastTriggeredWithinMinutes?: Record<string, number>;
}

/**
 * Minimal recursive condition set shared by events and narrative choice visibility.
 *
 * Top-level fields are combined with AND semantics.
 * Nested groups provide explicit composition:
 * - `all`: every nested block must match
 * - `any`: at least one nested block must match
 * - `not`: nested block must not match
 */
export interface EventConditions {
  locationIds?: string[];
  timeRange?: EventTimeRange;
  flags?: Record<string, boolean>;
  vars?: Record<string, ScalarConditionValue>;
  quests?: Record<string, "inactive" | "active" | "completed" | "failed">;
  /** Match quests by current step id (requires quest to exist and have matching currentStepId). */
  questSteps?: Record<string, string>;
  /** Match against logical eventHistory through the adapter layer. */
  eventHistory?: EventHistoryConditions;
  /** Every nested condition block must match (AND semantics). */
  all?: EventConditions[];
  /** At least one nested condition block must match (OR semantics). */
  any?: EventConditions[];
  /** Nested condition block must not match (NOT semantics). */
  not?: EventConditions;
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
  /** Global cooldown: eventId → last triggered absolute minute. */
  cooldownLastTriggeredMinuteByEventId: Record<string, number>;
  /** Per-trigger cooldown: "eventId:trigger" → last triggered absolute minute.
   *  Allows the same event id to have independent cooldown windows per trigger type.
   *  Key format: "{eventId}:{trigger}" (e.g. "evt_xxx:on-location-enter"). */
  triggerScopes: Record<string, number>;
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
   * Cooldown in minutes since last trigger.
   * - Unset or 0: no cooldown
   * - Positive: event is excluded from selection if within the window
   * When both global and trigger-specific cooldown keys exist, trigger-specific takes precedence.
   */
  cooldownMinutes?: number;
  conditions?: EventConditions;
  payload?: Record<string, unknown>;
}
