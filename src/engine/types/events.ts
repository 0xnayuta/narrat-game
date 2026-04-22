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
 * Minimal event conditions (location, time range, flags).
 */
export interface EventConditions {
  locationIds?: string[];
  timeRange?: EventTimeRange;
  flags?: Record<string, boolean>;
  // TODO: Add variable/stat/quest predicates when expression system is added.
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
  conditions?: EventConditions;
  payload?: Record<string, unknown>;
  // TODO: Add cooldown fields when balancing starts.
}
