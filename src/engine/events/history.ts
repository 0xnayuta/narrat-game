/**
 * Responsibility: Event history helpers backed by GameState flags/vars.
 * Supports global cooldown (eventId → minute) and per-trigger cooldown (eventId:trigger → minute).
 */

import type { EventDefinition, EventHistoryState, GameState, TimeState } from "../types";

const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;

export const EVENT_ONCE_TRIGGERED_FLAG_KEY_PREFIX = "event.once.";
export const EVENT_COOLDOWN_LAST_TRIGGERED_MINUTE_KEY_PREFIX = "event.cooldown.";
export const EVENT_COOLDOWN_LAST_TRIGGERED_MINUTE_KEY_SUFFIX = ".lastTriggeredMinute";

export type EventHistoryWriteStrategy = "dual-write" | "slice-only";
export const DEFAULT_EVENT_HISTORY_WRITE_STRATEGY: EventHistoryWriteStrategy = "slice-only";

function toAbsoluteMinutes(time: TimeState): number {
  return (time.day - 1) * MINUTES_PER_DAY + time.hour * MINUTES_PER_HOUR + time.minute;
}

function getEventCooldownMinutes(event: EventDefinition): number {
  if (!Number.isFinite(event.cooldownMinutes)) {
    return 0;
  }
  const cooldown = event.cooldownMinutes as number;
  return cooldown > 0 ? Math.trunc(cooldown) : 0;
}

function readLegacyEventHistoryState(state: GameState): EventHistoryState {
  const onceTriggeredByEventId: Record<string, boolean> = {};
  for (const [flagId, value] of Object.entries(state.flags)) {
    if (!value || !flagId.startsWith(EVENT_ONCE_TRIGGERED_FLAG_KEY_PREFIX)) {
      continue;
    }
    const eventId = flagId.slice(EVENT_ONCE_TRIGGERED_FLAG_KEY_PREFIX.length);
    if (eventId.length > 0) {
      onceTriggeredByEventId[eventId] = true;
    }
  }

  const cooldownLastTriggeredMinuteByEventId: Record<string, number> = {};
  for (const [varKey, value] of Object.entries(state.vars)) {
    if (
      !varKey.startsWith(EVENT_COOLDOWN_LAST_TRIGGERED_MINUTE_KEY_PREFIX) ||
      !varKey.endsWith(EVENT_COOLDOWN_LAST_TRIGGERED_MINUTE_KEY_SUFFIX)
    ) {
      continue;
    }
    if (typeof value !== "number" || !Number.isFinite(value)) {
      continue;
    }

    const eventId = varKey.slice(
      EVENT_COOLDOWN_LAST_TRIGGERED_MINUTE_KEY_PREFIX.length,
      varKey.length - EVENT_COOLDOWN_LAST_TRIGGERED_MINUTE_KEY_SUFFIX.length,
    );
    if (eventId.length > 0) {
      cooldownLastTriggeredMinuteByEventId[eventId] = Math.trunc(value);
    }
  }

  return {
    onceTriggeredByEventId,
    cooldownLastTriggeredMinuteByEventId,
    triggerScopes: {},
  };
}

export function getEventTriggeredFlagId(eventId: string): string {
  return `${EVENT_ONCE_TRIGGERED_FLAG_KEY_PREFIX}${eventId}`;
}

export function getEventCooldownVarKey(eventId: string): string {
  return `${EVENT_COOLDOWN_LAST_TRIGGERED_MINUTE_KEY_PREFIX}${eventId}${EVENT_COOLDOWN_LAST_TRIGGERED_MINUTE_KEY_SUFFIX}`;
}

/**
 * Adapter read: extracts logical EventHistoryState from current storage.
 * Prefers state.eventHistory when present and falls back to legacy flags/vars keys.
 */
