/**
 * Demo content: minimal triggerable events.
 */

import type { EventDefinition } from "../../engine/types";

export const demoEvents: EventDefinition[] = [
  {
    id: "evt_street_arrival",
    type: "arrival",
    trigger: "on-location-enter",
    once: true,
    priority: 10,
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
    id: "evt_market_plan",
    type: "follow-up",
    trigger: "after-choice",
    once: true,
    priority: 10,
    conditions: {
      locationIds: ["street"],
      flags: {
        market_visit_intent: true,
      },
      timeRange: { startHour: 0, endHour: 0 },
    },
    payload: {
      narrativeNodeId: "node_market_plan",
    },
  },
  {
    id: "evt_market_morning",
    type: "ambient",
    trigger: "on-time-check",
    once: true,
    priority: 10,
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
  {
    id: "evt_market_morning_low_priority_example",
    type: "ambient",
    trigger: "on-time-check",
    once: true,
    priority: 1,
    conditions: {
      locationIds: ["market"],
      flags: {
        quest_intro_started: true,
        market_visit_intent: true,
        vendor_met: false,
      },
      timeRange: { startHour: 8, endHour: 18 },
    },
    payload: {
      narrativeNodeId: "node_market_plan",
    },
  },
];
