/**
 * Responsibility: Minimal local mock events for validating event filtering flow.
 * TODO: Move into content pipeline once event repository is implemented.
 */

import type { EventDefinition } from "../types";

export const mockEvents: EventDefinition[] = [
  {
    id: "home-morning-routine",
    type: "daily-routine",
    trigger: "on-time-check",
    conditions: {
      locationIds: ["home"],
      timeRange: { startHour: 6, endHour: 10 },
      flags: {
        intro_done: true,
      },
    },
    payload: {
      narrativeNodeId: "routine_morning",
    },
  },
  {
    id: "street-night-encounter",
    type: "encounter",
    trigger: "on-location-enter",
    conditions: {
      locationIds: ["street"],
      timeRange: { startHour: 22, endHour: 6 },
      flags: {
        street_event_seen: false,
      },
    },
    payload: {
      narrativeNodeId: "encounter_street_night",
    },
  },
  {
    id: "market-open-hours",
    type: "location-ambient",
    trigger: "manual",
    conditions: {
      locationIds: ["market"],
      timeRange: { startHour: 8, endHour: 18 },
      flags: {
        market_unlocked: true,
      },
    },
    payload: {
      narrativeNodeId: "market_open",
    },
  },
];