export function readEventHistoryState(state: GameState): EventHistoryState {
  const legacy = readLegacyEventHistoryState(state);

  if (!state.eventHistory) {
    return {
      onceTriggeredByEventId: legacy.onceTriggeredByEventId,
      cooldownLastTriggeredMinuteByEventId: legacy.cooldownLastTriggeredMinuteByEventId,
      triggerScopes: {},
    };
  }

  const onceTriggeredByEventId: Record<string, boolean> = {
    ...legacy.onceTriggeredByEventId,
  };
  for (const [eventId, triggered] of Object.entries(state.eventHistory.onceTriggeredByEventId)) {
    if (triggered === true) {
      onceTriggeredByEventId[eventId] = true;
    }
  }

  const cooldownLastTriggeredMinuteByEventId: Record<string, number> = {
    ...legacy.cooldownLastTriggeredMinuteByEventId,
  };
  for (const [eventId, minute] of Object.entries(
    state.eventHistory.cooldownLastTriggeredMinuteByEventId,
  )) {
    if (typeof minute === "number" && Number.isFinite(minute)) {
      cooldownLastTriggeredMinuteByEventId[eventId] = Math.trunc(minute);
    }
  }

  const triggerScopes: Record<string, number> = {};
  for (const [key, minute] of Object.entries(state.eventHistory.triggerScopes ?? {})) {
    if (typeof minute === "number" && Number.isFinite(minute)) {
      triggerScopes[key] = Math.trunc(minute);
    }
  }

  return {
    onceTriggeredByEventId,
    cooldownLastTriggeredMinuteByEventId,
    triggerScopes,
  };
}

/**
 * Builds the trigger-scoped key for per-trigger cooldown storage.
 * Format: "{eventId}:{trigger}" (e.g. "evt_xxx:on-location-enter").
 */
export function getTriggerScopeKey(eventId: string, trigger: string): string {
  return `${eventId}:${trigger}`;
}

/**
 * Adapter write: applies EventHistoryState entries to current storage.
 *
 * Current behavior is additive/update-only and intentionally does not delete existing keys.
 * Default strategy is slice-only; dual-write remains available for compatibility/migration.
 */
export function writeEventHistoryState(
  state: GameState,
  history: EventHistoryState,
  strategy: EventHistoryWriteStrategy = DEFAULT_EVENT_HISTORY_WRITE_STRATEGY,
): GameState {
  let nextFlags = state.flags;
  let nextVars = state.vars;

  const baseHistory = readEventHistoryState(state);
  const nextEventHistory: EventHistoryState = {
    onceTriggeredByEventId: { ...baseHistory.onceTriggeredByEventId },
    cooldownLastTriggeredMinuteByEventId: { ...baseHistory.cooldownLastTriggeredMinuteByEventId },
    triggerScopes: { ...baseHistory.triggerScopes },
  };
  let eventHistoryChanged = false;

  for (const [eventId, triggered] of Object.entries(history.onceTriggeredByEventId)) {
    if (triggered !== true) {
      continue;
    }

    if (strategy === "dual-write") {
      if (nextFlags === state.flags) {
        nextFlags = { ...state.flags };
      }
      nextFlags[getEventTriggeredFlagId(eventId)] = true;
    }

    if (nextEventHistory.onceTriggeredByEventId[eventId] !== true) {
      nextEventHistory.onceTriggeredByEventId[eventId] = true;
      eventHistoryChanged = true;
    }
  }

  for (const [eventId, lastMinute] of Object.entries(history.cooldownLastTriggeredMinuteByEventId)) {
    if (typeof lastMinute !== "number" || !Number.isFinite(lastMinute)) {
      continue;
    }
    const minute = Math.trunc(lastMinute);

    if (strategy === "dual-write") {
      if (nextVars === state.vars) {
        nextVars = { ...state.vars };
      }
      nextVars[getEventCooldownVarKey(eventId)] = minute;
    }

    if (nextEventHistory.cooldownLastTriggeredMinuteByEventId[eventId] !== minute) {
      nextEventHistory.cooldownLastTriggeredMinuteByEventId[eventId] = minute;
      eventHistoryChanged = true;
    }
  }

  for (const [scopeKey, lastMinute] of Object.entries(history.triggerScopes)) {
    if (typeof lastMinute !== "number" || !Number.isFinite(lastMinute)) {
      continue;
    }
    const minute = Math.trunc(lastMinute);
    if (nextEventHistory.triggerScopes[scopeKey] !== minute) {
      nextEventHistory.triggerScopes[scopeKey] = minute;
      eventHistoryChanged = true;
    }
  }

  if (
    (strategy !== "dual-write" || (nextFlags === state.flags && nextVars === state.vars)) &&
    !eventHistoryChanged
  ) {
    return state;
  }

  return {
    ...state,
    flags: nextFlags,
    vars: nextVars,
    eventHistory: eventHistoryChanged || state.eventHistory ? nextEventHistory : state.eventHistory,
  };
}

