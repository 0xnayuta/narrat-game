/**
 * Demo content: minimal triggerable events (2 events).
 */

import type { EventDefinition } from "../../engine/types";

export const demoEvents: EventDefinition[] = [
  {
    id: "evt_street_arrival",
    type: "arrival",
    trigger: "on-location-enter",
    conditions: {
      locationIds: ["street"],
      flags: {
        demo_enabled: true,
      },
      timeRange: { startHour: 0, endHour: 0 },
    },
    payload: {
      narrativeNodeId: "node_street_arrival",
    },
  },
  {
    id: "evt_market_morning",
    type: "ambient",
    trigger: "on-time-check",
    conditions: {
      locationIds: ["market"],
      flags: {
        quest_intro_started: true,
        market_visit_intent: true,
      },
      timeRange: { startHour: 8, endHour: 18 },
    },
    payload: {
      narrativeNodeId: "node_market_morning",
    },
  },
];