export function migrateLegacyEventHistoryToSlice(state: GameState): GameState {
  const legacy = readLegacyEventHistoryState(state);
  const hasLegacyOnce = Object.keys(legacy.onceTriggeredByEventId).length > 0;
  const hasLegacyCooldown = Object.keys(legacy.cooldownLastTriggeredMinuteByEventId).length > 0;
  if (!hasLegacyOnce && !hasLegacyCooldown) {
    return state;
  }

  const mergedHistory = readEventHistoryState(state);
  return {
    ...state,
    eventHistory: {
      onceTriggeredByEventId: { ...mergedHistory.onceTriggeredByEventId },
      cooldownLastTriggeredMinuteByEventId: {
        ...mergedHistory.cooldownLastTriggeredMinuteByEventId,
      },
      triggerScopes: { ...mergedHistory.triggerScopes },
    },
  };
}

export function hasTriggeredOnceEvent(state: GameState, event: EventDefinition): boolean {
  if (!event.once) {
    return false;
  }

  const history = readEventHistoryState(state);
  return history.onceTriggeredByEventId[event.id] === true;
}

/**
 * @deprecated Use isEventInCooldownWindow for selector/runtime filtering.
 * This helper only checks the global cooldown entry and is retained for compatibility tests.
 */
export function hasEventCooldownActive(state: GameState, event: EventDefinition): boolean {
  const cooldownMinutes = getEventCooldownMinutes(event);
  if (cooldownMinutes <= 0) {
    return false;
  }

  const history = readEventHistoryState(state);
  const lastTriggeredValue = history.cooldownLastTriggeredMinuteByEventId[event.id];
  if (typeof lastTriggeredValue !== "number" || !Number.isFinite(lastTriggeredValue)) {
    return false;
  }

  const nowMinutes = toAbsoluteMinutes(state.time);
  return nowMinutes - lastTriggeredValue < cooldownMinutes;
}

/**
 * Checks whether an event is within its cooldown window.
 *
 * Strategy:
 * - If the event has a trigger-scoped entry (eventId:trigger), use it (per-trigger window).
 * - Otherwise fall back to the global cooldown entry (eventId).
 * - If neither entry exists, the event is not in cooldown (allows first trigger).
 *
 * This function is used by the event selector to filter out candidates within cooldown.
 */
export function isEventInCooldownWindow(
  state: GameState,
  event: EventDefinition,
): boolean {
  const cooldownMinutes = getEventCooldownMinutes(event);
  if (cooldownMinutes <= 0) {
    return false;
  }

  const history = readEventHistoryState(state);
  const nowMinutes = toAbsoluteMinutes(state.time);

  // Per-trigger scope takes precedence.
  const scopeKey = getTriggerScopeKey(event.id, event.trigger);
  const scopeMinute = history.triggerScopes[scopeKey];
  if (typeof scopeMinute === "number" && Number.isFinite(scopeMinute)) {
    return nowMinutes - scopeMinute < cooldownMinutes;
  }

  // Fall back to global entry.
  const globalMinute = history.cooldownLastTriggeredMinuteByEventId[event.id];
  if (typeof globalMinute === "number" && Number.isFinite(globalMinute)) {
    return nowMinutes - globalMinute < cooldownMinutes;
  }

  // No entry means no cooldown triggered yet.
  return false;
}

export function markEventCooldownTimestamp(
  state: GameState,
  event: EventDefinition,
  strategy: EventHistoryWriteStrategy = DEFAULT_EVENT_HISTORY_WRITE_STRATEGY,
): GameState {
  const cooldownMinutes = getEventCooldownMinutes(event);
  if (cooldownMinutes <= 0) {
    return state;
  }

  const nowMinutes = toAbsoluteMinutes(state.time);
  const scopeKey = getTriggerScopeKey(event.id, event.trigger);
  return writeEventHistoryState(
    state,
    {
      onceTriggeredByEventId: {},
      cooldownLastTriggeredMinuteByEventId: {
        [event.id]: nowMinutes,
      },
      // Always write trigger-scoped entry so per-trigger and global stay in sync.
      triggerScopes: {
        [scopeKey]: nowMinutes,
      },
    },
    strategy,
  );
}

export function markEventTriggered(
  state: GameState,
  event: EventDefinition,
  strategy: EventHistoryWriteStrategy = DEFAULT_EVENT_HISTORY_WRITE_STRATEGY,
): GameState {
  if (!event.once) {
    return state;
  }

  return writeEventHistoryState(
    state,
    {
      onceTriggeredByEventId: {
        [event.id]: true,
      },
      cooldownLastTriggeredMinuteByEventId: {},
      triggerScopes: {},
    },
    strategy,
  );
}
